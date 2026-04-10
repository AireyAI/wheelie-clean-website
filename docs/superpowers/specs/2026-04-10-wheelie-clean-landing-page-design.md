# Wheelie Clean — Landing Page Design Spec

**Date:** 2026-04-10
**Status:** Approved

---

## Overview

A single-page `index.html` landing page for Wheelie Clean, a wheelie bin cleaning business serving Cumbria. The design direction is **Bright & Friendly with Premium Polish** — deep navy hero, rich gradients, sparkle personality, animated interactions. Built as a single self-contained HTML file with Tailwind CSS via CDN.

**Slogan:** "Keep It Wheelie Clean"
**Service area:** Cumbria (Carlisle, Penrith, Kendal, Barrow-in-Furness, Whitehaven, surrounding areas)

---

## Brand

| Token | Value |
|---|---|
| Fresh Water Blue | `#00A3E3` |
| Grass Green | `#38C74D` |
| Mountain Tan | `#B8BF5A` |
| Black Bin Gray | `#404040` |
| Deep Navy (hero bg) | `#003d5c` → `#005a8a` |
| Heading font | Wheelie Script (Google Fonts or system fallback) |
| Body font | Clean Sans (Inter or system sans) |

**Logo:** `IMG_1549 3.PNG` in project root — circular mascot with happy bin character. Used in nav, hero, footer.

**Visual style:** Sparkle ✦ decorations, radial glow blobs, layered gradients, drop-shadow glows on the logo.

---

## Page Sections (in order)

### 1. Sticky Nav
- Left: logo (`height: 52px`)
- Centre: text links — Services, How It Works, Gallery, About (smooth scroll anchors)
- Right: green "Book Now" pill button (scrolls to booking form)
- Background: `rgba(255,255,255,0.95)` with `backdrop-filter: blur(12px)`
- Box shadow: `0 2px 20px rgba(0,163,227,0.08)`
- Animates in on scroll (adds shadow/border when user scrolls past hero)

### 2. Hero
- Background: deep navy gradient `linear-gradient(150deg, #003d5c → #005a8a → #007ab5 → #00A3E3 → #1acc6e)`
- Radial glow blobs (green top-left, blue bottom-right) at low opacity
- Floating sparkle ✦ dots scattered decoratively
- **Logo** centred, `height: 130px`, with green radial glow ring and drop-shadow
- Badge pill: "✦ CUMBRIA'S #1 BIN CLEANING SERVICE" — white glassmorphism style
- **Headline:** "Keep It / Wheelie Clean." — white, `#7aeea0` accent on "Wheelie Clean."
- Sub-headline: "Cumbria's favourite bin cleaning service ✦"
- Body copy: 1 sentence about eco-friendly, book in minutes
- **Two CTA buttons:** "✨ Get a Free Quote" (white, blue text) + "📞 Call Us" (glass)
- **Stats row:** 500+ Happy Customers · 5★ Avg Rating · 100% Eco-Friendly
- **Wave SVG divider** at the bottom into the next section

### 3. Trust Bar
- White background, horizontal strip
- 4 icon + text items: 🌿 Eco-friendly products · 🏡 No need to be home · 📅 Flexible scheduling · ✅ Fully insured

### 4. Services
- Background: `#f8f9fa`
- Section label: "✦ WHAT WE OFFER ✦" in green
- Heading: "Our Cleaning Services"
- 3-column card grid:
  - **Standard Clean** — white card, blue-tinted icon tile, border `#e0f4fd`
  - **Deep Clean** — inverted deep navy card, "★ MOST POPULAR" badge, glowing icon tile, green box-shadow
  - **Monthly Plan** — white card, green-tinted icon tile, border `#c8f5da`
- Cards animate: lift on hover (`transform: translateY(-4px)` + deeper shadow)

### 5. How It Works
- Background: white
- Section label: "✦ SIMPLE AS THAT ✦" in blue
- Heading: "How It Works"
- 3 steps in a row, separated by dashed vertical borders:
  1. **Book Online** — blue numbered circle
  2. **We Come to You** — blue numbered circle
  3. **Sparkling Result ✓** — green numbered circle
- Each step fades + slides up on scroll

### 6. Before & After Gallery
- Background: deep navy (`#003d5c` → `#005a8a`)
- Section label: "✦ SEE THE DIFFERENCE ✦" in `#7aeea0`
- 2×2 grid of before/after photo pairs
- Before: dark grey placeholder → After: green gradient placeholder
- Each pair has a BEFORE / AFTER ✦ label overlaid at the bottom
- Placeholder images via `https://placehold.co/` — easily swapped for real photos

### 7. Testimonials
- Background: `#f8f9fa`
- Section label: "✦ HAPPY CUSTOMERS ✦" in green
- Heading: "Trusted Across Cumbria"
- 2-column grid of review cards
  - White cards, left border accent (`#00A3E3` / `#38C74D`)
  - Gold ★★★★★ rating, italic quote, customer name + town in small caps
- Placeholder: Sarah M. (Carlisle), James T. (Penrith)

### 8. About
- Background: white
- Section label: "✦ OUR STORY ✦" in blue
- Heading: "About Wheelie Clean"
- Card with: photo placeholder (gradient bg) + paragraph body copy placeholder
- Copy placeholder prompts owner to fill in their story

### 9. Booking / Contact Form
- Background: deep navy gradient (matches hero)
- Radial green glow blob top-right
- Section label: "✦ GET STARTED ✦" in `#7aeea0`
- Heading: "Book a Clean"
- Floating white card form:
  - Name, Phone, Postcode + Service Type (2-col row), Message textarea
  - "Send Enquiry →" submit button (blue gradient, glow shadow)
  - Fallback: "Or call us directly: 07XXX XXX XXX"
- Form is static HTML (no backend) — owner can wire up Formspree or similar

### 10. Service Area
- Background: `#f8f9fa`
- Section label: "✦ WHERE WE OPERATE ✦" in Mountain Tan
- Heading: "Serving Cumbria"
- Map placeholder (gradient bg, easily swapped for Google Maps embed)
- Town pill badges: Carlisle, Penrith, Kendal, Barrow-in-Furness, Whitehaven, + All surrounding areas

### 11. Footer
- Background: dark gradient `#1a1a1a → #2a2a2a`
- Full-colour logo (`height: 60px`) with blue drop-shadow glow
- Slogan: "Keep It Wheelie Clean" ✦ in `#00A3E3`
- Tagline: "Eco-friendly bin cleaning across Cumbria"
- Facebook + Instagram social pill buttons
- Copyright line

---

## Animations

All animations use `transform` and `opacity` only. No `transition-all`. Spring-style easing (`cubic-bezier(0.34, 1.56, 0.64, 1)` for bouncy, `cubic-bezier(0.25, 0.46, 0.45, 0.94)` for smooth).

| Element | Animation |
|---|---|
| Hero logo | Scale + fade in on load (`scale(0.8) → scale(1)`) |
| Hero headline | Stagger fade + slide up (each line delayed) |
| Hero CTAs | Fade + slide up after headline |
| Sparkle ✦ elements | Subtle pulse/twinkle loop |
| Stats numbers | Count up from 0 when scrolled into view |
| Section headings | Fade + slide up on scroll (IntersectionObserver) |
| Service cards | `translateY(-4px)` + shadow lift on hover |
| Buttons | Spring bounce on hover, scale(0.97) on active |
| Nav | Shadow/border animates in on scroll |
| Before/after images | Fade in with slight scale on scroll |

---

## Screenshot & Iteration Workflow

After building `index.html`:
1. Check for `serve.mjs` and `screenshot.mjs` in project root — create if missing
2. Start local server: `node serve.mjs` (serves on `http://localhost:3000`)
3. Screenshot: `node screenshot.mjs http://localhost:3000`
4. Screenshots auto-saved to `./temporary screenshots/screenshot-N.png`
5. Read screenshot with Read tool, visually analyse against spec
6. Fix mismatches, re-screenshot — minimum 2 rounds
7. Stop only when no visible differences remain

---

## Output

- Single file: `index.html` in project root
- All styles inline (Tailwind CDN + custom `<style>` block for non-Tailwind)
- Tailwind via `<script src="https://cdn.tailwindcss.com"></script>`
- Logo referenced as `./IMG_1549 3.PNG`
- Placeholder images via `https://placehold.co/WxH`
- Mobile-first responsive (single column on mobile, grid on desktop)
- No external JS dependencies (vanilla JS for scroll animations and counter)
