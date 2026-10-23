// Renders tiers from offers.js into the home page.
(function () {
  var o = window.SHOPNASGFX_OFFERS; if (!o) return;
  var check = '<svg class="tier-check" aria-hidden="true" viewBox="0 0 16 16" width="14" height="14"><path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function card(t) {
    return '<article class="pricing-card tier-card reveal-item' + (t.featured ? ' featured-package' : '') + '">' +
      '<span>' + esc(t.for) + '</span><h3>' + esc(t.name) + '</h3><strong data-price="' + esc(t.id) + '">' + esc(t.price) + '</strong>' +
      (o.pricesAreProposed ? '<em class="proposed-tag">Proposed price</em>' : '') +
      '<p class="tier-turn">Turnaround: ' + esc(t.turnaround) + '</p><ul class="tier-list">' +
      t.deliverables.map(function (d) { return '<li>' + check + '<div>' + esc(d) + '</div></li>'; }).join('') +
      '</ul><a href="#start" data-service="' + esc(t.name) + '">Ask about ' + esc(t.name) + '</a></article>';
  }
  [["tiers-brand", o.brandTiers], ["tiers-retainer", o.retainers], ["tiers-workshop", o.workshops]].forEach(function (p) {
    var el = document.getElementById(p[0]); if (el) el.innerHTML = p[1].map(card).join('');
  });
  var rn = document.getElementById("retainer-note"); if (rn) rn.textContent = o.retainerNote;
  var wn = document.getElementById("workshop-note"); if (wn) wn.textContent = o.workshopNote;
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("[data-service]"); if (!a) return;
    var sel = document.querySelector('#brand-intake-form select[name="serviceType"]'); if (!sel) return;
    var name = a.getAttribute("data-service");
    var groups = { Keep: "Brand on Retainer", Grow: "Brand on Retainer", Lead: "Brand on Retainer" };
    var v = groups[name] || (/workshop|session|day/i.test(name) ? "SI Brand Workshop" : name);
    if ([].some.call(sel.options, function (op) { return op.value === v; })) sel.value = v;
  });
})();
