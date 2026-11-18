import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const live = await import('./liveops.js');
const tools = await import('./tools.js');
const require = createRequire(import.meta.url);
const shop = await import('./shop.js');
const html = fs.readFileSync(new URL('./index.html', import.meta.url), 'utf8');
const game = fs.readFileSync(new URL('./game.js', import.meta.url), 'utf8');

function quoted(src) {
  return [...src.matchAll(/'([^'\\]|\\.)*'|"([^"\\]|\\.)*"/g)].map((match) => match[0]).join('\n');
}

test('daily login pays a fixed 7 day calendar and keeps a streak', () => {
  const ops = live.ensureOps({});
  const first = live.claimDaily(ops, '2026-11-18');
  assert.equal(first.ok, true);
  assert.equal(first.day, 1);
  assert.equal(first.coins, live.DAILY_COINS[0]);
  assert.equal(live.claimDaily(ops, '2026-11-18').ok, false);
  const next = live.claimDaily(ops, '2026-11-19');
  assert.equal(next.streak, 2);
  assert.equal(next.coins, live.DAILY_COINS[1]);
  const reset = live.claimDaily(ops, '2026-11-21');
  assert.equal(reset.streak, 1);
  assert.equal(live.DAILY_COINS.length, 7);
  assert.ok(live.DAILY_COINS.every((n) => n > 0 && n <= 300));
});

test('season pass has 30 tiers, a 1,200 coin premium track, and fixed rewards', () => {
  const ops = live.ensureOps({});
  assert.equal(live.SEASON.tiers, 30);
  assert.equal(live.SEASON.premiumCost, 1200);
  assert.equal(live.tierReached(0), 0);
  assert.equal(live.tierReached(live.SEASON.xpPerTier * 30), 30);
  ops.season.xp = live.SEASON.xpPerTier * 5;
  assert.equal(live.claimTier(ops, 'free', 5).ok, true);
  assert.equal(live.claimTier(ops, 'free', 5).reason, 'claimed');
  assert.equal(live.claimTier(ops, 'prem', 5).reason, 'premium');
  const bought = live.buyPremium(ops, 1200);
  assert.equal(bought.ok, true);
  assert.equal(bought.cost, 1200);
  const prem = live.claimTier(ops, 'prem', 5);
  assert.equal(prem.ok, true);
  assert.ok(prem.reward.coins > 0);
  assert.equal(live.buyPremium(ops, 5000).reason, 'owned');
  assert.equal(live.buyPremium(live.ensureOps({}), 1000).reason, 'coins');
});

test('quests and achievements award fixed coins and XP', () => {
  const ops = live.ensureOps({});
  const day = live.questsFor('2026-11-18', '2026-11-16');
  assert.equal(day.daily.length >= 2, true);
  assert.equal(day.weekly.length >= 1, true);
  live.addStat(ops, 'place', 3);
  const quest = day.daily.find((q) => q.stat === 'place');
  const claimed = live.claimQuest(ops, quest);
  assert.equal(claimed.ok, true);
  assert.ok(claimed.coins > 0 && claimed.xp > 0);
  assert.equal(live.claimQuest(ops, quest).reason, 'claimed');
  const again = live.ensureOps({});
  live.addStat(again, 'place', 1);
  const achievement = live.ACHIEVEMENTS.find((a) => a.id === 'place-1');
  const got = live.claimAchievement(again, achievement);
  assert.equal(got.ok, true);
  assert.equal(live.claimAchievement(again, achievement).reason, 'claimed');
});

test('starter pack is a one-time PayID bundle with bonus tools', () => {
  const offer = live.starterOffer(tools.getItem);
  assert.equal(offer.coins, 1200);
  assert.equal(offer.price, 'A$10');
  assert.equal(offer.tools.length, 12);
  assert.ok(offer.worth > offer.coins);
  const ops = live.ensureOps({});
  assert.equal(live.noteGiftCredit(ops, 100).starter, false);
  assert.equal(live.noteGiftCredit(ops, 1200).starter, true);
  assert.equal(live.noteGiftCredit(ops, 6500).starter, false);
  assert.deepEqual(shop.GIFT_PACKS, [100, 1200, 1000, 6500, 6000, 15000]);
});

test('park codes round trip and likes stay local', () => {
  const pieces = [{ id: 'Speaker', x: 4, z: -8, r: 1, v: 0 }];
  const code = live.encodePark(pieces);
  assert.deepEqual(live.decodePark(code, tools.getItem), pieces);
  const ops = live.ensureOps({});
  assert.equal(live.likePark(ops, code).liked, true);
  assert.equal(live.likePark(ops, code).liked, true);
  assert.equal(ops.likes[live.likeKey(code)], true);
  const url = live.parkUrl('https://songwriterkaz.github.io/coffeebreak-park-builder/', code);
  assert.match(url, /#p=/);
  assert.equal(live.decodePark(live.codeFromUrl(url), tools.getItem)[0].id, 'Speaker');
});

test('referral codes pay a fixed earned bonus and do not consume gift codes', () => {
  const ops = live.ensureOps({});
  const self = live.ensureReferral(ops, new Uint8Array([1, 2, 3, 4, 5, 6]));
  assert.match(self, /^RF-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/);
  assert.equal(live.enterReferral(ops, self).reason, 'self');
  const other = live.enterReferral(ops, 'RF-AAAAAA');
  assert.equal(other.ok, true);
  assert.equal(other.status, 'earned');
  assert.equal(other.coins, live.REFERRAL_BONUS);
  assert.equal(other.friend, live.REFERRAL_BONUS);
  assert.equal(ops.referral.pending[0].friend, live.REFERRAL_BONUS);
  assert.equal(live.enterReferral(ops, 'RF-BBBBBB').reason, 'used');
  assert.equal(live.classifyCode('PB-1200-ABCDEF01-ABCDEF01').type, 'gift');
  assert.equal(live.enterReferral(ops, 'PB-1000-AAAAAAAA-BBBBBBBB').reason, 'invalid');
  const verified = live.applyOwner(ops);
  assert.equal(verified.vip, true);
});

test('visitor income pays coins and caps at 8 hours', () => {
  const pieces = [{ id: 'Speaker' }, { id: tools.itemAt(20).id }];
  const rating = live.parkRating(pieces, tools.getItem);
  const ops = live.ensureOps({});
  assert.equal(live.accrueVisitorCoins(ops, pieces, tools.getItem, 5000), 0);
  const start = ops.lastVisitorCoinAt;
  const eight = live.accrueVisitorCoins(ops, pieces, tools.getItem, start + 8 * 60 * 60 * 1000);
  const twelve = live.accrueVisitorCoins(ops, pieces, tools.getItem, ops.lastVisitorCoinAt + 12 * 60 * 60 * 1000);
  assert.equal(eight, rating * 48);
  assert.equal(twelve, rating * 48);
});

test('Christmas 2026 has a window, exclusive tools, and quests', () => {
  const before = live.eventState(new Date('2026-11-18T00:00:00Z'));
  const during = live.eventState(new Date('2026-12-15T12:00:00Z'));
  const first = live.eventState(new Date('2026-12-01T00:00:00Z'));
  const last = live.eventState(new Date('2026-12-31T12:00:00Z'));
  const after = live.eventState(new Date('2027-01-01T00:00:00Z'));
  assert.equal(before.phase, 'before');
  assert.equal(before.days, 13);
  assert.equal(during.phase, 'live');
  assert.equal(first.phase, 'live');
  assert.equal(last.phase, 'live');
  assert.equal(after.phase, 'after');
  assert.ok(tools.EVENT_TOOLS.length >= 8);
  const ids = new Set(tools.EVENT_TOOLS.map((item) => item.id));
  assert.equal(ids.size, tools.EVENT_TOOLS.length);
  for (const item of tools.EVENT_TOOLS) {
    assert.equal(tools.getItem(item.id).id, item.id);
    assert.ok(item.cost >= 50 && item.cost <= 5000);
  }
  const quests = live.eventQuests();
  assert.ok(quests.length >= 2);
  assert.ok(quests.every((q) => q.coins > 0 && q.xp > 0));
});

test('park rating pays tickets online and offline, capped at 8 hours', () => {
  const pieces = [{ id: 'Speaker' }, { id: tools.itemAt(20).id }];
  const rating = live.parkRating(pieces, tools.getItem);
  assert.ok(rating >= 1);
  const ops = live.ensureOps({ ops: { lastIncomeAt: 0 } });
  assert.equal(live.accrueTickets(ops, pieces, tools.getItem, 1_000_000), 0);
  const start = ops.lastIncomeAt;
  const hour = live.accrueTickets(ops, pieces, tools.getItem, start + 60 * 60 * 1000);
  assert.equal(hour, rating * 6);
  const ops2 = live.ensureOps({});
  ops2.lastIncomeAt = 5_000;
  const long = live.accrueTickets(ops2, pieces, tools.getItem, 5_000 + 12 * 60 * 60 * 1000);
  assert.equal(long, rating * 6 * 8);
  assert.equal(live.INCOME_CAP_MS, 8 * 60 * 60 * 1000);
});

test('owner code unlocks the stats counters and the supporter badge', () => {
  const ops = live.ensureOps({});
  live.countSession(ops);
  live.countPurchase(ops);
  live.countTools(ops, 2);
  assert.deepEqual(ops.analytics, { sessions: 1, purchasesStarted: 1, toolsBought: 2 });
  assert.equal(live.classifyCode(live.OWNER_CODE).type, 'owner');
  const flag = live.applyOwner(ops);
  assert.equal(flag.vip, true);
  assert.equal(flag.owner, true);
});

test('new copy has no paid random rewards, exclamation marks, or PayPal', () => {
  const files = ['liveops.js', 'tools.js', 'toolshop.js', 'rewards.js', 'shop.js', 'game.js'].map((name) => fs.readFileSync(new URL('./' + name, import.meta.url), 'utf8'));
  const text = files.map(quoted).join('\n');
  assert.doesNotMatch(text, /!/);
  assert.doesNotMatch(text, /paypal|gumroad|loot\s*box|lootbox|gacha|mystery\s*(box|pack)|random\s*(prize|reward|pack)/i);
  const visible = html
    .replace(/href="https:\/\/www\.gofundme\.com\/[^"]+"/g, 'href=""')
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, ' ');
  assert.doesNotMatch(visible, /!/);
  assert.match(html, /12,000 tools/);
  assert.match(html, /id="bTools"/);
  assert.match(html, /id="bRewards"/);
  assert.match(html, /id="eventBanner"/);
  assert.match(html, /Coins have no cash value and can't be exchanged for money\./);
  assert.match(game, /mountToolShop/);
  assert.match(game, /mountRewards/);
  assert.match(game, /openMoney/);
  assert.doesNotMatch(game, /state\.track = -1/);
});
