import * as THREE from 'three';

export const BALL_RADIUS = .18;
export const BALL_FLOOR = .14 + BALL_RADIUS;

// Truncate an icosahedron into the classic twelve pentagons and twenty hexagons.
// Project subdivided panels onto a sphere; small gaps form recessed seams.
export function createFootball() {
  const ball = new THREE.Group();
  const coreMaterial = new THREE.MeshStandardMaterial({color:'#343733', roughness:.85});
  const core = new THREE.Mesh(new THREE.SphereGeometry(BALL_RADIUS*.995,48,32),coreMaterial);
  ball.add(core);
  const white = new THREE.MeshPhysicalMaterial({color:'#f5f4ed',roughness:.48,clearcoat:.12,clearcoatRoughness:.65});
  const black = new THREE.MeshPhysicalMaterial({color:'#151918',roughness:.53,clearcoat:.12,clearcoatRoughness:.65});
  const ico = new THREE.IcosahedronGeometry(1,0);
  const vertices=[], faces=[];
  const attribute=ico.getAttribute('position');
  for(let i=0;i<attribute.count;i+=3){
    const face=[];
    for(let j=0;j<3;j++){
      const p=new THREE.Vector3().fromBufferAttribute(attribute,i+j).normalize();
      let index=vertices.findIndex(v=>v.distanceToSquared(p)<1e-8);
      if(index<0){index=vertices.length;vertices.push(p);}
      face.push(index);
    }
    faces.push(face);
  }
  ico.dispose();
  const edge=(a,b)=>vertices[a].clone().multiplyScalar(2/3).addScaledVector(vertices[b],1/3).normalize();
  const panels=faces.map(([a,b,c])=>({points:[edge(a,b),edge(b,a),edge(b,c),edge(c,b),edge(c,a),edge(a,c)],material:white}));
  vertices.forEach((normal,index)=>{
    const neighbors=new Set();
    faces.filter(f=>f.includes(index)).forEach(f=>f.forEach(i=>{if(i!==index)neighbors.add(i);}));
    const axis=new THREE.Vector3().crossVectors(normal,new THREE.Vector3(0,1,0)).normalize();
    if(axis.lengthSq()<.01)axis.set(1,0,0);
    const up=new THREE.Vector3().crossVectors(normal,axis);
    const points=[...neighbors].map(i=>edge(index,i)).sort((a,b)=>Math.atan2(a.dot(up),a.dot(axis))-Math.atan2(b.dot(up),b.dot(axis)));
    panels.push({points,material:black});
  });
  panels.forEach(({points,material})=>{
    const center=points.reduce((sum,p)=>sum.add(p),new THREE.Vector3()).normalize();
    const inset=points.map(p=>p.clone().lerp(center,.025).normalize());
    const data=[];
    function triangle(a,b,c,depth){
      if(depth){const ab=a.clone().add(b).normalize(),bc=b.clone().add(c).normalize(),ca=c.clone().add(a).normalize();triangle(a,ab,ca,depth-1);triangle(ab,b,bc,depth-1);triangle(ca,bc,c,depth-1);triangle(ab,bc,ca,depth-1);return;}
      if(new THREE.Vector3().subVectors(b,a).cross(new THREE.Vector3().subVectors(c,a)).dot(a)<0)[b,c]=[c,b];
      for(const p of [a,b,c])data.push(p.x*BALL_RADIUS,p.y*BALL_RADIUS,p.z*BALL_RADIUS);
    }
    inset.forEach((p,i)=>triangle(center,p,inset[(i+1)%inset.length],3));
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(data,3));
    geometry.setAttribute('normal',new THREE.Float32BufferAttribute(data.map(v=>v/BALL_RADIUS),3));
    ball.add(new THREE.Mesh(geometry,material));
  });
  return {ball,dispose(){ball.traverse(o=>o.geometry?.dispose());coreMaterial.dispose();white.dispose();black.dispose();}};
}
