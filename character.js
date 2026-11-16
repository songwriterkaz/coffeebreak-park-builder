// Character looks, canvas renderer and creator UI. Looks are saved locally only.
export const LOOK_KEY = 'CoffeebreakParkBuilder_look_v1';
export const NAME_KEY = 'CoffeebreakParkBuilder_name_v1';

export const SKIN = ['#f6e0c8', '#f3d1b3', '#e8b894', '#d4a074', '#c68642', '#a86c3c', '#8d5524', '#6b3d1f', '#4a2a16', '#2e1a10'];
export const EYE_C = ['#4a2e1a', '#7a4a1e', '#3c6b3a', '#3a5a8c', '#2a1a12', '#6a6a72'];
export const HAIR_C = ['#1a1210', '#2b1b12', '#5a3310', '#6b2e14', '#d4b06a', '#a85020', '#8a8680', '#e8e4dc', '#e88ab8', '#7a4cb0'];
export const CLOTH = ['#ff8cc8', '#ff3caa', '#9646dc', '#d7b4f5', '#fff0e6', '#ffffff', '#281932', '#784b32', '#7ee0b0', '#7ec8ff'];

export const OPT = {
  b: ['Slim', 'Average', 'Athletic', 'Plus'],
  h: ['Short', 'Average', 'Tall'],
  s: SKIN.map((_, i) => 'Tone ' + (i + 1)),
  f: ['Oval', 'Round', 'Square', 'Heart', 'Long'],
  e: ['Almond', 'Round', 'Lidded', 'Wide'],
  ec: ['Brown', 'Hazel', 'Green', 'Blue', 'Dark', 'Grey'],
  no: ['Small', 'Straight', 'Wide', 'Button', 'Roman'],
  mo: ['Full', 'Thin', 'Wide', 'Soft'],
  hs: ['Short', 'Pixie', 'Bob', 'Shoulder', 'Long', 'Ponytail', 'Bun', 'Curly', 'Coils', 'Braids', 'Fade', 'Waves', 'Puff', 'Side part'],
  hc: ['Black', 'Dark brown', 'Brown', 'Auburn', 'Blonde', 'Copper', 'Grey', 'White', 'Pink', 'Purple'],
  fh: ['None', 'Stubble', 'Moustache', 'Short beard', 'Full beard', 'Goatee'],
  t: ['T-shirt', 'Tank', 'Sweater', 'Hoodie', 'Jacket', 'Blouse', 'Vest', 'Dress'],
  tc: ['Pink', 'Hot pink', 'Purple', 'Lilac', 'Cream', 'White', 'Black', 'Coffee', 'Mint', 'Sky'],
  bo: ['Jeans', 'Shorts', 'Skirt', 'Trousers', 'Leggings', 'Culottes'],
  bc: ['Pink', 'Hot pink', 'Purple', 'Lilac', 'Cream', 'White', 'Black', 'Coffee', 'Mint', 'Sky'],
  sh: ['Sneakers', 'Boots', 'Sandals', 'Flats'],
  sc: ['Pink', 'Hot pink', 'Purple', 'Lilac', 'Cream', 'White', 'Black', 'Coffee', 'Mint', 'Sky'],
  a: ['None', 'Glasses', 'Sunglasses', 'Bow', 'Earrings', 'Hat', 'Headphones', 'Bag', 'Scarf'],
};

const MAX = {};
for (const k in OPT) MAX[k] = OPT[k].length - 1;

export function defaultLook() {
  return { b: 1, h: 1, s: 2, f: 0, e: 0, ec: 0, no: 1, mo: 0, hs: 3, hc: 1, fh: 0, t: 0, tc: 0, bo: 0, bc: 6, sh: 0, sc: 5, a: 0 };
}

export function clampLook(look) {
  const d = defaultLook();
  const out = {};
  for (const k in d) {
    let v = look && Number.isFinite(+look[k]) ? (look[k] | 0) : d[k];
    if (v < 0) v = 0;
    if (v > MAX[k]) v = MAX[k];
    out[k] = v;
  }
  return out;
}

export function sanitizeName(n) {
  if (typeof n !== 'string') return '';
  n = n.replace(/\s+/g, ' ').trim();
  if (!/^[A-Za-z0-9][A-Za-z0-9 '\-]{0,15}$/.test(n)) return '';
  return n.slice(0, 16);
}

export function loadLook() {
  try { return clampLook(JSON.parse(localStorage.getItem(LOOK_KEY) || 'null')); }
  catch (e) { return defaultLook(); }
}
export function saveLook(look) {
  try { localStorage.setItem(LOOK_KEY, JSON.stringify(clampLook(look))); } catch (e) {}
}
export function loadName() {
  try { return sanitizeName(localStorage.getItem(NAME_KEY) || '') || ''; }
  catch (e) { return ''; }
}
export function saveName(n) {
  try { localStorage.setItem(NAME_KEY, sanitizeName(n)); } catch (e) {}
}

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) + amt, g = ((n >> 8) & 255) + amt, b = (n & 255) + amt;
  r = r < 0 ? 0 : r > 255 ? 255 : r;
  g = g < 0 ? 0 : g > 255 ? 255 : g;
  b = b < 0 ? 0 : b > 255 ? 255 : b;
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

function lum(hex) {
  const n = parseInt(hex.slice(1), 16);
  return ((n >> 16) * 0.3 + ((n >> 8) & 255) * 0.59 + (n & 255) * 0.11) / 255;
}

function skinShades(hex) {
  const l = lum(hex);
  const hi = Math.round(18 + l * 22);
  const lo = Math.round(-22 - l * 22);
  return { base: hex, lite: shade(hex, hi), mid: shade(hex, Math.round(hi * -0.15)), dark: shade(hex, lo), deep: shade(hex, lo - 12) };
}

function linGrad(ctx, x0, y0, x1, y1, stops) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  for (let i = 0; i < stops.length; i++) g.addColorStop(stops[i][0], stops[i][1]);
  return g;
}

function radGrad(ctx, x, y, r0, r1, stops) {
  const g = ctx.createRadialGradient(x, y, r0, x, y, r1);
  for (let i = 0; i < stops.length; i++) g.addColorStop(stops[i][0], stops[i][1]);
  return g;
}

function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.beginPath(); ctx.ellipse(x, y, Math.max(0.4, rx), Math.max(0.4, ry), 0, 0, Math.PI * 2);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
}

function capsule(ctx, x, y, len, thick, fill) {
  const r = Math.max(0.8, thick / 2), h = Math.max(r * 2, len);
  ctx.beginPath();
  ctx.moveTo(x - r, y + r);
  ctx.arc(x, y + r, r, Math.PI, 0);
  ctx.lineTo(x + r, y + h - r);
  ctx.arc(x, y + h - r, r, 0, Math.PI);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

function facePath(ctx, x, y, w, h, shape) {
  ctx.beginPath();
  if (shape === 1) ctx.ellipse(x, y, w, h * 0.96, 0, 0, Math.PI * 2);
  else if (shape === 2) {
    const r = w * 0.32;
    ctx.moveTo(x - w + r, y - h);
    ctx.arcTo(x + w, y - h, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x - w, y + h, r * 1.05);
    ctx.arcTo(x - w, y + h, x - w, y - h, r * 1.05);
    ctx.arcTo(x - w, y - h, x + w, y - h, r);
    ctx.closePath();
  } else if (shape === 3) {
    ctx.moveTo(x, y + h * 0.98);
    ctx.bezierCurveTo(x + w * 1.12, y + h * 0.2, x + w * 1.08, y - h * 0.82, x, y - h * 0.5);
    ctx.bezierCurveTo(x - w * 1.08, y - h * 0.82, x - w * 1.12, y + h * 0.2, x, y + h * 0.98);
  } else if (shape === 4) ctx.ellipse(x, y + h * 0.04, w * 0.88, h * 1.1, 0, 0, Math.PI * 2);
  else ctx.ellipse(x, y, w, h, 0, 0, Math.PI * 2);
}

function strand(ctx, x1, y1, cx, cy, x2, y2, width, col) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.quadraticCurveTo(cx, cy, x2, y2);
  ctx.strokeStyle = col;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.stroke();
}

function hairPalette(col) {
  return { c: col, d: shade(col, -30), m: shade(col, -10), l: shade(col, lum(col) > 0.7 ? -8 : 26) };
}

function hairVolume(ctx, hx, hy, hw, hh, style, P) {
  if (style === 5) { // ponytail back
    ellipse(ctx, hx, hy - hh * 0.15, hw * 1.05, hh * 0.95, P.c);
    ellipse(ctx, hx, hy + hh * 0.15, hw * 0.55, hh * 0.4, P.d);
    for (let i = 0; i < 8; i++) {
      const ox = (i - 3.5) * hw * 0.08;
      strand(ctx, hx + ox, hy + hh * 0.2, hx + ox * 1.4, hy + hh * 1.3, hx + ox * 0.6, hy + hh * 2.35, 2.4 - (i % 3) * 0.4, i % 2 ? P.d : P.c);
    }
  } else if (style === 4 || style === 11) { // long / waves
    ellipse(ctx, hx, hy + hh * 0.35, hw * 1.2, hh * 1.55, P.c);
    ellipse(ctx, hx - hw * 0.7, hy + hh * 0.9, hw * 0.55, hh * 1.3, P.d);
    ellipse(ctx, hx + hw * 0.7, hy + hh * 0.9, hw * 0.55, hh * 1.3, P.m);
    for (let i = 0; i < 10; i++) {
      const dir = i < 5 ? -1 : 1;
      const k = i % 5;
      const x0 = hx + dir * hw * (0.3 + k * 0.15);
      const wave = style === 11 ? 10 : 4;
      strand(ctx, x0, hy, hx + dir * (hw * 0.9 + k * 2), hy + hh * 0.9 + (k % 2 ? wave : -wave), hx + dir * (hw * 0.35 + k * 3), hy + hh * 2.2, 2.2, k % 2 ? P.d : P.l);
    }
  } else if (style === 7 || style === 8) { // curly / coils
    ellipse(ctx, hx, hy + hh * 0.2, hw * 1.2, hh * 1.2, P.c);
    const n = style === 8 ? 16 : 12;
    const rad = style === 8 ? 6.5 : 9;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const r = hh * (0.55 + (i % 3) * 0.18);
      ellipse(ctx, hx + Math.cos(a) * r * 0.7, hy + Math.sin(a) * r * 0.55 + hh * 0.3, rad, rad * 0.9, i % 2 ? P.d : P.l);
    }
    for (let i = 0; i < 6; i++) ellipse(ctx, hx + (i - 2.5) * hw * 0.28, hy + hh * 1.35, rad, rad * 1.1, i % 2 ? P.c : P.d);
  } else if (style === 9) { // braids
    ellipse(ctx, hx, hy - hh * 0.1, hw * 1.05, hh * 0.9, P.c);
    for (const dir of [-1, 1]) {
      let x = hx + dir * hw * 0.55, y = hy + hh * 0.2;
      for (let k = 0; k < 7; k++) {
        ellipse(ctx, x, y, 6.5, 7.5, k % 2 ? P.d : P.c);
        x += dir * 1.2; y += hh * 0.28;
      }
    }
  } else if (style === 6) { // bun
    ellipse(ctx, hx, hy - hh * 0.15, hw * 1.02, hh * 0.9, P.c);
  } else if (style === 12) { // puff
    ellipse(ctx, hx, hy - hh * 0.2, hw * 1.1, hh * 0.95, P.c);
  } else if (style === 2 || style === 3) { // bob / shoulder
    ellipse(ctx, hx, hy + hh * (style === 2 ? 0.05 : 0.15), hw * 1.22, hh * (style === 2 ? 1.05 : 1.2), P.c);
    ellipse(ctx, hx - hw * 0.95, hy + hh * 0.25, hw * 0.38, hh * (style === 2 ? 0.55 : 0.8), P.d);
    ellipse(ctx, hx + hw * 0.95, hy + hh * 0.25, hw * 0.38, hh * (style === 2 ? 0.55 : 0.8), P.m);
  } else {
    ellipse(ctx, hx, hy - hh * 0.12, hw * 1.08, hh * 0.95, P.c);
  }
}

function hairFront(ctx, hx, hy, hw, hh, style, P) {
  ctx.lineJoin = 'round';
  if (style === 0 || style === 10) { // short / fade
    ctx.beginPath();
    ctx.ellipse(hx, hy - hh * 0.42, hw * 1.06, hh * 0.72, 0, Math.PI * 1.05, -0.05);
    ctx.fillStyle = P.c; ctx.fill();
    for (let i = 0; i < 9; i++) {
      const x = hx - hw * 0.85 + i * hw * 0.19;
      strand(ctx, x, hy - hh * 0.95, x + (i - 4) * 1.5, hy - hh * 0.55, x + (i - 4) * 0.8, hy - hh * 0.15, style === 10 && (i < 2 || i > 6) ? 1.2 : 2, i % 2 ? P.l : P.d);
    }
  } else if (style === 1) { // pixie
    ctx.beginPath();
    ctx.ellipse(hx, hy - hh * 0.45, hw * 1.04, hh * 0.68, 0, Math.PI, 0);
    ctx.fillStyle = P.c; ctx.fill();
    for (let i = 0; i < 7; i++) strand(ctx, hx - hw * 0.7 + i * hw * 0.22, hy - hh * 0.9, hx - hw * 0.5 + i * hw * 0.24, hy - hh * 0.4, hx - hw * 0.4 + i * hw * 0.2, hy - hh * 0.05, 2, i % 2 ? P.l : P.d);
    for (let i = 0; i < 5; i++) strand(ctx, hx + hw * 0.55, hy - hh * 0.2, hx + hw * 0.95, hy + hh * 0.05, hx + hw * 0.7, hy + hh * 0.35, 1.8, P.d);
  } else if (style === 13) { // side part
    ctx.beginPath();
    ctx.ellipse(hx, hy - hh * 0.4, hw * 1.08, hh * 0.7, 0, Math.PI, 0);
    ctx.fillStyle = P.c; ctx.fill();
    for (let i = 0; i < 8; i++) strand(ctx, hx - hw * 0.15, hy - hh * 0.95, hx + hw * (0.15 + i * 0.12), hy - hh * 0.35, hx + hw * (0.4 + i * 0.1), hy + hh * 0.05, 2.2, i % 2 ? P.l : P.d);
    strand(ctx, hx - hw * 0.1, hy - hh * 0.9, hx - hw * 0.7, hy - hh * 0.3, hx - hw * 0.85, hy + hh * 0.05, 2, P.d);
  } else if (style === 2) { // bob
    ctx.beginPath();
    ctx.ellipse(hx, hy - hh * 0.15, hw * 1.18, hh * 1.0, 0, Math.PI * 1.05, -0.05);
    ctx.fillStyle = P.c; ctx.fill();
    for (let i = 0; i < 8; i++) {
      const dir = i < 4 ? -1 : 1;
      const k = i % 4;
      strand(ctx, hx + dir * hw * 0.2, hy - hh * 0.85, hx + dir * hw * (0.85 + k * 0.08), hy - hh * 0.1, hx + dir * hw * (0.7 + k * 0.05), hy + hh * 0.45, 2.1, k % 2 ? P.d : P.l);
    }
  } else if (style === 3 || style === 4 || style === 11) { // shoulder / long / waves
    ctx.beginPath();
    ctx.ellipse(hx, hy - hh * 0.35, hw * 1.14, hh * 0.8, 0, Math.PI, 0);
    ctx.fillStyle = P.c; ctx.fill();
    for (let i = 0; i < 10; i++) {
      const dir = i < 5 ? -1 : 1;
      const k = i % 5;
      const wiggle = (style === 11 ? 12 : 5) * (k % 2 ? 1 : -1);
      strand(ctx, hx + dir * hw * 0.15, hy - hh * 0.8, hx + dir * (hw * 0.95) + wiggle, hy + hh * 0.35, hx + dir * (hw * 0.55 + k * 3), hy + hh * (style === 3 ? 1.05 : 1.5), 2, k % 2 ? P.d : P.l);
    }
    // bangs
    for (let i = 0; i < 5; i++) strand(ctx, hx - hw * 0.5 + i * hw * 0.25, hy - hh * 0.85, hx - hw * 0.4 + i * hw * 0.25, hy - hh * 0.25, hx - hw * 0.35 + i * hw * 0.22, hy + hh * 0.05, 1.8, i % 2 ? P.l : P.d);
  } else if (style === 5) { // ponytail front
    ctx.beginPath();
    ctx.ellipse(hx, hy - hh * 0.4, hw * 1.02, hh * 0.62, 0, Math.PI, 0);
    ctx.fillStyle = P.c; ctx.fill();
    for (let i = 0; i < 7; i++) strand(ctx, hx - hw * 0.7 + i * hw * 0.23, hy - hh * 0.9, hx - hw * 0.55 + i * hw * 0.23, hy - hh * 0.45, hx - hw * 0.4 + i * hw * 0.2, hy - hh * 0.12, 1.7, i % 2 ? P.l : P.d);
  } else if (style === 6) { // bun
    ctx.beginPath();
    ctx.ellipse(hx, hy - hh * 0.38, hw * 1.02, hh * 0.58, 0, Math.PI, 0);
    ctx.fillStyle = P.c; ctx.fill();
    ellipse(ctx, hx, hy - hh * 1.12, hw * 0.58, hh * 0.5, P.c);
    ellipse(ctx, hx - 3, hy - hh * 1.18, hw * 0.4, hh * 0.32, P.l);
    for (let i = 0; i < 6; i++) {
      const a = -Math.PI + i * 0.5;
      strand(ctx, hx + Math.cos(a) * hw * 0.3, hy - hh * 1.12 + Math.sin(a) * hh * 0.25, hx + Math.cos(a) * hw * 0.7, hy - hh * 1.2 + Math.sin(a) * hh * 0.5, hx + Math.cos(a) * hw * 0.45, hy - hh * 0.85, 1.5, P.d);
    }
  } else if (style === 12) { // puff
    ellipse(ctx, hx, hy - hh * 1.12, hw * 0.95, hh * 0.7, P.c);
    ellipse(ctx, hx - hw * 0.15, hy - hh * 1.2, hw * 0.55, hh * 0.45, P.l);
    ctx.beginPath();
    ctx.ellipse(hx, hy - hh * 0.35, hw * 1.06, hh * 0.55, 0, Math.PI, 0);
    ctx.fillStyle = P.c; ctx.fill();
    for (let i = 0; i < 8; i++) {
      const a = -Math.PI * 0.9 + i * 0.28;
      strand(ctx, hx, hy - hh * 1.15, hx + Math.cos(a) * hw * 0.9, hy - hh * 1.15 + Math.sin(a) * hh * 0.55, hx + Math.cos(a) * hw * 0.55, hy - hh * 0.7, 2.2, i % 2 ? P.d : P.l);
    }
  } else { // curly, coils, braids bangs
    ctx.beginPath();
    ctx.ellipse(hx, hy - hh * 0.4, hw * 1.1, hh * 0.7, 0, Math.PI, 0);
    ctx.fillStyle = P.c; ctx.fill();
    if (style === 7 || style === 8) {
      for (let i = 0; i < 7; i++) ellipse(ctx, hx - hw * 0.7 + i * hw * 0.23, hy - hh * 0.7, style === 8 ? 6 : 8, style === 8 ? 6 : 8, i % 2 ? P.d : P.l);
    } else {
      for (let i = 0; i < 6; i++) strand(ctx, hx - hw * 0.55 + i * hw * 0.2, hy - hh * 0.85, hx - hw * 0.45 + i * hw * 0.2, hy - hh * 0.35, hx - hw * 0.35 + i * hw * 0.18, hy + hh * 0.02, 1.8, i % 2 ? P.d : P.l);
    }
  }
}

function drawFacialHair(ctx, x, y, w, h, kind, col) {
  if (!kind) return;
  const P = hairPalette(col);
  ctx.lineCap = 'round';
  if (kind === 1) { // stubble
    ctx.fillStyle = P.c;
    ctx.globalAlpha = 0.28;
    ctx.beginPath();
    ctx.ellipse(x, y + h * 0.52, w * 0.78, h * 0.38, 0, 0, Math.PI);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  if (kind === 2 || kind === 3 || kind === 4) {
    ctx.strokeStyle = P.d;
    ctx.lineWidth = kind === 2 ? 2 : 2.6;
    ctx.beginPath();
    ctx.moveTo(x - w * 0.28, y + h * 0.28);
    ctx.quadraticCurveTo(x, y + h * 0.36, x + w * 0.28, y + h * 0.28);
    ctx.stroke();
  }
  if (kind === 3 || kind === 4) {
    ctx.fillStyle = P.c;
    ctx.globalAlpha = 0.92;
    ctx.beginPath();
    ctx.moveTo(x - w * (kind === 4 ? 0.72 : 0.5), y + h * 0.38);
    ctx.quadraticCurveTo(x, y + h * (kind === 4 ? 1.02 : 0.85), x + w * (kind === 4 ? 0.72 : 0.5), y + h * 0.38);
    ctx.quadraticCurveTo(x, y + h * 0.48, x - w * (kind === 4 ? 0.72 : 0.5), y + h * 0.38);
    ctx.fill();
    ctx.globalAlpha = 1;
    for (let i = 0; i < 6; i++) strand(ctx, x - w * 0.35 + i * w * 0.14, y + h * 0.45, x - w * 0.3 + i * w * 0.14, y + h * 0.7, x - w * 0.28 + i * w * 0.13, y + h * (kind === 4 ? 0.95 : 0.78), 1.3, i % 2 ? P.d : P.l);
  }
  if (kind === 5) {
    ctx.fillStyle = P.c;
    ctx.beginPath();
    ctx.moveTo(x - w * 0.14, y + h * 0.42);
    ctx.quadraticCurveTo(x, y + h * 0.92, x + w * 0.14, y + h * 0.42);
    ctx.quadraticCurveTo(x, y + h * 0.52, x - w * 0.14, y + h * 0.42);
    ctx.fill();
    ctx.strokeStyle = P.d; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - w * 0.22, y + h * 0.3);
    ctx.quadraticCurveTo(x, y + h * 0.36, x + w * 0.22, y + h * 0.3);
    ctx.stroke();
  }
}

function drawHand(ctx, S) {
  const palm = linGrad(ctx, -6, 0, 6, 10, [[0, S.lite], [1, S.dark]]);
  ellipse(ctx, 0, 2, 6.2, 7.2, palm);
  ctx.save();
  ctx.rotate(-0.55);
  capsule(ctx, -7, 0, 8, 3.4, S.mid);
  ctx.restore();
  for (let i = 0; i < 4; i++) {
    ctx.save();
    ctx.translate(-4.2 + i * 2.8, 7);
    ctx.rotate((i - 1.5) * 0.08);
    capsule(ctx, 0, 0, 8.5 - Math.abs(i - 1.5) * 0.7, 2.5, i === 1 ? S.lite : S.mid);
    ctx.restore();
  }
}

function drawShoe(ctx, kind, col, S) {
  const C = { c: col, d: shade(col, -30), l: shade(col, 24) };
  ctx.save();
  if (kind === 2) { // sandals
    ellipse(ctx, 2, 4, 11, 4, C.d);
    ellipse(ctx, 1, 3, 10, 3.2, C.c);
    ctx.strokeStyle = C.d; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-6, 1); ctx.quadraticCurveTo(0, -3, 8, 1); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-3, 2); ctx.lineTo(4, 2); ctx.stroke();
    for (let i = 0; i < 4; i++) ellipse(ctx, -4 + i * 3.2, -1, 1.5, 2.1, S.mid);
  } else if (kind === 1) { // boots
    ctx.beginPath();
    ctx.moveTo(-8, -16);
    ctx.lineTo(7, -16);
    ctx.lineTo(8, 5);
    ctx.quadraticCurveTo(4, 9, -2, 8);
    ctx.lineTo(-9, 5);
    ctx.closePath();
    ctx.fillStyle = linGrad(ctx, -8, -16, 8, 8, [[0, C.l], [0.4, C.c], [1, C.d]]);
    ctx.fill();
    ctx.fillStyle = C.d;
    ctx.fillRect(-8, -2, 16, 2);
    ellipse(ctx, 2, 5, 11, 4.2, C.d);
    ellipse(ctx, 1, 4, 9, 3, C.c);
  } else if (kind === 3) { // flats
    ctx.beginPath();
    ctx.moveTo(-8, -2);
    ctx.quadraticCurveTo(2, -6, 12, 2);
    ctx.quadraticCurveTo(4, 8, -8, 5);
    ctx.closePath();
    ctx.fillStyle = linGrad(ctx, -6, -4, 6, 6, [[0, C.l], [1, C.d]]);
    ctx.fill();
    ellipse(ctx, 1, 5, 10, 3, C.d);
  } else { // sneakers
    ctx.beginPath();
    ctx.moveTo(-8, -5);
    ctx.quadraticCurveTo(0, -9, 10, -2);
    ctx.quadraticCurveTo(13, 3, 8, 6);
    ctx.quadraticCurveTo(0, 9, -9, 5);
    ctx.closePath();
    ctx.fillStyle = linGrad(ctx, -6, -8, 6, 6, [[0, C.l], [0.45, C.c], [1, C.d]]);
    ctx.fill();
    ctx.fillStyle = shade(C.c, 30);
    ctx.beginPath(); ctx.ellipse(1, 6, 11, 3.2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 1.1;
    ctx.beginPath(); ctx.moveTo(-3, -2); ctx.lineTo(3, -2); ctx.moveTo(-2, 1); ctx.lineTo(4, 1); ctx.stroke();
  }
  ctx.restore();
}

function clothGrad(ctx, x0, y0, x1, y1, col) {
  return linGrad(ctx, x0, y0, x1, y1, [[0, shade(col, 28)], [0.4, col], [1, shade(col, -34)]]);
}

function folds(ctx, clips, lines, col) {
  ctx.save();
  if (clips) { ctx.beginPath(); clips(ctx); ctx.clip(); }
  ctx.strokeStyle = shade(col, -40);
  ctx.globalAlpha = 0.28;
  ctx.lineWidth = 1.15;
  ctx.lineCap = 'round';
  for (let i = 0; i < lines.length; i++) {
    const L = lines[i];
    ctx.beginPath();
    ctx.moveTo(L[0], L[1]);
    ctx.quadraticCurveTo(L[2], L[3], L[4], L[5]);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

export function drawCharacter(ctx, look, anim, t, speed, flip) {
  const L = clampLook(look);
  const W = ctx.canvas.width, H = ctx.canvas.height;
  ctx.clearRect(0, 0, W, H);
  const S = skinShades(SKIN[L.s]);
  const hair = HAIR_C[L.hc];
  const P = hairPalette(hair);
  const topC = CLOTH[L.tc];
  const botC = CLOTH[L.bc];
  const shoeC = CLOTH[L.sc];
  const hMul = [0.9, 1, 1.07][L.h];
  const body = L.b;
  const figureH = Math.min(H * 0.9, 580) * hMul * (H / 640);
  const headH = figureH / 7.5;
  const unit = headH;
  const footY = H - 20 * (H / 640);
  const topY = footY - figureH;
  const cx = W / 2;
  const time = t || 0;
  const walkAmt = anim === 'walk' ? Math.min(1, (speed || 8) / 8) : 0;
  const phase = time * 8.2;
  const breath = anim === 'idle' ? Math.sin(time * 2.1) * 1.2 : (anim === 'walk' ? Math.sin(phase * 2) * 0.6 : 0);
  const bob = anim === 'walk' ? Math.abs(Math.sin(phase)) * 5 * walkAmt : (anim === 'jump' ? -16 : breath * 0.35);
  const sway = anim === 'walk' ? Math.sin(phase) * 0.04 * walkAmt : 0;
  const legL = anim === 'jump' ? -0.45 : Math.sin(phase) * 0.52 * walkAmt;
  const legR = anim === 'jump' ? -0.45 : -legL;
  const armL = anim === 'jump' ? -2.15 : -legL * 0.85 + 0.10;
  const armR = anim === 'jump' ? -2.15 : -legR * 0.85 - 0.10;
  const kneeL = anim === 'jump' ? 0.7 : Math.max(0, -Math.sin(phase)) * 0.7 * walkAmt;
  const kneeR = anim === 'jump' ? 0.7 : Math.max(0, Math.sin(phase)) * 0.7 * walkAmt;
  const elbowL = anim === 'jump' ? 0.25 : 0.08 + Math.max(0, Math.sin(phase)) * 0.35 * walkAmt;
  const elbowR = anim === 'jump' ? 0.25 : 0.08 + Math.max(0, -Math.sin(phase)) * 0.35 * walkAmt;

  const chinY = topY + unit;
  const shY = topY + 1.28 * unit + breath * -0.8;
  const waistY = topY + 3.05 * unit;
  const hipY = topY + 4.0 * unit;
  const kneeY = topY + 5.85 * unit;
  const shW = unit * [0.92, 1.08, 1.22, 1.16][body];
  const waistW = unit * [0.62, 0.76, 0.70, 1.00][body];
  const hipW = unit * [0.78, 0.94, 0.86, 1.12][body];
  const chestBoost = (body === 2 ? 1.08 : 1) * (1 + (anim === 'idle' ? Math.sin(time * 2.1) * 0.012 : 0));

  ctx.save();
  if (flip) { ctx.translate(W, 0); ctx.scale(-1, 1); }
  ctx.translate(cx, 0);
  ctx.translate(0, bob);
  ctx.rotate(sway);

  function torsoPath(widen) {
    const k = widen || 1;
    ctx.beginPath();
    ctx.moveTo(-shW * 0.72 * k, shY);
    ctx.bezierCurveTo(-shW * k, shY + unit * 0.15, -shW * 0.98 * k * chestBoost, shY + unit * 0.85, -waistW * 0.95 * k, waistY);
    ctx.quadraticCurveTo(-hipW * 0.95 * k, hipY - unit * 0.15, -hipW * 0.85 * k, hipY + 4);
    ctx.lineTo(hipW * 0.85 * k, hipY + 4);
    ctx.quadraticCurveTo(hipW * 0.95 * k, hipY - unit * 0.15, waistW * 0.95 * k, waistY);
    ctx.bezierCurveTo(shW * 0.98 * k * chestBoost, shY + unit * 0.85, shW * k, shY + unit * 0.15, shW * 0.72 * k, shY);
    ctx.closePath();
  }

  function limb(side, isArm, swing, bend, sleeveLen, sleeveCol) {
    const upper = isArm ? unit * 1.35 : unit * 1.85;
    const lower = isArm ? unit * 1.25 : unit * 1.85;
    const thickU = isArm ? unit * (body === 2 ? 0.40 : 0.34) : unit * (body === 3 ? 0.56 : 0.50);
    const thickL = thickU * 0.82;
    const hx = isArm ? side * shW * 0.92 : side * hipW * 0.36;
    const hy = isArm ? shY + unit * 0.16 : hipY;
    ctx.save();
    ctx.translate(hx, hy);
    ctx.rotate(swing + side * (isArm ? 0 : 0.03));
    const ug = linGrad(ctx, -thickU, 0, thickU, 0, [[0, S.lite], [0.45, S.base], [1, S.dark]]);
    capsule(ctx, 0, 0, upper, thickU, ug);
    if (!isArm) {
      const skirt = L.bo === 2 || L.bo === 5 || L.t === 7;
      if (!skirt) {
        const cover = L.bo === 1 ? upper * 0.7 : upper + 6;
        capsule(ctx, 0, -2, cover, thickU * 1.14, clothGrad(ctx, -thickU, 0, thickU, cover, botC));
      }
    }
    if (sleeveCol && sleeveLen > 0.05) {
      const sl = upper * sleeveLen;
      const cg = clothGrad(ctx, -thickU, 0, thickU, sl, sleeveCol);
      capsule(ctx, 0, 0, sl, thickU * 1.12, cg);
      folds(ctx, null, [[-thickU * 0.3, sl * 0.3, 0, sl * 0.45, thickU * 0.2, sl * 0.7]], sleeveCol);
    }
    ctx.translate(0, upper - 2);
    ctx.rotate(bend);
    const lg = linGrad(ctx, -thickL, 0, thickL, 0, [[0, S.lite], [0.5, S.base], [1, S.dark]]);
    if (isArm) {
      const showSkin = sleeveLen < 0.95;
      capsule(ctx, 0, 0, lower, thickL, lg);
      if (sleeveCol && sleeveLen > 0.6) {
        const sl = lower * Math.min(0.7, (sleeveLen - 0.55) * 2);
        capsule(ctx, 0, 0, sl, thickL * 1.12, clothGrad(ctx, -thickL, 0, thickL, sl, sleeveCol));
      }
      ctx.translate(0, lower - 2);
      drawHand(ctx, S);
    } else {
      const shorts = L.bo === 1 || L.bo === 2;
      const skirt = L.bo === 2 || L.bo === 5 || L.t === 7;
      capsule(ctx, 0, 0, lower, thickL, lg);
      if (!skirt && L.bo !== 1) {
        capsule(ctx, 0, -6, lower + 8, thickL * 1.16, clothGrad(ctx, -thickL, 0, thickL, lower, botC));
        folds(ctx, null, [[-thickL * 0.2, lower * 0.25, 0, lower * 0.4, thickL * 0.15, lower * 0.6]], botC);
      }
      ctx.translate(0, lower - 1);
      ctx.rotate(-swing * 0.35 - bend * 0.2);
      drawShoe(ctx, L.sh, shoeC, S);
    }
    ctx.restore();
  }

  // far limbs first
  hairVolume(ctx, 0, topY + unit * 0.52, unit * 0.52, unit * 0.52, L.hs, P);
  limb(-1, true, armL, elbowL, [0.4, 0.18, 0.95, 0.95, 0.95, 0.45, 0.3, 0.4][L.t], topC);
  limb(-1, false, legL, kneeL, 0, botC);

  // torso skin
  torsoPath(1);
  ctx.fillStyle = linGrad(ctx, -shW, shY, shW, hipY, [[0, S.lite], [0.35, S.base], [1, S.dark]]);
  ctx.fill();
  // neck
  const neckW = unit * 0.32;
  ctx.beginPath();
  ctx.moveTo(-neckW, chinY - 2);
  ctx.quadraticCurveTo(-neckW * 1.1, shY, -neckW * 0.9, shY + 6);
  ctx.lineTo(neckW * 0.9, shY + 6);
  ctx.quadraticCurveTo(neckW * 1.1, shY, neckW, chinY - 2);
  ctx.fillStyle = linGrad(ctx, -neckW, chinY, neckW, shY, [[0, S.lite], [1, S.dark]]);
  ctx.fill();
  // neck shadow under chin
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  ctx.beginPath();
  ctx.ellipse(0, chinY + 3, neckW * 0.9, 4, 0, 0, Math.PI); ctx.fill();

  // near leg then clothes then near arm
  limb(1, false, legR, kneeR, 0, botC);

  // bottoms that sit on hips (skirt / culottes / dress hem later)
  const isDress = L.t === 7;
  const isSkirt = L.bo === 2 || L.bo === 5;
  if (!isSkirt && !isDress) {
    ctx.beginPath();
    ctx.moveTo(-hipW * 0.72, hipY - 8);
    ctx.lineTo(hipW * 0.72, hipY - 8);
    ctx.lineTo(hipW * 0.42, hipY + unit * 0.55);
    ctx.quadraticCurveTo(0, hipY + unit * 0.78, -hipW * 0.42, hipY + unit * 0.55);
    ctx.closePath();
    ctx.fillStyle = clothGrad(ctx, -hipW, hipY - 8, hipW, hipY + unit * 0.8, botC);
    ctx.fill();
  }
  if (isSkirt && !isDress) {
    const drop = L.bo === 2 ? unit * 1.55 : unit * 1.25;
    ctx.beginPath();
    ctx.moveTo(-hipW * 0.85, hipY - 6);
    ctx.lineTo(hipW * 0.85, hipY - 6);
    ctx.quadraticCurveTo(hipW * 1.25, hipY + drop * 0.5, hipW * 1.15, hipY + drop);
    ctx.lineTo(-hipW * 1.15, hipY + drop);
    ctx.quadraticCurveTo(-hipW * 1.25, hipY + drop * 0.5, -hipW * 0.85, hipY - 6);
    ctx.closePath();
    ctx.fillStyle = clothGrad(ctx, -hipW, hipY, hipW, hipY + drop, botC);
    ctx.fill();
    folds(ctx, null, [
      [-hipW * 0.3, hipY, -hipW * 0.15, hipY + drop * 0.5, -hipW * 0.25, hipY + drop],
      [4, hipY, 8, hipY + drop * 0.55, 2, hipY + drop],
      [hipW * 0.25, hipY, hipW * 0.2, hipY + drop * 0.5, hipW * 0.35, hipY + drop],
    ], botC);
  }

  // top / dress
  function topPath() {
    const hem = isDress ? hipY + unit * 2.1 : hipY + 10;
    const hemW = isDress ? hipW * 1.25 : hipW * 1.06;
    const neckIn = shW * 0.38;
    ctx.beginPath();
    ctx.moveTo(-neckIn, shY + 2);
    ctx.quadraticCurveTo(-shW * 0.72, shY, -shW * 0.98, shY + unit * 0.12);
    ctx.quadraticCurveTo(-shW * 1.02, shY + unit * 0.65, -waistW * 1.05, waistY);
    ctx.quadraticCurveTo(-hipW * 1.0, (waistY + hem) / 2, -hemW, hem);
    ctx.lineTo(hemW, hem);
    ctx.quadraticCurveTo(hipW * 1.0, (waistY + hem) / 2, waistW * 1.05, waistY);
    ctx.quadraticCurveTo(shW * 1.02, shY + unit * 0.65, shW * 0.98, shY + unit * 0.12);
    ctx.quadraticCurveTo(shW * 0.72, shY, neckIn, shY + 2);
    const plunge = L.t === 1 || L.t === 5 || L.t === 6 ? unit * 0.45 : unit * 0.22;
    ctx.quadraticCurveTo(0, shY + plunge + 10, -neckIn, shY + 2);
    ctx.closePath();
  }
  topPath();
  ctx.fillStyle = clothGrad(ctx, -shW, shY, shW, hipY, topC);
  ctx.fill();
  folds(ctx, topPath, [
    [-shW * 0.55, shY + unit * 0.4, -shW * 0.25, shY + unit * 0.8, -waistW * 0.3, waistY],
    [shW * 0.4, shY + unit * 0.5, shW * 0.15, shY + unit, waistW * 0.2, waistY],
    [-waistW * 0.2, waistY, 0, waistY + 10, waistW * 0.15, hipY],
  ], topC);
  if (L.t === 2 || L.t === 3) {
    // rib hem / hoodie
    const y = hipY - 2;
    ctx.fillStyle = shade(topC, -18);
    ctx.fillRect(-hipW * 0.75, y, hipW * 1.5, 8);
  }
  if (L.t === 3) {
    // hoodie pocket and hood flap
    ctx.fillStyle = shade(topC, -16);
    ctx.beginPath();
    ctx.moveTo(-unit * 0.45, shY + unit * 1.35);
    ctx.lineTo(unit * 0.45, shY + unit * 1.35);
    ctx.lineTo(unit * 0.4, shY + unit * 1.95);
    ctx.lineTo(-unit * 0.4, shY + unit * 1.95);
    ctx.closePath(); ctx.fill();
  }
  if (L.t === 4) {
    ctx.fillStyle = shade(topC, 22);
    ctx.beginPath(); ctx.moveTo(0, shY + unit * 0.25); ctx.lineTo(-unit * 0.45, hipY); ctx.lineTo(-unit * 0.15, hipY); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(0, shY + unit * 0.25); ctx.lineTo(unit * 0.45, hipY); ctx.lineTo(unit * 0.15, hipY); ctx.closePath(); ctx.fill();
  }
  if (L.t === 6) {
    ctx.fillStyle = shade(topC, -28);
    ctx.fillRect(-unit * 0.16, shY + unit * 0.45, unit * 0.32, waistY - shY - unit * 0.3);
  }
  if (L.a === 8) { // scarf
    ctx.strokeStyle = shade(topC, 16);
    ctx.lineWidth = unit * 0.22; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(0, chinY + unit * 0.15, unit * 0.38, 0.2, Math.PI - 0.2); ctx.stroke();
    ctx.fillStyle = topC;
    ctx.beginPath(); ctx.moveTo(unit * 0.15, chinY + unit * 0.2); ctx.lineTo(unit * 0.4, hipY - unit); ctx.lineTo(unit * 0.22, hipY - unit); ctx.closePath(); ctx.fill();
  }

  limb(1, true, armR, elbowR, [0.4, 0.18, 0.95, 0.95, 0.95, 0.45, 0.3, 0.4][L.t], topC);

  if (L.a === 7) { // bag
    ctx.fillStyle = shade(CLOTH[7], 8);
    ctx.beginPath();
    ctx.roundRect(hipW * 0.55, waistY, unit * 0.42, unit * 0.55, 5);
    ctx.fill();
    ctx.strokeStyle = shade(CLOTH[7], -30); ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(hipW * 0.58, waistY); ctx.quadraticCurveTo(unit * 0.2, shY + unit * 0.4, hipW * 0.9, waistY); ctx.stroke();
  }

  // head
  const hx = 0, hy = topY + unit * 0.55;
  const fw = unit * (L.f === 4 ? 0.42 : 0.48);
  const fh = unit * (L.f === 1 ? 0.48 : 0.52);
  // ears
  const earG = linGrad(ctx, -2, 0, 4, 0, [[0, S.lite], [1, S.dark]]);
  ellipse(ctx, hx - fw * 1.02, hy + fh * 0.1, unit * 0.11, unit * 0.16, earG);
  ellipse(ctx, hx + fw * 1.02, hy + fh * 0.1, unit * 0.11, unit * 0.16, earG);
  ellipse(ctx, hx - fw * 1.02, hy + fh * 0.1, unit * 0.06, unit * 0.09, S.dark);
  ellipse(ctx, hx + fw * 1.02, hy + fh * 0.1, unit * 0.06, unit * 0.09, S.dark);
  facePath(ctx, hx, hy, fw, fh, L.f);
  ctx.fillStyle = radGrad(ctx, hx - fw * 0.25, hy - fh * 0.25, 2, fw * 1.4, [[0, S.lite], [0.45, S.base], [1, S.dark]]);
  ctx.fill();
  // jaw / cheek shadow
  ctx.save();
  facePath(ctx, hx, hy, fw, fh, L.f); ctx.clip();
  ctx.fillStyle = linGrad(ctx, hx, hy, hx, hy + fh, [[0, 'rgba(0,0,0,0)'], [0.7, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,0.14)']]);
  ctx.fillRect(hx - fw * 1.2, hy, fw * 2.4, fh * 1.2);
  // blush
  ctx.fillStyle = 'rgba(200,70,80,' + (0.12 + lum(S.base) * 0.08) + ')';
  ctx.beginPath(); ctx.ellipse(hx - fw * 0.52, hy + fh * 0.22, unit * 0.16, unit * 0.08, -0.3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(hx + fw * 0.52, hy + fh * 0.22, unit * 0.16, unit * 0.08, 0.3, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  // eyes
  const eyeY = hy - fh * 0.08;
  const eyeD = L.e === 3 ? fw * 0.46 : fw * 0.4;
  const eW = (L.e === 1 || L.e === 3 ? 0.15 : 0.13) * unit;
  const eH = (L.e === 2 ? 0.07 : L.e === 1 ? 0.12 : 0.09) * unit;
  function drawEye(ex) {
    // socket shade
    ellipse(ctx, ex, eyeY + 1, eW * 1.25, eH * 1.5, 'rgba(0,0,0,0.07)');
    // sclera
    ctx.beginPath();
    if (L.e === 0) { // almond
      ctx.moveTo(ex - eW, eyeY);
      ctx.quadraticCurveTo(ex, eyeY - eH * 1.15, ex + eW, eyeY);
      ctx.quadraticCurveTo(ex, eyeY + eH * 1.05, ex - eW, eyeY);
    } else ctx.ellipse(ex, eyeY, eW, eH, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#f6f3ef';
    ctx.fill();
    ctx.save();
    ctx.clip();
    const irisR = eH * 0.95;
    const ig = radGrad(ctx, ex, eyeY, 0, irisR, [[0, shade(EYE_C[L.ec], 40)], [0.45, EYE_C[L.ec]], [0.82, shade(EYE_C[L.ec], -30)], [1, '#1a100c']]);
    ellipse(ctx, ex, eyeY, irisR, irisR, ig);
    ellipse(ctx, ex, eyeY, irisR * 0.38, irisR * 0.38, '#140c0a');
    ellipse(ctx, ex - irisR * 0.28, eyeY - irisR * 0.3, irisR * 0.22, irisR * 0.18, 'rgba(255,255,255,0.85)');
    ellipse(ctx, ex + irisR * 0.18, eyeY + irisR * 0.15, irisR * 0.1, irisR * 0.08, 'rgba(255,255,255,0.4)');
    ctx.restore();
    // lids
    ctx.strokeStyle = S.deep;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(ex - eW, eyeY);
    ctx.quadraticCurveTo(ex, eyeY - eH * 1.2, ex + eW, eyeY);
    ctx.stroke();
    if (L.e === 2) {
      ctx.fillStyle = S.mid;
      ctx.beginPath();
      ctx.moveTo(ex - eW, eyeY);
      ctx.quadraticCurveTo(ex, eyeY - eH * 0.2, ex + eW, eyeY);
      ctx.quadraticCurveTo(ex, eyeY - eH * 1.3, ex - eW, eyeY);
      ctx.fill();
    }
    // lashes
    ctx.strokeStyle = '#1a1010';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const lx = ex - eW * 0.75 + i * eW * 0.38;
      ctx.beginPath(); ctx.moveTo(lx, eyeY - eH * 0.85); ctx.lineTo(lx - 0.8, eyeY - eH * 1.45); ctx.stroke();
    }
    // brow
    ctx.strokeStyle = shade(hair, lum(hair) > 0.6 ? -40 : 10);
    ctx.lineWidth = unit * 0.045;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(ex - eW * 1.05, eyeY - eH * 1.7);
    ctx.quadraticCurveTo(ex, eyeY - eH * 2.25, ex + eW * 1.05, eyeY - eH * 1.65);
    ctx.stroke();
  }
  drawEye(hx - eyeD); drawEye(hx + eyeD);

  // nose
  const nY = hy + fh * 0.16;
  const nW = [0.07, 0.08, 0.12, 0.085, 0.09][L.no] * unit;
  const nH = [0.16, 0.22, 0.2, 0.14, 0.26][L.no] * unit;
  ctx.strokeStyle = S.dark;
  ctx.lineWidth = 1.25;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(hx + 0.6, nY - nH);
  ctx.quadraticCurveTo(hx + nW * 0.4, nY - nH * 0.2, hx + nW * 0.15, nY);
  ctx.stroke();
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  ellipse(ctx, hx - nW * 0.55, nY + 1, nW * 0.45, nW * 0.28, 'rgba(0,0,0,0.14)');
  ellipse(ctx, hx + nW * 0.7, nY + 1, nW * 0.45, nW * 0.28, 'rgba(0,0,0,0.16)');
  ellipse(ctx, hx + nW * 0.15, nY - 1, nW * 0.35, nW * 0.28, S.lite);

  // lips
  const mY = hy + fh * 0.5;
  const mW = [0.22, 0.17, 0.28, 0.21][L.mo] * unit;
  const mH = [0.075, 0.04, 0.065, 0.07][L.mo] * unit;
  ctx.beginPath();
  ctx.moveTo(hx - mW, mY);
  ctx.quadraticCurveTo(hx, mY - mH * 1.1, hx + mW, mY);
  ctx.quadraticCurveTo(hx, mY + mH * 1.5, hx - mW, mY);
  ctx.fillStyle = linGrad(ctx, hx, mY - mH, hx, mY + mH, [[0, '#c45a6a'], [0.45, '#a33d4c'], [1, '#8a3040']]);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(hx - mW * 0.75, mY - mH * 0.1);
  ctx.quadraticCurveTo(hx, mY - mH * 1.15, hx + mW * 0.75, mY - mH * 0.1);
  ctx.quadraticCurveTo(hx, mY + mH * 0.15, hx - mW * 0.75, mY - mH * 0.1);
  ctx.fillStyle = '#d97884';
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.28)';
  ellipse(ctx, hx, mY + mH * 0.25, mW * 0.35, mH * 0.25, 'rgba(255,255,255,0.28)');

  drawFacialHair(ctx, hx, hy, fw, fh, L.fh, hair);
  hairFront(ctx, hx, hy, unit * 0.52, unit * 0.52, L.hs, P);

  // accessories on head
  if (L.a === 1 || L.a === 2) {
    const glass = L.a === 2 ? 'rgba(30,20,30,0.62)' : 'rgba(200,225,245,0.28)';
    ctx.strokeStyle = '#241820'; ctx.lineWidth = 1.8;
    for (const ex of [hx - eyeD, hx + eyeD]) {
      ctx.beginPath(); ctx.ellipse(ex, eyeY, eW * 1.35, eH * 1.55, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = glass; ctx.beginPath(); ctx.ellipse(ex, eyeY, eW * 1.25, eH * 1.4, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.beginPath(); ctx.moveTo(hx - eyeD + eW * 1.35, eyeY); ctx.lineTo(hx + eyeD - eW * 1.35, eyeY); ctx.stroke();
  }
  if (L.a === 3) {
    ctx.fillStyle = '#ff3caa';
    ellipse(ctx, hx - unit * 0.22, topY + unit * 0.08, unit * 0.16, unit * 0.1, '#ff3caa');
    ellipse(ctx, hx + unit * 0.22, topY + unit * 0.08, unit * 0.16, unit * 0.1, '#ff3caa');
    ellipse(ctx, hx, topY + unit * 0.08, unit * 0.08, unit * 0.08, '#ff8cc8');
  }
  if (L.a === 4) {
    ellipse(ctx, hx - fw * 1.08, hy + fh * 0.28, unit * 0.05, unit * 0.1, '#ffd24a');
    ellipse(ctx, hx + fw * 1.08, hy + fh * 0.28, unit * 0.05, unit * 0.1, '#ffd24a');
  }
  if (L.a === 5) {
    ctx.fillStyle = clothGrad(ctx, -fw, topY, fw, hy, topC);
    ellipse(ctx, hx, topY + unit * 0.22, fw * 1.55, unit * 0.1, shade(topC, -20));
    ctx.beginPath();
    ctx.ellipse(hx, topY + unit * 0.08, fw * 1.05, unit * 0.42, 0, Math.PI, 0, true);
    ctx.fillStyle = clothGrad(ctx, -fw, topY - unit, fw, hy, topC);
    ctx.fill();
  }
  if (L.a === 6) {
    ctx.strokeStyle = '#241820'; ctx.lineWidth = unit * 0.08;
    ctx.beginPath(); ctx.arc(hx, hy, fw + unit * 0.12, Math.PI * 1.08, Math.PI * 1.92); ctx.stroke();
    ctx.fillStyle = '#ff3caa';
    ellipse(ctx, hx - fw - unit * 0.08, hy + 2, unit * 0.14, unit * 0.2, '#ff3caa');
    ellipse(ctx, hx + fw + unit * 0.08, hy + 2, unit * 0.14, unit * 0.2, '#ff3caa');
  }

  ctx.restore();
}

const GROUPS = [
  ['Body', ['b', 'h', 's']],
  ['Face', ['f', 'e', 'ec', 'no', 'mo']],
  ['Hair', ['hs', 'hc', 'fh']],
  ['Clothes', ['t', 'tc', 'bo', 'bc', 'sh', 'sc', 'a']],
];
const LABELS = {
  b: 'Body', h: 'Height', s: 'Skin', f: 'Face', e: 'Eyes', ec: 'Eye colour', no: 'Nose', mo: 'Mouth',
  hs: 'Hair', hc: 'Hair colour', fh: 'Facial hair', t: 'Top', tc: 'Top colour', bo: 'Bottoms', bc: 'Bottom colour',
  sh: 'Shoes', sc: 'Shoe colour', a: 'Accessory',
};
const SWATCH = { s: SKIN, ec: EYE_C, hc: HAIR_C, tc: CLOTH, bc: CLOTH, sc: CLOTH };

export function fillCreator(el, state) {
  el.innerHTML = '';
  el.classList.add('creator');
  const prev = document.createElement('canvas');
  prev.width = 320; prev.height = 640; prev.id = 'lookPreview'; prev.setAttribute('aria-label', 'Character preview');
  const pctx = prev.getContext('2d');
  const tabs = document.createElement('div'); tabs.className = 'cr-tabs';
  const body = document.createElement('div'); body.className = 'cr-body';
  let tab = 0;
  const look = clampLook(state.look || defaultLook());
  const t0 = performance.now();
  function redraw() { drawCharacter(pctx, look, 'idle', (performance.now() - t0) / 1000, 0, false); }
  function emit() { if (state.onChange) state.onChange({ look: { ...look }, name: state.getName ? state.getName() : undefined }); }
  function paint() {
    body.innerHTML = '';
    for (const key of GROUPS[tab][1]) {
      const row = document.createElement('div'); row.className = 'cr-row';
      const lab = document.createElement('div'); lab.className = 'cr-lab'; lab.textContent = LABELS[key];
      const opts = document.createElement('div'); opts.className = 'cr-opts';
      OPT[key].forEach((label, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'cr-opt' + (look[key] === i ? ' on' : '');
        if (SWATCH[key]) {
          const d = document.createElement('span'); d.className = 'sw'; d.style.background = SWATCH[key][i];
          b.appendChild(d);
        }
        const tx = document.createElement('span'); tx.textContent = label; b.appendChild(tx);
        b.onclick = () => { look[key] = i; paint(); redraw(); emit(); };
        opts.appendChild(b);
      });
      row.appendChild(lab); row.appendChild(opts); body.appendChild(row);
    }
  }
  GROUPS.forEach((g, i) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'cr-tab' + (i === 0 ? ' on' : ''); b.textContent = g[0];
    b.onclick = () => {
      tab = i;
      tabs.querySelectorAll('.cr-tab').forEach((x, j) => x.classList.toggle('on', j === i));
      paint();
    };
    tabs.appendChild(b);
  });
  const wrap = document.createElement('div'); wrap.className = 'cr-wrap';
  const left = document.createElement('div'); left.className = 'cr-prev'; left.appendChild(prev);
  const right = document.createElement('div'); right.className = 'cr-ctrl';
  right.appendChild(tabs); right.appendChild(body);
  wrap.appendChild(left); wrap.appendChild(right);
  el.appendChild(wrap);
  paint(); redraw();
  if (el._crRaf) cancelAnimationFrame(el._crRaf);
  let last = 0;
  function loop(now) {
    el._crRaf = requestAnimationFrame(loop);
    if (!el.isConnected) return;
    if (now - last < 70) return;
    last = now;
    if (el.offsetParent) redraw();
  }
  el._crRaf = requestAnimationFrame(loop);
  return {
    getLook: () => ({ ...look }),
    setLook: (l) => { Object.assign(look, clampLook(l)); paint(); redraw(); },
    redraw,
  };
}
