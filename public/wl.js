// Waitlist card (2026-11-10): email + optional X handle, posted to /api/waitlist (KV; the Google Sheet reads its CSV).
// Any element with [data-wl] opens it as a modal (href="/waitlist" stays as the no-JS fallback).
// An element with id="wl-mount" gets the same card inline (the /waitlist page).
(function () {
  var API = '/api/waitlist';
  var X_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>';
  var SHARE = 'https://x.com/intent/post?text=' + encodeURIComponent('I just joined the @hermitai_ waitlist. A loyal AI agent that runs on your own computer. https://hermit.my');
  var n = 0;

  function card(modal) {
    var id = 'wl' + (++n), el = document.createElement('div');
    el.className = 'wl';
    if (modal) { el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-labelledby', id + 't'); }
    el.innerHTML =
      (modal ? '<div class="wl-grab" aria-hidden="true"></div>' : '') +
      '<div class="wl-head"><h2 id="' + id + 't">Join the <em>waitlist</em></h2>' +
      (modal ? '<button type="button" class="wl-x" aria-label="Close"><svg viewBox="0 0 16 16"><path d="M4 4l8 8M12 4l-8 8"/></svg></button>' : '') + '</div>' +
      '<p class="wl-lead">A loyal AI agent that runs on your computer. Invites go out in waves.</p>' +
      '<form class="wl-form" novalidate>' +
        '<label class="wl-f wl-email"><input name="email" type="email" inputmode="email" placeholder="Your email" aria-label="Email" autocomplete="email" autocapitalize="off" spellcheck="false" maxlength="160" required></label>' +
        '<label class="wl-f wl-handle"><span class="wl-xl">' + X_SVG + '<b>@</b></span><input name="x" type="text" placeholder="X handle" aria-label="X handle (optional)" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" maxlength="40"><small>Optional</small></label>' +
        '<button class="wl-go" type="submit"><span class="wl-spin" aria-hidden="true"></span><span class="wl-gt">Join the waitlist</span></button>' +
        '<p class="wl-err" role="alert" aria-live="assertive"></p>' +
        '<input class="wl-hp" name="company" tabindex="-1" autocomplete="off" aria-hidden="true">' +
      '</form>' +
      '<p class="wl-fine">One email when your invite is ready. No newsletter.</p>' +
      '<div class="wl-done" aria-live="polite"><div class="wl-tick"><svg viewBox="0 0 24 24"><path d="M6 12.5l4 4 8-9"/></svg></div>' +
        '<h3></h3><p class="wl-d1"></p><a class="wl-share" href="' + SHARE + '" target="_blank" rel="noopener">' + X_SVG + 'Share on X</a></div>';
    wire(el);
    return el;
  }

  // "@name", "x.com/name" or "https://twitter.com/name" all become "name"
  function handle(v) {
    return v.trim().replace(/^https?:\/\//i, '').replace(/^(www\.)?(x|twitter)\.com\//i, '').replace(/^@+/, '').replace(/[/?#].*$/, '');
  }

  function wire(el) {
    var f = el.querySelector('form'), em = f.elements.email, xh = f.elements.x, go = f.querySelector('.wl-go'), err = f.querySelector('.wl-err'), busy = false;
    function bad(input, msg) { err.textContent = msg; input.closest('.wl-f').classList.add('bad'); input.focus(); }
    function clear() { err.textContent = ''; f.querySelectorAll('.bad').forEach(function (x) { x.classList.remove('bad'); }); }
    em.addEventListener('input', clear); xh.addEventListener('input', clear);
    xh.addEventListener('blur', function () { if (xh.value) xh.value = handle(xh.value); });
    f.addEventListener('submit', function (e) {
      e.preventDefault(); if (busy) return; clear();
      var email = em.value.trim(), x = handle(xh.value);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return bad(em, email ? "That email doesn't look right." : 'Enter your email.');
      if (x && !/^[A-Za-z0-9_]{1,15}$/.test(x)) return bad(xh, 'X handles are up to 15 letters, numbers or _.');
      xh.value = x;
      busy = true; go.disabled = true; go.classList.add('busy'); go.setAttribute('aria-busy', 'true');
      fetch(API, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: email, x: x, company: f.elements.company.value }) })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (d) { return { r: r, d: d }; }); })
        .then(function (o) {
          if (!o.r.ok || !o.d.ok) { if (o.d.error === 'email') return bad(em, "That email doesn't look right."); throw new Error(o.r.status); }
          done(el, o.d.again, x);
        })
        .catch(function () { err.textContent = "That didn't go through. Check your connection and try again."; })
        .then(function () { busy = false; go.disabled = false; go.classList.remove('busy'); go.removeAttribute('aria-busy'); });
    });
  }

  function done(el, again, x) {
    el.querySelector('.wl-done h3').innerHTML = again ? "You're already <em>on the list.</em>" : "You're <em>on the list.</em>";
    var p = el.querySelector('.wl-d1'); p.textContent = '';
    if (x) { p.append("We'll tag "); var b = document.createElement('b'); b.textContent = '@' + x; p.append(b, ' on X when your invite goes out. '); }
    p.append('Invites go out in waves, by email.');
    el.classList.add('is-done');
    var c = el.querySelector('.wl-x') || el.querySelector('.wl-share'); c && c.focus({ preventScroll: true });
  }

  // the inline card (/waitlist)
  var mount = document.getElementById('wl-mount');
  if (mount) { var c = card(false); mount.appendChild(c); setTimeout(function () { c.querySelector('[name=email]').focus({ preventScroll: true }); }, 60); }

  // the modal
  var bg, opener;
  function build() {
    bg = document.createElement('div'); bg.className = 'wl-bg'; bg.hidden = true;
    var el = card(true); bg.appendChild(el); document.body.appendChild(bg);
    bg.addEventListener('click', function (e) { if (e.target === bg || e.target.closest('.wl-x')) close(); });
    bg.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.stopPropagation(); close(); }
      if (e.key !== 'Tab') return;                                          // keep focus inside the card
      var fs = [].filter.call(el.querySelectorAll('input:not(.wl-hp), button, a[href]'), function (x) { return x.offsetParent !== null; });
      var a = fs[0], z = fs[fs.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    });
    // phones: drag the sheet down by its handle or header to close it
    var y0 = null, dy = 0;
    el.addEventListener('pointerdown', function (e) { if (!matchMedia('(max-width: 600px)').matches || !e.target.closest('.wl-grab, .wl-head') || e.target.closest('button')) return; y0 = e.clientY; dy = 0; el.style.transition = 'none'; el.setPointerCapture(e.pointerId); });
    el.addEventListener('pointermove', function (e) { if (y0 === null) return; dy = Math.max(0, e.clientY - y0); el.style.setProperty('--wl-drag', dy + 'px'); });
    function up() { if (y0 === null) return; y0 = null; el.style.transition = ''; el.style.removeProperty('--wl-drag'); if (dy > 80) close(); }
    el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  }
  function open(from) {
    if (!bg) build();
    opener = from || document.activeElement;
    var el = bg.querySelector('.wl');
    if (el.classList.contains('is-done')) { el.classList.remove('is-done'); el.querySelector('form').reset(); }
    bg.hidden = false; void bg.offsetWidth; bg.classList.add('open'); document.documentElement.classList.add('wl-lock');
    setTimeout(function () { el.querySelector('[name=email]').focus({ preventScroll: true }); }, 60);
  }
  function close() {
    if (!bg || !bg.classList.contains('open')) return;
    bg.classList.remove('open'); document.documentElement.classList.remove('wl-lock');
    setTimeout(function () { if (!bg.classList.contains('open')) bg.hidden = true; }, 360);
    opener && opener.focus && opener.focus({ preventScroll: true });
  }
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-wl]');
    if (!t || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button) return;   // new-tab clicks still go to /waitlist
    e.preventDefault(); open(t);
  });
  window.hermitWaitlist = { open: open, close: close };
  if (location.hash === '#waitlist' && !mount) open();
})();
