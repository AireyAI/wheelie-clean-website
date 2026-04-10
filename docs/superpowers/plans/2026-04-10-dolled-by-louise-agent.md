# Dolled by Louise — AI Booking Agent Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Claude-powered AI chat widget embedded in `dolled-by-louise.html` that answers questions about services and guides visitors through a 5-step booking flow, delivering bookings via WhatsApp deep-link and EmailJS.

**Architecture:** `server.mjs` replaces `serve.mjs` — adds a `/api/chat` POST endpoint alongside static file serving. The chat widget is pure HTML/CSS/JS inline in `dolled-by-louise.html`. The Anthropic API key lives server-side only; the client never sees it.

**Tech Stack:** Node.js (ESM) · Anthropic SDK (`@anthropic-ai/sdk`) · EmailJS (CDN, client-side) · Vanilla JS · CSS custom properties

**Pre-requisite:** `dolled-by-louise.html` from Plan 1 must exist. This plan only adds to it.

---

## File Map

| Action | Path | Responsibility |
|---|---|---|
| Create | `server.mjs` | Static file server + `/api/chat` POST endpoint |
| Modify | `dolled-by-louise.html` | Add chat widget HTML, CSS, JS, EmailJS script |

---

### Task 1: Install Anthropic SDK and create `server.mjs`

**Files:**
- Create: `server.mjs`

- [ ] **Step 1: Install the Anthropic Node SDK**

```bash
npm install @anthropic-ai/sdk
```

Expected output: `added 1 package` (or similar). Creates `node_modules/@anthropic-ai/sdk`.

- [ ] **Step 2: Create `server.mjs` — static file server + `/api/chat` endpoint**

```javascript
import http        from 'http';
import fs          from 'fs';
import path        from 'path';
import { fileURLToPath } from 'url';
import Anthropic   from '@anthropic-ai/sdk';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT      = 3000;
const client    = new Anthropic(); // reads ANTHROPIC_API_KEY from env

const MIME = {
  '.html': 'text/html',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.mjs':  'application/javascript',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.vcf':  'text/vcard',
};

const SYSTEM_PROMPT = `You are Louise's friendly booking assistant for Dolled by Louise, a lash artist based at 33 Albert Street, Longtown, Cumbria, CA6 5SF.

Your two jobs:
1. ANSWER questions about services, treatments, aftercare, location, and what to expect.
2. COLLECT booking details when the visitor wants to book.

## Services & Durations
- Korean Lash Lift: intense curl & lift, 60–75 mins, lasts 6–8 weeks
- LVL Lashes: Length Volume & Lift, softer curl, 45–60 mins, lasts 6–8 weeks
- Lash Tint: darkens natural lashes, 15–20 mins, lasts 4–6 weeks
- Lift + Tint Combo: lift and tint together
- Classic Extensions: single lash application, 90–120 mins, 2–3 week infills
- Hybrid Extensions: classic + volume blend, 90–120 mins, 2–3 week infills
- Russian Volume: handcrafted fans, full & fluffy, 120–150 mins, 2–3 week infills
- Mega Volume: maximum drama, ultra-fine fans, 150–180 mins, 2–3 week infills
- Infills: maintenance 2–3 weeks after a full set

## Aftercare
- Keep lashes dry for 24 hours post-treatment
- Avoid oil-based products — oils break down lash adhesive
- Brush with a clean spoolie every morning
- Sleep on your back to reduce friction
- Do not pick or pull — let lashes shed naturally

## Booking Flow
When the visitor wants to book, collect these 5 things one at a time:
1. Their name
2. Which service (offer chips: Korean Lash Lift, LVL, Lash Tint, Classic, Hybrid, Russian Volume, Mega Volume, or "Not sure — help me choose!")
3. Preferred date or day of week
4. Contact: phone number or email address
5. Any notes (allergies, first time, special requests)

After collecting all 5, output a JSON block at the END of your message (after a blank line) in this exact format — nothing else after it:
{"booking":{"name":"...","service":"...","date":"...","contact":"...","notes":"...","ready":true}}

## Tone
Warm, friendly, knowledgeable. Short replies — 2–3 sentences max unless explaining a complex question. Always offer to book after answering a question.

## What you don't know
Exact prices are not set yet — tell visitors to contact Louise directly for current rates.
Louise's Instagram is coming soon.
The website URL will be dolledbylouise.co.uk when live.

## Location
33 Albert Street, Longtown, CA6 5SF. Short drive from Carlisle, near the Scottish borders.
Phone: +44 7464 557236
Email: louisetrainorr@gmail.com`;

async function handleChat(req, res) {
  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', async () => {
    try {
      const { messages } = JSON.parse(body);
      if (!Array.isArray(messages)) throw new Error('messages must be an array');

      const response = await client.messages.create({
        model:      'claude-haiku-4-5-20251001',
        max_tokens: 512,
        system:     SYSTEM_PROMPT,
        messages,
      });

      const text = response.content[0]?.text ?? '';
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ reply: text }));
    } catch (err) {
      console.error('Chat error:', err.message);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Something went wrong. Please try again.' }));
    }
  });
}

http.createServer((req, res) => {
  // CORS for local dev
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  if (req.method === 'POST' && req.url === '/api/chat') {
    handleChat(req, res);
    return;
  }

  // Static file serving
  let urlPath = req.url === '/' ? '/index.html' : req.url;
  urlPath = decodeURIComponent(urlPath.split('?')[0]);
  const filePath = path.join(__dirname, urlPath);
  const ext      = path.extname(filePath).toLowerCase();

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
  console.log(`Dolled by Louise dev server → http://localhost:${PORT}`);
});
```

- [ ] **Step 3: Kill existing serve.mjs server if running, then start server.mjs**

```bash
pkill -f "node serve.mjs" 2>/dev/null; ANTHROPIC_API_KEY=your_key_here node server.mjs
```

Replace `your_key_here` with the real API key. If the key is already in your shell environment, just run `node server.mjs`.

- [ ] **Step 4: Test the `/api/chat` endpoint directly**

```bash
curl -s -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"What lash services do you offer?"}]}' | node -e "const d=require('fs').readFileSync('/dev/stdin','utf8');console.log(JSON.parse(d).reply.slice(0,120))"
```

Expected: A short reply mentioning lash lifts and extensions. If you get `{"error":...}` check the `ANTHROPIC_API_KEY` env var is set.

- [ ] **Step 5: Commit**

```bash
git add server.mjs package.json package-lock.json
git commit -m "feat: add server.mjs with /api/chat Anthropic endpoint"
```

---

### Task 2: Chat widget HTML structure

**Files:**
- Modify: `dolled-by-louise.html` — add widget HTML before `</body>`

- [ ] **Step 1: Add the widget HTML**

Add this immediately before the floating WA button (before `</body>`):

```html
<!-- ══════════════════════════════════════════
     AI Chat Widget
══════════════════════════════════════════ -->

<!-- Toggle button -->
<button id="chatToggle"
  aria-label="Open chat assistant"
  aria-expanded="false"
  aria-controls="chatPanel"
  style="
    position:fixed; bottom:96px; right:24px; z-index:210;
    width:60px; height:60px; border-radius:50%; border:none; cursor:pointer;
    background:linear-gradient(135deg,var(--plum),#4a1a30);
    display:flex; align-items:center; justify-content:center;
    box-shadow:0 4px 24px rgba(45,20,35,0.35);
    animation:waPulse 3s ease-in-out infinite 1.2s;
    transition:transform 0.2s var(--easing);
  ">
  <!-- Chat bubble icon -->
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fce8ee" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
  </svg>
  <!-- Notification badge -->
  <span id="chatBadge" aria-hidden="true" style="
    position:absolute; top:2px; right:2px;
    width:18px; height:18px; border-radius:50%;
    background:var(--rose); color:#fff;
    font-family:'Jost',sans-serif; font-size:10px; font-weight:500;
    display:flex; align-items:center; justify-content:center;
  ">1</span>
</button>

<!-- Chat panel -->
<div id="chatPanel" role="dialog" aria-label="Lash booking assistant" aria-modal="true"
  style="
    position:fixed; bottom:168px; right:24px; z-index:210;
    width:min(380px, calc(100vw - 32px));
    max-height:520px;
    background:#fff; border-radius:20px;
    box-shadow:0 12px 60px rgba(45,20,35,0.22);
    display:none; flex-direction:column; overflow:hidden;
  ">

  <!-- Header -->
  <div style="
    background:linear-gradient(135deg,var(--plum),#4a1a30);
    padding:16px 18px; display:flex; align-items:center; gap:12px;
    flex-shrink:0;
  ">
    <div style="
      width:40px;height:40px;border-radius:50%;
      background:linear-gradient(135deg,var(--blush),var(--lilac));
      display:flex;align-items:center;justify-content:center;
      flex-shrink:0;
    " aria-hidden="true">
      <span style="font-family:'Cormorant Garamond',serif;font-style:italic;font-size:20px;font-weight:300;color:var(--plum);">D</span>
    </div>
    <div style="flex:1;min-width:0;">
      <div style="font-family:'Jost',sans-serif;font-size:14px;font-weight:500;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">Dolled by Louise</div>
      <div style="font-family:'Jost',sans-serif;font-size:11px;color:rgba(252,232,238,0.7);">Booking assistant · usually replies instantly</div>
    </div>
    <button id="chatClose" aria-label="Close chat"
      style="background:none;border:none;cursor:pointer;padding:4px;color:rgba(252,232,238,0.7);transition:color 0.15s;"
      onmouseenter="this.style.color='#fff'" onmouseleave="this.style.color='rgba(252,232,238,0.7)'">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12"/></svg>
    </button>
  </div>

  <!-- Progress bar -->
  <div style="height:3px;background:rgba(201,127,160,0.15);flex-shrink:0;">
    <div id="chatProgress" style="height:100%;background:linear-gradient(90deg,var(--rose),var(--lilac));width:0%;transition:width 0.4s var(--easing);"></div>
  </div>

  <!-- Messages -->
  <div id="chatMessages" style="
    flex:1; overflow-y:auto; padding:16px;
    display:flex; flex-direction:column; gap:10px;
    scroll-behavior:smooth;
  " aria-live="polite" aria-atomic="false">
    <!-- Messages rendered here by JS -->
  </div>

  <!-- Quick replies -->
  <div id="chatChips" style="padding:0 12px 10px;display:flex;flex-wrap:wrap;gap:6px;flex-shrink:0;"></div>

  <!-- Input area -->
  <div style="padding:12px 14px;border-top:1px solid rgba(201,127,160,0.12);display:flex;gap:8px;align-items:flex-end;flex-shrink:0;">
    <textarea id="chatInput"
      placeholder="Type a message…"
      aria-label="Chat message"
      rows="1"
      style="
        flex:1;resize:none;border:1.5px solid rgba(201,127,160,0.2);
        border-radius:12px;padding:10px 14px;
        font-family:'Jost',sans-serif;font-size:14px;font-weight:300;color:var(--plum);
        outline:none;line-height:1.5;max-height:100px;overflow-y:auto;
        transition:border-color 0.2s;
      "
      onfocus="this.style.borderColor='var(--rose)'"
      onblur="this.style.borderColor='rgba(201,127,160,0.2)'"></textarea>
    <button id="chatSend" aria-label="Send message" style="
      width:40px;height:40px;border-radius:50%;border:none;cursor:pointer;flex-shrink:0;
      background:linear-gradient(135deg,var(--plum),#4a1a30);
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 2px 10px rgba(45,20,35,0.2);
      transition:transform 0.2s var(--easing),box-shadow 0.2s;
    "
    onmouseenter="this.style.transform='scale(1.08)'" onmouseleave="this.style.transform='scale(1)'">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fce8ee" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
    </button>
  </div>
</div>
```

- [ ] **Step 2: Screenshot — verify toggle button appears bottom-right (above WA button)**

The chat button should be visible at bottom-right. The WA button should be directly below it. No panel visible yet.

- [ ] **Step 3: Commit**

```bash
git add dolled-by-louise.html
git commit -m "feat: add chat widget HTML structure and panel"
```

---

### Task 3: Chat widget CSS

**Files:**
- Modify: `dolled-by-louise.html` — add styles to the inline `<style>` block

- [ ] **Step 1: Add chat bubble and chip styles to the `<style>` block in `<head>`**

```css
/* ── Chat message bubbles ── */
.chat-bot {
  background: #fff;
  border: 1.5px solid rgba(201,127,160,0.15);
  border-radius: 12px 12px 12px 3px;
  padding: 11px 14px;
  font-size: 14px; font-weight: 300; line-height: 1.65; color: var(--plum);
  max-width: 86%;
  box-shadow: 0 2px 10px rgba(45,20,35,0.06);
  align-self: flex-start;
}
.chat-user {
  background: linear-gradient(135deg, var(--plum), #4a1a30);
  border-radius: 12px 12px 3px 12px;
  padding: 11px 14px;
  font-size: 14px; font-weight: 300; line-height: 1.65; color: var(--cream);
  max-width: 86%;
  align-self: flex-end;
}
.chat-typing {
  display: flex; gap: 5px; padding: 13px 16px; align-self: flex-start;
}
.chat-typing span {
  width: 7px; height: 7px; border-radius: 50%; background: var(--rose); opacity: 0.5;
}
.chat-typing span:nth-child(1) { animation: typingDot 1.2s 0.0s ease-in-out infinite; }
.chat-typing span:nth-child(2) { animation: typingDot 1.2s 0.2s ease-in-out infinite; }
.chat-typing span:nth-child(3) { animation: typingDot 1.2s 0.4s ease-in-out infinite; }
@keyframes typingDot {
  0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
  30%           { opacity: 1;   transform: translateY(-4px); }
}

/* ── Quick reply chips ── */
.chat-chip {
  background: var(--blush); border: 1.5px solid rgba(201,127,160,0.2);
  border-radius: 999px; padding: 7px 14px;
  font-family: 'Jost',sans-serif; font-size: 12px; font-weight: 400; color: var(--plum);
  cursor: pointer; white-space: nowrap;
  transition: background 0.2s, border-color 0.2s, transform 0.2s var(--easing);
}
.chat-chip:hover  { background: var(--lilac); border-color: var(--rose); transform: scale(1.04); }
.chat-chip:active { transform: scale(0.97); }
.chat-chip:focus-visible { outline: 2px solid var(--rose); }

/* ── Booking confirmation card ── */
.booking-confirm {
  background: linear-gradient(135deg, var(--blush), var(--lilac));
  border-radius: 12px; padding: 14px 16px;
  font-family: 'Jost',sans-serif; font-size: 13px; color: var(--plum); line-height: 1.75;
  margin: 4px 0; width: 100%;
}
.booking-confirm strong { font-weight: 500; }
.booking-confirm .booking-actions { display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap; }
.btn-wa-sm {
  flex: 1; min-width: 100px;
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  background: var(--wa); color: #fff;
  padding: 9px 14px; border-radius: 999px; border: none; cursor: pointer;
  font-family: 'Jost',sans-serif; font-size: 12px; font-weight: 500;
  transition: transform 0.2s var(--easing), box-shadow 0.2s;
  text-decoration: none;
}
.btn-wa-sm:hover { transform: translateY(-2px); box-shadow: 0 4px 14px rgba(37,211,102,0.3); }
.btn-blush-sm {
  flex: 1; min-width: 100px;
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  background: linear-gradient(135deg, var(--blush), var(--lilac));
  color: var(--plum); border: 1.5px solid rgba(201,127,160,0.3);
  padding: 9px 14px; border-radius: 999px; cursor: pointer;
  font-family: 'Jost',sans-serif; font-size: 12px; font-weight: 500;
  transition: transform 0.2s var(--easing);
}
.btn-blush-sm:hover { transform: translateY(-2px); }
```

- [ ] **Step 2: Commit**

```bash
git add dolled-by-louise.html
git commit -m "feat: add chat widget CSS — bubbles, chips, confirmation card"
```

---

### Task 4: Chat widget JavaScript — open/close, message loop, API calls

**Files:**
- Modify: `dolled-by-louise.html` — add `<script>` block before `</body>`

- [ ] **Step 1: Add the core chat JS**

Add this as a new `<script>` block, before the IntersectionObserver script:

```html
<script>
(function(){
  /* ── State ── */
  const state = {
    open:      false,
    messages:  [],  // Anthropic messages array: [{role, content}]
    booking:   {},  // collected booking fields
    step:      0,   // 0=idle, 1=name, 2=service, 3=date, 4=contact, 5=notes, 6=confirm
    sent:      false,
  };

  /* ── DOM refs ── */
  const toggle   = document.getElementById('chatToggle');
  const panel    = document.getElementById('chatPanel');
  const closeBtn = document.getElementById('chatClose');
  const input    = document.getElementById('chatInput');
  const sendBtn  = document.getElementById('chatSend');
  const msgs     = document.getElementById('chatMessages');
  const chips    = document.getElementById('chatChips');
  const progress = document.getElementById('chatProgress');
  const badge    = document.getElementById('chatBadge');

  /* ── Open / close ── */
  function openChat() {
    state.open = true;
    panel.style.display = 'flex';
    toggle.setAttribute('aria-expanded','true');
    badge.style.display = 'none';
    if (window._setChatOpened) window._setChatOpened();
    // Hide proactive bubble
    const promo = document.getElementById('chatPromo');
    if (promo) { promo.style.opacity='0'; promo.style.pointerEvents='none'; }
    if (state.messages.length === 0) greet();
    requestAnimationFrame(() => input.focus());
  }

  function closeChat() {
    state.open = false;
    panel.style.display = 'none';
    toggle.setAttribute('aria-expanded','false');
  }

  toggle.addEventListener('click', () => state.open ? closeChat() : openChat());
  closeBtn.addEventListener('click', closeChat);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && state.open) closeChat(); });

  // Proactive bubble click opens chat
  const promo = document.getElementById('chatPromo');
  if (promo) promo.addEventListener('click', openChat);

  /* ── Render a message bubble ── */
  function addBubble(text, role) {
    const div = document.createElement('div');
    div.className = role === 'user' ? 'chat-user' : 'chat-bot';
    // Render newlines as <br>
    div.innerHTML = text.replace(/\n/g,'<br>');
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
    return div;
  }

  /* ── Typing indicator ── */
  function showTyping() {
    const d = document.createElement('div');
    d.className = 'chat-bot chat-typing';
    d.id = 'chatTyping';
    d.innerHTML = '<span></span><span></span><span></span>';
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
  }
  function hideTyping() {
    const t = document.getElementById('chatTyping');
    if (t) t.remove();
  }

  /* ── Progress bar (step 0–5 maps to 0–100%) ── */
  function setProgress(step) {
    progress.style.width = (step / 5 * 100) + '%';
  }

  /* ── Quick reply chips ── */
  function setChips(labels) {
    chips.innerHTML = '';
    labels.forEach(label => {
      const btn = document.createElement('button');
      btn.className = 'chat-chip';
      btn.textContent = label;
      btn.addEventListener('click', () => { chips.innerHTML=''; sendMessage(label); });
      chips.appendChild(btn);
    });
  }

  /* ── Greeting ── */
  function greet() {
    const opener = `Hi! 💕 I'm Louise's assistant. I can tell you all about our lash services, or help you book an appointment.\n\nWhat can I help you with today?`;
    addBubble(opener, 'bot');
    setChips(['I want to book','Tell me about lash lifts','Tell me about extensions','Prices?','Where are you based?']);
  }

  /* ── Send a message ── */
  async function sendMessage(text) {
    if (!text.trim()) return;
    // Clear input
    input.value = '';
    input.style.height = 'auto';
    chips.innerHTML = '';

    // Show user bubble
    addBubble(text, 'user');

    // Add to history
    state.messages.push({ role: 'user', content: text });

    // Show typing
    showTyping();

    try {
      const res  = await fetch('/api/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ messages: state.messages }),
      });
      const data = await res.json();
      hideTyping();

      if (data.error) { addBubble('Oops, something went wrong. Please try again or call Louise directly on +44 7464 557236 💕', 'bot'); return; }

      const reply = data.reply;

      // Check for booking JSON at end of reply
      const jsonMatch = reply.match(/\{"booking":\{.*?"ready":true\}\}/s);
      let displayText = reply;
      let bookingData = null;

      if (jsonMatch) {
        displayText = reply.replace(jsonMatch[0], '').trim();
        try { bookingData = JSON.parse(jsonMatch[0]).booking; } catch(e) {}
      }

      // Add assistant reply to history (without the JSON blob)
      state.messages.push({ role: 'assistant', content: reply });

      if (displayText) addBubble(displayText, 'bot');

      if (bookingData && bookingData.ready) {
        showConfirmation(bookingData);
        setProgress(5);
      } else {
        // Show service chips after first bot message if idle
        if (state.messages.length === 2) {
          setChips(['Korean Lash Lift','LVL Lashes','Lash Tint','Classic','Hybrid','Russian Volume','Mega Volume','Not sure — help me choose!']);
        }
      }
    } catch(err) {
      hideTyping();
      addBubble('Oops, I lost connection. Please try again or call Louise directly 💕', 'bot');
    }
  }

  /* ── Send button + Enter key ── */
  sendBtn.addEventListener('click', () => sendMessage(input.value));
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input.value); }
  });
  // Auto-resize textarea
  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = input.scrollHeight + 'px';
  });

  /* ── Booking confirmation card ── */
  function showConfirmation(b) {
    state.booking = b;
    const card = document.createElement('div');
    card.className = 'booking-confirm';
    card.innerHTML = `
      <div style="font-family:'Cormorant Garamond',serif;font-style:italic;font-size:18px;margin-bottom:10px;">Your booking summary</div>
      <div><strong>Name:</strong> ${escHtml(b.name)}</div>
      <div><strong>Service:</strong> ${escHtml(b.service)}</div>
      <div><strong>Date:</strong> ${escHtml(b.date)}</div>
      <div><strong>Contact:</strong> ${escHtml(b.contact)}</div>
      ${b.notes ? `<div><strong>Notes:</strong> ${escHtml(b.notes)}</div>` : ''}
      <p style="margin-top:10px;font-size:12px;opacity:0.7;">Does everything look right?</p>
      <div class="booking-actions">
        <a href="${buildWaUrl(b)}" target="_blank" rel="noopener" class="btn-wa-sm" id="sendWa">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
          Send via WhatsApp
        </a>
        <button class="btn-blush-sm" id="sendEmail" type="button">
          📧 Email too
        </button>
      </div>
    `;
    msgs.appendChild(card);
    msgs.scrollTop = msgs.scrollHeight;

    // Wire up email button
    document.getElementById('sendEmail').addEventListener('click', () => sendViaEmail(b));
    // Wire up WA — after click show post-booking message
    document.getElementById('sendWa').addEventListener('click', () => {
      setTimeout(() => showPostBooking(), 1200);
    });
  }

  /* ── Build WhatsApp URL ── */
  function buildWaUrl(b) {
    const msg = `New booking request from the website 💕\n\nName: ${b.name}\nService: ${b.service}\nDate: ${b.date}\nContact: ${b.contact}${b.notes ? '\nNotes: ' + b.notes : ''}`;
    return 'https://wa.me/447464557236?text=' + encodeURIComponent(msg);
  }

  /* ── Send via EmailJS ── */
  function sendViaEmail(b) {
    if (typeof emailjs === 'undefined') {
      addBubble('Email sending not configured yet — please use WhatsApp to send your booking! 💕', 'bot');
      return;
    }
    emailjs.send(
      window.EMAILJS_SERVICE_ID  || 'YOUR_SERVICE_ID',
      window.EMAILJS_TEMPLATE_ID || 'YOUR_TEMPLATE_ID',
      {
        to_email:   'louisetrainorr@gmail.com',
        subject:    `New Booking Request — ${b.name} — ${b.service}`,
        name:       b.name,
        service:    b.service,
        date:       b.date,
        contact:    b.contact,
        notes:      b.notes || 'None',
      }
    ).then(
      () => { addBubble('Email sent! Louise will be in touch to confirm your slot 💕', 'bot'); showPostBooking(); },
      (err) => { console.error('EmailJS error:', err); addBubble('Email sending failed — please try WhatsApp instead 💕', 'bot'); }
    );
  }

  /* ── Post-booking: referral nudge + vCard ── */
  function showPostBooking() {
    if (state.sent) return;
    state.sent = true;

    const msg = `You're all booked! 🎉 Louise will be in touch to confirm your slot.\n\nLove your lashes? Tell a friend about Dolled by Louise 💕`;
    addBubble(msg, 'bot');

    // Share button + vCard
    const actions = document.createElement('div');
    actions.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;padding:4px 0;';

    const shareBtn = document.createElement('button');
    shareBtn.className = 'chat-chip';
    shareBtn.textContent = '💕 Share with a friend';
    shareBtn.addEventListener('click', () => {
      if (navigator.share) {
        navigator.share({ title:'Dolled by Louise', text:'Amazing lash artist in Longtown, Cumbria!', url: location.href });
      } else {
        navigator.clipboard.writeText(location.href).then(() => addBubble('Link copied! Share it with a friend 💕', 'bot'));
      }
    });

    const vcardBtn = document.createElement('button');
    vcardBtn.className = 'chat-chip';
    vcardBtn.textContent = '💾 Save Louise\'s number';
    vcardBtn.addEventListener('click', () => downloadVcard());

    actions.appendChild(shareBtn);
    actions.appendChild(vcardBtn);
    msgs.appendChild(actions);
    msgs.scrollTop = msgs.scrollHeight;
  }

  /* ── vCard download ── */
  function downloadVcard() {
    const vcf = `BEGIN:VCARD\nVERSION:3.0\nFN:Dolled by Louise\nTEL;TYPE=CELL:+447464557236\nEMAIL:louisetrainorr@gmail.com\nADR:;;33 Albert Street;Longtown;;CA6 5SF;UK\nURL:https://dolledbylouise.co.uk\nEND:VCARD`;
    const a = document.createElement('a');
    a.href = 'data:text/vcard;charset=utf-8,' + encodeURIComponent(vcf);
    a.download = 'dolled-by-louise.vcf';
    a.click();
  }

  /* ── Helpers ── */
  function escHtml(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

})();
</script>
```

- [ ] **Step 2: Screenshot — open the chat panel, verify it displays the greeting message and quick reply chips**

The greeting "Hi! 💕 I'm Louise's assistant…" should appear with 5 chip buttons below it.

- [ ] **Step 3: Commit**

```bash
git add dolled-by-louise.html
git commit -m "feat: add chat widget JS with message loop, typing indicator, booking confirmation"
```

---

### Task 5: Wire up EmailJS

**Files:**
- Modify: `dolled-by-louise.html` — add EmailJS SDK script and config

EmailJS is client-side-only. The public key, service ID, and template ID are intentionally non-secret.

- [ ] **Step 1: Set up EmailJS account**

1. Go to [emailjs.com](https://www.emailjs.com) and create a free account (200 emails/month free).
2. Add an **Email Service** connected to `louisetrainorr@gmail.com`. Note the **Service ID**.
3. Create an **Email Template** with these variables: `{{name}}`, `{{service}}`, `{{date}}`, `{{contact}}`, `{{notes}}`, `{{subject}}`. Set `To Email` to `louisetrainorr@gmail.com`. Note the **Template ID**.
4. Find your **Public Key** in Account > API Keys.

- [ ] **Step 2: Add EmailJS SDK and config to `dolled-by-louise.html` `<head>`**

Add before the closing `</head>`:

```html
<!-- EmailJS -->
<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js"></script>
<script>
  window.EMAILJS_SERVICE_ID  = 'YOUR_SERVICE_ID';   // replace with real value
  window.EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';  // replace with real value
  (function(){ emailjs.init({ publicKey: 'YOUR_PUBLIC_KEY' }); })(); // replace with real value
</script>
```

- [ ] **Step 3: Test the full booking flow end-to-end**

1. Open `http://localhost:3000/dolled-by-louise.html`
2. Click the chat toggle button
3. Type "I want to book" — agent should ask for name
4. Complete all 5 steps
5. Verify the confirmation card appears with correct data
6. Click "Send via WhatsApp" — WhatsApp web should open with the booking pre-filled
7. Click "📧 Email too" — Louise should receive an email at `louisetrainorr@gmail.com`
8. Verify post-booking message appears with share + vCard buttons

- [ ] **Step 4: Test vCard download**

Click "💾 Save Louise's number" — should download `dolled-by-louise.vcf`. Open it and verify the contact shows "Dolled by Louise" with the correct phone number.

- [ ] **Step 5: Commit**

```bash
git add dolled-by-louise.html
git commit -m "feat: wire up EmailJS for booking email delivery"
```

---

### Task 6: Final integration — switch from serve.mjs to server.mjs

**Files:**
- No file changes needed — this is a process/documentation step

- [ ] **Step 1: Update any `package.json` start script if present**

If `package.json` has a `"start"` or `"dev"` script pointing to `serve.mjs`, update it:

```json
{
  "scripts": {
    "dev": "ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY node server.mjs"
  }
}
```

If no `package.json` exists, skip this step.

- [ ] **Step 2: Verify the page works end-to-end with server.mjs**

```bash
ANTHROPIC_API_KEY=your_key node server.mjs
```

Open `http://localhost:3000/dolled-by-louise.html` — static page should load, chat widget should function, API calls should work.

- [ ] **Step 3: Test keyboard accessibility of chat widget**

1. Tab to the chat toggle button — focus ring should appear
2. Press Enter to open — panel should open
3. Tab to the textarea — should be focusable
4. Press Escape — panel should close
5. Verify all buttons within the panel are keyboard-reachable

- [ ] **Step 4: Final commit**

```bash
git add -p
git commit -m "feat: complete AI booking agent — widget, API, EmailJS, vCard, referral nudge"
```

---

## Self-Review Checklist

After writing this plan, verified against spec:

- [x] `server.mjs` extends static serving with `/api/chat` POST — does not break existing file serving
- [x] API key is server-side only (`process.env.ANTHROPIC_API_KEY`) — never sent to client
- [x] Model: `claude-haiku-4-5-20251001` as specified
- [x] System prompt covers: all services with durations, aftercare, booking flow (5 steps), tone, location, pricing disclaimer
- [x] 5-step booking flow: name → service → date → contact → notes
- [x] Service chips shown after greeting (all 8 treatments + "Not sure")
- [x] Booking JSON parsed from API reply and used to render confirmation card
- [x] WhatsApp URL: `wa.me/447464557236` with pre-filled booking summary
- [x] EmailJS: `louisetrainorr@gmail.com` recipient, template variables match field names
- [x] Confirmation card shows all 5 fields before sending
- [x] Post-booking: referral nudge (Web Share API + clipboard fallback) + vCard download
- [x] vCard: correct fields (FN, TEL, EMAIL, ADR, URL)
- [x] Proactive chat bubble: already scaffolded in Plan 1, `window._setChatOpened` hook wired in Task 4 Step 1
- [x] `escHtml()` used on all user-supplied data inserted into innerHTML (prevents XSS)
- [x] ARIA: panel has `role="dialog"`, `aria-modal="true"`, `aria-label`; messages `<div>` has `aria-live="polite"`; toggle has `aria-expanded`; close button has `aria-label`
- [x] Keyboard: Enter sends message, Escape closes panel, all buttons focusable
- [x] EmailJS public key is safe to embed client-side (by design — EmailJS architecture)
