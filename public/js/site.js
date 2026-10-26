// Hermit · hermit.my
// Page behaviour: the notch navbar, scroll reveals, the join sheet and the product stage.
'use strict';

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

// a deeper shadow once the page moves under the navbar
const navEl = document.querySelector('.nav');
addEventListener('scroll', () => navEl.classList.toggle('scrolled', scrollY > 10), { passive: true });

// phone menu
const mm = document.getElementById('mmenu');
document.getElementById('menuBtn').onclick = () => mm.classList.toggle('open');
mm.onclick = () => mm.classList.remove('open');

// reveal
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12 });
document.querySelectorAll('.rv').forEach(el => io.observe(el));

// join sheet: waitlist email or invite code.
// Nothing is sent yet: the waitlist endpoint lands with the beta. Until then it shows the success state and a toast.
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
  sheet.classList.add('open'); setTimeout(() => sIn.focus(), 60);
}));
const close = () => sheet.classList.remove('open');
sheet.addEventListener('click', e => { if (e.target === sheet || e.target.closest('.x')) close(); });
addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
sIn.addEventListener('input', () => field.classList.remove('bad'));
form.addEventListener('submit', e => {
  e.preventDefault(); const code = form.dataset.mode === 'code', v = sIn.value.trim();
  const ok = code ? /^[A-Za-z0-9-]{4,}$/.test(v) : /^\S+@\S+\.\S+$/.test(v);
  if (!ok) { field.classList.remove('bad'); void field.offsetWidth; field.classList.add('bad'); sIn.focus(); return; }
  $('doneT').textContent = code ? 'Code received' : "You're on the list";
  $('doneP').textContent = code ? "We'll check it and email your invite." : 'Watch your inbox for a TestFlight invite.';
  form.classList.add('done');
  setTimeout(() => { close(); hermitToast(code ? 'Invite code sent' : "You're on the list", code ? v.toUpperCase() : v, code ? '/art/icons/ticket.png' : '/art/icons/testflight.png'); }, 1800);
});

// product stage: tabs switch the conversation in the phone
const M = '<div class="who"><svg class="mark"><use href="#m"/></svg>Hermit</div>';
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
