// Rewards, share, gallery, season pass, and owner stats.
import {
  DAILY_COINS, SEASON, claimDaily, tierReached, tierReward, claimTier, buyPremium,
  questsFor, claimQuest, ACHIEVEMENTS, claimAchievement, starterOffer, dayKey, weekKey,
  ensureReferral, enterReferral, eventState, eventQuests, claimWeekly, noteWeekly, REFERRAL_BONUS,
} from './liveops.js';
import {
  t, weeklyTheme, createAdProvider, claimRewardedAd, SHARE_TAG, BILLIONAIRE_URL, billionaireChoice,
} from './platform.js';

function btn(label, className, onclick) {
  const b = document.createElement('button');
  b.type = 'button';
  if (className) b.className = className;
  b.textContent = label;
  b.onclick = onclick;
  return b;
}

export function mountRewards(ctx) {
  let tab = 'daily';
  const provider = createAdProvider();

  function shell() {
    const lang = ctx.state.ops.lang || 'en';
    const el = ctx.$('rewards');
    el.innerHTML = '';
    const h = document.createElement('h3');
    h.textContent = t(lang, 'rewards.title');
    el.appendChild(h);
    const tabs = document.createElement('div');
    tabs.className = 'tabs';
    const names = [
      ['daily', 'Daily'],
      ['pass', 'Pass'],
      ['quests', 'Quests'],
      ['share', 'Share'],
      ['event', 'Event'],
      ['board', 'Board'],
      ['gallery', 'Gallery'],
      ['settings', 'Settings'],
    ];
    if (ctx.state.ops.owner) names.push(['stats', 'Stats']);
    names.forEach(([id, label]) => {
      const b = btn(label, 'tab' + (tab === id ? ' sel' : ''), () => { tab = id; shell(); });
      tabs.appendChild(b);
    });
    el.appendChild(tabs);
    const body = document.createElement('div');
    body.id = 'rewardsBody';
    el.appendChild(body);
    paint(body);
  }

  function paint(body) {
    body.innerHTML = '';
    if (!ctx.state.ops.starter.claimed) body.appendChild(starterCard());
    if (tab === 'daily') body.appendChild(dailyCard());
    if (tab === 'pass') body.appendChild(passCard());
    if (tab === 'quests') body.appendChild(questCard());
    if (tab === 'share') body.appendChild(shareCard());
    if (tab === 'event') body.appendChild(eventCard());
    if (tab === 'board') body.appendChild(boardCard());
    if (tab === 'gallery') body.appendChild(galleryCard());
    if (tab === 'settings') body.appendChild(settingsCard());
    if (tab === 'stats' && ctx.state.ops.owner) body.appendChild(statsCard());
  }

  function starterCard() {
    const offer = starterOffer(ctx.getItem);
    const box = document.createElement('div');
    box.className = 'pay';
    const title = document.createElement('strong');
    title.textContent = 'Starter pack';
    const copy = document.createElement('p');
    copy.textContent = '1,200 coins and 12 tools worth ' + offer.worth + ' coins. Pay ' + offer.price + ' with the PayID coin pack. Coins are credited once the payment is checked and have no cash value.';
    const list = document.createElement('p');
    list.textContent = offer.tools.map((item) => item.name).join(', ');
    box.append(title, copy, list, btn('Pay by PayID', '', () => {
      ctx.openMoney(1200);
      ctx.toast('The 1,200 coin pack is selected.');
    }));
    return box;
  }

  function dailyCard() {
    const box = document.createElement('div');
    const today = dayKey(new Date());
    const claimed = ctx.state.ops.daily.claimed === today;
    const p = document.createElement('p');
    p.textContent = 'Streak ' + (ctx.state.ops.daily.streak || 0) + '. A missed day starts again at day 1.';
    box.appendChild(p);
    const row = document.createElement('div');
    row.className = 'tools-grid';
    DAILY_COINS.forEach((coins, i) => {
      const cell = document.createElement('div');
      cell.className = 'piece';
      cell.textContent = 'Day ' + (i + 1);
      const small = document.createElement('small');
      small.textContent = coins + ' coins';
      cell.appendChild(small);
      row.appendChild(cell);
    });
    box.appendChild(row);
    box.appendChild(btn(claimed ? 'Claimed today' : 'Claim today', '', () => {
      const result = claimDaily(ctx.state.ops, today);
      if (!result.ok) return ctx.toast('Already claimed today');
      ctx.addCoins(result.coins);
      ctx.toast('Day ' + result.day + ' added ' + result.coins + ' coins');
      shell();
    }));
    if (ctx.state.ops.adsEnabled) {
      box.appendChild(btn('Watch for 50 coins', 'alt', () => {
        const result = claimRewardedAd(ctx.state.ops, today, provider);
        if (!result.ok && result.reason === 'cap') return ctx.toast('Daily ad limit reached');
        if (!result.ok) return ctx.toast('Ads are not connected yet.');
        ctx.addCoins(result.coins);
        ctx.toast('Added 50 coins');
        shell();
      }));
    }
    return box;
  }

  function passCard() {
    const box = document.createElement('div');
    const ops = ctx.state.ops;
    const tier = tierReached(ops.season.xp);
    const p = document.createElement('p');
    p.textContent = 'Tier ' + tier + ' of ' + SEASON.tiers + '. XP ' + ops.season.xp + '. Premium is ' + SEASON.premiumCost + ' coins.';
    box.appendChild(p);
    if (!ops.season.premium) {
      box.appendChild(btn('Unlock premium for 1,200 coins', '', () => {
        const result = buyPremium(ops, ctx.state.coins);
        if (!result.ok && result.reason === 'coins') {
          ctx.openMoney(1200);
          return ctx.toast('You need more coins. The PayID panel is open.');
        }
        if (!result.ok) return;
        ctx.spendCoins(result.cost);
        ctx.toast('Premium track unlocked');
        shell();
      }));
    }
    for (let i = 1; i <= SEASON.tiers; i++) {
      const row = document.createElement('div');
      row.className = 'pass-row';
      const free = tierReward('free', i);
      const prem = tierReward('prem', i);
      const label = document.createElement('span');
      label.textContent = 'Tier ' + i + '. Free ' + free.coins + ' coins. Premium ' + prem.coins + ' coins';
      row.appendChild(label);
      row.appendChild(btn('Free', 'alt', () => claimTrack('free', i)));
      row.appendChild(btn('Premium', '', () => claimTrack('prem', i)));
      box.appendChild(row);
    }
    return box;
  }

  function claimTrack(track, tier) {
    const result = claimTier(ctx.state.ops, track, tier);
    if (!result.ok && result.reason === 'premium') return ctx.toast('Premium track is still locked');
    if (!result.ok && result.reason === 'xp') return ctx.toast('Earn more XP by building');
    if (!result.ok) return ctx.toast('That tier is already claimed');
    ctx.addCoins(result.reward.coins);
    if (result.reward.tool && ctx.getItem(result.reward.tool)) ctx.unlock(result.reward.tool);
    ctx.toast('Tier ' + tier + ' added ' + result.reward.coins + ' coins');
    shell();
  }

  function questCard() {
    const box = document.createElement('div');
    const today = dayKey(new Date());
    const week = weekKey(new Date());
    const quests = questsFor(today, week);
    const theme = weeklyTheme(week);
    if (!ctx.state.ops.weekly || ctx.state.ops.weekly.week !== week) {
      noteWeekly(ctx.state.ops, week, theme, null);
    }
    const challenge = document.createElement('p');
    challenge.textContent = 'Weekly theme: ' + theme + '. Place 3 matching tools. Progress ' + ((ctx.state.ops.weekly && ctx.state.ops.weekly.count) || 0) + '.';
    box.appendChild(challenge);
    box.appendChild(btn('Claim weekly theme', 'alt', () => {
      const result = claimWeekly(ctx.state.ops);
      if (!result.ok) return ctx.toast('Place 3 themed tools first');
      ctx.addCoins(result.coins);
      ctx.toast('Weekly theme added ' + result.coins + ' coins');
      shell();
    }));
    [...quests.daily, ...quests.weekly, ...eventQuests(), ...ACHIEVEMENTS].forEach((quest) => {
      const row = document.createElement('div');
      row.className = 'quest-row';
      const label = document.createElement('span');
      const have = ctx.state.ops.stats[quest.stat] || 0;
      label.textContent = quest.name + ' ' + Math.min(have, quest.goal) + '/' + quest.goal;
      row.appendChild(label);
      row.appendChild(btn('Claim', '', () => {
        const claim = quest.stat && ACHIEVEMENTS.find((a) => a.id === quest.id) ? claimAchievement : claimQuest;
        const result = claim(ctx.state.ops, quest);
        if (!result.ok) return ctx.toast('Not ready to claim');
        ctx.addCoins(result.coins);
        ctx.toast(quest.name + ' added ' + result.coins + ' coins');
        shell();
      }));
      box.appendChild(row);
    });
    return box;
  }

  function shareCard() {
    const box = document.createElement('div');
    const code = ensureReferral(ctx.state.ops);
    const mine = document.createElement('p');
    mine.textContent = 'Your referral code is ' + code + '. You and your friend each earn ' + REFERRAL_BONUS + ' coins. Earned, not bought.';
    box.appendChild(mine);
    const input = document.createElement('input');
    input.placeholder = 'Friend referral code';
    input.setAttribute('aria-label', 'Friend referral code');
    box.appendChild(input);
    box.appendChild(btn('Enter referral', '', () => {
      const result = enterReferral(ctx.state.ops, input.value);
      if (!result.ok && result.reason === 'self') return ctx.toast('That is your own code');
      if (!result.ok && result.reason === 'used') return ctx.toast('A referral code is already entered');
      if (!result.ok) return ctx.toast('Enter a referral code. Gift codes stay in Buy coins.');
      if (result.coins) ctx.addCoins(result.coins);
      ctx.toast('You earned ' + result.coins + ' coins. Your friend earns ' + result.friend + ' coins. Earned, not bought.');
      shell();
    }));
    box.appendChild(btn('Share my park', '', () => ctx.sharePark()));
    box.appendChild(btn('Copy link', 'alt', () => ctx.copyPark()));
    box.appendChild(btn('Record clip', '', () => ctx.recordClip()));
    box.appendChild(btn('Share screenshot', 'alt', () => ctx.shareShot()));
    const tag = document.createElement('p');
    tag.textContent = 'Post the clip on TikTok, Shorts or Instagram with ' + SHARE_TAG + '.';
    box.appendChild(tag);
    const submit = document.createElement('p');
    submit.textContent = 'Submit to gallery copies your park code. There is no upload. Send the code to the owner to add it to gallery.json.';
    box.appendChild(submit);
    box.appendChild(btn('Submit to gallery', 'alt', () => ctx.submitGallery()));
    if (ctx.visiting && ctx.visiting()) {
      box.appendChild(btn('Like this park', '', () => ctx.likeVisit()));
      box.appendChild(btn('Back to my park', 'alt', () => ctx.endVisit()));
    }
    return box;
  }

  function eventCard() {
    const box = document.createElement('div');
    const status = eventState(new Date());
    const p = document.createElement('p');
    if (status.phase === 'before') p.textContent = 'Christmas 2026 starts in ' + status.days + ' days.';
    else if (status.phase === 'live') p.textContent = 'Christmas 2026 is on. ' + status.days + ' days left.';
    else p.textContent = 'Christmas 2026 has ended. Owned event tools stay in your park.';
    box.appendChild(p);
    const bill = document.createElement('p');
    const choice = billionaireChoice(false);
    bill.textContent = 'Billionaire tools are in the Tool Shop. The radio uses the preview when the audio file is present.';
    box.appendChild(bill);
    const link = document.createElement('a');
    link.href = choice.href || BILLIONAIRE_URL;
    link.target = '_blank';
    link.rel = 'noopener';
    link.className = 'money-link';
    link.textContent = 'Billionaire on Apple Music';
    box.appendChild(link);
    return box;
  }

  function boardCard() {
    const box = document.createElement('div');
    const board = ctx.state.ops.board || { rating: 0, visitors: 0, entries: [] };
    const p = document.createElement('p');
    p.textContent = 'This device only. Best park rating ' + (board.rating || 0) + '. Visitors welcomed ' + (ctx.state.ops.stats.visitors || 0) + '. Idle visitor coins earned ' + (ctx.state.ops.visitorCoins || 0) + ', capped at 8 hours away.';
    box.appendChild(p);
    (board.entries || []).slice().reverse().forEach((entry) => {
      const row = document.createElement('div');
      row.className = 'quest-row';
      row.textContent = 'Rating ' + entry.rating + '. Visitors ' + entry.visitors;
      box.appendChild(row);
    });
    return box;
  }

  function galleryCard() {
    const box = document.createElement('div');
    const intro = document.createElement('p');
    intro.textContent = 'Featured parks are curated in gallery.json. Visit loads a park on this device and does not replace your save.';
    box.appendChild(intro);
    const page = document.createElement('a');
    page.href = 'gallery.html';
    page.className = 'money-link';
    page.textContent = 'Open the featured parks page';
    box.appendChild(page);
    const list = document.createElement('div');
    list.textContent = 'Loading featured parks.';
    box.appendChild(list);
    fetch('gallery.json').then((res) => res.json()).then((data) => {
      list.textContent = '';
      const parks = (data && data.parks) || [];
      if (!parks.length) {
        list.textContent = 'No featured parks yet.';
        return;
      }
      parks.forEach((park) => {
        const row = document.createElement('div');
        row.className = 'quest-row';
        const label = document.createElement('span');
        label.textContent = (park.name || 'Park') + ' by ' + (park.by || 'Coffeebreak');
        row.appendChild(label);
        row.appendChild(btn('Visit', '', () => ctx.visitCode(park.code)));
        list.appendChild(row);
      });
    }).catch(() => { list.textContent = 'Featured parks could not be loaded.'; });
    return box;
  }

  function settingsCard() {
    const box = document.createElement('div');
    const lang = document.createElement('select');
    lang.setAttribute('aria-label', 'Language');
    [['en', 'English'], ['es', 'Espanol']].forEach(([value, label]) => {
      const o = document.createElement('option');
      o.value = value;
      o.textContent = label;
      if ((ctx.state.ops.lang || 'en') === value) o.selected = true;
      lang.appendChild(o);
    });
    lang.onchange = () => {
      ctx.state.ops.lang = lang.value;
      document.documentElement.lang = lang.value;
      ctx.applyI18n();
      ctx.save();
      shell();
    };
    box.appendChild(lang);
    const motion = btn(ctx.state.ops.reduceMotion ? 'Motion is reduced' : 'Reduce motion', 'alt', () => {
      ctx.state.ops.reduceMotion = !ctx.state.ops.reduceMotion;
      ctx.applyMotion();
      ctx.save();
      shell();
    });
    box.appendChild(motion);
    box.appendChild(btn('Remind me about daily rewards', '', () => ctx.enableReminders()));
    box.appendChild(btn('Install app', 'alt', () => ctx.installApp()));
    const note = document.createElement('p');
    note.className = 'note';
    note.textContent = "Coins have no cash value and can't be exchanged for money. GoFundMe stays a voluntary donation.";
    box.appendChild(note);
    return box;
  }

  function statsCard() {
    const box = document.createElement('div');
    const a = ctx.state.ops.analytics;
    const p = document.createElement('p');
    p.textContent = 'Sessions ' + a.sessions + '. Purchases started ' + a.purchasesStarted + '. Tools bought ' + a.toolsBought + '.';
    box.appendChild(p);
    const ads = btn(ctx.state.ops.adsEnabled ? 'Rewarded slot on' : 'Rewarded slot off', '', () => {
      ctx.state.ops.adsEnabled = !ctx.state.ops.adsEnabled;
      ctx.save();
      ctx.toast(ctx.state.ops.adsEnabled ? 'Rewarded slot enabled. No ad is shown until a network is connected.' : 'Rewarded slot disabled.');
      shell();
    });
    box.appendChild(ads);
    (ctx.state.ops.referral.pending || []).forEach((row) => {
      const line = document.createElement('p');
      line.textContent = row.code + ' ' + row.status + '. You ' + row.self + ' coins. Friend ' + row.friend + ' coins.';
      box.appendChild(line);
    });
    return box;
  }

  ctx.$('bRewards').onclick = () => ctx.toggle('rewards', shell);
  return { render: shell };
}
