import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// Reconstruction from the supplied PSO screenshots. Units are approximate metres.
// Geometry is shared by the interactive viewer and the downloadable GLB.
export function createStadium() {
  const root = new THREE.Group();
  root.name = 'PSOBR — estádio reconstruído';
  const roof = new THREE.Group();
  roof.name = 'Cobertura';
  root.add(roof);
  const batches = new Map();
  const material = (name, color, extra = {}) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness: .78, ...extra });
    m.name = name;
    return m;
  };
  const concrete = material('Concreto azul-cinza', '#93a4b4');
  const edge = material('Concreto exterior', '#c2c1bd');
  const steel = material('Estrutura grafite', '#252b30', { metalness: .55, roughness: .4 });
  const silver = material('Alumínio', '#becbd2', { metalness: .7, roughness: .32 });
  const seatRed = material('Assentos vermelhos', '#b90920', { roughness: .44 });
  const white = material('Linhas e traves', '#f4f5ed');
  const grass = material('Gramado', '#568935');
  const apron = material('Área verde periférica', '#246e49');
  const canopy = material('Cobertura clara', '#d9dde2', { side: THREE.DoubleSide, roughness: .58 });
  const black = material('Telões e publicidade', '#111b25', { roughness: .5 });
  const lamp = material('Lentes dos refletores', '#f0f6fa', { emissive: '#bbd7ea', emissiveIntensity: .35, metalness: .25 });
  const net = material('Rede', '#dbe2dc', { transparent: true, opacity: .66 });

  function add(geometry, mat, parent = root) {
    const key = `${mat.uuid}:${parent.uuid}`;
    if (!batches.has(key)) batches.set(key, { mat, parent, geometries: [] });
    const plain = geometry.index ? geometry.toNonIndexed() : geometry;
    if (plain !== geometry) geometry.dispose();
    // Unify attributes before merging geometries from different primitives.
    plain.deleteAttribute('uv');
    batches.get(key).geometries.push(plain);
  }
  function box(x, y, z, w, h, d, mat, parent = root, rotation = 0) {
    const g = new THREE.BoxGeometry(w, h, d);
    g.rotateY(rotation); g.translate(x, y, z); add(g, mat, parent);
  }
  function rod(a, b, radius, mat, parent = root, segments = 8) {
    const from = new THREE.Vector3(...a), to = new THREE.Vector3(...b);
    const delta = to.clone().sub(from);
    const g = new THREE.CylinderGeometry(radius, radius, delta.length(), segments);
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.normalize()));
    g.translate(...from.add(to).multiplyScalar(.5).toArray()); add(g, mat, parent);
  }
  function roundedShape(w, l, r) {
    const s = new THREE.Shape();
    s.moveTo(-w / 2 + r, -l / 2);
    s.lineTo(w / 2 - r, -l / 2); s.quadraticCurveTo(w / 2, -l / 2, w / 2, -l / 2 + r);
    s.lineTo(w / 2, l / 2 - r); s.quadraticCurveTo(w / 2, l / 2, w / 2 - r, l / 2);
    s.lineTo(-w / 2 + r, l / 2); s.quadraticCurveTo(-w / 2, l / 2, -w / 2, l / 2 - r);
    s.lineTo(-w / 2, -l / 2 + r); s.quadraticCurveTo(-w / 2, -l / 2, -w / 2 + r, -l / 2);
    return s;
  }
  function slab(w, l, r, y, depth, mat) {
    const g = new THREE.ExtrudeGeometry(roundedShape(w, l, r), { depth, bevelEnabled: false, curveSegments: 12 });
    g.rotateX(-Math.PI / 2); g.translate(0, y, 0); add(g, mat);
  }
  slab(99, 137, 23, -1.2, .9, edge);
  slab(96, 134, 22, -.3, .25, concrete);
  slab(74, 110, 12, -.05, .07, apron);
  const pitch = new THREE.Mesh(new THREE.PlaneGeometry(60, 96), grass);
  pitch.name = 'Gramado 60 × 96'; pitch.rotation.x = -Math.PI / 2;
  // The large pitch plane must not sample the directional shadow map: at aerial
  // distances its near-coplanar samples produce the horizontal "shadow acne" bands.
  // Keep a generous gap above the apron to prevent distant z-fighting bands.
  pitch.position.y = .14; pitch.receiveShadow = false; root.add(pitch);

  const line = (x1, z1, x2, z2, width = .12) => {
    const dx = x2 - x1, dz = z2 - z1;
    box((x1+x2)/2, .185, (z1+z2)/2, width, .018, Math.hypot(dx,dz), white, root, Math.atan2(dx,dz));
  };
  function fieldArc(x, z, radius, start = 0, length = Math.PI * 2) {
    const g = new THREE.RingGeometry(radius-.065, radius+.065, 100, 1, start, length);
    g.rotateX(-Math.PI/2); g.translate(x,.195,z); add(g,white);
  }
  const rect = (x1,z1,x2,z2) => { line(x1,z1,x2,z1); line(x2,z1,x2,z2); line(x2,z2,x1,z2); line(x1,z2,x1,z1); };
  rect(-30,-48,30,48); line(-30,0,30,0); fieldArc(0,0,7.1);
  const spot = (z) => { const g=new THREE.CircleGeometry(.17,16); g.rotateX(-Math.PI/2);g.translate(0,.198,z);add(g,white); };
  spot(0);
  for (const sign of [-1,1]) {
    rect(-15,sign*48,15,sign*34); rect(-6.5,sign*48,6.5,sign*43);
    spot(sign*38);
    // Penalty arcs only outside the penalty area, not complete circles.
    const angle = Math.asin(4/7.1);
    fieldArc(0,sign*38,7.1,sign===1?angle:Math.PI+angle,Math.PI-2*angle);
    for (const x of [-30,30]) {
      fieldArc(x,sign*48,.8,x<0?(sign<0?Math.PI*1.5:0):(sign<0?Math.PI:Math.PI/2),Math.PI/2);
      rod([x,0,sign*48],[x,1.7,sign*48],.035,white);
      box(x+.18,1.5,sign*48,.35,.25,.025,sign<0?seatRed:material(`Bandeirinha ${x}`, '#2157b1'));
    }
  }

  // White goal frames with separate side, back and top net strands.
  for(const sign of [-1,1]) {
    const front=sign*48, back=sign*50.5, h=2.44, hw=3.66;
    rod([-hw,0,front],[-hw,h,front],.065,white,root,12);
    rod([hw,0,front],[hw,h,front],.065,white,root,12);
    rod([-hw,h,front],[hw,h,front],.065,white,root,12);
    for(const x of [-hw,hw]) {
      rod([x,0,back],[x,h,front],.033,silver);
      rod([x,0,back],[x,0,front],.033,silver);
    }
    rod([-hw,.08,back],[hw,.08,back],.025,silver);
    for(let x=-hw;x<=hw+.01;x+=.21) {
      rod([x,.06,back],[x,h,back],.008,net,root,4);
      rod([x,h,back],[x,h,front],.008,net,root,4);
    }
    for(let y=.1;y<h;y+=.2) {
      rod([-hw,y,back],[hw,y,back],.008,net,root,4);
      for(const x of [-hw,hw]) rod([x,y,front],[x,y,back],.008,net,root,4);
    }
    for(let z=0;z<=2.5;z+=.2) {
      rod([-hw,h,front+sign*z],[hw,h,front+sign*z],.008,net,root,4);
      for(const x of [-hw,hw]) rod([x,.05,front+sign*z],[x,h,front+sign*z],.008,net,root,4);
    }
  }

  const seatBase = new THREE.BoxGeometry(.48,.12,.46);
  const seatBack = new THREE.BoxGeometry(.48,.43,.1);
  function stand(cx,cz,angle,length,tunnel=false) {
    const point=(x,y,z)=>[cx+x*Math.cos(angle)+z*Math.sin(angle),y,cz-x*Math.sin(angle)+z*Math.cos(angle)];
    const block=(x,y,z,w,h,d,mat)=>box(...point(x,y,z),w,h,d,mat,root,angle);
    const beam=(a,b,r=.025)=>rod(point(...a),point(...b),r,silver);
    const count=Math.floor(length/.68);
    for(let row=0;row<8;row++) {
      const y=.5+row*.47, z=-row*.91;
      if(tunnel && row<5) {
        block(-(length/4+1.4),y/2,z,length/2-2.8,y,.91,concrete);
        block(length/4+1.4,y/2,z,length/2-2.8,y,.91,concrete);
      } else block(0,y/2,z,length,y,.91,concrete);
      for(let i=0;i<count;i++) {
        const x=(i-(count-1)/2)*.68;
        if(i%20<2 || (tunnel && Math.abs(x)<3.3)) continue;
        for(const [base,dy,dz] of [[seatBase,.26,0],[seatBack,.52,-.2]]) {
          const g=base.clone();g.translate(x,y+dy,z+dz);g.rotateY(angle);g.translate(cx,0,cz);add(g,seatRed);
        }
        // Seat supports are merged into one draw call.
        block(x,y+.12,z,.065,.25,.065,steel);
      }
    }
    block(0,2.4,-8.15,length,4.8,.28,concrete);
    for(let i=0;i<count;i+=20) {
      const x=(i-(count-1)/2)*.68+.34;
      for(let step=0;step<16;step++) block(x,.16+step*.235,-step*.455,.92,.13,.455,edge);
      for(const side of [-.5,.5]) {
        beam([x+side,1.2,.2],[x+side,4.95,-7.1]);
        for(let j=0;j<4;j++) beam([x+side,.4+j*.94,-j*1.82],[x+side,1.25+j*.94,-j*1.82]);
      }
    }
    for(let x=-length/2;x<length/2;x+=4) beam([x,4.2,-7.6],[x,5.4,-7.6]);
    beam([-length/2,5.4,-7.6],[length/2,5.4,-7.6]);
    beam([-length/2,4.85,-7.6],[length/2,4.85,-7.6]);
    // Perimeter advertising, with lettering added by the web viewer.
    for(let x=-length/2+2.7;x<length/2-1;x+=5.7) {
      if(tunnel && Math.abs(x)<4) continue;
      block(x,.55,1.75,5.35,.95,.14,black);
      const panel=new THREE.Mesh(new THREE.PlaneGeometry(5.15,.78),black);
      panel.name='Painel PSO';panel.position.set(...point(x,.57,1.83));panel.rotation.y=angle;root.add(panel);
    }
    if(tunnel) {
      block(-2.8,1.15,-2.6,.4,2.3,4,edge);block(2.8,1.15,-2.6,.4,2.3,4,edge);
      block(0,2.55,-2.6,6,.8,4,edge);block(0,1.2,-5.5,5.2,2.4,.1,black);
    }
  }
  stand(0,-55,0,58); stand(0,55,Math.PI,58);
  stand(-37,0,Math.PI/2,94,true);stand(37,0,-Math.PI/2,94);
  seatBase.dispose();seatBack.dispose();

  // Matched rounded-rectangle contours form a continuous barrel-curved canopy.
  function contour(offset) {
    const hx=36+offset,hz=55+offset,r=8+offset, p=[];
    const corners=[[hx-r,-hz+r,-Math.PI/2], [hx-r,hz-r,0],[-hx+r,hz-r,Math.PI/2],[-hx+r,-hz+r,Math.PI]];
    for(let c=0;c<4;c++) {
      const [x,z,a]=corners[c];
      for(let j=0;j<=12;j++) {const t=a+j/12*Math.PI/2;p.push([x+r*Math.cos(t),z+r*Math.sin(t)]);}
      const end=p[p.length-1],next=corners[(c+1)%4], target=[next[0]+r*Math.cos(next[2]),next[1]+r*Math.sin(next[2])];
      const steps=c%2===0?24:16;
      for(let j=1;j<steps;j++) p.push([THREE.MathUtils.lerp(end[0],target[0],j/steps),THREE.MathUtils.lerp(end[1],target[1],j/steps)]);
    }
    return p;
  }
  const n=contour(0).length, vertices=[], indices=[];
  const roofHeight=t=>6.9+3.2*Math.sin(t*Math.PI/2);
  for(let j=0;j<=12;j++) for(const [x,z] of contour(j/12*13)) vertices.push(x,roofHeight(j/12),z);
  for(let j=0;j<12;j++) for(let i=0;i<n;i++) {
    const a=j*n+i,b=j*n+(i+1)%n,c=(j+1)*n+i,d=(j+1)*n+(i+1)%n;
    indices.push(a,c,b,b,c,d);
  }
  const roofGeo=new THREE.BufferGeometry();roofGeo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));roofGeo.setIndex(indices);roofGeo.computeVertexNormals();add(roofGeo,canopy,roof);
  for(let i=0;i<n;i+=5) {
    let prev=null;
    for(let j=0;j<=12;j++) {
      const [x,z]=contour(j/12*13)[i],p=[x,roofHeight(j/12)+.055,z];
      if(prev)rod(prev,p,.055,steel,roof);prev=p;
    }
    const [x,z]=contour(8)[i];rod([x,3.7,z],[x,9.4,z],.085,steel,roof);
  }
  for(const offset of [0,13]) {
    const c=contour(offset),y=roofHeight(offset/13);
    for(let i=0;i<n;i++) rod([c[i][0],y,c[i][1]],[c[(i+1)%n][0],y,c[(i+1)%n][1]],.11,steel,roof);
  }
  // Exterior curved perimeter and corner concrete retaining walls.
  for(const [offset,height,mat] of [[12.7,4.8,edge],[.8,1.1,concrete]]) {
    const c=contour(offset);
    for(let i=0;i<n;i++) {
      const a=c[i],b=c[(i+1)%n];
      box((a[0]+b[0])/2,height/2,(a[1]+b[1])/2,.27,height,Math.hypot(a[0]-b[0],a[1]-b[1])+.04,mat,root,Math.atan2(b[0]-a[0],b[1]-a[1]));
    }
  }

  for(const [x,z] of [[-43,-61],[0,-67],[43,-61],[-49,0],[49,0],[-43,61],[0,67],[43,61]]) {
    const g=new THREE.CylinderGeometry(.34,.6,12,12);g.translate(x,6,z);add(g,steel);
    rod([x,12,z],[x,28,z],.18,silver,root,12);
    const angle=Math.atan2(-x,-z);
    box(x,28,z,6.7,2.9,.18,steel,root,angle);
    for(let row=0;row<3;row++)for(let col=0;col<8;col++) {
      const lx=(col-3.5)*.8,ly=27+(row*.88);
      const g=new THREE.CylinderGeometry(.32,.26,.35,12);
      g.rotateX(Math.PI/2);g.translate(lx,ly,.25);g.rotateY(angle);g.translate(x,0,z);add(g,silver);
      const lens=new THREE.CircleGeometry(.265,12);lens.translate(lx,ly,.44);lens.rotateY(angle);lens.translate(x,0,z);add(lens,lamp);
    }
  }
  for(const x of [-32,32])for(const z of [-51,51]) {
    const angle=Math.atan2(-x,-z);
    box(x,5.2,z,7.5,4.1,.32,black,root,angle);
    for(const side of [-2.8,2.8]) rod([x+side*Math.cos(angle),1.1,z-side*Math.sin(angle)],[x+side*Math.cos(angle),5,z-side*Math.sin(angle)],.095,steel);
  }
  // Covered substitutes' benches on the tunnel side.
  for(const z of [-12,12]) {
    box(-34.4,.3,z,1.7,.5,7,concrete);
    box(-34.4,.7,z,1,.2,6.6,seatRed);
    box(-35.1,1.2,z,.08,2.1,7,silver);
    box(-34.3,2.3,z,1.8,.12,7.2,silver);
    for(const dz of [-3.5,3.5])rod([-33.5,0,z+dz],[-33.5,2.3,z+dz],.06,silver);
  }
  for(const {mat,parent,geometries} of batches.values()) {
    const g=mergeGeometries(geometries,false);
    const mesh=new THREE.Mesh(g,mat);mesh.name=mat.name;mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);
    for(const geo of geometries)geo.dispose();
  }
  root.userData={reference:'Recriação visual a partir de capturas fornecidas pelo usuário; não é o asset original do jogo.',units:'metres',pitch:[60,96]};
  return {root,roof,pitch,materials:{grass,concrete,canopy,lamp}};
}

export function disposeStadium(root) {
  const geometries=new Set(),materials=new Set(),textures=new Set();
  root.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m);});
  for(const m of materials){for(const v of Object.values(m))if(v?.isTexture)textures.add(v);m.dispose();}
  for(const g of geometries)g.dispose();for(const t of textures)t.dispose();
}
