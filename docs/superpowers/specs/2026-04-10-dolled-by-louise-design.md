# Dolled by Louise — Landing Page & AI Booking Agent Design Spec
**Date:** 2026-04-10

---

## Overview

A single-page, mobile-first landing page for Dolled by Louise, a lash artist based in Longtown, Cumbria. Primary goals: convert visitors into bookings via phone call or WhatsApp, and capture leads through an embedded AI booking agent that collects details and delivers them to Louise via WhatsApp and email.

---

## Business Details

| Field | Value |
|---|---|
| Business name | Dolled by Louise |
| Phone | +44 7464 557236 |
| WhatsApp | wa.me/447464557236 |
| Email (bookings) | louisetrainorr@gmail.com |
| Address | 33 Albert Street, Longtown, CA6 5SF |
| Google Maps | https://maps.google.com/?q=33+Albert+Street,+Longtown,+CA6+5SF |
| Instagram | Placeholder (coming soon) |
| Logo | Text wordmark — no logo yet |

---

## Services

### Lash Lifts
- Korean Lash Lift — intense curl & lift
- LVL Lashes — Length, Volume & Lift
- Lash Tint — deeper, darker lashes
- Lift + Tint Combo

### Lash Extensions
- Classic — natural & defined
- Hybrid — classic & volume blend
- Russian Volume — full & fluffy fans
- Mega Volume — maximum drama
- Infills — 2–3 weeks after set

**Note:** All prices are placeholder (£XX) — Louise to confirm before go-live.

---

## Visual Direction

| Token | Value |
|---|---|
| `--plum` | `#2d1423` |
| `--rose` | `#c97fa0` |
| `--blush` | `#fce8ee` |
| `--lilac` | `#e8d5f0` |
| `--cream` | `#fdf8f5` |
| `--wa` | `#25D366` |

- **Vibe:** Soft feminine luxury — blush pinks, deep plum, and lilac accents
- **Heading font:** Cormorant Garamond (Google Fonts) — italic, light weight
- **Body font:** Jost (Google Fonts) — 300/400/500 weights
- **Texture:** SVG fractalNoise grain overlay on `body::before` at 4% opacity
- **Gradients:** Multi-layer radial gradients on hero and section backgrounds
- **Shadows:** Pink-tinted `box-shadow` with rgba rose values
- **Animations:** `transform` + `opacity` only — spring cubic-bezier easing

---

## Page Structure

### 1. Floating WhatsApp Button
Fixed bottom-right, z-index 1000. Plum-to-deep-plum gradient circle, pulsing `box-shadow` animation. Links to `wa.me/447464557236`.

### 2. Sticky Nav
- Left: "Dolled by Louise" italic Cormorant Garamond wordmark with "Lash Artist · Longtown" Jost subtitle in rose
- Right: "📞 Call" pill (plum bg) + "Book Now" WhatsApp pill (green bg)
- Transparent on load → blush/cream with backdrop-filter blur on scroll (IntersectionObserver or scroll event)
- On mobile: hide "Call" button to avoid crowding

### 3. Hero (full viewport)
- Multi-layer radial gradient background (blush → lilac → cream) with `heroBreath` hue-rotate animation
- 4 floating decorative rings (2 large border-only, 2 small filled) with `floatA`/`floatB` keyframe animations
- Monogram circle: 92px, gradient blush→lilac, letter "D" in Cormorant Garamond
- Label: `✦ Premium Lash Artist · Longtown, Cumbria ✦` in rose uppercase Jost
- H1: "Dolled by Louise" — Cormorant Garamond italic, `clamp(52px, 11vw, 104px)`, font-weight 300
- Rose/lilac gradient divider line (44px × 2px)
- Tagline: "Expert lash lifts & extensions tailored to your unique eye shape."
- Dual CTAs: "📞 Call to Book" (plum pill) + "WhatsApp" (green pill with WA SVG icon)
- Scroll cue: "Scroll" label + gradient line, `scrollBounce` animation

**Staggered fade-in:** all hero elements animate in with `fadeUp` keyframe (opacity 0→1, translateY 22px→0) with delays of 0.2s, 0.4s, 0.55s, 0.7s, 0.9s.

### 4. Stats Bar
White background, 4 stats in a flex row:
- 100+ Happy Clients
- 5★ Rated
- 100% Premium Products
- Certified & Insured

Each stat: large Cormorant Garamond number + small rose uppercase Jost label. Dividers between stats (border-left on `+` sibling). Collapses to vertical on mobile.

### 5. Services Section
White background. Two cards in a CSS grid (`repeat(auto-fit, minmax(290px, 1fr))`):

**Card 1 — Lash Lifts** (blush→lilac gradient bg):
- Icon: ✨
- Description paragraph
- Bullet list: Korean Lash Lift, LVL Lashes, Lash Tint
- WhatsApp CTA: `wa.me/447464557236?text=Hi Louise! I'd love to book a lash lift ✨`

**Card 2 — Lash Extensions** (lilac→blush gradient bg):
- Icon: 👁
- Description paragraph
- Bullet list: Classic, Hybrid, Russian Volume, Mega Volume
- WhatsApp CTA: `wa.me/447464557236?text=Hi Louise! I'd love to book lash extensions 👁`

Cards lift 10px with pink-tinted shadow on hover (`transform 0.32s cubic-bezier(0.34,1.3,0.64,1)`).

### 6. Pricing Section
Blush gradient background. Two white rounded panels (20px border-radius, pink box-shadow):
- Left: Lash Lifts pricing (Korean Lash Lift, LVL, Lash Tint, Lift + Tint Combo) — all £XX placeholders
- Right: Extensions pricing (Classic, Hybrid, Russian Volume, Mega Volume, Infills) — all £XX placeholders

Each row: treatment name + description subtitle on left, `£XX` in Cormorant Garamond rose on right. Subtle hover: row gets blush bg, negative margin expansion. Note at top: "Prices to be confirmed by Louise".

### 7. How to Book (3 Steps)
White background. 3-column grid (stacks on mobile):
1. Get in Touch — call or WhatsApp to check availability
2. Book Your Slot — confirm time, deposit may be required
3. Get Dolled Up — sit back, relax, leave with lashes you'll love

Each step: numbered circle (blush→lilac gradient), Cormorant Garamond step title, Jost body text.

### 8. Gallery
Blush→lilac gradient background. 3×2 CSS grid of placeholder images (`placehold.co/400x400`), `aspect-ratio: 1`, 14px border-radius. On hover: image scales 1.07, dark gradient overlay fades in with caption label (Classic Set, Hybrid Set, Russian Volume, Korean Lift, LVL Lashes, Mega Volume). Note: client to swap in real photos.

### 9. Testimonials
White background. Two cards side-by-side (stacks on mobile):
- Large decorative `"` quote mark (Cormorant Garamond, rose, 18% opacity) via `::before`
- ★★★★★ stars in amber
- Italic review text
- Reviewer name in rose uppercase Jost

Cards lift + shadow deepens on hover. Placeholder copy — client to swap for real reviews.

### 10. FAQ Accordion
Blush gradient background. 5 `<details>` / `<summary>` items:
1. How long do lash extensions last?
2. What's the difference between Korean Lash Lift and LVL?
3. How do I prepare for my appointment?
4. Can I wear mascara with extensions?
5. Where are you based? (includes Google Maps link inline)

Icon circle rotates 45° when open. Smooth height transition on answer reveal.

### 11. Book & Find Us
Deep plum gradient background (`#2d1423` → `#4a1a30`). Centred:
- Rose label: `✦ Ready to get dolled? ✦`
- Italic Cormorant Garamond heading: "Book Your Appointment"
- Large clickable phone number in rose (`tel:` link)
- Address in muted uppercase
- Google Maps link (pin icon SVG + "View on Google Maps") in rose
- Dual CTA buttons: "📞 Call Now" (rose gradient pill) + "WhatsApp Us" (green pill)

### 12. Footer
Near-black (`#1a0a10`) background:
- Left: "Dolled by Louise" italic Cormorant Garamond
- Right: "© 2026 · Instagram coming soon"

---

## AI Booking Agent — Option C (Smart Assistant + Booking)

### Behaviour
The agent can do two things:
1. **Answer questions** — services explained, differences between treatments, aftercare advice, what to expect, pricing (directs to call if prices not set), location
2. **Take bookings** — collects all required details, shows confirmation summary, sends via WhatsApp + email

The agent detects intent and switches between modes seamlessly. After answering a question it always offers to book.

### Widget UI
- **Collapsed state:** 64px circle button, plum gradient, chat bubble SVG icon, rose badge showing "1" — pinned bottom-right. Pulses via `box-shadow` animation.
- **Open state:** 380px wide chat panel (full-width on mobile), fixed bottom-right, max-height 520px with overflow scroll on messages.

**Header:** plum gradient, "D" monogram avatar, business name, status line.

**Progress bar:** 3px rose→lilac gradient bar below header, shows current step of 5.

**Messages:**
- Bot messages: white bubble, left-aligned, subtle border + shadow, `border-radius: 12px 12px 12px 3px`
- User messages: plum gradient bubble, right-aligned, `border-radius: 12px 12px 3px 12px`
- Typing indicator: three animated dots while waiting for API response

**Quick reply chips:** Displayed after service question. Options: Korean Lash Lift, LVL Lashes, Lash Tint, Classic, Hybrid, Russian Volume, Mega Volume, "Not sure — help me choose!". Tap selects (highlighted in rose), or user can type.

**Booking flow (5 steps):**
1. Name
2. Service (with chips + "help me choose" path)
3. Preferred date / day of week
4. Contact: phone or email
5. Any notes (allergies, first-time, special requests)

**Confirmation screen:** Card showing all collected details (name, service, date, contact, notes) before sending. "Does everything look right?"

**Send buttons:**
- "Send via WhatsApp" (green) — generates pre-filled `wa.me` URL and opens it
- "📧 Email too" (blush/lilac) — triggers EmailJS send

### Data Delivery

**WhatsApp:** Constructs `wa.me/447464557236?text=...` URL with full booking summary URL-encoded. Opens in new tab for customer to tap Send.

**Email via EmailJS:**
- Service: EmailJS (free tier — 200 emails/month)
- To: `louisetrainorr@gmail.com`
- Subject: `New Booking Request — [name] — [service]`
- Body: structured booking summary with all fields

### Technical Architecture

```
index.html (or dolled-by-louise.html)
│
├── Chat widget UI (inline HTML/CSS/JS)
│   ├── Renders messages, quick replies, progress bar
│   └── Calls /api/chat on user message
│
├── /api/chat (Node.js endpoint in server.mjs)
│   ├── Receives conversation history
│   ├── Calls Anthropic claude-haiku-4-5 API
│   │   └── System prompt: Louise's assistant persona + service knowledge
│   └── Returns assistant reply + structured booking data if complete
│
└── EmailJS (client-side)
    └── Fires on confirmation — sends to louisetrainorr@gmail.com
```

**Server:** `server.mjs` — extends existing `serve.mjs` to add `/api/chat` POST endpoint. Serves static files on port 3000.

**Model:** `claude-haiku-4-5-20251001` — fast and cost-effective for chat (approx £0.001 per conversation).

**System prompt covers:**
- Louise's assistant persona (warm, friendly, knowledgeable)
- Full service menu with descriptions and differences
- Aftercare advice per treatment
- Booking flow instructions
- When to hand off to Louise directly (complex queries, pricing disputes)
- Longtown location details

**API key:** `ANTHROPIC_API_KEY` environment variable — never exposed to client.

**EmailJS config:** `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`, `EMAILJS_PUBLIC_KEY` — the public key is safe to embed directly in the page `<script>` (it is intentionally client-side). Service ID and template ID are also non-secret and can be inlined.

---

## Additional Features

### Local SEO — `<head>` metadata

**`<title>`:** `Dolled by Louise — Lash Artist in Longtown, Cumbria`

**`<meta description>`:** `Expert lash lifts and extensions in Longtown, Cumbria. Korean Lash Lift, LVL, Classic, Hybrid & Russian Volume. Call or WhatsApp Louise to book.`

**JSON-LD schema** (`application/ld+json`) — `LocalBusiness` type:
```json
{
  "@context": "https://schema.org",
  "@type": "BeautySalon",
  "name": "Dolled by Louise",
  "description": "Expert lash lifts and extensions in Longtown, Cumbria",
  "telephone": "+447464557236",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "33 Albert Street",
    "addressLocality": "Longtown",
    "postalCode": "CA6 5SF",
    "addressCountry": "GB"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 55.0007,
    "longitude": -2.9757
  },
  "url": "https://dolledbylouise.co.uk",
  "priceRange": "££",
  "hasMap": "https://maps.google.com/?q=33+Albert+Street,+Longtown,+CA6+5SF"
}
```

**Open Graph tags** (for WhatsApp/Facebook/iMessage link previews):
```html
<meta property="og:title" content="Dolled by Louise — Lash Artist in Longtown, Cumbria">
<meta property="og:description" content="Expert lash lifts and extensions. Call or WhatsApp Louise to book.">
<meta property="og:type" content="website">
<meta property="og:image" content="[placeholder og-image.jpg — 1200×630]">
```

---

### Nav Anchor Links

The nav right side adds smooth-scroll anchor links to key sections:
- Services (`#services`)
- Pricing (`#pricing`)
- Gallery (`#gallery`)
- FAQ (`#faq`)

Links styled in rose Jost, hidden on mobile (only CTAs shown). Each section gets a corresponding `id` attribute.

---

### Proactive Chat Bubble

After **8 seconds** on the page (if the chat widget hasn't been opened), a small message bubble pops out to the left of the widget button:

> *"Need help choosing a treatment? 💕"*

Behaviour:
- Animates in with `fadeUp` + slight slide from right
- Auto-dismisses after 6 seconds if not clicked
- Clicking it opens the chat widget
- Dismissed permanently for the session once closed or clicked
- Does NOT appear if the widget has already been opened

---

### Back-to-Top Button

A small circular button (40px, plum gradient, chevron-up SVG icon) pinned bottom-left. Hidden by default — fades in once user scrolls past 600px. Smooth-scrolls to top on click.

Sits to the left to avoid overlapping the floating WhatsApp button (bottom-right) and the AI agent (also bottom-right). Stacked order: agent > WhatsApp > back-to-top, from right to left.

---

### Cookie / Privacy Notice

UK law (PECR + UK GDPR) requires a cookie notice. A slim bar fixed to the **bottom** of the page (above footer, below everything else):

- Background: `#1a0a10` (matches footer)
- Text: "We use cookies to improve your experience. By continuing you agree to our use of cookies." in small Jost
- "Accept" pill button in rose — dismisses the bar and sets `localStorage` flag so it doesn't show again
- Bar does not obscure the WhatsApp button or agent on mobile — appears only if `localStorage` flag not set

---

### Before/After Slider

Sits between the Services section and Pricing — or inside the Gallery section as a featured item. A drag-to-reveal slider showing a natural lash photo on the left and finished result on the right.

Implementation:
- Single `<div>` with two absolutely-positioned images and a draggable divider line
- Divider: thin white line with a circular handle (plum gradient, double-chevron icon)
- Touch and mouse drag supported via `pointermove` events
- Defaults to 50/50 split, handle pulses once on load to signal it's draggable
- Placeholder images via `placehold.co` — client swaps in real before/after photos
- Caption beneath: `"Swipe to see the transformation ✨"`

---

### "Which Lash Is Right for Me?" Quiz

Placed after the Services section, before Pricing. A 3-step inline quiz inside a blush/lilac card:

**Step 1 — What look do you want?**
- Natural & subtle
- Defined & polished
- Full & dramatic

**Step 2 — How low-maintenance are you?**
- I want something I can forget about (lifts)
- I'm happy with infills every 3 weeks (extensions)

**Step 3 — Is this your first time?**
- Yes, first time
- No, I've had lashes before

**Result:** Recommended treatment shown in a styled result card with treatment name, description, duration, and a WhatsApp booking CTA pre-filled with that treatment.

Result mapping:
- Natural + forget about it → Korean Lash Lift
- Natural + first time → Classic Extensions
- Defined + extensions → Hybrid
- Full + extensions → Russian Volume
- Full + drama + experienced → Mega Volume

Quiz is pure HTML/CSS/JS — no API calls. Transitions between steps with `fadeUp` animation.

---

### Treatment Duration & Aftercare on Service Cards

Each service card and pricing row gains a small metadata line:

| Treatment | Duration | Lasts |
|---|---|---|
| Korean Lash Lift | 60–75 mins | 6–8 weeks |
| LVL Lashes | 45–60 mins | 6–8 weeks |
| Lash Tint | 15–20 mins | 4–6 weeks |
| Classic Extensions | 90–120 mins | 2–3 weeks (infills) |
| Hybrid Extensions | 90–120 mins | 2–3 weeks (infills) |
| Russian Volume | 120–150 mins | 2–3 weeks (infills) |
| Mega Volume | 150–180 mins | 2–3 weeks (infills) |

Displayed as: `⏱ 60–75 mins · lasts 6–8 weeks` in small rose Jost beneath the treatment name. Also added to the agent's knowledge base.

---

### Sticky Mobile Booking Bar

On mobile only (`max-width: 640px`), a slim fixed bar at the very bottom of the viewport — above the cookie notice if visible:

- Background: plum gradient
- Two equal buttons: `📞 Call` (plum) and WhatsApp icon + "WhatsApp" (green)
- Height: 52px
- Hidden on desktop
- Fades in after user scrolls past the hero CTA (so it doesn't appear immediately over the hero buttons)
- `padding-bottom` added to page body equal to bar height so content isn't obscured

---

### Google Reviews Badge

A small strip in the Stats Bar (section 4), or directly beneath the Testimonials section:

- Shows: Google logo + star rating (★★★★★) + "See our reviews" link
- Links to Louise's Google Business profile (placeholder URL — update when profile is live)
- Placeholder: shown as "★★★★★ Google Reviews — coming soon" until real profile exists
- Styled as a subtle pill: white background, thin rose border, Google colours for the "G" logo

---

### Referral Nudge After Booking

After the AI agent successfully sends the booking (WhatsApp opened + email fired), the chat widget shows a final message:

> *"You're all booked! 🎉 Louise will be in touch to confirm your slot.*
> *Love your lashes? Tell a friend about Dolled by Louise 💕"*

Below the message, a single share button:
- "Share with a friend" — uses the native Web Share API (`navigator.share`) on mobile (falls back to copying the URL on desktop)
- Styled as a small blush pill button

---

### About Louise Section

Placed between Testimonials and FAQ — where trust is already building. A warm, personal section that makes Louise feel human and approachable.

Layout: two columns on desktop (text left, photo right), stacked on mobile.

**Left — copy:**
- Small rose label: `✦ Meet Your Lash Artist`
- Cormorant Garamond heading: "Hi, I'm Louise"
- 3–4 sentences of personal intro (placeholder copy — Louise to write her own):
  > *"I've been obsessed with lashes ever since my first set completely changed how I felt leaving the house in the morning. I trained because I wanted every client to feel that same confidence. Based right here in Longtown, I treat every appointment like a visit from a friend — relaxed, personal, and always with your best result in mind."*
- Trust line: "Fully certified · insured · based in Cumbria"
- WhatsApp CTA: "Say hello 👋"

**Right — photo:**
- Circular portrait placeholder (`placehold.co/400x400`) with blush→lilac gradient border ring
- Caption: "Louise · Lash Artist" in small rose Jost

---

### Gift Vouchers Section

Placed just before the Footer — a standalone full-width strip with a blush/lilac gradient background.

Content:
- Label: `✦ The Perfect Gift`
- Heading: "Give the Gift of Gorgeous Lashes 🎁"
- Subtext: "Treat someone special to a lash treatment they'll love. Gift vouchers available for all services — just WhatsApp Louise to arrange."
- Single WhatsApp CTA: `wa.me/447464557236?text=Hi Louise! I'd love to enquire about a gift voucher 🎁`
- Small print: "Vouchers valid for 12 months from purchase"

---

### Aftercare Tips Section

Placed after the Gallery, before Testimonials. Helps clients know what to expect and reduces repetitive post-appointment messages to Louise.

Layout: 2×2 grid of tip cards on desktop, single column on mobile. Each card: icon circle (blush→lilac gradient), bold tip title, short explanation.

**Tips:**
1. 🚿 **Keep them dry for 24 hours** — avoid steam, swimming, and sweating for the first day
2. 🧴 **Avoid oil-based products** — oils break down lash adhesive; use oil-free micellar water
3. 🪮 **Brush daily** — use a clean spoolie every morning to keep lashes neat and separated
4. 😴 **Sleep on your back** — reduces friction and extends the life of your set
5. ✋ **Don't pick or pull** — let lashes shed naturally with your natural lash cycle

Section has blush gradient background. Cards are white with soft pink shadow, lift on hover.

---

### Save Contact / vCard Prompt

Added to the AI agent's post-booking confirmation message (alongside the referral nudge):

> *"Want to save Louise's number so you never lose it?"*

A "💾 Save to contacts" button triggers a download of a `.vcf` vCard file containing:
```
BEGIN:VCARD
VERSION:3.0
FN:Dolled by Louise
TEL;TYPE=CELL:+447464557236
EMAIL:louisetrainorr@gmail.com
ADR:;;33 Albert Street;Longtown;;CA6 5SF;UK
URL:https://dolledbylouise.co.uk
END:VCARD
```

The vCard is generated as a `data:` URI and triggered via a programmatic `<a download>` click. Works on iOS, Android, and desktop.

---

### Certification Strip

A slim full-width strip between the Stats Bar and Services section. White background, subtle rose top/bottom border.

Content: a flex row of trust badges centred horizontally:
- 🛡️ **Fully Insured**
- 🎓 **Professionally Trained**
- ✅ **Health & Safety Compliant**
- 💎 **Premium Products Only**

Each badge: small icon + bold label + subtle descriptor in rose Jost. Placeholders — update with real certification body logos (BABTAC, ABT, etc.) when available. Scroll-reveals as a group.

---

### Accessibility

The following accessibility requirements apply throughout:

- **Skip link:** `<a href="#main" class="skip-link">Skip to content</a>` as first element in `<body>`. Visually hidden until focused, appears on keyboard Tab. Smooth scrolls to `<main id="main">`.
- **ARIA labels:** all icon-only buttons (floating WA, back-to-top, chat toggle, send button) have descriptive `aria-label` attributes.
- **Focus-visible states:** all interactive elements show a rose `outline: 2px solid var(--rose)` on `:focus-visible` — never `outline: none`.
- **Semantic HTML:** `<nav>`, `<main>`, `<section>`, `<footer>`, `<h1>`→`<h3>` hierarchy respected throughout.
- **Alt text:** all `<img>` elements have descriptive `alt` attributes. Gallery placeholders use service name as alt text.
- **Colour contrast:** rose (`#c97fa0`) on cream (`#fdf8f5`) is used only for decorative/non-essential text. All body copy uses plum (`#2d1423`) on light backgrounds — passes WCAG AA.
- **Reduced motion:** all animations respect `@media (prefers-reduced-motion: reduce)` — transitions set to `0.01ms`, animations disabled.
- **Chat widget keyboard:** chat input focusable, Enter sends message, Escape closes widget.

---

## Technical Constraints

- Single HTML file (`dolled-by-louise.html`) — all styles inline
- `server.mjs` replaces `serve.mjs` — adds `/api/chat` POST endpoint alongside static file serving
- Tailwind CSS via CDN
- Google Fonts via `<link>` preconnect
- Placeholder images via `placehold.co`
- Mobile-first responsive — breakpoint at 640px
- No build step, no frameworks
- Scroll reveal via `IntersectionObserver` (threshold 0.12)
- All animations on `transform` + `opacity` only — no `transition-all`
- Every interactive element has hover, focus-visible, and active states

---

## Placeholder Content (to swap before launch)

| Item | Status |
|---|---|
| Pricing (all £XX) | Louise to confirm |
| Gallery photos (6 placeholders) | Client to provide real photos |
| Testimonials (2 placeholder reviews) | Client to provide real reviews |
| Stats (100+, 5★ etc.) | Update to reflect real numbers |
| Instagram handle | Add when account is ready |
| Logo | Replace "D" monogram when logo created |
| OG image (`og-image.jpg`) | Create 1200×630 brand image for link previews |
| Domain URL in JSON-LD | Update `dolledbylouise.co.uk` to real domain when live |
| About photo | Louise to provide portrait photo for About section |
| About copy | Louise to write personal bio (placeholder provided) |
| Certification badges | Replace placeholder badges with real logos (BABTAC, ABT etc.) when available |
| Google Business URL | Add real URL to Google Reviews badge when profile is live |
| vCard URL | Update domain in vCard when live |
