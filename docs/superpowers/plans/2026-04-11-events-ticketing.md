# Events Ticketing & Create Event Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the Events view with a fake ticket checkout panel (name, email, qty, price summary, confirm) and a "Create Event" panel for users to post their own events, both persisted to localStorage.

**Architecture:** Single `arteria.html` file. Two new slide-up panels (ticket checkout + create event) follow the existing `.booking-panel` / `.overlay` pattern. `renderEventsGrid` is updated to merge user-created events from `arteria_user_events` localStorage with the hardcoded `EVENTS_DATA` seed. Purchases saved to `arteria_tickets` localStorage. A ticket count badge appears on the Events nav link.

**Tech Stack:** Vanilla JS, CSS custom properties, localStorage — no new dependencies.

---

## File Structure

**Modify only:** `arteria.html`
- CSS block (~line 537): add ticket stepper, `ev-new-badge`, and event category pill styles before `</style>`
- HTML — Events view (~line 2399): update header, update event card button text/onclick in `renderEventsGrid`
- HTML — Events nav `<li>` (~line 1854): add ticket badge span
- HTML — after wizard/podcast panels: add ticket checkout panel HTML + create event panel HTML
- JS — `renderEventsGrid` (~line 5147): replace `EVENTS_DATA` references with `getEventsData()`
- JS — add `getEventsData()`, `openTicketPanel()`, `closeTicketPanel()`, `updateTicketQty()`, `updateTicketCTA()`, `confirmTicket()`, `updateEventsNavBadge()`, `openCreateEventModal()`, `closeCreateEventModal()`, `submitCreateEvent()` before `window.addEventListener('hashchange', handleRoute)`
- JS — Escape handler (~line 5024): add `closeTicketPanel()` and `closeCreateEventModal()`

---

## Task 1: Add CSS for ticket stepper, event badge, and category pills

**Files:**
- Modify: `arteria.html` — add CSS before `</style>`

- [ ] **Step 1: Find `</style>` closing tag**

  Search for `</style>` — it's the end of the big inline style block, currently around line 1347 (after podcast CSS was added). Insert new CSS immediately before it.

- [ ] **Step 2: Insert new CSS**

  Add the following block immediately before `</style>`:

  ```css
  /* EVENTS TICKETING */
  .tkt-stepper{display:flex;align-items:center;gap:.75rem;margin:1rem 0}
  .tkt-step-btn{width:34px;height:34px;border-radius:50%;background:var(--elevated);border:1px solid var(--border2);color:var(--t1);font-size:1.1rem;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s,border-color .2s}
  .tkt-step-btn:hover{background:var(--floating);border-color:rgba(245,166,35,.4)}
  .tkt-qty{font-family:var(--fd);font-size:1.25rem;font-weight:800;color:var(--t1);min-width:2rem;text-align:center}
  .tkt-label{font-size:.82rem;color:var(--t2)}
  .ev-new-badge{display:inline-flex;align-items:center;gap:4px;background:rgba(245,166,35,.15);border:1px solid rgba(245,166,35,.3);color:var(--amber);border-radius:100px;padding:2px 8px;font-size:.65rem;font-weight:700;margin-left:6px;vertical-align:middle}
  .ev-new-dot{width:5px;height:5px;border-radius:50%;background:var(--amber);display:inline-block}
  .ev-cat-pill{background:var(--elevated);border:1px solid var(--border);color:var(--t2);border-radius:100px;padding:5px 13px;font-size:.78rem;font-weight:600;cursor:pointer;transition:background .2s,border-color .2s,color .2s}
  .ev-cat-pill.sel{background:var(--amber-dim);border-color:rgba(245,166,35,.4);color:var(--amber)}
  .events-nav-badge{display:none;background:var(--amber);color:#07070A;font-size:.6rem;font-weight:800;border-radius:100px;padding:1px 6px;margin-left:4px;vertical-align:middle}
  .events-nav-badge.show{display:inline}
  ```

- [ ] **Step 3: Commit**

  ```bash
  git add arteria.html
  git commit -m "feat: add events ticketing CSS"
  ```

---

## Task 2: Add ticket badge to Events nav link and "Create Event" button to events header

**Files:**
- Modify: `arteria.html` — HTML section

- [ ] **Step 1: Add badge to Events nav `<li>`**

  Find (around line 1854):
  ```html
      <li><a id="nl-events" onclick="go('events')">Events</a></li>
  ```
  Replace with:
  ```html
      <li><a id="nl-events" onclick="go('events')">Events<span class="events-nav-badge" id="eventsNavBadge"></span></a></li>
  ```

- [ ] **Step 2: Add "Create Event" button to the events view header**

  Find the events view header (around line 2401):
  ```html
      <div class="section-hd" style="margin-bottom:1.5rem">
        <div>
          <h2 class="section-title">Events &amp; Unique Venues</h2>
          <p class="section-sub">Rooftops, farms, retreat houses, and extraordinary spaces for creative experiences</p>
        </div>
      </div>
  ```
  Replace with:
  ```html
      <div class="section-hd" style="margin-bottom:1.5rem">
        <div>
          <h2 class="section-title">Events &amp; Unique Venues</h2>
          <p class="section-sub">Rooftops, farms, retreat houses, and extraordinary spaces for creative experiences</p>
        </div>
        <button class="btn-primary" onclick="openCreateEventModal()">+ Create Event</button>
      </div>
  ```

- [ ] **Step 3: Add ticket checkout panel HTML**

  Find the podcast post modal HTML (search for `<!-- PODCAST POST MODAL -->`). Add immediately after the closing `</div>` of the podcast panel:

  ```html
  <!-- TICKET CHECKOUT PANEL -->
  <div class="overlay" id="tktOverlay" onclick="closeTicketPanel()"></div>
  <div class="booking-panel" id="tktPanel">
    <div class="booking-handle"></div>
    <div class="booking-header">
      <div>
        <div style="font-family:var(--fd);font-size:1.1rem;font-weight:800;letter-spacing:-.03em" id="tktEventTitle">Get Tickets</div>
        <div style="font-size:.78rem;color:var(--t2);margin-top:2px" id="tktEventMeta"></div>
      </div>
      <button class="modal-close" onclick="closeTicketPanel()">✕</button>
    </div>
    <div class="booking-body">
      <div class="tkt-stepper">
        <button class="tkt-step-btn" onclick="updateTicketQty(-1)">−</button>
        <span class="tkt-qty" id="tktQty">1</span>
        <button class="tkt-step-btn" onclick="updateTicketQty(1)">+</button>
        <span class="tkt-label">ticket(s)</span>
      </div>
      <div class="price-breakdown" id="tktBreakdown">
        <div class="price-row"><span id="tktLineLabel">Ticket × 1</span><span id="tktLineAmt">£0</span></div>
        <div class="price-row"><span>ARTERIA fee</span><span>£0</span></div>
        <div class="price-row total"><span>Total</span><span id="tktTotal">£0</span></div>
      </div>
      <div class="field-group">
        <label>Full name *</label>
        <input class="field-input" id="ticketName" placeholder="Your name">
      </div>
      <div class="field-group">
        <label>Email *</label>
        <input class="field-input" id="ticketEmail" type="email" placeholder="your@email.com">
      </div>
      <button class="btn-primary" style="width:100%;padding:13px;margin-top:1rem" id="tktCTA" onclick="confirmTicket()">Confirm & Pay</button>
    </div>
  </div>
  ```

- [ ] **Step 4: Add create event panel HTML**

  Immediately after the ticket panel closing `</div>`, add:

  ```html
  <!-- CREATE EVENT PANEL -->
  <div class="overlay" id="createEvOverlay" onclick="closeCreateEventModal()"></div>
  <div class="booking-panel" id="createEvPanel">
    <div class="booking-handle"></div>
    <div class="booking-header">
      <div>
        <div style="font-family:var(--fd);font-size:1.1rem;font-weight:800;letter-spacing:-.03em">Create an Event</div>
        <div style="font-size:.78rem;color:var(--t2);margin-top:2px">List your event on ARTERIA</div>
      </div>
      <button class="modal-close" onclick="closeCreateEventModal()">✕</button>
    </div>
    <div class="booking-body">
      <div class="field-group">
        <label>Event title *</label>
        <input class="field-input" id="evTitle" placeholder="e.g. Beat Making Intensive — Berlin">
      </div>
      <div class="field-group">
        <label>Category *</label>
        <div style="display:flex;flex-wrap:wrap;gap:.4rem;margin-top:.25rem" id="evCatPills">
          <button type="button" class="ev-cat-pill" onclick="selectEvCat(this,'workshop')">Workshop</button>
          <button type="button" class="ev-cat-pill" onclick="selectEvCat(this,'networking')">Networking</button>
          <button type="button" class="ev-cat-pill" onclick="selectEvCat(this,'showcase')">Showcase</button>
          <button type="button" class="ev-cat-pill" onclick="selectEvCat(this,'retreat')">Retreat</button>
        </div>
      </div>
      <div class="field-group">
        <label>Date *</label>
        <input class="field-input" id="evDate" type="date">
      </div>
      <div class="field-group">
        <label>Location *</label>
        <input class="field-input" id="evLoc" placeholder="e.g. Shoreditch, London">
      </div>
      <div class="field-group">
        <label>Description * <span id="evDescCount" style="font-weight:400;color:var(--t3)">0/200</span></label>
        <textarea class="field-input" id="evDesc" rows="3" maxlength="200" placeholder="What's this event about?" oninput="document.getElementById('evDescCount').textContent=this.value.length+'/200'"></textarea>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem">
        <div class="field-group">
          <label>Ticket price (£) *</label>
          <input class="field-input" id="evPrice" type="number" min="0" placeholder="0 = free">
        </div>
        <div class="field-group">
          <label>Capacity *</label>
          <input class="field-input" id="evCapacity" type="number" min="1" placeholder="e.g. 50">
        </div>
      </div>
      <button class="btn-primary" style="width:100%;padding:13px;margin-top:1rem" onclick="submitCreateEvent()">List Event ✦</button>
    </div>
  </div>
  ```

- [ ] **Step 5: Commit**

  ```bash
  git add arteria.html
  git commit -m "feat: add events nav badge, Create Event button, and panel HTML"
  ```

---

## Task 3: Update `renderEventsGrid` to merge user events + seed data

**Files:**
- Modify: `arteria.html` — JS section

- [ ] **Step 1: Add `getEventsData()` helper**

  Find `// ── EVENTS DATA ───` (around line 5130). Add the following immediately BEFORE that comment:

  ```js
  // ── EVENTS HELPERS ───────────────────────────────────────────────────
  function getEventsData(){
    const stored=JSON.parse(localStorage.getItem('arteria_user_events')||'[]');
    return [...stored,...EVENTS_DATA];
  }
  function updateEventsNavBadge(){
    const tickets=JSON.parse(localStorage.getItem('arteria_tickets')||'[]');
    const badge=document.getElementById('eventsNavBadge');
    if(!badge)return;
    if(tickets.length>0){badge.textContent=tickets.length;badge.classList.add('show');}
    else{badge.textContent='';badge.classList.remove('show');}
  }
  ```

- [ ] **Step 2: Replace `EVENTS_DATA` references in `renderEventsGrid`**

  Find `renderEventsGrid` (around line 5147). It currently has:
  ```js
  function renderEventsGrid(cat='all'){
    evFilter=cat;
    const el=document.getElementById('eventsGrid');
    if(!el)return;
    const list=cat==='all'?EVENTS_DATA:EVENTS_DATA.filter(e=>e.cat===cat);
  ```
  Replace those last two lines with:
  ```js
  function renderEventsGrid(cat='all'){
    evFilter=cat;
    const el=document.getElementById('eventsGrid');
    if(!el)return;
    const list=cat==='all'?getEventsData():getEventsData().filter(e=>e.cat===cat);
  ```

- [ ] **Step 3: Replace the card `onclick` and "Join" button with "Get Tickets" button**

  Inside `renderEventsGrid`, find the template literal that returns the card HTML. It currently starts with:
  ```js
    return`<div class="ev-card" onclick="toast('Booking for \\'${ev.title}\\' — coming soon!','🎪')">
  ```
  And contains:
  ```js
          <button class="btn-enroll" onclick="event.stopPropagation();toast('Interest registered!','✓')">Join</button>
  ```

  Replace the entire `return` template literal (from the backtick after `return` to the closing backtick) with:

  ```js
    const newBadge=ev.isNew?`<span class="ev-new-badge"><span class="ev-new-dot"></span>New</span>`:'';
    const btnLabel=ev.price===0?'Reserve Free Spot':'Get Tickets →';
    return`<div class="ev-card">
      <div class="ev-img"><img src="https://picsum.photos/seed/${ev.img}/600/380" alt="${ev.title}" loading="lazy">
        <div class="ev-date-badge"><span class="ev-date-day">${ev.day}</span><span class="ev-date-mon">${ev.mon}</span></div>
        <span class="ev-type" style="background:${typeColor}18;color:${typeColor};border:1px solid ${typeColor}40;position:absolute;top:10px;right:10px;font-size:.68rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;padding:3px 8px;border-radius:5px">${ev.type}</span>
      </div>
      <div style="padding:1rem 1.25rem 1.25rem">
        <div style="font-family:var(--fd);font-size:1rem;font-weight:800;letter-spacing:-.02em;color:var(--t1);margin-bottom:.3rem">${ev.title}${newBadge}</div>
        <div style="font-size:.77rem;color:var(--t3);margin-bottom:.75rem">📍 ${ev.loc}</div>
        <div style="font-size:.78rem;color:var(--t2);line-height:1.55;margin-bottom:1rem">${ev.desc}</div>
        <div style="display:flex;align-items:center;justify-content:space-between">
          <div style="font-family:var(--fd);font-weight:800;font-size:1.05rem;color:var(--t1)">${priceStr}<span style="font-size:.75rem;font-weight:400;color:var(--t3);margin-left:3px">${ev.price===0?'entry':'per person'}</span></div>
          <button class="btn-enroll" onclick="openTicketPanel(${ev.id},'${ev.title.replace(/'/g,"\\'")}',${'ev.price'},${ev.capacity},'${ev.date}','${ev.loc}')">${btnLabel}</button>
        </div>
      </div>
    </div>`;
  ```

  **Important:** The `onclick` for `openTicketPanel` uses template literal interpolation — the values of `ev.id`, `ev.price`, `ev.capacity`, `ev.date`, `ev.loc`, and the escaped `ev.title` are all injected at render time. Double-check the escaping compiles without syntax errors.

  Actually, to avoid escaping nightmares, use this safer pattern instead — store event data in a JS map and look up by id:

  Replace the full card template with:

  ```js
    const newBadge=ev.isNew?`<span class="ev-new-badge"><span class="ev-new-dot"></span>New</span>`:'';
    const btnLabel=ev.price===0?'Reserve Free Spot':'Get Tickets →';
    return`<div class="ev-card">
      <div class="ev-img"><img src="https://picsum.photos/seed/${ev.img}/600/380" alt="${ev.title}" loading="lazy">
        <div class="ev-date-badge"><span class="ev-date-day">${ev.day}</span><span class="ev-date-mon">${ev.mon}</span></div>
        <span class="ev-type" style="background:${typeColor}18;color:${typeColor};border:1px solid ${typeColor}40;position:absolute;top:10px;right:10px;font-size:.68rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;padding:3px 8px;border-radius:5px">${ev.type}</span>
      </div>
      <div style="padding:1rem 1.25rem 1.25rem">
        <div style="font-family:var(--fd);font-size:1rem;font-weight:800;letter-spacing:-.02em;color:var(--t1);margin-bottom:.3rem">${ev.title}${newBadge}</div>
        <div style="font-size:.77rem;color:var(--t3);margin-bottom:.75rem">📍 ${ev.loc}</div>
        <div style="font-size:.78rem;color:var(--t2);line-height:1.55;margin-bottom:1rem">${ev.desc}</div>
        <div style="display:flex;align-items:center;justify-content:space-between">
          <div style="font-family:var(--fd);font-weight:800;font-size:1.05rem;color:var(--t1)">${priceStr}<span style="font-size:.75rem;font-weight:400;color:var(--t3);margin-left:3px">${ev.price===0?'entry':'per person'}</span></div>
          <button class="btn-enroll" data-evid="${ev.id}" onclick="openTicketPanelById(this.dataset.evid)">${btnLabel}</button>
        </div>
      </div>
    </div>`;
  ```

  Note: we use `data-evid` + `openTicketPanelById(id)` instead of inline args to avoid escaping issues.

- [ ] **Step 4: Call `updateEventsNavBadge()` when events view loads**

  Find in `handleRoute()`:
  ```js
    if(view==='events')renderEventsGrid('all');
  ```
  Replace with:
  ```js
    if(view==='events'){renderEventsGrid('all');updateEventsNavBadge();}
  ```

- [ ] **Step 5: Commit**

  ```bash
  git add arteria.html
  git commit -m "feat: merge user events with seed data, update event card buttons"
  ```

---

## Task 4: Implement ticket checkout JS functions

**Files:**
- Modify: `arteria.html` — JS section

- [ ] **Step 1: Add module-level state and ticket functions**

  Find `window.addEventListener('hashchange',handleRoute);`. Add the following block immediately BEFORE it:

  ```js
  // ── TICKET CHECKOUT ──────────────────────────────────────────────
  let tktEvent=null; // current event object
  let tktQty=1;

  function openTicketPanelById(id){
    const ev=getEventsData().find(e=>String(e.id)===String(id));
    if(!ev)return;
    tktEvent=ev;
    tktQty=1;
    document.getElementById('tktEventTitle').textContent=ev.title;
    document.getElementById('tktEventMeta').textContent=ev.day+' '+ev.mon+' · '+ev.loc;
    document.getElementById('tktQty').textContent='1';
    updateTicketCTA();
    document.getElementById('ticketName').value='';
    document.getElementById('ticketEmail').value='';
    document.getElementById('tktOverlay').classList.add('open');
    document.getElementById('tktPanel').classList.add('open');
  }

  function closeTicketPanel(){
    document.getElementById('tktOverlay').classList.remove('open');
    document.getElementById('tktPanel').classList.remove('open');
  }

  function updateTicketQty(delta){
    if(!tktEvent)return;
    tktQty=Math.max(1,Math.min(10,tktQty+delta));
    document.getElementById('tktQty').textContent=tktQty;
    updateTicketCTA();
  }

  function updateTicketCTA(){
    if(!tktEvent)return;
    const price=tktEvent.price||0;
    const total=price*tktQty;
    const isFree=price===0;
    document.getElementById('tktLineLabel').textContent='Ticket × '+tktQty;
    document.getElementById('tktLineAmt').textContent=isFree?'Free':fmtPrice(price*tktQty/tktQty)+' each';
    document.getElementById('tktTotal').textContent=isFree?'Free':fmtPrice(total);
    document.getElementById('tktCTA').textContent=isFree?'Confirm Reservation':'Confirm & Pay '+fmtPrice(total);
  }

  function confirmTicket(){
    const name=document.getElementById('ticketName').value.trim();
    const email=document.getElementById('ticketEmail').value.trim();
    if(!name){document.getElementById('ticketName').focus();return;}
    if(!email||!email.includes('@')){document.getElementById('ticketEmail').focus();return;}
    if(!tktEvent)return;
    const ticket={
      eventId:tktEvent.id,
      eventTitle:tktEvent.title,
      name,email,
      qty:tktQty,
      total:(tktEvent.price||0)*tktQty,
      purchasedAt:new Date().toISOString()
    };
    const stored=JSON.parse(localStorage.getItem('arteria_tickets')||'[]');
    stored.push(ticket);
    localStorage.setItem('arteria_tickets',JSON.stringify(stored));
    closeTicketPanel();
    updateEventsNavBadge();
    toast('You\'re going! 🎟 Check your email for details ✦','🎟');
  }
  ```

- [ ] **Step 2: Add `closeTicketPanel` and `closeCreateEventModal` to the Escape handler**

  Find (around line 5024):
  ```js
    if(e.key==='Escape'){closeLb();closeWn();closeBooking();closeLogin();closeAddListing();closeReview();closeKbd();closeVt();closeWishlist();closePodModal();return}
  ```
  Replace with:
  ```js
    if(e.key==='Escape'){closeLb();closeWn();closeBooking();closeLogin();closeAddListing();closeReview();closeKbd();closeVt();closeWishlist();closePodModal();closeTicketPanel();closeCreateEventModal();return}
  ```

- [ ] **Step 3: Verify in browser**

  Navigate to `http://localhost:3000/arteria.html#events`. Click "Get Tickets →" on any paid event — panel should slide up showing the event title, stepper starting at 1, price breakdown, name/email fields, and "Confirm & Pay £X" CTA. Press − and + to adjust qty — total and CTA should update. Fill in name and email, click confirm — toast fires, panel closes.

  Navigate to a free event — button should say "Reserve Free Spot", panel CTA should say "Confirm Reservation" with "Free" totals.

- [ ] **Step 4: Commit**

  ```bash
  git add arteria.html
  git commit -m "feat: ticket checkout panel JS with localStorage persistence"
  ```

---

## Task 5: Implement Create Event JS functions

**Files:**
- Modify: `arteria.html` — JS section

- [ ] **Step 1: Add create event state and functions**

  Immediately after the `confirmTicket` function (from Task 4), add:

  ```js
  // ── CREATE EVENT ─────────────────────────────────────────────────
  let evSelectedCat='';

  function openCreateEventModal(){
    evSelectedCat='';
    document.querySelectorAll('.ev-cat-pill').forEach(p=>p.classList.remove('sel'));
    ['evTitle','evLoc','evDesc'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
    ['evPrice','evCapacity'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
    const d=document.getElementById('evDate');if(d)d.value='';
    document.getElementById('evDescCount').textContent='0/200';
    document.getElementById('createEvOverlay').classList.add('open');
    document.getElementById('createEvPanel').classList.add('open');
  }

  function closeCreateEventModal(){
    document.getElementById('createEvOverlay').classList.remove('open');
    document.getElementById('createEvPanel').classList.remove('open');
  }

  function selectEvCat(el,cat){
    evSelectedCat=cat;
    document.querySelectorAll('.ev-cat-pill').forEach(p=>p.classList.remove('sel'));
    el.classList.add('sel');
  }

  function submitCreateEvent(){
    const title=(document.getElementById('evTitle')||{}).value||'';
    const dateVal=(document.getElementById('evDate')||{}).value||'';
    const loc=(document.getElementById('evLoc')||{}).value||'';
    const desc=(document.getElementById('evDesc')||{}).value||'';
    const priceVal=(document.getElementById('evPrice')||{}).value;
    const capVal=(document.getElementById('evCapacity')||{}).value;
    if(!title.trim()){document.getElementById('evTitle').focus();return;}
    if(!evSelectedCat){toast('Pick a category','⚠');return;}
    if(!dateVal){document.getElementById('evDate').focus();return;}
    if(!loc.trim()){document.getElementById('evLoc').focus();return;}
    if(!desc.trim()){document.getElementById('evDesc').focus();return;}
    if(priceVal===''||priceVal===null){document.getElementById('evPrice').focus();return;}
    if(!capVal||parseInt(capVal)<1){document.getElementById('evCapacity').focus();return;}
    const d=new Date(dateVal);
    const MONTHS=['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
    const day=String(d.getUTCDate()).padStart(2,'0');
    const mon=MONTHS[d.getUTCMonth()];
    const ev={
      id:'u'+Date.now(),
      cat:evSelectedCat,
      title:title.trim(),
      loc:loc.trim(),
      date:dateVal,
      day,mon,
      price:parseFloat(priceVal)||0,
      capacity:parseInt(capVal),
      img:'arteria-user-'+Date.now()%100,
      type:evSelectedCat,
      desc:desc.trim(),
      isNew:true
    };
    const stored=JSON.parse(localStorage.getItem('arteria_user_events')||'[]');
    stored.unshift(ev);
    localStorage.setItem('arteria_user_events',JSON.stringify(stored));
    closeCreateEventModal();
    renderEventsGrid(evFilter);
    toast('Event listed! ✦','🎪');
  }
  ```

- [ ] **Step 2: Verify create event flow in browser**

  Navigate to `http://localhost:3000/arteria.html#events`. Click "+ Create Event" — panel slides up. Fill in all fields, pick a category pill, click "List Event ✦" — toast fires, panel closes, new event appears at top of grid with amber "New" badge and your filled-in details.

  Leave title blank, click submit — focus jumps to title field. Leave category unselected — toast fires "Pick a category".

- [ ] **Step 3: Commit**

  ```bash
  git add arteria.html
  git commit -m "feat: create event panel JS with localStorage persistence"
  ```

---

## Task 6: Deploy to GitHub Pages

**Files:**
- `/tmp/arteria-deploy/index.html`

- [ ] **Step 1: Copy and push**

  ```bash
  cp /Users/kyleairey/Desktop/wheelie_clean_website/arteria.html /tmp/arteria-deploy/index.html
  cd /tmp/arteria-deploy
  git add index.html
  git commit -m "feat: events ticketing and create event"
  git push origin main
  ```

- [ ] **Step 2: Confirm push succeeded**

  Expected output ends with: `main -> main`

---

## Self-Review

**Spec coverage:**
- ✅ "Get Tickets →" button on paid events — Task 3
- ✅ "Reserve Free Spot" on free events — Task 3
- ✅ Ticket checkout panel: event title, meta, qty stepper, price breakdown, name, email, CTA — Task 2 (HTML) + Task 4 (JS)
- ✅ CTA text updates with qty — Task 4 (`updateTicketCTA`)
- ✅ Free events show "Confirm Reservation" / "Free" totals — Task 4
- ✅ On confirm: saves to `arteria_tickets`, closes panel, fires toast — Task 4
- ✅ Events nav badge shows ticket count, hidden when 0 — Task 2 (HTML) + Task 3 + Task 4
- ✅ "Create Event" button in events header — Task 2
- ✅ Create event panel: title, category pills, date, location, description (200 char counter), price, capacity — Task 2 (HTML)
- ✅ On submit: validates all fields, derives day/mon from date, saves to `arteria_user_events`, re-renders grid, fires toast — Task 5
- ✅ New events show "New" amber badge — Task 3 (`ev.isNew` + `.ev-new-badge`)
- ✅ `renderEventsGrid` uses `getEventsData()` merging user + seed — Task 3
- ✅ Escape key closes both panels — Task 4
- ✅ Deploy — Task 6

**Placeholder scan:** None — all field IDs, function names, localStorage keys, and CSS classes are explicit.

**Type consistency:** `tktEvent` is set in `openTicketPanelById` and read in `updateTicketQty`, `updateTicketCTA`, `confirmTicket` — consistent. `evSelectedCat` set in `selectEvCat`, read in `submitCreateEvent` — consistent. `getEventsData()` used in `renderEventsGrid` and `openTicketPanelById` — consistent. `evFilter` (existing variable) reused in `submitCreateEvent` to re-render correct filter — consistent with existing `filterEvents` pattern.
