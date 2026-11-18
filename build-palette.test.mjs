import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const tools = await import('./tools.js');
const game = fs.readFileSync(new URL('./game.js', import.meta.url), 'utf8');

test('every build category has a placeable tool with a real footprint', () => {
  const skip = new Set(['all', 'packs']);
  for (const cat of tools.CATS) {
    if (skip.has(cat.id)) continue;
    const page = tools.pageTools(cat.id, '', 0, 4, {});
    assert.ok(page.total > 0, cat.id);
    const item = page.items[0];
    assert.equal(item.cat, cat.id);
    assert.ok(item.visual);
    assert.ok(item.fp[0] >= 2 && item.fp[0] <= 80);
    assert.ok(item.fp[1] >= 2 && item.fp[1] <= 80);
    assert.equal(tools.getItem(item.id).id, item.id);
  }
});

test('the build palette lists locked category tools and a ground tap places', () => {
  assert.doesNotMatch(game, /own:\s*'owned'/);
  assert.match(game, /snapGhost\(\);\s*place\(\)/);
});
