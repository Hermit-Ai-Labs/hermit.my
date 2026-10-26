<p align="center">
  <a href="https://hermit.my"><img src="public/brand/app-icon.svg" width="88" height="88" alt="Hermit"></a>
</p>

<h1 align="center">hermit.my</h1>

<p align="center">
  The public web surface for <b>Hermit</b>, private AI that runs entirely on your iPhone.<br>
  <a href="https://hermit.my">hermit.my</a> · <a href="https://x.com/hermitai_">@hermitai_</a>
</p>

<p align="center">
  <img alt="Dependencies: none" src="https://img.shields.io/badge/dependencies-none-4D1D95?style=flat-square">
  <img alt="Build step: none" src="https://img.shields.io/badge/build%20step-none-4D1D95?style=flat-square">
  <img alt="Served from Cloudflare's edge" src="https://img.shields.io/badge/edge-Cloudflare%20Pages-F38020?style=flat-square&logo=cloudflare&logoColor=white">
  <img alt="Light and dark" src="https://img.shields.io/badge/themes-light%20%2B%20dark-1F1E24?style=flat-square">
</p>

<p align="center"><img src="public/og.jpg" width="720" alt="Ask anything. Uncensored. Private. Never leaves your phone."></p>

---

Hermit pulls a quantised open-weight model onto the phone once, then generates every answer on the device. There is
no inference server behind it, so it keeps working in flight mode. This repository is the site that tells that story
and takes beta sign-ups.

It is deliberately built without a framework or a bundler. Every interaction, from the refracting glass to the
animated product stage, is written by hand against the platform, so the page ships exactly the bytes it needs and
nothing it does not.

## Engineering highlights

- **Liquid glass, physically modelled.** `liquid.js` synthesises a per-element displacement map from each surface's
  own geometry and feeds it to `backdrop-filter`, so content bends at the rim like light through a thick slab. Engines
  without SVG backdrop filters fall back to a calibrated frost, never to a broken surface.
- **A navbar drawn from its own measurements.** The hanging notch is a `clip-path` path recomputed from the element's
  box, with a matched SVG rim and shadow, so it stays pixel-exact at every width and zoom level.
- **Flash-free theming.** The theme resolves in a blocking inline script before first paint, then switches through the
  View Transitions API. Every colour is a token, redefined for dark.
- **A live product stage.** Five real conversations type themselves into a phone frame on a timer, with a voxel
  mascot per topic, preloaded so a swap never shows an empty frame. Fully keyboard-driven and pausable.
- **Motion with manners.** Every animation honours `prefers-reduced-motion`.
- **Verified layout.** Each change is checked at 1366, 1440, 1920 and 390 wide, light and dark, for overflow,
  clipped text, broken images and overlaps before it ships.

## What's here

```
public/
  index.html          one page, no framework
  css/base.css        design tokens (light and dark), buttons, theme switch, toasts
  css/site.css        the page: notch navbar, hero, product stage, sections, join sheet
  js/theme.js         theme before first paint, the theme switch, toasts
  js/liquid.js        edge refraction for the glass surfaces (Chromium; frosted glass elsewhere)
  js/site.js          navbar shape, scroll reveals, the join sheet, the product stage
  art/                paintings, 3D icons, partner marks, the voxel crab mascots
  brand/              the spiral mark and app icon
scripts/deploy.sh     publish to Cloudflare Pages
```

There is no build step. Every file in `public/` is served as it is.

## Run it

```sh
python3 -m http.server 8080 --directory public
```

Open <http://localhost:8080>. The page reads `hermit-theme` from `localStorage`, so clear it to fall back to the system
theme.

## Deploy

```sh
CLOUDFLARE_API_TOKEN=... CLOUDFLARE_ACCOUNT_ID=... scripts/deploy.sh
```

The Pages project is `hermit-my`; `hermit.my` and `www.hermit.my` point at it.

## Design language

- **Type.** Geist for everything, Newsreader italic for the one accent word in a headline, Geist Mono for small labels.
- **Colour.** Pure white and near-black rooms, with the brand purple `#4D1D95` kept for the mark, the accent word and
  the swap preview. Every colour is a token in `base.css`, redefined for dark.
- **The navbar** is a notch that hangs from the top edge. Its outline is drawn from its own size in `site.js`, so it
  stays exact at any width. Black in light mode, white glass in dark.
- **Glass.** `liquid.js` draws a displacement map per element and uses it as a `backdrop-filter`, so the page bends at
  the rim like a thick slab. Browsers without SVG backdrop filters get the frosted version from the CSS.
- **Motion** respects `prefers-reduced-motion` everywhere.

## Credits

Paintings by Claude Monet (*Cliff Walk at Pourville* and *Cliffs at Pourville*, 1882), public domain; sources in
`public/art/credits.json`. 3D icons from [Microsoft Fluent Emoji](https://github.com/microsoft/fluentui-emoji) (MIT).
x402, Stripe, Apple, App Store and TestFlight marks belong to their owners.

© 2026 Hermit
