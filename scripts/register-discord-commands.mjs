const applicationId=process.env.DISCORD_APPLICATION_ID||'1559686521907581008';
const guildId=process.env.DISCORD_GUILD_ID||'1558351899651088477';
const token=process.env.DISCORD_BOT_TOKEN;
if(!token) throw new Error('O DISCORD_BOT_TOKEN não foi informado.');

const commands=[
  {name:'transferencia',description:'Publica uma transferência no site PSO Brasil',default_member_permissions:'32',options:[
    {name:'jogador',description:'Nome do jogador',type:3,required:true},
    {name:'overall',description:'Overall da carta',type:4,required:true,min_value:0,max_value:99},
    {name:'origem',description:'Clube de origem ou Livre',type:3,required:true},
    {name:'destino',description:'Novo clube',type:3,required:true},
    {name:'posicao',description:'Posição do jogador',type:3,required:false},
  ]},
  {name:'noticia',description:'Publica um comunicado ou título no site PSO Brasil',default_member_permissions:'32',options:[
    {name:'tipo',description:'Tipo da publicação',type:3,required:true,choices:[{name:'Comunicado',value:'comunicado'},{name:'Título',value:'titulo'}]},
    {name:'titulo',description:'Título da notícia',type:3,required:true},
    {name:'resumo',description:'Texto curto',type:3,required:true},
    {name:'link',description:'Link relacionado',type:3,required:false},
  ]},
];

const response=await fetch(`https://discord.com/api/v10/applications/${applicationId}/guilds/${guildId}/commands`,{method:'PUT',headers:{Authorization:`Bot ${token}`,'Content-Type':'application/json'},body:JSON.stringify(commands)});
if(!response.ok) throw new Error(`Discord respondeu ${response.status}: ${await response.text()}`);
console.log('Comandos /transferencia e /noticia registrados no servidor.');
