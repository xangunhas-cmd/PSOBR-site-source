export type PlayerCard={id:string;name:string;overall:number;position:string;country:string;club:string;collection:string;image:string;approved:boolean};
const card=(name:string,overall:number,position:string,country:string,collection:'Cartas Base'|'Icons',file=`${name}.png`):PlayerCard=>({id:name.toLowerCase().replace(/[^a-z0-9]+/g,'-'),name,overall,position,country,club:'PSO Dream Team',collection,image:`/cards/${file}`,approved:true});
export const playerCards:PlayerCard[]=[
card('Pulgar',90,'GK','Brasil','Cartas Base'),card('Agstn',88,'CAM','Uruguai','Cartas Base'),card('Arima',86,'RM','Argentina','Cartas Base'),card('Coutinho',90,'CM','Brasil','Cartas Base'),card('Fan',88,'ST','Argentina','Cartas Base'),card('Fuyi',86,'RB','Argentina','Cartas Base'),card('Gvardiol',88,'CB','Brasil','Cartas Base'),card('Joel',87,'RB','Argentina','Cartas Base'),card('Mclovin',88,'RW','Argentina','Cartas Base'),card('Nzf',86,'CM','Argentina','Cartas Base'),card('yfirstt',87,'CAM','Brasil','Cartas Base'),card('Luku',80,'LB','Argentina','Cartas Base'),card('021',84,'LM','Argentina','Cartas Base'),card('Cg',83,'RW','Brasil','Cartas Base'),card('Colidios',82,'CM','Argentina','Cartas Base'),card('Cz',78,'RB','Brasil','Cartas Base'),card('Depay',79,'ST','Brasil','Cartas Base'),card('Fonta',85,'GK','Argentina','Cartas Base'),card('Gbr',83,'GK','Brasil','Cartas Base'),card('Jojo',84,'GK','Brasil','Cartas Base'),card('Korito',83,'LB','Argentina','Cartas Base'),card('Valenn',82,'LB','Argentina','Cartas Base'),card('Mate Cocido',83,'CDM','Argentina','Cartas Base','Mate_Cocido.png'),card('Mdk',82,'ST','Brasil','Cartas Base'),card('Next',85,'ST','Brasil','Cartas Base'),card('Noeb',84,'GK','Brasil','Cartas Base'),card('Pipita',80,'LB','Argentina','Cartas Base'),card('Polar',78,'LW','Brasil','Cartas Base'),
card('Wel',92,'RW','Brasil','Icons'),card('Basshunter',93,'LB','Brasil','Icons'),card('Cabecinha',92,'ST','Brasil','Icons'),card('Cassio',94,'GK','Brasil','Icons'),card('Luckz',94,'CB','Brasil','Icons'),card('Magno',94,'CAM','Brasil','Icons'),card('Matten',93,'GK','Brasil','Icons'),card('Neeliu',94,'GK','Brasil','Icons'),card('Nenéu',94,'CAM','Brasil','Icons','Neneu.png'),card('Sida',92,'ST','Uruguai','Icons'),card('Wizen',94,'LB','Brasil','Icons'),card('Wellio',93,'LW','Brasil','Icons')];

export function normalizePlayerName(value:string){
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
}

export function findPlayerCard(value:string){
  const normalized=normalizePlayerName(value);
  return playerCards.find(item=>item.approved&&normalizePlayerName(item.name)===normalized);
}
