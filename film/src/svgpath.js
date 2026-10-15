// Minimal SVG path parser that flattens a path string into polylines.
// Supports M L H V C S Q T A Z (absolute + relative).

const CMD = /([MmLlHhVvCcSsQqTtAaZz])|(-?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?)/g;

export function parsePath(d, tol = 1.2) {
  const toks = [];
  let m;
  CMD.lastIndex = 0;
  while ((m = CMD.exec(d))) toks.push(m[1] ? m[1] : parseFloat(m[2]));
  const polys = [];
  let cur = null, x = 0, y = 0, sx = 0, sy = 0, cmd = null, lcx = 0, lcy = 0, lqx = 0, lqy = 0, prev = '';
  let i = 0;
  const num = () => toks[i++];
  const start = (nx, ny) => { cur = [[nx, ny]]; cur.closed = false; polys.push(cur); };
  const lineTo = (nx, ny) => { if (!cur) start(x, y); cur.push([nx, ny]); };
  const cubic = (x1, y1, x2, y2, x3, y3) => {
    const len = Math.hypot(x1 - x, y1 - y) + Math.hypot(x2 - x1, y2 - y1) + Math.hypot(x3 - x2, y3 - y2);
    const n = Math.max(2, Math.min(64, Math.ceil(len / (tol * 3))));
    for (let k = 1; k <= n; k++) {
      const t = k / n, u = 1 - t;
      lineTo(u * u * u * x + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x3,
        u * u * u * y + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y3);
    }
  };
  const quad = (x1, y1, x2, y2) => {
    const len = Math.hypot(x1 - x, y1 - y) + Math.hypot(x2 - x1, y2 - y1);
    const n = Math.max(2, Math.min(48, Math.ceil(len / (tol * 3))));
    for (let k = 1; k <= n; k++) {
      const t = k / n, u = 1 - t;
      lineTo(u * u * x + 2 * u * t * x1 + t * t * x2, u * u * y + 2 * u * t * y1 + t * t * y2);
    }
  };
  const arc = (rx, ry, phi, fa, fs, x2, y2) => {
    if (rx === 0 || ry === 0) { lineTo(x2, y2); return; }
    const p = (phi * Math.PI) / 180, cp = Math.cos(p), sp = Math.sin(p);
    const dx = (x - x2) / 2, dy = (y - y2) / 2;
    const x1p = cp * dx + sp * dy, y1p = -sp * dx + cp * dy;
    rx = Math.abs(rx); ry = Math.abs(ry);
    const lam = (x1p * x1p) / (rx * rx) + (y1p * y1p) / (ry * ry);
    if (lam > 1) { rx *= Math.sqrt(lam); ry *= Math.sqrt(lam); }
    const num_ = rx * rx * ry * ry - rx * rx * y1p * y1p - ry * ry * x1p * x1p;
    const den = rx * rx * y1p * y1p + ry * ry * x1p * x1p;
    let co = Math.sqrt(Math.max(0, num_ / den));
    if (fa === fs) co = -co;
    const cxp = (co * rx * y1p) / ry, cyp = (-co * ry * x1p) / rx;
    const cx = cp * cxp - sp * cyp + (x + x2) / 2, cy = sp * cxp + cp * cyp + (y + y2) / 2;
    const ang = (ux, uy, vx, vy) => { const a = Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy); return a; };
    const t1 = ang(1, 0, (x1p - cxp) / rx, (y1p - cyp) / ry);
    let dt = ang((x1p - cxp) / rx, (y1p - cyp) / ry, (-x1p - cxp) / rx, (-y1p - cyp) / ry);
    if (!fs && dt > 0) dt -= Math.PI * 2;
    if (fs && dt < 0) dt += Math.PI * 2;
    const n = Math.max(4, Math.ceil((Math.abs(dt) * Math.max(rx, ry)) / (tol * 2)));
    for (let k = 1; k <= n; k++) {
      const t = t1 + (dt * k) / n;
      lineTo(cx + rx * Math.cos(t) * cp - ry * Math.sin(t) * sp, cy + rx * Math.cos(t) * sp + ry * Math.sin(t) * cp);
    }
  };
  while (i < toks.length) {
    if (typeof toks[i] === 'string') cmd = toks[i++];
    else if (cmd === 'M') cmd = 'L';
    else if (cmd === 'm') cmd = 'l';
    const rel = cmd === cmd.toLowerCase();
    const C = cmd.toUpperCase();
    const ox = rel ? x : 0, oy = rel ? y : 0;
    switch (C) {
      case 'M': { x = ox + num(); y = oy + num(); sx = x; sy = y; start(x, y); break; }
      case 'L': { const nx = ox + num(), ny = oy + num(); lineTo(nx, ny); x = nx; y = ny; break; }
      case 'H': { const nx = (rel ? x : 0) + num(); lineTo(nx, y); x = nx; break; }
      case 'V': { const ny = (rel ? y : 0) + num(); lineTo(x, ny); y = ny; break; }
      case 'C': {
        const x1 = ox + num(), y1 = oy + num(), x2 = ox + num(), y2 = oy + num(), x3 = ox + num(), y3 = oy + num();
        cubic(x1, y1, x2, y2, x3, y3); lcx = x2; lcy = y2; x = x3; y = y3; break;
      }
      case 'S': {
        const x1 = 'CS'.includes(prev) ? 2 * x - lcx : x, y1 = 'CS'.includes(prev) ? 2 * y - lcy : y;
        const x2 = ox + num(), y2 = oy + num(), x3 = ox + num(), y3 = oy + num();
        cubic(x1, y1, x2, y2, x3, y3); lcx = x2; lcy = y2; x = x3; y = y3; break;
      }
      case 'Q': {
        const x1 = ox + num(), y1 = oy + num(), x2 = ox + num(), y2 = oy + num();
        quad(x1, y1, x2, y2); lqx = x1; lqy = y1; x = x2; y = y2; break;
      }
      case 'T': {
        const x1 = 'QT'.includes(prev) ? 2 * x - lqx : x, y1 = 'QT'.includes(prev) ? 2 * y - lqy : y;
        const x2 = ox + num(), y2 = oy + num();
        quad(x1, y1, x2, y2); lqx = x1; lqy = y1; x = x2; y = y2; break;
      }
      case 'A': {
        const rx = num(), ry = num(), phi = num(), fa = num(), fs = num(), nx = ox + num(), ny = oy + num();
        arc(rx, ry, phi, fa, fs, nx, ny); x = nx; y = ny; break;
      }
      case 'Z': {
        if (cur) { cur.push([sx, sy]); cur.closed = true; }
        x = sx; y = sy; cur = null; break;
      }
      default: i++;
    }
    prev = C;
  }
  return polys.filter((p) => p.length > 1);
}

// Cache parsed paths
const cache = new Map();
export function P(d) {
  let v = cache.get(d);
  if (!v) { v = parsePath(d); cache.set(d, v); }
  return v;
}
