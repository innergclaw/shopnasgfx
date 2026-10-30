/*
 * Home page motion upgrades adapted from EasyUI (https://easyui.site)
 * by Suraj Maurya, MIT License. Rebuilt in plain JavaScript.
 * Progressive: without JavaScript every section still shows in full.
 */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canObserve = 'IntersectionObserver' in window;

  // Spotlight hover on the three service tiers
  document.querySelectorAll('.offer-group').forEach(function (card) {
    card.addEventListener('pointermove', function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  // Count-up for "500+" (the "since 2015" stat stays static on purpose)
  document.querySelectorAll('[data-count-to]').forEach(function (el) {
    var end = parseInt(el.getAttribute('data-count-to'), 10);
    var suffix = el.getAttribute('data-count-suffix') || '';
    if (reduce || !canObserve || !end) return;
    var final = el.textContent;
    el.style.fontVariantNumeric = 'tabular-nums';
    el.textContent = '0' + suffix;
    var io = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      var start = null, dur = 1400;
      function tick(t) {
        if (start === null) start = t;
        var p = Math.min((t - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(end * eased) + suffix;
        if (p < 1) requestAnimationFrame(tick); else el.textContent = final;
      }
      requestAnimationFrame(tick);
    }, { threshold: 0.6 });
    io.observe(el);
  });

  // Timeline fill for the four SI steps
  var steps = document.querySelector('.si-steps');
  if (steps && canObserve && !reduce) {
    var items = steps.querySelectorAll('li');
    steps.style.setProperty('--timeline', '0');
    var so = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      so.disconnect();
      steps.classList.add('is-lit');
      steps.style.setProperty('--timeline', '1');
      items.forEach(function (li, i) { setTimeout(function () { li.classList.add('is-lit'); }, 180 + i * 200); });
    }, { threshold: 0.35 });
    so.observe(steps);
  } else if (steps) {
    steps.classList.add('is-lit');
    steps.querySelectorAll('li').forEach(function (li) { li.classList.add('is-lit'); });
  }

  // Stacked cards for the single file vs system showcase
  var stack = document.querySelector('.showcase-stack');
  if (stack) {
    var cards = Array.prototype.slice.call(stack.querySelectorAll('.showcase-item'));
    if (cards.length > 1) {
      var current = 0;
      cards.forEach(function (c) { c.classList.remove('reveal-item', 'is-visible'); c.style.removeProperty('--reveal-delay'); });
      stack.classList.add('js-stack');
      stack.setAttribute('aria-roledescription', 'carousel');
      var controls = document.createElement('div');
      controls.className = 'stack-controls';
      var dots = document.createElement('div');
      dots.className = 'stack-dots';
      var next = document.createElement('button');
      next.type = 'button';
      next.className = 'btn secondary stack-next';
      next.textContent = 'Next project';
      cards.forEach(function (c, i) {
        var b = document.createElement('button');
        b.type = 'button';
        b.textContent = String(i + 1);
        var cap = c.querySelector('figcaption');
        b.setAttribute('aria-label', 'Show ' + (cap ? cap.textContent : 'project ' + (i + 1)));
        b.addEventListener('click', function () { show(i); });
        dots.appendChild(b);
      });
      next.addEventListener('click', function () { show((current + 1) % cards.length); });
      controls.appendChild(dots);
      controls.appendChild(next);
      stack.insertAdjacentElement('afterend', controls);
      function show(i) {
        current = i;
        cards.forEach(function (c, j) {
          var pos = (j - i + cards.length) % cards.length;
          c.setAttribute('data-pos', String(Math.min(pos, 2)));
          c.setAttribute('aria-hidden', pos === 0 ? 'false' : 'true');
        });
        Array.prototype.forEach.call(dots.children, function (b, j) { b.setAttribute('aria-current', String(j === i)); });
      }
      show(0);
    }
  }
})();
