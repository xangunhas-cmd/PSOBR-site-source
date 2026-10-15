"use client";
import { useEffect,useRef } from "react";
import gsap from "gsap";
export default function AnimatedGame({children,className=""}:{children:React.ReactNode;className?:string}){
  const ref=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    if(!ref.current)return;
    const ctx=gsap.context(()=>{
      const reveals=gsap.utils.toArray<HTMLElement>("[data-reveal]");
      const floats=gsap.utils.toArray<HTMLElement>("[data-float]");
      const spins=gsap.utils.toArray<HTMLElement>("[data-spin]");
      if(reveals.length) gsap.from(reveals,{y:34,opacity:0,duration:.85,stagger:.11,ease:"power3.out"});
      if(floats.length) gsap.to(floats,{y:-12,duration:2.8,yoyo:true,repeat:-1,ease:"sine.inOut"});
      if(spins.length) gsap.to(spins,{rotation:360,duration:24,repeat:-1,ease:"none"});
    },ref);
    return()=>ctx.revert();
  },[]);
  return <div ref={ref} className={className}>{children}</div>;
}
