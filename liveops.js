// Local retention economy. Fixed rewards only. No random paid prizes.
import { starterToolIds } from './tools.js';

export const DAILY_COINS = [25, 40, 50, 75, 100, 150, 300];
export const SEASON = { id: '2026-1', tiers: 30, xpPerTier: 50, premiumCost: 1200 };
export const XP_PLACE = 15;
export const XP_VISITOR = 10;
export const REFERRAL_BONUS = 100;
export const OWNER_CODE = 'CB-OWNER-7D8B73D3';
export const INCOME_CAP_MS = 8 * 60 * 60 * 1000;
const RF = /^RF-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/;
const ALPH = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const RARITY_WEIGHT = { common: 1, uncommon: 2, rare: 4, epic: 8, legendary: 16 };

function fill(ops) {
  ops = ops || {};
  ops.daily = ops.daily || { claimed: '', streak: 0 };
  ops.season = Object.assign({ xp: 0, premium: false, free: {}, prem: {} }, ops.season || {});
  if (!ops.season.free) ops.season.free = {};
  if (!ops.season.prem) ops.season.prem = {};
  ops.quests = ops.quests || { claimed: {} };
  if (!ops.quests.claimed) ops.quests.claimed = {};
  ops.achievements = ops.achievements || {};
  ops.stats = Object.assign({ place: 0, visitors: 0, buy: 0, owned: 0, share: 0, visit: 0, streak: 0, xmas: 0 }, ops.stats || {});
  ops.starter = ops.starter || { claimed: false };
  ops.likes = ops.likes || {};
  ops.referral = Object.assign({ code: '', used: '', pending: [] }, ops.referral || {});
  if (!Array.isArray(ops.referral.pending)) ops.referral.pending = [];
  if (ops.pendingCoins == null) ops.pendingCoins = 0;
  if (ops.tickets == null) ops.tickets = 0;
  if (ops.lastIncomeAt == null) ops.lastIncomeAt = 0;
  if (ops.lastVisitorCoinAt == null) ops.lastVisitorCoinAt = 0;
  if (ops.visitorCoinFrac == null) ops.visitorCoinFrac = 0;
  if (ops.visitorCoins == null) ops.visitorCoins = 0;
  ops.eventClaimed = ops.eventClaimed || {};
  if (ops.vip !== true) ops.vip = false;
  if (ops.owner !== true) ops.owner = false;
  if (ops.adsEnabled !== true) ops.adsEnabled = false;
  ops.analytics = Object.assign({ sessions: 0, purchasesStarted: 0, toolsBought: 0 }, ops.analytics || {});
  ops.board = Object.assign({ rating: 0, visitors: 0, entries: [] }, ops.board || {});
  if (!Array.isArray(ops.board.entries)) ops.board.entries = [];
  if (ops.notifyDaily !== true) ops.notifyDaily = false;
  if (ops.reduceMotion !== true) ops.reduceMotion = false;
  if (!ops.lang) ops.lang = 'en';
  return ops;
}

export function ensureOps(input) {
  if (input && ('coins' in input || 'pieces' in input || 'ops' in input)) {
    input.ops = fill(input.ops);
    return input.ops;
  }
  return fill(input || {});
}

export function prevDay(key) {
  const parts = String(key).split('-').map(Number);
  const t = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2] - 1));
  return t.toISOString().slice(0, 10);
}

export function dayKey(date) {
  return new Date(date).toISOString().slice(0, 10);
}

export function weekKey(date) {
  const src = new Date(date);
  const d = new Date(Date.UTC(src.getUTCFullYear(), src.getUTCMonth(), src.getUTCDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() - day + 1);
  return d.toISOString().slice(0, 10);
}

export function claimDaily(ops, today) {
  if (ops.daily.claimed === today) return { ok: false, reason: 'claimed' };
  const streak = ops.daily.claimed === prevDay(today) ? ops.daily.streak + 1 : 1;
  const day = ((streak - 1) % 7) + 1;
  const coins = DAILY_COINS[day - 1];
  ops.daily = { claimed: today, streak };
  ops.stats.streak = streak;
  return { ok: true, coins, streak, day };
}

export function tierReached(xp) {
  return Math.max(0, Math.min(SEASON.tiers, Math.floor((xp || 0) / SEASON.xpPerTier)));
}

export function tierReward(track, tier) {
  if (track === 'prem') {
    if (tier % 5 === 0) return { coins: 80, tool: 't' + (tier * 17) };
    return { coins: 30 };
  }
  return { coins: tier % 5 === 0 ? 50 : 15 };
}

export function claimTier(ops, track, tier) {
  tier = tier | 0;
  if (tier < 1 || tier > SEASON.tiers) return { ok: false, reason: 'tier' };
  if (tierReached(ops.season.xp) < tier) return { ok: false, reason: 'xp' };
  if (track === 'prem' && !ops.season.premium) return { ok: false, reason: 'premium' };
  const bag = track === 'prem' ? ops.season.prem : ops.season.free;
  if (bag[tier]) return { ok: false, reason: 'claimed' };
  bag[tier] = true;
  const reward = tierReward(track, tier);
  return { ok: true, reward };
}

export function buyPremium(ops, coins) {
  if (ops.season.premium) return { ok: false, reason: 'owned' };
  if ((coins | 0) < SEASON.premiumCost) return { ok: false, reason: 'coins' };
  ops.season.premium = true;
  return { ok: true, cost: SEASON.premiumCost };
}

export function grantXp(ops, n) {
  ops.season.xp += n;
  return ops.season.xp;
}

export const ACHIEVEMENTS = [
  { id: 'place-1', name: 'First piece', stat: 'place', goal: 1, coins: 20, xp: 10 },
  { id: 'place-10', name: 'Ten pieces', stat: 'place', goal: 10, coins: 40, xp: 20 },
  { id: 'place-50', name: 'Fifty pieces', stat: 'place', goal: 50, coins: 100, xp: 50 },
  { id: 'own-10', name: 'Collector', stat: 'owned', goal: 10, coins: 30, xp: 20 },
  { id: 'streak-7', name: 'Week of visits', stat: 'streak', goal: 7, coins: 80, xp: 40 },
  { id: 'share-1', name: 'Shared a park', stat: 'share', goal: 1, coins: 20, xp: 15 },
  { id: 'visit-1', name: 'Visited a friend', stat: 'visit', goal: 1, coins: 20, xp: 15 },
];

export function questsFor(day, week) {
  return {
    daily: [
      { id: 'place:' + day, name: 'Place 3 pieces', stat: 'place', goal: 3, coins: 20, xp: 30 },
      { id: 'visit:' + day, name: 'Welcome a visitor', stat: 'visitors', goal: 1, coins: 15, xp: 20 },
      { id: 'buy:' + day, name: 'Buy a tool', stat: 'buy', goal: 1, coins: 15, xp: 20 },
    ],
    weekly: [
      { id: 'place-week:' + week, name: 'Place 15 pieces this week', stat: 'place', goal: 15, coins: 80, xp: 100 },
    ],
  };
}

export function addStat(ops, stat, n) {
  ops.stats[stat] = (ops.stats[stat] || 0) + n;
  return ops.stats[stat];
}

export function claimQuest(ops, quest) {
  if (ops.quests.claimed[quest.id]) return { ok: false, reason: 'claimed' };
  if ((ops.stats[quest.stat] || 0) < quest.goal) return { ok: false, reason: 'progress' };
  ops.quests.claimed[quest.id] = true;
  grantXp(ops, quest.xp);
  return { ok: true, coins: quest.coins, xp: quest.xp };
}

export function claimAchievement(ops, achievement) {
  if (ops.achievements[achievement.id]) return { ok: false, reason: 'claimed' };
  if ((ops.stats[achievement.stat] || 0) < achievement.goal) return { ok: false, reason: 'progress' };
  ops.achievements[achievement.id] = true;
  grantXp(ops, achievement.xp);
  return { ok: true, coins: achievement.coins, xp: achievement.xp };
}

export function starterOffer(getItem) {
  const tools = starterToolIds().map(getItem).filter(Boolean);
  const worth = tools.reduce((sum, item) => sum + item.cost, 0);
  return { coins: 1200, price: 'A$10', tools, worth };
}

export function noteGiftCredit(ops, coins) {
  if (coins >= 1200 && !ops.starter.claimed) {
    ops.starter.claimed = true;
    return { starter: true, tools: starterToolIds() };
  }
  return { starter: false, tools: [] };
}

function bytesToB64(text) {
  const bytes = new TextEncoder().encode(text);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  const b64 = typeof btoa === 'function' ? btoa(bin) : Buffer.from(bytes).toString('base64');
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function b64ToText(code) {
  const pad = code.length % 4 === 0 ? '' : '='.repeat(4 - (code.length % 4));
  const b64 = code.replace(/-/g, '+').replace(/_/g, '/') + pad;
  const bin = typeof atob === 'function' ? atob(b64) : Buffer.from(b64, 'base64').toString('binary');
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

export function encodePark(pieces) {
  const slim = (pieces || []).map((p) => [p.id, p.x | 0, p.z | 0, p.r | 0, p.v | 0]);
  return bytesToB64(JSON.stringify(slim));
}

export function decodePark(code, getItem) {
  let data;
  try { data = JSON.parse(b64ToText(String(code || ''))); } catch (e) { return []; }
  if (!Array.isArray(data)) return [];
  const out = [];
  for (const row of data) {
    if (!Array.isArray(row) || !getItem(row[0])) continue;
    out.push({ id: row[0], x: Number(row[1]) || 0, z: Number(row[2]) || 0, r: Number(row[3]) || 0, v: Number(row[4]) || 0 });
    if (out.length >= 150) break;
  }
  return out;
}

export function likeKey(code) {
  let h = 2166136261;
  const s = String(code || '');
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return 'k' + (h >>> 0).toString(36);
}

export function likePark(ops, code) {
  const key = likeKey(code);
  ops.likes[key] = true;
  return { liked: true, key };
}

export function parkUrl(base, code) {
  return String(base || '').split('#')[0] + '#p=' + code;
}

export function codeFromUrl(url) {
  const match = String(url || '').match(/#p=([^&]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}

export function ensureReferral(ops, bytes) {
  if (RF.test(ops.referral.code)) return ops.referral.code;
  let buf = bytes;
  if (!buf || buf.length < 6) {
    buf = new Uint8Array(6);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) crypto.getRandomValues(buf);
    else for (let i = 0; i < 6; i++) buf[i] = Math.floor(Math.random() * 256);
  }
  let s = 'RF-';
  for (let i = 0; i < 6; i++) s += ALPH[buf[i] % ALPH.length];
  ops.referral.code = s;
  return s;
}

export function enterReferral(ops, input) {
  const code = String(input || '').toUpperCase().replace(/\s+/g, '');
  if (!RF.test(code)) return { ok: false, reason: 'invalid' };
  if (code === ops.referral.code) return { ok: false, reason: 'self' };
  if (ops.referral.used) return { ok: false, reason: 'used' };
  ops.referral.used = code;
  ops.referral.pending.push({ code, self: REFERRAL_BONUS, friend: REFERRAL_BONUS, status: 'earned' });
  return { ok: true, status: 'earned', coins: REFERRAL_BONUS, friend: REFERRAL_BONUS };
}

export function classifyCode(raw) {
  const code = String(raw || '').toUpperCase().replace(/\s+/g, '');
  if (code === OWNER_CODE) return { type: 'owner', code };
  if (RF.test(code)) return { type: 'referral', code };
  if (/^PB-\d+-[0-9A-F]{8}-[0-9A-F]{8}$/.test(code)) return { type: 'gift', code };
  return { type: 'unknown', code };
}

export function applyOwner(ops) {
  ops.owner = true;
  ops.vip = true;
  const coins = ops.pendingCoins || 0;
  ops.pendingCoins = 0;
  for (const row of ops.referral.pending) {
    if (row.status === 'pending') row.status = 'verified';
  }
  return { owner: true, vip: true, coins };
}

export function eventState(date) {
  const t = new Date(date).getTime();
  const start = Date.parse('2026-12-01T00:00:00Z');
  const end = Date.parse('2026-12-31T23:59:59Z');
  if (t < start) return { phase: 'before', days: Math.ceil((start - t) / 86400000), id: 'xmas-2026' };
  if (t > end) return { phase: 'after', days: 0, id: 'xmas-2026' };
  return { phase: 'live', days: Math.max(1, Math.ceil((end - t) / 86400000)), id: 'xmas-2026' };
}

export function eventQuests() {
  return [
    { id: 'xmas-place-1', name: 'Place a Christmas piece', stat: 'xmas', goal: 1, coins: 40, xp: 40 },
    { id: 'xmas-place-3', name: 'Place 3 Christmas pieces', stat: 'xmas', goal: 3, coins: 80, xp: 60 },
  ];
}

export function parkRating(pieces, getItem) {
  let rating = 0;
  for (const piece of pieces || []) {
    const item = getItem(piece.id);
    if (!item) continue;
    rating += RARITY_WEIGHT[item.rarity] || 1;
  }
  return rating;
}

export function accrueVisitorCoins(ops, pieces, getItem, now) {
  if (!ops.lastVisitorCoinAt) {
    ops.lastVisitorCoinAt = now;
    return 0;
  }
  const elapsed = Math.max(0, Math.min(INCOME_CAP_MS, now - ops.lastVisitorCoinAt));
  const rating = parkRating(pieces, getItem);
  ops.visitorCoinFrac = (ops.visitorCoinFrac || 0) + (rating * elapsed) / 600000;
  const coins = Math.floor(ops.visitorCoinFrac);
  ops.visitorCoinFrac -= coins;
  ops.lastVisitorCoinAt = now;
  ops.visitorCoins = (ops.visitorCoins || 0) + coins;
  return coins;
}

export function accrueTickets(ops, pieces, getItem, now) {
  if (!ops) return 0;
  if (!ops.lastIncomeAt) {
    ops.lastIncomeAt = now;
    ops.rating = parkRating(pieces, getItem);
    return 0;
  }
  const elapsed = Math.max(0, Math.min(INCOME_CAP_MS, now - ops.lastIncomeAt));
  const rating = parkRating(pieces, getItem);
  const tickets = Math.floor((rating * elapsed) / 600000);
  ops.tickets = (ops.tickets || 0) + tickets;
  ops.lastIncomeAt = now;
  ops.rating = rating;
  return tickets;
}

export function countSession(ops) { ops.analytics.sessions += 1; }
export function countPurchase(ops) { ops.analytics.purchasesStarted += 1; }
export function countTools(ops, n) { ops.analytics.toolsBought += n || 1; }

export function recordScore(ops, rating, visitors) {
  ops.board.rating = Math.max(ops.board.rating || 0, rating | 0);
  ops.board.visitors = Math.max(ops.board.visitors || 0, visitors | 0);
  ops.board.entries.push({ rating: rating | 0, visitors: visitors | 0, at: Date.now() });
  if (ops.board.entries.length > 20) ops.board.entries = ops.board.entries.slice(-20);
  return ops.board;
}

export function noteWeekly(ops, week, theme, item) {
  if (!ops.weekly || ops.weekly.week !== week) ops.weekly = { week, theme, count: 0, claimed: false };
  if (item && (item.theme === theme || item.cat === theme)) ops.weekly.count += 1;
  return ops.weekly;
}

export function claimWeekly(ops) {
  if (!ops.weekly) return { ok: false, reason: 'progress' };
  if (ops.weekly.claimed) return { ok: false, reason: 'claimed' };
  if (ops.weekly.count < 3) return { ok: false, reason: 'progress' };
  ops.weekly.claimed = true;
  grantXp(ops, 40);
  return { ok: true, coins: 40, xp: 40 };
}
