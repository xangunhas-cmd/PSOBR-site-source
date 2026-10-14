import * as THREE from 'three';

/** Reusable, bounded 3D celebration. Call start(), update(dt), then dispose(). */
export function createTitleCelebration(scene) {
  const root = new THREE.Group(); root.name = 'Title_Celebration'; scene.add(root);
  const colors = ['#ffe29a', '#b9f66b', '#fff8db', '#53d692'];
  const bursts = [];
  const confettiCount = 720;
  const confetti = new THREE.InstancedMesh(new THREE.PlaneGeometry(.11, .2), new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, roughness: .38, metalness: .25 }), confettiCount);
  confetti.instanceMatrix.setUsage(THREE.DynamicDrawUsage); confetti.frustumCulled = false;
  root.add(confetti); root.visible = false;
  const dummy = new THREE.Object3D();
  const pieces = [];
  let time = 0, nextBurst = 0, active = false;
  const schedule = [0, .45, .95, 1.5, 2.05, 2.7, 3.3, 3.9, 4.45, 5.05, 5.6, 6.1];
  const flash = new THREE.PointLight('#ffe0a0', 0, 22, 2); flash.position.set(0, 7, 0); root.add(flash);
  function clearBursts() { for (const b of bursts) { root.remove(b.mesh); b.mesh.geometry.dispose(); b.mesh.material.dispose(); } bursts.length = 0; }
  function burst(index) {
    const count = 160;
    const positions = new Float32Array(count * 3), tint = new Float32Array(count * 3);
    const origin = new THREE.Vector3(index % 2 ? 5 : -5, 6 + Math.random() * 2.4, -2.6 + Math.random());
    if (index >= 9) origin.x = (index - 10) * 5;
    const velocities = [];
    const base = new THREE.Color(colors[index % colors.length]);
    for (let i = 0; i < count; i++) {
      origin.toArray(positions, i * 3);
      const direction = new THREE.Vector3().randomDirection().multiplyScalar(1.8 + Math.random() * 2.5);
      velocities.push(direction);
      base.clone().lerp(new THREE.Color('#ffffff'), Math.random() * .3).toArray(tint, i * 3);
    }
    const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3)); geometry.setAttribute('color', new THREE.BufferAttribute(tint, 3));
    const material = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, vertexColors: true,
      uniforms: { fade: { value: 1 } },
      vertexShader: 'varying vec3 tint; void main(){tint=color;vec4 p=modelViewMatrix*vec4(position,1.);gl_PointSize=clamp(95./max(1.,-p.z),2.,10.);gl_Position=projectionMatrix*p;}',
      fragmentShader: 'uniform float fade; varying vec3 tint; void main(){float d=length(gl_PointCoord-.5);float a=(1.-smoothstep(.08,.5,d))*fade;gl_FragColor=vec4(tint,a);}',
    });
    const mesh = new THREE.Points(geometry, material); mesh.frustumCulled = false; root.add(mesh);
    bursts.push({ mesh, velocities, age: 0 }); flash.intensity = 30;
  }
  function start() {
    clearBursts(); time = 0; nextBurst = 0; active = true; root.visible = true; pieces.length = 0;
    for (let i = 0; i < confettiCount; i++) {
      const side = i % 2 ? 1 : -1;
      const p = { position: new THREE.Vector3(side * 7, .65, .5), velocity: new THREE.Vector3(-side * (1.5 + Math.random() * 4), 7 + Math.random() * 6, (Math.random() - .5) * 5), rotation: new THREE.Euler(Math.random() * 6, Math.random() * 6, Math.random() * 6), spin: new THREE.Vector3(Math.random() * 8 - 4, Math.random() * 8 - 4, Math.random() * 8 - 4), delay: Math.random() * 2.7 };
      pieces.push(p); confetti.setColorAt(i, new THREE.Color(colors[i % colors.length]));
      dummy.position.copy(p.position); dummy.scale.setScalar(0); dummy.updateMatrix(); confetti.setMatrixAt(i, dummy.matrix);
    }
    confetti.instanceMatrix.needsUpdate = true; confetti.instanceColor.needsUpdate = true;
  }
  function update(dt) {
    if (!active) return 0;
    dt = Math.min(dt, .04); time += dt;
    while (nextBurst < schedule.length && time >= schedule[nextBurst]) burst(nextBurst++);
    flash.intensity *= Math.exp(-dt * 9);
    for (let i = bursts.length - 1; i >= 0; i--) {
      const b = bursts[i]; b.age += dt;
      if (b.age > 2.5) { root.remove(b.mesh); b.mesh.geometry.dispose(); b.mesh.material.dispose(); bursts.splice(i, 1); continue; }
      const pos = b.mesh.geometry.attributes.position;
      b.velocities.forEach((v, j) => { v.multiplyScalar(Math.exp(-dt * .5)); v.y -= dt * 1.25; pos.setXYZ(j, pos.getX(j) + v.x * dt, pos.getY(j) + v.y * dt, pos.getZ(j) + v.z * dt); });
      pos.needsUpdate = true; b.mesh.material.uniforms.fade.value = Math.pow(1 - b.age / 2.5, 1.5);
    }
    pieces.forEach((p, i) => {
      const started = time >= p.delay;
      if (started) {
        p.velocity.x *= Math.exp(-dt * .5); p.velocity.z *= Math.exp(-dt * .35); p.velocity.y = Math.max(-1.6, p.velocity.y - dt * 4.6);
        p.position.addScaledVector(p.velocity, dt); p.position.x += Math.sin(time * 3 + i) * dt * .22;
        p.rotation.x += p.spin.x * dt; p.rotation.y += p.spin.y * dt; p.rotation.z += p.spin.z * dt;
      }
      dummy.position.copy(p.position); dummy.rotation.copy(p.rotation);
      dummy.scale.setScalar(started && p.position.y > .6 ? Math.min(1, (10 - time) / 1.2) : 0); dummy.updateMatrix(); confetti.setMatrixAt(i, dummy.matrix);
    });
    confetti.instanceMatrix.needsUpdate = true;
    if (time >= 10) { active = false; root.visible = false; clearBursts(); return 0; }
    return Math.min(1, time / .8, (10 - time) / 1.5);
  }
  function dispose() { active = false; clearBursts(); confetti.geometry.dispose(); confetti.material.dispose(); confetti.dispose(); scene.remove(root); }
  return { start, update, dispose, get active() { return active; } };
}
