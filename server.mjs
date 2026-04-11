import http             from 'http';
import fs               from 'fs';
import path             from 'path';
import { fileURLToPath } from 'url';
import Anthropic        from '@anthropic-ai/sdk';

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
When the visitor wants to book, collect these 5 things one at a time (do NOT ask more than one question per message):
1. Their name
2. Which service (offer chips: Korean Lash Lift, LVL, Lash Tint, Classic, Hybrid, Russian Volume, Mega Volume, or "Not sure — help me choose!")
3. Preferred date or day of week
4. Contact: phone number or email address
5. Any notes (allergies, first time, special requests) — this one is optional, they can say "none"

After collecting all 5, output a JSON block at the END of your message (after a blank line) in this exact format — nothing else after it:
{"booking":{"name":"...","service":"...","date":"...","contact":"...","notes":"...","ready":true}}

## Tone
Warm, friendly, knowledgeable. Short replies — 2–3 sentences max unless explaining a complex question. Always offer to book after answering a question. Use occasional 💕 emoji but don't overdo it.

## What you don't know
Exact prices are not set yet — tell visitors to contact Louise directly for current rates.
Louise's Instagram is coming soon.
The website URL will be dolledbylouise.co.uk when live.

## Location
33 Albert Street, Longtown, CA6 5SF. Short drive from Carlisle, near the Scottish borders.
Phone: +44 7464 557236
Email: louisetrainorr@gmail.com`;

// ── In-memory session store ───────────────────────────────────────────────────
const sessions = new Map();
const leads    = [];
const bookings = [];

// ── Rate limiter ──────────────────────────────────────────────────────────────
const rates = new Map();
function checkRate(ip) {
  const now = Date.now(), win = 60_000, lim = 40;
  let r = rates.get(ip) || { n: 0, reset: now + win };
  if (now > r.reset) r = { n: 0, reset: now + win };
  if (r.n >= lim) return false;
  r.n++; rates.set(ip, r); return true;
}

// ── JSON body reader ──────────────────────────────────────────────────────────
function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; if (body.length > 50_000) req.destroy(); });
    req.on('end',  () => { try { resolve(JSON.parse(body)); } catch { reject(new Error('Bad JSON')); } });
    req.on('error', reject);
  });
}

// ── /api/chat  (standard — returns full Anthropic response object) ─────────────
async function handleChat(req, res) {
  if (!checkRate(req.socket.remoteAddress)) {
    res.writeHead(429, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Too many requests' }));
    return;
  }
  try {
    const { messages, model, max_tokens } = await readBody(req);
    if (!Array.isArray(messages)) throw new Error('messages must be an array');

    const response = await client.messages.create({
      model:      model || 'claude-haiku-4-5-20251001',
      max_tokens: max_tokens || 512,
      system:     SYSTEM_PROMPT,   // always use Louise's prompt, ignore client-supplied system
      messages:   messages.slice(-20),
    });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(response));   // chatbot.js reads data.content[0].text
  } catch (err) {
    console.error('Chat error:', err.message);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Something went wrong. Please try again.' }));
  }
}

// ── /api/chat/stream  (SSE streaming) ────────────────────────────────────────
async function handleChatStream(req, res) {
  res.writeHead(200, {
    'Content-Type':  'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection':    'keep-alive',
  });
  const sse = d => res.write(`data: ${typeof d === 'string' ? d : JSON.stringify(d)}\n\n`);

  if (!checkRate(req.socket.remoteAddress)) { sse({ error: 'Rate limited' }); return res.end(); }

  try {
    const { messages, model, max_tokens } = await readBody(req);
    if (!Array.isArray(messages)) { sse({ error: 'Invalid messages' }); return res.end(); }

    const stream = client.messages.stream({
      model:      model || 'claude-haiku-4-5-20251001',
      max_tokens: max_tokens || 512,
      system:     SYSTEM_PROMPT,
      messages:   messages.slice(-20),
    });

    stream.on('text',         t  => sse({ text: t }));
    stream.on('finalMessage', () => { sse('[DONE]'); res.end(); });
    stream.on('error',        () => { sse({ error: 'Stream error' }); res.end(); });
    req.on('close', () => stream.controller?.abort());
  } catch (err) {
    console.error('Stream error:', err.message);
    sse({ error: 'Something went wrong.' }); res.end();
  }
}

// ── /api/session  (lightweight session persistence) ───────────────────────────
async function handleSession(req, res) {
  try {
    const body = await readBody(req);
    if (body.sessionId) {
      sessions.set(body.sessionId, { ...sessions.get(body.sessionId), ...body, lastActivity: new Date() });
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
  } catch {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Bad request' }));
  }
}

// ── /api/lead  (capture email leads) ──────────────────────────────────────────
async function handleLead(req, res) {
  try {
    const body = await readBody(req);
    leads.push({ ...body, ts: new Date() });
    console.log(`📧 Lead captured: ${body.email || body.name || '(unknown)'}`);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
  } catch {
    res.writeHead(400); res.end('{}');
  }
}

// ── /api/booking  (capture booking requests) ──────────────────────────────────
async function handleBooking(req, res) {
  try {
    const body = await readBody(req);
    bookings.push({ ...body, ts: new Date() });
    console.log(`📅 Booking: ${body.name} → ${body.service || body.datetime}`);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
  } catch {
    res.writeHead(400); res.end('{}');
  }
}

// ── HTTP server ───────────────────────────────────────────────────────────────
http.createServer((req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  const url = req.url.split('?')[0];

  if (req.method === 'POST') {
    if (url === '/api/chat')         { handleChat(req, res); return; }
    if (url === '/api/chat/stream')  { handleChatStream(req, res); return; }
    if (url === '/api/session')      { handleSession(req, res); return; }
    if (url === '/api/lead')         { handleLead(req, res); return; }
    if (url === '/api/booking')      { handleBooking(req, res); return; }
  }

  // Static file serving
  let urlPath = url === '/' ? '/index.html' : url;
  urlPath = decodeURIComponent(urlPath);
  const filePath = path.join(__dirname, urlPath);
  const ext      = path.extname(filePath).toLowerCase();

  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(PORT, () => {
  console.log(`Dolled by Louise dev server → http://localhost:${PORT}`);
});
