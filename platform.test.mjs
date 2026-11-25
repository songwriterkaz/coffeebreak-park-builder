import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const platform = await import('./platform.js');
const live = await import('./liveops.js');
const require = createRequire(import.meta.url);
const money = require('./money.js');
const html = fs.readFileSync(new URL('./index.html', import.meta.url), 'utf8');

test('text colours clear the AA contrast bar', () => {
  for (const [a, b] of platform.CONTRAST_PAIRS) {
    const ratio = platform.contrastRatio(a, b);
    assert.ok(ratio >= 4.5, a + ' on ' + b + ' is ' + ratio.toFixed(2));
  }
  for (const hex of ['#2a1640', '#ffc2e4', '#fff8fc', '#4a206e']) {
    assert.match(html, new RegExp(hex, 'i'));
  }
});

test('language picker falls back to English', () => {
  assert.deepEqual(platform.locales(), ['en', 'es']);
  assert.equal(platform.t('es', 'nav.shop'), 'Tienda');
  assert.equal(platform.t('es', 'ads.watch'), 'Watch for 50 coins');
  assert.equal(platform.t('nope', 'shop.title'), 'Tool Shop');
});

test('weekly theme stays the same for a week key', () => {
  assert.equal(platform.weeklyTheme('2026-11-16'), platform.weeklyTheme('2026-11-16'));
  assert.equal(typeof platform.weeklyTheme('2026-11-16'), 'string');
});

test('Billionaire plays a file only when that file exists', () => {
  assert.equal(platform.billionaireChoice(false).href, 'https://music.apple.com/au/album/billionaire-single/1542958072?l=en-GB');
  assert.equal(platform.billionaireChoice(true).file, 'tracks/billionaire.mp3');
  assert.equal(fs.existsSync(new URL('./tracks/billionaire.mp3', import.meta.url)), false);
});

test('rewarded ads stay disabled and never invent a creative', () => {
  const ops = live.ensureOps({});
  const ok = { show() { return { ok: true }; } };
  assert.equal(platform.claimRewardedAd(ops, '2026-11-18', ok).reason, 'disabled');
  ops.adsEnabled = true;
  for (let i = 0; i < 5; i++) assert.equal(platform.claimRewardedAd(ops, '2026-11-18', ok).coins, 50);
  assert.equal(platform.claimRewardedAd(ops, '2026-11-18', ok).reason, 'cap');
  assert.equal(platform.createAdProvider().show().ok, false);
  assert.match(fs.readFileSync(new URL('./platform.js', import.meta.url), 'utf8'), /TODO: connect a rewarded ad network/);
});

test('card pay is hidden until a Stripe Payment Link is set', () => {
  assert.equal(money.cardLink(''), '');
  assert.equal(money.cardLink('not a url'), '');
  assert.equal(money.cardLink('https://buy.stripe.com/test_123'), 'https://buy.stripe.com/test_123');
  assert.match(fs.readFileSync(new URL('./payments.config.js', import.meta.url), 'utf8'), /stripePaymentLink: ''/);
  assert.match(html, /id="payCard" hidden/);
  assert.match(html, /Pay by card/);
});

test('the app is installable and does not add external IAP', () => {
  const manifest = fs.readFileSync(new URL('./manifest.webmanifest', import.meta.url), 'utf8');
  const sw = fs.readFileSync(new URL('./sw.js', import.meta.url), 'utf8');
  assert.match(html, /rel="manifest"/);
  assert.match(html, /id="bInstall"/);
  assert.match(manifest, /"display": "standalone"/);
  assert.match(sw, /park-builder-v6/);
  assert.match(html, /serviceWorker|sw\.js/);
  assert.doesNotMatch(manifest + sw, /paypal|billing|RevenueCat/i);
});

test('featured parks are a curated file with a submit path and no backend', () => {
  const gallery = JSON.parse(fs.readFileSync(new URL('./gallery.json', import.meta.url), 'utf8'));
  assert.ok(Array.isArray(gallery.parks));
  assert.match(fs.readFileSync(new URL('./rewards.js', import.meta.url), 'utf8'), /Submit to gallery/);
  assert.match(fs.readFileSync(new URL('./rewards.js', import.meta.url), 'utf8'), /no upload/);
  assert.match(fs.readFileSync(new URL('./gallery.html', import.meta.url), 'utf8'), /Featured parks/);
});
