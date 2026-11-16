// Procedural park tools catalog. 12,000 items from type x colour x size x variant.
export const TOOL_COUNT = 12000;

export const ORIG = [
  { id: 'Speaker', name: 'Speaker', cost: 0, fp: [4, 4], cat: 'classic', visual: 'Speaker', tint: false, scale: 1 },
  { id: 'Lights', name: 'Party Light', cost: 0, fp: [4, 4], cat: 'classic', visual: 'Lights', tint: false, scale: 1 },
  { id: 'Stage', name: 'Stage', cost: 0, fp: [16, 10], cat: 'classic', visual: 'Stage', tint: false, scale: 1 },
  { id: 'LogoSign', name: 'Coffeebreak Sign', cost: 0, fp: [8, 2], cat: 'classic', visual: 'LogoSign', tint: false, scale: 1 },
  { id: 'Poster', name: 'Character Poster', cost: 40, fp: [6, 2], cat: 'classic', visual: 'Poster', tint: false, scale: 1 },
  { id: 'DanceFloor', name: 'Dance Floor', cost: 50, fp: [12, 12], cat: 'classic', visual: 'DanceFloor', tint: false, scale: 1 },
  { id: 'TrackStraight', name: 'Coaster Track', cost: 60, fp: [4, 12], cat: 'classic', visual: 'TrackStraight', tint: false, scale: 1 },
  { id: 'TrackRamp', name: 'Coaster Ramp', cost: 60, fp: [4, 12], cat: 'classic', visual: 'TrackRamp', tint: false, scale: 1 },
  { id: 'FoodStall', name: 'Coffee Stall', cost: 80, fp: [10, 6], cat: 'classic', visual: 'FoodStall', tint: false, scale: 1 },
  { id: 'Slide', name: 'Slide', cost: 120, fp: [6, 16], cat: 'classic', visual: 'Slide', tint: false, scale: 1 },
  { id: 'Swing', name: 'Swing', cost: 150, fp: [10, 6], cat: 'classic', visual: 'Swing', tint: false, scale: 1 },
  { id: 'Carousel', name: 'Carousel', cost: 300, fp: [16, 16], cat: 'classic', visual: 'Carousel', tint: false, scale: 1 },
  { id: 'FerrisWheel', name: 'Ferris Wheel', cost: 500, fp: [28, 8], cat: 'classic', visual: 'FerrisWheel', tint: false, scale: 1 },
  { id: 'CoasterLoop', name: 'Roller Coaster', cost: 800, fp: [36, 22], cat: 'classic', visual: 'CoasterLoop', tint: false, scale: 1 },
];
const ORIG_BY_ID = Object.fromEntries(ORIG.map(p => [p.id, { ...p, catName: 'Classic' }]));

export const CATS = [
  { id: 'all', name: 'All' },
  { id: 'classic', name: 'Classic' },
  { id: 'rides', name: 'Rides' },
  { id: 'coasters', name: 'Coasters' },
  { id: 'paths', name: 'Paths' },
  { id: 'scenery', name: 'Scenery' },
  { id: 'plants', name: 'Plants' },
  { id: 'food', name: 'Food' },
  { id: 'shops', name: 'Shops' },
  { id: 'staff', name: 'Staff' },
  { id: 'decorations', name: 'Decor' },
  { id: 'lights', name: 'Lights' },
  { id: 'fences', name: 'Fences' },
  { id: 'water', name: 'Water' },
  { id: 'terrain', name: 'Terrain' },
  { id: 'themed', name: 'Themes' },
];
const CAT_NAME = Object.fromEntries(CATS.map(c => [c.id, c.name]));

const TYPES = [
  { name: 'Carousel', cat: 'rides', visual: 'Carousel', fp: [16, 16], base: 280 },
  { name: 'Swing', cat: 'rides', visual: 'Swing', fp: [10, 6], base: 150 },
  { name: 'Slide', cat: 'rides', visual: 'Slide', fp: [6, 16], base: 120 },
  { name: 'Ferris Wheel', cat: 'rides', visual: 'FerrisWheel', fp: [28, 8], base: 500 },
  { name: 'Teacups', cat: 'rides', visual: 'Carousel', fp: [16, 16], base: 320 },
  { name: 'Coaster Track', cat: 'coasters', visual: 'TrackStraight', fp: [4, 12], base: 60 },
  { name: 'Coaster Ramp', cat: 'coasters', visual: 'TrackRamp', fp: [4, 12], base: 60 },
  { name: 'Roller Coaster', cat: 'coasters', visual: 'CoasterLoop', fp: [36, 22], base: 800 },
  { name: 'Coaster Station', cat: 'coasters', visual: 'Stage', fp: [16, 10], base: 200 },
  { name: 'Path Tile', cat: 'paths', visual: 'Path', fp: [8, 8], base: 12 },
  { name: 'Walkway', cat: 'paths', visual: 'Path', fp: [8, 4], base: 12 },
  { name: 'Plaza Tile', cat: 'paths', visual: 'Path', fp: [8, 8], base: 15 },
  { name: 'Arch', cat: 'scenery', visual: 'Arch', fp: [12, 4], base: 40 },
  { name: 'Rock', cat: 'scenery', visual: 'Rock', fp: [6, 6], base: 25 },
  { name: 'Bench', cat: 'scenery', visual: 'Bench', fp: [8, 4], base: 30 },
  { name: 'Lamp Post', cat: 'scenery', visual: 'Lights', fp: [4, 4], base: 25 },
  { name: 'Tree', cat: 'plants', visual: 'Tree', fp: [8, 8], base: 20 },
  { name: 'Flower', cat: 'plants', visual: 'Flower', fp: [4, 4], base: 10 },
  { name: 'Bush', cat: 'plants', visual: 'Bush', fp: [4, 4], base: 12 },
  { name: 'Planter', cat: 'plants', visual: 'Planter', fp: [4, 4], base: 16 },
  { name: 'Coffee Stall', cat: 'food', visual: 'FoodStall', fp: [10, 6], base: 80 },
  { name: 'Snack Cart', cat: 'food', visual: 'FoodStall', fp: [10, 6], base: 90 },
  { name: 'Ice Cream Stand', cat: 'food', visual: 'FoodStall', fp: [10, 6], base: 90 },
  { name: 'Gift Shop', cat: 'shops', visual: 'FoodStall', fp: [10, 6], base: 140 },
  { name: 'Ticket Booth', cat: 'shops', visual: 'FoodStall', fp: [10, 6], base: 120 },
  { name: 'Souvenir Stall', cat: 'shops', visual: 'FoodStall', fp: [10, 6], base: 130 },
  { name: 'Attendant Booth', cat: 'staff', visual: 'FoodStall', fp: [10, 6], base: 70 },
  { name: 'Staff Hut', cat: 'staff', visual: 'FoodStall', fp: [10, 6], base: 80 },
  { name: 'Queue Sign', cat: 'staff', visual: 'LogoSign', fp: [8, 2], base: 20 },
  { name: 'Balloon Cluster', cat: 'decorations', visual: 'Balloon', fp: [4, 4], base: 22 },
  { name: 'Flag', cat: 'decorations', visual: 'Flag', fp: [4, 4], base: 18 },
  { name: 'Banner', cat: 'decorations', visual: 'LogoSign', fp: [8, 2], base: 30 },
  { name: 'Statue', cat: 'decorations', visual: 'Statue', fp: [6, 6], base: 50 },
  { name: 'Party Light', cat: 'lights', visual: 'Lights', fp: [4, 4], base: 18 },
  { name: 'Lamp', cat: 'lights', visual: 'Lights', fp: [4, 4], base: 20 },
  { name: 'String Lights', cat: 'lights', visual: 'Lights', fp: [8, 4], base: 25 },
  { name: 'Fence', cat: 'fences', visual: 'Fence', fp: [8, 2], base: 10 },
  { name: 'Gate', cat: 'fences', visual: 'Gate', fp: [8, 2], base: 16 },
  { name: 'Rail', cat: 'fences', visual: 'Fence', fp: [8, 2], base: 10 },
  { name: 'Pond', cat: 'water', visual: 'Pond', fp: [12, 12], base: 110 },
  { name: 'Fountain', cat: 'water', visual: 'Fountain', fp: [8, 8], base: 150 },
  { name: 'Waterfall', cat: 'water', visual: 'Fountain', fp: [8, 8], base: 160 },
  { name: 'Hill', cat: 'terrain', visual: 'Hill', fp: [12, 12], base: 40 },
  { name: 'Platform', cat: 'terrain', visual: 'Platform', fp: [12, 8], base: 35 },
  { name: 'Terrain Ramp', cat: 'terrain', visual: 'Hill', fp: [8, 12], base: 40 },
  { name: 'Candy Stall', cat: 'themed', visual: 'FoodStall', fp: [10, 6], base: 200 },
  { name: 'Space Ride', cat: 'themed', visual: 'Carousel', fp: [16, 16], base: 280 },
  { name: 'Pirate Ship', cat: 'themed', visual: 'Stage', fp: [16, 10], base: 250 },
];

const COLOURS = [
  { name: 'Pink', hex: 0xff8cc8 },
  { name: 'Hot Pink', hex: 0xff3caa },
  { name: 'Purple', hex: 0x9646dc },
  { name: 'Lilac', hex: 0xd7b4f5 },
  { name: 'Cream', hex: 0xfff0e6 },
  { name: 'White', hex: 0xffffff },
  { name: 'Coffee', hex: 0x784b32 },
  { name: 'Mint', hex: 0x7ee0b0 },
  { name: 'Sky', hex: 0x7ec8ff },
  { name: 'Gold', hex: 0xffd24a },
];
const SIZES = [
  { name: 'Mini', scale: 0.55, mul: 0.5 },
  { name: 'Small', scale: 0.75, mul: 0.75 },
  { name: 'Standard', scale: 1, mul: 1 },
  { name: 'Large', scale: 1.35, mul: 2.2 },
  { name: 'Grand', scale: 1.7, mul: 4.5 },
];
const VARIANTS = [
  { name: 'Classic', mul: 1 },
  { name: 'Pastel', mul: 1.1 },
  { name: 'Striped', mul: 1.25 },
  { name: 'Neon', mul: 1.6 },
  { name: 'Glow', mul: 2.1 },
];

const NCOL = COLOURS.length, NSZ = SIZES.length, NVAR = VARIANTS.length;
const COMBO = NCOL * NSZ * NVAR; // 250
const GEN_COUNT = TOOL_COUNT - ORIG.length; // 11985

function evenFp(v) { return Math.max(2, Math.round(v / 2) * 2); }

export function genItem(n) {
  const typeI = Math.floor(n / COMBO);
  const rem = n % COMBO;
  const colI = Math.floor(rem / (NSZ * NVAR));
  const rem2 = rem % (NSZ * NVAR);
  const szI = Math.floor(rem2 / NVAR);
  const varI = rem2 % NVAR;
  const type = TYPES[Math.min(typeI, TYPES.length - 1)];
  const col = COLOURS[colI];
  const sz = SIZES[szI];
  const va = VARIANTS[varI];
  let cost = Math.round(type.base * sz.mul * va.mul + (n % 19) * 3);
  if (cost < 10) cost = 10;
  if (cost > 5000) cost = 5000;
  return {
    id: 't' + n,
    name: sz.name + ' ' + col.name + ' ' + va.name + ' ' + type.name,
    cost,
    fp: [evenFp(type.fp[0] * sz.scale), evenFp(type.fp[1] * sz.scale)],
    cat: type.cat,
    catName: CAT_NAME[type.cat],
    visual: type.visual,
    color: col.name,
    colorHex: col.hex,
    variant: va.name,
    scale: sz.scale,
    tint: true,
  };
}

export function itemAt(i) {
  if (i < 0 || i >= TOOL_COUNT) return null;
  if (i < ORIG.length) return ORIG_BY_ID[ORIG[i].id];
  return genItem(i - ORIG.length);
}

export function getItem(id) {
  if (id == null) return null;
  if (ORIG_BY_ID[id]) return ORIG_BY_ID[id];
  if (typeof id === 'string' && id.charCodeAt(0) === 116) {
    const n = +id.slice(1);
    if (n >= 0 && n < GEN_COUNT) return genItem(n);
  }
  return null;
}

export const PAGE_SIZE = 16;

export function pageTools(cat, query, page, pageSize = PAGE_SIZE) {
  const q = (query || '').trim().toLowerCase();
  const all = !q && (!cat || cat === 'all');
  if (all) {
    const start = page * pageSize;
    const items = [];
    for (let i = start; i < Math.min(TOOL_COUNT, start + pageSize); i++) items.push(itemAt(i));
    return { total: TOOL_COUNT, items };
  }
  const idxs = [];
  for (let i = 0; i < TOOL_COUNT; i++) {
    const it = itemAt(i);
    if (cat && cat !== 'all' && it.cat !== cat) continue;
    if (q && it.name.toLowerCase().indexOf(q) < 0 && (it.catName || '').toLowerCase().indexOf(q) < 0) continue;
    idxs.push(i);
  }
  const start = page * pageSize;
  return { total: idxs.length, items: idxs.slice(start, start + pageSize).map(itemAt) };
}
