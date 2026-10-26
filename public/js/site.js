// Hermit · hermit.my
// Page behaviour: the notch navbar, scroll reveals, the join sheet and the product stage.
'use strict';
// phone menu

// notch shape: a tab hanging from the top edge, concave shoulders r, rounded bottom corners R
(function () {
  const el = document.querySelector('.nav .wrap'), rim = el.querySelector('.rim'), rp = rim.querySelector('path');
  function shape() {
    const W = el.offsetWidth, H = el.offsetHeight, r = parseFloat(getComputedStyle(el).getPropertyValue('--r')) || 16, R = 18;
    const side = `H${W}A${r} ${r} 0 0 0 ${W - r} ${r}V${H - R}A${R} ${R} 0 0 1 ${W - r - R} ${H}H${r + R}A${R} ${R} 0 0 1 ${r} ${H - R}V${r}A${r} ${r} 0 0 0 0 0`;
    el.style.clipPath = `path('M0 0${side}Z')`;
    rim.setAttribute('viewBox', `0 0 ${W} ${H}`);
    rp.setAttribute('d', `M${W} 0` + side.slice(side.indexOf('A')));
    const sh = document.querySelector('.nav .shade');
    sh.setAttribute('viewBox', `0 0 ${W} ${H}`); sh.setAttribute('width', W); sh.setAttribute('height', H); sh.style.left = el.offsetLeft + 'px';
    sh.querySelector('.sh').setAttribute('d', `M0 0${side}Z`); sh.querySelector('.hl').setAttribute('d', `M${W} 0` + side.slice(side.indexOf('A')));
  }
  shape(); new ResizeObserver(shape).observe(el); document.fonts && document.fonts.ready.then(shape);
})();

const navEl = document.querySelector('.nav');
addEventListener('scroll', () => navEl.classList.toggle('scrolled', scrollY > 10), { passive: true });
const mm = document.getElementById('mmenu');
document.getElementById('menuBtn').onclick = () => mm.classList.toggle('open');
mm.onclick = () => mm.classList.remove('open');

// reveal
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12 });
document.querySelectorAll('.rv').forEach(el => io.observe(el));

// join sheet: the waitlist is closed for now, and no invite codes are live yet
const sheet = document.getElementById('sheet'), form = sheet.querySelector('form'), sIn = document.getElementById('sheetIn'), field = sIn.closest('.field');
const $ = id => document.getElementById(id);
document.querySelectorAll('[data-join]').forEach(b => b.addEventListener('click', e => {
  e.preventDefault(); const code = b.dataset.join === 'code';
  form.classList.remove('done'); field.classList.remove('bad'); form.dataset.mode = code ? 'code' : 'mail';
  $('sheetT').textContent = code ? 'Got an invite code?' : 'Join the beta';
  $('sheetP').textContent = code ? 'Enter it to skip the line.' : 'Your TestFlight invite lands when your wave opens.';
  $('sheetIc').src = code ? '/art/icons/ticket.png' : '/art/icons/testflight.png';
  $('sheetPeek').src = code ? '/art/mascot/07-face-id-unlock.webp' : '/art/mascot/09-download-model.webp';
  $('sheetFi').src = code ? '/art/icons/key.png' : '/art/icons/envelope_with_arrow.png';
  $('sheetGo').textContent = code ? 'Unlock my invite' : 'Get my invite';
  sIn.type = code ? 'text' : 'email'; sIn.placeholder = code ? 'HERMIT-XXXX' : 'you@email.com'; sIn.value = '';
  sIn.autocomplete = code ? 'off' : 'email'; sIn.style.textTransform = code ? 'uppercase' : '';
  // the waitlist is not open yet: the email field stays closed
  sIn.disabled = !code; field.classList.toggle('locked', !code); form.querySelector('.go').disabled = !code;
  if (!code) { sIn.placeholder = 'The waitlist opens soon'; $('sheetGo').textContent = 'Opening soon'; }
  $('sheetErr').classList.remove('on');
  sheet.classList.add('open'); if (code) setTimeout(() => sIn.focus(), 60);
}));
const close = () => sheet.classList.remove('open');
sheet.addEventListener('click', e => { if (e.target === sheet || e.target.closest('.x')) close(); });
addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
sIn.addEventListener('input', () => { field.classList.remove('bad'); $('sheetErr').classList.remove('on'); });
form.addEventListener('submit', e => {
  e.preventDefault();
  if (form.dataset.mode !== 'code') return;
  // no codes are live yet, so every attempt is refused the way iOS refuses a passcode
  field.classList.remove('bad'); void field.offsetWidth; field.classList.add('bad');
  $('sheetErr').textContent = sIn.value.trim() ? 'Wrong access code' : 'Enter your access code';
  $('sheetErr').classList.add('on');
  if (navigator.vibrate) navigator.vibrate([40, 60, 40]);
  sIn.select();
});

// product stage: tabs switch the conversation in the phone
const M = '<div class="who"><span class="av"><svg class="mark"><use href="#m"/></svg></span>Hermit</div>';
const chats = [
  { topic: "health", q: "A mole on my back changed shape. Should I be worried?", a: ["Changing shape is the one sign doctors care most about. Check the rest: uneven halves, ragged edges, mixed colours, bigger than 6 mm.", "Most changes are harmless, but book a dermatologist this month. Want help describing it?"] },
  { topic: "money", q: "I owe $14k on cards at 24%. Honest plan?", a: ["That's about $280 a month in interest alone. Pay every minimum, then throw everything extra at the highest-rate card.", "If your credit allows, a 0% balance-transfer card would stop most of that bleeding. Want me to map it out?"] },
  { topic: "love", q: "How do I tell my partner I want an open relationship?", a: ["Pick a calm moment, not after a fight. Start with what you feel, not a proposal: \"I've been thinking about us and want to be honest.\"", "Expect hurt first, questions second. Want to rehearse it?"] },
  { topic: "3am questions", q: "Give it to me straight. Is 4 or 5 beers most nights a problem?", a: ["Straight answer: it's past the line. US guidelines call more than 14 drinks a week heavy drinking for men, 7 for women. You're at about 28 to 35.", "Not a verdict on you. Want the signs worth watching?"] },
  { topic: "crypto", q: "Is this token safe to buy? 0x7a3f…c91e", warn: true, a: ["Checked on your phone: the contract blocks selling for everyone except the owner. It's a honeypot.", "Don't buy it. You'd be able to get in, but not out."] }
];
// one voxel crab per topic, preloaded so the swap never flashes empty
const MASC = ['01-health', '02-money', '03-love', '04-3am-questions', '05-token-check'].map(n => '/art/mascot/' + n + '.webp');
MASC.forEach(u => { new Image().src = u; });
const masc = document.getElementById('masc'); masc.dataset.i = 0;
const msgs = document.getElementById('msgs'), tabs = [...document.querySelectorAll('.tab')], stage = document.querySelector('.stage');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
let cur = 0, timer, typer, paused = false;
const DUR = 7000;
function show(i, user) {
  cur = i; clearTimeout(timer); clearTimeout(typer);
  tabs.forEach((t, k) => { t.classList.toggle('on', k === i); const b = t.querySelector('.bar i'); b.style.animation = 'none'; b.offsetWidth; b.style.animation = ''; });
  if (user && innerWidth <= 900) tabs[i].scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  const c = chats[i];
  if (masc.dataset.i !== String(i)) {
    masc.dataset.i = i; masc.classList.add('swap');
    setTimeout(() => { masc.src = MASC[i]; masc.alt = 'Hermit the crab, asking about ' + c.topic; masc.classList.remove('swap'); }, reduce ? 0 : 280);
  }
  msgs.innerHTML = '<div class="day">Today · on this iPhone</div><div class="b me"></div><div class="b ai">' + M + (c.warn ? '<span class="warn">⚠ Honeypot</span>' : '') + '<p></p><p></p></div>';
  msgs.querySelector('.me').textContent = c.q;
  msgs.classList.remove('swap'); msgs.offsetWidth; msgs.classList.add('swap');
  const ps = msgs.querySelectorAll('.ai p');
  if (reduce) { ps[0].textContent = c.a[0]; ps[1].textContent = c.a[1]; }
  else { let p = 0, n = 0; ps[1].style.display = 'none';
    (function tick() { n += 3; ps[p].innerHTML = c.a[p].slice(0, n).replace(/</g, '&lt;') + '<span class="caret"></span>';
      if (n >= c.a[p].length) { ps[p].textContent = c.a[p]; if (p === 1) { ps[p].innerHTML += '<span class="caret"></span>'; return; } p = 1; n = 0; ps[1].style.display = ''; }
      typer = setTimeout(tick, 22); })(); }
  if (!paused) timer = setTimeout(() => show((cur + 1) % chats.length), DUR);
}
tabs.forEach((t, i) => t.addEventListener('click', () => show(i, true)));
document.getElementById('pause').addEventListener('click', e => {
  paused = !paused; stage.classList.toggle('paused', paused);
  e.currentTarget.querySelector('span').textContent = paused ? 'Play' : 'Pause';
  if (paused) clearTimeout(timer); else timer = setTimeout(() => show((cur + 1) % chats.length), 3000);
});
document.documentElement.style.setProperty('--dur', DUR / 1000 + 's');
show(0);

// hero: "Ask anything." types through what a cloud model refuses, typewriter style. The white label hugs
// the text typed so far (cap height to baseline, a little air at the sides), so descenders hang below it.
(() => {
  const h1 = document.querySelector('.hero h1'), rot = h1.querySelector('.rot'), ask = h1.querySelector('.ask'), el = rot.firstElementChild;
  const words = ['anything.', 'dangerous.', 'sexual.', 'trading.', 'uncensored.'];
  const txt = document.createElement('i'), cur = document.createElement('u');
  txt.className = 'txt'; cur.className = 'cur'; txt.textContent = el.textContent; el.textContent = ''; el.append(txt, cur);
  const cv = document.createElement('canvas').getContext('2d');
  const label = () => {
    const cs = getComputedStyle(el), size = parseFloat(cs.fontSize);
    cv.font = cs.fontStyle + ' ' + cs.fontWeight + ' ' + size + 'px ' + cs.fontFamily; cv.letterSpacing = cs.letterSpacing;
    const m = cv.measureText(txt.textContent || ' '), cap = cv.measureText('H').actualBoundingBoxAscent, padX = size * .07;
    const lh = parseFloat(cs.lineHeight) || size * 1.2, base = (lh - m.fontBoundingBoxAscent - m.fontBoundingBoxDescent) / 2 + m.fontBoundingBoxAscent;
    const left = txt.textContent ? m.actualBoundingBoxLeft : 0, right = Math.max(m.actualBoundingBoxRight, cur.offsetLeft + cur.offsetWidth - txt.offsetLeft);
    el.style.setProperty('--bl', (txt.offsetLeft - left - padX) + 'px');
    el.style.setProperty('--bw', (left + right + padX * 2) + 'px');
    el.style.setProperty('--bt', (base - cap - size * .07) + 'px');
    el.style.setProperty('--bh', (cap + size * .17) + 'px');
  };
  // a long word shrinks just enough to keep "Ask" and the word on one line (two on phones)
  const fit = word => {
    const keep = txt.textContent;
    el.style.fontSize = ''; txt.textContent = word;
    const box = h1.parentElement, bs = getComputedStyle(box), full = box.clientWidth - parseFloat(bs.paddingLeft) - parseFloat(bs.paddingRight) - 8;
    const room = getComputedStyle(rot).display === 'inline-grid' ? full - ask.offsetWidth - parseFloat(getComputedStyle(h1).fontSize) * .3 : full;
    const k = Math.min(1, room / el.getBoundingClientRect().width);
    if (k < 1) el.style.fontSize = k + 'em';
    txt.textContent = keep;
  };
  // hold the headline's height so the copy underneath never moves
  const lock = () => { h1.style.height = ''; h1.style.height = h1.getBoundingClientRect().height + 'px'; };
  const set = t => { txt.textContent = t; label(); };
  document.fonts.ready.then(() => {
    fit(words[0]); label(); lock();
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { cur.remove(); label(); return; }
    let w = 0, n = words[0].length, del = true;
    const step = () => {
      const word = words[w];
      if (del) {
        set(word.slice(0, --n));
        if (n > 0) return setTimeout(step, 45);
        del = false; w = (w + 1) % words.length; fit(words[w]); return setTimeout(step, 260);
      }
      set(words[w].slice(0, ++n));
      if (n < words[w].length) return setTimeout(step, 70 + Math.random() * 40);
      del = true; setTimeout(step, w === 0 ? 2600 : 1700);
    };
    setTimeout(step, 2600);
  });
  addEventListener('resize', () => { fit(words.find(x => x.startsWith(txt.textContent)) || txt.textContent); label(); lock(); });
})();

// comparison card: Face ID, then the swap, then the receipt
(() => {
  const tx = document.querySelector('.vs .trade'); if (!tx) return;
  const go = tx.querySelector('.go'), again = tx.querySelector('.again');
  let busy = false;
  go.addEventListener('click', () => {
    if (busy) return; busy = true;
    tx.classList.add('is-scan');
    setTimeout(() => tx.classList.add('is-ok'), 1150);
    setTimeout(() => { tx.classList.remove('is-scan', 'is-ok'); tx.classList.add('is-send'); }, 2050);
    setTimeout(() => { tx.classList.add('is-done'); tx.classList.remove('is-send'); again.focus({ preventScroll: true }); }, 3750);
  });
  again.addEventListener('click', () => { tx.classList.remove('is-done'); busy = false; go.focus({ preventScroll: true }); });
})();
