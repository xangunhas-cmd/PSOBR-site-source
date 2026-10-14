import { writeFile, mkdir } from 'node:fs/promises';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { createStadium, disposeStadium } from '../lib/stadium-model.js';

// GLTFExporter uses the browser FileReader API even for geometry-only binaries.
globalThis.FileReader=class {
  readAsArrayBuffer(blob){blob.arrayBuffer().then(buffer=>{this.result=buffer;this.onloadend?.();});}
  readAsDataURL(blob){blob.arrayBuffer().then(buffer=>{this.result=`data:${blob.type};base64,${Buffer.from(buffer).toString('base64')}`;this.onloadend?.();});}
};
const {root}=createStadium();
root.updateMatrixWorld(true);
const binary=await new GLTFExporter().parseAsync(root,{binary:true});
await mkdir(new URL('../public/models/',import.meta.url),{recursive:true});
await writeFile(new URL('../public/models/psobr-stadium.glb',import.meta.url),Buffer.from(binary));
let triangles=0,meshes=0;
root.traverse(o=>{if(o.isMesh){meshes++;triangles+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3;}});
console.log(JSON.stringify({bytes:binary.byteLength,meshes,triangles,path:'public/models/psobr-stadium.glb'}));
disposeStadium(root);
