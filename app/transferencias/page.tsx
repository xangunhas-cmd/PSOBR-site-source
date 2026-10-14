import {Shell} from '@/components/Portal';
import {getTransfers} from '@/lib/community-data';

export default async function Page(){const transfers=await getTransfers();return <Shell tag="PSO BRASIL / MERCADO" title="Transferências" description="Entradas, saídas e jogadores livres.">
  <div className="market-status"><div><strong>{transfers.length}</strong><span>movimentos publicados</span></div><div><strong>84+</strong><span>overall vira notícia</span></div><div><strong className="market-pending">Pendente</strong><span>conexão com o bot</span></div></div>
  {transfers.length?<div className="transfer-list">{transfers.map(item=><article className="transfer-row" key={item.id}><span className="transfer-player"><strong>{item.player}</strong><small>{item.position||'Jogador'}{item.overall?` · OVR ${item.overall}`:''}</small></span><span>{item.fromClub}</span><b aria-label="para">→</b><span>{item.toClub}</span><time>{item.date}</time></article>)}</div>:<div className="market-empty"><span className="status-pill">Aguardando integração</span><h2>O mercado abre com o bot.</h2><p>Quando uma transferência for confirmada no Discord, ela entra aqui automaticamente.</p></div>}
  <section className="integration-flow" aria-label="Fluxo da integração"><article><b>01</b><strong>Discord</strong><span>O bot confirma a transferência.</span></article><i>→</i><article><b>02</b><strong>Registro</strong><span>Jogador, clubes, data e overall.</span></article><i>→</i><article><b>03</b><strong>Site</strong><span>Mercado atualizado; 84+ também vai para Notícias.</span></article></section>
</Shell>}
