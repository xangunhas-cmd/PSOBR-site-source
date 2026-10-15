import {Shell} from '@/components/Portal';
import {getTransferFeed} from '@/lib/community-data';

const transactionLabels={transfer:'Transferência',dismissal:'Demissão',contract_expired:'Fim de contrato'} as const;

export default async function Page(){const {transfers,apiState}=await getTransferFeed();const connection=apiState==='connected'?'Conectado':apiState==='unavailable'?'Indisponível':'Pendente';return <Shell tag="PSO BRASIL / MERCADO" title="Mercado" description="Transferências, demissões e contratos encerrados.">
  <div className="market-status"><div><strong>{transfers.length}</strong><span>movimentos publicados</span></div><div><strong>84+</strong><span>overall vira notícia</span></div><div><strong className="market-pending">{connection}</strong><span>conexão com o bot</span></div></div>
  {transfers.length?<div className="transfer-list">{transfers.map(item=><article className="transfer-row" key={item.id}><span className="transfer-player"><strong>{item.player}</strong><small>{transactionLabels[item.transactionType]} · {item.position||'Jogador'}{item.overall?` · OVR ${item.overall}`:''}</small></span><span>{item.fromClub}</span><b aria-label="para">→</b><span>{item.toClub}</span><time>{item.date}</time></article>)}</div>:<div className="market-empty"><span className="status-pill">Aguardando integração</span><h2>O mercado abre com o bot.</h2><p>Quando um movimento for confirmado no Discord, ele entra aqui automaticamente.</p></div>}
  <section className="integration-flow" aria-label="Fluxo da integração"><article><b>01</b><strong>Discord</strong><span>O bot registra o movimento.</span></article><i>→</i><article><b>02</b><strong>Mercado</strong><span>Transferências, demissões e fins de contrato.</span></article><i>→</i><article><b>03</b><strong>Site</strong><span>Mercado atualizado; transferências 84+ também viram notícia.</span></article></section>
</Shell>}
