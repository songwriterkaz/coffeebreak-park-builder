// PWA helpers, ads stub, locale, contrast, share kit, and weekly theme.
export const BILLIONAIRE_URL = 'https://music.apple.com/au/album/billionaire-single/1542958072?l=en-GB';
export const BILLIONAIRE_FILE = 'tracks/billionaire.mp3';
export const SHARE_TAG = '#CoffeebreakParkBuilder';
export const AD_REWARD = 50;
export const AD_CAP = 5;

export const CONTRAST_PAIRS = [
  ['#2a1640', '#ffc2e4'],
  ['#fff8fc', '#4a206e'],
  ['#fff8fc', '#2a1640'],
  ['#2a1640', '#ffffff'],
];

const LOCALES = {
  en: {
    'nav.shop': 'Shop',
    'nav.rewards': 'Rewards',
    'nav.install': 'Install app',
    'shop.title': 'Tool Shop',
    'shop.count': '12,000 tools',
    'rewards.title': 'Rewards',
    'daily.title': 'Daily rewards',
    'pass.title': 'Season pass',
    'share.title': 'Share my park',
    'ads.watch': 'Watch for 50 coins',
    'ads.off': 'Ads are not connected yet.',
    'settings.motion': 'Reduced motion',
    'settings.remind': 'Remind me about daily rewards',
    'gallery.title': 'Featured parks',
    'card.pay': 'Pay by card',
  },
  es: {
    'nav.shop': 'Tienda',
    'nav.rewards': 'Premios',
    'nav.install': 'Instalar app',
    'shop.title': 'Tienda de piezas',
    'shop.count': '12,000 piezas',
    'rewards.title': 'Premios',
    'daily.title': 'Premios diarios',
    'pass.title': 'Pase de temporada',
    'share.title': 'Compartir mi parque',
    'gallery.title': 'Parques destacados',
  },
};

export function locales() {
  return Object.keys(LOCALES);
}

export function t(lang, key) {
  const pack = LOCALES[lang] || LOCALES.en;
  if (pack[key]) return pack[key];
  return LOCALES.en[key] || key;
}

export function applyI18n(root, lang) {
  if (!root || !root.querySelectorAll) return;
  root.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(lang, el.getAttribute('data-i18n'));
  });
}

function channel(hex) {
  const c = hex / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminance(input) {
  const hex = typeof input === 'number' ? input : parseInt(String(input).replace('#', ''), 16);
  const r = (hex >> 16) & 255;
  const g = (hex >> 8) & 255;
  const b = hex & 255;
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrastRatio(a, b) {
  const hi = Math.max(luminance(a), luminance(b));
  const lo = Math.min(luminance(a), luminance(b));
  return (hi + 0.05) / (lo + 0.05);
}

export function billionaireChoice(fileExists) {
  if (fileExists) return { mode: 'file', file: BILLIONAIRE_FILE };
  return { mode: 'link', href: BILLIONAIRE_URL };
}

export function weeklyTheme(weekKey) {
  const themes = ['coffee', 'anime', 'country', 'plush', 'gardens', 'water', 'lights', 'billionaire'];
  let hash = 0;
  const text = String(weekKey || '');
  for (let i = 0; i < text.length; i++) hash = (hash * 33 + text.charCodeAt(i)) >>> 0;
  return themes[hash % themes.length];
}

// TODO: connect a rewarded ad network here. Do not render a fake creative.
export function createAdProvider() {
  return {
    id: 'stub',
    show() {
      return { ok: false, reason: 'unconfigured' };
    },
  };
}

export function claimRewardedAd(ops, day, provider) {
  if (!ops.adsEnabled) return { ok: false, reason: 'disabled' };
  if (ops.adsDay !== day) {
    ops.adsDay = day;
    ops.adsCount = 0;
  }
  if ((ops.adsCount || 0) >= AD_CAP) return { ok: false, reason: 'cap' };
  const result = provider && provider.show ? provider.show() : { ok: false, reason: 'unconfigured' };
  if (!result || !result.ok) return { ok: false, reason: (result && result.reason) || 'unconfigured' };
  ops.adsCount = (ops.adsCount || 0) + 1;
  return { ok: true, coins: AD_REWARD, left: AD_CAP - ops.adsCount };
}

export function canRemind(ops, today, permission) {
  return !!ops.notifyDaily && permission === 'granted' && ops.daily.claimed !== today && ops.notifyDay !== today;
}

export function markReminded(ops, today) {
  ops.notifyDay = today;
}

export const CACHE_VERSION = 'park-builder-v6';
