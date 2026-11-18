// PayID coin shop and offline redeem-code checks for Park Builder.
import { classifyCode } from './liveops.js';

const SALT = '7d8b73d384fe30c42d562723a59a2ffb39a90f5431c7b2a945bf8752ff4a5fac';
const REDEEM_KEY = 'CoffeebreakParkBuilder_redeemed_v1';
const PACKS = [
  { coins: 1000, aud: 2, label: '1,000 coins', price: 'AUD $2' },
  { coins: 6000, aud: 10, label: '6,000 coins', price: 'AUD $10' },
  { coins: 15000, aud: 20, label: '15,000 coins', price: 'AUD $20' },
];

export const GIFT_PACKS = [100, 1200, 1000, 6500, 6000, 15000];
const PACK_BY_COINS = Object.fromEntries(PACKS.map(p => [p.coins, p]));
const CODE_RE = new RegExp('^PB-(' + [15000, 6500, 6000, 1200, 1000, 100].join('|') + ')-([0-9A-F]{8})-([0-9A-F]{8})$');

function msg(pack, nonce) {
  return `park-builder:v1:${pack}:${nonce}`;
}

function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let x = 0;
  for (let i = 0; i < a.length; i++) x |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return x === 0;
}

async function hmac8(pack, nonce) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(SALT), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(msg(pack, nonce)));
  return [...new Uint8Array(sig)].map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 8).toUpperCase();
}

function normalizeCode(code) {
  return String(code || '').toUpperCase().replace(/\s+/g, '');
}

function redeemedList() {
  try {
    const v = JSON.parse(localStorage.getItem(REDEEM_KEY) || '[]');
    return Array.isArray(v) ? v.map(normalizeCode) : [];
  } catch (e) {
    return [];
  }
}

function alreadyRedeemed(code) {
  return redeemedList().includes(code);
}

function markRedeemed(code) {
  const list = redeemedList();
  if (!list.includes(code)) list.push(code);
  localStorage.setItem(REDEEM_KEY, JSON.stringify(list));
}

export async function checkCode(raw) {
  const code = normalizeCode(raw);
  const m = CODE_RE.exec(code);
  if (!m) return { ok: false, reason: 'invalid' };
  if (alreadyRedeemed(code)) return { ok: false, reason: 'used' };
  const pack = Number(m[1]);
  const nonce = m[2];
  const mac = m[3];
  if (!crypto.subtle) return { ok: false, reason: 'secure' };
  const expect = await hmac8(pack, nonce);
  if (!safeEqual(mac, expect)) return { ok: false, reason: 'invalid' };
  return { ok: true, code, pack, coins: pack };
}

function newRef() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  let s = 'PB-';
  for (const b of bytes) s += chars[b % chars.length];
  return s;
}

export function setupShop({ state, save, updateCoins, toast, toggle, $, onOwner, onReferral, onGift }) {
  let checkout = null;

  function renderShop() {
    const el = $('shop');
    el.innerHTML = '';
    const h = document.createElement('h3');
    h.textContent = 'Buy coins';
    el.appendChild(h);

    const intro = document.createElement('p');
    intro.textContent = 'Choose a pack and pay by PayID. After your payment lands you will be sent a redeem code.';
    el.appendChild(intro);

    PACKS.forEach(p => {
      const b = document.createElement('button');
      b.className = 'pack' + (checkout && checkout.coins === p.coins ? ' sel' : '');
      b.innerHTML = p.label + '<small>' + p.price + '</small>';
      b.onclick = () => {
        checkout = { coins: p.coins, aud: p.aud, ref: newRef() };
        renderShop();
      };
      el.appendChild(b);
    });

    if (checkout) {
      const pay = document.createElement('div');
      pay.className = 'pay';
      pay.innerHTML =
        '<div>Pay by PayID (Teachers Mutual Bank): darkokaz@gmx.com</div>' +
        '<div>Amount: ' + PACK_BY_COINS[checkout.coins].price + '</div>' +
        '<div>Put this in the PayID description: <b id="orderRef">' + checkout.ref + '</b></div>';
      el.appendChild(pay);
    }

    const redeemLabel = document.createElement('p');
    redeemLabel.textContent = 'Redeem code';
    el.appendChild(redeemLabel);

    const row = document.createElement('div');
    row.className = 'row';
    const input = document.createElement('input');
    input.id = 'redeemCode';
    input.type = 'text';
    input.autocomplete = 'off';
    input.spellcheck = false;
    input.placeholder = 'Paste your code';
    input.setAttribute('aria-label', 'Redeem code');
    const go = document.createElement('button');
    go.id = 'redeemBtn';
    go.textContent = 'Redeem';
    go.onclick = () => redeemFromBox();
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); redeemFromBox(); }
    });
    row.appendChild(input);
    row.appendChild(go);
    el.appendChild(row);

    const disclaimer = document.createElement('p');
    disclaimer.className = 'note';
    disclaimer.id = 'coinDisclaimer';
    disclaimer.textContent = "Coins have no cash value and can't be exchanged for money.";
    el.appendChild(disclaimer);
  }

  async function redeemFromBox() {
    const input = $('redeemCode');
    const raw = input ? input.value : '';
    if (!normalizeCode(raw)) return toast('Enter a redeem code first');
    const kind = classifyCode(raw);
    if (kind.type === 'owner') {
      if (onOwner) onOwner();
      else toast('Owner tools unlocked');
      return;
    }
    if (kind.type === 'referral') {
      if (onReferral) onReferral(kind.code);
      else toast('Enter referral codes from Rewards. Gift codes stay here.');
      return;
    }
    const result = await checkCode(raw);
    if (!result.ok) {
      if (result.reason === 'used') return toast('That code has already been used');
      if (result.reason === 'secure') return toast('Open this game over https to redeem a code');
      return toast('That code is not valid');
    }
    markRedeemed(result.code);
    state.coins += result.coins;
    updateCoins();
    save();
    if (onGift) onGift(result);
    if (input) input.value = '';
    const pack = PACK_BY_COINS[result.coins];
    toast('Added ' + (pack ? pack.label : result.coins + ' coins'));
  }

  $('bShop').onclick = () => toggle('shop', renderShop);
  $('coins').style.cursor = 'pointer';
  $('coins').onclick = () => toggle('shop', renderShop);
  $('coins').title = 'Buy coins';
}
