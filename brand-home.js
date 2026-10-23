// Renders offer dropdowns from offers.js into the home page.
(function () {
  var o = window.SHOPNASGFX_OFFERS; if (!o) return;
  var chev = '<svg class="offer-chevron" aria-hidden="true" viewBox="0 0 16 16" width="16" height="16"><path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var check = '<svg class="tier-check" aria-hidden="true" viewBox="0 0 16 16" width="14" height="14"><path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function item(t, opts) {
    var proposed = opts.proposed && o.pricesAreProposed;
    var cta = opts.href ? '<a class="btn offer-cta" href="' + opts.href + '">' + opts.cta + '</a>'
      : '<a class="btn offer-cta" href="#start" data-service="' + esc(opts.service) + '">Ask about ' + esc(t.name) + '</a>';
    return '<details class="offer-item" data-offer="' + esc(t.id) + '"><summary><span class="offer-name">' + esc(t.name) + '</span>' +
      '<span class="offer-price" data-price="' + esc(t.id) + '">' + esc(t.price) + (proposed ? '<em class="proposed-tag">Proposed</em>' : '') + '</span>' + chev + '</summary>' +
      '<div class="offer-body"><p class="tier-turn">' + esc(t.for) + (t.turnaround ? ' ~ Turnaround: ' + esc(t.turnaround) : '') + '</p><ul class="tier-list">' +
      t.deliverables.map(function (d) { return '<li>' + check + '<div>' + esc(d) + '</div></li>'; }).join('') + '</ul>' + cta + '</div></details>';
  }
  function fill(id, list, opts) { var el = document.getElementById(id); if (el && list) el.innerHTML = list.map(function (t) { return item(t, opts); }).join(''); }
  fill("offers-retainer", o.retainers, { proposed: true, service: "Brand on Retainer" });
  fill("offers-workshop", o.workshops, { proposed: true, service: "SI Brand Workshop" });
  fill("offers-buy", o.buyToday, { proposed: false, href: "quick-designs/#quote", cta: "Order on quick designs" });
  [["retainer-note", o.retainerNote], ["workshop-note", o.workshopNote], ["buy-note", o.buyTodayNote]].forEach(function (p) { var el = document.getElementById(p[0]); if (el) el.textContent = p[1]; });
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("[data-service]"); if (!a) return;
    var sel = document.querySelector('#brand-intake-form select[name="serviceType"]'); if (sel) sel.value = a.getAttribute("data-service");
  });
})();
