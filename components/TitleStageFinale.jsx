"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDown } from "lucide-react";
import { createTitleCelebration } from "@/lib/title-celebration.js";
import RippleGrid from "@/components/RippleGrid";
import "./title-stage-finale.css";

export default function TitleStageFinale() {
  const section = useRef(null);
  const host = useRef(null);
  const [ready, setReady] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [finale, setFinale] = useState(false);

  useEffect(() => {
    let disposed = false;
    let cleanup = () => {};

    async function start() {
      const THREE = await import("three");
      const { GLTFLoader } = await import("three/addons/loaders/GLTFLoader.js");
      if (disposed || !host.current || !section.current) return;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.08;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      const canvas = renderer.domElement;
      canvas.setAttribute("aria-label", "Palco 3D comemorativo do título PSOBR");
      host.current.appendChild(canvas);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 120);
      camera.position.set(16, 8.5, 25);
      camera.lookAt(0, 2.3, 0);

      const ambient = new THREE.HemisphereLight("#eaffd5", "#10261c", 1.45);
      const key = new THREE.DirectionalLight("#fff1c4", 4.2);
      key.position.set(-8, 13, 10);
      key.castShadow = true;
      key.shadow.mapSize.set(1536, 1536);
      const rim = new THREE.PointLight("#baf35f", 18, 28, 2);
      rim.position.set(7, 5, -2);
      scene.add(ambient, key, rim);

      const floor = new THREE.Mesh(
        new THREE.CircleGeometry(23, 96),
        new THREE.MeshStandardMaterial({ color: "#10281d", roughness: 0.92, metalness: 0.04 })
      );
      floor.rotation.x = -Math.PI / 2;
      floor.position.y = -0.03;
      floor.receiveShadow = true;
      scene.add(floor);

      const loader = new GLTFLoader();
      const gltf = await loader.loadAsync("/models/psobr-awards-stage.glb");
      if (disposed) return;
      const model = gltf.scene;
      model.traverse((object) => {
        if (!object.isMesh) return;
        object.castShadow = true;
        object.receiveShadow = true;
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => {
          if (material?.name === "Stage_Blue") material.color.set("#285d3c");
          if (material?.name === "Structure_Navy") material.color.set("#102a1d");
        });
      });
      scene.add(model);

      const celebration = createTitleCelebration(scene);
      const clock = new THREE.Clock();
      const target = new THREE.Vector3(0, 2.2, 0);
      let frame = 0;
      let visible = false;
      let targetProgress = 0;
      let progress = 0;
      let triggered = false;
      let finishTimer = 0;
      let finaleVisible = false;

      const play = () => {
        if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
          setCelebrating(true);
          clearTimeout(finishTimer);
          finishTimer = window.setTimeout(() => setCelebrating(false), 3500);
          return;
        }
        celebration.start();
        setCelebrating(true);
      };

      const resize = new ResizeObserver(() => {
        if (!host.current) return;
        const rect = host.current.getBoundingClientRect();
        renderer.setSize(rect.width, rect.height, false);
        camera.aspect = rect.width / Math.max(1, rect.height);
        camera.updateProjectionMatrix();
      });
      resize.observe(host.current);

      const observer = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
      }, { rootMargin: "100px 0px" });
      observer.observe(section.current);

      const onScroll = () => {
        if (!section.current) return;
        const rect = section.current.getBoundingClientRect();
        const distance = Math.max(1, section.current.offsetHeight - innerHeight);
        targetProgress = Math.min(1, Math.max(0, -rect.top / distance));
      };
      addEventListener("scroll", onScroll, { passive: true });
      onScroll();

      function loop() {
        frame = requestAnimationFrame(loop);
        if (!visible || document.hidden) { clock.getDelta(); return; }
        const dt = Math.min(clock.getDelta(), 0.04);
        progress += (targetProgress - progress) * 0.075;
        const reveal = THREE.MathUtils.smoothstep(progress, 0.04, 0.5);
        section.current?.style.setProperty("--reveal", reveal.toFixed(3));
        section.current?.style.setProperty("--journey", progress.toFixed(3));

        const firstLeg = THREE.MathUtils.smoothstep(progress, 0.08, 0.62);
        const frontLeg = THREE.MathUtils.smoothstep(progress, 0.58, 0.94);
        const sideEye = new THREE.Vector3(18, 9.5, 34);
        const frontEye = new THREE.Vector3(0, 5.2, 24);
        camera.position.set(0, 12, 48).lerp(sideEye, firstLeg).lerp(frontEye, frontLeg);
        target.set(0, THREE.MathUtils.lerp(1.6, 2.25, firstLeg), 0);
        camera.lookAt(target);
        model.position.y = THREE.MathUtils.lerp(-1.25, 0, reveal);
        model.rotation.y = THREE.MathUtils.lerp(-0.22, 0, frontLeg);

        const shouldShowFinale = progress > 0.72;
        if (shouldShowFinale !== finaleVisible) {
          finaleVisible = shouldShowFinale;
          setFinale(shouldShowFinale);
        }
        if (progress > 0.86 && !triggered) {
          triggered = true;
          play();
        }
        const wasActive = celebration.active;
        const intensity = celebration.update(dt);
        rim.intensity = 14 + intensity * 16;
        renderer.toneMappingExposure = 1.02 + intensity * 0.12;
        if (wasActive && !celebration.active) setCelebrating(false);
        renderer.render(scene, camera);
      }

      setReady(true);
      frame = requestAnimationFrame(loop);
      cleanup = () => {
        clearTimeout(finishTimer);
        cancelAnimationFrame(frame);
        removeEventListener("scroll", onScroll);
        resize.disconnect();
        observer.disconnect();
        celebration.dispose();
        scene.traverse((object) => {
          if (!object.isMesh) return;
          object.geometry?.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => material?.dispose?.());
        });
        renderer.dispose();
        renderer.forceContextLoss();
        canvas.remove();
      };
    }

    start().catch((error) => console.error("Title stage finale failed", error));
    return () => { disposed = true; cleanup(); };
  }, []);

  return (
    <section ref={section} className={`title-finale ${finale ? "is-finale" : ""} ${celebrating ? "is-celebrating" : ""}`} aria-label="Celebração do título">
      <div className="title-finale-stage">
       <div className="title-finale-grid" aria-hidden="true">
        <RippleGrid
          enableRainbow={false}
          gridColor="#91d65e"
          rippleIntensity={0.055}
          gridSize={14}
          gridThickness={16}
          mouseInteraction
          mouseInteractionRadius={0.9}
          opacity={0.55}
          fadeDistance={1.9}
          vignetteStrength={2.4}
          glowIntensity={0.16}
          gridRotation={0}
        />
      </div>
      <div ref={host} className="title-finale-canvas" />
      {!ready && <div className="title-finale-loading">Preparando a premiação…</div>}
      <div className="title-finale-vignette" />
      <div className="title-finale-curtain" aria-hidden="true" />
      <div className="title-finale-copy">
        <p>O TOPO É NOSSO</p>
        <h2>É CAMPEÃO!</h2>
        <small>Todo time entra em campo. Só um termina no palco.</small>
      </div>
      <div className="title-finale-scroll"><ArrowDown size={14}/><span>Role para revelar</span></div>
      <div className="title-finale-footer"><span>PSO Draft Arena</span><span>Temporada 01</span><span>Fim de jogo · 7–0</span></div>
      </div>
    </section>
  );
}
