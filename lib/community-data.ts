import {desc} from 'drizzle-orm';
import {getDb} from '@/db';
import {newsRecords, transferRecords} from '@/db/schema';
import {editorialNews, isHeadlineTransfer, transferToNews, type NewsItem, type Transfer} from '@/lib/community-feed';

function formatDate(value:string){
  const date=new Date(value);
  if(Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('pt-BR',{day:'2-digit',month:'short',year:'numeric',timeZone:'America/Sao_Paulo'}).format(date);
}

export async function getTransfers():Promise<Transfer[]>{
  try{
    const rows=await getDb().select().from(transferRecords).orderBy(desc(transferRecords.occurredAt)).limit(100);
    return rows.map(row=>({id:row.id,player:row.player,position:row.position||undefined,overall:row.overall,fromClub:row.fromClub,toClub:row.toClub,date:formatDate(row.occurredAt),sourceUrl:row.sourceUrl||undefined}));
  }catch{
    return [];
  }
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
