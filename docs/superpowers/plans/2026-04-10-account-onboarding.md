# Account Onboarding Wizard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the post-signup success screen with a 4-step onboarding wizard (slide-up panel) that collects account type, profile details, disciplines/business type, and location, then stores to localStorage.

**Architecture:** All changes are in `arteria.html`. New CSS is injected into the existing `<style>` block. A new `<div id="wizardPanel">` is added alongside the existing booking/login panels. A self-contained `wizard` JS object manages step state, and `handleAuth()` is modified to launch the wizard on signup.

**Tech Stack:** Vanilla JS, CSS custom properties, localStorage — no new dependencies.

---

## File Map

- **Modify:** `arteria.html`
  - `<style>` block (~line 14): add wizard CSS (pill toggles, avatar preview, wizard panel)
  - After `<!-- LOGIN OVERLAY + PANEL -->` (~line 1620): add wizard panel HTML
  - `handleAuth()` (~line 3084): replace success screen with `openWizard()`
  - After `closeLogin()` (~line 3066): add all wizard JS

---

## Task 1: Add Wizard CSS

**Files:**
- Modify: `arteria.html` — inside `<style>` block, before the closing `</style>` tag

- [ ] **Step 1: Add the CSS**

Find the closing `</style>` tag (it's just before `</head>`) and insert this block immediately before it:

```css
/* ONBOARDING WIZARD */
.wizard-panel{position:fixed;bottom:0;left:0;right:0;max-height:92vh;background:var(--surface);border-top:1px solid var(--border2);border-radius:var(--r-xl) var(--r-xl) 0 0;z-index:420;transform:translateY(100%);transition:transform .38s cubic-bezier(.16,1,.3,1);overflow-y:auto}
.wizard-panel.open{transform:translateY(0)}
.wizard-body{padding:1.5rem;max-width:520px;margin:0 auto}
.wizard-progress{display:flex;gap:5px;margin-bottom:.5rem}
.wp-seg{flex:1;height:3px;border-radius:2px;background:var(--border2);transition:background .3s}
.wp-seg.done{background:var(--amber)}
.wizard-step-lbl{font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--t3);margin-bottom:.6rem}
.wizard-h{font-family:var(--fd);font-size:1.3rem;font-weight:800;letter-spacing:-.04em;color:var(--t1);margin-bottom:.3rem}
.wizard-sub{font-size:.85rem;color:var(--t2);margin-bottom:1.5rem;line-height:1.6}
.wiz-type-grid{display:grid;grid-template-columns:1fr 1fr;gap:.75rem;margin-bottom:1.25rem}
.wiz-type-tile{background:var(--elevated);border:2px solid var(--border);border-radius:var(--r-md);padding:1.25rem 1rem;text-align:center;cursor:pointer;transition:all .2s}
.wiz-type-tile:hover{border-color:var(--border2)}
.wiz-type-tile.sel{border-color:var(--amber);background:var(--amber-dim)}
.wiz-type-icon{font-size:1.75rem;display:block;margin-bottom:.5rem}
.wiz-type-name{font-family:var(--fd);font-weight:800;font-size:.95rem;color:var(--t1);margin-bottom:3px}
.wiz-type-sub{font-size:.7rem;color:var(--t3);line-height:1.4}
.wiz-avatar-row{display:flex;align-items:center;gap:1rem;margin-bottom:1.1rem}
.wiz-avatar{width:64px;height:64px;border-radius:50%;background:var(--elevated);border:2px dashed rgba(245,166,35,.4);display:flex;align-items:center;justify-content:center;font-size:1.3rem;cursor:pointer;overflow:hidden;flex-shrink:0;transition:border-color .2s}
.wiz-avatar:hover{border-color:var(--amber)}
.wiz-avatar img{width:100%;height:100%;object-fit:cover;display:block}
.wiz-bio-wrap{position:relative;margin-bottom:1rem}
.wiz-bio-count{position:absolute;bottom:8px;right:10px;font-size:.68rem;color:var(--t3)}
.wiz-pills{display:flex;flex-wrap:wrap;gap:.45rem;margin-bottom:1.25rem}
.wiz-pill{padding:7px 14px;border-radius:100px;background:var(--elevated);border:1.5px solid var(--border);color:var(--t2);font-family:var(--fb);font-size:.82rem;font-weight:500;cursor:pointer;transition:all .2s;user-select:none}
.wiz-pill:hover{border-color:var(--border2);color:var(--t1)}
.wiz-pill.sel{background:var(--amber-dim);border-color:rgba(245,166,35,.5);color:var(--amber);font-weight:700}
.wiz-nav{display:flex;gap:.75rem;align-items:center;margin-top:1.5rem}
.wiz-back{background:transparent;border:1px solid var(--border2);color:var(--t2);padding:12px 20px;border-radius:var(--r-sm);font-family:var(--fb);font-size:.88rem;font-weight:600;cursor:pointer;transition:all .2s}
.wiz-back:hover{background:var(--elevated);color:var(--t1)}
.wiz-continue{flex:1;background:var(--amber);color:#07070A;border:none;padding:13px;border-radius:var(--r-sm);font-family:var(--fd);font-size:.95rem;font-weight:800;cursor:pointer;transition:all .2s;letter-spacing:-.02em}
.wiz-continue:hover{background:var(--amber-h);box-shadow:var(--shadow-amber)}
.wiz-continue:disabled{opacity:.35;cursor:not-allowed}
.wiz-skip{font-size:.8rem;color:var(--t3);cursor:pointer;text-align:center;margin-top:.75rem;transition:color .2s}
.wiz-skip:hover{color:var(--t2)}
```

- [ ] **Step 2: Verify**

Open `http://localhost:3000/arteria.html` in a browser. No visual change expected yet — just confirm the page still loads with no console errors.

- [ ] **Step 3: Commit**

```bash
cd /Users/kyleairey/Desktop/wheelie_clean_website
git add arteria.html
git commit -m "feat: add onboarding wizard CSS"
```

---

## Task 2: Add Wizard Panel HTML

**Files:**
- Modify: `arteria.html` — add wizard panel HTML after the login panel closing tag

- [ ] **Step 1: Find the insertion point**

Locate this comment in arteria.html (around line 1659):
```html
<!-- BOOKING OVERLAY + PANEL -->
```

Insert the following block immediately before it:

```html
<!-- ONBOARDING WIZARD PANEL -->
<div class="overlay" id="wizardOverlay" onclick="closeWizard()"></div>
<div class="wizard-panel" id="wizardPanel">
  <div class="booking-handle"></div>
  <div class="wizard-body">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.25rem">
      <span style="font-family:var(--fd);font-weight:800;font-size:1rem;letter-spacing:-.04em;color:var(--t1)">ARTERIA<span class="logo-dot" style="margin-left:3px"></span></span>
      <button class="modal-close" onclick="closeWizard()">✕</button>
    </div>
    <div class="wizard-progress" id="wizProg">
      <div class="wp-seg" id="wp1"></div>
      <div class="wp-seg" id="wp2"></div>
      <div class="wp-seg" id="wp3"></div>
      <div class="wp-seg" id="wp4"></div>
    </div>
    <div class="wizard-step-lbl" id="wizStepLbl">Step 1 of 4</div>
    <div id="wizContent"></div>
  </div>
</div>
```

- [ ] **Step 2: Verify**

Reload `http://localhost:3000/arteria.html`. Still no visible change (panel is off-screen). No console errors.

- [ ] **Step 3: Commit**

```bash
git add arteria.html
git commit -m "feat: add onboarding wizard panel HTML"
```

---

## Task 3: Add Wizard JS — State & Step 1 (Account Type)

**Files:**
- Modify: `arteria.html` — add wizard JS block after the `closeLogin()` function (~line 3070)

- [ ] **Step 1: Add the wizard state object and openWizard / closeWizard functions**

Find this line in arteria.html:
```javascript
function setAuthMode(mode){
```

Insert the following block immediately before it:

```javascript
// ── ONBOARDING WIZARD ────────────────────────────────────────────────
const wiz={step:1,type:'',name:'',bio:'',avatar:'',disciplines:[],businessType:'',city:''};

function openWizard(){
  wiz.step=1;wiz.type='';wiz.name='';wiz.bio='';wiz.avatar='';wiz.disciplines=[];wiz.businessType='';wiz.city='';
  document.getElementById('wizardOverlay').classList.add('open');
  document.getElementById('wizardPanel').classList.add('open');
  document.body.style.overflow='hidden';
  renderWizStep();
}

function closeWizard(){
  document.getElementById('wizardOverlay').classList.remove('open');
  document.getElementById('wizardPanel').classList.remove('open');
  document.body.style.overflow='';
}

function wizUpdateProgress(){
  for(let i=1;i<=4;i++){
    document.getElementById('wp'+i).classList.toggle('done',i<=wiz.step);
  }
  document.getElementById('wizStepLbl').textContent=`Step ${wiz.step} of 4`;
}

function renderWizStep(){
  wizUpdateProgress();
  const c=document.getElementById('wizContent');
  if(wiz.step===1) c.innerHTML=wizStep1HTML();
  if(wiz.step===2) c.innerHTML=wizStep2HTML();
  if(wiz.step===3) c.innerHTML=wizStep3HTML();
  if(wiz.step===4) c.innerHTML=wizStep4HTML();
}

function wizStep1HTML(){
  return`
  <div class="wizard-h">What brings you here?</div>
  <div class="wizard-sub">This helps us personalise your experience</div>
  <div class="wiz-type-grid">
    <div class="wiz-type-tile${wiz.type==='creator'?' sel':''}" onclick="wizSelectType('creator')">
      <span class="wiz-type-icon">🎨</span>
      <div class="wiz-type-name">Creator</div>
      <div class="wiz-type-sub">Artist · musician · photographer · dancer…</div>
    </div>
    <div class="wiz-type-tile${wiz.type==='advertiser'?' sel':''}" onclick="wizSelectType('advertiser')">
      <span class="wiz-type-icon">🏢</span>
      <div class="wiz-type-name">Advertiser</div>
      <div class="wiz-type-sub">Brand · studio · venue owner…</div>
    </div>
  </div>
  <div class="wiz-nav">
    <button class="wiz-continue" onclick="wizNext()" ${wiz.type?'':'disabled'}>Continue →</button>
  </div>`;
}

function wizSelectType(t){
  wiz.type=t;
  renderWizStep();
}
```

- [ ] **Step 2: Verify step 1 renders**

In the browser console, run:
```javascript
openWizard()
```
Expected: wizard panel slides up showing "What brings you here?" with two tiles. Clicking Creator/Advertiser highlights the tile and enables the Continue button.

- [ ] **Step 3: Commit**

```bash
git add arteria.html
git commit -m "feat: wizard step 1 — account type"
```

---

## Task 4: Add Wizard JS — Step 2 (Profile)

**Files:**
- Modify: `arteria.html` — add to the wizard JS block (after `wizSelectType`)

- [ ] **Step 1: Add step 2 HTML function and avatar handler**

Find this line:
```javascript
function wizSelectType(t){
```

Add the following after the closing `}` of `wizSelectType`:

```javascript
function wizStep2HTML(){
  const isAdv=wiz.type==='advertiser';
  const bioPlaceholder=isAdv?'Describe your brand or business (optional)':'Tell the community about yourself (optional)';
  const avatarContent=wiz.avatar
    ?`<img src="${wiz.avatar}" alt="avatar">`
    :`<span style="font-size:1.3rem">📷</span>`;
  return`
  <div class="wizard-h">Set up your profile</div>
  <div class="wizard-sub">Others will see this on your page</div>
  <div class="wiz-avatar-row">
    <div class="wiz-avatar" onclick="wizPickAvatar()" id="wizAvatarPreview">${avatarContent}</div>
    <div>
      <div style="font-size:.82rem;font-weight:700;color:var(--t1);margin-bottom:2px">Profile photo</div>
      <div style="font-size:.72rem;color:var(--t3)">Optional · tap to upload</div>
    </div>
  </div>
  <div class="field-group">
    <label>Display name *</label>
    <input class="field-input" id="wizName" placeholder="Your name or alias" value="${wiz.name}" oninput="wiz.name=this.value;document.getElementById('wizContinue2').disabled=!this.value.trim()">
  </div>
  <div class="wiz-bio-wrap">
    <label class="field-group" style="display:block;font-size:.72rem;font-weight:700;color:var(--t3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px">Bio</label>
    <textarea class="field-input" id="wizBio" rows="3" maxlength="160" placeholder="${bioPlaceholder}" style="resize:none;line-height:1.6" oninput="wiz.bio=this.value;document.getElementById('wizBioCount').textContent=this.value.length+'/160'">${wiz.bio}</textarea>
    <div class="wiz-bio-count" id="wizBioCount">${wiz.bio.length}/160</div>
  </div>
  <div class="wiz-nav">
    <button class="wiz-back" onclick="wizBack()">← Back</button>
    <button class="wiz-continue" id="wizContinue2" onclick="wizNext()" ${wiz.name.trim()?'':'disabled'}>Continue →</button>
  </div>`;
}

function wizPickAvatar(){
  const inp=document.createElement('input');
  inp.type='file';inp.accept='image/jpeg,image/png';
  inp.onchange=e=>{
    const f=e.target.files[0];if(!f)return;
    const r=new FileReader();
    r.onload=ev=>{
      wiz.avatar=ev.target.result;
      const p=document.getElementById('wizAvatarPreview');
      if(p)p.innerHTML=`<img src="${ev.target.result}" alt="avatar">`;
    };
    r.readAsDataURL(f);
  };
  inp.click();
}
```

- [ ] **Step 2: Wire up wizNext and wizBack**

Find the `wizSelectType` function and add the following two functions after `wizPickAvatar`:

```javascript
function wizNext(){
  if(wiz.step<4){wiz.step++;renderWizStep();}
  else{wizFinish();}
}

function wizBack(){
  if(wiz.step>1){wiz.step--;renderWizStep();}
}
```

- [ ] **Step 3: Verify step 2 renders**

In browser console:
```javascript
openWizard(); wiz.type='creator'; wiz.step=2; renderWizStep();
```
Expected: profile form with avatar circle, name field (Continue disabled), bio textarea with counter. Typing a name enables Continue. Back button returns to step 1.

- [ ] **Step 4: Commit**

```bash
git add arteria.html
git commit -m "feat: wizard step 2 — profile"
```

---

## Task 5: Add Wizard JS — Step 3 (Disciplines / Business Type)

**Files:**
- Modify: `arteria.html` — add to wizard JS block (after `wizBack`)

- [ ] **Step 1: Add step 3 HTML function**

Add immediately after `wizBack()`:

```javascript
function wizStep3HTML(){
  if(wiz.type==='advertiser') return wizStep3AdvertiserHTML();
  const items=['🎵 Music','📸 Photography','💃 Dance','🎬 Film','🎨 Visual Art','🎙 Podcast','🎭 Theatre','✍️ Writing'];
  const pills=items.map(d=>`<div class="wiz-pill${wiz.disciplines.includes(d)?' sel':''}" onclick="wizToggleDiscipline(this,'${d}')">${d}</div>`).join('');
  const hasSelection=wiz.disciplines.length>0;
  return`
  <div class="wizard-h">What do you create?</div>
  <div class="wizard-sub">Pick all that apply — minimum 1</div>
  <div class="wiz-pills" id="wizPills">${pills}</div>
  <div class="wiz-nav">
    <button class="wiz-back" onclick="wizBack()">← Back</button>
    <button class="wiz-continue" id="wizContinue3" onclick="wizNext()" ${hasSelection?'':'disabled'}>Continue →</button>
  </div>`;
}

function wizStep3AdvertiserHTML(){
  const items=['🎙 Recording Studio','📸 Photography Studio','🏛 Venue / Event Space','📢 Brand / Agency','🎛 Equipment Rental','⚡ Other'];
  const pills=items.map(d=>`<div class="wiz-pill${wiz.businessType===d?' sel':''}" onclick="wizSelectBusiness(this,'${d}')">${d}</div>`).join('');
  const hasSelection=!!wiz.businessType;
  return`
  <div class="wizard-h">What type of business are you?</div>
  <div class="wizard-sub">Helps us connect you with the right creators</div>
  <div class="wiz-pills" id="wizPills">${pills}</div>
  <div class="wiz-nav">
    <button class="wiz-back" onclick="wizBack()">← Back</button>
    <button class="wiz-continue" id="wizContinue3" onclick="wizNext()" ${hasSelection?'':'disabled'}>Continue →</button>
  </div>`;
}

function wizToggleDiscipline(el,d){
  const idx=wiz.disciplines.indexOf(d);
  if(idx>-1){wiz.disciplines.splice(idx,1);el.classList.remove('sel');}
  else{wiz.disciplines.push(d);el.classList.add('sel');}
  const btn=document.getElementById('wizContinue3');
  if(btn)btn.disabled=wiz.disciplines.length===0;
}

function wizSelectBusiness(el,d){
  wiz.businessType=d;
  document.querySelectorAll('#wizPills .wiz-pill').forEach(p=>p.classList.remove('sel'));
  el.classList.add('sel');
  const btn=document.getElementById('wizContinue3');
  if(btn)btn.disabled=false;
}
```

- [ ] **Step 2: Verify step 3 — Creator path**

In browser console:
```javascript
openWizard(); wiz.type='creator'; wiz.step=3; renderWizStep();
```
Expected: pill grid with 8 disciplines. Clicking a pill toggles amber highlight. Continue is disabled until at least 1 is selected.

- [ ] **Step 3: Verify step 3 — Advertiser path**

```javascript
openWizard(); wiz.type='advertiser'; wiz.step=3; renderWizStep();
```
Expected: pill grid with 6 business types. Clicking selects one only (single-select). Continue enabled after 1 pick.

- [ ] **Step 4: Commit**

```bash
git add arteria.html
git commit -m "feat: wizard step 3 — disciplines and business type"
```

---

## Task 6: Add Wizard JS — Step 4 (Location) & Completion

**Files:**
- Modify: `arteria.html` — add to wizard JS block (after `wizSelectBusiness`)

- [ ] **Step 1: Add step 4 HTML and wizFinish**

Add immediately after `wizSelectBusiness()`:

```javascript
function wizStep4HTML(){
  return`
  <div class="wizard-h">Where are you based?</div>
  <div class="wizard-sub">We'll show you spaces and creators nearby</div>
  <div class="field-group">
    <label>Your city</label>
    <input class="field-input" id="wizCity" placeholder="e.g. London, Berlin, Paris…" value="${wiz.city}" oninput="wiz.city=this.value">
  </div>
  <div class="wiz-nav">
    <button class="wiz-back" onclick="wizBack()">← Back</button>
    <button class="wiz-continue" onclick="wizFinish()">Finish — Enter ARTERIA ✦</button>
  </div>
  <div class="wiz-skip" onclick="wiz.city='';wizFinish()">Skip — I'll add this later</div>`;
}

function wizFinish(){
  const cityEl=document.getElementById('wizCity');
  if(cityEl)wiz.city=cityEl.value.trim();
  const profile={
    type:wiz.type,
    name:wiz.name.trim(),
    bio:wiz.bio.trim(),
    avatar:wiz.avatar,
    disciplines:wiz.type==='creator'?wiz.disciplines:[],
    businessType:wiz.type==='advertiser'?wiz.businessType:'',
    city:wiz.city
  };
  localStorage.setItem('arteria_profile',JSON.stringify(profile));
  closeWizard();
  closeLogin();
  const msg=wiz.type==='advertiser'
    ?`Welcome to ARTERIA, ${profile.name} — your advertiser account is ready.`
    :`Welcome to ARTERIA, ${profile.name} ✦`;
  setTimeout(()=>toast(msg,'✦'),350);
}
```

- [ ] **Step 2: Verify full flow end-to-end**

In browser console:
```javascript
openWizard();
```
Walk through all 4 steps manually:
1. Select Creator → Continue
2. Enter a name → Continue
3. Select Music → Continue
4. Type a city → click Finish

Expected: panel slides down, login overlay fades, toast appears with "Welcome to ARTERIA, [name] ✦". Then run:
```javascript
JSON.parse(localStorage.getItem('arteria_profile'))
```
Expected: object with all fields populated correctly.

- [ ] **Step 3: Commit**

```bash
git add arteria.html
git commit -m "feat: wizard step 4 — location and finish"
```

---

## Task 7: Wire Wizard Into handleAuth()

**Files:**
- Modify: `arteria.html` — update `handleAuth()` (~line 3084)

- [ ] **Step 1: Replace handleAuth**

Find and replace the entire `handleAuth` function:

```javascript
function handleAuth(){
  const email=document.getElementById('authEmail').value;
  if(!email){document.getElementById('authEmail').focus();return}
  if(authMode==='signin'){
    document.getElementById('loginContent').innerHTML=`<div style="text-align:center;padding:3rem 1rem"><div style="font-size:2.5rem;color:var(--green);margin-bottom:1rem">✓</div><h3 style="font-family:var(--fd);font-size:1.3rem;font-weight:800;margin-bottom:.5rem">Welcome back!</h3><p style="color:var(--t2);font-size:.9rem;margin-bottom:1.5rem;line-height:1.7">You're now signed in to ARTERIA.</p><button class="btn-primary" style="width:100%;padding:12px;font-size:.9rem" onclick="closeLogin()">Continue</button></div>`;
  } else {
    closeLogin();
    setTimeout(openWizard,380);
  }
}
```

- [ ] **Step 2: Verify sign-in path unchanged**

1. Click Login in the nav
2. Stay on Sign In tab, enter any email, click Sign In
3. Expected: "Welcome back!" success screen as before

- [ ] **Step 3: Verify sign-up path triggers wizard**

1. Click Login → switch to Create Account tab
2. Enter any email + password, click Create Account
3. Expected: login panel closes, then wizard slides up starting at step 1

- [ ] **Step 4: Commit**

```bash
git add arteria.html
git commit -m "feat: wire wizard into handleAuth signup flow"
```

---

## Task 8: Deploy to GitHub

**Files:**
- `/tmp/arteria-deploy/index.html` (the deployed copy)

- [ ] **Step 1: Copy updated file to deploy repo**

```bash
cp /Users/kyleairey/Desktop/wheelie_clean_website/arteria.html /tmp/arteria-deploy/index.html
```

- [ ] **Step 2: Commit and push**

```bash
cd /tmp/arteria-deploy
git add index.html
git commit -m "feat: account onboarding wizard"
git push
```

- [ ] **Step 3: Verify**

Wait ~2 minutes, then open `https://aireyai.github.io/arteria` and test the full signup → wizard flow in a real browser.
