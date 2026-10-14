"use client";
import { useState } from "react";
import { motion } from "motion/react";
import { IconArrowLeft,IconBrandTabler,IconLink,IconSettings,IconUserBolt } from "@tabler/icons-react";
import { Check,Leaf,ShieldCheck,Sparkles } from "lucide-react";
import { Sidebar,SidebarBody,SidebarLink } from "@/components/ui/sidebar";
import LineWaves from "@/components/LineWaves";
import "./settings.css";

const links=[
  {label:"Visão geral",href:"/",icon:<IconBrandTabler className="settings-side-icon"/>},
  {label:"Perfil",href:"#perfil",icon:<IconUserBolt className="settings-side-icon"/>},
  {label:"Configurações",href:"#preferencias",icon:<IconSettings className="settings-side-icon"/>},
  {label:"Integração 7a0",href:"#integracao",icon:<IconLink className="settings-side-icon"/>},
];
export default function SettingsWorkspace(){
  const [open,setOpen]=useState(false),[motionEnabled,setMotionEnabled]=useState(true),[notifications,setNotifications]=useState(true),[saved,setSaved]=useState(false);
  const save=()=>{setSaved(true);window.setTimeout(()=>setSaved(false),2200);};
  return <main className="settings-page"><div className="settings-wave" aria-hidden="true"><LineWaves speed={0.18} innerLineCount={26} outerLineCount={34} warpIntensity={0.72} rotation={-24} edgeFadeWidth={0.12} colorCycleSpeed={0.35} brightness={0.16} color1="#2e6b43" color2="#8bc95b" color3="#dff3cf" enableMouseInteraction={false} mouseInfluence={0}/></div><div className="settings-shell">
    <Sidebar open={open} setOpen={setOpen}><SidebarBody className="settings-sidebar">
      <div className="settings-sidebar-main"><a className="settings-logo" href="/" aria-label="PSOBR - início"><span><Leaf size={17}/></span>{open&&<motion.strong initial={{opacity:0}} animate={{opacity:1}}>PSOBR</motion.strong>}</a><nav className="settings-links" aria-label="Configurações">{links.map(link=><SidebarLink key={link.label} link={link} className={link.label==="Configurações"?"is-active":""}/>)}</nav></div>
      <div className="settings-sidebar-foot"><SidebarLink link={{label:"Sair",href:"/login",icon:<IconArrowLeft className="settings-side-icon"/>}}/><SidebarLink link={{label:"Minha conta",href:"#perfil",icon:<span className="settings-avatar">P</span>}}/></div>
    </SidebarBody></Sidebar>
    <section className="settings-content">
      <header className="settings-header"><div><span>CONTA PSOBR</span><h1>Configurações</h1><p>Ajuste sua experiência agora e prepare sua conta para o ecossistema 7a0.</p></div><a href="/">Voltar ao site</a></header>
      <div className="settings-grid">
        <article className="settings-card settings-profile" id="perfil"><div className="settings-card-title"><span><IconUserBolt size={20}/></span><div><h2>Perfil</h2><p>Como você será identificado na arena.</p></div></div><div className="settings-fields"><label>Nome de exibição<input defaultValue="Jogador PSO"/></label><label>E-mail<input type="email" defaultValue="jogador@psobr.com"/></label></div></article>
        <article className="settings-card" id="preferencias"><div className="settings-card-title"><span><Sparkles size={20}/></span><div><h2>Experiência</h2><p>Controle os detalhes visuais e avisos.</p></div></div><div className="settings-options"><label><div><strong>Animações do site</strong><small>Movimentos, transições e efeitos do estádio.</small></div><input type="checkbox" checked={motionEnabled} onChange={e=>setMotionEnabled(e.target.checked)}/><i/></label><label><div><strong>Notificações da temporada</strong><small>Novidades de partidas, ranking e cards.</small></div><input type="checkbox" checked={notifications} onChange={e=>setNotifications(e.target.checked)}/><i/></label></div></article>
        <article className="settings-card settings-integration" id="integracao"><div className="settings-card-title"><span><IconLink size={20}/></span><div><h2>Integração 7a0</h2><p>Uma única identidade para seus projetos e competições.</p></div></div><div className="integration-status"><div className="integration-brand"><span>7</span><strong>7a0</strong></div><div><span className="status-pill">Em preparação</span><p>A conexão de contas, perfil e progresso será ativada em uma futura etapa.</p></div></div><button disabled><IconLink size={17}/> Conectar conta 7a0 em breve</button></article>
        <article className="settings-card settings-security"><div className="settings-card-title"><span><ShieldCheck size={20}/></span><div><h2>Conta e segurança</h2><p>Seu acesso será protegido quando a autenticação for conectada.</p></div></div><div className="security-row"><span>Login principal</span><strong>Google</strong></div><div className="security-row"><span>Status da conta</span><strong className="security-ready"><Check size={15}/> Preparada</strong></div></article>
      </div>
      <footer className="settings-actions"><p>{saved?"Preferências salvas neste dispositivo.":"As preferências serão salvas localmente nesta versão."}</p><button onClick={save}>{saved?<><Check size={17}/> Salvo</>:"Salvar alterações"}</button></footer>
    </section>
  </div></main>;
}
