import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const money = require('./money.js');
const html = fs.readFileSync(new URL('./index.html', import.meta.url), 'utf8');
const shop = fs.readFileSync(new URL('./shop.js', import.meta.url), 'utf8');
const game = fs.readFileSync(new URL('./game.js', import.meta.url), 'utf8');

test('coin packs, PayID label, and donation copy', () => {
  assert.deepEqual(money.PACKS.map((pack) => [pack.coins, pack.price]), [
    [100, 'A$1'],
    [1200, 'A$10'],
    [6500, 'A$50']
  ]);
  assert.equal(money.PAYMENT_LABEL, 'Pay by PayID (Teachers Mutual Bank): darkokaz@gmx.com');
  assert.equal(money.PAYID, 'darkokaz@gmx.com');
  assert.equal(money.GOFUNDME, 'https://www.gofundme.com/f/help-our-family-through-multiple-health-crises-advocacy-st');
  assert.match(money.DONATION_NOTE, /voluntary donation/i);
  assert.match(money.DONATION_NOTE, /does not buy coins or items/i);
  assert.match(money.CREDIT_NOTE, /credited once the payment is checked/i);
  assert.match(money.CREDIT_NOTE, /no cash value/i);
});

test('reference codes are unique and stable per pack', () => {
  const saved = new Map();
  const storage = {
    getItem: (key) => saved.get(key) || null,
    setItem: (key, value) => saved.set(key, value)
  };
  const a = money.refFor(100, storage);
  const b = money.refFor(1200, storage);
  const again = money.refFor(100, storage);
  assert.equal(a, again);
  assert.notEqual(a, b);
  assert.match(a, /^SM-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{10}$/);
  assert.deepEqual(money.copyFields(money.PACKS[0], a), {
    payId: 'darkokaz@gmx.com',
    amount: 'A$1',
    reference: a
  });
});

test('send money panel is in the main bar and the footer', () => {
  assert.match(html, /<button id="bMoney" type="button">Send money<\/button>/);
  assert.match(html, /<button type="button" id="bMoneyFoot">Send money<\/button>/);
  assert.match(html, /id="money"/);
  assert.match(html, /Donate on GoFundMe/);
  assert.match(html, /href="https:\/\/www\.gofundme\.com\/f\/help-our-family-through-multiple-health-crises-advocacy-st" target="_blank" rel="noopener"/);
  assert.match(html, /This is a voluntary donation\. It does not buy coins or items\./);
  assert.match(html, /Pay by PayID \(Teachers Mutual Bank\): darkokaz@gmx\.com/);
  assert.match(html, /100 coins<small>A\$1<\/small>/);
  assert.match(html, /1,200 coins<small>A\$10<\/small>/);
  assert.match(html, /6,500 coins<small>A\$50<\/small>/);
  assert.match(html, /id="copyPayId"/);
  assert.match(html, /id="copyAmount"/);
  assert.match(html, /id="copyRef"/);
  assert.match(html, /Coins are credited once the payment is checked and have no cash value\./);
  assert.match(html, /<script src="money\.js"><\/script>/);
});

test('existing disclaimer, logo, bio, and brand links stay', () => {
  assert.match(html, /src="assets\/logo\.png"/);
  assert.match(html, /Karen keeps all rights; buyers may resell physical items but not copy them\./);
  assert.match(html, /Other brand names are trademarks of their respective owners\./);
  assert.match(html, /href="https:\/\/www\.tesla\.com" target="_blank" rel="noopener">Tesla<\/a>/);
  assert.match(html, /href="https:\/\/www\.starlink\.com" target="_blank" rel="noopener">Starlink<\/a>/);
  assert.match(html, /href="https:\/\/coffeebreaks\.itch\.io"/);
  assert.match(shop, /Coins have no cash value and can't be exchanged for money\./);
});

function quoted(src) {
  return [...src.matchAll(/'([^'\\]|\\.)*'|"([^"\\]|\\.)*"/g)].map((match) => match[0]).join('\n');
}

test('new copy has no exclamation marks, PayPal, Gumroad, or health wording outside the given link', () => {
  const moneyJs = quoted(fs.readFileSync(new URL('./money.js', import.meta.url), 'utf8'));
  const visible = html
    .replace(/href="https:\/\/www\.gofundme\.com\/[^"]+"/g, 'href=""')
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, ' ');
  assert.doesNotMatch(moneyJs, /!/);
  assert.doesNotMatch(visible, /!/);
  assert.doesNotMatch(moneyJs, /paypal|gumroad/i);
  assert.doesNotMatch(visible, /paypal|gumroad/i);
  assert.doesNotMatch(moneyJs, /illness|disease|cancer|hospital|diagnos/i);
  assert.doesNotMatch(visible, /illness|disease|cancer|hospital|diagnos|health|family/i);
});

test('music starts on the first tap and has an on off toggle', () => {
  assert.match(html, /id="bMusicToggle"/);
  assert.match(html, /data-music-toggle="1"/);
  assert.match(game, /function playTrack/);
  assert.match(game, /function toggleMusic/);
  assert.match(game, /pointerdown/);
  assert.match(game, /state\.musicOn/);
  assert.doesNotMatch(game, /state\.track = -1/);
});
