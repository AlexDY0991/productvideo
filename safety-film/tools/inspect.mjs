import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import draco3d from 'draco3dgltf';
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'draco3d.decoder': await draco3d.createDecoderModule(), 'draco3d.encoder': await draco3d.createEncoderModule() });
const doc = await io.read(process.argv[2]);
const root = doc.getRoot();
console.log('ext', root.listExtensionsUsed().map(e => e.extensionName));
console.log('nodes', root.listNodes().length, 'meshes', root.listMeshes().length, 'mats', root.listMaterials().length, 'tex', root.listTextures().length);
let tris = 0; const per = [];
for (const m of root.listMeshes()) { let t = 0; for (const p of m.listPrimitives()) { const i = p.getIndices(); t += (i ? i.getCount() : p.getAttribute('POSITION').getCount()) / 3; const pos = p.getAttribute('POSITION'); if (per.length < 3) console.log(m.getName(), pos.getComponentType(), pos.getNormalized(), Object.keys(p.listSemantics ? {} : {}), p.listSemantics()); } tris += t; per.push([m.getName(), t]); }
console.log('tris', tris);
per.sort((a, b) => b[1] - a[1]); console.log(per.slice(0, 30));
