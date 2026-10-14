"use client";
import {useState} from 'react';
import {usePathname} from 'next/navigation';
import Link from 'next/link';
const links=[['Início','/'],['Notícias','/noticias'],['Competições','/competicoes'],['Clubes','/clubes'],['Transferências','/transferencias'],['Museu','/museu'],['Jogos','/jogos'],['Comunidade','/comunidade']];
export default function SiteNav(){const [open,setOpen]=useState(false);const current=usePathname();return <header className="portal-nav"><Link className="portal-brand" href="/" aria-label="PSO Brasil — início"><img src="/psobr-logo.png" alt=""/><span>PSO <b>BRASIL</b><small>O NOSSO JOGO.</small></span></Link><button className="portal-menu-toggle" aria-expanded={open} aria-controls="portal-links" onClick={()=>setOpen(!open)}>{open?'Fechar':'Menu'}</button><nav id="portal-links" aria-label="Navegação principal" className={open?'is-open':''}>{links.map(([label,url])=><Link key={url} href={url} aria-current={(url==='/'?current==='/':current.startsWith(url))?'page':undefined} onClick={()=>setOpen(false)}>{label}</Link>)}</nav></header>}
