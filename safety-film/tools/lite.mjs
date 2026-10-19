// 把 dream.glb 减面成渲染用的 dream-lite.glb：大网格按三角面数分档简化，节点名与层级不变
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dequantize, weld, simplifyPrimitive, compactPrimitive, prune, draco } from '@gltf-transform/functions';
import { MeshoptSimplifier } from 'meshoptimizer';
import draco3d from 'draco3dgltf';
const [src, out] = process.argv.slice(2);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'draco3d.decoder': await draco3d.createDecoderModule(), 'draco3d.encoder': await draco3d.createEncoderModule() });
const doc = await io.read(src);
await MeshoptSimplifier.ready;
await doc.transform(dequantize(), weld());
const count = (p) => (p.getIndices() ? p.getIndices().getCount() : p.getAttribute('POSITION').getCount()) / 3;
let before = 0, after = 0;
function sloppy(p, ratio, error) {
  const idx = p.getIndices(), pos = p.getAttribute('POSITION');
  const [out] = MeshoptSimplifier.simplifySloppy(Uint32Array.from(idx.getArray()), pos.getArray(), 3, null, Math.floor(idx.getCount() * ratio / 3) * 3, error);
  idx.setArray(pos.getCount() > 65535 ? out : Uint16Array.from(out));
  compactPrimitive(p);
}
for (const m of doc.getRoot().listMeshes()) for (const p of m.listPrimitives()) {
  const t = count(p); before += t;
  // 分档：越大的网格砍得越狠；小件保持原样
  const ratio = t > 25000 ? 0.1 : t > 8000 ? 0.2 : t > 2000 ? 0.3 : t > 600 ? 0.5 : 1;
  // 电机内部的绕组件（8 个 10 万面）由大量互不相连的小块组成，常规简化减不动，改用 sloppy
  if (t > 80000) sloppy(p, 0.05, 0.01);
  else if (ratio < 1) simplifyPrimitive(p, { simplifier: MeshoptSimplifier, ratio, error: 0.008, lockBorder: false });
  after += count(p);
}
console.log('tris', before, '->', after);
await doc.transform(prune(), draco());
await io.write(out, doc);
