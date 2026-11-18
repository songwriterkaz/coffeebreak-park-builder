/* Send money panel. Donation link plus PayID coin packs. No network calls. */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (typeof document !== 'undefined') {
    var boot = function () { api.mount(); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  var PAYID = 'darkokaz@gmx.com';
  var PAYMENT_LABEL = 'Pay by PayID (Teachers Mutual Bank): darkokaz@gmx.com';
  var GOFUNDME = 'https://www.gofundme.com/f/help-our-family-through-multiple-health-crises-advocacy-st';
  var DONATION_NOTE = 'This is a voluntary donation. It does not buy coins or items.';
  var CREDIT_NOTE = 'Coins are credited once the payment is checked and have no cash value.';
  var PACKS = [
    { coins: 100, label: '100 coins', price: 'A$1' },
    { coins: 1200, label: '1,200 coins', price: 'A$10' },
    { coins: 6500, label: '6,500 coins', price: 'A$50' }
  ];
  var REF_KEY = 'CoffeebreakParkBuilder_send_money_v1';
  var ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  var memory = {};

  function mintReference(bytes) {
    var buf = bytes;
    if (!buf) {
      buf = new Uint8Array(10);
      if (typeof crypto !== 'undefined' && crypto.getRandomValues) crypto.getRandomValues(buf);
      else for (var i = 0; i < buf.length; i++) buf[i] = Math.floor(Math.random() * 256);
    }
    var out = 'SM-';
    for (var j = 0; j < buf.length; j++) out += ALPHABET.charAt(buf[j] % ALPHABET.length);
    return out;
  }

  function storageOf() {
    try {
      if (typeof sessionStorage !== 'undefined' && sessionStorage) return sessionStorage;
    } catch (e) {}
    return {
      getItem: function (key) { return Object.prototype.hasOwnProperty.call(memory, key) ? memory[key] : null; },
      setItem: function (key, value) { memory[key] = String(value); }
    };
  }

  function refFor(coins, storage) {
    var store = storage || storageOf();
    var map = {};
    try { map = JSON.parse(store.getItem(REF_KEY) || '{}') || {}; } catch (e) { map = {}; }
    if (!map || typeof map !== 'object' || Array.isArray(map)) map = {};
    var id = String(coins);
    if (typeof map[id] !== 'string' || !/^SM-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{10}$/.test(map[id])) {
      map[id] = mintReference();
      try { store.setItem(REF_KEY, JSON.stringify(map)); } catch (e) {}
    }
    return map[id];
  }

  function copyFields(pack, reference) {
    return {
      payId: PAYID,
      amount: pack && pack.price ? pack.price : null,
      reference: reference || null
    };
  }

  function note(text) {
    var m = document.getElementById('msg');
    if (!m) return;
    m.textContent = text;
    m.style.opacity = '1';
    clearTimeout(note._t);
    note._t = setTimeout(function () { m.style.opacity = '0'; }, 1600);
  }

  function copyText(value) {
    if (!value) return;
    var done = function () { note('Copied'); };
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = value;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.left = '-1000px';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); done(); } catch (e) { note('Select the text and copy it'); }
      ta.remove();
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(value).then(done).catch(fallback);
    } else fallback();
  }

  function mount() {
    var panel = document.getElementById('money');
    if (!panel || panel.dataset.ready === '1') return;
    panel.dataset.ready = '1';
    var selected = null;
    var reference = '';

    function paintTriggers(open) {
      ['bMoney', 'bMoneyFoot'].forEach(function (id) {
        var button = document.getElementById(id);
        if (!button) return;
        button.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }

    function toggle() {
      var open = panel.classList.contains('show');
      document.querySelectorAll('.panel').forEach(function (el) { el.classList.remove('show'); });
      if (!open) panel.classList.add('show');
      paintTriggers(!open);
    }

    function selectPack(button) {
      var coins = Number(button.getAttribute('data-coins'));
      var pack = null;
      for (var i = 0; i < PACKS.length; i++) if (PACKS[i].coins === coins) pack = PACKS[i];
      if (!pack) return;
      selected = pack;
      reference = refFor(pack.coins);
      try { document.dispatchEvent(new CustomEvent('park-purchase-start', { detail: { coins: pack.coins } })); } catch (e) {}
      panel.querySelectorAll('.pack').forEach(function (el) {
        el.classList.toggle('sel', el === button);
      });
      var amount = document.getElementById('moneyAmount');
      var ref = document.getElementById('moneyRef');
      if (amount) amount.textContent = 'Amount: ' + pack.price;
      if (ref) ref.textContent = reference;
      var amountBtn = document.getElementById('copyAmount');
      var refBtn = document.getElementById('copyRef');
      if (amountBtn) amountBtn.disabled = false;
      if (refBtn) refBtn.disabled = false;
    }

    panel.querySelectorAll('.pack').forEach(function (button) {
      button.addEventListener('click', function () { selectPack(button); });
    });
    var copyPay = document.getElementById('copyPayId');
    var copyAmount = document.getElementById('copyAmount');
    var copyRef = document.getElementById('copyRef');
    if (copyPay) copyPay.addEventListener('click', function () { copyText(PAYID); });
    if (copyAmount) copyAmount.addEventListener('click', function () {
      if (selected) copyText(selected.price);
    });
    if (copyRef) copyRef.addEventListener('click', function () {
      if (reference) copyText(reference);
    });
    ['bMoney', 'bMoneyFoot'].forEach(function (id) {
      var button = document.getElementById(id);
      if (!button) return;
      button.setAttribute('aria-controls', 'money');
      button.setAttribute('aria-expanded', 'false');
      button.addEventListener('click', toggle);
    });
    var card = document.getElementById('payCard');
    var link = cardLink();
    if (card) {
      if (link) {
        card.hidden = false;
        card.href = link;
      } else {
        card.hidden = true;
        card.removeAttribute('href');
      }
    }
  }

  function cardLink(url) {
    if (url == null) {
      var cfg = typeof window !== 'undefined' && window.PARK_PAYMENTS ? window.PARK_PAYMENTS : {};
      url = cfg.stripePaymentLink || '';
    }
    url = String(url || '').trim();
    if (!/^https:\/\//i.test(url)) return '';
    return url;
  }

  return {
    PAYID: PAYID,
    PAYMENT_LABEL: PAYMENT_LABEL,
    GOFUNDME: GOFUNDME,
    DONATION_NOTE: DONATION_NOTE,
    CREDIT_NOTE: CREDIT_NOTE,
    PACKS: PACKS,
    mintReference: mintReference,
    refFor: refFor,
    copyFields: copyFields,
    cardLink: cardLink,
    mount: mount
  };
});
