/* Coffeebreak Park Builder: Mother Energy Drink PayID order panel. */
(function () {
  var UNIT = 10;
  var PAY_LABEL = 'Pay by PayID (Teachers Mutual Bank): darkokaz@gmx.com';
  var INTAKE = 'https://formsubmit.co/ajax/coffeebreakhq+orders@mail.grokbot.com';
  var ORDER_CC = 'songwriterkaz@gmail.com';
  var qty = 1;
  var cartQty = 0;

  function $(id) { return document.getElementById(id); }

  function money(n) {
    return 'US$' + Number(n).toFixed(2);
  }

  function closeOtherPanels() {
    document.querySelectorAll('.panel.show').forEach(function (p) {
      if (p.id !== 'mother') p.classList.remove('show');
    });
  }

  function paint() {
    var qEl = $('motherQty');
    var cartEl = $('motherCart');
    var totalEl = $('motherTotal');
    if (qEl) qEl.textContent = String(qty);
    if (cartEl) {
      if (cartQty < 1) cartEl.textContent = 'Cart is empty.';
      else cartEl.textContent = cartQty + ' x Mother Energy Drink 500ml can. Total ' + money(cartQty * UNIT) + '.';
    }
    if (totalEl) totalEl.textContent = cartQty < 1 ? 'Add a can to the cart to see the total.' : 'Pay ' + money(cartQty * UNIT) + '.';
  }

  function setQty(n) {
    qty = Math.max(1, Math.min(20, n | 0));
    paint();
  }

  function addToCart() {
    cartQty = Math.max(1, Math.min(20, cartQty + qty));
    paint();
  }

  function clearCart() {
    cartQty = 0;
    paint();
  }

  function refCode() {
    var n = Math.floor(Math.random() * 9000) + 1000;
    return 'CB-MOTHER-' + n;
  }

  function field(id) {
    var el = $(id);
    return el ? String(el.value || '').trim() : '';
  }

  function orderBody(ref, name, address, phone) {
    return [
      'Coffeebreak Mother Energy Drink order',
      'Order number: ' + ref,
      '',
      'Name: ' + name,
      'Phone: ' + phone,
      'Delivery address: ' + address,
      '',
      'Item: Mother Energy Drink 500ml can',
      'Quantity: ' + cartQty,
      'Price: ' + money(UNIT) + ' per can',
      'Total: ' + money(cartQty * UNIT),
      '',
      PAY_LABEL,
      'Use ' + ref + ' as the payment reference.',
      'Australia only. Delivered after your PayID payment lands.'
    ].join('\n');
  }

  function mailtoHref(ref, name, address, phone) {
    var subject = 'Coffeebreak Mother Energy Drink order - ' + name + ' - ' + ref;
    var body = orderBody(ref, name, address, phone);
    return 'mailto:coffeebreakhq+orders@mail.grokbot.com?cc=' + encodeURIComponent(ORDER_CC) +
      '&subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(body);
  }

  function setStatus(text, href) {
    var el = $('motherStatus');
    if (!el) return;
    el.textContent = '';
    el.appendChild(document.createTextNode(text));
    if (href) {
      el.appendChild(document.createTextNode(' '));
      var a = document.createElement('a');
      a.href = href;
      a.textContent = 'Open email draft';
      el.appendChild(a);
    }
  }

  function submitOrder() {
    var name = field('motherName');
    var address = field('motherAddress');
    var phone = field('motherPhone');
    if (cartQty < 1) {
      setStatus('Add at least one can to the cart before paying.');
      return;
    }
    if (!name || !address || !phone) {
      setStatus('Enter your name, delivery address and phone.');
      return;
    }
    var ref = refCode();
    var total = money(cartQty * UNIT);
    var href = mailtoHref(ref, name, address, phone);
    var payload = {
      _subject: 'Coffeebreak Mother Energy Drink order - ' + name + ' - ' + ref,
      _cc: ORDER_CC,
      _template: 'table',
      _captcha: 'false',
      _replyto: '',
      name: name,
      phone: phone,
      address: address,
      item: 'Mother Energy Drink 500ml can',
      quantity: String(cartQty),
      unit_price: money(UNIT),
      total: total,
      reference: ref,
      pay: PAY_LABEL,
      note: 'Australia only. Delivered after your PayID payment lands.',
      message: orderBody(ref, name, address, phone)
    };
    setStatus('Sending the order.');
    fetch(INTAKE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (res) {
      var ok = res && res.ok;
      var done = 'Order ' + ref + ' recorded. Pay ' + total + ' by ' + PAY_LABEL + '. Use ' + ref + ' as the reference. Australia only. Delivered after your PayID payment lands.';
      if (ok) setStatus(done, href);
      else setStatus('The order form could not be sent. Use the email draft instead.', href);
    }).catch(function () {
      setStatus('The order form could not be sent. Use the email draft instead.', href);
    });
  }

  function openPanel() {
    var panel = $('mother');
    if (!panel) return;
    var was = panel.classList.contains('show');
    closeOtherPanels();
    if (was) panel.classList.remove('show');
    else panel.classList.add('show');
  }

  function boot() {
    var minus = $('motherMinus');
    var plus = $('motherPlus');
    var add = $('motherAdd');
    var clear = $('motherClear');
    var send = $('motherSubmit');
    var openBtn = $('bMother');
    if (minus) minus.addEventListener('click', function () { setQty(qty - 1); });
    if (plus) plus.addEventListener('click', function () { setQty(qty + 1); });
    if (add) add.addEventListener('click', addToCart);
    if (clear) clear.addEventListener('click', clearCart);
    if (send) send.addEventListener('click', submitOrder);
    if (openBtn) openBtn.addEventListener('click', openPanel);
    paint();
  }

  window.__motherOrder = { open: openPanel };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
