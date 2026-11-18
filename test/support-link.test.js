const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const HREF = 'https://www.gofundme.com/f/help-our-family-through-multiple-health-crises-advocacy-st';
const LABEL = 'Support Coffeebreak on GoFundMe';

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

function htmlFiles() {
  const found = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === 'node_modules' || entry.name === '.git') continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith('.html')) found.push(path.relative(root, full));
    }
  }
  walk(root);
  return found.sort();
}

function footerOf(html) {
  const start = html.indexOf('<footer id="cbfoot">');
  const end = html.indexOf('</footer>', start);
  assert.ok(start !== -1 && end !== -1, 'page footer');
  return html.slice(start, end);
}

test('every page has a voluntary support link above Tesla and Starlink', () => {
  const pages = htmlFiles();
  assert.ok(pages.length > 0, 'at least one page');
  for (const rel of pages) {
    const html = read(rel);
    const footer = footerOf(html);
    const tag = footer.match(/<a\b[^>]*class="donate"[^>]*>[\s\S]*?<\/a>/);
    assert.ok(tag, rel + ' support link');
    const anchor = tag[0];
    assert.match(anchor, new RegExp('href="' + HREF.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '"'));
    assert.match(anchor, /target="_blank"/);
    assert.match(anchor, /rel="noopener"/);
    const text = anchor.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    assert.equal(text, LABEL);
    assert.equal(text.includes('!'), false);
    assert.equal(/health|illness|sick|family|karen|darko/i.test(text), false);
    const at = footer.indexOf(anchor);
    assert.ok(at < footer.indexOf('https://www.tesla.com'), rel + ' above Tesla');
    assert.ok(at < footer.indexOf('https://www.starlink.com'), rel + ' above Starlink');
    assert.match(footer, /Karen keeps all rights; buyers may resell physical items but not copy them\./);
    assert.match(footer, /Other brand names are trademarks of their respective owners\. Coffeebreak claims no ownership of them, and they are named only to describe the items\./);
    assert.match(footer, /assets\/logo\.png/);
    assert.match(footer, /href="https:\/\/www\.tesla\.com" target="_blank" rel="noopener">Tesla<\/a>/);
    assert.match(footer, /href="https:\/\/www\.starlink\.com" target="_blank" rel="noopener">Starlink<\/a>/);
    assert.match(footer, /coffeebreaks\.itch\.io/);
    assert.equal(html.indexOf('id="shop"'), html.lastIndexOf('id="shop"'));
    assert.equal(html.slice(html.indexOf('<div id="shop"'), html.indexOf('<footer id="cbfoot">')).includes(HREF), false);
  }
});

test('support link is not a coin pack, cart item, or PayID product', () => {
  const shop = read('shop.js');
  const cart = read('payid-cart/cart.js');
  const mount = read('payid-cart/game-mount.js');
  const html = read('index.html');
  assert.match(shop, /Pay by PayID \(Teachers Mutual Bank\): darkokaz@gmx\.com/);
  assert.match(shop, /Coins have no cash value and can't be exchanged for money\./);
  assert.match(cart, /Pay by PayID \(Teachers Mutual Bank\): darkokaz@gmx\.com/);
  assert.match(mount, /Pay by PayID \(Teachers Mutual Bank\): darkokaz@gmx\.com/);
  assert.match(mount, /Copy PayID/);
  assert.equal(shop.includes(HREF), false);
  assert.equal(cart.includes(HREF), false);
  assert.equal(mount.includes('gofundme.com'), false);
  assert.equal(/donate|gofundme/i.test(html.slice(html.indexOf('id="cb-game-cart-data"'), html.indexOf('</section>'))), false);
});

test('no service worker cache is left on an old name', () => {
  const files = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'tracks' || entry.name === 'test') continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.(js|html|webmanifest)$/.test(entry.name)) files.push(full);
    }
  }
  walk(root);
  const blob = files.map((file) => fs.readFileSync(file, 'utf8')).join('\n');
  assert.equal(/serviceWorker|caches\.open|CACHE_NAME/.test(blob), false);
});
