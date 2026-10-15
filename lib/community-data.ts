import {desc} from 'drizzle-orm';
import {getDb} from '@/db';
import {newsRecords, transferRecords} from '@/db/schema';
import {editorialNews, isHeadlineTransfer, transferToNews, type MarketTransactionType, type NewsItem, type Transfer} from '@/lib/community-feed';
import {findPlayerCard} from '@/lib/catalog';
import {getPsoMarketSnapshot,type PsoApiState} from '@/lib/pso-api';

function formatDate(value:string){
  const date=new Date(value);
  if(Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('pt-BR',{day:'2-digit',month:'short',year:'numeric',timeZone:'America/Sao_Paulo'}).format(date);
}

async function getStoredTransfers():Promise<Transfer[]>{
  try{
    const rows=await getDb().select().from(transferRecords).orderBy(desc(transferRecords.occurredAt)).limit(100);
    return rows.map(row=>({id:row.id,transactionType:'transfer',player:row.player,position:row.position||undefined,overall:row.overall,fromClub:row.fromClub,toClub:row.toClub,date:formatDate(row.occurredAt),sourceUrl:row.sourceUrl||undefined}));
  }catch{
    return [];
  }
}

export async function getTransferFeed():Promise<{transfers:Transfer[];apiState:PsoApiState}>{
  const [stored,snapshot]=await Promise.all([getStoredTransfers(),getPsoMarketSnapshot()]);
  const players=new Map(snapshot.players.map(player=>[player.id,player]));
  const transactionTypes=new Set<MarketTransactionType>(['transfer','dismissal','contract_expired']);
  const remote=snapshot.events.filter(event=>transactionTypes.has(event.type as MarketTransactionType)&&event.at&&(event.playerId||event.playerName)).map(event=>{
    const transactionType=event.type as MarketTransactionType;
    const player=event.playerId?players.get(event.playerId):undefined;
    const playerName=event.playerName||player?.nickname||'Jogador';
    const card=findPlayerCard(playerName);
    const previousClub=event.fromClub||event.oldTeam||event.club||player?.club?.name||'Clube anterior';
    return {
      id:`bot-${event.id}`,
      transactionType,
      player:playerName,
      position:event.position||player?.position||card?.position||undefined,
      overall:card?.overall,
      fromClub:transactionType==='transfer'?previousClub:(event.toClub||previousClub),
      toClub:transactionType==='transfer'?(event.toClub||event.club||player?.club?.name||'Novo clube'):'Livre',
      date:formatDate(event.at!),
      sourceUrl:'/transferencias',
      image:card?.image||player?.image||event.playerImage||undefined,
    } satisfies Transfer;
  });
  const merged=new Map<string,Transfer>();
  for(const item of [...remote,...stored]) if(!merged.has(item.id)) merged.set(item.id,item);
  return {transfers:[...merged.values()],apiState:snapshot.state};
}

export async function getTransfers():Promise<Transfer[]>{
  return (await getTransferFeed()).transfers;
}

export async function getNews():Promise<NewsItem[]>{
  const transfers=await getTransfers();
  let stored:NewsItem[]=[];
  try{
    const rows=await getDb().select().from(newsRecords).orderBy(desc(newsRecords.publishedAt)).limit(100);
    stored=rows.map(row=>({id:row.id,kind:row.kind,label:row.label,title:row.title,summary:row.summary,date:formatDate(row.publishedAt),image:row.image||undefined,href:row.href}));
  }catch{
    // O conteudo editorial continua disponivel antes da primeira migracao local.
  }
  return [...transfers.filter(isHeadlineTransfer).map(transferToNews),...stored,...editorialNews];
}
