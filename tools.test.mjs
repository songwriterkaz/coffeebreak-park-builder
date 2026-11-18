import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const tools = await import('./tools.js');

test('catalog has 12,000 deterministic tools with unique names', () => {
  assert.equal(tools.TOOL_COUNT, 12000);
  const first = tools.itemAt(0);
  const generated = tools.itemAt(15);
  const last = tools.itemAt(11999);
  assert.equal(tools.itemAt(15).id, generated.id);
  assert.deepEqual(tools.itemAt(15), generated);
  assert.equal(tools.getItem(generated.id).name, generated.name);
  assert.equal(tools.getItem(last.id).name, last.name);
  assert.notEqual(first.id, generated.id);
  const names = new Set();
  const rarities = new Set();
  for (let i = 0; i < tools.TOOL_COUNT; i++) {
    const item = tools.itemAt(i);
    assert.equal(names.has(item.name), false, item.name);
    names.add(item.name);
    assert.ok(item.cost === 0 || (item.cost >= 50 && item.cost <= 5000));
    assert.match(item.rarity, /^(common|uncommon|rare|epic|legendary)$/);
    rarities.add(item.rarity);
    assert.equal(typeof item.colorHex, 'number');
    assert.ok(item.cat && item.catName);
  }
  for (const rarity of ['common', 'uncommon', 'rare', 'epic', 'legendary']) {
    assert.equal(rarities.has(rarity), true, rarity);
  }
});

test('categories cover rides, gardens, themes, weather and seasonal items', () => {
  const ids = tools.CATS.map((cat) => cat.id);
  for (const id of ['rides', 'coasters', 'paths', 'gardens', 'water', 'food', 'lights', 'fences', 'statues', 'coffee', 'anime', 'country', 'plush', 'weather', 'seasonal', 'packs', 'event']) {
    assert.equal(ids.includes(id), true, id);
  }
  const seen = new Set();
  for (let i = 0; i < tools.TOOL_COUNT; i++) seen.add(tools.itemAt(i).cat);
  for (const id of ['rides', 'coasters', 'paths', 'gardens', 'water', 'food', 'lights', 'fences', 'statues', 'coffee', 'anime', 'country', 'plush', 'weather', 'seasonal']) {
    assert.equal(seen.has(id), true, id);
  }
});

test('themed packs contain 100 tools and cost fewer coins than the pieces alone', () => {
  assert.ok(tools.BUNDLES.length >= 3);
  for (const bundle of tools.BUNDLES) {
    const ids = tools.bundleContents(bundle);
    assert.equal(ids.length, 100);
    assert.equal(new Set(ids).size, 100);
    assert.ok(bundle.cost >= 50 && bundle.cost <= 5000);
    const worth = ids.reduce((sum, id) => sum + tools.getItem(id).cost, 0);
    assert.ok(worth > bundle.cost);
    assert.equal(tools.getItem(ids[0]).theme, bundle.theme);
  }
});

test('shop pages filter by rarity and ownership without listing the whole catalog', () => {
  const owned = new Set(['Speaker']);
  const page = tools.pageTools('rides', '', 0, 8, { rarity: 'common', own: 'locked', isOwned: (id) => owned.has(id) });
  assert.ok(page.total > 0);
  assert.ok(page.items.length <= 8);
  for (const item of page.items) {
    assert.equal(item.cat, 'rides');
    assert.equal(item.rarity, 'common');
    assert.equal(owned.has(item.id), false);
  }
  const all = tools.pageTools('all', '', 0, 8, {});
  assert.equal(all.total, 12000);
  assert.equal(all.items.length, 8);
  const packs = tools.pageTools('packs', '', 0, 8, {});
  assert.equal(packs.total, tools.BUNDLES.length);
});

test('catalog source stays a compact generator', () => {
  const src = fs.readFileSync(new URL('./tools.js', import.meta.url), 'utf8');
  assert.ok(src.length < 40000);
  assert.match(src, /function genItem/);
  assert.doesNotMatch(src, /loot\s*box|gacha|paypal/i);
  assert.doesNotMatch([...src.matchAll(/'([^'\\]|\\.)*'|"([^"\\]|\\.)*"/g)].map((match) => match[0]).join('\n'), /!/);
});
