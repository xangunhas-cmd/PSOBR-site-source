import 'server-only';

import {env} from 'cloudflare:workers';

export type PsoPlayer = {
  id: string;
  nickname: string;
  position?: string | null;
  club?: {id: string; name: string; logoUrl?: string | null} | null;
};

export type PsoMarketEvent = {
  id: string;
  type: 'transfer' | 'dismissal' | 'contract_expired' | 'club_created' | string;
  playerId?: string;
  playerName?: string | null;
  position?: string | null;
  club?: string | null;
  clubId?: string | null;
  oldTeam?: string | null;
  fromClub?: string | null;
  toClub?: string | null;
  at?: string | null;
};

type PsoList<T> = {data: T[]; pagination?: {total: number; limit: number; offset: number}};

export type PsoApiState = 'connected' | 'not-configured' | 'unavailable';

function settings(){
  return {
    baseUrl: env.PSO_API_URL?.trim(),
    apiKey: env.PSO_API_KEY?.trim(),
    guildId: env.PSO_GUILD_ID?.trim(),
  };
}

export function isPsoApiConfigured(){
  const {baseUrl,apiKey,guildId}=settings();
  return Boolean(baseUrl&&apiKey&&guildId);
}

export async function psoApi<T>(path:string,params:Record<string,string|number|boolean|undefined>={}):Promise<T>{
  const {baseUrl,apiKey,guildId}=settings();
  if(!baseUrl||!apiKey||!guildId) throw new Error('PSO_API_NOT_CONFIGURED');

  const normalizedBase=`${baseUrl.replace(/\/+$/,'')}/`;
  const url=new URL(path.replace(/^\//,''),normalizedBase);
  url.searchParams.set('guild_id',guildId);
  for(const [key,value] of Object.entries(params)){
    if(value!==undefined) url.searchParams.set(key,String(value));
  }

  const response=await fetch(url,{headers:{Authorization:`Bearer ${apiKey}`},signal:AbortSignal.timeout(8000)});
  if(!response.ok) throw new Error(`PSO_API_${response.status}`);
  return response.json() as Promise<T>;
}

async function psoApiListAll<T>(path:string):Promise<T[]>{
  const limit=100;
  const items:T[]=[];
  let offset=0;
  for(let page=0;page<1000;page+=1){
    const payload=await psoApi<PsoList<T>>(path,{limit,offset});
    const batch=Array.isArray(payload.data)?payload.data:[];
    items.push(...batch);
    offset+=batch.length;
    const total=payload.pagination?.total;
    if(batch.length===0||batch.length<limit||(typeof total==='number'&&offset>=total)) break;
  }
  return items;
}

export async function getPsoMarketSnapshot():Promise<{state:PsoApiState;events:PsoMarketEvent[];players:PsoPlayer[]}>{
  if(!isPsoApiConfigured()) return {state:'not-configured',events:[],players:[]};
  try{
    const [events,players]=await Promise.all([
      psoApiListAll<PsoMarketEvent>('/api/market/events'),
      psoApiListAll<PsoPlayer>('/api/players'),
    ]);
    return {state:'connected',events,players};
  }catch(error){
    console.error('PSO API indisponível:',error instanceof Error?error.message:error);
    return {state:'unavailable',events:[],players:[]};
  }
}
