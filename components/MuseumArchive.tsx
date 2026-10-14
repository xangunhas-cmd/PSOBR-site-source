'use client';

import {useMemo, useState} from 'react';

type Category = 'ligas' | 'copas' | 'continentais' | 'selecao';
type RecordItem = {
  category: Category;
  title: string;
  champion: string;
  edition: string;
  roster?: string[];
  note?: string;
  image?: string;
  source: string;
};

const records: RecordItem[] = [
  {category:'ligas',title:'Brasileirão Série A',champion:'Alessandria',edition:'T1 · UE5',image:'/museum/alessandria-serie-a.png',roster:['Magno','god','puskas','chico promesa','joel','cg','flowy','nika','Nico piedra','Arima','gvardiol','Mdk'],source:'https://discord.com/channels/1558351899651088477/1558599230946279474'},
  {category:'ligas',title:'Brasileirão Série B',champion:'Nitegy',edition:'T1 · UE5',image:'/museum/nitegy-serie-b.png',roster:['Nikko','Melox','OPoderoso','mikexzw','atr','jogieelj','Egst','kayke','polarrkr','LEANDRO SENADOR','Marco','Pantis Finito'],source:'https://discord.com/channels/1558351899651088477/1558598606192255096'},
  {category:'ligas',title:'Brasileirão',champion:'Botafogo',edition:'2026',image:'/museum/botafogo-brasileirao-2026.png',roster:['Yfirstt','Coutinho','Magno','God','Plata','Carlos Maria','Cassio','Gvardiol','Cursed','Nazyel','Pulgar','Nzf'],note:'Menções honrosas: Ander, Rafah e Dele.',source:'https://discord.com/channels/1558351899651088477/1558601956069482637'},
  {category:'ligas',title:'Brasileirão',champion:'Botafogo',edition:'2025 · T2',image:'/museum/botafogo-brasileirao-2025-t2.png',roster:['Gvardiol','Yfirstt','Cursed','Luckz','Plata','God','Arima','Wirtz','Cassio'],source:'https://discord.com/channels/1558351899651088477/1558597365949014117'},
  {category:'ligas',title:'Brasileirão',champion:'Botafogo',edition:'2025',image:'/museum/botafogo-brasileirao-2025.png',roster:['Coutinho','Nenéu','Rafah','Wel','Dele','Carlos Maria','Dida','Justin','Pipita','Flowy'],note:'Bicampeão invicto na temporada, com os títulos do Brasileiro e da Copa do Brasil.',source:'https://discord.com/channels/1558351899651088477/1558595647458910208'},
  {category:'ligas',title:'Fast Camp · Nacional League',champion:'Flamengo',edition:'Nacional League',image:'/museum/flamengo-fast-camp.png',roster:['cerbe','justin','fan','Mclovinpso','Valem','El flautista de Hamelin','puskas','Junior_paLermo','Arima','chico promesa'],source:'https://discord.com/channels/1558351899651088477/1558598132256870410'},
  {category:'ligas',title:'Fast Camp',champion:'Rolonapreta',edition:'1ª edição',image:'/museum/rolonapreta-fast-camp.png',roster:['God','Ander','Coutinho','Justin','Pipita','Dida'],source:'https://discord.com/channels/1558351899651088477/1558596958392680569'},
  {category:'ligas',title:'Campeonato Brasileiro',champion:'Cuiabá',edition:'2023',image:'/museum/cuiaba-brasileiro-2023.png',roster:['Luckz','Neneu','Iniesta','Valem','Flowy','Felipe','Nika','Gbz'],source:'https://discord.com/channels/1558351899651088477/1558583189432311808'},
  {category:'ligas',title:'Liga Pelé',champion:'Impalare',edition:'PSO Brasil · 2024',image:'/museum/impalare-liga-pele-2024.png',roster:['Pisa','Charly','Nico Piedra','Fuyi','Mclovin','Kev','Raiko'],note:'Primeiro time argentino campeão de uma competição do servidor.',source:'https://discord.com/channels/1558351899651088477/1558594464354672650'},
  {category:'ligas',title:'Liga Esplendida · Divisão C',champion:'Chapa FC',edition:'2ª edição',image:'/museum/chapa-div-c.png',roster:['jjoaco','luquitas','barney','tumo','Bestia Titanica','Rodrigo de Paul','San Pelado','El ñibu','Goxt'],source:'https://discord.com/channels/1558351899651088477/1558581915370393641'},
  {category:'ligas',title:'Liga Esplendida · Divisão B',champion:'Impalare',edition:'2ª edição',image:'/museum/impalare-div-b.png',roster:['Pisa','Marianito','SantiGG','Riquelme','Raiko','Zico','Nzf'],source:'https://discord.com/channels/1558351899651088477/1558581160135761990'},
  {category:'ligas',title:'Liga Esplendida',champion:'Mata Orlando',edition:'2ª edição',image:'/museum/mata-orlando.gif',roster:['Ander','Svg','Dele','Wizen','Pratt','Cabecinha','Neeliu','Cadete','Pipita','Fuleco','Neras','Luckz','Flowy'],note:'O acervo inclui cards animados do elenco; a capa usa o registro de Wizen.',source:'https://discord.com/channels/1558351899651088477/1558413649498996786'},
  {category:'ligas',title:'Liga Esplendida',champion:'Orlando City',edition:'1ª edição',image:'/museum/orlando-city.gif',roster:['Rafah','Skchester','Fov','Gurimatador','Coutinho','Basshunter','Kev'],source:'https://discord.com/channels/1558351899651088477/1558407360458920007'},
  {category:'ligas',title:'PSO Brasil',champion:'Bolsa de Madame',edition:'2022 · 2ª edição',image:'/museum/bolsa-de-madame.png',note:'Destaques: Flashzin (goleiro), Luckz (defensor), Coutinho (meia) e Wellio (atacante).',source:'https://discord.com/channels/1558351899651088477/1558405324677845024'},
  {category:'ligas',title:'PSO Brasil',champion:'Rolonapreta',edition:'1ª temporada',image:'/museum/rolonapreta-primeira-temporada.png',roster:['Danteix','Gus','Henriqueos1','HenryS','Iguim','Martinelli','Cursed','Ander','Switch','Messi','Rafah','Senpai','Sieel','Svg'],source:'https://discord.com/channels/1558351899651088477/1558404256044683365'},
  {category:'copas',title:'Copa do Brasil',champion:'Botafogo',edition:'2026',image:'/museum/botafogo-copa-2026.png',roster:['Yfirstt','Coutinho','Magno','God','Plata','Carlos Maria','Cassio','Gvardiol','Cursed','Nazyel','Pulgar','Nzf'],source:'https://discord.com/channels/1558351899651088477/1558614234793775125'},
  {category:'copas',title:'Copa do Brasil',champion:'Botafogo',edition:'2025 · T2',image:'/museum/botafogo-copa-2025-t2.png',roster:['Gvardiol','Yfirstt','Coutinho','God','Cursed','Luckz','Plata','Arima','Wirtz','Cassio'],source:'https://discord.com/channels/1558351899651088477/1558597641275703356'},
  {category:'copas',title:'Copa do Brasil',champion:'Botafogo',edition:'2025',image:'/museum/botafogo-copa-2025.png',roster:['Wel','Nenéu','Coutinho','Rafah','Justin','Pipita','Flowy','Dele','Dida','Carlos Maria'],source:'https://discord.com/channels/1558351899651088477/1558595391233196085'},
  {category:'copas',title:'Copa do Brasil',champion:'Gorilas Albinos',edition:'1ª temporada · Nova PSO BR',image:'/museum/gorilas-albinos.png',roster:['Coutinho','Wel','Agstn','Wellio','Ander','Dele','Wizen','Oliveira','Luckz','Pipita','Hawk','Carlos Maria','Khruel','Mlss'],source:'https://discord.com/channels/1558351899651088477/1558582106798686298'},
  {category:'continentais',title:'Copa Sudamerica',champion:'POD FC',edition:'1º torneio oficial SA · UE5',image:'/museum/pod-sudamericana.png',roster:['arima','cassio','cursed','god','pistola','yfirstt'],note:'Cassio: maior número de defesas. Yfirstt: MVP da final.',source:'https://discord.com/channels/1558351899651088477/1558708033406632007'},
  {category:'continentais',title:'Libertadores',champion:'Cuiabá',edition:'Campeão continental',image:'/museum/cuiaba-libertadores.png',roster:['Carlos Maria','Nika','Luckz','Éfipê','Nenéu','Magno','Valem','Cañavate','Wellio','Wel'],note:'Campanha registrada com 66 gols.',source:'https://discord.com/channels/1558351899651088477/1558592824537128990'},
  {category:'selecao',title:'Copa América',champion:'Seleção Brasileira',edition:'2025',image:'/museum/selecao-copa-america-2025.png',roster:['Gbz','Coutinho','Neneu','Magno','Rafahos','Skchester','Justin'],note:'Título conquistado sobre a Argentina em 15 de março de 2025.',source:'https://discord.com/channels/1558351899651088477/1558596121788678407'},
  {category:'selecao',title:'Nations League',champion:'Seleção Brasileira',edition:'2023',image:'/museum/selecao-nations-league-2023.png',roster:['Ander','Toledo','Carlos Maria','Pedrins','Justin','Wert','Coutinho','Luckz','Skchester','Rafah','Gbz','Wel','Neneu','Cz','Cursed','Yoshiro','Dele','Magno','CapetinhaRS'],source:'https://discord.com/channels/1558351899651088477/1558594028688248902'},
];

const tabs: {id:Category; label:string; eyebrow:string}[] = [
  {id:'ligas',label:'Campeões de liga',eyebrow:'Pontos corridos e divisões'},
  {id:'copas',label:'Campeões de copa',eyebrow:'Mata-mata nacional'},
  {id:'continentais',label:'Glória continental',eyebrow:'América do Sul'},
  {id:'selecao',label:'Seleção Brasileira',eyebrow:'Títulos internacionais'},
];

export default function MuseumArchive(){
  const [active,setActive]=useState<Category>('ligas');
  const [selected,setSelected]=useState<RecordItem|null>(null);
  const visible=useMemo(()=>records.filter(item=>item.category===active),[active]);
  const current=tabs.find(tab=>tab.id===active)!;

  return <section className="museum-archive" aria-label="Acervo de campeões">
    <div className="museum-stats" aria-label="Resumo do acervo">
      <div><strong>{records.length}</strong><span>registros organizados</span></div>
      <div><strong>{new Set(records.map(item=>item.champion)).size}</strong><span>campeões no acervo</span></div>
      <div><strong>2022—26</strong><span>linha do tempo atual</span></div>
    </div>

    <div className="museum-tabs" role="tablist" aria-label="Categorias do museu">
      {tabs.map(tab=><button key={tab.id} role="tab" aria-selected={active===tab.id} onClick={()=>setActive(tab.id)}>
        <small>{tab.eyebrow}</small><span>{tab.label}</span><b>{records.filter(item=>item.category===tab.id).length.toString().padStart(2,'0')}</b>
      </button>)}
    </div>

    <div className="museum-section-head">
      <div><span className="museum-index">ACERVO / {current.label.toUpperCase()}</span><h2>{current.label}</h2></div>
      <p>Abra um registro para ver o elenco, as observações históricas e a publicação original no Museu do Discord.</p>
    </div>

    <div className="museum-grid">
      {visible.map((item,index)=><button className={`museum-card ${item.image?'has-image':''}`} key={item.source} onClick={()=>setSelected(item)}>
        {item.image?<img src={item.image} alt={`Registro de ${item.champion}, campeão de ${item.title}`}/>:<div className="museum-monogram" aria-hidden="true">{item.champion.split(' ').map(word=>word[0]).join('').slice(0,3)}</div>}
        <span className="museum-card-shade" aria-hidden="true"/>
        <span className="museum-card-number">{String(index+1).padStart(2,'0')}</span>
        <span className="museum-card-copy"><small>{item.edition}</small><strong>{item.champion}</strong><em>{item.title}</em><i>Ver registro →</i></span>
      </button>)}
    </div>

    {selected&&<div className="museum-modal" role="dialog" aria-modal="true" aria-labelledby="museum-dialog-title" onMouseDown={event=>{if(event.target===event.currentTarget)setSelected(null)}}>
      <article>
        <button className="museum-close" onClick={()=>setSelected(null)} aria-label="Fechar registro">×</button>
        {selected.image&&<img src={selected.image} alt=""/>}
        <div className="museum-modal-copy">
          <span className="kicker">{selected.edition}</span>
          <h2 id="museum-dialog-title">{selected.champion}</h2>
          <p className="museum-competition">{selected.title}</p>
          {selected.roster&&<><h3>Elenco campeão</h3><div className="museum-roster">{selected.roster.map(player=><span key={player}>{player}</span>)}</div></>}
          {selected.note&&<p className="museum-note">{selected.note}</p>}
          <a className="portal-outline" href={selected.source} target="_blank" rel="noreferrer">Ver publicação original ↗</a>
        </div>
      </article>
    </div>}
  </section>;
}
