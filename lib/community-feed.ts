export type NewsKind = 'titulo' | 'comunicado' | 'transferencia';

export type NewsItem = {
  id: string;
  kind: NewsKind;
  label: string;
  title: string;
  summary: string;
  date: string;
  image?: string;
  href: string;
};

export type MarketTransactionType = 'transfer' | 'dismissal' | 'contract_expired';

export type Transfer = {
  id: string;
  transactionType: MarketTransactionType;
  player: string;
  position?: string;
  overall?: number;
  fromClub: string;
  toClub: string;
  date: string;
  sourceUrl?: string;
  image?: string;
};

/* Contrato temporário entre o site e o futuro bot do Discord. */
export const transfers: Transfer[] = [];

export const editorialNews: NewsItem[] = [
  {id:'pod-sudamerica',kind:'titulo',label:'Título continental',title:'POD FC conquista a Copa Sudamerica',summary:'O primeiro torneio oficial sul-americano da UE5 já está no Museu.',date:'Museu PSO BR',image:'/museum/pod-sudamericana.png',href:'/museu'},
  {id:'botafogo-2026',kind:'titulo',label:'Temporada 2026',title:'Botafogo vence Brasileirão e Copa do Brasil',summary:'A dobradinha nacional e o elenco campeão foram registrados no acervo.',date:'Museu PSO BR',image:'/museum/botafogo-brasileirao-2026.png',href:'/museu'},
  {id:'selecao-copa-america-2025',kind:'titulo',label:'Seleção Brasileira',title:'Copa América 2025 entra para o acervo',summary:'O título da Seleção sobre a Argentina ganhou registro no Museu.',date:'15 mar 2025',image:'/museum/selecao-copa-america-2025.png',href:'/museu'},
  {id:'proxima-temporada',kind:'comunicado',label:'Comunicado',title:'Próxima temporada em organização',summary:'Calendário, clubes e inscrições serão publicados após confirmação da administração.',date:'PSO Brasil',href:'/competicoes'},
];

export function isHeadlineTransfer(transfer: Transfer) {
  return transfer.transactionType === 'transfer' && typeof transfer.overall === 'number' && transfer.overall >= 84;
}

export function transferToNews(transfer: Transfer): NewsItem {
  return {id:`transfer-${transfer.id}`,kind:'transferencia',label:`Mercado${transfer.overall?` · OVR ${transfer.overall}`:''}`,title:`${transfer.player} fecha com ${transfer.toClub}`,summary:`${transfer.fromClub} → ${transfer.toClub}`,date:transfer.date,image:transfer.image,href:transfer.sourceUrl||'/transferencias'};
}

export const news: NewsItem[] = [...transfers.filter(isHeadlineTransfer).map(transferToNews),...editorialNews];
