"use client";
import { useEffect,useRef } from "react";
import gsap from "gsap";
export default function AnimatedGame({children,className=""}:{children:React.ReactNode;className?:string}){const ref=useRef<HTMLDivElement>(null);useEffect(()=>{if(!ref.current)return;const ctx=gsap.context(()=>{gsap.from("[data-reveal]",{y:34,opacity:0,duration:.85,stagger:.11,ease:"power3.out"});gsap.to("[data-float]",{y:-12,duration:2.8,yoyo:true,repeat:-1,ease:"sine.inOut"});gsap.to("[data-spin]",{rotation:360,duration:24,repeat:-1,ease:"none"})},ref);return()=>ctx.revert()},[]);return <div ref={ref} className={className}>{children}</div>}
