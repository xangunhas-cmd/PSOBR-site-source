"use client";

import { useState } from "react";
import { ArrowLeft, Eye, EyeOff, Leaf, LockKeyhole, Mail, Moon, Sun } from "lucide-react";
import { CloudShader } from "@/components/ui/cloud-shader";
import "./login.css";

export default function LoginExperience(){
  const [dark,setDark]=useState(false);
  const [showPassword,setShowPassword]=useState(false);
  const [remember,setRemember]=useState(true);
  const [message,setMessage]=useState("");
  return <main className={`login-experience ${dark?"is-dark":""}`}>
    <section className="login-cloud-panel" aria-label="Céu PSOBR animado">
      <CloudShader className="login-cloud" speed={0.72} count={6} cloudColor="#e4efd8" skyTopColor="#2d5e57" skyBottomColor="#07110d"/>
      <a className="login-back" href="/"><ArrowLeft size={17}/> Voltar ao site</a>
      <div className="login-cloud-copy"><span className="login-mark"><Leaf size={18}/></span><p>PSOBR / DRAFT ARENA</p><h1>Bem-vindo<br/>de volta à <em>arena.</em></h1><small>Seu elenco, sua temporada e sua história continuam aqui.</small></div>
      <div className="login-cloud-meta"><span>temporada 01</span><span>monte · dispute · faça história</span></div>
    </section>
    <section className="login-form-panel">
      <button className="login-theme" onClick={()=>setDark(v=>!v)} aria-label={dark?"Usar tema claro":"Usar tema escuro"}>{dark?<Sun size={18}/>:<Moon size={18}/>}</button>
      <div className="login-form-wrap">
        <a className="login-mobile-brand" href="/"><span><Leaf size={17}/></span> PSOBR</a>
        <span className="login-form-mark"><Leaf size={19}/></span>
        <h2>Entre na sua conta</h2><p className="login-subtitle">Acesse seu elenco e continue a temporada.</p>
        <div className="login-socials"><button type="button" onClick={()=>setMessage("O acesso com Google será conectado em breve.")}><img src="/google-login.png" alt=""/> Continuar com Google</button></div>
        <div className="login-divider"><span>ou entre com e-mail</span></div>
        <form onSubmit={e=>{e.preventDefault();setMessage("Login demonstrativo — a autenticação será conectada em breve.");}}>
          <label><span>E-mail</span><span className="login-input"><Mail size={17}/><input type="email" required autoComplete="email" placeholder="voce@exemplo.com"/></span></label>
          <label><span>Senha</span><span className="login-input"><LockKeyhole size={17}/><input type={showPassword?"text":"password"} required minLength={6} autoComplete="current-password" placeholder="Digite sua senha"/><button type="button" onClick={()=>setShowPassword(v=>!v)} aria-label={showPassword?"Ocultar senha":"Mostrar senha"}>{showPassword?<EyeOff size={17}/>:<Eye size={17}/>}</button></span></label>
          <div className="login-options"><label className="login-check"><input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)}/><i/> Lembrar deste dispositivo</label><a href="#recuperar">Esqueceu a senha?</a></div>
          <button className="login-submit" type="submit">Entrar</button>
          {message&&<p className="login-message" role="status">{message}</p>}
        </form>
        <p className="login-register">Ainda não tem uma conta? <a href="#criar-conta">Criar conta</a></p>
      </div>
      <footer><span>© 2026 PSOBR</span><span>Privacidade · Termos</span></footer>
    </section>
  </main>
}
