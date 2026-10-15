import {Shell,Empty} from '@/components/Portal';
import {getPsoClubs} from '@/lib/pso-api';

export const dynamic='force-dynamic';

export default async function Page(){
  const {state,clubs}=await getPsoClubs();
  const playerCount=clubs.reduce((total,club)=>total+club.players.length,0);
  return <Shell tag="PSO BRASIL / EQUIPES" title="Clubes" description="Clubes e elencos registrados no servidor.">
    {clubs.length>0?<>
      <div className="clubs-summary">
        <div><strong>{clubs.length}</strong><span>clubes</span></div>
        <div><strong>{playerCount}</strong><span>jogadores vinculados</span></div>
        <div><strong className="clubs-live">AO VIVO</strong><span>sincronizado com o bot</span></div>
      </div>
      <section className="clubs-grid" aria-label="Clubes registrados">
        {clubs.map(club=><article className="club-card" key={club.id}>
          <header className="club-header">
            {club.logoUrl?<img className="club-logo" src={club.logoUrl} alt={`Escudo do ${club.name}`}/>:<span className="club-logo club-monogram">{club.name.slice(0,2).toUpperCase()}</span>}
            <div><small>{club.id}</small><h2>{club.name}</h2><span>{club.players.length} {club.players.length===1?'jogador':'jogadores'}</span></div>
          </header>
          {club.players.length>0?<div className="club-roster">
            {club.players.map(player=><div className="club-player" key={player.id}>
              {player.image?<img src={player.image} alt=""/>:<span className="player-avatar">{player.nickname.slice(0,1).toUpperCase()}</span>}
              <strong>{player.nickname}</strong>
              <small>{player.position||'—'}</small>
            </div>)}
          </div>:<p className="club-no-players">Nenhum jogador vinculado.</p>}
        </article>)}
      </section>
    </>:<Empty title={state==='connected'?'Nenhum clube registrado':'Clubes indisponíveis'}>{state==='not-configured'?'A conexão com a database ainda não foi configurada na hospedagem.':state==='unavailable'?'Não foi possível consultar a database do bot agora.':'Os clubes criados pelo bot aparecerão aqui automaticamente.'}</Empty>}
    <a className="primary clubs-rules" href="https://discord.com/channels/1558351899651088477/1558428544713887744" target="_blank" rel="noreferrer">Regras de inscrição ↗</a>
  </Shell>;
}
