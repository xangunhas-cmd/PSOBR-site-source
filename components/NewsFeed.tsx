'use client';

import {useMemo, useState} from 'react';
import type {NewsItem, NewsKind} from '@/lib/community-feed';

const filters: {id:'todos'|NewsKind; label:string}[] = [
  {id:'todos',label:'Todas'},
  {id:'transferencia',label:'Mercado'},
  {id:'comunicado',label:'Comunicados'},
  {id:'titulo',label:'Títulos'},
];

export default function NewsFeed({items}:{items:NewsItem[]}){
  const [active,setActive]=useState<'todos'|NewsKind>('todos');
  const visible=useMemo(()=>active==='todos'?items:items.filter(item=>item.kind===active),[active,items]);
  return <>
    <div className="news-filters" role="tablist" aria-label="Filtrar notícias">
      {filters.map(filter=><button key={filter.id} role="tab" aria-selected={active===filter.id} onClick={()=>setActive(filter.id)}>{filter.label}</button>)}
    </div>
    {visible.length?<div className="news-list">
      {visible.map((item,index)=><a className={`news-row ${index===0?'news-row-featured':''}`} href={item.href} key={item.id}>
        {item.image&&<img src={item.image} alt=""/>}
        <span className="news-row-copy"><span className="news-meta"><b>{item.label}</b><time>{item.date}</time></span><strong>{item.title}</strong><small>{item.summary}</small></span>
        <i aria-hidden="true">↗</i>
      </a>)}
    </div>:<div className="feed-empty"><strong>Nenhuma publicação nesta categoria.</strong><span>Os registros aparecerão aqui quando forem enviados pela administração ou pelo bot.</span></div>}
  </>;
}
