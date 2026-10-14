import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { Box3, Vector3 } from 'three';
import { createAwardsStage, disposeAwardsStage } from '../lib/awards-stage-model.js';

globalThis.FileReader = class {
  readAsArrayBuffer(blob) { blob.arrayBuffer().then(buffer => { this.result = buffer; this.onloadend?.(); }); }
  readAsDataURL(blob) { blob.arrayBuffer().then(buffer => { this.result = `data:${blob.type};base64,${Buffer.from(buffer).toString('base64')}`; this.onloadend?.(); }); }
};
const font = new FontLoader().parse(JSON.parse(await readFile(new URL('../node_modules/three/examples/fonts/droid/droid_sans_bold.typeface.json', import.meta.url), 'utf8')));
const { root, trophy } = createAwardsStage({ font });
const out = new URL('../public/models/', import.meta.url);
await mkdir(out, { recursive: true });
async function exportModel(object, filename) {
  object.updateMatrixWorld(true);
  const binary = await new GLTFExporter().parseAsync(object, { binary: true });
  await writeFile(new URL(filename, out), Buffer.from(binary));
  let meshes = 0, triangles = 0;
  object.traverse(o => { if (o.isMesh) { meshes++; triangles += (o.geometry.index?.count ?? o.geometry.attributes.position.count) / 3; } });
  const bounds = new Box3().setFromObject(object);
  return { file: filename, bytes: binary.byteLength, meshes, triangles, size: bounds.getSize(new Vector3()).toArray(), min: bounds.min.toArray(), max: bounds.max.toArray() };
}
const stageStats = await exportModel(root, 'psobr-awards-stage.glb');
const isolated = trophy.clone(true); isolated.position.set(0, 0, 0);
const trophyStats = await exportModel(isolated, 'psobr-trophy.glb');
const report = { source: 'Visual reconstruction from supplied screenshots. Dimensions are estimates.', units: 'metres', up: '+Y', front: '+Z', models: [stageStats, trophyStats] };
await writeFile(new URL('psobr-awards-stage.json', out), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
disposeAwardsStage(root);
