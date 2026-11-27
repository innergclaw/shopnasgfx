// Renders offer lists from offers.js into the home page.
(function () {
  var o = window.SHOPNASGFX_OFFERS; if (!o) return;
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function item(t, opts) {
    var cta = opts.href ? '<a class="btn offer-cta" href="' + opts.href + '">' + opts.cta + '</a>'
      : '<a class="btn offer-cta" href="#start" data-service="' + esc(opts.service) + '">Ask about ' + esc(t.name) + '</a>';
    var body;
    if (t.deliverables && t.deliverables.length > 1) {
      body = '<ul class="offer-deliverables">' + t.deliverables.map(function (d) { return '<li>' + esc(d) + '</li>'; }).join('') + '</ul>';
    } else {
      body = '<p>' + (t.deliverables || []).map(esc).join(' ') + '</p>';
    }
    var flag = t.recommended ? '<p class="offer-flag">Recommended</p>' : '<p class="eyebrow">' + esc(t.for) + '</p>';
    var rowClass = 'price-row' + (t.recommended ? ' is-recommended' : '');
    return '<article class="' + rowClass + '" data-offer="' + esc(t.id) + '"><div class="price-description">' + flag + '<h3>' + esc(t.name) + '</h3>' + body + (t.turnaround ? '<p class="price-meta">' + esc(t.turnaround) + '</p>' : '') + '</div><div class="price-action"><strong data-price="' + esc(t.id) + '">' + esc(t.price) + '</strong>' + cta + '</div></article>';
  }
  function fill(id, list, opts) { var el = document.getElementById(id); if (el && list) el.innerHTML = list.map(function (t) { return item(t, opts); }).join(''); }
  fill("offers-identity", o.identity, { service: "Brand design" });
  if (o.workshops && o.workshops.length) fill("offers-workshop", o.workshops, { proposed: true, service: "SI Brand Workshop" });
  fill("offers-buy", o.buyToday, { proposed: false, href: "quick-designs/#quote", cta: "Order on quick designs" });
  [["workshop-note", o.workshopNote], ["buy-note", o.buyTodayNote], ["identity-note", o.identityNote]].forEach(function (p) { var el = document.getElementById(p[0]); if (el && p[1]) el.textContent = p[1]; });
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("[data-service]"); if (!a) return;
    var sel = document.querySelector('#brand-intake-form select[name="serviceType"]'); if (sel) sel.value = a.getAttribute("data-service");
  });
})();
