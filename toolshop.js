// Tool shop UI. Paged so a phone does not render thousands of rows.
import { CATS, RARITIES, pageTools, PAGE_SIZE, bundleContents } from './tools.js';
import { t } from './platform.js';

function swatch(parent, hex) {
  const mark = document.createElement('i');
  mark.className = 'sw';
  mark.style.background = '#' + (hex >>> 0).toString(16).padStart(6, '0');
  parent.appendChild(mark);
  return mark;
}

export function mountToolShop(ctx) {
  let cat = 'all';
  let rarity = 'all';
  let own = 'all';
  let query = '';
  let page = 0;

  function render() {
    const lang = ctx.state.ops.lang || 'en';
    const el = ctx.$('toolshop');
    el.innerHTML = '';
    const h = document.createElement('h3');
    h.textContent = t(lang, 'shop.title');
    el.appendChild(h);
    const filters = document.createElement('div');
    filters.className = 'shop-filters';
    const catSel = document.createElement('select');
    catSel.setAttribute('aria-label', 'Category');
    CATS.forEach((c) => {
      const o = document.createElement('option');
      o.value = c.id;
      o.textContent = c.name;
      if (c.id === cat) o.selected = true;
      catSel.appendChild(o);
    });
    const rarSel = document.createElement('select');
    rarSel.setAttribute('aria-label', 'Rarity');
    RARITIES.forEach((c) => {
      const o = document.createElement('option');
      o.value = c.id;
      o.textContent = c.name;
      if (c.id === rarity) o.selected = true;
      rarSel.appendChild(o);
    });
    const ownSel = document.createElement('select');
    ownSel.setAttribute('aria-label', 'Owned or locked');
    [['all', 'All tools'], ['owned', 'Owned'], ['locked', 'Locked']].forEach(([value, label]) => {
      const o = document.createElement('option');
      o.value = value;
      o.textContent = label;
      if (value === own) o.selected = true;
      ownSel.appendChild(o);
    });
    catSel.onchange = () => { cat = catSel.value; page = 0; render(); };
    rarSel.onchange = () => { rarity = rarSel.value; page = 0; render(); };
    ownSel.onchange = () => { own = ownSel.value; page = 0; render(); };
    filters.append(catSel, rarSel, ownSel);
    el.appendChild(filters);
    const search = document.createElement('input');
    search.type = 'search';
    search.placeholder = 'Search tools';
    search.setAttribute('aria-label', 'Search tools');
    search.value = query;
    search.addEventListener('input', () => { query = search.value; page = 0; renderPage(); });
    el.appendChild(search);
    const meta = document.createElement('p');
    meta.className = 'tools-meta';
    meta.id = 'shopMeta';
    el.appendChild(meta);
    const grid = document.createElement('div');
    grid.className = 'tools-grid';
    grid.id = 'shopGrid';
    el.appendChild(grid);
    const pager = document.createElement('div');
    pager.className = 'tools-page';
    pager.id = 'shopPager';
    el.appendChild(pager);
    const note = document.createElement('p');
    note.className = 'note';
    note.textContent = "Coins have no cash value and can't be exchanged for money.";
    el.appendChild(note);
    renderPage();
  }

  function renderPage() {
    const grid = ctx.$('shopGrid');
    const meta = ctx.$('shopMeta');
    const pager = ctx.$('shopPager');
    if (!grid) return;
    const lang = ctx.state.ops.lang || 'en';
    const result = pageTools(cat, query, page, PAGE_SIZE, {
      rarity,
      own,
      isOwned: (id) => ctx.isUnlocked(id),
    });
    const pages = Math.max(1, Math.ceil(result.total / PAGE_SIZE) || 1);
    if (page > pages - 1) { page = pages - 1; return renderPage(); }
    meta.textContent = t(lang, 'shop.count') + '. ' + result.total.toLocaleString() + ' match. Page ' + (page + 1) + ' of ' + pages;
    grid.innerHTML = '';
    result.items.forEach((item) => {
      const card = document.createElement('div');
      card.className = 'piece';
      swatch(card, item.colorHex || 0xff8cc8);
      const title = document.createElement('div');
      title.textContent = item.name;
      card.appendChild(title);
      const sub = document.createElement('small');
      if (item.count) {
        sub.textContent = item.cost + ' coins for ' + item.count + ' tools. ' + item.rarity;
        const worth = bundleContents(item).reduce((sum, id) => sum + (ctx.getItem(id).cost || 0), 0);
        sub.textContent += '. Pieces alone cost ' + worth + ' coins';
      } else if (ctx.isUnlocked(item.id)) {
        sub.textContent = 'Owned. ' + item.rarity;
      } else {
        sub.textContent = item.cost + ' coins. ' + item.rarity;
      }
      card.appendChild(sub);
      if (item.count) {
        const buy = document.createElement('button');
        buy.type = 'button';
        buy.textContent = 'Buy';
        buy.onclick = () => buyBundle(item);
        card.appendChild(buy);
      } else if (ctx.isUnlocked(item.id)) {
        const place = document.createElement('button');
        place.type = 'button';
        place.textContent = 'Place';
        place.onclick = () => { ctx.selectPiece(item.id); ctx.closePanels(); };
        card.appendChild(place);
      } else {
        const buy = document.createElement('button');
        buy.type = 'button';
        buy.textContent = 'Buy';
        buy.onclick = () => buyItem(item);
        card.appendChild(buy);
        if ((item.rarity === 'common' || item.rarity === 'uncommon') && item.cost > 0 && item.cat !== 'event') {
          const tickets = document.createElement('button');
          tickets.type = 'button';
          tickets.className = 'alt';
          tickets.textContent = 'Tickets ' + (item.cost * 4);
          tickets.onclick = () => buyWithTickets(item);
          card.appendChild(tickets);
        }
      }
      grid.appendChild(card);
    });
    pager.innerHTML = '';
    const prev = document.createElement('button');
    prev.type = 'button';
    prev.className = 'alt';
    prev.textContent = 'Previous';
    prev.disabled = page <= 0;
    prev.onclick = () => { page -= 1; renderPage(); };
    const next = document.createElement('button');
    next.type = 'button';
    next.textContent = 'Next';
    next.disabled = page >= pages - 1;
    next.onclick = () => { page += 1; renderPage(); };
    pager.append(prev, next);
  }

  function needCoins() {
    ctx.countPurchase();
    ctx.openMoney();
    ctx.toast('You need more coins. The PayID panel is open.');
  }

  function buyItem(item) {
    if (item.cat === 'event' && !ctx.eventLive()) {
      ctx.toast('Christmas tools open from 1 to 31 December 2026.');
      return;
    }
    if (ctx.state.coins < item.cost) return needCoins();
    ctx.state.coins -= item.cost;
    ctx.unlock(item.id);
    ctx.countTools(1);
    ctx.addStat('buy', 1);
    ctx.refresh();
    ctx.save();
    ctx.toast(item.name + ' unlocked');
    renderPage();
  }

  function buyWithTickets(item) {
    const price = item.cost * 4;
    if ((ctx.state.ops.tickets || 0) < price) {
      ctx.toast('You need more tickets from park income.');
      return;
    }
    ctx.state.ops.tickets -= price;
    ctx.unlock(item.id);
    ctx.countTools(1);
    ctx.addStat('buy', 1);
    ctx.refresh();
    ctx.save();
    ctx.toast(item.name + ' unlocked with tickets');
    renderPage();
  }

  function buyBundle(bundle) {
    if (ctx.state.coins < bundle.cost) return needCoins();
    const ids = bundleContents(bundle);
    ctx.state.coins -= bundle.cost;
    ids.forEach((id) => ctx.unlock(id));
    ctx.countTools(ids.length);
    ctx.addStat('buy', 1);
    ctx.refresh();
    ctx.save();
    ctx.toast(bundle.name + ' unlocked ' + ids.length + ' tools');
    renderPage();
  }

  ctx.$('bTools').onclick = () => ctx.toggle('toolshop', render);
  return { render };
}
