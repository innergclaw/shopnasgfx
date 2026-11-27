(function () {
  'use strict';
  var offers = window.SHOPNASGFX_OFFERS;
  var host = document.getElementById('calculator-items');
  if (!offers || !host) return;
  var items = offers.buyToday.map(function (item) {
    return { id: item.id, name: item.name, price: Number(item.price.replace(/[^\d.]/g, '')), monthly: item.price.indexOf('/mo') !== -1, count: item.id === 'logo' ? 1 : 0 };
  });
  var money = function (n) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: n % 1 ? 2 : 0 }).format(n); };
  items.forEach(function (item) {
    var row = document.createElement('div'); row.className = 'calculator-item';
    var label = document.createElement('label'); label.htmlFor = 'calc-' + item.id; label.textContent = item.name;
    var rate = document.createElement('small'); rate.textContent = money(item.price) + (item.monthly ? '/mo' : ' each'); label.appendChild(rate);
    var stepper = document.createElement('div'); stepper.className = 'calculator-stepper';
    var minus = document.createElement('button'); minus.type = 'button'; minus.textContent = '−'; minus.setAttribute('aria-label', 'Remove ' + item.name);
    var input = document.createElement('input'); input.id = label.htmlFor; input.type = 'number'; input.min = 0; input.max = item.monthly ? 1 : 10; input.step = 1; input.value = item.count;
    var plus = document.createElement('button'); plus.type = 'button'; plus.textContent = '+'; plus.setAttribute('aria-label', 'Add ' + item.name);
    function set(value) { item.count = Math.max(0, Math.min(Number(input.max), Math.floor(Number(value) || 0))); input.value = item.count; minus.disabled = item.count === 0; plus.disabled = item.count === Number(input.max); update(); }
    minus.addEventListener('click', function () { set(item.count - 1); }); plus.addEventListener('click', function () { set(item.count + 1); }); input.addEventListener('input', function () { set(input.value); });
    item.set = set; stepper.append(minus, input, plus); row.append(label, stepper); host.appendChild(row); minus.disabled = item.count === 0;
  });
  function totals() { return items.reduce(function (t, i) { t[i.monthly ? 'monthly' : 'project'] += i.count * i.price; return t; }, { project: 0, monthly: 0 }); }
  function update() { var t = totals(); document.getElementById('calculator-total').textContent = money(t.project); document.getElementById('calculator-deposit').textContent = money(t.project * .25); document.getElementById('calculator-monthly').textContent = money(t.monthly) + '/mo'; document.getElementById('calculator-status').textContent = ''; }
  document.getElementById('calculator-reset').addEventListener('click', function () { items.forEach(function (i) { i.set(i.id === 'logo' ? 1 : 0); }); });
  document.getElementById('calculator-continue').addEventListener('click', function (e) {
    var selected = items.filter(function (i) { return i.count > 0; });
    if (!selected.length) { e.preventDefault(); document.getElementById('calculator-status').textContent = 'Add at least one service to discuss your estimate.'; return; }
    var form = document.getElementById('brand-intake-form'); var t = totals();
    var summary = 'Estimate: ' + selected.map(function (i) { return i.count + ' × ' + i.name; }).join(', ') + '. Project ' + money(t.project) + '; 25% deposit ' + money(t.project * .25) + '; monthly ' + money(t.monthly) + '/mo. Final scope to confirm.';
    var field = form.elements.details;
    // Preserve anything the visitor has already written; update only our previous estimate.
    var previous = field.dataset.estimate || '';
    var original = previous && field.value.indexOf(previous) === 0 ? field.value.slice(previous.length).trim() : field.value.trim();
    if ((summary + '\n' + original).length > field.maxLength) { e.preventDefault(); document.getElementById('calculator-status').textContent = 'Your project notes are too long to add this estimate. Shorten the notes below and try again.'; return; }
    field.value = summary + (original ? '\n' + original : ''); field.dataset.estimate = summary;
    field.dispatchEvent(new Event('input', { bubbles: true })); form.elements.serviceType.value = 'Quick design';
  });
  update();
})();
