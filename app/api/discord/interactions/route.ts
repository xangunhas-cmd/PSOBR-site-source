import {env} from 'cloudflare:workers';
import {getDb} from '@/db';
import {newsRecords, transferRecords} from '@/db/schema';

type Option={name:string;value?:string|number;options?:Option[]};
type Interaction={id:string;type:number;guild_id?:string;channel_id?:string;member?:{user?:{id?:string};roles?:string[];permissions?:string};data?:{name?:string;options?:Option[]}};

function hexBytes(value:string){
  if(!/^[0-9a-f]+$/i.test(value)||value.length%2) return null;
  return Uint8Array.from(value.match(/.{2}/g)!.map(byte=>Number.parseInt(byte,16)));
}

async function verifyDiscordRequest(request:Request,body:string){
  const signature=request.headers.get('x-signature-ed25519');
  const timestamp=request.headers.get('x-signature-timestamp');
  const publicKey=env.DISCORD_PUBLIC_KEY;
  if(!signature||!timestamp||!publicKey) return false;
  const signatureBytes=hexBytes(signature);const keyBytes=hexBytes(publicKey);
  if(!signatureBytes||!keyBytes) return false;
  try{
    const key=await crypto.subtle.importKey('raw',keyBytes,{name:'Ed25519'},false,['verify']);
    return crypto.subtle.verify({name:'Ed25519'},key,signatureBytes,new TextEncoder().encode(timestamp+body));
  }catch{return false}
}

function option(options:Option[]|undefined,name:string){return options?.find(item=>item.name===name)?.value}
function reply(content:string){return Response.json({type:4,data:{content,flags:64}})}
function authorized(interaction:Interaction){
  const roleIds=(env.DISCORD_ADMIN_ROLE_IDS||'').split(',').map(value=>value.trim()).filter(Boolean);
  if(roleIds.length&&interaction.member?.roles?.some(role=>roleIds.includes(role))) return true;
  try{const permissions=BigInt(interaction.member?.permissions||'0');return Boolean((permissions&BigInt(8))||(permissions&BigInt(32)))}catch{return false}
}
function safeHref(value:unknown){
  if(typeof value!=='string'||!value.trim()) return '/noticias';
  try{const url=new URL(value);return ['http:','https:'].includes(url.protocol)?url.toString():'/noticias'}catch{return value.startsWith('/')?value:'/noticias'}
}

export async function POST(request:Request){
  const body=await request.text();
  if(!(await verifyDiscordRequest(request,body))) return new Response('invalid request signature',{status:401});
  const interaction=JSON.parse(body) as Interaction;
  if(interaction.type===1) return Response.json({type:1});
  if(interaction.type!==2||!interaction.data?.name) return reply('Interação não reconhecida.');
  if(!authorized(interaction)) return reply('Você não tem permissão para publicar no site.');

  const options=interaction.data.options;
  if(interaction.data.name==='transferencia'){
    const player=String(option(options,'jogador')||'').trim();
    const fromClub=String(option(options,'origem')||'').trim();
    const toClub=String(option(options,'destino')||'').trim();
    const overall=Number(option(options,'overall'));
    const position=String(option(options,'posicao')||'').trim()||null;
    if(!player||!fromClub||!toClub||!Number.isInteger(overall)||overall<0||overall>99) return reply('Confira jogador, clubes e overall (0 a 99).');
    const sourceUrl=interaction.guild_id&&interaction.channel_id?`https://discord.com/channels/${interaction.guild_id}/${interaction.channel_id}`:null;
    await getDb().insert(transferRecords).values({id:interaction.id,player,position,overall,fromClub,toClub,occurredAt:new Date().toISOString(),sourceUrl,discordGuildId:interaction.guild_id||null,discordChannelId:interaction.channel_id||null,createdBy:interaction.member?.user?.id||null}).onConflictDoNothing();
    return reply(`Transferência publicada: **${player}** · ${fromClub} → ${toClub}${overall>=84?'\n📰 Também entrou em Notícias por ter overall 84+.':''}`);
  }

  if(interaction.data.name==='noticia'){
    const kind=String(option(options,'tipo')||'comunicado') as 'titulo'|'comunicado';
    const title=String(option(options,'titulo')||'').trim();
    const summary=String(option(options,'resumo')||'').trim();
    const href=safeHref(option(options,'link'));
    if(!title||!summary||!['titulo','comunicado'].includes(kind)) return reply('Confira o tipo, título e resumo da notícia.');
    await getDb().insert(newsRecords).values({id:interaction.id,kind,label:kind==='titulo'?'Título':'Comunicado',title,summary,publishedAt:new Date().toISOString(),href,createdBy:interaction.member?.user?.id||null}).onConflictDoNothing();
    return reply(`Notícia publicada: **${title}**`);
  }

  return reply('Comando não reconhecido.');
}
