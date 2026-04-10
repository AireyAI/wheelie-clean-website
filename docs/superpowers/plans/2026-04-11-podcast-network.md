# Podcast Network Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Podcast Network view to ARTERIA where podcasters advertise their shows to attract guests, and potential guests advertise themselves — each card shows direct contact info, no backend needed.

**Architecture:** Single `arteria.html` file. New `data-view="podcast-network"` div added after the 404 view. `handleRoute()` extended to call `renderPodcastNetwork()`. Seed data hardcoded in JS; user-submitted listings saved to `localStorage` under `arteria_podcast_listings`. Post modal reuses `.booking-panel` / `.overlay` pattern.

**Tech Stack:** Vanilla JS, CSS custom properties, localStorage — no new dependencies.

---

## File Structure

- **Modify:** `arteria.html` — single file, all changes inline
  - CSS: new podcast-specific classes added before `</style>` (around line 1281)
  - HTML: new `data-view="podcast-network"` div added just before `</body>` close (after the 404 view)
  - HTML: nav link added in `.nav-links` (around line 1804)
  - HTML: mobile menu link added (around line 1650)
  - HTML: post listing modal added alongside other panels (after wizard panel)
  - JS: seed data constant `POD_SEEDS` added after `const LISTINGS`
  - JS: `KNOWN_VIEWS` array extended with `'podcast-network'`
  - JS: `handleRoute()` extended with podcast-network branch
  - JS: new functions `renderPodcastNetwork()`, `renderPodcastCards(tab)`, `openPodModal()`, `closePodModal()`, `podSwitchType(t)`, `submitPodListing()`, `podToggleNiche(el, n)` added before `window.addEventListener('hashchange', handleRoute)`

---

## Task 1: Add CSS for the Podcast Network view

**Files:**
- Modify: `arteria.html` — add CSS before `</style>` tag

- [ ] **Step 1: Locate the closing `</style>` tag**

  In `arteria.html`, find the line containing `</style>` (it's around line 1281 — the end of the massive inline style block). You'll insert new CSS immediately before it.

- [ ] **Step 2: Insert podcast CSS before `</style>`**

  Add the following block immediately before `</style>`:

  ```css
  /* PODCAST NETWORK */
  .pod-wrap{max-width:1200px;margin:0 auto;padding:5rem 2rem 4rem}
  .pod-hd{display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:1rem;margin-bottom:2rem}
  .pod-title{font-family:var(--fd);font-size:2rem;font-weight:800;letter-spacing:-.05em;color:var(--t1);margin-bottom:.25rem}
  .pod-sub{font-size:.9rem;color:var(--t2);line-height:1.6}
  .pod-tabs{display:flex;gap:6px;margin-bottom:2rem;border-bottom:1px solid var(--border);padding-bottom:0}
  .pod-tab{padding:10px 20px;font-family:var(--fb);font-size:.88rem;font-weight:600;color:var(--t2);background:none;border:none;border-bottom:2px solid transparent;cursor:pointer;transition:color .2s,border-color .2s;margin-bottom:-1px}
  .pod-tab.active{color:var(--amber);border-bottom-color:var(--amber)}
  .pod-tab:hover{color:var(--t1)}
  .pod-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:1.25rem}
  .pod-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);overflow:hidden;transition:border-color .2s,transform .2s}
  .pod-card:hover{border-color:var(--border2);transform:translateY(-2px)}
  .pod-card-img{width:100%;height:160px;object-fit:cover;display:block;background:var(--elevated)}
  .pod-card-body{padding:1rem 1.25rem 1.25rem}
  .pod-card-name{font-family:var(--fd);font-size:1rem;font-weight:700;letter-spacing:-.03em;color:var(--t1);margin-bottom:.2rem}
  .pod-card-meta{font-size:.78rem;color:var(--t3);margin-bottom:.6rem}
  .pod-tags{display:flex;flex-wrap:wrap;gap:.35rem;margin-bottom:.75rem}
  .pod-tag{background:var(--amber-dim);border:1px solid rgba(245,166,35,.25);color:var(--amber);border-radius:100px;padding:3px 10px;font-size:.7rem;font-weight:600}
  .pod-card-desc{font-size:.82rem;color:var(--t2);line-height:1.6;margin-bottom:1rem;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
  .pod-card-prev{font-size:.75rem;color:var(--t3);font-style:italic;margin-bottom:.75rem}
  .pod-contact-btn{display:block;width:100%;padding:10px;border-radius:var(--r-sm);background:var(--elevated);border:1px solid var(--border2);color:var(--t1);font-family:var(--fb);font-size:.83rem;font-weight:600;cursor:pointer;text-align:center;transition:background .2s,border-color .2s;text-decoration:none}
  .pod-contact-btn:hover{background:var(--floating);border-color:rgba(245,166,35,.4);color:var(--amber)}
  .pod-new-badge{display:inline-flex;align-items:center;gap:4px;background:rgba(245,166,35,.15);border:1px solid rgba(245,166,35,.3);color:var(--amber);border-radius:100px;padding:2px 8px;font-size:.65rem;font-weight:700;margin-left:6px;vertical-align:middle}
  .pod-new-dot{width:5px;height:5px;border-radius:50%;background:var(--amber)}
  /* Post modal niche pills */
  .pod-niche-pill{background:var(--elevated);border:1px solid var(--border);color:var(--t2);border-radius:100px;padding:5px 13px;font-size:.78rem;font-weight:600;cursor:pointer;transition:all .2s}
  .pod-niche-pill.sel{background:var(--amber-dim);border-color:rgba(245,166,35,.4);color:var(--amber)}
  .pod-mode-toggle{display:flex;background:var(--elevated);border:1px solid var(--border);border-radius:var(--r-sm);padding:4px;gap:4px;margin-bottom:1.25rem}
  .pod-mode-btn{flex:1;padding:9px;border-radius:6px;background:transparent;border:none;font-family:var(--fb);font-size:.85rem;font-weight:600;color:var(--t3);cursor:pointer;transition:all .2s}
  .pod-mode-btn.active{background:var(--floating);color:var(--t1)}
  ```

- [ ] **Step 3: Verify the CSS is valid**

  Open `http://localhost:3000/arteria.html` in a browser (or check the dev server is running with `node serve.mjs` from the project root). No red console errors relating to CSS.

- [ ] **Step 4: Commit**

  ```bash
  git add arteria.html
  git commit -m "feat: add podcast network CSS"
  ```

---

## Task 2: Add the nav links and the podcast-network view HTML

**Files:**
- Modify: `arteria.html` — nav links + new data-view div + post modal HTML

- [ ] **Step 1: Add the nav link in the desktop nav**

  Find this line in `.nav-links` (around line 1803):
  ```html
      <li><a id="nl-community" onclick="go('community')">Community</a></li>
  ```
  Add a new `<li>` immediately after it:
  ```html
      <li><a id="nl-podcast-network" onclick="go('podcast-network')">Podcast</a></li>
  ```

- [ ] **Step 2: Add the mobile menu link**

  Find the mobile menu section (around line 1648):
  ```html
    <a onclick="go('community');closeMenu()">Community</a>
  ```
  Add immediately after it:
  ```html
    <a onclick="go('podcast-network');closeMenu()">Podcast</a>
  ```

- [ ] **Step 3: Add the podcast-network view div**

  Find the closing of the 404 view (around line 2519):
  ```html
  </div><!-- /view:404 -->
  ```
  Add the new view immediately after it:
  ```html
  <!-- ══════════════════════════════════════════
       VIEW: PODCAST NETWORK
  ══════════════════════════════════════════ -->
  <div data-view="podcast-network" style="display:none">
    <div class="pod-wrap">
      <div class="pod-hd">
        <div>
          <h1 class="pod-title">🎙 Podcast Network</h1>
          <p class="pod-sub">Connect with podcasters and guests across the creative world</p>
        </div>
        <button class="btn-primary" onclick="openPodModal()">+ Post a listing</button>
      </div>
      <div class="pod-tabs">
        <button class="pod-tab active" id="pod-tab-host" onclick="podSwitchTab('host')">Find a Guest</button>
        <button class="pod-tab" id="pod-tab-guest" onclick="podSwitchTab('guest')">Be a Guest</button>
      </div>
      <div class="pod-grid" id="podGrid"></div>
    </div>
  </div><!-- /view:podcast-network -->
  ```

- [ ] **Step 4: Add the post listing modal HTML**

  Find the line containing `<!-- BOOKING OVERLAY + PANEL -->` (or similar panel section). Add the podcast modal right after the existing wizard overlay/panel block. Look for the closing of the wizard panel HTML — it ends with something like `</div><!-- /wizard -->`. Add immediately after:

  ```html
  <!-- PODCAST POST MODAL -->
  <div class="overlay" id="podOverlay" onclick="closePodModal()"></div>
  <div class="booking-panel" id="podPanel">
    <div class="booking-handle"></div>
    <div class="booking-header">
      <div>
        <div style="font-family:var(--fd);font-size:1.1rem;font-weight:800;letter-spacing:-.03em">Post a listing</div>
        <div style="font-size:.78rem;color:var(--t2);margin-top:2px">Find guests or get discovered as a guest</div>
      </div>
      <button class="modal-close" onclick="closePodModal()">✕</button>
    </div>
    <div class="booking-body">
      <div class="pod-mode-toggle">
        <button class="pod-mode-btn active" id="podModeHost" onclick="podSwitchType('host')">🎙 I'm a Host</button>
        <button class="pod-mode-btn" id="podModeGuest" onclick="podSwitchType('guest')">🎤 I'm a Guest</button>
      </div>
      <div id="podModalFields"></div>
      <button class="btn-primary" style="width:100%;padding:13px;margin-top:1rem" onclick="submitPodListing()">Post listing</button>
    </div>
  </div>
  ```

- [ ] **Step 5: Verify HTML renders without errors**

  Navigate to `http://localhost:3000/arteria.html` — check console for errors. The "Podcast" nav link should appear. Clicking it should show a blank view (grid not populated yet).

- [ ] **Step 6: Commit**

  ```bash
  git add arteria.html
  git commit -m "feat: add podcast network view HTML and nav link"
  ```

---

## Task 3: Add seed data and wire up `handleRoute`

**Files:**
- Modify: `arteria.html` — JS section

- [ ] **Step 1: Add `POD_SEEDS` constant**

  In the JS `<script>` block, find `const LISTINGS = [` (around line 2525). Add the following immediately before it:

  ```js
  // ── PODCAST NETWORK DATA ─────────────────────────────────────────
  const POD_SEEDS = [
    {id:'h1',type:'host',show:'The Creative Hour',host:'Marcus T.',loc:'London',niche:['Music','Culture'],episodes:142,desc:'Weekly deep-dives with musicians, producers, and visual artists about the business and craft of creativity.',contact:'instagram.com/thecreativehour',img:'600x400/131110/F5A623'},
    {id:'h2',type:'host',show:'Frequency',host:'Aisha M.',loc:'Berlin',niche:['Tech','Music'],episodes:67,desc:'Exploring the intersection of technology and sound design. Looking for producers, engineers, and innovators.',contact:'twitter.com/frequencypod',img:'600x400/100E1C/7C5CFC'},
    {id:'h3',type:'host',show:'Studio Sessions',host:'Pedro R.',loc:'Lisbon',niche:['Music','Business'],episodes:28,desc:'Conversations with independent artists about building a sustainable career without a label.',contact:'studiosessionspod@gmail.com',img:'600x400/0C1218/5CE8F5'},
    {id:'h4',type:'host',show:'Lens & Light',host:'Yuki S.',loc:'Paris',niche:['Culture','Other'],episodes:91,desc:'A photography and visual art podcast. Seeking photographers, directors, and visual storytellers.',contact:'instagram.com/lensandlightpod',img:'600x400/1A0F1A/FF9DE2'},
    {id:'g1',type:'guest',name:'Diane C.',loc:'Amsterdam',expertise:['Music','Business'],pitch:'Music manager with 10 years in the industry. Happy to talk A&R, sync licensing, or artist development.',appearances:'The Business of Music, Ep 12',contact:'instagram.com/dianec_music'},
    {id:'g2',type:'guest',name:'Olu A.',loc:'London',expertise:['Tech','Music'],pitch:'Audio software engineer and producer. Can speak on DAWs, plugin development, and electronic music production.',appearances:'',contact:'twitter.com/oluaudio'},
    {id:'g3',type:'guest',name:'Cleo B.',loc:'Barcelona',expertise:['Culture','Health'],pitch:'Dance artist and wellbeing coach. I talk about the mental health side of life as a performing artist.',appearances:'Move Well Podcast, Ep 5',contact:'cleobarnes.com'},
    {id:'g4',type:'guest',name:'James W.',loc:'Berlin',expertise:['Business','Other'],pitch:'Independent label founder. Three years running a Berlin-based electronic music label. Happy to talk DIY releasing.',appearances:'The Label Life, Ep 3 & Ep 19',contact:'instagram.com/jameswlabel'},
  ];
  ```

- [ ] **Step 2: Add `'podcast-network'` to `KNOWN_VIEWS`**

  Find (around line 4460):
  ```js
  const KNOWN_VIEWS=['home','explore','favourites','space','marketplace','profile','training','events','community','creator','inbox','pricing','404'];
  ```
  Add `'podcast-network'` to the array:
  ```js
  const KNOWN_VIEWS=['home','explore','favourites','space','marketplace','profile','training','events','community','creator','inbox','pricing','podcast-network','404'];
  ```

- [ ] **Step 3: Extend `handleRoute()` with the podcast-network branch**

  Find in `handleRoute()` (around line 2622):
  ```js
    if(view==='pricing'){/* static, no render needed */}
  ```
  Add immediately after it:
  ```js
    if(view==='podcast-network')renderPodcastNetwork();
  ```

- [ ] **Step 4: Extend the nav active-link loop**

  In `handleRoute()`, find:
  ```js
    ['home','explore','favourites','marketplace','profile','training','events','community','creator','inbox'].forEach(v=>{
  ```
  Add `'podcast-network'` to that array:
  ```js
    ['home','explore','favourites','marketplace','profile','training','events','community','creator','inbox','podcast-network'].forEach(v=>{
  ```
  Note: the nav link id is `nl-podcast-network` (using a hyphen), which matches the `id` attribute set in Task 2 Step 1.

- [ ] **Step 5: Verify**

  Navigate to `http://localhost:3000/arteria.html#podcast-network`. The page should show the header text and empty grid (no JS errors). The "Podcast" nav link should be highlighted amber.

- [ ] **Step 6: Commit**

  ```bash
  git add arteria.html
  git commit -m "feat: add podcast seed data and route handler"
  ```

---

## Task 4: Implement `renderPodcastNetwork` and `renderPodcastCards`

**Files:**
- Modify: `arteria.html` — JS section

- [ ] **Step 1: Add the render functions**

  Find the line `window.addEventListener('hashchange',handleRoute);` (around line 2633). Add the following block immediately before it:

  ```js
  // ── PODCAST NETWORK ──────────────────────────────────────────────
  let podTab='host'; // 'host' | 'guest'

  function getPodListings(){
    const stored=JSON.parse(localStorage.getItem('arteria_podcast_listings')||'[]');
    return [...stored,...POD_SEEDS];
  }

  function renderPodcastNetwork(){
    renderPodcastCards(podTab);
  }

  function podSwitchTab(tab){
    podTab=tab;
    document.getElementById('pod-tab-host').classList.toggle('active',tab==='host');
    document.getElementById('pod-tab-guest').classList.toggle('active',tab==='guest');
    renderPodcastCards(tab);
  }

  function renderPodcastCards(tab){
    const grid=document.getElementById('podGrid');
    if(!grid)return;
    const items=getPodListings().filter(p=>p.type===tab);
    if(!items.length){
      grid.innerHTML=`<div style="grid-column:1/-1;text-align:center;padding:4rem 0;color:var(--t3);font-size:.9rem">No listings yet — be the first to post!</div>`;
      return;
    }
    grid.innerHTML=items.map(p=>{
      const newBadge=p.isNew?`<span class="pod-new-badge"><span class="pod-new-dot"></span>New</span>`:'';
      if(p.type==='host'){
        const tags=p.niche.map(n=>`<span class="pod-tag">${n}</span>`).join('');
        const contactHref=p.contact.startsWith('http')?p.contact:'https://'+p.contact;
        return `<div class="pod-card">
          <img class="pod-card-img" src="https://placehold.co/${p.img}?text=🎙" alt="${p.show}">
          <div class="pod-card-body">
            <div class="pod-card-name">${p.show}${newBadge}</div>
            <div class="pod-card-meta">${p.host} · ${p.loc} · ${p.episodes} episodes</div>
            <div class="pod-tags">${tags}</div>
            <div class="pod-card-desc">${p.desc}</div>
            <a class="pod-contact-btn" href="${contactHref}" target="_blank" rel="noopener">Contact Host →</a>
          </div>
        </div>`;
      } else {
        const tags=p.expertise.map(n=>`<span class="pod-tag">${n}</span>`).join('');
        const contactHref=p.contact.startsWith('http')?p.contact:'https://'+p.contact;
        const prev=p.appearances?`<div class="pod-card-prev">Previously on: ${p.appearances}</div>`:'';
        return `<div class="pod-card">
          <div class="pod-card-body" style="padding-top:1.25rem">
            <div class="pod-card-name">${p.name}${newBadge}</div>
            <div class="pod-card-meta">${p.loc}</div>
            <div class="pod-tags">${tags}</div>
            <div class="pod-card-desc">${p.pitch}</div>
            ${prev}
            <a class="pod-contact-btn" href="${contactHref}" target="_blank" rel="noopener">Invite to Show →</a>
          </div>
        </div>`;
      }
    }).join('');
  }
  ```

- [ ] **Step 2: Verify**

  Navigate to `http://localhost:3000/arteria.html#podcast-network`. The grid should show 4 host cards with images, niche tags, descriptions, and "Contact Host →" buttons. Switch to "Be a Guest" tab — 4 guest cards appear.

- [ ] **Step 3: Commit**

  ```bash
  git add arteria.html
  git commit -m "feat: render podcast network host and guest cards"
  ```

---

## Task 5: Implement the Post Listing modal

**Files:**
- Modify: `arteria.html` — JS section

- [ ] **Step 1: Add modal open/close/type-switch functions**

  Immediately after the `renderPodcastCards` function (from Task 4), add:

  ```js
  let podModalType='host'; // 'host' | 'guest'
  const POD_NICHES=['Music','Tech','Culture','Comedy','Sport','Business','Health','Other'];
  let podSelectedNiches=[];

  function openPodModal(){
    podModalType='host';
    podSelectedNiches=[];
    document.getElementById('podModeHost').classList.add('active');
    document.getElementById('podModeGuest').classList.remove('active');
    renderPodModalFields();
    document.getElementById('podOverlay').classList.add('open');
    document.getElementById('podPanel').classList.add('open');
  }

  function closePodModal(){
    document.getElementById('podOverlay').classList.remove('open');
    document.getElementById('podPanel').classList.remove('open');
  }

  function podSwitchType(t){
    podModalType=t;
    podSelectedNiches=[];
    document.getElementById('podModeHost').classList.toggle('active',t==='host');
    document.getElementById('podModeGuest').classList.toggle('active',t==='guest');
    renderPodModalFields();
  }

  function podToggleNiche(el,n){
    if(podSelectedNiches.includes(n)){
      podSelectedNiches=podSelectedNiches.filter(x=>x!==n);
      el.classList.remove('sel');
    } else {
      podSelectedNiches.push(n);
      el.classList.add('sel');
    }
  }

  function renderPodModalFields(){
    const f=document.getElementById('podModalFields');
    const pills=POD_NICHES.map(n=>`<button type="button" class="pod-niche-pill" onclick="podToggleNiche(this,'${n}')">${n}</button>`).join('');
    if(podModalType==='host'){
      f.innerHTML=`
        <div class="field-group"><label>Show name *</label><input class="field-input" id="podShowName" placeholder="e.g. The Creative Hour"></div>
        <div class="field-group"><label>Niche *</label><div style="display:flex;flex-wrap:wrap;gap:.4rem;margin-top:.25rem">${pills}</div></div>
        <div class="field-group" style="margin-top:.75rem"><label>Episodes so far</label><input class="field-input" id="podEpisodes" type="number" min="0" placeholder="e.g. 24"></div>
        <div class="field-group"><label>Description *</label><textarea class="field-input" id="podDesc" rows="3" maxlength="200" placeholder="What's your show about? Who are you looking for?"></textarea></div>
        <div class="field-group"><label>Contact link *</label><input class="field-input" id="podContact" placeholder="instagram.com/yourshow or email"></div>
      `;
    } else {
      f.innerHTML=`
        <div class="field-group"><label>Your name *</label><input class="field-input" id="podGuestName" placeholder="e.g. Sarah J."></div>
        <div class="field-group"><label>Expertise *</label><div style="display:flex;flex-wrap:wrap;gap:.4rem;margin-top:.25rem">${pills}</div></div>
        <div class="field-group" style="margin-top:.75rem"><label>Your pitch *</label><textarea class="field-input" id="podPitch" rows="3" maxlength="200" placeholder="Why should a podcaster invite you on?"></textarea></div>
        <div class="field-group"><label>Previous appearances</label><input class="field-input" id="podAppearances" placeholder="e.g. The Creative Hour, Ep 12 (optional)"></div>
        <div class="field-group"><label>Contact link *</label><input class="field-input" id="podContact" placeholder="twitter.com/yourhandle or email"></div>
      `;
    }
  }
  ```

- [ ] **Step 2: Add `submitPodListing` function**

  Immediately after `renderPodModalFields`, add:

  ```js
  function submitPodListing(){
    const contact=(document.getElementById('podContact')||{}).value||'';
    if(!contact.trim()){document.getElementById('podContact').focus();return;}
    let listing;
    if(podModalType==='host'){
      const show=(document.getElementById('podShowName')||{}).value||'';
      const desc=(document.getElementById('podDesc')||{}).value||'';
      if(!show.trim()){document.getElementById('podShowName').focus();return;}
      if(!desc.trim()){document.getElementById('podDesc').focus();return;}
      if(!podSelectedNiches.length){showToast('Pick at least one niche');return;}
      listing={
        id:'u'+Date.now(),type:'host',show:show.trim(),
        host:JSON.parse(localStorage.getItem('arteria_profile')||'{}').name||'You',
        loc:'',niche:podSelectedNiches,
        episodes:parseInt((document.getElementById('podEpisodes')||{}).value||'0')||0,
        desc:desc.trim(),contact:contact.trim(),img:'600x400/131110/F5A623',isNew:true
      };
    } else {
      const name=(document.getElementById('podGuestName')||{}).value||'';
      const pitch=(document.getElementById('podPitch')||{}).value||'';
      if(!name.trim()){document.getElementById('podGuestName').focus();return;}
      if(!pitch.trim()){document.getElementById('podPitch').focus();return;}
      if(!podSelectedNiches.length){showToast('Pick at least one expertise area');return;}
      listing={
        id:'u'+Date.now(),type:'guest',name:name.trim(),loc:'',
        expertise:podSelectedNiches,pitch:pitch.trim(),
        appearances:(document.getElementById('podAppearances')||{}).value.trim()||'',
        contact:contact.trim(),isNew:true
      };
    }
    const stored=JSON.parse(localStorage.getItem('arteria_podcast_listings')||'[]');
    stored.unshift(listing);
    localStorage.setItem('arteria_podcast_listings',JSON.stringify(stored));
    closePodModal();
    podTab=podModalType;
    document.getElementById('pod-tab-host').classList.toggle('active',podTab==='host');
    document.getElementById('pod-tab-guest').classList.toggle('active',podTab==='guest');
    renderPodcastCards(podTab);
    showToast('Listing posted ✦');
  }
  ```

- [ ] **Step 3: Verify the modal works end-to-end**

  1. Navigate to `http://localhost:3000/arteria.html#podcast-network`
  2. Click "Post a listing" — panel slides up showing "I'm a Host" fields
  3. Click "I'm a Guest" — fields switch
  4. Fill in all required fields as a Host: show name, pick a niche pill, add description, add contact
  5. Click "Post listing" — panel closes, toast fires "Listing posted ✦", new card appears at top of "Find a Guest" tab with "New" badge
  6. Open DevTools → Application → localStorage — confirm `arteria_podcast_listings` has one entry

- [ ] **Step 4: Commit**

  ```bash
  git add arteria.html
  git commit -m "feat: podcast post listing modal with localStorage persistence"
  ```

---

## Task 6: Wire the "Podcast / Video" homepage category card to the network

**Files:**
- Modify: `arteria.html` — HTML section (homepage category cards)

- [ ] **Step 1: Find and update the Podcast Studio category card**

  Find (around line 1972):
  ```html
      <div class="cat-card" onclick="goExploreType('Podcast Studio')"><img src="https://placehold.co/400x540/131110/F5A623?text=🎙" alt="Podcast"><div class="cat-overlay"></div><div class="cat-content"><span class="cat-icon">🎙</span><div class="cat-name">Podcast Studios</div><div class="cat-count">420+ spaces</div><button class="cat-btn" onclick="event.stopPropagation();goExploreType('Podcast Studio')">See more</button></div></div>
  ```

  The space booking flow for Podcast Studios should remain unchanged — users clicking that card still go to studio listings. This card does not need to change.

  Instead, add a new "Podcast Network" entry to the footer's Explore link list. Find (around line 2099):
  ```html
        <li><a onclick="go('explore')">Podcast Studios</a></li>
  ```
  Change it to:
  ```html
        <li><a onclick="go('explore')">Podcast Studios</a></li><li><a onclick="go('podcast-network')">Podcast Network</a></li>
  ```

- [ ] **Step 2: Take a screenshot to verify the full view**

  ```bash
  node screenshot.mjs http://localhost:3000/arteria.html#podcast-network pod-final
  ```
  Read the screenshot from `temporary screenshots/` and confirm: header, amber "Post a listing" button, tab bar, 4 host cards visible with images and tags.

- [ ] **Step 3: Commit**

  ```bash
  git add arteria.html
  git commit -m "feat: add Podcast Network footer link"
  ```

---

## Task 7: Deploy to GitHub Pages

**Files:**
- `/tmp/arteria-deploy/index.html`

- [ ] **Step 1: Copy and push**

  ```bash
  cp /Users/kyleairey/Desktop/wheelie_clean_website/arteria.html /tmp/arteria-deploy/index.html
  cd /tmp/arteria-deploy
  git add index.html
  git commit -m "feat: podcast network — hosts, guests, post listing modal"
  git push origin main
  ```

- [ ] **Step 2: Verify**

  Wait ~60 seconds, then navigate to `https://aireyai.github.io/arteria/#podcast-network` and confirm the view loads correctly.

---

## Self-Review

**Spec coverage:**
- ✅ New `podcast-network` view with header + "Post a listing" CTA — Task 2
- ✅ Two tabs: "Find a Guest" / "Be a Guest" — Tasks 2 & 4
- ✅ Host cards: show name, host, location, episode count, niche tags, description, contact button — Task 4
- ✅ Guest cards: name, location, expertise tags, pitch, appearances, contact button — Task 4
- ✅ Post modal with host/guest mode toggle — Task 5
- ✅ Host fields: show name, niche pills, episode count, description, contact — Task 5
- ✅ Guest fields: name, expertise pills, pitch, appearances, contact — Task 5
- ✅ Saves to `arteria_podcast_listings` localStorage — Task 5
- ✅ New listings prepended with "New" badge — Task 5 (`isNew:true` + `pod-new-badge`)
- ✅ Seed data: 4 hosts, 4 guests — Task 3
- ✅ Nav link "Podcast" added to desktop nav and mobile menu — Task 2
- ✅ `KNOWN_VIEWS` extended — Task 3
- ✅ `handleRoute()` extended — Task 3
- ✅ Footer link — Task 6
- ✅ GitHub Pages deploy — Task 7

**Placeholder scan:** None found — all field names, IDs, and function names are explicit.

**Type consistency:** `podTab` / `podModalType` ('host'|'guest') consistent throughout. `getPodListings()` merges stored + seeds consistently. `POD_SEEDS` shape matches what `renderPodcastCards` reads.
