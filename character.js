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

function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
}

function roundRect(ctx, x, y, w, h, r, fill) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
}

function facePath(ctx, x, y, w, h, shape) {
  ctx.beginPath();
  if (shape === 1) { // round
    ctx.ellipse(x, y, w, h * 0.95, 0, 0, Math.PI * 2);
  } else if (shape === 2) { // square
    const r = w * 0.28;
    ctx.moveTo(x - w + r, y - h);
    ctx.arcTo(x + w, y - h, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x - w, y + h, r * 1.1);
    ctx.arcTo(x - w, y + h, x - w, y - h, r * 1.1);
    ctx.arcTo(x - w, y - h, x + w, y - h, r);
    ctx.closePath();
  } else if (shape === 3) { // heart
    ctx.moveTo(x, y + h);
    ctx.bezierCurveTo(x + w * 1.15, y + h * 0.15, x + w * 1.05, y - h * 0.85, x, y - h * 0.45);
    ctx.bezierCurveTo(x - w * 1.05, y - h * 0.85, x - w * 1.15, y + h * 0.15, x, y + h);
  } else if (shape === 4) { // long
    ctx.ellipse(x, y, w * 0.9, h * 1.12, 0, 0, Math.PI * 2);
  } else { // oval
    ctx.ellipse(x, y, w, h, 0, 0, Math.PI * 2);
  }
}

function hairBack(ctx, x, y, w, h, style, col) {
  const dark = shade(col, -28);
  ctx.fillStyle = col;
  if (style === 4 || style === 5 || style === 7 || style === 8 || style === 9 || style === 11) {
    // long / pony / curly / coils / braids / waves hanging behind
    ellipse(ctx, x, y + h * 0.6, w * 1.25, h * 1.6, col);
    if (style === 5) { // ponytail
      ellipse(ctx, x, y + h * 1.8, w * 0.45, h * 1.1, col);
      ellipse(ctx, x, y + h * 0.2, w * 0.5, h * 0.35, dark);
    }
    if (style === 7 || style === 8) {
      for (let i = -2; i <= 2; i++) ellipse(ctx, x + i * w * 0.4, y + h * 1.3, w * 0.45, h * 0.5, i % 2 ? dark : col);
    }
    if (style === 9) {
      for (let i = -2; i <= 2; i++) roundRect(ctx, x + i * w * 0.35 - 6, y + h * 0.4, 12, h * 1.5, 6, i % 2 ? dark : col);
    }
  } else if (style === 6 || style === 12) {
    ellipse(ctx, x, y - h * 0.15, w * 1.15, h * 1.05, col);
  } else {
    ellipse(ctx, x, y - h * 0.1, w * 1.15, h * 1.0, col);
  }
}

function hairFront(ctx, x, y, w, h, style, col) {
  const dark = shade(col, -24);
  ctx.fillStyle = col;
  if (style === 0 || style === 10 || style === 13) { // short, fade, side part
    ctx.beginPath();
    ctx.ellipse(x, y - h * 0.45, w * 1.05, h * 0.7, 0, Math.PI, 0);
    ctx.fill();
    if (style === 13) {
      ctx.beginPath();
      ctx.moveTo(x - w * 0.1, y - h * 0.9);
      ctx.quadraticCurveTo(x + w * 0.2, y - h * 0.2, x + w * 0.95, y - h * 0.1);
      ctx.quadraticCurveTo(x + w * 0.3, y - h * 0.7, x - w * 0.1, y - h * 0.9);
      ctx.fillStyle = dark; ctx.fill();
    }
  } else if (style === 1) { // pixie
    ellipse(ctx, x, y - h * 0.5, w * 1.05, h * 0.65, col);
    ellipse(ctx, x + w * 0.7, y - h * 0.1, w * 0.35, h * 0.4, col);
  } else if (style === 2) { // bob
    ellipse(ctx, x, y - h * 0.2, w * 1.25, h * 1.05, col);
    ellipse(ctx, x - w * 0.95, y + h * 0.15, w * 0.35, h * 0.55, col);
    ellipse(ctx, x + w * 0.95, y + h * 0.15, w * 0.35, h * 0.55, col);
  } else if (style === 3 || style === 11) { // shoulder / waves
    ellipse(ctx, x, y - h * 0.35, w * 1.2, h * 0.85, col);
    ellipse(ctx, x - w * 0.85, y + h * 0.3, w * 0.4, h * 0.8, col);
    ellipse(ctx, x + w * 0.85, y + h * 0.3, w * 0.4, h * 0.8, col);
  } else if (style === 6) { // bun
    ellipse(ctx, x, y - h * 0.4, w * 1.05, h * 0.6, col);
    ellipse(ctx, x, y - h * 1.15, w * 0.55, h * 0.5, col);
  } else if (style === 12) { // puff
    ellipse(ctx, x, y - h * 0.35, w * 1.1, h * 0.6, col);
    ellipse(ctx, x, y - h * 1.15, w * 0.85, h * 0.7, col);
  } else { // long styles bangs
    ellipse(ctx, x, y - h * 0.45, w * 1.15, h * 0.7, col);
    ctx.beginPath();
    ctx.moveTo(x - w * 0.9, y - h * 0.3);
    ctx.quadraticCurveTo(x, y - h * 0.05, x + w * 0.9, y - h * 0.3);
    ctx.quadraticCurveTo(x, y - h * 0.55, x - w * 0.9, y - h * 0.3);
    ctx.fillStyle = dark; ctx.fill();
  }
}

function drawFacialHair(ctx, x, y, w, h, kind, col, skin) {
  if (!kind) return;
  ctx.fillStyle = col;
  ctx.globalAlpha = kind === 1 ? 0.35 : 0.9;
  if (kind === 1 || kind === 3 || kind === 4) { // stubble / short / full
    const hh = kind === 4 ? h * 0.55 : h * 0.32;
    ctx.beginPath();
    ctx.ellipse(x, y + h * 0.55, w * (kind === 4 ? 0.85 : 0.7), hh, 0, 0, Math.PI);
    ctx.fill();
  }
  if (kind === 2 || kind === 3 || kind === 4 || kind === 5) {
    ctx.beginPath();
    ctx.ellipse(x, y + h * 0.28, w * 0.42, h * 0.08, 0, 0, Math.PI);
    ctx.fill();
  }
  if (kind === 5) {
    ctx.beginPath();
    ctx.ellipse(x, y + h * 0.62, w * 0.22, h * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

export function drawCharacter(ctx, look, anim, t, speed, flip) {
  const L = clampLook(look);
  const W = ctx.canvas.width, H = ctx.canvas.height;
  ctx.clearRect(0, 0, W, H);
  const skin = SKIN[L.s];
  const skinD = shade(skin, -28);
  const hair = HAIR_C[L.hc];
  const topC = CLOTH[L.tc];
  const botC = CLOTH[L.bc];
  const shoeC = CLOTH[L.sc];
  const hMul = [0.88, 1, 1.1][L.h];
  const bMul = [0.82, 1, 1.08, 1.22][L.b];
  const figureH = 420 * hMul;
  const footY = H - 18;
  const headR = 36 * (0.95 + (2 - L.h) * 0.04);
  const headY = footY - figureH + headR + 8;
  const cx = W / 2;
  const walk = anim === 'walk' ? Math.sin((t || 0) * 10) * Math.min(1, (speed || 8) / 8) : 0;
  const bob = anim === 'walk' ? Math.abs(Math.sin((t || 0) * 10)) * 4 : (anim === 'jump' ? -18 : 0);
  const armS = anim === 'jump' ? -1.1 : walk * 0.7;
  const legS = anim === 'jump' ? -0.35 : walk * 0.55;
  ctx.save();
  if (flip) { ctx.translate(W, 0); ctx.scale(-1, 1); }
  ctx.translate(0, bob);

  const neckY = headY + headR * 0.85;
  const shY = neckY + 16;
  const hipY = shY + 92 * hMul;
  const torsoW = 42 * bMul;
  const legLen = 118 * hMul;
  const armLen = 86 * hMul;

  // hair back
  hairBack(ctx, cx, headY, headR * 0.95, headR, L.hs, hair);

  // neck
  roundRect(ctx, cx - 9, neckY - 4, 18, 22, 6, skin);
  // torso base (skin)
  ctx.beginPath();
  ctx.moveTo(cx - torsoW * 0.7, shY);
  ctx.quadraticCurveTo(cx - torsoW, shY + 40, cx - torsoW * 0.85, hipY);
  ctx.lineTo(cx + torsoW * 0.85, hipY);
  ctx.quadraticCurveTo(cx + torsoW, shY + 40, cx + torsoW * 0.7, shY);
  ctx.closePath();
  ctx.fillStyle = skin; ctx.fill();

  function limb(hx, hy, ang, len, thick, col, shoe) {
    ctx.save();
    ctx.translate(hx, hy);
    ctx.rotate(ang);
    roundRect(ctx, -thick / 2, 0, thick, len * 0.52, thick / 2, col);
    roundRect(ctx, -thick / 2 + 1, len * 0.48, thick - 2, len * 0.5, thick / 2, shoe || col);
    if (shoe) {
      const sw = L.sh === 1 ? thick + 10 : thick + 6;
      const sh = L.sh === 1 ? 16 : (L.sh === 2 ? 8 : 12);
      roundRect(ctx, -sw / 2, len - 4, sw, sh, 5, shoe);
    }
    ctx.restore();
  }

  // legs (behind/front by swing)
  const jeans = shade(botC, L.bo === 4 ? 10 : 0);
  const shortLeg = L.bo === 1 ? 0.55 : (L.bo === 2 ? 0.4 : 1);
  const leftFirst = legS >= 0;
  const drawLeg = (side, ang) => {
    const hx = cx + side * 14 * bMul, hy = hipY - 4;
    if (L.bo === 2) { // skirt already covers, still draw lower legs
      limb(hx, hy, ang, legLen, 16 * bMul, skin, shoeC);
    } else {
      limb(hx, hy, ang, legLen * shortLeg, 18 * bMul, jeans, null);
      if (shortLeg < 1) limb(hx, hy, ang, legLen, 15 * bMul, skin, shoeC);
      else limb(hx, hy, ang, legLen, 18 * bMul, jeans, shoeC);
    }
  };
  // skirt / culottes
  const drawSkirt = () => {
    const drop = L.bo === 2 ? 70 : (L.bo === 5 ? 58 : 0);
    if (!drop) return;
    ctx.beginPath();
    ctx.moveTo(cx - torsoW * 0.8, hipY - 8);
    ctx.lineTo(cx + torsoW * 0.8, hipY - 8);
    ctx.lineTo(cx + torsoW * 1.15, hipY + drop);
    ctx.lineTo(cx - torsoW * 1.15, hipY + drop);
    ctx.closePath();
    ctx.fillStyle = botC; ctx.fill();
    ctx.fillStyle = shade(botC, -22);
    ctx.fillRect(cx - 2, hipY - 8, 4, drop);
  };

  if (leftFirst) { drawLeg(-1, -legS); drawLeg(1, legS); } else { drawLeg(1, legS); drawLeg(-1, -legS); }
  drawSkirt();

  // dress or top
  const isDress = L.t === 7;
  ctx.beginPath();
  ctx.moveTo(cx - torsoW * 0.75, shY + 4);
  ctx.quadraticCurveTo(cx - torsoW * 1.05, shY + 50, cx - torsoW * (isDress ? 1.1 : 0.9), isDress ? hipY + 80 : hipY + 6);
  ctx.lineTo(cx + torsoW * (isDress ? 1.1 : 0.9), isDress ? hipY + 80 : hipY + 6);
  ctx.quadraticCurveTo(cx + torsoW * 1.05, shY + 50, cx + torsoW * 0.75, shY + 4);
  ctx.closePath();
  ctx.fillStyle = topC; ctx.fill();
  // neckline / shading
  ctx.fillStyle = shade(topC, -25);
  ctx.globalAlpha = 0.35;
  ctx.fillRect(cx - torsoW * 0.5, shY + 30, torsoW, 10);
  ctx.globalAlpha = 1;
  if (L.t === 2 || L.t === 3) { // sweater / hoodie rib
    roundRect(ctx, cx - torsoW * 0.7, hipY - 8, torsoW * 1.4, 12, 4, shade(topC, -18));
  }
  if (L.t === 4) { // jacket lapel
    ctx.fillStyle = shade(topC, 25);
    ctx.beginPath(); ctx.moveTo(cx, shY + 10); ctx.lineTo(cx - 18, hipY); ctx.lineTo(cx - 8, hipY); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(cx, shY + 10); ctx.lineTo(cx + 18, hipY); ctx.lineTo(cx + 8, hipY); ctx.closePath(); ctx.fill();
  }
  if (L.t === 6) { // vest
    ctx.fillStyle = shade(topC, -30);
    ctx.fillRect(cx - 8, shY + 16, 16, hipY - shY - 20);
  }
  if (L.t === 3) { // hoodie pocket
    roundRect(ctx, cx - 16, shY + 50, 32, 22, 6, shade(topC, -18));
  }

  // arms
  const sleeve = (L.t === 1) ? 0.25 : (L.t === 0 || L.t === 5 || L.t === 6 ? 0.4 : 0.75);
  const drawArm = (side, ang) => {
    const ax = cx + side * (torsoW * 0.7), ay = shY + 14;
    limb(ax, ay, ang + side * 0.12, armLen * sleeve, 14, topC, null);
    ctx.save();
    ctx.translate(ax, ay); ctx.rotate(ang + side * 0.12);
    roundRect(ctx, -6, armLen * sleeve - 4, 12, armLen * (1 - sleeve) + 8, 6, skin);
    // hand
    ellipse(ctx, 0, armLen + 4, 7, 8, skin);
    ctx.restore();
  };
  drawArm(-1, armS);
  drawArm(1, -armS);

  if (L.a === 8) { // scarf
    ctx.strokeStyle = shade(topC, 20);
    ctx.lineWidth = 10; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(cx, neckY + 6, 16, Math.PI * 0.15, Math.PI * 0.85); ctx.stroke();
    roundRect(ctx, cx + 8, neckY + 8, 10, 36, 4, topC);
  }
  if (L.a === 7) { // bag
    roundRect(ctx, cx + torsoW * 0.7, hipY - 20, 16, 24, 4, shade(CLOTH[7], 10));
    ctx.strokeStyle = '#5a3310'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx + torsoW * 0.7 + 2, hipY - 20); ctx.lineTo(cx + 8, shY + 24); ctx.lineTo(cx + torsoW * 0.7 + 14, hipY - 20); ctx.stroke();
  }

  // head
  const fw = headR * (L.f === 4 ? 0.85 : 1), fh = headR * (L.f === 1 ? 0.95 : 1.08);
  // ears
  ellipse(ctx, cx - fw * 1.02, headY + 6, 8, 12, skin);
  ellipse(ctx, cx + fw * 1.02, headY + 6, 8, 12, skin);
  facePath(ctx, cx, headY, fw, fh, L.f);
  ctx.fillStyle = skin; ctx.fill();
  // face shading
  const fg = ctx.createLinearGradient(cx - fw, headY, cx + fw, headY + fh);
  fg.addColorStop(0, 'rgba(255,255,255,0.16)');
  fg.addColorStop(0.5, 'rgba(0,0,0,0)');
  fg.addColorStop(1, 'rgba(0,0,0,0.12)');
  facePath(ctx, cx, headY, fw, fh, L.f);
  ctx.fillStyle = fg; ctx.fill();
  // blush
  ellipse(ctx, cx - fw * 0.52, headY + fh * 0.25, 8, 5, 'rgba(230,80,100,0.18)');
  ellipse(ctx, cx + fw * 0.52, headY + fh * 0.25, 8, 5, 'rgba(230,80,100,0.18)');

  // eyes
  const eyeY = headY - fh * 0.08;
  const eyeD = L.e === 3 ? fw * 0.46 : fw * 0.4;
  const eW = L.e === 1 || L.e === 3 ? 10 : 9;
  const eH = L.e === 2 ? 5.5 : (L.e === 1 ? 8 : 6.5);
  function eye(ex) {
    ellipse(ctx, ex, eyeY, eW, eH, '#fff');
    ellipse(ctx, ex, eyeY, eW * 0.55, eH * 0.75, EYE_C[L.ec]);
    ellipse(ctx, ex, eyeY, 3, 3.2, '#1a1010');
    ellipse(ctx, ex - 2, eyeY - 2, 1.6, 1.6, '#fff');
    if (L.e === 2) {
      ctx.fillStyle = skinD;
      ctx.beginPath(); ctx.ellipse(ex, eyeY - eH, eW, eH * 0.7, 0, Math.PI, 0, true); ctx.fill();
    }
    // brow
    ctx.strokeStyle = shade(hair, -10);
    ctx.lineWidth = 2.4; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(ex - 9, eyeY - eH - 5);
    ctx.quadraticCurveTo(ex, eyeY - eH - 8, ex + 9, eyeY - eH - 5);
    ctx.stroke();
  }
  eye(cx - eyeD); eye(cx + eyeD);

  // nose
  ctx.strokeStyle = skinD;
  ctx.lineWidth = 1.8; ctx.lineCap = 'round';
  const nY = headY + fh * 0.18;
  const nW = [5, 6, 9, 6, 7][L.no];
  const nH = [8, 12, 11, 7, 14][L.no];
  ctx.beginPath();
  ctx.moveTo(cx, nY - nH);
  ctx.lineTo(cx + (L.no === 4 ? 3 : 1), nY);
  ctx.quadraticCurveTo(cx, nY + 4, cx - nW * 0.4, nY + 2);
  ctx.stroke();
  ellipse(ctx, cx + 1, nY + 2, nW * 0.35, 2.2, 'rgba(0,0,0,0.08)');

  // mouth
  const mY = headY + fh * 0.52;
  const mW = [12, 10, 16, 12][L.mo];
  const mH = [5, 2.5, 4, 4.5][L.mo];
  ctx.fillStyle = '#c45a62';
  ctx.beginPath();
  ctx.ellipse(cx, mY, mW * 0.5, mH, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e8a0a6';
  ctx.beginPath();
  ctx.ellipse(cx, mY - mH * 0.25, mW * 0.4, mH * 0.45, 0, Math.PI, 0);
  ctx.fill();

  drawFacialHair(ctx, cx, headY, fw, fh, L.fh, shade(hair, 10), skin);
  hairFront(ctx, cx, headY, headR * 0.95, headR, L.hs, hair);

  // accessories on head
  if (L.a === 1 || L.a === 2) {
    const glass = L.a === 2 ? '#281932' : 'rgba(180,220,255,0.35)';
    ctx.strokeStyle = '#281932'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(cx - eyeD, eyeY, 11, 8, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(cx + eyeD, eyeY, 11, 8, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - eyeD + 11, eyeY); ctx.lineTo(cx + eyeD - 11, eyeY); ctx.stroke();
    ctx.fillStyle = glass; ctx.globalAlpha = L.a === 2 ? 0.7 : 0.35;
    ctx.beginPath(); ctx.ellipse(cx - eyeD, eyeY, 10, 7, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx + eyeD, eyeY, 10, 7, 0, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  }
  if (L.a === 3) { // bow
    ctx.fillStyle = '#ff3caa';
    ellipse(ctx, cx - 12, headY - fh - 6, 10, 7, '#ff3caa');
    ellipse(ctx, cx + 12, headY - fh - 6, 10, 7, '#ff3caa');
    ellipse(ctx, cx, headY - fh - 6, 6, 6, '#ff8cc8');
  }
  if (L.a === 4) {
    ellipse(ctx, cx - fw * 1.05, headY + 16, 3, 6, '#ffd24a');
    ellipse(ctx, cx + fw * 1.05, headY + 16, 3, 6, '#ffd24a');
  }
  if (L.a === 5) { // hat
    ctx.fillStyle = shade(topC, -20);
    ellipse(ctx, cx, headY - fh * 0.7, fw * 1.5, 8, shade(topC, -20));
    roundRect(ctx, cx - fw * 0.9, headY - fh * 1.45, fw * 1.8, fh * 0.8, 8, topC);
  }
  if (L.a === 6) { // headphones
    ctx.strokeStyle = '#281932'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.arc(cx, headY, fw + 6, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
    roundRect(ctx, cx - fw - 14, headY - 8, 12, 24, 5, '#ff3caa');
    roundRect(ctx, cx + fw + 2, headY - 8, 12, 24, 5, '#ff3caa');
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
  prev.width = 256; prev.height = 512; prev.id = 'lookPreview'; prev.setAttribute('aria-label', 'Character preview');
  const pctx = prev.getContext('2d');
  const tabs = document.createElement('div'); tabs.className = 'cr-tabs';
  const body = document.createElement('div'); body.className = 'cr-body';
  let tab = 0;
  const look = clampLook(state.look || defaultLook());
  function redraw() { drawCharacter(pctx, look, 'idle', 0, 0, false); }
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
        const t = document.createElement('span'); t.textContent = label; b.appendChild(t);
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
  return {
    getLook: () => ({ ...look }),
    setLook: (l) => { Object.assign(look, clampLook(l)); paint(); redraw(); },
    redraw,
  };
}
