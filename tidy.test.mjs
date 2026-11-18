import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { autoTidy, movePieces, rotatePieces, pickupPieces, insideBox, snapAxis } from './tidy.js';

const fp = () => [8, 8];

test('auto tidy snaps to the grid and separates overlaps', () => {
  const messy = [
    { id: 'a', x: 1.2, z: 1.2, r: 0, v: 0 },
    { id: 'b', x: 1.4, z: 2, r: 0, v: 0 },
  ];
  const tidy = autoTidy(messy, fp, 4, 48);
  assert.equal(tidy.length, 2);
  assert.equal(snapAxis(tidy[0].x, 8, 4, 48), tidy[0].x);
  assert.notDeepEqual([tidy[0].x, tidy[0].z], [tidy[1].x, tidy[1].z]);
  const again = autoTidy(tidy, fp, 4, 48);
  assert.deepEqual(again, tidy);
});

test('move, rotate, and pick up keep the other pieces', () => {
  const pieces = [
    { id: 'tree', x: 0, z: 0, r: 0, v: 0 },
    { id: 'bench', x: 16, z: 0, r: 0, v: 0 },
  ];
  const moved = movePieces(pieces, [0], 12, 8, fp, 4, 48);
  assert.equal(moved[0].x, 12);
  assert.equal(moved[0].z, 8);
  assert.equal(moved[1].id, 'bench');
  assert.equal(movePieces(pieces, [0], 16, 0, fp, 4, 48), null);
  const turned = rotatePieces(pieces, [1], fp, 4, 48);
  assert.equal(turned[1].r, 1);
  const left = pickupPieces(pieces, [0]);
  assert.deepEqual(left.map((p) => p.id), ['bench']);
});

test('box select uses plot coordinates', () => {
  assert.equal(insideBox({ x: 4, z: 4 }, { x0: 0, z0: 0, x1: 8, z1: 8 }), true);
  assert.equal(insideBox({ x: 20, z: 4 }, { x0: 0, z0: 0, x1: 8, z1: 8 }), false);
});

test('tidy copy has no exclamation marks', () => {
  const files = ['tidy.js', 'game.js', 'index.html'].map((name) => fs.readFileSync(new URL('./' + name, import.meta.url), 'utf8'));
  assert.match(files[1], /bTidy/);
  assert.match(files[1], /Auto-tidy/);
  assert.match(files[2], /id="bTidy"/);
  assert.match(files[1], /Bought tools stay in your list/);
  const quoted = files.slice(0, 2).map((src) => [...src.matchAll(/'([^'\\]|\\.)*'|"([^"\\]|\\.)*"/g)].map((m) => m[0]).join('\n')).join('\n');
  assert.doesNotMatch(quoted, /!/);
});
