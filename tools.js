// Procedural park tools. Compact tables only. 12,000 placeable items.
export const TOOL_COUNT = 12000;
export const PAGE_SIZE = 12;

export const ORIG = [
  { id: 'Speaker', name: 'Speaker', cost: 0, fp: [4, 4], cat: 'classic', visual: 'Speaker', tint: false, scale: 1, colorHex: 0xff3caa },
  { id: 'Lights', name: 'Party Light', cost: 0, fp: [4, 4], cat: 'classic', visual: 'Lights', tint: false, scale: 1, colorHex: 0xff8cc8 },
  { id: 'Stage', name: 'Stage', cost: 0, fp: [16, 10], cat: 'classic', visual: 'Stage', tint: false, scale: 1, colorHex: 0x9646dc },
  { id: 'LogoSign', name: 'Coffeebreak Sign', cost: 0, fp: [8, 2], cat: 'classic', visual: 'LogoSign', tint: false, scale: 1, colorHex: 0xff8cc8 },
  { id: 'Poster', name: 'Character Poster', cost: 50, fp: [6, 2], cat: 'classic', visual: 'Poster', tint: false, scale: 1, colorHex: 0xd7b4f5 },
  { id: 'DanceFloor', name: 'Dance Floor', cost: 50, fp: [12, 12], cat: 'classic', visual: 'DanceFloor', tint: false, scale: 1, colorHex: 0xff3caa },
  { id: 'TrackStraight', name: 'Coaster Track', cost: 60, fp: [4, 12], cat: 'classic', visual: 'TrackStraight', tint: false, scale: 1, colorHex: 0x9646dc },
  { id: 'TrackRamp', name: 'Coaster Ramp', cost: 60, fp: [4, 12], cat: 'classic', visual: 'TrackRamp', tint: false, scale: 1, colorHex: 0xff3caa },
  { id: 'FoodStall', name: 'Coffee Stall', cost: 80, fp: [10, 6], cat: 'classic', visual: 'FoodStall', tint: false, scale: 1, colorHex: 0x784b32 },
  { id: 'Slide', name: 'Slide', cost: 120, fp: [6, 16], cat: 'classic', visual: 'Slide', tint: false, scale: 1, colorHex: 0xff8cc8 },
  { id: 'Swing', name: 'Swing', cost: 150, fp: [10, 6], cat: 'classic', visual: 'Swing', tint: false, scale: 1, colorHex: 0x9646dc },
  { id: 'Carousel', name: 'Carousel', cost: 300, fp: [16, 16], cat: 'classic', visual: 'Carousel', tint: false, scale: 1, colorHex: 0xff3caa },
  { id: 'FerrisWheel', name: 'Ferris Wheel', cost: 500, fp: [28, 8], cat: 'classic', visual: 'FerrisWheel', tint: false, scale: 1, colorHex: 0x7ec8ff },
  { id: 'CoasterLoop', name: 'Roller Coaster', cost: 800, fp: [36, 22], cat: 'classic', visual: 'CoasterLoop', tint: false, scale: 1, colorHex: 0xffd24a },
];

export const CATS = [
  { id: 'all', name: 'All' },
  { id: 'classic', name: 'Classic' },
  { id: 'rides', name: 'Rides' },
  { id: 'coasters', name: 'Coasters' },
  { id: 'paths', name: 'Paths' },
  { id: 'gardens', name: 'Gardens' },
  { id: 'water', name: 'Water' },
  { id: 'food', name: 'Food stalls' },
  { id: 'lights', name: 'Lights' },
  { id: 'fences', name: 'Fences' },
  { id: 'statues', name: 'Statues' },
  { id: 'coffee', name: 'Coffee' },
  { id: 'anime', name: 'Anime' },
  { id: 'country', name: 'Country music' },
  { id: 'plush', name: 'Plush' },
  { id: 'weather', name: 'Weather' },
  { id: 'seasonal', name: 'Seasonal' },
  { id: 'billionaire', name: 'Billionaire' },
  { id: 'event', name: 'Event' },
  { id: 'packs', name: 'Packs' },
];

export const RARITIES = [
  { id: 'all', name: 'Any rarity' },
  { id: 'common', name: 'Common' },
  { id: 'uncommon', name: 'Uncommon' },
  { id: 'rare', name: 'Rare' },
  { id: 'epic', name: 'Epic' },
  { id: 'legendary', name: 'Legendary' },
];

const CAT_NAME = Object.fromEntries(CATS.map((c) => [c.id, c.name]));
const THEMES = new Set(['coffee', 'anime', 'country', 'plush']);

export function rarityFor(cost) {
  if (cost >= 3000) return 'legendary';
  if (cost >= 1500) return 'epic';
  if (cost >= 600) return 'rare';
  if (cost >= 200) return 'uncommon';
  return 'common';
}

for (const item of ORIG) {
  item.rarity = rarityFor(item.cost);
  item.catName = CAT_NAME[item.cat];
  item.theme = null;
}
const ORIG_BY_ID = Object.fromEntries(ORIG.map((p) => [p.id, p]));

// name, cat, visual, fpw, fpd, base price
const BASES = [
  ['Carousel', 'rides', 'Carousel', 16, 16, 320],
  ['Swing', 'rides', 'Swing', 10, 6, 90],
  ['Slide', 'rides', 'Slide', 6, 16, 140],
  ['Ferris Wheel', 'rides', 'FerrisWheel', 28, 8, 640],
  ['Teacups', 'rides', 'Carousel', 16, 16, 300],
  ['Drop Tower', 'rides', 'FerrisWheel', 12, 12, 360],
  ['Coaster Track', 'coasters', 'TrackStraight', 4, 12, 100],
  ['Coaster Ramp', 'coasters', 'TrackRamp', 4, 12, 120],
  ['Roller Coaster', 'coasters', 'CoasterLoop', 36, 22, 800],
  ['Coaster Station', 'coasters', 'Stage', 16, 10, 260],
  ['Path Tile', 'paths', 'Path', 8, 8, 70],
  ['Walkway', 'paths', 'Path', 8, 4, 70],
  ['Plaza Tile', 'paths', 'Path', 8, 8, 80],
  ['Garden Bridge', 'paths', 'Platform', 12, 8, 110],
  ['Shade Tree', 'gardens', 'Tree', 8, 8, 90],
  ['Flower Bed', 'gardens', 'Flower', 4, 4, 80],
  ['Hedge', 'gardens', 'Bush', 8, 4, 80],
  ['Planter', 'gardens', 'Planter', 4, 4, 90],
  ['Topiary', 'gardens', 'Bush', 6, 6, 120],
  ['Garden Arch', 'gardens', 'Arch', 12, 4, 140],
  ['Pond', 'water', 'Pond', 12, 12, 200],
  ['Fountain', 'water', 'Fountain', 8, 8, 280],
  ['Waterfall', 'water', 'Fountain', 8, 8, 300],
  ['Lily Pad', 'water', 'Pond', 8, 8, 100],
  ['Coffee Stall', 'food', 'FoodStall', 10, 6, 180],
  ['Snack Cart', 'food', 'FoodStall', 10, 6, 160],
  ['Ice Cream Stand', 'food', 'FoodStall', 10, 6, 170],
  ['Lemonade Stand', 'food', 'FoodStall', 10, 6, 150],
  ['Party Light', 'lights', 'Lights', 4, 4, 80],
  ['Lamp Post', 'lights', 'Lights', 4, 4, 90],
  ['String Lights', 'lights', 'Lights', 8, 4, 100],
  ['Lantern', 'lights', 'Lights', 4, 4, 90],
  ['Fence', 'fences', 'Fence', 8, 2, 70],
  ['Gate', 'fences', 'Gate', 8, 2, 90],
  ['Rail', 'fences', 'Fence', 8, 2, 70],
  ['Statue', 'statues', 'Statue', 6, 6, 160],
  ['Mascot Statue', 'statues', 'Statue', 6, 6, 200],
  ['Hero Plinth', 'statues', 'Statue', 6, 6, 220],
  ['Espresso Cup', 'coffee', 'FoodStall', 8, 8, 240],
  ['Coffee Arch', 'coffee', 'Arch', 12, 4, 200],
  ['Latte Sign', 'coffee', 'LogoSign', 8, 2, 180],
  ['Festival Gate', 'anime', 'Gate', 8, 2, 260],
  ['Neon Alley', 'anime', 'Lights', 8, 8, 240],
  ['Mascot Standee', 'anime', 'Poster', 6, 2, 220],
  ['Barn Stage', 'country', 'Stage', 16, 10, 240],
  ['Hay Seat', 'country', 'Bench', 8, 4, 160],
  ['Guitar Statue', 'country', 'Statue', 6, 6, 200],
  ['Plush Bench', 'plush', 'Bench', 8, 4, 180],
  ['Giant Plush', 'plush', 'Statue', 8, 8, 260],
  ['Ribbon Arch', 'plush', 'Arch', 12, 4, 200],
  ['Rainbow Arch', 'weather', 'Arch', 12, 4, 120],
  ['Wind Spinner', 'weather', 'Flag', 4, 4, 100],
  ['Cloud Seat', 'weather', 'Bench', 8, 4, 110],
  ['Blossom Tree', 'seasonal', 'Tree', 8, 8, 140],
  ['Harvest Cart', 'seasonal', 'FoodStall', 10, 6, 180],
  ['Festival Lantern', 'seasonal', 'Lights', 4, 4, 120],
];

const MATERIALS = [
  { name: 'Wood', mul: 1 },
  { name: 'Metal', mul: 1.15 },
  { name: 'Stone', mul: 1.3 },
];
const COLOURS = [
  { name: 'Pink', hex: 0xff8cc8 },
  { name: 'Hot Pink', hex: 0xff3caa },
  { name: 'Purple', hex: 0x9646dc },
  { name: 'Mint', hex: 0x7ee0b0 },
  { name: 'Sky', hex: 0x7ec8ff },
  { name: 'Gold', hex: 0xffd24a },
];
const SIZES = [
  { name: 'Mini', scale: 0.55, mul: 0.55 },
  { name: 'Standard', scale: 1, mul: 1 },
  { name: 'Large', scale: 1.3, mul: 1.7 },
  { name: 'Grand', scale: 1.65, mul: 2.8 },
];
const STYLES = [
  { name: 'Classic', mul: 1 },
  { name: 'Striped', mul: 1.35 },
  { name: 'Neon', mul: 1.8 },
];

const NCOL = COLOURS.length;
const NSZ = SIZES.length;
const NST = STYLES.length;
const COMBO = MATERIALS.length * NCOL * NSZ * NST;
const GEN_COUNT = TOOL_COUNT - ORIG.length;

function evenFp(v) {
  return Math.max(2, Math.round(v / 2) * 2);
}

export function genItem(n) {
  const typeI = Math.floor(n / COMBO);
  const rem = n % COMBO;
  const base = BASES[typeI];
  const matI = Math.floor(rem / (NCOL * NSZ * NST));
  const rem2 = rem % (NCOL * NSZ * NST);
  const colI = Math.floor(rem2 / (NSZ * NST));
  const rem3 = rem2 % (NSZ * NST);
  const szI = Math.floor(rem3 / NST);
  const stI = rem3 % NST;
  const mat = MATERIALS[matI];
  const col = COLOURS[colI];
  const sz = SIZES[szI];
  const st = STYLES[stI];
  let cost = Math.round(base[5] * sz.mul * st.mul * mat.mul);
  if (cost < 50) cost = 50;
  if (cost > 5000) cost = 5000;
  const cat = base[1];
  return {
    id: 't' + n,
    name: sz.name + ' ' + col.name + ' ' + mat.name + ' ' + st.name + ' ' + base[0],
    cost,
    fp: [evenFp(base[3] * sz.scale), evenFp(base[4] * sz.scale)],
    cat,
    catName: CAT_NAME[cat],
    visual: base[2],
    color: col.name,
    colorHex: col.hex,
    material: mat.name,
    variant: st.name,
    scale: sz.scale,
    tint: true,
    theme: THEMES.has(cat) ? cat : null,
    rarity: rarityFor(cost),
  };
}

const EXTRA = [];
function extra(id, name, cat, visual, fp, cost, hex, theme) {
  EXTRA.push({
    id, name, cost, fp, cat,
    catName: CAT_NAME[cat] || cat,
    visual, colorHex: hex, color: 'Pink',
    rarity: rarityFor(cost), theme, tint: true, scale: 1, variant: 'Classic',
  });
}
extra('xmas0', 'Christmas Tree', 'event', 'Tree', [8, 8], 80, 0x2f8f4e, 'xmas');
extra('xmas1', 'Christmas Wreath', 'event', 'Flower', [4, 4], 50, 0xc0392b, 'xmas');
extra('xmas2', 'Candy Cane Arch', 'event', 'Arch', [12, 4], 160, 0xff3caa, 'xmas');
extra('xmas3', 'Present Pile', 'event', 'Bench', [8, 6], 120, 0x9646dc, 'xmas');
extra('xmas4', 'Snow Lantern', 'event', 'Lights', [4, 4], 90, 0xd7ecff, 'xmas');
extra('xmas5', 'Reindeer Statue', 'event', 'Statue', [6, 6], 240, 0x8b5a2b, 'xmas');
extra('xmas6', 'Cocoa Stall', 'event', 'FoodStall', [10, 6], 200, 0x784b32, 'xmas');
extra('xmas7', 'Star Topper', 'event', 'Flag', [4, 4], 70, 0xffd24a, 'xmas');
extra('xmas8', 'Ice Fountain', 'event', 'Fountain', [8, 8], 280, 0x7ec8ff, 'xmas');
extra('xmas9', 'Sleigh Bench', 'event', 'Bench', [8, 4], 140, 0xc0392b, 'xmas');
extra('xmas10', 'Garland Fence', 'event', 'Fence', [8, 2], 90, 0x2f8f4e, 'xmas');
extra('xmas11', 'Carol Stage', 'event', 'Stage', [16, 10], 360, 0xffd24a, 'xmas');
extra('bill0', 'Billionaire Gate', 'billionaire', 'Gate', [8, 2], 400, 0xffd24a, 'billionaire');
extra('bill1', 'Gold Record Statue', 'billionaire', 'Statue', [6, 6], 480, 0xffd24a, 'billionaire');
extra('bill2', 'Penthouse Stage', 'billionaire', 'Stage', [16, 10], 720, 0x111111, 'billionaire');
extra('bill3', 'Jet Fountain', 'billionaire', 'Fountain', [8, 8], 640, 0x7ec8ff, 'billionaire');
extra('bill4', 'Velvet Rope', 'billionaire', 'Fence', [8, 2], 180, 0x6d1248, 'billionaire');
extra('bill5', 'Champagne Cart', 'billionaire', 'FoodStall', [10, 6], 360, 0xfff0e6, 'billionaire');
extra('bill6', 'Skyline Arch', 'billionaire', 'Arch', [12, 4], 520, 0x7ec8ff, 'billionaire');
extra('bill7', 'Spotlight Tower', 'billionaire', 'Lights', [4, 4], 240, 0xffd24a, 'billionaire');

export const EVENT_TOOLS = EXTRA.filter((item) => item.cat === 'event');
export const BILL_TOOLS = EXTRA.filter((item) => item.cat === 'billionaire');
const EXTRA_BY_ID = Object.fromEntries(EXTRA.map((item) => [item.id, item]));

export const BUNDLES = [
  { id: 'pack-coffee', name: 'Coffee Theme Pack', theme: 'coffee', cost: 5000, rarity: 'legendary', count: 100, cat: 'packs', catName: 'Packs', colorHex: 0x784b32 },
  { id: 'pack-anime', name: 'Anime Theme Pack', theme: 'anime', cost: 5000, rarity: 'legendary', count: 100, cat: 'packs', catName: 'Packs', colorHex: 0xff3caa },
  { id: 'pack-country', name: 'Country Music Pack', theme: 'country', cost: 5000, rarity: 'legendary', count: 100, cat: 'packs', catName: 'Packs', colorHex: 0xc47a3a },
  { id: 'pack-plush', name: 'Plush Theme Pack', theme: 'plush', cost: 5000, rarity: 'legendary', count: 100, cat: 'packs', catName: 'Packs', colorHex: 0xff8cc8 },
];

const sampleCache = new Map();
export function themedSample(theme, n) {
  const key = theme + ':' + n;
  if (sampleCache.has(key)) return sampleCache.get(key);
  const ids = [];
  for (let i = 0; i < TOOL_COUNT && ids.length < n; i++) {
    const item = itemAt(i);
    if (item.theme === theme) ids.push(item.id);
  }
  sampleCache.set(key, ids);
  return ids;
}

export function bundleContents(bundle) {
  return themedSample(bundle.theme, bundle.count || 100);
}

export function starterToolIds() {
  const ids = [];
  for (const theme of ['coffee', 'anime', 'country', 'plush']) {
    const sample = themedSample(theme, 100);
    for (const index of [10, 40, 80]) if (sample[index]) ids.push(sample[index]);
  }
  return ids;
}

export function itemAt(i) {
  if (i < 0 || i >= TOOL_COUNT) return null;
  if (i < ORIG.length) return ORIG_BY_ID[ORIG[i].id];
  return genItem(i - ORIG.length);
}

export function getItem(id) {
  if (id == null) return null;
  if (ORIG_BY_ID[id]) return ORIG_BY_ID[id];
  if (EXTRA_BY_ID[id]) return EXTRA_BY_ID[id];
  if (typeof id === 'string' && id.charCodeAt(0) === 116) {
    const rest = id.slice(1);
    const n = +rest;
    if (String(n) === rest && n >= 0 && n < GEN_COUNT) return genItem(n);
  }
  return null;
}

let catalog = null;
function allItems() {
  if (catalog) return catalog;
  catalog = new Array(TOOL_COUNT);
  for (let i = 0; i < TOOL_COUNT; i++) catalog[i] = itemAt(i);
  return catalog;
}

function slicePage(list, page, pageSize) {
  const size = pageSize > 0 ? pageSize : PAGE_SIZE;
  const start = Math.max(0, page | 0) * size;
  return { total: list.length, items: list.slice(start, start + size) };
}

export function pageTools(cat, query, page, pageSize = PAGE_SIZE, filter) {
  const rarity = (filter && filter.rarity) || 'all';
  const own = (filter && filter.own) || 'all';
  const isOwned = (filter && filter.isOwned) || (() => false);
  const q = (query || '').trim().toLowerCase();
  const matches = (item) => {
    if (rarity !== 'all' && item.rarity !== rarity) return false;
    if (q && item.name.toLowerCase().indexOf(q) < 0 && (item.catName || '').toLowerCase().indexOf(q) < 0) return false;
    const owned = !!isOwned(item.id, item);
    if (own === 'owned' && !owned) return false;
    if (own === 'locked' && owned) return false;
    return true;
  };
  if (cat === 'packs') return slicePage(BUNDLES.filter(matches), page, pageSize);
  if (cat === 'event') return slicePage(EVENT_TOOLS.filter(matches), page, pageSize);
  if (cat === 'billionaire') return slicePage(BILL_TOOLS.filter(matches), page, pageSize);
  const source = allItems();
  if ((!cat || cat === 'all') && !q && rarity === 'all' && own === 'all') {
    return slicePage(source, page, pageSize);
  }
  const list = [];
  for (let i = 0; i < source.length; i++) {
    const item = source[i];
    if (cat && cat !== 'all' && item.cat !== cat) continue;
    if (matches(item)) list.push(item);
  }
  return slicePage(list, page, pageSize);
}
