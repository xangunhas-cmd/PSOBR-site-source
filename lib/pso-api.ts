import 'server-only';

import {env} from 'cloudflare:workers';
import {Client} from 'pg';

export type PsoPlayer = {
  id: string;
  nickname: string;
  position?: string | null;
  image?: string | null;
  club?: {id: string; name: string; logoUrl?: string | null} | null;
};

export type PsoMarketEvent = {
  id: string;
  type: 'transfer' | 'dismissal' | 'contract_expired' | 'club_created' | string;
  playerId?: string;
  playerName?: string | null;
  playerImage?: string | null;
  position?: string | null;
  club?: string | null;
  clubId?: string | null;
  clubLogoUrl?: string | null;
  oldTeam?: string | null;
  fromClub?: string | null;
  toClub?: string | null;
  at?: string | null;
};

type BotRegistration = {
  userId?: string;
  nickname?: string;
  position?: string | null;
  characterPhotoUrl?: string | null;
};

type BotContract = {
  id?: string;
  playerId?: string;
  teamId?: string;
  newTeam?: string;
  oldTeam?: string | null;
  status?: string;
  acceptedAt?: string | null;
  signedAt?: string | null;
  expiredAt?: string | null;
  endSeason?: string | number | null;
  dismissal?: {dismissedAt?: string | null};
};

type BotTeam = {
  id?: string;
  name?: string;
  logoUrl?: string | null;
  createdAt?: string | null;
};

type BotState = {
  registrations?: Record<string,BotRegistration>;
  contracts?: Record<string,BotContract>;
  teams?: Record<string,BotTeam>;
};

export type PsoApiState = 'connected' | 'not-configured' | 'unavailable';

type DatabaseRow = Record<string,unknown>;

function parsePayload(value:unknown):BotState|null{
  try{
    const parsed=typeof value==='string'?JSON.parse(value):value;
    return parsed&&typeof parsed==='object'?parsed as BotState:null;
  }catch{
    return null;
  }
}

async function loadBotState():Promise<BotState|null>{
  const connectionString=env.DATABASE_URL?.trim();
  if(connectionString){
    const client=new Client({connectionString});
    try{
      await client.connect();
      const result=await client.query<{payload:unknown}>('SELECT payload FROM pso_bot_state WHERE id = $1 LIMIT 1',['global']);
      const payload=parsePayload(result.rows[0]?.payload);
      if(payload) return payload;
    }catch(error){
      console.error('PostgreSQL do bot indisponível:',error instanceof Error?error.message:error);
    }finally{
      await client.end().catch(()=>{});
    }
  }

  if(!env.DB) return null;
  try{
    const row=await env.DB.prepare('SELECT payload FROM pso_bot_state WHERE id = ?').bind('global').first<{payload:unknown}>();
    const payload=parsePayload(row?.payload);
    if(payload) return payload;
  }catch{
    // Algumas versões do bot salvam cada conjunto em uma tabela separada.
  }

  try{
    const [registrationsResult,contractsResult,teamsResult]=await Promise.all([
      env.DB.prepare('SELECT * FROM registrations').all<DatabaseRow>(),
      env.DB.prepare('SELECT * FROM contracts').all<DatabaseRow>(),
      env.DB.prepare('SELECT * FROM teams').all<DatabaseRow>(),
    ]);
    const registrations=Object.fromEntries(registrationsResult.results.map((row,index)=>{
      const userId=textValue(row,'userId','user_id','discordId','discord_id','playerId','player_id')||String(index);
      return [userId,{
        userId,
        nickname:textValue(row,'nickname','name','displayName','display_name'),
        position:textValue(row,'position','posicao'),
        characterPhotoUrl:textValue(row,'characterPhotoUrl','character_photo_url','photoUrl','photo_url','imageUrl','image_url'),
      } satisfies BotRegistration];
    }));
    const contracts=Object.fromEntries(contractsResult.results.map((row,index)=>{
      const id=textValue(row,'id','contractId','contract_id')||String(index);
      const dismissal=parsePayload(row.dismissal) as {dismissedAt?:string}|null;
      return [id,{
        id,
        playerId:textValue(row,'playerId','player_id','userId','user_id'),
        teamId:textValue(row,'teamId','team_id','clubId','club_id'),
        newTeam:textValue(row,'newTeam','new_team','teamName','team_name','club'),
        oldTeam:textValue(row,'oldTeam','old_team','previousClub','previous_club'),
        status:textValue(row,'status'),
        acceptedAt:textValue(row,'acceptedAt','accepted_at'),
        signedAt:textValue(row,'signedAt','signed_at','createdAt','created_at'),
        expiredAt:textValue(row,'expiredAt','expired_at'),
        endSeason:textValue(row,'endSeason','end_season'),
        dismissal:dismissal||{dismissedAt:textValue(row,'dismissedAt','dismissed_at')},
      } satisfies BotContract];
    }));
    const teams=Object.fromEntries(teamsResult.results.map((row,index)=>{
      const id=textValue(row,'id','teamId','team_id','clubId','club_id')||String(index);
      return [id,{
        id,
        name:textValue(row,'name','teamName','team_name','clubName','club_name'),
        logoUrl:textValue(row,'logoUrl','logo_url','imageUrl','image_url'),
        createdAt:textValue(row,'createdAt','created_at'),
      } satisfies BotTeam];
    }));
    return {registrations,contracts,teams};
  }catch(error){
    console.error('Database do bot indisponível:',error instanceof Error?error.message:error);
    return null;
  }
}

function textValue(row:DatabaseRow,...names:string[]):string|undefined{
  for(const name of names){
    const value=row[name];
    if(value!==undefined&&value!==null&&String(value).trim()) return String(value);
  }
  return undefined;
}

function eventTime(value:string|number|null|undefined){
  if(value===undefined||value===null) return null;
  const text=String(value);
  return Number.isNaN(new Date(text).getTime())?null:text;
}

export async function getPsoMarketSnapshot():Promise<{state:PsoApiState;events:PsoMarketEvent[];players:PsoPlayer[]}>
{
  if(!env.DATABASE_URL&&!env.DB) return {state:'not-configured',events:[],players:[]};
  const payload=await loadBotState();
  if(!payload) return {state:'unavailable',events:[],players:[]};

  const registrations=Object.values(payload.registrations||{});
  const contracts=Object.values(payload.contracts||{});
  const teams=Object.values(payload.teams||{});
  const teamsById=new Map(teams.filter(team=>team.id).map(team=>[team.id!,team]));
  const registrationsById=new Map(registrations.filter(item=>item.userId).map(item=>[item.userId!,item]));
  const activeContracts=new Map(contracts.filter(item=>item.playerId&&item.status==='active').map(item=>[item.playerId!,item]));

  const players:PsoPlayer[]=registrations.filter(item=>item.userId&&item.nickname).map(item=>{
    const contract=activeContracts.get(item.userId!);
    const team=contract?.teamId?teamsById.get(contract.teamId):undefined;
    return {
      id:item.userId!,nickname:item.nickname!,position:item.position||null,image:item.characterPhotoUrl||null,
      club:contract?{id:contract.teamId||'',name:team?.name||contract.newTeam||'Clube',logoUrl:team?.logoUrl||null}:null,
    };
  });

  const events:PsoMarketEvent[]=[];
  for(const contract of contracts){
    if(!contract.id||!contract.playerId) continue;
    const registration=registrationsById.get(contract.playerId);
    const team=contract.teamId?teamsById.get(contract.teamId):undefined;
    const common={playerId:contract.playerId,playerName:registration?.nickname||null,playerImage:registration?.characterPhotoUrl||null,position:registration?.position||null,clubId:contract.teamId,club:team?.name||contract.newTeam||null,clubLogoUrl:team?.logoUrl||null};
    const acceptedAt=eventTime(contract.acceptedAt||contract.signedAt);
    if((contract.status==='active'||contract.acceptedAt)&&acceptedAt) events.push({id:`${contract.id}:accepted`,type:'transfer',...common,fromClub:contract.oldTeam||null,toClub:team?.name||contract.newTeam||null,at:acceptedAt});
    const dismissedAt=eventTime(contract.dismissal?.dismissedAt);
    if(dismissedAt) events.push({id:`${contract.id}:dismissed`,type:'dismissal',...common,fromClub:team?.name||contract.newTeam||null,toClub:'Livre',at:dismissedAt});
    const expiredAt=eventTime(contract.expiredAt||contract.endSeason);
    if(contract.status==='expired'&&expiredAt) events.push({id:`${contract.id}:expired`,type:'contract_expired',...common,fromClub:team?.name||contract.newTeam||null,toClub:'Livre',at:expiredAt});
  }
  for(const team of teams){
    const at=eventTime(team.createdAt);
    if(team.id&&at) events.push({id:`${team.id}:created`,type:'club_created',clubId:team.id,club:team.name||'Clube',clubLogoUrl:team.logoUrl||null,at});
  }
  events.sort((a,b)=>new Date(b.at||0).getTime()-new Date(a.at||0).getTime());
  return {state:'connected',events,players};
}
