"use client";

import { useEffect, useRef, useState } from 'react';
import { Maximize2, Minimize2, RotateCcw, Pause, Play, Download, Eye, EyeOff, Plus, Minus } from 'lucide-react';
import './stadium.css';

const views=[{id:'orbit',label:'Visão geral'},{id:'aerial',label:'Vista aérea'},{id:'pitch',label:'No gramado'},{id:'goal',label:'Atrás do gol'}];

export default function StadiumViewer() {
  const host=useRef(null),shell=useRef(null),api=useRef(null);
  const [ready,setReady]=useState(false),[error,setError]=useState('');
  const [view,setView]=useState('orbit'),[rotating,setRotating]=useState(false);
  const [roof,setRoof]=useState(true),[fullscreen,setFullscreen]=useState(false);
  useEffect(()=>{
    let disposed=false,cleanup=()=>{};
    async function start(){
      const [THREE,{OrbitControls},{createStadium,disposeStadium}]=await Promise.all([
        import('three'),import('three/addons/controls/OrbitControls.js'),import('@/lib/stadium-model.js')
      ]);
      if(disposed)return;
      const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
      renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.75));
      renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
      renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
      const canvas=renderer.domElement;
      canvas.setAttribute('aria-label','Modelo 3D do estádio PSO. Arraste para girar e use os botões para aproximar.');
      canvas.setAttribute('role','img');host.current.appendChild(canvas);
      const scene=new THREE.Scene();scene.background=new THREE.Color('#e5eff2');
      scene.fog=new THREE.Fog('#e5eff2',240,600);
      scene.add(new THREE.HemisphereLight('#e9f5ff','#617b52',2.6));
      const sun=new THREE.DirectionalLight('#fff4df',3.3);sun.position.set(-70,110,45);sun.castShadow=true;
      sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-95,right:95,top:95,bottom:-95,near:1,far:260});
      sun.shadow.bias=-.0003;sun.shadow.normalBias=.12;sun.shadow.radius=3;scene.add(sun);
      const fill=new THREE.DirectionalLight('#d7eaff',1);fill.position.set(60,35,-40);scene.add(fill);
      const stadium=createStadium();scene.add(stadium.root);

      // A solid turf material stays stable in aerial views and avoids texture moire.
      stadium.materials.grass.map=null;stadium.materials.grass.bumpMap=null;stadium.materials.grass.normalMap=null;
      stadium.materials.grass.color.set('#5b913d');stadium.materials.grass.roughness=1;stadium.materials.grass.metalness=0;stadium.materials.grass.needsUpdate=true;
      const banner=document.createElement('canvas');banner.width=1024;banner.height=160;
      const bc=banner.getContext('2d');bc.fillStyle='#111b25';bc.fillRect(0,0,1024,160);
      bc.fillStyle='#e4eef4';bc.font='600 44px Arial';bc.fillText('◈',30,99);bc.font='32px Arial';bc.fillText('Pro Soccer Online',110,97);
      bc.fillStyle='#9fbc9b';bc.font='700 23px Arial';bc.fillText('PSOBR',800,96);
      const adTexture=new THREE.CanvasTexture(banner);adTexture.colorSpace=THREE.SRGBColorSpace;adTexture.anisotropy=8;
      const adMat=new THREE.MeshStandardMaterial({map:adTexture,roughness:.8});
      stadium.root.traverse(o=>{if(o.name==='Painel PSO')o.material=adMat;});
      const ground=new THREE.Mesh(new THREE.PlaneGeometry(1800,1800),new THREE.MeshStandardMaterial({color:'#d5e1d9',roughness:1}));
      ground.rotation.x=-Math.PI/2;ground.position.y=-1.23;ground.receiveShadow=true;scene.add(ground);
      const camera=new THREE.PerspectiveCamera(42,1,.1,1500);
      const controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.dampingFactor=.075;
      controls.enablePan=false;controls.minDistance=10;controls.maxDistance=270;controls.maxPolarAngle=Math.PI/2-.015;
      controls.autoRotateSpeed=.4;controls.enableZoom=false;
      const positions={orbit:[[123,119,154],[0,0,0]],aerial:[[0,194,.1],[0,0,0]],pitch:[[0,1.8,8],[0,4,-48]],goal:[[9,5,46],[0,4,-25]]};
      let tween=null,visible=true,frame=0,last=0;
      const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
      const setView=(id,immediate=false)=>{
        const [position,target]=positions[id];controls.autoRotate=false;
        if(immediate||motion.matches){camera.position.set(...position);controls.target.set(...target);controls.update();}
        else tween={start:performance.now(),from:camera.position.clone(),targetFrom:controls.target.clone(),to:new THREE.Vector3(...position),targetTo:new THREE.Vector3(...target)};
      };
      setView('orbit',true);
      function interrupted(){tween=null;controls.autoRotate=false;setRotating(false);}
      controls.addEventListener('start',interrupted);
      // Wheel zoom only while the viewer is focused; the page remains scrollable.
      canvas.tabIndex=0;canvas.addEventListener('pointerdown',()=>canvas.focus({preventScroll:true}));
      const wheel=e=>{if(document.activeElement!==canvas)return;e.preventDefault();zoom(e.deltaY>0?1.1:.9);};
      const zoom=factor=>{tween=null;const d=camera.position.clone().sub(controls.target);d.multiplyScalar(factor).clampLength(controls.minDistance,controls.maxDistance);camera.position.copy(controls.target).add(d);controls.update();};
      canvas.addEventListener('wheel',wheel,{passive:false});
      const resize=new ResizeObserver(()=>{if(!host.current)return;const {width,height}=host.current.getBoundingClientRect();renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();});resize.observe(host.current);
      const intersection=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;});intersection.observe(host.current);
      const onLost=e=>{e.preventDefault();setError('A visualização 3D foi interrompida. Recarregue a página para tentar novamente.');};canvas.addEventListener('webglcontextlost',onLost);
      const loop=now=>{frame=requestAnimationFrame(loop);if(!visible||document.hidden)return;
        // Bound rendering on high-refresh screens, while retaining smooth controls.
        if(now-last<1000/60)return;last=now;
        if(tween){const t=Math.min(1,(now-tween.start)/1350),ease=t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
          camera.position.lerpVectors(tween.from,tween.to,ease);controls.target.lerpVectors(tween.targetFrom,tween.targetTo,ease);if(t===1)tween=null;}
        controls.update();renderer.render(scene,camera);
      };frame=requestAnimationFrame(loop);
      api.current={view:setView,roof:value=>{stadium.roof.visible=value;},rotate:value=>{tween=null;controls.autoRotate=value;},zoom};
      cleanup=()=>{api.current=null;cancelAnimationFrame(frame);resize.disconnect();intersection.disconnect();controls.dispose();canvas.removeEventListener('wheel',wheel);canvas.removeEventListener('webglcontextlost',onLost);disposeStadium(stadium.root);ground.geometry.dispose();ground.material.dispose();renderer.dispose();renderer.forceContextLoss();canvas.remove();};
      setReady(true);
    }
    start().catch(e=>{console.error('Stadium initialization failed',e);if(!disposed)setError('Não foi possível abrir o 3D neste navegador. Você ainda pode baixar o modelo abaixo.');});
    return()=>{disposed=true;cleanup();};
  },[]);
  useEffect(()=>{const fn=()=>setFullscreen(document.fullscreenElement===shell.current);document.addEventListener('fullscreenchange',fn);return()=>document.removeEventListener('fullscreenchange',fn);},[]);
  const changeView=id=>{setView(id);setRotating(false);api.current?.view(id);};
  const toggleFullscreen=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await shell.current?.requestFullscreen();}catch{setError('O modo tela cheia não está disponível neste navegador.');}};
  return <section ref={shell} className="stadium-viewer" aria-label="Explorar o estádio em 3D">
    <div className="stadium-canvas" ref={host}/>
    {!ready&&!error&&<div className="stadium-loading" role="status"><span/><p>Preparando o estádio…</p></div>}
    {error&&<div className="stadium-error" role="alert">{error}<a href="/models/psobr-stadium.glb" download>Baixar modelo 3D</a></div>}
    <div className="stadium-overlay-top"><div className="stadium-caption"><span>PSO / ESTÁDIO</span><strong>Seu próximo palco.</strong></div><button className="stadium-icon-button" onClick={toggleFullscreen} aria-label={fullscreen?'Sair da tela cheia':'Tela cheia'}>{fullscreen?<Minimize2 size={19}/>:<Maximize2 size={19}/>}</button></div>
    <div className="stadium-zoom"><button className="stadium-icon-button" disabled={!ready} aria-label="Aproximar" onClick={()=>api.current?.zoom(.82)}><Plus size={20}/></button><button className="stadium-icon-button" disabled={!ready} aria-label="Afastar" onClick={()=>api.current?.zoom(1.22)}><Minus size={20}/></button></div>
    <div className="stadium-controls">
      <div className="stadium-view-tabs" aria-label="Posição da câmera">{views.map(v=><button key={v.id} disabled={!ready} aria-pressed={view===v.id} onClick={()=>changeView(v.id)}>{v.label}</button>)}</div>
      <div className="stadium-tools"><button disabled={!ready} aria-pressed={rotating} onClick={()=>{api.current?.rotate(!rotating);setRotating(!rotating);}}>{rotating?<Pause size={16}/>:<Play size={16}/>}<span>{rotating?'Pausar':'Girar'}</span></button><button disabled={!ready} aria-pressed={!roof} onClick={()=>{api.current?.roof(!roof);setRoof(!roof);}}>{roof?<EyeOff size={16}/>:<Eye size={16}/>}<span>{roof?'Ocultar cobertura':'Mostrar cobertura'}</span></button><button disabled={!ready} onClick={()=>{changeView('orbit');api.current?.roof(true);setRoof(true);}} aria-label="Restaurar vista"><RotateCcw size={16}/></button><a href="/models/psobr-stadium.glb" download><Download size={16}/><span>Modelo .GLB</span></a></div>
    </div>
    <p className="stadium-hint">Arraste para explorar · Use + e − para aproximar</p>
  </section>;
}
