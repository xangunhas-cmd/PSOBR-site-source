import * as THREE from 'three';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

/** Visual reconstruction of the supplied PSO award-stage screenshots.
 * Approximate metres, Y up, front +Z; all geometry rests on Y=0.
 * A parsed Three.js Font is optional; pass it to include editable 3D lettering.
 */
export function createAwardsStage({
  font,
  teamName = 'NOME DO TIME',
  competitionName = 'NOME DA COMPETIÇÃO',
  colors = {},
} = {}) {
  const palette = {
    stage: '#202f83', structure: '#1c1c39', edge: '#c6d0db',
    gold: '#d5b94e', pedestal: '#10151e', lettering: '#f5f5f0', ...colors,
  };
  const root = new THREE.Group();
  root.name = 'PSOBR_AwardsStage';
  root.userData = { units: 'metres (estimated)', front: '+Z', source: 'Reconstructed from eight user-provided PSO screenshots; not an extracted game asset.' };
  const materials = {};
  const material = (name, color, roughness, metalness = 0) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness });
    m.name = name; materials[name] = m; return m;
  };
  const blue = material('Stage_Blue', palette.stage, .69);
  const navy = material('Structure_Navy', palette.structure, .5);
  const silver = material('Perimeter_Silver', palette.edge, .29, .65);
  const gold = material('Trophy_Gold', palette.gold, .23, .83);
  const black = material('Pedestal_Graphite', palette.pedestal, .36, .18);
  const letters = material('Lettering_White', palette.lettering, .58);
  function group(name, parent = root) { const g = new THREE.Group(); g.name = name; parent.add(g); return g; }
  function mesh(name, geometry, mat, parent, position = [0, 0, 0]) {
    const m = new THREE.Mesh(geometry, mat); m.name = name;
    m.position.set(...position); m.castShadow = true; m.receiveShadow = true;
    parent.add(m); return m;
  }
  function box(name, size, position, mat, parent) {
    return mesh(name, new THREE.BoxGeometry(...size), mat, parent, position);
  }
  function oval(name, rx, rz, height, y, mat, parent) {
    const g = new THREE.CylinderGeometry(1, 1, height, 128);
    g.scale(rx, 1, rz); return mesh(name, g, mat, parent, [0, y, 0]);
  }
  function plate(name, shape, depth, mat, parent, position) {
    const g = new THREE.ExtrudeGeometry(shape, {
      depth, bevelEnabled: true, bevelSegments: 2, steps: 1,
      bevelSize: .018, bevelThickness: .018, curveSegments: 40,
    });
    g.translate(0, 0, -depth / 2);
    return mesh(name, g, mat, parent, position);
  }
  function label(name, text, width, height, position, parent) {
    if (!font || !text) return;
    const g = new TextGeometry(text, { font, size: height, depth: .007, curveSegments: 6, bevelEnabled: false });
    g.computeBoundingBox();
    const bounds = g.boundingBox, size = new THREE.Vector3(); bounds.getSize(size);
    const scale = Math.min(1, width / Math.max(size.x, .001));
    g.translate(-(bounds.min.x + bounds.max.x) / 2, -(bounds.min.y + bounds.max.y) / 2, 0);
    g.scale(scale, scale, 1);
    const m = mesh(name, g, letters, parent, position); m.userData.text = text;
    return m;
  }

  const platform = group('Platform');
  oval('Oval_Foundation', 8, 3.5, .27, .135, navy, platform);
  oval('Oval_Silver_Fascia', 8.04, 3.54, .22, .38, silver, platform);
  oval('Oval_Blue_Deck', 7.94, 3.44, .1, .51, blue, platform);
  // A distinct narrow rim above the fascia, without overlapping coplanar faces.
  const rimShape = new THREE.Shape(); rimShape.absellipse(0, 0, 8.04, 3.54, 0, Math.PI * 2, false);
  const hole = new THREE.Path(); hole.absellipse(0, 0, 7.94, 3.44, 0, Math.PI * 2, true); rimShape.holes.push(hole);
  const rimGeo = new THREE.ExtrudeGeometry(rimShape, { depth: .025, bevelEnabled: false, curveSegments: 64 });
  rimGeo.rotateX(-Math.PI / 2);
  mesh('Deck_Perimeter_Trim', rimGeo, silver, platform, [0, .56, 0]);
  const stairs = group('Side_Stairs');
  for (const sign of [-1, 1]) {
    const side = group(sign < 0 ? 'Stairs_Left' : 'Stairs_Right', stairs);
    box('Lower_Step', [1.6, .2, 1.8], [sign * 8.42, .1, 0], navy, side);
    box('Lower_Tread', [1.6, .025, 1.8], [sign * 8.42, .2125, 0], blue, side);
    box('Upper_Step', [.9, .39, 1.8], [sign * 7.88, .195, 0], navy, side);
    box('Upper_Tread', [.9, .025, 1.8], [sign * 7.88, .4025, 0], blue, side);
  }

  const arch = group('Ceremony_Arch');
  // Continuous horseshoe silhouette; the lower opening remains open to the deck.
  const a = new THREE.Shape();
  a.moveTo(-4.25, 0);
  a.bezierCurveTo(-4.1, 3.4, -2.75, 5.05, 0, 5.05);
  a.bezierCurveTo(2.75, 5.05, 4.1, 3.4, 4.25, 0);
  a.lineTo(3.34, 0);
  a.bezierCurveTo(3.25, 1.8, 2.95, 3.23, 2.25, 3.33);
  a.bezierCurveTo(1.6, 3.43, .95, 3.1, 0, 3.1);
  a.bezierCurveTo(-.95, 3.1, -1.6, 3.43, -2.25, 3.33);
  a.bezierCurveTo(-2.95, 3.23, -3.25, 1.8, -3.34, 0);
  a.closePath();
  plate('Arch_Solid', a, .25, navy, arch, [0, .57, -1.45]);
  label('Competition_Lettering', competitionName, 5.45, .32, [0, 4.55, -1.304], arch);

  const banner = group('Team_Banner');
  const b = new THREE.Shape();
  b.moveTo(-5.7, 0); b.lineTo(5.7, 0); b.lineTo(5.7, .88);
  b.lineTo(5.55, 1.03); b.lineTo(-5.55, 1.03); b.lineTo(-5.7, .88); b.closePath();
  plate('Banner_Panel', b, .16, navy, banner, [0, .57, 1.66]);
  label('Team_Lettering', teamName, 10.55, .48, [0, 1.095, 1.765], banner);
  for (const x of [-4.8, 4.8]) box('Banner_Rear_Support', [.18, .98, .32], [x, 1.06, 1.42], black, banner);

  const trophyAssembly = group('Trophy_Display'); trophyAssembly.position.set(0, .56, .65);
  box('Display_Plinth', [.67, .94, .61], [0, .47, 0], black, trophyAssembly);
  const trophy = group('Trophy', trophyAssembly); trophy.position.y = .94;
  box('Trophy_Base', [.67, .11, .58], [0, .055, 0], black, trophy);
  const baseTop = new THREE.CylinderGeometry(.3, .37, .065, 4); baseTop.rotateY(Math.PI / 4);
  mesh('Base_Bevel', baseTop, black, trophy, [0, .1375, 0]);
  // Closed lathed profile includes foot, stem, outer cup, lip and inner bowl.
  // The hollow interior remains visible from above, matching the close-up.
  const profile = [
    [0,.17],[.22,.17],[.255,.18],[.27,.20],[.255,.22],[.20,.25],
    [.11,.275],[.074,.30],[.069,.45],[.09,.48],[.16,.51],[.23,.57],
    [.285,.66],[.32,.78],[.34,.92],[.343,1.13],[.347,1.17],
    [.327,1.17],[.325,1.135],[.318,.94],[.299,.79],[.265,.69],
    [.213,.61],[.145,.56],[.07,.54],[0,.54],
  ].map(([x,y]) => new THREE.Vector2(x,y));
  mesh('Golden_Cup', new THREE.LatheGeometry(profile, 96), gold, trophy);
  for (const sign of [-1, 1]) {
    const curve = new THREE.CatmullRomCurve3([
      [.328,1.04,0],[.46,1.1,0],[.54,1.03,0],[.545,.94,0],
      [.49,.82,0],[.395,.72,0],[.285,.66,0],
    ].map(([x,y,z]) => new THREE.Vector3(x*sign,y,z)));
    mesh(sign < 0 ? 'Handle_Left' : 'Handle_Right', new THREE.TubeGeometry(curve, 48, .026, 12, false), gold, trophy);
  }
  root.updateMatrixWorld(true);
  return { root, trophy, materials, parts: { platform, stairs, arch, banner, trophyAssembly } };
}

export function disposeAwardsStage(root) {
  const geometries = new Set(), materials = new Set();
  root.traverse(o => { if (o.isMesh) { geometries.add(o.geometry); (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => materials.add(m)); } });
  geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose());
}
