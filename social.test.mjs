import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { sanitizeName } from './character.js';
import {
  filterChat, inviteLink, playerName, roomFromUrl, roomName, rosterOk, tallyFrom, tallyOk, validDevice, visitDelta, visitorDay,
} from './social.js';

test('room codes and invite links stay on the park path', () => {
  assert.equal(roomName(''), 'park');
  assert.equal(roomName('Blue Jam!'), 'bluejam');
  assert.equal(roomName('abcdefghijklmnopqrstuvwxyz'), 'abcdefghijkl');
  assert.equal(roomFromUrl('https://songwriterkaz.github.io/coffeebreak-park-builder/'), '');
  assert.equal(roomFromUrl('https://songwriterkaz.github.io/coffeebreak-park-builder/?room=Mia'), 'mia');
  const link = inviteLink('https://songwriterkaz.github.io/coffeebreak-park-builder/#p=abc', 'Mia');
  assert.equal(link, 'https://songwriterkaz.github.io/coffeebreak-park-builder/?room=mia#p=abc');
});

test('display names match the character name rules', () => {
  for (const sample of ['Ava', 'Bo 3', '  Sam ', 'nope!', 'x'.repeat(40), '']) {
    assert.equal(playerName(sample), sanitizeName(sample));
  }
});

test('visitor tally counts a device once per day and once ever', () => {
  const day = '2026-11-25';
  const next = '2026-11-26';
  const a = '8c0b6a0e-7c3d-4b2a-9f10-123456789abc';
  const b = '11111111-2222-4333-8444-555555555555';
  assert.equal(validDevice(a), true);
  assert.equal(validDevice('not-a-device'), false);
  assert.equal(visitorDay(new Date('2026-11-25T12:00:00Z')), '2026-11-25');
  let rows = [];
  function apply(device, when) {
    const found = rows.find((row) => row.id === device) || null;
    const delta = visitDelta(found, device, when);
    if (delta.action === 'insert') rows.push({ id: device, first_day: delta.first_day, last_day: delta.last_day });
    else if (delta.action === 'update') found.last_day = delta.last_day;
    return tallyFrom(rows, when);
  }
  const first = apply(a, day);
  assert.deepEqual(first, { total: 1, today: 1, day });
  assert.deepEqual(apply(a, day), { total: 1, today: 1, day });
  assert.deepEqual(apply(b, day), { total: 2, today: 2, day });
  assert.deepEqual(apply(a, next), { total: 2, today: 1, day: next });
  assert.equal(visitDelta(null, 'nope', day).action, 'reject');
  assert.equal(tallyOk({ total: 2, today: 1 }), true);
  assert.equal(tallyOk({ total: 1, today: 2 }), false);
  assert.equal(rosterOk({ count: 1, names: [{ id: 'a', name: 'Ava' }] }), true);
  assert.equal(rosterOk({ count: 2, names: [{ id: 'a', name: 'Ava' }] }), false);
});

test('chat hides basic profanity and keeps ordinary words', () => {
  assert.equal(filterChat('Hello park'), 'Hello park');
  assert.equal(filterChat('what the f.u.c.k'), 'what the ****');
  assert.equal(filterChat('sh1t happens'), '**** happens');
  assert.equal(filterChat('class pass'), 'class pass');
  assert.equal(filterChat('   '), '');
  assert.equal(filterChat('x'.repeat(200)).length, 140);
});

test('worker module loads without inventing players', async () => {
  const mod = await import('./worker/worker.js');
  assert.equal(typeof mod.default.fetch, 'function');
  assert.equal(typeof mod.ParkRoom, 'function');
});

test('the park screen asks people to join and keeps the PayID line', () => {
  const html = fs.readFileSync(new URL('./index.html', import.meta.url), 'utf8');
  const sw = fs.readFileSync(new URL('./sw.js', import.meta.url), 'utf8');
  const game = fs.readFileSync(new URL('./game.js', import.meta.url), 'utf8');
  const worker = fs.readFileSync(new URL('./worker/worker.js', import.meta.url), 'utf8');
  assert.match(html, /id="joinPark"/);
  assert.match(html, /Join the park/);
  assert.match(html, /id="bJoin"/);
  assert.match(html, /People in the park now/);
  assert.match(html, /id="peopleList"/);
  assert.match(html, /id="chatLog"/);
  assert.match(html, /Pay by PayID \(Teachers Mutual Bank\): darkokaz@gmx\.com/);
  assert.match(html, /https:\/\/www\.tesla\.com/);
  assert.match(html, /https:\/\/www\.starlink\.com/);
  assert.match(html, /https:\/\/coffeebreaks\.itch\.io/);
  assert.match(sw, /park-builder-v6/);
  assert.match(sw, /social\.js/);
  assert.match(game, /joinPark/);
  assert.match(game, /postVisit/);
  assert.doesNotMatch(worker, /botName|fakePlayers|setInterval\(/);
  const visible = html
    .replace(/href="https:\/\/www\.gofundme\.com\/[^"]+"/g, 'href=""')
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, ' ');
  assert.doesNotMatch(visible, /!/);
});
