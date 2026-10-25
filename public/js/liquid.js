// Hermit · hermit.my
// Liquid glass: each [data-lg] element gets its own SVG lens filter, used as a backdrop-filter (Chromium).
// A displacement map is drawn per element size: inside a band along the edge the backdrop is bent outward,
// like light through a thick rounded glass slab, with slight colour fringing. Other browsers keep the frosted look.
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const ok = CSS.supports('backdrop-filter', 'url(#a)') && /Chrome\//.test(navigator.userAgent);
  if (!ok) return;
  const defs = document.createElementNS(NS, 'svg');
  defs.setAttribute('width', 0); defs.setAttribute('height', 0); defs.style.position = 'absolute';
  document.body.appendChild(defs);
  let n = 0;

  function map(W, H, r, band, notch) {
    // signed distance to a rounded rect; a notch is a rect whose top runs off the screen edge
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d'), img = g.createImageData(W, H), d = img.data;
    const top = notch ? -r : 0, cx = W / 2, cy = (top + H) / 2, hx = W / 2, hy = (H - top) / 2;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const px = x + .5 - cx, py = y + .5 - cy, ax = Math.abs(px), ay = Math.abs(py);
      const qx = ax - (hx - r), qy = ay - (hy - r);
      let sd, nx, ny;
      if (qx > 0 && qy > 0) { const l = Math.hypot(qx, qy); sd = l - r; nx = qx / l; ny = qy / l; }
      else if (qx > qy) { sd = qx - r; nx = 1; ny = 0; } else { sd = qy - r; nx = 0; ny = 1; }
      nx *= Math.sign(px) || 1; ny *= Math.sign(py) || 1;
      const inside = -sd; let m = 0;
      if (inside > 0 && inside < band) { const t = 1 - inside / band; m = t * t * (3 - 2 * t); }
      const i = (y * W + x) * 4;
      d[i] = 128 + nx * m * 127; d[i + 1] = 128 + ny * m * 127; d[i + 2] = 128; d[i + 3] = 255;
    }
    g.putImageData(img, 0, 0); return c.toDataURL();
  }

  function build(el) {
    const W = Math.round(el.offsetWidth), H = Math.round(el.offsetHeight);
    if (!W || !H) return;
    const cs = getComputedStyle(el), notch = el.dataset.lg === 'notch';
    const r = notch ? 18 : Math.min(parseFloat(cs.borderTopLeftRadius) || H / 2, H / 2, W / 2);
    const band = Math.min(+(el.dataset.band || 16), H / 2.2), s = +(el.dataset.bend || 26);
    const id = el._lgId || (el._lgId = 'lg' + (++n));
    let f = defs.querySelector('#' + id);
    if (f) f.remove();
    f = document.createElementNS(NS, 'filter');
    f.setAttribute('id', id); f.setAttribute('filterUnits', 'userSpaceOnUse'); f.setAttribute('primitiveUnits', 'userSpaceOnUse');
    f.setAttribute('x', 0); f.setAttribute('y', 0); f.setAttribute('width', W); f.setAttribute('height', H);
    f.setAttribute('color-interpolation-filters', 'sRGB');
    const ch = (scale, row, res) => `<feDisplacementMap in="SourceGraphic" in2="m" scale="${scale}" xChannelSelector="R" yChannelSelector="G" result="d${res}"/><feColorMatrix in="d${res}" type="matrix" values="${row}" result="${res}"/>`;
    f.innerHTML = `<feImage href="${map(W, H, r, band, notch)}" x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="none" result="m"/>`
      + ch(-s, '1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0', 'r')
      + ch(-s * 1.07, '0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 1 0', 'g')
      + ch(-s * 1.14, '0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0 1 0', 'b')
      + '<feBlend in="r" in2="g" mode="screen" result="rg"/><feBlend in="rg" in2="b" mode="screen"/>';
    defs.appendChild(f);
    const frost = el.dataset.frost || 6;
    el.style.backdropFilter = el.style.webkitBackdropFilter = `blur(${frost}px) url(#${id}) saturate(1.5) brightness(1.06)`;
  }

  const els = () => document.querySelectorAll('[data-lg]');
  const all = () => els().forEach(build);
  const ro = new ResizeObserver(es => es.forEach(e => build(e.target)));
  function init() { els().forEach(el => { build(el); ro.observe(el); }); }
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(init);
  window.hermitLiquid = all;
})();
