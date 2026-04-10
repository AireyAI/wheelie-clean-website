# Wheelie Clean Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single `index.html` landing page for Wheelie Clean, a Cumbria-based wheelie bin cleaning business, matching the approved design spec.

**Architecture:** Single self-contained `index.html` with all styles in a `<style>` block (Tailwind CDN + custom CSS). Vanilla JS handles scroll animations via IntersectionObserver and a stats counter. Screenshot workflow uses a local Node server (`serve.mjs`) and Puppeteer (`screenshot.mjs`) for iterative visual QA.

**Tech Stack:** HTML5, Tailwind CSS (CDN), vanilla JS, Node.js (serve.mjs + screenshot.mjs), Puppeteer

---

## File Map

| File | Action | Purpose |
|---|---|---|
| `index.html` | Create | The entire landing page |
| `serve.mjs` | Create | Local static file server on port 3000 |
| `screenshot.mjs` | Create | Puppeteer screenshot utility |
| `temporary screenshots/` | Create dir | Auto-saved screenshots from QA rounds |
| `package.json` | Create | Puppeteer dependency |

---

## Task 1: Project scaffolding — server + screenshot tooling

**Files:**
- Create: `serve.mjs`
- Create: `screenshot.mjs`
- Create: `package.json`
- Create: `temporary screenshots/` directory

- [ ] **Step 1: Create package.json**

```json
{
  "name": "wheelie-clean-website",
  "type": "module",
  "scripts": {
    "serve": "node serve.mjs",
    "screenshot": "node screenshot.mjs"
  },
  "dependencies": {
    "puppeteer": "^22.0.0"
  }
}
```

- [ ] **Step 2: Install puppeteer**

Run in `/Users/kyleairey/wheelie_clean_website`:
```bash
npm install
```
Expected: `node_modules/` created, puppeteer downloaded (this downloads Chromium ~170MB, may take a minute).

- [ ] **Step 3: Create serve.mjs**

```js
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3000;

const MIME = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

http.createServer((req, res) => {
  let urlPath = req.url === '/' ? '/index.html' : req.url;
  // decode URI to handle spaces in filenames
  urlPath = decodeURIComponent(urlPath);
  const filePath = path.join(__dirname, urlPath);
  const ext = path.extname(filePath).toLowerCase();

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(PORT, () => {
  console.log(`Wheelie Clean dev server running at http://localhost:${PORT}`);
});
```

- [ ] **Step 4: Create screenshot.mjs**

```js
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const url = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] || '';
const screenshotDir = './temporary screenshots';

if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });

// Auto-increment filename
let n = 1;
while (fs.existsSync(path.join(screenshotDir, `screenshot-${n}${label ? '-' + label : ''}.png`))) n++;
const filename = `screenshot-${n}${label ? '-' + label : ''}.png`;
const outPath = path.join(screenshotDir, filename);

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 2 });
await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
await new Promise(r => setTimeout(r, 1000)); // let animations settle
await page.screenshot({ path: outPath, fullPage: true });
await browser.close();

console.log(`Screenshot saved: ${outPath}`);
```

- [ ] **Step 5: Create screenshots directory**

```bash
mkdir -p "/Users/kyleairey/wheelie_clean_website/temporary screenshots"
```

- [ ] **Step 6: Verify server works**

```bash
node serve.mjs &
sleep 1
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/
```
Expected output: `404` (no index.html yet — that's fine, server is running). Kill with `kill %1`.

---

## Task 2: index.html scaffold — document head + nav

**Files:**
- Create: `index.html`

- [ ] **Step 1: Create index.html with head + nav**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Wheelie Clean — Cumbria's Favourite Bin Cleaning Service</title>
  <meta name="description" content="Eco-friendly wheelie bin cleaning across Cumbria. Book online in minutes. Keep It Wheelie Clean.">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Pacifico&family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    /* ── Brand tokens ── */
    :root {
      --blue:   #00A3E3;
      --green:  #38C74D;
      --tan:    #B8BF5A;
      --gray:   #404040;
      --navy:   #003d5c;
      --navy2:  #005a8a;
      --mint:   #7aeea0;
    }

    /* ── Base ── */
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body { font-family: 'Inter', system-ui, sans-serif; color: var(--gray); background: #fff; overflow-x: hidden; }

    /* ── Headings use Pacifico (closest available match to Wheelie Script) ── */
    .font-display { font-family: 'Pacifico', cursive; }

    /* ── Scroll-reveal: elements start hidden, JS adds .visible ── */
    .reveal {
      opacity: 0;
      transform: translateY(28px);
      transition: opacity 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                  transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }
    .reveal.visible { opacity: 1; transform: translateY(0); }
    .reveal-delay-1 { transition-delay: 0.1s; }
    .reveal-delay-2 { transition-delay: 0.2s; }
    .reveal-delay-3 { transition-delay: 0.3s; }
    .reveal-delay-4 { transition-delay: 0.4s; }

    /* ── Nav scroll effect ── */
    #nav { transition: box-shadow 0.3s ease, border-color 0.3s ease; }
    #nav.scrolled { box-shadow: 0 4px 24px rgba(0,163,227,0.12); border-bottom-color: rgba(0,163,227,0.15); }

    /* ── Sparkle pulse ── */
    @keyframes sparkle {
      0%, 100% { opacity: 0.35; transform: scale(1); }
      50%       { opacity: 0.7;  transform: scale(1.3); }
    }
    .sparkle { animation: sparkle 3s ease-in-out infinite; }
    .sparkle-2 { animation: sparkle 4s ease-in-out infinite 1s; }
    .sparkle-3 { animation: sparkle 3.5s ease-in-out infinite 0.5s; }
    .sparkle-4 { animation: sparkle 5s ease-in-out infinite 1.5s; }

    /* ── Logo float-in ── */
    @keyframes floatIn {
      from { opacity: 0; transform: scale(0.8) translateY(16px); }
      to   { opacity: 1; transform: scale(1) translateY(0); }
    }
    .logo-hero { animation: floatIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) both; }

    /* ── Hero logo glow pulse ── */
    @keyframes glowPulse {
      0%, 100% { opacity: 0.4; transform: scale(1); }
      50%       { opacity: 0.65; transform: scale(1.08); }
    }
    .glow-ring { animation: glowPulse 3s ease-in-out infinite; }

    /* ── Button spring ── */
    .btn { transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease; cursor: pointer; }
    .btn:hover  { transform: translateY(-2px) scale(1.03); }
    .btn:active { transform: scale(0.97); }

    /* ── Service card lift ── */
    .service-card { transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease; }
    .service-card:hover { transform: translateY(-6px); box-shadow: 0 16px 40px rgba(0,163,227,0.18); }
    .service-card-dark:hover { box-shadow: 0 16px 40px rgba(0,90,138,0.5); }

    /* ── Wave divider ── */
    .wave { display: block; width: 100%; }

    /* ── Stats counter ── */
    .stat-num { transition: none; }

    /* ── Mobile nav toggle ── */
    #mobile-menu { display: none; }
    @media (max-width: 768px) {
      #nav-links { display: none; }
      #mobile-menu { display: flex; }
    }
  </style>
</head>
<body>

  <!-- ═══════════════════════════ NAV ═══════════════════════════ -->
  <nav id="nav" class="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-transparent px-6 md:px-12 py-3 flex items-center justify-between">
    <a href="#" class="flex-shrink-0">
      <img src="./IMG_1549 3.PNG" alt="Wheelie Clean" class="h-12 w-auto">
    </a>

    <!-- Desktop links -->
    <div id="nav-links" class="hidden md:flex items-center gap-8 text-sm font-700 text-gray-600">
      <a href="#services"     class="hover:text-[#00A3E3] transition-colors duration-200">Services</a>
      <a href="#how-it-works" class="hover:text-[#00A3E3] transition-colors duration-200">How It Works</a>
      <a href="#gallery"      class="hover:text-[#00A3E3] transition-colors duration-200">Gallery</a>
      <a href="#about"        class="hover:text-[#00A3E3] transition-colors duration-200">About</a>
    </div>

    <a href="#booking" class="btn bg-[#38C74D] text-white text-xs font-800 px-5 py-2.5 rounded-full shadow-lg shadow-green-400/30 flex-shrink-0" style="font-weight:800;">
      📞 Book Now
    </a>

    <!-- Mobile hamburger (functional via JS below) -->
    <button id="mobile-menu" class="flex flex-col gap-1.5 p-2" aria-label="Open menu">
      <span class="block w-6 h-0.5 bg-gray-600"></span>
      <span class="block w-6 h-0.5 bg-gray-600"></span>
      <span class="block w-6 h-0.5 bg-gray-600"></span>
    </button>
  </nav>

  <!-- Mobile nav dropdown -->
  <div id="mobile-nav" class="fixed top-[72px] left-0 right-0 z-40 bg-white border-b border-gray-100 shadow-lg px-6 py-4 flex flex-col gap-4 text-sm font-700 text-gray-700 hidden">
    <a href="#services"     class="hover:text-[#00A3E3]" onclick="closeMobileNav()">Services</a>
    <a href="#how-it-works" class="hover:text-[#00A3E3]" onclick="closeMobileNav()">How It Works</a>
    <a href="#gallery"      class="hover:text-[#00A3E3]" onclick="closeMobileNav()">Gallery</a>
    <a href="#about"        class="hover:text-[#00A3E3]" onclick="closeMobileNav()">About</a>
    <a href="#booking"      class="hover:text-[#00A3E3]" onclick="closeMobileNav()">Book Now</a>
  </div>

  <!-- SECTIONS WILL BE ADDED IN SUBSEQUENT TASKS -->

</body>
</html>
```

- [ ] **Step 2: Start server and take first screenshot**

```bash
node serve.mjs &
sleep 1
node screenshot.mjs http://localhost:3000 scaffold
```
Expected: `temporary screenshots/screenshot-1-scaffold.png` created. Read it with the Read tool and confirm nav renders — logo visible, green pill button visible.

- [ ] **Step 3: Kill background server**

```bash
kill $(lsof -ti:3000) 2>/dev/null || true
```

---

## Task 3: Hero section

**Files:**
- Modify: `index.html` — replace `<!-- SECTIONS WILL BE ADDED -->` comment with hero HTML

- [ ] **Step 1: Add hero section after the mobile-nav div, before </body>**

```html
  <!-- ═══════════════════════════ HERO ═══════════════════════════ -->
  <section class="relative overflow-hidden pt-[72px]" style="background: linear-gradient(150deg, #003d5c 0%, #005a8a 30%, #007ab5 60%, #00A3E3 85%, #1acc6e 100%);">
    <!-- Radial glow blobs -->
    <div class="absolute -top-12 -left-12 w-64 h-64 rounded-full pointer-events-none" style="background: radial-gradient(circle, rgba(56,199,77,0.35) 0%, transparent 70%);"></div>
    <div class="absolute -bottom-8 -right-8 w-56 h-56 rounded-full pointer-events-none" style="background: radial-gradient(circle, rgba(0,163,227,0.5) 0%, transparent 70%);"></div>

    <!-- Sparkle dots -->
    <span class="sparkle   absolute top-1/3  left-[8%]  w-2.5 h-2.5 rounded-full bg-white opacity-60 pointer-events-none"></span>
    <span class="sparkle-2 absolute top-1/5  right-[14%] w-1.5 h-1.5 rounded-full bg-[#38C74D] opacity-80 pointer-events-none"></span>
    <span class="sparkle-3 absolute top-3/5  left-[18%] w-1   h-1   rounded-full bg-[#B8BF5A] opacity-70 pointer-events-none"></span>
    <span class="sparkle-4 absolute top-2/5  right-[7%] w-2   h-2   rounded-full bg-white opacity-50 pointer-events-none"></span>
    <span class="sparkle   absolute bottom-1/4 left-[40%] text-white text-lg opacity-40 pointer-events-none select-none">✦</span>
    <span class="sparkle-2 absolute top-[15%] left-[5%]  text-white text-2xl opacity-35 pointer-events-none select-none">✦</span>
    <span class="sparkle-3 absolute top-[55%] right-[5%] text-sm  opacity-35 pointer-events-none select-none" style="color:#7aeea0;">✦</span>
    <span class="sparkle-4 absolute bottom-[18%] right-[18%] text-xs opacity-4 pointer-events-none select-none" style="color:#B8BF5A;">✦</span>

    <div class="relative z-10 flex flex-col items-center text-center px-6 pb-20 pt-10">
      <!-- Badge -->
      <div class="reveal inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-white text-xs font-800 tracking-widest uppercase border border-white/30" style="background:rgba(255,255,255,0.12);backdrop-filter:blur(6px);font-weight:800;">
        ✦ CUMBRIA'S #1 BIN CLEANING SERVICE
      </div>

      <!-- Logo with glow ring -->
      <div class="relative inline-block mb-5">
        <div class="glow-ring absolute inset-0 rounded-full" style="background:radial-gradient(circle, rgba(56,199,77,0.45) 0%, transparent 70%); margin: -16px;"></div>
        <img src="./IMG_1549 3.PNG" alt="Wheelie Clean logo" class="logo-hero relative h-36 w-auto" style="filter: drop-shadow(0 8px 32px rgba(0,0,0,0.45)) drop-shadow(0 0 24px rgba(56,199,77,0.55));">
      </div>

      <!-- Headline -->
      <h1 class="reveal reveal-delay-1 font-display text-5xl md:text-6xl text-white leading-tight mb-3" style="text-shadow: 0 2px 20px rgba(0,0,0,0.3); letter-spacing: -0.02em;">
        Keep It<br><span style="color:#7aeea0;">Wheelie Clean.</span>
      </h1>
      <p class="reveal reveal-delay-2 text-xs font-800 uppercase tracking-widest mb-4" style="color:rgba(255,255,255,0.75);font-weight:800;">
        Cumbria's favourite bin cleaning service ✦
      </p>
      <p class="reveal reveal-delay-2 text-sm leading-relaxed max-w-sm mb-8" style="color:rgba(255,255,255,0.85);">
        Eco-friendly wheelie bin cleaning that eliminates germs, odours and grime — booked online in minutes.
      </p>

      <!-- CTAs -->
      <div class="reveal reveal-delay-3 flex flex-wrap gap-4 justify-center mb-10">
        <a href="#booking" class="btn bg-white font-900 px-7 py-3.5 rounded-full text-sm" style="color:#00A3E3; font-weight:900; box-shadow: 0 6px 24px rgba(0,0,0,0.25);">
          ✨ Get a Free Quote
        </a>
        <a href="tel:07000000000" class="btn px-7 py-3.5 rounded-full text-sm font-700 text-white border-2 border-white/50" style="background:rgba(255,255,255,0.15);backdrop-filter:blur(6px);font-weight:700;">
          📞 Call Us
        </a>
      </div>

      <!-- Stats -->
      <div class="reveal reveal-delay-4 flex justify-center gap-10 pt-6 border-t border-white/15 w-full max-w-sm">
        <div class="text-center">
          <div class="stat-num text-2xl font-900 text-[#7aeea0]" data-target="500" style="font-weight:900;">0</div>
          <div class="text-xs uppercase tracking-widest font-600 mt-1" style="color:rgba(255,255,255,0.7);font-weight:600;">Happy Customers</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-900" style="color:#ffd700;font-weight:900;">5★</div>
          <div class="text-xs uppercase tracking-widest font-600 mt-1" style="color:rgba(255,255,255,0.7);font-weight:600;">Avg Rating</div>
        </div>
        <div class="text-center">
          <div class="stat-num text-2xl font-900 text-[#B8BF5A]" data-target="100" data-suffix="%" style="font-weight:900;">0%</div>
          <div class="text-xs uppercase tracking-widest font-600 mt-1" style="color:rgba(255,255,255,0.7);font-weight:600;">Eco-Friendly</div>
        </div>
      </div>
    </div>

    <!-- Wave divider -->
    <svg class="wave" viewBox="0 0 1200 48" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0,24 C200,48 400,0 600,24 C800,48 1000,0 1200,24 L1200,48 L0,48 Z" fill="#f8f9fa"/>
    </svg>
  </section>
```

- [ ] **Step 2: Screenshot and verify hero**

```bash
node serve.mjs &
sleep 1
node screenshot.mjs http://localhost:3000 hero
kill $(lsof -ti:3000) 2>/dev/null || true
```
Read `temporary screenshots/screenshot-2-hero.png`. Confirm: deep navy gradient, logo with glow, headline, two CTA buttons, stats row, wave at bottom.

---

## Task 4: Trust bar + Services section

**Files:**
- Modify: `index.html` — add two sections after the hero, before `</body>`

- [ ] **Step 1: Add trust bar + services section**

After the closing `</section>` of the hero, add:

```html
  <!-- ═══════════════════════ TRUST BAR ═══════════════════════ -->
  <div class="bg-white border-b border-gray-100 px-6 py-5 flex flex-wrap justify-center gap-6 md:gap-10">
    <div class="flex items-center gap-2 text-xs font-700" style="font-weight:700;">🌿 <span>Eco-friendly products</span></div>
    <div class="flex items-center gap-2 text-xs font-700" style="font-weight:700;">🏡 <span>No need to be home</span></div>
    <div class="flex items-center gap-2 text-xs font-700" style="font-weight:700;">📅 <span>Flexible scheduling</span></div>
    <div class="flex items-center gap-2 text-xs font-700" style="font-weight:700;">✅ <span>Fully insured</span></div>
  </div>

  <!-- ═══════════════════════ SERVICES ═══════════════════════ -->
  <section id="services" class="py-20 px-6 md:px-12" style="background:#f8f9fa;">
    <div class="max-w-4xl mx-auto">
      <div class="text-center mb-12 reveal">
        <p class="text-xs font-800 uppercase tracking-widest mb-3" style="color:#38C74D;font-weight:800;">✦ WHAT WE OFFER ✦</p>
        <h2 class="font-display text-4xl" style="color:#1a1a1a;">Our Cleaning Services</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Standard Clean -->
        <div class="service-card reveal reveal-delay-1 bg-white rounded-2xl p-6 text-center border-2 flex flex-col items-center" style="border-color:#e0f4fd; box-shadow: 0 4px 20px rgba(0,163,227,0.07);">
          <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-4" style="background:linear-gradient(135deg,#e8f7fd,#c8eefa);">🧽</div>
          <h3 class="text-base font-900 mb-2" style="font-weight:900; color:#1a1a1a;">Standard Clean</h3>
          <p class="text-xs text-gray-500 leading-relaxed">Interior & exterior wash, deodorised and disinfected every time.</p>
        </div>

        <!-- Deep Clean (hero card) -->
        <div class="service-card service-card-dark reveal reveal-delay-2 rounded-2xl p-6 text-center flex flex-col items-center relative overflow-hidden" style="background:linear-gradient(145deg,#003d5c,#005a8a); box-shadow: 0 8px 32px rgba(0,90,138,0.35);">
          <div class="absolute -top-4 -right-4 w-20 h-20 rounded-full pointer-events-none" style="background:radial-gradient(circle,rgba(56,199,77,0.3),transparent);"></div>
          <div class="absolute -top-3 left-1/2 -translate-x-1/2 text-white text-[10px] font-900 px-3 py-1 rounded-full whitespace-nowrap" style="background:linear-gradient(135deg,#38C74D,#2aaa40); box-shadow:0 2px 8px rgba(56,199,77,0.45); font-weight:900;">★ MOST POPULAR</div>
          <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-4 mt-2" style="background:rgba(255,255,255,0.15);">✨</div>
          <h3 class="text-base font-900 mb-2 text-white" style="font-weight:900;">Deep Clean</h3>
          <p class="text-xs leading-relaxed" style="color:rgba(255,255,255,0.78);">Power wash + sanitise — kills 99.9% of bacteria and eliminates stubborn odours.</p>
        </div>

        <!-- Monthly Plan -->
        <div class="service-card reveal reveal-delay-3 bg-white rounded-2xl p-6 text-center border-2 flex flex-col items-center" style="border-color:#c8f5da; box-shadow: 0 4px 20px rgba(56,199,77,0.07);">
          <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-4" style="background:linear-gradient(135deg,#edfaf2,#c8f5da);">📅</div>
          <h3 class="text-base font-900 mb-2" style="font-weight:900; color:#1a1a1a;">Monthly Plan</h3>
          <p class="text-xs text-gray-500 leading-relaxed">Regular scheduled cleans — set it up once and never think about it again.</p>
        </div>
      </div>
    </div>
  </section>
```

- [ ] **Step 2: Screenshot**

```bash
node serve.mjs &
sleep 1
node screenshot.mjs http://localhost:3000 services
kill $(lsof -ti:3000) 2>/dev/null || true
```
Read screenshot. Confirm: trust bar strip, 3 service cards, Deep Clean card is dark navy with "MOST POPULAR" badge.

---

## Task 5: How It Works section

**Files:**
- Modify: `index.html` — add section after Services, before `</body>`

- [ ] **Step 1: Add How It Works section**

```html
  <!-- ══════════════════════ HOW IT WORKS ══════════════════════ -->
  <section id="how-it-works" class="py-20 px-6 md:px-12 bg-white">
    <div class="max-w-4xl mx-auto">
      <div class="text-center mb-12 reveal">
        <p class="text-xs font-800 uppercase tracking-widest mb-3" style="color:#00A3E3;font-weight:800;">✦ SIMPLE AS THAT ✦</p>
        <h2 class="font-display text-4xl" style="color:#1a1a1a;">How It Works</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-0">
        <!-- Step 1 -->
        <div class="reveal reveal-delay-1 flex flex-col items-center text-center px-8 py-6 md:border-r-2 border-dashed border-gray-100">
          <div class="w-14 h-14 rounded-full flex items-center justify-center text-xl font-900 text-white mb-5 flex-shrink-0" style="background:linear-gradient(135deg,#00A3E3,#0080c0); box-shadow:0 6px 20px rgba(0,163,227,0.4); font-weight:900;">1</div>
          <h3 class="text-base font-900 mb-2" style="font-weight:900; color:#1a1a1a;">Book Online</h3>
          <p class="text-xs text-gray-500 leading-relaxed">Pick your service, enter your postcode and choose a date — done in under 2 minutes.</p>
        </div>

        <!-- Step 2 -->
        <div class="reveal reveal-delay-2 flex flex-col items-center text-center px-8 py-6 md:border-r-2 border-dashed border-gray-100">
          <div class="w-14 h-14 rounded-full flex items-center justify-center text-xl font-900 text-white mb-5 flex-shrink-0" style="background:linear-gradient(135deg,#00A3E3,#0080c0); box-shadow:0 6px 20px rgba(0,163,227,0.4); font-weight:900;">2</div>
          <h3 class="text-base font-900 mb-2" style="font-weight:900; color:#1a1a1a;">We Come to You</h3>
          <p class="text-xs text-gray-500 leading-relaxed">Just leave your bin out on the day — no need to be home. We handle everything.</p>
        </div>

        <!-- Step 3 -->
        <div class="reveal reveal-delay-3 flex flex-col items-center text-center px-8 py-6">
          <div class="w-14 h-14 rounded-full flex items-center justify-center text-xl font-900 text-white mb-5 flex-shrink-0" style="background:linear-gradient(135deg,#38C74D,#2aaa40); box-shadow:0 6px 20px rgba(56,199,77,0.4); font-weight:900;">✓</div>
          <h3 class="text-base font-900 mb-2" style="font-weight:900; color:#1a1a1a;">Sparkling Result</h3>
          <p class="text-xs text-gray-500 leading-relaxed">Your bin is spotless, deodorised and returned to your door. ✦</p>
        </div>
      </div>
    </div>
  </section>
```

---

## Task 6: Before & After Gallery + Testimonials

**Files:**
- Modify: `index.html` — add two sections after How It Works, before `</body>`

- [ ] **Step 1: Add gallery + testimonials**

```html
  <!-- ══════════════════════ BEFORE & AFTER ══════════════════════ -->
  <section id="gallery" class="py-20 px-6 md:px-12" style="background:linear-gradient(160deg,#003d5c 0%,#005a8a 100%);">
    <div class="max-w-4xl mx-auto">
      <div class="text-center mb-12 reveal">
        <p class="text-xs font-800 uppercase tracking-widest mb-3" style="color:#7aeea0;font-weight:800;">✦ SEE THE DIFFERENCE ✦</p>
        <h2 class="font-display text-4xl text-white">Before &amp; After</h2>
      </div>

      <div class="grid grid-cols-2 gap-4 md:gap-6">
        <!-- Pair 1 -->
        <div class="reveal reveal-delay-1 rounded-2xl overflow-hidden relative" style="box-shadow:0 8px 24px rgba(0,0,0,0.3);">
          <img src="https://placehold.co/600x400/555555/aaaaaa?text=Before" alt="Dirty wheelie bin before cleaning" class="w-full h-40 md:h-56 object-cover">
          <div class="absolute bottom-0 left-0 right-0 py-2 px-3 text-white text-xs font-900 uppercase tracking-widest" style="background:rgba(64,64,64,0.92);font-weight:900;">BEFORE</div>
        </div>
        <div class="reveal reveal-delay-2 rounded-2xl overflow-hidden relative" style="box-shadow:0 8px 24px rgba(56,199,77,0.3);">
          <img src="https://placehold.co/600x400/1a7a40/7aeea0?text=After" alt="Clean wheelie bin after cleaning" class="w-full h-40 md:h-56 object-cover">
          <div class="absolute bottom-0 left-0 right-0 py-2 px-3 text-white text-xs font-900 uppercase tracking-widest" style="background:rgba(56,199,77,0.92);font-weight:900;">AFTER ✦</div>
        </div>

        <!-- Pair 2 -->
        <div class="reveal reveal-delay-3 rounded-2xl overflow-hidden relative" style="box-shadow:0 8px 24px rgba(0,0,0,0.3);">
          <img src="https://placehold.co/600x400/555555/aaaaaa?text=Before" alt="Dirty wheelie bin before cleaning" class="w-full h-40 md:h-56 object-cover">
          <div class="absolute bottom-0 left-0 right-0 py-2 px-3 text-white text-xs font-900 uppercase tracking-widest" style="background:rgba(64,64,64,0.92);font-weight:900;">BEFORE</div>
        </div>
        <div class="reveal reveal-delay-4 rounded-2xl overflow-hidden relative" style="box-shadow:0 8px 24px rgba(56,199,77,0.3);">
          <img src="https://placehold.co/600x400/1a7a40/7aeea0?text=After" alt="Clean wheelie bin after cleaning" class="w-full h-40 md:h-56 object-cover">
          <div class="absolute bottom-0 left-0 right-0 py-2 px-3 text-white text-xs font-900 uppercase tracking-widest" style="background:rgba(56,199,77,0.92);font-weight:900;">AFTER ✦</div>
        </div>
      </div>
    </div>
  </section>

  <!-- ══════════════════════ TESTIMONIALS ══════════════════════ -->
  <section class="py-20 px-6 md:px-12" style="background:#f8f9fa;">
    <div class="max-w-4xl mx-auto">
      <div class="text-center mb-12 reveal">
        <p class="text-xs font-800 uppercase tracking-widest mb-3" style="color:#38C74D;font-weight:800;">✦ HAPPY CUSTOMERS ✦</p>
        <h2 class="font-display text-4xl" style="color:#1a1a1a;">Trusted Across Cumbria</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="reveal reveal-delay-1 bg-white rounded-2xl p-6 border-l-4" style="border-color:#00A3E3; box-shadow:0 4px 20px rgba(0,163,227,0.08);">
          <div class="text-xl mb-3" style="color:#f5a623; letter-spacing:0.05em;">★★★★★</div>
          <p class="text-sm text-gray-600 leading-relaxed italic mb-4">"Brilliant service — bin looks brand new. Can't believe the difference. Will definitely be booking again!"</p>
          <p class="text-xs font-900 uppercase tracking-wider" style="color:#404040;font-weight:900;">Sarah M. · Carlisle</p>
        </div>
        <div class="reveal reveal-delay-2 bg-white rounded-2xl p-6 border-l-4" style="border-color:#38C74D; box-shadow:0 4px 20px rgba(56,199,77,0.08);">
          <div class="text-xl mb-3" style="color:#f5a623; letter-spacing:0.05em;">★★★★★</div>
          <p class="text-sm text-gray-600 leading-relaxed italic mb-4">"So easy to book online and they arrived right on time. No more disgusting bin smell — absolute game changer!"</p>
          <p class="text-xs font-900 uppercase tracking-wider" style="color:#404040;font-weight:900;">James T. · Penrith</p>
        </div>
      </div>
    </div>
  </section>
```

---

## Task 7: About + Booking Form + Service Area + Footer

**Files:**
- Modify: `index.html` — add final sections before `</body>`

- [ ] **Step 1: Add about, booking, service area and footer**

```html
  <!-- ════════════════════════ ABOUT ════════════════════════ -->
  <section id="about" class="py-20 px-6 md:px-12 bg-white">
    <div class="max-w-3xl mx-auto">
      <div class="text-center mb-10 reveal">
        <p class="text-xs font-800 uppercase tracking-widest mb-3" style="color:#00A3E3;font-weight:800;">✦ OUR STORY ✦</p>
        <h2 class="font-display text-4xl" style="color:#1a1a1a;">About Wheelie Clean</h2>
      </div>
      <div class="reveal rounded-2xl overflow-hidden" style="background:#f8f9fa; border:2px solid #f0f0f0;">
        <img src="https://placehold.co/900x320/c8eefa/00A3E3?text=Team+%2F+Van+Photo" alt="Wheelie Clean team" class="w-full h-44 object-cover">
        <div class="p-8">
          <p class="text-sm text-gray-600 leading-relaxed">
            We're Wheelie Clean — a local, family-run bin cleaning business proudly serving Cumbria. We started because we believed everyone deserves a clean, hygienic bin without the hassle. Using eco-friendly, biodegradable cleaning products, we power-wash and sanitise your wheelie bins right on your doorstep. No mess, no fuss — just sparkling results every time.
          </p>
          <p class="text-sm text-gray-600 leading-relaxed mt-3">
            <em>Replace this text with your own story — when you started, why you started, what makes Wheelie Clean special to you and your customers.</em>
          </p>
        </div>
      </div>
    </div>
  </section>

  <!-- ════════════════════════ BOOKING ════════════════════════ -->
  <section id="booking" class="py-20 px-6 md:px-12 relative overflow-hidden" style="background:linear-gradient(160deg,#003d5c 0%,#005a8a 60%,#007ab5 100%);">
    <div class="absolute -top-10 -right-10 w-56 h-56 rounded-full pointer-events-none" style="background:radial-gradient(circle,rgba(56,199,77,0.25),transparent);"></div>
    <div class="max-w-xl mx-auto relative z-10">
      <div class="text-center mb-10 reveal">
        <p class="text-xs font-800 uppercase tracking-widest mb-3" style="color:#7aeea0;font-weight:800;">✦ GET STARTED ✦</p>
        <h2 class="font-display text-4xl text-white">Book a Clean</h2>
      </div>
      <div class="reveal bg-white rounded-2xl p-8" style="box-shadow:0 16px 48px rgba(0,0,0,0.3);">
        <form onsubmit="handleBooking(event)" class="flex flex-col gap-4">
          <input type="text" name="name" placeholder="Your name" required class="w-full px-4 py-3 rounded-xl text-sm border-2 border-gray-100 bg-gray-50 outline-none focus:border-[#00A3E3] transition-colors duration-200" style="font-family:inherit;">
          <input type="tel" name="phone" placeholder="Phone number" required class="w-full px-4 py-3 rounded-xl text-sm border-2 border-gray-100 bg-gray-50 outline-none focus:border-[#00A3E3] transition-colors duration-200" style="font-family:inherit;">
          <div class="grid grid-cols-2 gap-4">
            <input type="text" name="postcode" placeholder="Postcode" required class="w-full px-4 py-3 rounded-xl text-sm border-2 border-gray-100 bg-gray-50 outline-none focus:border-[#00A3E3] transition-colors duration-200" style="font-family:inherit;">
            <select name="service" required class="w-full px-4 py-3 rounded-xl text-sm border-2 border-gray-100 bg-gray-50 outline-none focus:border-[#00A3E3] transition-colors duration-200 text-gray-500" style="font-family:inherit;">
              <option value="" disabled selected>Service type</option>
              <option value="standard">Standard Clean</option>
              <option value="deep">Deep Clean</option>
              <option value="monthly">Monthly Plan</option>
            </select>
          </div>
          <textarea name="message" placeholder="Message / notes (optional)" rows="3" class="w-full px-4 py-3 rounded-xl text-sm border-2 border-gray-100 bg-gray-50 outline-none focus:border-[#00A3E3] transition-colors duration-200 resize-none" style="font-family:inherit;"></textarea>
          <button type="submit" class="btn w-full py-3.5 rounded-xl text-sm font-900 text-white" style="background:linear-gradient(135deg,#00A3E3,#0080c0); box-shadow:0 4px 16px rgba(0,163,227,0.4); font-weight:900;">
            Send Enquiry →
          </button>
        </form>
        <p class="text-center text-xs text-gray-400 mt-5">Or call us directly: <a href="tel:07000000000" class="font-800" style="color:#00A3E3;font-weight:800;">07XXX XXX XXX</a></p>
        <div id="booking-success" class="hidden mt-4 text-center text-sm font-700 text-[#38C74D]" style="font-weight:700;">
          ✦ Thanks! We'll be in touch shortly.
        </div>
      </div>
    </div>
  </section>

  <!-- ══════════════════════ SERVICE AREA ══════════════════════ -->
  <section class="py-20 px-6 md:px-12 text-center" style="background:#f8f9fa;">
    <div class="max-w-3xl mx-auto">
      <div class="reveal mb-10">
        <p class="text-xs font-800 uppercase tracking-widest mb-3" style="color:#B8BF5A;font-weight:800;">✦ WHERE WE OPERATE ✦</p>
        <h2 class="font-display text-4xl" style="color:#1a1a1a;">Serving Cumbria</h2>
      </div>
      <div class="reveal rounded-2xl overflow-hidden mb-8" style="box-shadow:inset 0 2px 8px rgba(0,163,227,0.08); background:linear-gradient(135deg,#e8f7fd,#edfaf2);">
        <img src="https://placehold.co/900x280/c8eefa/00A3E3?text=Map+of+Cumbria+Service+Area" alt="Wheelie Clean service area map — Cumbria" class="w-full h-44 object-cover opacity-80">
      </div>
      <div class="reveal flex flex-wrap gap-3 justify-center">
        <span class="px-4 py-2 rounded-full text-xs font-800 bg-white border-2" style="color:#00A3E3;border-color:#c8eefa;font-weight:800; box-shadow:0 2px 8px rgba(0,163,227,0.1);">Carlisle</span>
        <span class="px-4 py-2 rounded-full text-xs font-800 bg-white border-2" style="color:#00A3E3;border-color:#c8eefa;font-weight:800; box-shadow:0 2px 8px rgba(0,163,227,0.1);">Penrith</span>
        <span class="px-4 py-2 rounded-full text-xs font-800 bg-white border-2" style="color:#00A3E3;border-color:#c8eefa;font-weight:800; box-shadow:0 2px 8px rgba(0,163,227,0.1);">Kendal</span>
        <span class="px-4 py-2 rounded-full text-xs font-800 bg-white border-2" style="color:#00A3E3;border-color:#c8eefa;font-weight:800; box-shadow:0 2px 8px rgba(0,163,227,0.1);">Barrow-in-Furness</span>
        <span class="px-4 py-2 rounded-full text-xs font-800 bg-white border-2" style="color:#00A3E3;border-color:#c8eefa;font-weight:800; box-shadow:0 2px 8px rgba(0,163,227,0.1);">Whitehaven</span>
        <span class="px-4 py-2 rounded-full text-xs font-900 text-white" style="background:linear-gradient(135deg,#38C74D,#2aaa40); font-weight:900; box-shadow:0 2px 8px rgba(56,199,77,0.3);">+ All surrounding areas</span>
      </div>
    </div>
  </section>

  <!-- ════════════════════════ FOOTER ════════════════════════ -->
  <footer class="py-10 px-6 text-center" style="background:linear-gradient(160deg,#1a1a1a 0%,#2a2a2a 100%);">
    <img src="./IMG_1549 3.PNG" alt="Wheelie Clean" class="h-16 w-auto mx-auto mb-2" style="filter:drop-shadow(0 2px 8px rgba(0,163,227,0.3));">
    <p class="text-sm font-900 italic mb-1" style="color:#00A3E3;font-weight:900;">"Keep It Wheelie Clean" ✦</p>
    <p class="text-xs text-gray-500 mb-6">Eco-friendly bin cleaning across Cumbria</p>
    <div class="flex gap-3 justify-center mb-6">
      <a href="#" class="btn px-4 py-2 rounded-full text-white text-xs font-800" style="background:#1877f2;font-weight:800;">📘 Facebook</a>
      <a href="#" class="btn px-4 py-2 rounded-full text-white text-xs font-800" style="background:linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888);font-weight:800;">📸 Instagram</a>
    </div>
    <p class="text-xs" style="color:#444;">© 2025 Wheelie Clean · All rights reserved</p>
  </footer>
```

---

## Task 8: JavaScript — scroll reveal, stats counter, nav scroll, mobile menu, form

**Files:**
- Modify: `index.html` — add `<script>` block before `</body>`

- [ ] **Step 1: Add script block**

Replace the existing `</body>` tag with:

```html
  <script>
    // ── Nav scroll effect ──
    const nav = document.getElementById('nav');
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });

    // ── Mobile menu toggle ──
    const mobileBtn = document.getElementById('mobile-menu');
    const mobileNav = document.getElementById('mobile-nav');
    mobileBtn.addEventListener('click', () => {
      mobileNav.classList.toggle('hidden');
    });
    function closeMobileNav() { mobileNav.classList.add('hidden'); }

    // ── Scroll reveal via IntersectionObserver ──
    const revealEls = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(el => revealObserver.observe(el));

    // ── Stats counter ──
    const statEls = document.querySelectorAll('.stat-num[data-target]');
    const statObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.target, 10);
        const suffix = el.dataset.suffix || '+';
        const duration = 1400;
        const step = 16;
        const increment = target / (duration / step);
        let current = 0;
        const timer = setInterval(() => {
          current = Math.min(current + increment, target);
          el.textContent = Math.floor(current) + suffix;
          if (current >= target) clearInterval(timer);
        }, step);
        statObserver.unobserve(el);
      });
    }, { threshold: 0.5 });
    statEls.forEach(el => statObserver.observe(el));

    // ── Booking form ──
    function handleBooking(e) {
      e.preventDefault();
      document.getElementById('booking-success').classList.remove('hidden');
      e.target.reset();
      setTimeout(() => {
        document.getElementById('booking-success').classList.add('hidden');
      }, 5000);
    }

    // ── Trigger reveals that are already in viewport on load ──
    setTimeout(() => {
      revealEls.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight) el.classList.add('visible');
      });
    }, 100);
  </script>
</body>
</html>
```

---

## Task 9: Screenshot round 1 — full page QA

**Files:** Read-only (screenshot comparison)

- [ ] **Step 1: Start server and take full-page screenshot**

```bash
node serve.mjs &
sleep 2
node screenshot.mjs http://localhost:3000 round1
```

- [ ] **Step 2: Read and analyse screenshot**

Read `temporary screenshots/screenshot-N-round1.png` with the Read tool.

Check against spec:
- [ ] Nav: logo left, links centre, green pill right — sticky, glassmorphism visible
- [ ] Hero: deep navy gradient, logo with glow, sparkles, headline in white with mint accent, two CTAs, stats row, wave divider
- [ ] Trust bar: 4 icons visible
- [ ] Services: 3 cards, Deep Clean is dark navy, "MOST POPULAR" badge present
- [ ] How It Works: 3 numbered steps, step 3 is green
- [ ] Gallery: 2×2 grid, BEFORE/AFTER labels on dark/green overlays
- [ ] Testimonials: 2 white cards with coloured left borders
- [ ] About: placeholder image + text card
- [ ] Booking: dark navy section, floating white form card
- [ ] Service Area: map placeholder + town pill badges
- [ ] Footer: logo in colour, blue slogan italic, social pills, copyright

- [ ] **Step 3: Fix any visible issues**

Document specific issues found (spacing wrong, colour wrong, element missing) and fix them in `index.html`. Be specific: "hero headline font size should be larger on desktop" → increase the Tailwind class.

- [ ] **Step 4: Kill server**

```bash
kill $(lsof -ti:3000) 2>/dev/null || true
```

---

## Task 10: Screenshot round 2 — final QA pass

**Files:** Read-only

- [ ] **Step 1: Take second screenshot after fixes**

```bash
node serve.mjs &
sleep 2
node screenshot.mjs http://localhost:3000 round2
kill $(lsof -ti:3000) 2>/dev/null || true
```

- [ ] **Step 2: Compare round2 against round1**

Read both screenshots. List any remaining differences vs spec. Fix if needed.

- [ ] **Step 3: Mobile viewport screenshot**

```bash
node serve.mjs &
sleep 1
```

Then add to screenshot.mjs or run inline Puppeteer for mobile viewport — or add a second `setViewport` call:

```bash
node -e "
import('puppeteer').then(async ({default: puppeteer}) => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: './temporary screenshots/screenshot-mobile.png', fullPage: true });
  await browser.close();
  console.log('Mobile screenshot saved');
});
"
kill $(lsof -ti:3000) 2>/dev/null || true
```

- [ ] **Step 4: Read mobile screenshot and fix any mobile layout issues**

Check: single-column layout, nav collapses to hamburger, hero logo and headline readable, form fields full width.

- [ ] **Step 5: Final screenshot and sign-off**

```bash
node serve.mjs &
sleep 1
node screenshot.mjs http://localhost:3000 final
kill $(lsof -ti:3000) 2>/dev/null || true
```

Read `screenshot-N-final.png` — confirm all sections render correctly. If clean, implementation is complete.

---

## Self-Review

**Spec coverage check:**
- [x] Sticky nav with logo, links, Book Now pill — Task 2
- [x] Hero: gradient, logo glow, sparkles, headline, CTAs, stats, wave divider — Task 3
- [x] Trust bar — Task 4
- [x] Services: 3 cards, Deep Clean hero card, MOST POPULAR badge — Task 4
- [x] How It Works: 3 numbered steps — Task 5
- [x] Before & After gallery: 2×2 grid with BEFORE/AFTER labels — Task 6
- [x] Testimonials: 2 review cards with left-border accent — Task 6
- [x] About: photo placeholder + bio text — Task 7
- [x] Booking form: name, phone, postcode, service, message, submit — Task 7
- [x] Service Area: map placeholder + town pills — Task 7
- [x] Footer: logo, slogan, tagline, social pills, copyright — Task 7
- [x] Animations: sparkle, logo float-in, scroll reveal, stats counter, button spring, nav scroll, card hover — Task 8
- [x] Screenshot QA rounds 1 + 2 — Tasks 9 + 10
- [x] Mobile check — Task 10

**Placeholder scan:** No TBD, TODO, or vague steps. All code is complete.

**Type consistency:** `handleBooking`, `closeMobileNav`, `stat-num` class, `booking-success` id — all consistent across Tasks 7 and 8.
