// Hermit · hermit.my
// Theme and toasts. The theme comes from ?theme=, then localStorage, then the OS; a copy of that check runs
// inline in <head> so the first paint is already in the right colours.
(function () {
  var KEY = 'hermit-theme';
  function get() {
    var q = new URLSearchParams(location.search).get('theme');
    if (q === 'light' || q === 'dark') return q;
    try { var s = localStorage.getItem(KEY); if (s) return s; } catch (e) {}
    return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  document.documentElement.dataset.theme = get();

  window.hermitToggleTheme = function () {
    var next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem(KEY, next); } catch (e) {}
    var apply = function () { document.documentElement.dataset.theme = next; };
    var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!document.startViewTransition || reduce) return apply();
    // the new room opens like the logo's big arc: a quarter circle swept from the bottom-right corner
    var t = document.startViewTransition(apply);
    t.ready.then(function () {
      var r = Math.hypot(innerWidth, innerHeight);
      document.documentElement.animate(
        { clipPath: ['circle(0px at 100% 100%)', 'circle(' + r + 'px at 100% 100%)'] },
        { duration: 700, easing: 'cubic-bezier(.45,.05,.2,1)', pseudoElement: '::view-transition-new(root)' }
      );
    });
  };
  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-theme-toggle]')) window.hermitToggleTheme();
  });

  // toasts
  window.hermitToast = function (title, line, icon) {
    var box = document.querySelector('.toasts');
    if (!box) { box = document.createElement('div'); box.className = 'toasts'; box.setAttribute('aria-live', 'polite'); document.body.appendChild(box); }
    while (box.children.length > 1) box.firstChild.remove();
    var el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = '<div class="ic"></div><div class="tx"><b></b><span></span></div><i class="t"></i>';
    var ic = el.querySelector('.ic');
    if (icon) { var im = document.createElement('img'); im.src = icon; im.alt = ''; ic.appendChild(im); }
    else ic.innerHTML = '<svg viewBox="0 0 171.8 110"><path class="mark" style="stroke-width:13" d="M5 5h161.8v100H5zM105 5v100M105 66.8h61.8M5 105A100 100 0 0 1 105 5a61.8 61.8 0 0 1 61.8 61.8"/></svg>';
    el.querySelector('b').textContent = title;
    el.querySelector('span').textContent = line;
    box.appendChild(el);
    setTimeout(function () { el.classList.add('out'); setTimeout(function () { el.remove(); }, 320); }, 3600);
  };
})();
