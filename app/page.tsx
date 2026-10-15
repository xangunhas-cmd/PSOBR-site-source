import SiteNav from '@/components/SiteNav';
import AnimatedGame from '@/components/AnimatedGame';
import {CompetitionCards,Footer} from '@/components/Portal';
import {getNews,getTransfers} from '@/lib/community-data';

export default async function Home(){
  const [news,transfers]=await Promise.all([getNews(),getTransfers()]);
  const topNews=news.slice(0,3);
  return <main className="psobr portal portal-home">
    <SiteNav/>
    <AnimatedGame>
      <section className="home-scoreboard">
        <div className="home-scoreboard-copy" data-reveal>
          <p className="kicker">PSO BRASIL</p>
          <h1>O futebol da<br/><em>comunidade.</em></h1>
          <p className="portal-lead">Campeonatos, mercado e notícias em um só lugar.</p>
          <div className="portal-actions"><a className="primary" href="/noticias">Ver notícias</a><a className="portal-outline" href="/competicoes">Competições</a></div>
        </div>
        <div className="home-board" data-reveal>
          <span className="home-board-label">TEMPORADA</span>
          <strong>EM<br/>PREPARAÇÃO</strong>
          <small>Calendário e clubes em breve</small>
          <img src="/psobr-logo.png" alt="Logo PSO Brasil"/>
        </div>
      </section>

      <section className="home-latest portal-section" data-reveal>
        <div className="direct-section-title"><div><p className="kicker">AGORA NO PSO BR</p><h2>Últimas</h2></div><a href="/noticias">Todas as notícias →</a></div>
        <div className="home-news-grid">
          {topNews.map((item,index)=><a className={index===0?'home-news-main':'home-news-card'} href={item.href} key={item.id}>
            {item.image&&<img src={item.image} alt=""/>}<span className="home-news-shade"/><span className="home-news-copy"><small>{item.label} · {item.date}</small><strong>{item.title}</strong>{index===0&&<em>{item.summary}</em>}</span>
          </a>)}
        </div>
      </section>

      <section className="portal-section home-market" data-reveal>
        <div className="direct-section-title"><div><p className="kicker">MERCADO</p><h2>Transferências</h2></div><a href="/transferencias">Abrir mercado →</a></div>
        <div className="home-market-bar"><span><i/> DATABASE DO MERCADO</span><strong>{transfers.length?`${transfers.length} movimentos`:'Aguardando dados'}</strong><small>Overall 84+ vira notícia automaticamente.</small></div>
      </section>

      <section className="portal-section" data-reveal>
        <div className="direct-section-title"><div><p className="kicker">TEMPORADA</p><h2>Competições</h2></div><a href="/competicoes">Ver todas →</a></div>
        <CompetitionCards/>
      </section>

      <section className="portal-section home-shortcuts" data-reveal>
        <a href="/clubes"><small>EQUIPES</small><strong>Clubes</strong><span>→</span></a>
        <a href="/museu"><small>HISTÓRIA</small><strong>Museu</strong><span>→</span></a>
        <a href="/jogos"><small>ENTRETENIMENTO</small><strong>Jogos</strong><span>→</span></a>
      </section>
    </AnimatedGame>
    <Footer/>
  </main>;
}
