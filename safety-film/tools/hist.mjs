import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import draco3d from 'draco3dgltf';
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'draco3d.decoder': await draco3d.createDecoderModule() });
const doc = await io.read(process.argv[2]);
const b = {}; const top = [];
for (const m of doc.getRoot().listMeshes()) for (const p of m.listPrimitives()) { const t = (p.getIndices() ? p.getIndices().getCount() : p.getAttribute('POSITION').getCount()) / 3; const k = t > 10000 ? '>10k' : t > 3000 ? '3-10k' : t > 1000 ? '1-3k' : t > 300 ? '300-1k' : '<300'; b[k] = b[k] || [0, 0]; b[k][0]++; b[k][1] += t; top.push([m.getName(), p.getMaterial()?.getName(), t]); }
console.log(b); top.sort((a, b) => b[2] - a[2]); console.log(top.slice(0, 25));
