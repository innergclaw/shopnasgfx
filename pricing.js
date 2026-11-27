(function () {
  'use strict';
  var offers = window.SHOPNASGFX_OFFERS;
  var host = document.getElementById('calculator-items');
  if (!offers || !host) return;
  var ids = ['essentials', 'mark', 'identity'];
  var list = (offers.identity || []).filter(function (item) { return ids.indexOf(item.id) !== -1; });
  var items = list.map(function (item) {
    return { id: item.id, name: item.name, price: Number(item.price.replace(/[^\d.]/g, '')), recommended: !!item.recommended, count: item.id === 'mark' ? 1 : 0 };
  });
  var money = function (n) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: n % 1 ? 2 : 0 }).format(n); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var smsHref = function (phone, body) {
    var encoded = encodeURIComponent(body);
    var ios = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    return 'sms:' + phone + (ios ? '?&body=' : '?body=') + encoded;
  };
  var detailsHost = document.getElementById('package-details');
  if (detailsHost) {
    detailsHost.innerHTML = list.map(function (item) {
      return '<details class="soft-details"><summary>' + esc(item.name) + ' · ' + esc(item.price) + '</summary><p>' + esc((item.deliverables || []).join(' ')) + '</p></details>';
    }).join('');
  }
  items.forEach(function (item) {
    var row = document.createElement('div'); row.className = 'calculator-item';
    var label = document.createElement('label'); label.htmlFor = 'calc-' + item.id;
    label.appendChild(document.createTextNode(item.name));
    if (item.recommended) {
      var flag = document.createElement('span'); flag.className = 'offer-flag'; flag.textContent = 'Recommended';
      label.appendChild(flag);
    }
    var rate = document.createElement('small'); rate.textContent = money(item.price) + ' each'; label.appendChild(rate);
    var stepper = document.createElement('div'); stepper.className = 'calculator-stepper';
    var minus = document.createElement('button'); minus.type = 'button'; minus.textContent = '\u2212'; minus.setAttribute('aria-label', 'Remove ' + item.name);
    var input = document.createElement('input'); input.id = label.htmlFor; input.type = 'number'; input.min = 0; input.max = 10; input.step = 1; input.value = item.count;
    var plus = document.createElement('button'); plus.type = 'button'; plus.textContent = '+'; plus.setAttribute('aria-label', 'Add ' + item.name);
    function set(value) { item.count = Math.max(0, Math.min(Number(input.max), Math.floor(Number(value) || 0))); input.value = item.count; minus.disabled = item.count === 0; plus.disabled = item.count === Number(input.max); update(); }
    minus.addEventListener('click', function () { set(item.count - 1); }); plus.addEventListener('click', function () { set(item.count + 1); }); input.addEventListener('input', function () { set(input.value); });
    item.set = set; stepper.append(minus, input, plus); row.append(label, stepper); host.appendChild(row); minus.disabled = item.count === 0;
  });
  function totals() { return items.reduce(function (t, i) { t.project += i.count * i.price; t.due += i.count * i.price * 0.5; return t; }, { project: 0, due: 0 }); }
  function smsBody(selected, t) {
    return "Hello Nasirr, I would like to discuss a project.\n\n" +
      selected.map(function (i) { return i.count + ' \u00d7 ' + i.name; }).join('\n') +
      '\n\nProject total: ' + money(t.project) + '\n50% deposit: ' + money(t.due) +
      '\n\nSent from shopnasgfx.com';
  }
  function syncSms() {
    var btn = document.getElementById('calculator-continue');
    var selected = items.filter(function (i) { return i.count > 0; });
    var t = totals();
    if (!selected.length) { btn.removeAttribute('href'); return; }
    btn.setAttribute('href', smsHref('+12674730397', smsBody(selected, t)));
  }
  function update() {
    var t = totals();
    document.getElementById('calculator-total').textContent = money(t.project);
    document.getElementById('calculator-deposit').textContent = money(t.due);
    document.getElementById('calculator-status').textContent = '';
    syncSms();
  }
  document.getElementById('calculator-reset').addEventListener('click', function () { items.forEach(function (i) { i.set(i.id === 'mark' ? 1 : 0); }); });
  document.getElementById('calculator-continue').addEventListener('click', function (e) {
    var selected = items.filter(function (i) { return i.count > 0; });
    if (!selected.length) {
      e.preventDefault();
      document.getElementById('calculator-status').textContent = 'Select at least one service to discuss this estimate.';
      return;
    }
    syncSms();
  });
  update();
})();
