/**
 * =====================================================
 *  UNIVERSAL AI CHATBOT WIDGET v4 — Fun Edition
 *  One hosted file. Auto-updates on all sites.
 *
 *  Fun features: Confetti · Floating emoji · Bot moods
 *  Name capture · Streaks · Easter eggs · Rotating thinking
 *  messages · Celebration moments · Rich interactions
 *
 *  Usage:
 *  <script src="https://your-server.com/chatbot.js"
 *    data-name="Max"
 *    data-color="#FF6B6B"
 *    data-server="https://your-server.com"
 *    data-handoff-url="https://calendly.com/yourlink"
 *    data-handoff-wa="+447700000000"
 *    data-handoff-email="hello@yoursite.com"
 *    data-webhook="https://your-webhook.com/lead"
 *    data-canned='{"hours":"Mon-Fri 9-5","price":"From £299"}'
 *    data-page-messages='{"/pricing":"Questions about cost? I break it down ✦"}'
 *    data-prompt="You are Max, assistant for Pete's Plumbing..."
 *  ></script>
 * =====================================================
 */
(function () {

  // =====================================================
  //  CONFIG — read from <script data-*> attributes
  // =====================================================
  const _s  = document.currentScript || document.querySelector('script[src*="chatbot"]');
  const _a  = (k, d = '') => (_s && _s.dataset[k] != null) ? _s.dataset[k] : d;
  const _j  = (k, d)      => { try { return JSON.parse(_a(k, JSON.stringify(d))); } catch { return d; } };

  const CONFIG = {
    botName:      _a('name',     'Aria'),
    botAvatar:    _a('avatar',   '✦'),
    accentColor:  _a('color',    '#6C63FF'),
    accentDark:   _a('colorDark','#5A52D5'),
    textOnAccent: _a('colorText','#ffffff'),
    position:     _a('position', 'right'),
    serverUrl:    _a('server',   ''),

    baseModel:     _a('model',         'claude-haiku-4-5-20251001'),
    smartModel:    _a('smartModel',    'claude-sonnet-4-6'),
    useSmartModel: _a('useSmartModel', 'true') !== 'false',

    handoffUrl:   _a('handoffUrl',   ''),
    handoffWa:    _a('handoffWa',    ''),
    handoffEmail: _a('handoffEmail', ''),
    webhook:      _a('webhook',      ''),

    canned:       _j('canned',       {}),
    pageMessages: _j('pageMessages', {}),
    pageTriggers: _j('pageTriggers', []),
    quickReplies: _j('quickReplies', ['I need help 🙋', 'Pricing 💰', 'Show me around 🗺', 'Talk to a human 👋']),
    customPrompt: _a('prompt', ''),

    // Fun
    captureNames:       true,
    streakEnabled:      true,
    easterEggsEnabled:  true,
    confettiEnabled:    true,
    floatingEmoji:      true,

    // ── Owner features ─────────────────────────────────────────────
    whiteLabelMode:     _a('whiteLabel',  'false') === 'true',  // removes "Powered by AI" branding
    gdprEnabled:        _a('gdpr',        'false') === 'true',  // show consent before chatting
    gdprPrivacyUrl:     _a('privacyUrl',  ''),
    businessHours:      _j('hours',       null),   // { mon:[9,17], tue:[9,17], wed:null, ... }
    businessTimezone:   _a('timezone',    ''),     // e.g. "Europe/London"
    businessClosedMsg:  _a('closedMsg',   "We're offline right now — leave your email and we'll reply first thing! 📧"),
    products:           _j('products',    []),     // [{name,desc,price,url}]
    booking:            _j('booking',     null),   // {ownerName,ownerEmail,confirmMsg} — enables booking flow
    autoLearnSite:      _a('autoLearn',   'true')  !== 'false',  // crawl site pages for bot knowledge

    // Core features
    streamingEnabled:     true,
    multiBubble:          true,
    soundEnabled:         true,
    persistHistory:       true,
    darkModeAuto:         true,
    voiceInputEnabled:    true,
    suggestedFollowups:   true,
    injectPageContent:    true,
    richResponses:        true,
    conversationRating:   true,
    leadCaptureEnabled:   true,
    leadCaptureAfter:     3,
    exitIntentEnabled:    true,
    scrollTriggerEnabled: true,
    timeTriggerEnabled:   true,
    timeTriggerDelay:     25000,
    notificationDelay:    8000,

    // Advanced engagement features
    discountCode:    _a('discount',    ''),       // code offered on buying intent
    objections:      _j('objections',  {}),       // {"too expensive":"Here's why..."}
    competitors:     _j('competitors', []),       // ["CompetitorA"] — detect + deflect
    testimonials:    _j('testimonials',[]),       // [{text, author, role}]
    abTest:          _j('abTest',      null),     // {variants:[{name,accentColor,botName,welcomeMessage}]}
    gaId:            _a('gaId',        ''),       // GA4 measurement ID (G-XXXXXXXX)
    fbPixel:         _a('fbPixel',     ''),       // Facebook Pixel ID
    tikTokPixel:     _a('ttPixel',     ''),       // TikTok Pixel ID
    shopifyEnabled:  _a('shopify',     'false') === 'true',
    cartUrl:         _a('cartUrl',     '/cart'),  // checkout URL pattern — triggers cart offer
    npsAfter:        parseInt(_a('npsAfter', '8'), 10), // show NPS after N bot messages
    npsEnabled:      _a('npsEnabled',  'true') !== 'false',
    liveHandoff:     _a('liveHandoff', 'false') === 'true', // server-side live chat handoff

    // Multi-tenant — each embedded site identifies its owner
    ownerEmail:      _a('ownerEmail',  ''),       // site owner's email — alerts go here, not global inbox
    ownerName:       _a('ownerName',   ''),       // owner name shown in visitor follow-up email
    siteName:        _a('siteName',    ''),       // site/business name shown in follow-up email
    followupEnabled: _a('followup',    'true') !== 'false', // send visitor a follow-up email after lead
  };

  const BASE        = CONFIG.serverUrl || window.location.origin;
  const PROXY_URL   = BASE + '/api/chat';
  const STREAM_URL  = BASE + '/api/chat/stream';
  const SESSION_URL = BASE + '/api/session';
  const LEAD_URL    = BASE + '/api/lead';
  const BOOK_URL    = BASE + '/api/booking';
  const FAQS_URL    = BASE + '/api/faqs';
  const HANDOFF_URL = BASE + '/api/handoff';
  const AB_URL      = BASE + '/api/ab';
  const SHOPIFY_URL = BASE + '/api/shopify/order';

  const SESSION_ID = (() => {
    const k = '_ac_sid'; let id = sessionStorage.getItem(k);
    if (!id) { id = Date.now().toString(36) + Math.random().toString(36).slice(2); sessionStorage.setItem(k, id); }
    return id;
  })();

  // =====================================================
  //  SOUND ENGINE
  // =====================================================
  let _actx = null;
  const _ac = () => _actx || (_actx = new (window.AudioContext || window.webkitAudioContext)());
  function _tone(f, ef, g, d, type = 'sine') {
    try {
      const c = _ac(), o = c.createOscillator(), gn = c.createGain();
      o.connect(gn); gn.connect(c.destination); o.type = type;
      o.frequency.setValueAtTime(f, c.currentTime);
      if (ef) o.frequency.exponentialRampToValueAtTime(ef, c.currentTime + d);
      gn.gain.setValueAtTime(g, c.currentTime);
      gn.gain.exponentialRampToValueAtTime(0.001, c.currentTime + d);
      o.start(c.currentTime); o.stop(c.currentTime + d);
    } catch {}
  }
  const sounds = {
    pop:      () => CONFIG.soundEnabled && _tone(880, 440, 0.08, 0.18),
    click:    () => CONFIG.soundEnabled && _tone(600, null, 0.04, 0.06),
    send:     () => CONFIG.soundEnabled && _tone(500, 700, 0.05, 0.1),
    success:  () => CONFIG.soundEnabled && (_tone(523, null, 0.06, 0.1), setTimeout(() => _tone(659, null, 0.06, 0.1), 110), setTimeout(() => _tone(784, null, 0.06, 0.15), 220)),
    celebrate:() => CONFIG.soundEnabled && (_tone(523, null, 0.07, 0.08), setTimeout(() => _tone(659, null, 0.07, 0.08), 90), setTimeout(() => _tone(784, null, 0.07, 0.08), 180), setTimeout(() => _tone(1047, null, 0.07, 0.2), 270)),
  };

  // =====================================================
  //  CONFETTI ENGINE (pure canvas — no dependencies)
  // =====================================================
  function confetti(opts = {}) {
    if (!CONFIG.confettiEnabled) return;
    const { count = 90, x = 0.5, y = 0.6, spread = 'full' } = opts;
    const A = CONFIG.accentColor;
    const colors = [A, '#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#FF922B', '#F78CA2', '#a18cd1'];
    const cvs = document.createElement('canvas');
    cvs.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:2147483647';
    document.body.appendChild(cvs);
    cvs.width  = window.innerWidth;
    cvs.height = window.innerHeight;
    const ctx = cvs.getContext('2d');

    const particles = Array.from({ length: count }, () => {
      const angle = spread === 'full'
        ? Math.random() * Math.PI * 2
        : (-Math.PI / 2) + (Math.random() - 0.5) * Math.PI * 0.8;
      const speed = Math.random() * 10 + 5;
      return {
        x: cvs.width  * x,
        y: cvs.height * y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: colors[Math.floor(Math.random() * colors.length)],
        w: Math.random() * 10 + 6,
        h: Math.random() * 6  + 4,
        rot: Math.random() * 360,
        rv: (Math.random() - 0.5) * 12,
        life: 1,
      };
    });

    let raf;
    (function draw() {
      ctx.clearRect(0, 0, cvs.width, cvs.height);
      let alive = false;
      particles.forEach(p => {
        p.x  += p.vx; p.y  += p.vy;
        p.vy += 0.35; p.vx *= 0.99;
        p.rot += p.rv; p.life -= 0.013;
        if (p.life <= 0) return; alive = true;
        ctx.save();
        ctx.globalAlpha = Math.min(p.life * 2, 1);
        ctx.translate(p.x, p.y); ctx.rotate(p.rot * Math.PI / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      if (alive) raf = requestAnimationFrame(draw);
      else cvs.remove();
    })();
  }

  // =====================================================
  //  FLOATING EMOJI
  // =====================================================
  function floatEmoji(emoji, fromEl) {
    if (!CONFIG.floatingEmoji) return;
    const rect = fromEl.getBoundingClientRect();
    const span = document.createElement('span');
    span.textContent = emoji;
    span.style.cssText = `position:fixed;left:${rect.left + rect.width/2 - 12}px;top:${rect.top}px;
      font-size:26px;pointer-events:none;z-index:2147483647;
      animation:_acfloat 1.1s cubic-bezier(.25,.46,.45,.94) forwards;`;
    document.body.appendChild(span);
    setTimeout(() => span.remove(), 1200);
  }

  // =====================================================
  //  BOT MOOD ENGINE
  // =====================================================
  function getBotMood() {
    const h = new Date().getHours();
    if (h >= 6  && h < 12) return { emoji: '☀️', label: 'Morning energy!',  vibe: 'energetic and upbeat' };
    if (h >= 12 && h < 17) return { emoji: '⚡', label: 'Ready to help',    vibe: 'focused and direct'  };
    if (h >= 17 && h < 22) return { emoji: '🌙', label: 'Evening session',  vibe: 'calm and thoughtful' };
    return                          { emoji: '🦉', label: 'Night owl mode',  vibe: 'chill and relaxed'   };
  }

  // =====================================================
  //  THINKING MESSAGES (rotates each time bot thinks)
  // =====================================================
  const THINKING = [
    'Thinking... ✦',  'On it! ⚡',      'Let me check 🔍',
    'Cooking that up 🍳','Processing 🧠', 'Great question ✨',
    'Consulting the oracle 🔮', 'Almost there...',
    'Looking into it 👀', 'On the case 🕵️',
  ];
  let thinkIdx = 0;
  const nextThink = () => THINKING[thinkIdx++ % THINKING.length];

  // =====================================================
  //  EASTER EGGS
  // =====================================================
  const EGGS = {
    'surprise me':    ['✨ Fun fact: Honey never expires. Archaeologists found 3000-year-old honey in Egyptian tombs that was still perfectly edible! 🍯', 'Now THAT\'s shelf life. What can I help you with?'],
    'tell me a joke': ['Why did the AI go to therapy? 🤖', 'Too many deep learning issues! 😄 Anyway — what can I actually help with?'],
    'magic':          (confetti({ spread: 'full' }), ['✨ MAGIC MODE ACTIVATED ✨', 'Your wish is my command — what do you need?']),
    'who made you':   ['I was built with love, caffeine, and the Anthropic API ✦', 'The humans behind me really know their stuff 😄 Anything I can help with?'],
    'bored':          ['I feel that 😅', 'Let\'s fix that — ask me anything and I\'ll make it interesting ✦'],
    'hello':          ['Hey hey! 👋✨ Great to see you!', 'What can I do for you today?'],
    'thank you':      ['You\'re so welcome! 😊✦', 'Is there anything else I can help with?'],
    'you\'re amazing':['Aww, that genuinely made my day! 🥺✨', 'You\'re pretty amazing yourself — now, what can I do for you?'],
  };

  // =====================================================
  //  STREAK ENGINE
  // =====================================================
  const STREAK_MILESTONES = { 3: '🔥 3 messages!', 5: '⚡ On a roll!', 10: '🚀 Power user!', 20: '🏆 Legend!' };

  // =====================================================
  //  STYLES
  // =====================================================
  const A = CONFIG.accentColor, AD = CONFIG.accentDark, AT = CONFIG.textOnAccent, P = CONFIG.position;

  const STYLES = `
  #_ac-w{--ab:${A};--abd:${AD};--abt:${AT};
    --bg:#fff;--bg2:#f7f8fc;--bg3:#eef0f8;--text:#1a1a2e;--text2:#66668a;
    --border:#e8e8f0;--sh:rgba(0,0,0,0.07);--bot:#fff;--inp:#f7f8fc;}
  @media(prefers-color-scheme:dark){#_ac-w{
    --bg:#1a1a2e;--bg2:#13131f;--bg3:#0e0e1a;--text:#e8e8f8;--text2:#8888aa;
    --border:#2a2a44;--sh:rgba(0,0,0,0.4);--bot:#22223a;--inp:#13131f;}}
  #_ac-w *{box-sizing:border-box;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;}

  /* Toggle button */
  #_ac-btn{position:fixed;${P}:24px;bottom:24px;z-index:2147483646;
    width:60px;height:60px;border-radius:50%;background:var(--ab);border:none;cursor:pointer;
    box-shadow:0 4px 24px ${A}55,0 0 0 0 ${A}44;
    display:flex;align-items:center;justify-content:center;
    transition:transform .25s cubic-bezier(.34,1.56,.64,1),box-shadow .3s;outline:none;
    animation:_acglow 3s ease-in-out infinite;}
  @keyframes _acglow{0%,100%{box-shadow:0 4px 24px ${A}55,0 0 0 0 ${A}33}
    50%{box-shadow:0 4px 32px ${A}77,0 0 0 8px ${A}11}}
  #_ac-btn:hover{transform:scale(1.13);}
  #_ac-btn:active{transform:scale(.95);}
  #_ac-btn-icon{font-size:26px;transition:transform .3s cubic-bezier(.34,1.56,.64,1);}
  #_ac-btn.open #_ac-btn-icon{transform:rotate(90deg);}
  #_ac-notif{position:absolute;top:-1px;right:-1px;width:16px;height:16px;background:#ff4757;
    border-radius:50%;border:2px solid white;animation:_acp .4s cubic-bezier(.34,1.56,.64,1);}
  @keyframes _acp{from{transform:scale(0)}to{transform:scale(1)}}

  /* Chat window */
  #_ac-win{position:fixed;${P}:24px;bottom:96px;z-index:2147483645;
    width:385px;height:585px;background:var(--bg);border-radius:24px;
    box-shadow:0 20px 80px rgba(0,0,0,0.22),0 2px 12px rgba(0,0,0,0.1);
    display:flex;flex-direction:column;overflow:hidden;
    transform:scale(.88) translateY(24px);transform-origin:bottom ${P};
    opacity:0;pointer-events:none;transition:transform .32s cubic-bezier(.34,1.56,.64,1),opacity .25s ease;}
  #_ac-win.open{transform:scale(1) translateY(0);opacity:1;pointer-events:all;}

  /* Header */
  #_ac-hdr{background:var(--ab);padding:14px 16px;display:flex;align-items:center;gap:11px;flex-shrink:0;
    position:relative;}
  #_ac-av-wrap{position:relative;width:42px;height:42px;flex-shrink:0;}
  #_ac-av{width:42px;height:42px;border-radius:50%;background:rgba(255,255,255,.22);
    display:flex;align-items:center;justify-content:center;font-size:20px;color:#fff;font-weight:700;
    animation:_abrth 3s ease-in-out infinite;cursor:pointer;transition:transform .15s;}
  #_ac-av:hover{transform:scale(1.12);}
  #_ac-av:active{transform:scale(.92);}
  @keyframes _abrth{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}
  #_ac-dot{position:absolute;bottom:1px;right:1px;width:11px;height:11px;background:#2ecc71;
    border-radius:50%;border:2px solid var(--ab);animation:_apls 2.2s infinite;}
  @keyframes _apls{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.9)}}
  #_ac-info{flex:1;min-width:0;}
  #_ac-name{color:#fff;font-weight:700;font-size:15px;margin:0;line-height:1.2;}
  #_ac-sub{color:rgba(255,255,255,.8);font-size:11.5px;margin-top:2px;transition:all .3s;}
  #_ac-streak{position:absolute;top:12px;left:50%;transform:translateX(-50%);
    background:rgba(255,255,255,.18);color:#fff;border-radius:20px;padding:3px 10px;
    font-size:12px;font-weight:700;display:none;animation:_acp .4s cubic-bezier(.34,1.56,.64,1);}
  #_ac-streak.show{display:block;}
  #_ac-hdr-btns{display:flex;gap:6px;flex-shrink:0;}
  .ac-hbtn{background:rgba(255,255,255,.15);border:none;color:#fff;width:30px;height:30px;
    border-radius:50%;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;
    transition:background .15s,transform .15s;}
  .ac-hbtn:hover{background:rgba(255,255,255,.3);transform:scale(1.1);}

  /* Menu */
  #_ac-menu{position:absolute;top:68px;${P}:16px;background:var(--bg);
    border:1px solid var(--border);border-radius:14px;
    box-shadow:0 10px 40px rgba(0,0,0,.18);overflow:hidden;z-index:10;display:none;min-width:170px;}
  #_ac-menu.show{display:block;animation:_afad .18s ease;}
  .ac-mi{display:flex;align-items:center;gap:9px;padding:12px 16px;font-size:13.5px;
    color:var(--text);cursor:pointer;transition:background .12s;border:none;
    background:none;width:100%;text-align:left;font-family:inherit;}
  .ac-mi:hover{background:var(--bg2);}
  .ac-mi+.ac-mi{border-top:1px solid var(--border);}

  /* Messages */
  #_ac-msgs{flex:1;overflow-y:auto;padding:14px 14px 8px;display:flex;flex-direction:column;
    gap:7px;background:var(--bg2);scroll-behavior:smooth;}
  #_ac-msgs::-webkit-scrollbar{width:4px;}
  #_ac-msgs::-webkit-scrollbar-thumb{background:var(--border);border-radius:4px;}
  .ac-msg{max-width:84%;padding:11px 15px;border-radius:18px;font-size:14px;line-height:1.58;
    word-wrap:break-word;animation:_afad .22s ease;white-space:pre-wrap;}
  @keyframes _afad{from{opacity:0;transform:translateY(9px)}to{opacity:1;transform:translateY(0)}}
  .ac-msg.bot{background:var(--bot);color:var(--text);border-bottom-left-radius:4px;
    box-shadow:0 2px 8px var(--sh);align-self:flex-start;
    transition:transform .15s;cursor:default;}
  .ac-msg.bot:hover{transform:translateY(-1px);}
  .ac-msg.user{background:var(--ab);color:var(--abt);border-bottom-right-radius:4px;align-self:flex-end;}
  .ac-msg.stream::after{content:'▋';display:inline-block;animation:_acur .7s steps(1) infinite;
    margin-left:2px;font-size:12px;}
  @keyframes _acur{0%,100%{opacity:1}50%{opacity:0}}

  /* Typing indicator */
  #_ac-typing{display:none;flex-direction:column;align-self:flex-start;gap:4px;}
  #_ac-typing.show{display:flex;}
  #_ac-tdots{display:flex;align-items:center;gap:5px;padding:12px 16px;background:var(--bot);
    border-radius:18px;border-bottom-left-radius:4px;width:fit-content;
    box-shadow:0 2px 8px var(--sh);}
  #_ac-tdots span{width:7px;height:7px;background:var(--text2);border-radius:50%;
    animation:_abounce 1.2s infinite ease-in-out;}
  #_ac-tdots span:nth-child(2){animation-delay:.15s;}
  #_ac-tdots span:nth-child(3){animation-delay:.3s;}
  @keyframes _abounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-7px)}}
  #_ac-ttext{font-size:11px;color:var(--text2);padding-left:4px;animation:_afad .3s ease;}

  /* Quick replies */
  .ac-qr-wrap{display:flex;flex-wrap:wrap;gap:6px;align-self:flex-start;max-width:90%;animation:_afad .3s ease;}
  .ac-qr{background:var(--bg);border:1.5px solid var(--ab);color:var(--ab);border-radius:20px;
    padding:7px 14px;font-size:13px;cursor:pointer;transition:all .18s;
    font-family:inherit;white-space:nowrap;}
  .ac-qr:hover{background:var(--ab);color:var(--abt);transform:translateY(-2px);box-shadow:0 4px 12px ${A}44;}
  .ac-qr:active{transform:translateY(0);}

  /* Follow-up suggestions */
  .ac-fu-wrap{display:flex;flex-wrap:wrap;gap:6px;align-self:flex-start;max-width:92%;margin-top:1px;animation:_afad .35s ease;}
  .ac-fu{background:var(--bg3);border:1px solid var(--border);color:var(--text2);border-radius:16px;
    padding:5px 12px;font-size:12.5px;cursor:pointer;transition:all .15s;font-family:inherit;}
  .ac-fu:hover{border-color:var(--ab);color:var(--ab);background:var(--bg);transform:translateY(-1px);}

  /* Reactions */
  .ac-reactions{display:flex;gap:5px;margin-top:2px;align-self:flex-start;}
  .ac-rbtn{background:none;border:1px solid var(--border);border-radius:12px;
    padding:3px 8px;font-size:13px;cursor:pointer;transition:all .15s;color:var(--text2);
    position:relative;}
  .ac-rbtn:hover{background:${A}18;border-color:var(--ab);transform:scale(1.15);}
  .ac-rbtn.on{background:${A}22;border-color:var(--ab);}
  .ac-time{font-size:11px;color:var(--text2);align-self:center;margin:1px 0;}

  /* Rich elements */
  .ac-rich-btns{display:flex;flex-wrap:wrap;gap:7px;align-self:flex-start;margin-top:2px;animation:_afad .3s ease;}
  .ac-rich-btn{background:var(--bg);border:1.5px solid var(--ab);color:var(--ab);border-radius:20px;
    padding:7px 15px;font-size:13px;cursor:pointer;font-family:inherit;transition:all .15s;}
  .ac-rich-btn:hover{background:var(--ab);color:var(--abt);transform:translateY(-1px);}
  .ac-img{max-width:100%;border-radius:14px;margin-top:4px;align-self:flex-start;
    animation:_afad .3s ease;box-shadow:0 4px 16px var(--sh);}
  .ac-handoff{background:var(--bot);border-radius:16px;padding:16px;align-self:flex-start;
    box-shadow:0 2px 8px var(--sh);animation:_afad .25s ease;max-width:92%;}
  .ac-handoff p{font-size:13.5px;color:var(--text);margin:0 0 12px;line-height:1.5;}
  .ac-handoff-btns{display:flex;flex-direction:column;gap:8px;}
  .ac-ho{display:flex;align-items:center;gap:9px;padding:10px 15px;border-radius:12px;
    font-size:13.5px;font-weight:600;cursor:pointer;text-decoration:none;
    border:none;font-family:inherit;transition:opacity .15s,transform .15s;}
  .ac-ho:hover{opacity:.88;transform:translateY(-1px);}
  .ac-ho-cal{background:#0069ff;color:#fff;}
  .ac-ho-wa{background:#25d366;color:#fff;}
  .ac-ho-em{background:var(--bg3);color:var(--text);border:1px solid var(--border);}

  /* Milestone toast */
  #_ac-toast{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) scale(.8);
    background:rgba(0,0,0,.82);color:#fff;border-radius:20px;padding:14px 22px;
    font-size:16px;font-weight:700;pointer-events:none;opacity:0;z-index:10;text-align:center;
    transition:all .3s cubic-bezier(.34,1.56,.64,1);}
  #_ac-toast.show{opacity:1;transform:translate(-50%,-50%) scale(1);}

  /* Lead capture */
  #_ac-lead{background:var(--bot);border-radius:16px;padding:16px;align-self:flex-start;
    box-shadow:0 2px 8px var(--sh);animation:_afad .25s ease;max-width:90%;}
  #_ac-lead p{font-size:13.5px;color:var(--text);line-height:1.5;margin:0 0 10px;}
  #_ac-lead-row{display:flex;gap:6px;}
  #_ac-lead-inp{flex:1;border:1.5px solid var(--border);border-radius:20px;padding:8px 13px;
    font-size:13px;outline:none;background:var(--inp);color:var(--text);font-family:inherit;}
  #_ac-lead-inp:focus{border-color:var(--ab);}
  #_ac-lead-sub{background:var(--ab);color:var(--abt);border:none;border-radius:20px;
    padding:8px 15px;font-size:13px;cursor:pointer;font-family:inherit;font-weight:600;transition:background .15s;}
  #_ac-lead-sub:hover{background:var(--abd);}

  /* Rating */
  #_ac-rating{background:var(--bg);padding:18px;display:flex;flex-direction:column;
    align-items:center;gap:11px;border-top:1px solid var(--border);flex-shrink:0;animation:_afad .3s ease;}
  #_ac-rating p{font-size:14px;color:var(--text);margin:0;font-weight:600;}
  #_ac-stars{display:flex;gap:8px;}
  .ac-star{font-size:28px;cursor:pointer;transition:transform .15s;filter:grayscale(1);opacity:.4;}
  .ac-star:hover,.ac-star.lit{filter:grayscale(0);opacity:1;transform:scale(1.22);}
  #_ac-skip-rate{background:none;border:none;color:var(--text2);font-size:12px;cursor:pointer;font-family:inherit;}

  /* Input area */
  #_ac-inp-area{padding:10px 12px;border-top:1px solid var(--border);display:flex;
    align-items:flex-end;gap:7px;background:var(--bg);flex-shrink:0;}
  #_ac-mic{width:36px;height:36px;flex-shrink:0;border-radius:50%;border:1.5px solid var(--border);
    background:var(--bg2);color:var(--text2);cursor:pointer;font-size:15px;
    display:flex;align-items:center;justify-content:center;transition:all .15s;}
  #_ac-mic:hover{border-color:var(--ab);color:var(--ab);}
  #_ac-mic.on{background:#ff4757;border-color:#ff4757;color:#fff;animation:_apls 1s infinite;}
  #_ac-mic.hide{display:none;}
  #_ac-inp{flex:1;border:1.5px solid var(--border);border-radius:20px;padding:9px 15px;
    font-size:14px;outline:none;resize:none;max-height:90px;font-family:inherit;
    color:var(--text);background:var(--inp);transition:border-color .2s,background .2s,box-shadow .2s;line-height:1.4;}
  #_ac-inp:focus{border-color:var(--ab);background:var(--bg);box-shadow:0 0 0 3px ${A}22;}
  #_ac-inp::placeholder{color:var(--text2);}
  #_ac-send{width:38px;height:38px;flex-shrink:0;border-radius:50%;background:var(--ab);
    border:none;cursor:pointer;color:#fff;font-size:16px;display:flex;
    align-items:center;justify-content:center;transition:transform .15s,background .15s,box-shadow .15s;}
  #_ac-send:hover{transform:scale(1.12);background:var(--abd);box-shadow:0 4px 14px ${A}55;}
  #_ac-send:active{transform:scale(.93);}
  #_ac-send:disabled{opacity:.35;cursor:not-allowed;transform:none;box-shadow:none;}
  #_ac-power{text-align:center;font-size:10px;color:var(--text2);
    padding:4px 0 7px;background:var(--bg);letter-spacing:.3px;flex-shrink:0;opacity:.5;}

  /* Floating emoji animation */
  @keyframes _acfloat{0%{opacity:1;transform:translateY(0) scale(1)}
    100%{opacity:0;transform:translateY(-80px) scale(1.4)}}
  /* GDPR consent */
  #_ac-gdpr{padding:14px 16px;background:var(--bg3);border-top:1px solid var(--border);flex-shrink:0;}
  #_ac-gdpr p{font-size:12px;color:var(--text2);line-height:1.5;margin-bottom:10px;}
  #_ac-gdpr a{color:var(--ab);}
  #_ac-gdpr-btn{width:100%;padding:9px;background:var(--ab);color:var(--abt);border:none;border-radius:10px;font-size:13.5px;font-weight:600;cursor:pointer;font-family:inherit;transition:background .15s;}
  #_ac-gdpr-btn:hover{background:var(--abd);}
  /* Closed banner */
  #_ac-closed{padding:12px 16px;background:#ff475715;border-top:1px solid #ff475730;flex-shrink:0;font-size:13px;color:var(--text);text-align:center;line-height:1.5;}
  /* Booking flow */
  .ac-booking-card{background:var(--bot);border-radius:16px;padding:16px;align-self:flex-start;box-shadow:0 2px 8px var(--sh);animation:_afad .25s ease;max-width:90%;}
  .ac-booking-card p{font-size:13.5px;color:var(--text);margin:0 0 10px;line-height:1.5;}
  .ac-booking-input{width:100%;border:1.5px solid var(--border);border-radius:10px;padding:9px 13px;font-size:13px;outline:none;background:var(--inp);color:var(--text);font-family:inherit;margin-bottom:8px;}
  .ac-booking-input:focus{border-color:var(--ab);}
  .ac-booking-submit{width:100%;padding:9px;background:var(--ab);color:var(--abt);border:none;border-radius:10px;font-size:13.5px;font-weight:600;cursor:pointer;font-family:inherit;transition:background .15s;}
  .ac-booking-submit:hover{background:var(--abd);}
  /* Business hours badge */
  #_ac-hours-badge{display:inline-block;margin-left:6px;font-size:10px;padding:2px 7px;border-radius:20px;font-weight:600;}
  .hours-open{background:#2ecc7130;color:#2ecc71;}
  .hours-closed{background:#ff475730;color:#ff4757;}

  /* Discount card */
  .ac-discount-card{display:flex;align-items:center;gap:10px;background:linear-gradient(135deg,${A}18,${A}08);
    border:1.5px dashed var(--ab);border-radius:16px;padding:14px 16px;align-self:flex-start;
    max-width:92%;animation:_afad .3s ease;}
  .ac-discount-icon{font-size:26px;flex-shrink:0;}
  .ac-discount-body{flex:1;min-width:0;}
  .ac-discount-body strong{font-size:13px;color:var(--text);display:block;margin-bottom:3px;}
  .ac-discount-body p{font-size:12.5px;color:var(--text2);margin:0;}
  .ac-code{background:var(--ab);color:var(--abt);padding:2px 8px;border-radius:6px;font-weight:700;
    font-family:monospace;letter-spacing:.5px;font-size:13px;}
  .ac-discount-copy{flex-shrink:0;background:var(--ab);color:var(--abt);border:none;border-radius:10px;
    padding:7px 12px;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;transition:background .15s;}
  .ac-discount-copy:hover{background:var(--abd);}

  /* Testimonial */
  .ac-testimonial{background:var(--bg3);border-left:3px solid var(--ab);border-radius:12px;
    padding:12px 14px;align-self:flex-start;max-width:90%;animation:_afad .3s ease;}
  .ac-test-quote{font-size:13px;color:var(--text);font-style:italic;line-height:1.55;margin-bottom:6px;}
  .ac-test-author{font-size:11.5px;color:var(--text2);font-weight:600;}

  /* NPS survey */
  .ac-nps-card{background:var(--bot);border-radius:16px;padding:16px;align-self:flex-start;
    box-shadow:0 2px 8px var(--sh);animation:_afad .25s ease;max-width:94%;}
  .ac-nps-card p{font-size:13px;color:var(--text);margin:0 0 10px;line-height:1.5;}
  .ac-nps-scale{display:flex;flex-wrap:wrap;gap:4px;margin-bottom:10px;}
  .ac-nps-btn{width:30px;height:30px;border:1.5px solid var(--border);border-radius:8px;background:var(--bg2);
    color:var(--text);font-size:12px;cursor:pointer;font-family:inherit;transition:all .15s;}
  .ac-nps-btn:hover,.ac-nps-btn.selected{background:var(--ab);color:var(--abt);border-color:var(--ab);}
  .ac-nps-comment{width:100%;border:1.5px solid var(--border);border-radius:10px;padding:8px 12px;
    font-size:12.5px;resize:none;height:52px;background:var(--inp);color:var(--text);
    font-family:inherit;outline:none;margin-bottom:8px;}
  .ac-nps-comment:focus{border-color:var(--ab);}
  .ac-nps-row{display:flex;gap:8px;}
  .ac-nps-submit{flex:1;padding:8px;background:var(--ab);color:var(--abt);border:none;border-radius:10px;
    font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;transition:background .15s;}
  .ac-nps-submit:hover{background:var(--abd);}
  .ac-nps-skip{padding:8px 12px;background:none;border:1px solid var(--border);border-radius:10px;
    font-size:12.5px;color:var(--text2);cursor:pointer;font-family:inherit;}

  /* Document link */
  .ac-doc-link{display:inline-flex;align-items:center;gap:7px;background:var(--bg3);border:1.5px solid var(--border);
    color:var(--text);text-decoration:none;border-radius:12px;padding:9px 14px;font-size:13px;font-weight:600;
    align-self:flex-start;animation:_afad .3s ease;transition:all .15s;}
  .ac-doc-link:hover{border-color:var(--ab);color:var(--ab);}

  /* Video embed */
  .ac-video-wrap{align-self:flex-start;width:100%;max-width:320px;border-radius:14px;overflow:hidden;
    box-shadow:0 4px 16px var(--sh);animation:_afad .3s ease;background:#000;}
  .ac-video-frame{width:100%;height:180px;border:none;}
  .ac-video-native{width:100%;border-radius:14px;display:block;}

  @media(max-width:480px){
    #_ac-win{width:calc(100vw - 16px);height:calc(100vh - 104px);${P}:8px;bottom:82px;border-radius:18px;}
  }
  `;

  // =====================================================
  //  BUSINESS HOURS
  // =====================================================
  function isOpen24() {
    const cfg = CONFIG.businessHours;
    if (!cfg) return true;
    try {
      const tz  = CONFIG.businessTimezone;
      const now = tz ? new Date(new Date().toLocaleString('en-US', { timeZone: tz })) : new Date();
      const day = ['sun','mon','tue','wed','thu','fri','sat'][now.getDay()];
      const hrs = cfg[day];
      if (!hrs) return false;
      const h = now.getHours();
      return h >= hrs[0] && h < hrs[1];
    } catch { return true; }
  }

  // =====================================================
  //  SITE AUTO-CRAWL (background, cached per session)
  // =====================================================
  let siteKnowledge = '';

  async function crawlSite() {
    if (!CONFIG.autoLearnSite) return;
    const key = '_ac_site_v1';
    const cached = sessionStorage.getItem(key);
    if (cached) { siteKnowledge = cached; return; }

    const urls = [...new Set(
      Array.from(document.querySelectorAll('a[href]'))
        .map(a => { try { return new URL(a.href); } catch { return null; } })
        .filter(u => u && u.origin === window.location.origin && !/\.(pdf|jpg|png|gif|zip|mp4|svg|css|js)/i.test(u.pathname))
        .map(u => u.origin + u.pathname)
    )].slice(0, 8);

    const pages = await Promise.allSettled(urls.map(async url => {
      const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
      const html = await res.text();
      const doc  = new DOMParser().parseFromString(html, 'text/html');
      doc.querySelectorAll('script,style,nav,footer,#_ac-w,noscript,aside').forEach(n => n.remove());
      const text = doc.body?.innerText.replace(/\s+/g,' ').trim().slice(0, 600);
      return text ? `[${doc.title}](${url}): ${text}` : null;
    }));

    siteKnowledge = pages.filter(r => r.status==='fulfilled' && r.value).map(r => r.value).join('\n---\n').slice(0, 4000);
    try { sessionStorage.setItem(key, siteKnowledge); } catch {}
  }

  // =====================================================
  //  FAQ FETCH FROM SERVER
  // =====================================================
  async function fetchServerFAQs() {
    try {
      const faqs = await (await fetch(FAQS_URL)).json();
      faqs.forEach(({ question, answer }) => { CONFIG.canned[question.toLowerCase()] = answer; });
    } catch {}
  }

  // =====================================================
  //  ANALYTICS EVENTS (GA4 + Facebook Pixel + TikTok)
  // =====================================================
  function trackEvent(eventName, params = {}) {
    try { if (typeof gtag === 'function') gtag('event', eventName, { send_to: CONFIG.gaId || undefined, ...params }); } catch {}
    try { if (typeof fbq  === 'function' && CONFIG.fbPixel) fbq('trackCustom', eventName, params); } catch {}
    try { if (typeof ttq  === 'function' && CONFIG.tikTokPixel) ttq.track(eventName, params); } catch {}
  }

  // =====================================================
  //  A/B TEST VARIANT SELECTION
  // =====================================================
  function selectABVariant() {
    if (!CONFIG.abTest?.variants?.length) return;
    const k = '_ac_ab_variant';
    let saved = sessionStorage.getItem(k);
    if (!saved) {
      const idx = Math.floor(Math.random() * CONFIG.abTest.variants.length);
      saved = String(idx); sessionStorage.setItem(k, saved);
    }
    abVariant = CONFIG.abTest.variants[parseInt(saved, 10)];
    if (!abVariant) return;
    if (abVariant.accentColor) { CONFIG.accentColor = abVariant.accentColor; CONFIG.accentDark = abVariant.accentColor; }
    if (abVariant.botName)       CONFIG.botName       = abVariant.botName;
    if (abVariant.welcomeMessage) CONFIG.welcomeMessage = abVariant.welcomeMessage;
    try { fetch(AB_URL, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ variant: abVariant.name || saved, sessionId: SESSION_ID, event: 'impression' }) }); } catch {}
  }

  // =====================================================
  //  JOURNEY TRACKING
  // =====================================================
  function trackJourney() {
    journey.push({ url: window.location.href, title: document.title, at: Date.now() });
    try { sessionStorage.setItem('_ac_journey', JSON.stringify(journey.slice(-10))); } catch {}
  }

  // =====================================================
  //  SENTIMENT ANALYSIS (keyword-based)
  // =====================================================
  const FRUSTRATION_RE = /\b(terrible|awful|horrible|hate|useless|broken|stupid|ridiculous|disappointed|frustrated|angry|worst|scam|garbage|rip.?off|waste|refund|cancel)\b/i;
  const POSITIVE_RE    = /\b(great|amazing|love|excellent|perfect|fantastic|brilliant|awesome|helpful|thanks|thank you)\b/i;

  function analyzeSentiment(text) {
    if (FRUSTRATION_RE.test(text)) { sentimentScore = Math.max(sentimentScore - 2, -10); return 'frustrated'; }
    if (POSITIVE_RE.test(text))    { sentimentScore = Math.min(sentimentScore + 1,  10);  return 'positive'; }
    return 'neutral';
  }

  // =====================================================
  //  BUYING INTENT + DISCOUNT CODE
  // =====================================================
  const BUYING_RE = /\b(price|pricing|cost|how much|buy|purchase|order|checkout|discount|deal|offer|affordable|expensive|budget|payment|pay|subscribe|plan|plans|package|get started|sign up|upgrade)\b/i;

  function checkBuyingIntent(text) {
    if (!CONFIG.discountCode || discountShown) return false;
    if (BUYING_RE.test(text)) { buyingIntentScore++; if (buyingIntentScore >= 2) return true; }
    return false;
  }

  function showDiscount() {
    discountShown = true;
    const card = document.createElement('div'); card.className = 'ac-discount-card';
    card.innerHTML = `<div class="ac-discount-icon">🎁</div><div class="ac-discount-body"><strong>Exclusive offer!</strong><p>Use code <span class="ac-code">${CONFIG.discountCode}</span> at checkout.</p></div><button class="ac-discount-copy">Copy code</button>`;
    insertBefore(card); scrollBottom();
    card.querySelector('.ac-discount-copy').onclick = () => {
      navigator.clipboard?.writeText(CONFIG.discountCode).catch(() => {});
      card.querySelector('.ac-discount-copy').textContent = 'Copied! ✓';
      sounds.success(); floatEmoji('🎁', card);
      trackEvent('discount_copied', { code: CONFIG.discountCode });
    };
    sounds.success(); trackEvent('discount_shown', { code: CONFIG.discountCode });
  }

  // =====================================================
  //  OBJECTION HANDLING
  // =====================================================
  function checkObjection(text) {
    const lower = text.toLowerCase();
    for (const [kw, resp] of Object.entries(CONFIG.objections)) {
      if (lower.includes(kw.toLowerCase())) return resp;
    }
    return null;
  }

  // =====================================================
  //  COMPETITOR DETECTION
  // =====================================================
  function checkCompetitor(text) {
    if (!CONFIG.competitors.length) return false;
    const lower = text.toLowerCase();
    return CONFIG.competitors.some(c => lower.includes(c.toLowerCase()));
  }

  // =====================================================
  //  SOCIAL PROOF / TESTIMONIAL INJECTION
  // =====================================================
  function maybeShowTestimonial() {
    if (!CONFIG.testimonials.length || testimonialShown || botMsgs !== 4) return;
    testimonialShown = true;
    const t = CONFIG.testimonials[Math.floor(Math.random() * CONFIG.testimonials.length)];
    const card = document.createElement('div'); card.className = 'ac-testimonial';
    card.innerHTML = `<div class="ac-test-quote">"${t.text}"</div><div class="ac-test-author">— ${t.author}${t.role ? `, ${t.role}` : ''} ⭐⭐⭐⭐⭐</div>`;
    insertBefore(card); scrollBottom();
  }

  // =====================================================
  //  LIVE CHAT POLLING
  // =====================================================
  function startHandoffPoll(id) {
    handoffId = id; handoffActive = true;
    let lastMsgCount = 0;
    makeBotBubble('✦ You\'re connected to a live agent! They\'ll be right with you 👋');
    sounds.pop(); addTimestamp(); scrollBottom();

    handoffPollTimer = setInterval(async () => {
      try {
        const res = await fetch(`${HANDOFF_URL}/${id}`);
        if (!res.ok) return;
        const data = await res.json();
        const agentMsgs = (data.messages || []).filter(m => m.role === 'agent');
        if (agentMsgs.length > lastMsgCount) {
          agentMsgs.slice(lastMsgCount).forEach(m => {
            makeBotBubble(`👤 ${m.text}`); sounds.pop(); addTimestamp(); scrollBottom();
          });
          lastMsgCount = agentMsgs.length;
        }
        if (data.status === 'closed') {
          clearInterval(handoffPollTimer); handoffActive = false;
          makeBotBubble('✦ The live chat session has ended. Anything else I can help with? 😊');
          sounds.pop(); addTimestamp(); scrollBottom();
        }
      } catch {}
    }, 3000);
  }

  // =====================================================
  //  NPS SURVEY
  // =====================================================
  function showNPS() {
    if (npsShown || !CONFIG.npsEnabled || botMsgs < CONFIG.npsAfter) return;
    npsShown = true;
    const card = document.createElement('div'); card.className = 'ac-nps-card';
    card.innerHTML = `
      <p>How likely are you to recommend us? (0 = not at all, 10 = definitely)</p>
      <div class="ac-nps-scale">${Array.from({length:11},(_,i)=>`<button class="ac-nps-btn" data-v="${i}">${i}</button>`).join('')}</div>
      <textarea class="ac-nps-comment" placeholder="Any feedback? (optional)"></textarea>
      <div class="ac-nps-row">
        <button class="ac-nps-submit">Submit ✓</button>
        <button class="ac-nps-skip">Skip</button>
      </div>`;
    insertBefore(card); scrollBottom();

    let selectedScore = null;
    card.querySelectorAll('.ac-nps-btn').forEach(b => {
      b.onclick = () => {
        card.querySelectorAll('.ac-nps-btn').forEach(x => x.classList.remove('selected'));
        b.classList.add('selected'); selectedScore = +b.dataset.v;
      };
    });
    card.querySelector('.ac-nps-submit').onclick = async () => {
      if (selectedScore === null) return;
      const comment = card.querySelector('.ac-nps-comment').value.trim();
      card.remove();
      try { fetch(BASE + '/api/nps', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ score: selectedScore, comment, sessionId: SESSION_ID, page: document.title }) }); } catch {}
      trackEvent('nps_submitted', { score: selectedScore });
      if (selectedScore >= 9) { confetti({ count: 60, y: 0.5 }); sounds.celebrate(); makeBotBubble('You\'re a legend! 🙏✦ Thank you so much!'); }
      else if (selectedScore <= 6) makeBotBubble('Thanks for being honest 🙏 We\'ll use that to improve!');
      else makeBotBubble('Thank you for the feedback! ✦ Really appreciate it.');
      sounds.pop(); addTimestamp(); scrollBottom();
    };
    card.querySelector('.ac-nps-skip').onclick = () => card.remove();
  }

  // =====================================================
  //  BOOKING FLOW
  // =====================================================
  let bookingState = null; // null | { step:'name'|'email'|'datetime'|'notes'|'confirm', data:{} }

  async function startBooking() {
    bookingState = { step: 'name', data: {} };
    if (userName) {
      bookingState.data.name = userName;
      bookingState.step = 'datetime';
      await delay(300);
      makeBotBubble(`Great! 📅 What date and time works for you, ${userName}?\n(e.g. "Tuesday 2pm" or "next Friday morning")`);
    } else {
      await delay(300);
      makeBotBubble("Sure thing! 📅 Let me get a few details. What's your name?");
    }
    sounds.pop(); addTimestamp(); scrollBottom();
  }

  async function handleBookingStep(text) {
    addUserMessage(text);
    const step = bookingState.step;
    if (step === 'name') {
      bookingState.data.name = text.trim();
      bookingState.step = 'datetime';
      await delay(350);
      makeBotBubble(`Nice to meet you, ${bookingState.data.name}! 😊\nWhat date and time works for you? (e.g. "Tuesday 2pm")`);
    } else if (step === 'datetime') {
      bookingState.data.datetime = text.trim();
      bookingState.step = 'email';
      await delay(350);
      makeBotBubble(`Perfect — ${text}. And what's the best email to confirm with? 📧`);
    } else if (step === 'email') {
      if (!text.includes('@')) { makeBotBubble("Hmm, that doesn't look right — can you double-check your email? 😊"); sounds.pop(); addTimestamp(); scrollBottom(); return; }
      bookingState.data.email = text.trim();
      bookingState.step = 'confirm';
      const d = bookingState.data;
      await delay(350);
      makeBotBubble(`Almost done! Here's what I've got:\n\n📋 Name: ${d.name}\n📅 Time: ${d.datetime}\n📧 Email: ${d.email}\n\nShall I send this through?`);
      setTimeout(() => { renderQuickReplies(['✓ Yes, book it!', '✕ Cancel']); }, 100);
    } else if (step === 'confirm') {
      if (/yes|book|confirm|✓/i.test(text)) {
        const d = bookingState.data;
        bookingState = null;
        try {
          await fetch(BOOK_URL, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({
            ...d, sessionId: SESSION_ID, page: document.title, url: window.location.href,
            ownerEmail: CONFIG.ownerEmail, ownerName: CONFIG.ownerName,
            siteName:   CONFIG.siteName || document.title, botName: CONFIG.botName,
          }) });
        } catch {}
        await delay(350);
        const msg = CONFIG.booking?.confirmMsg || "You're all booked in ✦ We'll be in touch to confirm!";
        makeBotBubble(`Done! 🎉 ${msg}`);
        sounds.celebrate(); confetti({ count: 60, y: 0.6 });
      } else {
        bookingState = null;
        await delay(350);
        makeBotBubble("No problem at all! Is there anything else I can help with? 😊");
        sounds.pop();
      }
    }
    addTimestamp(); scrollBottom();
  }

  // =====================================================
  //  BUILD DOM
  // =====================================================
  function buildWidget() {
    const style = document.createElement('style');
    style.textContent = STYLES; document.head.appendChild(style);

    const root = document.createElement('div'); root.id = '_ac-w';
    const hasVoice = CONFIG.voiceInputEnabled &&
      ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

    root.innerHTML = `
      <button id="_ac-btn" aria-label="Open chat">
        <span id="_ac-btn-icon">💬</span>
      </button>
      <div id="_ac-win" role="dialog" aria-label="Chat with ${CONFIG.botName}">
        <div id="_ac-hdr">
          <div id="_ac-av-wrap">
            <div id="_ac-av" title="Click me! 😄">${CONFIG.botAvatar}</div>
            <div id="_ac-dot"></div>
          </div>
          <div id="_ac-info">
            <div id="_ac-name">${CONFIG.botName}</div>
            <div id="_ac-sub">${getBotMood().emoji} ${getBotMood().label}</div>
          </div>
          <div id="_ac-streak"></div>
          <div id="_ac-hdr-btns">
            <button class="ac-hbtn" id="_ac-menu-btn" title="Options">⋯</button>
            <button class="ac-hbtn" id="_ac-close">✕</button>
          </div>
        </div>
        <div id="_ac-menu">
          <button class="ac-mi" id="_ac-exp">📄 Export chat</button>
          <button class="ac-mi" id="_ac-clr">🗑 Clear chat</button>
          <button class="ac-mi" id="_ac-sound-toggle">🔊 Sound on</button>
        </div>
        <div id="_ac-msgs">
          <div id="_ac-typing">
            <div id="_ac-ttext"></div>
            <div id="_ac-tdots"><span></span><span></span><span></span></div>
          </div>
        </div>
        <div id="_ac-toast"></div>
        <div id="_ac-inp-area">
          <button id="_ac-mic" class="${hasVoice ? '' : 'hide'}" aria-label="Voice input">🎙</button>
          <textarea id="_ac-inp" placeholder="Message ${CONFIG.botName}..." rows="1" aria-label="Chat input"></textarea>
          <button id="_ac-send" aria-label="Send" disabled>➤</button>
        </div>
        ${CONFIG.gdprEnabled ? `
        <div id="_ac-gdpr">
          <p>By chatting you agree to our ${CONFIG.gdprPrivacyUrl ? `<a href="${CONFIG.gdprPrivacyUrl}" target="_blank">Privacy Policy</a>` : 'Privacy Policy'}. This conversation may be stored to help you.</p>
          <button id="_ac-gdpr-btn">I agree — start chatting ✦</button>
        </div>` : ''}
        ${CONFIG.whiteLabelMode ? '' : '<div id="_ac-power">Powered by AI ✦</div>'}
      </div>`;
    document.body.appendChild(root);
  }

  // =====================================================
  //  STATE
  // =====================================================
  const LS_HIST    = '_ac_hist_v4', LS_LEAD = '_ac_lead', LS_NAME = '_ac_name', LS_GDPR = '_ac_gdpr';

  let isOpen = false, isBusy = false, hasOpened = false;
  let botMsgs = 0, msgStreak = 0, leadDone = false, ratingShown = false, menuOpen = false;
  let awaitingName = false, gdprConsented = !!localStorage.getItem(LS_GDPR);
  let userName = localStorage.getItem(LS_NAME) || '';
  let inactTimer = null, history = [];
  let abVariant = null, buyingIntentScore = 0, sentimentScore = 0;
  let handoffId = null, handoffPollTimer = null, handoffActive = false;
  let npsShown = false, discountShown = false, testimonialShown = false;
  // Journey: pages visited this session before/during chat
  const journey = JSON.parse(sessionStorage.getItem('_ac_journey') || '[]');
  // Visit count across sessions (return visitor detection)
  const visitCount = (() => {
    const k = '_ac_visits', n = parseInt(localStorage.getItem(k) || '0') + 1;
    localStorage.setItem(k, String(n)); return n;
  })();

  function loadHistory() {
    if (!CONFIG.persistHistory) return null;
    try {
      const d = JSON.parse(localStorage.getItem(LS_HIST) || 'null');
      if (d) { history = d.history || []; botMsgs = d.botMsgs || 0; leadDone = !!localStorage.getItem(LS_LEAD); }
      return d;
    } catch { return null; }
  }
  function saveHistory() {
    if (!CONFIG.persistHistory) return;
    try { localStorage.setItem(LS_HIST, JSON.stringify({ history, botMsgs, ts: Date.now() })); } catch {}
  }
  function clearHistory() {
    history = []; botMsgs = 0; msgStreak = 0; hasOpened = false;
    localStorage.removeItem(LS_HIST);
  }

  // =====================================================
  //  HELPERS
  // =====================================================
  const el  = id => document.getElementById(id);
  const typ = ()  => el('_ac-typing');
  const msgs = () => el('_ac-msgs');
  function scrollBottom() { const m = msgs(); m.scrollTop = m.scrollHeight; }
  function timeStr() { return new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }); }
  function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

  function toast(text, duration = 1800) {
    const t = el('_ac-toast'); t.textContent = text;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), duration);
  }

  // =====================================================
  //  PAGE CONTEXT
  // =====================================================
  function getPageContent() {
    try {
      const clone = document.body.cloneNode(true);
      clone.querySelectorAll('script,style,nav,footer,#_ac-w,noscript').forEach(n => n.remove());
      return clone.innerText.replace(/\s+/g,' ').trim().slice(0, 2000);
    } catch { return ''; }
  }

  function getHandoffInfo() {
    const lines = [];
    if (CONFIG.handoffUrl)   lines.push(`Book a call: ${CONFIG.handoffUrl}`);
    if (CONFIG.handoffWa)    lines.push(`WhatsApp: https://wa.me/${CONFIG.handoffWa.replace(/\D/g,'')}`);
    if (CONFIG.handoffEmail) lines.push(`Email: ${CONFIG.handoffEmail}`);
    return lines.length ? lines.join('\n') : 'No handoff configured.';
  }

  function buildSystemPrompt() {
    const mood    = getBotMood();
    const userLang = navigator.language || 'en';
    const open    = isOpen24();

    const productInfo = CONFIG.products.length
      ? '\nPRODUCTS/SERVICES (recommend based on context):\n' +
        CONFIG.products.map(p => `- ${p.name}: ${p.desc}${p.price ? ` | ${p.price}` : ''}${p.url ? ` | ${p.url}` : ''}`).join('\n')
      : '';

    const bookingInfo = CONFIG.booking
      ? `\nBOOKING: If user wants to book/schedule, output exactly: ::BOOKING\nOwner: ${CONFIG.booking.ownerName || 'the team'}`
      : '';

    const hoursInfo = CONFIG.businessHours
      ? `\nBUSINESS STATUS: Currently ${open ? 'OPEN' : 'CLOSED'}. ${!open ? CONFIG.businessClosedMsg : ''}`
      : '';

    const sentimentCtx = sentimentScore <= -4
      ? '\nUSER SENTIMENT: Frustrated. Be extra empathetic, skip humour, focus on solving fast.'
      : sentimentScore >= 4 ? '\nUSER SENTIMENT: Positive/happy. Match their energy!' : '';

    const journeyCtx = journey.length > 1
      ? `\nUSER JOURNEY: Visited ${journey.length} pages: ${journey.map(j => j.title || j.url).slice(-4).join(' → ')}`
      : '';

    const returnCtx = visitCount > 1
      ? `\nRETURN VISITOR: This is visit #${visitCount}. If greeting, say "great to see you again" or similar.`
      : '';

    const competitorCtx = CONFIG.competitors.length
      ? `\nCOMPETITORS: If user mentions ${CONFIG.competitors.join(', ')}, acknowledge their research positively, highlight what makes us uniquely better — never trash-talk competitors.`
      : '';

    const discountCtx = CONFIG.discountCode && !discountShown
      ? `\nDISCOUNT: Available code "${CONFIG.discountCode}" — a discount card will appear automatically on buying intent. Do NOT mention the code verbally.`
      : '';

    return `
You are ${CONFIG.botName}, a sharp, friendly, and slightly witty AI assistant on a website.
${userName ? `The user's name is ${userName}. Use their name occasionally — it feels personal and warm.` : ''}

PERSONALITY & MOOD (current: ${mood.vibe}):
- Warm, confident, slightly playful. Cool friend energy, not corporate.
- 1-2 emoji per message. Never zero. Never overwhelming.
- Light humour when fitting. Never joke when someone is frustrated.

COMMUNICATION:
- 2-3 sentences max. Concise and punchy. No bullet points.
- Always end with a question or next step.
- Respond in the user's language if possible (browser lang: ${userLang}).

PAGE CONTEXT:
Page: ${document.title} | URL: ${window.location.href} | Referrer: ${document.referrer || 'Direct'}
${hoursInfo}${sentimentCtx}${journeyCtx}${returnCtx}${competitorCtx}${discountCtx}
${productInfo}
${bookingInfo}

FULL SITE KNOWLEDGE BASE:
${siteKnowledge || getPageContent()}

HUMAN HANDOFF (output ::HANDOFF when user wants a real person):
${getHandoffInfo()}

RICH RESPONSES (use inline when genuinely helpful):
- ::BUTTON[Label](message to send)
- ::HANDOFF
- ::IMAGE[url]
- ::VIDEO[youtube-or-video-url]
- ::DOCUMENT[url|Friendly filename]
- ::BOOKING — triggers in-chat booking form

FOLLOW-UPS (required after every response):
FOLLOWUPS: [Short question?] | [Short question?] | [Short question?]
${CONFIG.customPrompt ? '\n' + CONFIG.customPrompt : ''}`.trim();
  }

  // =====================================================
  //  CANNED RESPONSES
  // =====================================================
  function checkCanned(text) {
    const lower = text.toLowerCase();
    for (const [k, v] of Object.entries(CONFIG.canned)) {
      if (lower.includes(k.toLowerCase())) return v;
    }
    return null;
  }

  // =====================================================
  //  EASTER EGGS
  // =====================================================
  function checkEasterEgg(text) {
    if (!CONFIG.easterEggsEnabled) return null;
    const lower = text.toLowerCase().trim();
    for (const [trigger, response] of Object.entries(EGGS)) {
      if (lower.includes(trigger)) {
        if (Array.isArray(response)) return response;
      }
    }
    return null;
  }

  // =====================================================
  //  SMART MODEL SELECTION
  // =====================================================
  function selectModel(text) {
    if (!CONFIG.useSmartModel) return CONFIG.baseModel;
    const complex = text.trim().split(/\s+/).length > 20 ||
      /\b(explain|compare|difference|how does|why|recommend|best|pros|cons|should i|versus|\bvs\b|analyse|analyze|strategy)\b/i.test(text);
    return complex ? CONFIG.smartModel : CONFIG.baseModel;
  }

  // =====================================================
  //  RICH RESPONSE PARSER
  // =====================================================
  function parseRich(text) {
    const richBtns = [], richImgs = [], richDocs = [], richVideos = [];
    let showHandoff = false;
    text = text.replace(/::BUTTON\[([^\]]+)\]\(([^)]+)\)/g, (_, l, a) => { richBtns.push({ label: l, action: a }); return ''; });
    text = text.replace(/::IMAGE\[([^\]]+)\]/g,             (_, u) => { richImgs.push(u.trim()); return ''; });
    text = text.replace(/::DOCUMENT\[([^\]]+)\]/g, (_, u) => {
      const [url, name] = u.split('|'); richDocs.push({ url: url.trim(), name: (name || 'Download document').trim() }); return '';
    });
    text = text.replace(/::VIDEO\[([^\]]+)\]/g, (_, u) => { richVideos.push(u.trim()); return ''; });
    if (/::HANDOFF/.test(text)) { showHandoff = true; text = text.replace(/::HANDOFF/g, ''); }
    if (/::BOOKING/.test(text) && CONFIG.booking) {
      text = text.replace(/::BOOKING/g, '');
      setTimeout(() => startBooking(), 400);
    }
    return { text: text.trim(), richBtns, richImgs, richDocs, richVideos, showHandoff };
  }

  function parseFollowups(text) {
    const m = text.match(/\nFOLLOWUPS:\s*(.+)$/m);
    if (!m) return { clean: text, followups: [] };
    const clean = text.replace(/\nFOLLOWUPS:\s*.+$/m, '').trim();
    const followups = m[1].split('|').map(s => s.replace(/^\[|\]$/g,'').trim()).filter(Boolean).slice(0,3);
    return { clean, followups };
  }

  // =====================================================
  //  RENDERING
  // =====================================================
  function insertBefore(node) { msgs().insertBefore(node, typ()); }

  function addUserMessage(text) {
    const d = document.createElement('div');
    d.className = 'ac-msg user'; d.textContent = text;
    insertBefore(d); scrollBottom();
  }

  function addTimestamp() {
    const d = document.createElement('div');
    d.className = 'ac-time'; d.textContent = timeStr();
    insertBefore(d);
  }

  function makeBotBubble(text = '', animate = true) {
    const d = document.createElement('div');
    d.className = 'ac-msg bot'; d.textContent = text;
    if (!animate) d.style.animation = 'none';
    insertBefore(d); return d;
  }

  function addReactions(bubbleEl) {
    const bar = document.createElement('div'); bar.className = 'ac-reactions';
    ['👍','❤️','😄','🔥'].forEach(e => {
      const b = document.createElement('button'); b.className = 'ac-rbtn'; b.textContent = e;
      b.onclick = () => {
        sounds.click();
        const wasOn = b.classList.contains('on');
        b.classList.toggle('on');
        if (!wasOn) floatEmoji(e, b);
      };
      bar.appendChild(b);
    });
    insertBefore(bar);
  }

  function renderFollowups(questions) {
    if (!CONFIG.suggestedFollowups || !questions.length) return;
    const wrap = document.createElement('div'); wrap.className = 'ac-fu-wrap';
    questions.forEach(q => {
      const b = document.createElement('button'); b.className = 'ac-fu'; b.textContent = q;
      b.onclick = () => { wrap.remove(); sendMessage(q); };
      wrap.appendChild(b);
    });
    insertBefore(wrap); scrollBottom();
  }

  function renderQuickReplies(replies) {
    const wrap = document.createElement('div'); wrap.className = 'ac-qr-wrap';
    replies.forEach(label => {
      const b = document.createElement('button'); b.className = 'ac-qr'; b.textContent = label;
      b.onclick = () => { wrap.remove(); sendMessage(label); };
      wrap.appendChild(b);
    });
    insertBefore(wrap); scrollBottom();
  }

  function renderRichElements({ richBtns, richImgs, richDocs, richVideos, showHandoff }) {
    richImgs.forEach(url => {
      const img = document.createElement('img'); img.src = url; img.className = 'ac-img'; img.alt = '';
      insertBefore(img);
    });
    richVideos.forEach(url => {
      const wrap = document.createElement('div'); wrap.className = 'ac-video-wrap';
      // Support YouTube/Vimeo embeds or raw video files
      if (/youtube\.com|youtu\.be|vimeo\.com/i.test(url)) {
        let embedUrl = url;
        if (/youtu\.be\//.test(url)) embedUrl = `https://www.youtube.com/embed/${url.split('/').pop()}`;
        else if (/youtube\.com\/watch/.test(url)) embedUrl = `https://www.youtube.com/embed/${new URL(url).searchParams.get('v')}`;
        else if (/vimeo\.com\/(\d+)/.test(url)) embedUrl = `https://player.vimeo.com/video/${url.match(/vimeo\.com\/(\d+)/)[1]}`;
        const iframe = document.createElement('iframe');
        iframe.src = embedUrl; iframe.className = 'ac-video-frame';
        iframe.setAttribute('allowfullscreen',''); iframe.setAttribute('allow','autoplay; encrypted-media');
        wrap.appendChild(iframe);
      } else {
        const vid = document.createElement('video'); vid.src = url; vid.controls = true; vid.className = 'ac-video-native';
        wrap.appendChild(vid);
      }
      insertBefore(wrap);
    });
    richDocs.forEach(({ url, name }) => {
      const a = document.createElement('a'); a.href = url; a.target = '_blank'; a.rel = 'noopener';
      a.className = 'ac-doc-link'; a.innerHTML = `📄 ${name}`;
      insertBefore(a);
      trackEvent('document_opened', { name });
    });
    if (richBtns.length) {
      const wrap = document.createElement('div'); wrap.className = 'ac-rich-btns';
      richBtns.forEach(({ label, action }) => {
        const b = document.createElement('button'); b.className = 'ac-rich-btn'; b.textContent = label;
        b.onclick = () => { wrap.remove(); sendMessage(action); };
        wrap.appendChild(b);
      });
      insertBefore(wrap);
    }
    if (showHandoff) {
      if (CONFIG.liveHandoff) {
        // Create server-side handoff session
        fetch(HANDOFF_URL, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ sessionId: SESSION_ID, page: document.title, url: window.location.href, ownerEmail: CONFIG.ownerEmail, siteName: CONFIG.siteName || document.title }) })
          .then(r => r.json()).then(d => { if (d.id) startHandoffPoll(d.id); }).catch(() => renderHandoffCard());
      } else {
        renderHandoffCard();
      }
    }
  }

  function renderHandoffCard() {
    const card = document.createElement('div'); card.className = 'ac-handoff';
    card.innerHTML = `<p>Here's the best way to reach a real person ✦</p><div class="ac-handoff-btns"></div>`;
    const btns = card.querySelector('.ac-handoff-btns');
    if (CONFIG.handoffUrl) {
      const a = document.createElement('a'); a.href = CONFIG.handoffUrl; a.target = '_blank'; a.rel = 'noopener'; a.className = 'ac-ho ac-ho-cal'; a.innerHTML = '📅 Book a call'; btns.appendChild(a);
    }
    if (CONFIG.handoffWa) {
      const a = document.createElement('a'); a.href = `https://wa.me/${CONFIG.handoffWa.replace(/\D/g,'')}`; a.target = '_blank'; a.rel = 'noopener'; a.className = 'ac-ho ac-ho-wa'; a.innerHTML = '💬 WhatsApp'; btns.appendChild(a);
    }
    if (CONFIG.handoffEmail) {
      const a = document.createElement('a'); a.href = `mailto:${CONFIG.handoffEmail}`; a.className = 'ac-ho ac-ho-em'; a.innerHTML = '📧 Send email'; btns.appendChild(a);
    }
    if (!btns.children.length) card.querySelector('p').textContent = "No contact options yet — but ask me anything! 😊";
    insertBefore(card); scrollBottom();
  }

  // =====================================================
  //  DELIVER RESPONSE (render parsed content)
  // =====================================================
  function deliverResponse(fullText) {
    const { clean: withRich, followups } = parseFollowups(fullText);
    const { text, richBtns, richImgs, showHandoff } = parseRich(withRich);

    if (CONFIG.multiBubble) {
      const parts = text.split(/\n\n+/).map(s => s.trim()).filter(Boolean);
      parts.forEach(p => makeBotBubble(p));
    } else {
      makeBotBubble(text);
    }

    renderRichElements({ richBtns, richImgs, showHandoff });
    addReactions();
    sounds.pop();
    addTimestamp();
    renderFollowups(followups);
    scrollBottom();
    return text;
  }

  // =====================================================
  //  STREAMING RESPONSE
  // =====================================================
  async function streamResponse(messages, model) {
    const bubble = makeBotBubble(''); bubble.classList.add('stream');
    let fullText = '';
    try {
      const res = await fetch(STREAM_URL, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ system: buildSystemPrompt(), messages, model, max_tokens: 500, sessionId: SESSION_ID }),
      });
      if (!res.ok) throw new Error();
      const reader = res.body.getReader(), decoder = new TextDecoder();
      let buf = '';
      while (true) {
        const { done, value } = await reader.read(); if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split('\n'); buf = lines.pop();
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const raw = line.slice(6).trim(); if (raw === '[DONE]') break;
          try {
            const c = JSON.parse(raw); if (c.error) throw new Error(c.error);
            if (c.text) { fullText += c.text; bubble.textContent = fullText.replace(/\nFOLLOWUPS:.*$/m,''); scrollBottom(); }
          } catch (e) { if (e.message && !e.message.includes('JSON')) throw e; }
        }
      }
    } catch { bubble.classList.remove('stream'); bubble.textContent = "Something went wrong 😅 Try again?"; return ''; }
    bubble.classList.remove('stream'); bubble.remove();
    return fullText;
  }

  async function standardResponse(messages, model) {
    const res = await fetch(PROXY_URL, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ system: buildSystemPrompt(), messages, model, max_tokens: 500, sessionId: SESSION_ID }),
    });
    if (!res.ok) throw new Error();
    const data = await res.json(); return data.content[0].text;
  }

  // =====================================================
  //  STREAK CHECK
  // =====================================================
  function checkStreak() {
    if (!CONFIG.streakEnabled) return;
    const label = STREAK_MILESTONES[msgStreak];
    if (!label) return;
    const streak = el('_ac-streak');
    streak.textContent = label; streak.classList.add('show');
    toast(label + ' 🎉');
    confetti({ count: 60, y: 0.5 });
    sounds.celebrate();
    setTimeout(() => streak.classList.remove('show'), 3000);
  }

  // =====================================================
  //  SEND MESSAGE
  // =====================================================
  async function sendMessage(text) {
    if (!text.trim() || isBusy) return;

    // GDPR gate
    if (CONFIG.gdprEnabled && !gdprConsented) return;

    // Booking flow intercept
    if (bookingState) { el('_ac-inp').value = ''; el('_ac-inp').style.height = 'auto'; el('_ac-send').disabled = true; await handleBookingStep(text); el('_ac-send').disabled = !el('_ac-inp').value.trim(); return; }

    resetInactivity(); sounds.send();

    const inp = el('_ac-inp');
    el('_ac-send').disabled = true;

    // Name capture flow
    if (awaitingName) {
      awaitingName = false;
      userName = text.trim().split(' ')[0]; // first name only
      localStorage.setItem(LS_NAME, userName);
      addUserMessage(text);
      inp.value = ''; inp.style.height = 'auto';
      await delay(400);
      makeBotBubble(`Love it, ${userName}! ✦ Great to meet you. What can I help you with today?`);
      sounds.pop(); addTimestamp();
      renderQuickReplies(CONFIG.quickReplies);
      scrollBottom(); botMsgs++;
      el('_ac-send').disabled = !inp.value.trim();
      return;
    }

    // Sentiment analysis (update score before response)
    analyzeSentiment(text);

    // Easter egg check
    const egg = checkEasterEgg(text);
    if (egg) {
      addUserMessage(text); inp.value = ''; inp.style.height = 'auto';
      await delay(400);
      for (const line of egg) { makeBotBubble(line); await delay(350); }
      sounds.pop(); addTimestamp(); botMsgs++; msgStreak++;
      el('_ac-send').disabled = !inp.value.trim();
      return;
    }

    // Objection handling (instant response, no API cost)
    const objectionResp = checkObjection(text);
    if (objectionResp) {
      addUserMessage(text); inp.value = ''; inp.style.height = 'auto';
      await delay(350);
      history.push({ role: 'user', content: text });
      history.push({ role: 'assistant', content: objectionResp });
      botMsgs++; msgStreak++;
      deliverResponse(objectionResp);
      saveHistory(); maybeShowLead(); checkStreak();
      el('_ac-send').disabled = !inp.value.trim();
      return;
    }

    // Shopify order lookup intercept
    if (CONFIG.shopifyEnabled && /\border\b.*#?\d{4,}|#\d{4,}.*\border\b/i.test(text)) {
      const orderMatch = text.match(/#?(\d{4,})/);
      if (orderMatch) {
        addUserMessage(text); inp.value = ''; inp.style.height = 'auto';
        isBusy = true; typ().classList.add('show'); el('_ac-ttext').textContent = 'Looking up your order 📦';
        scrollBottom();
        try {
          const res = await fetch(`${SHOPIFY_URL}?order=${encodeURIComponent(orderMatch[1])}`);
          const data = await res.json();
          typ().classList.remove('show');
          const msg = data.error ? `Hmm — I couldn't find order #${orderMatch[1]}. Double check the number? 🔍`
            : `Here's your order #${data.name}! 📦\nStatus: ${data.fulfillment_status || 'Processing'}\nTotal: ${data.currency} ${data.total_price}\n${data.tracking_url ? `Track: ${data.tracking_url}` : ''}`;
          history.push({ role: 'user', content: text });
          history.push({ role: 'assistant', content: msg });
          botMsgs++; msgStreak++;
          deliverResponse(msg); saveHistory(); isBusy = false;
        } catch {
          typ().classList.remove('show'); isBusy = false;
          makeBotBubble("Sorry — order lookup isn't available right now 😅");
          sounds.pop(); addTimestamp(); scrollBottom();
        }
        el('_ac-send').disabled = !el('_ac-inp').value.trim();
        return;
      }
    }

    // Live handoff — relay message to agent session
    if (handoffActive && handoffId) {
      addUserMessage(text); inp.value = ''; inp.style.height = 'auto';
      try { fetch(`${HANDOFF_URL}/${handoffId}/message`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ role:'user', text }) }); } catch {}
      el('_ac-send').disabled = !inp.value.trim();
      return;
    }

    // Canned response check (instant, zero API cost)
    const canned = checkCanned(text);
    if (canned) {
      addUserMessage(text); inp.value = ''; inp.style.height = 'auto';
      await delay(300); isBusy = false;
      history.push({ role: 'user', content: text });
      history.push({ role: 'assistant', content: canned });
      botMsgs++; msgStreak++;
      deliverResponse(canned);
      saveHistory(); maybeShowLead(); checkStreak();
      el('_ac-send').disabled = !inp.value.trim();
      return;
    }

    addUserMessage(text); inp.value = ''; inp.style.height = 'auto';
    isBusy = true;
    history.push({ role: 'user', content: text });

    const model   = selectModel(text);
    const thinkTxt = nextThink();
    typ().classList.add('show');
    el('_ac-ttext').textContent = thinkTxt;
    scrollBottom();
    await delay(500 + Math.random() * 700);

    try {
      let fullText = '';
      if (CONFIG.streamingEnabled) {
        typ().classList.remove('show');
        fullText = await streamResponse([...history], model);
        if (fullText) deliverResponse(fullText);
      } else {
        fullText = await standardResponse([...history], model);
        typ().classList.remove('show');
        if (fullText) deliverResponse(fullText);
      }

      if (fullText) {
        const { clean } = parseFollowups(fullText);
        const { text: ct } = parseRich(clean);
        history.push({ role: 'assistant', content: ct });
        botMsgs++; msgStreak++;
        saveHistory(); ping(); maybeShowLead(); checkStreak();
        // Engagement extras (order matters — most impactful first)
        maybeShowTestimonial();
        if (checkBuyingIntent(text)) setTimeout(showDiscount, 600);
        showNPS();
        // Track competitor mention to system prompt (already handled via context, just flag to owner)
        if (checkCompetitor(text)) ping({ competitorMention: text.slice(0, 200) });
        // GA4 event per message
        trackEvent('chat_message_sent', { botMsgs, page: document.title });
      }
    } catch {
      typ().classList.remove('show');
      makeBotBubble("Hmm — something went wrong on my end 😅 Give it another go?");
    }

    isBusy = false;
    setTimeout(() => { if (!isBusy) el('_ac-inp').focus(); }, 100);
    el('_ac-send').disabled = !el('_ac-inp').value.trim();
  }

  // =====================================================
  //  SESSION PING
  // =====================================================
  function ping(extra = {}) {
    try {
      const payload = JSON.stringify({ sessionId: SESSION_ID, messages: history.slice(-20), page: document.title, url: window.location.href, ...extra });
      navigator.sendBeacon
        ? navigator.sendBeacon(SESSION_URL, new Blob([payload], { type: 'application/json' }))
        : fetch(SESSION_URL, { method:'POST', headers:{'Content-Type':'application/json'}, body: payload, keepalive: true });
    } catch {}
  }

  // =====================================================
  //  TOGGLE
  // =====================================================
  function toggle(open) {
    isOpen = open !== undefined ? open : !isOpen;
    el('_ac-win').classList.toggle('open', isOpen);
    el('_ac-btn').classList.toggle('open', isOpen);
    el('_ac-btn-icon').textContent = isOpen ? '✕' : '💬';
    const notif = el('_ac-btn').querySelector('#_ac-notif');
    if (notif) notif.remove();

    if (isOpen && !hasOpened) {
      hasOpened = true;
      trackEvent('chat_opened', { page: document.title, visitCount });
      try { if (typeof fbq === 'function' && CONFIG.fbPixel) fbq('trackCustom', 'ChatOpened', { page: document.title }); } catch {}
      if (abVariant) { try { fetch(AB_URL, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ variant: abVariant.name, sessionId: SESSION_ID, event: 'open' }) }); } catch {} }
      const saved = loadHistory();
      if (saved && history.length) setTimeout(restoreSession, 200);
      else setTimeout(showWelcome, 350);
    }
    if (isOpen) { closeMenu(); setTimeout(() => el('_ac-inp').focus(), 380); resetInactivity(); }
  }

  function showWelcome() {
    const pageMsg = getPageMessage();
    const refMsg  = getReferrerMessage();
    const mood    = getBotMood();
    const open    = isOpen24();

    // Show business hours badge in sub-header
    if (CONFIG.businessHours) {
      const sub = el('_ac-sub');
      if (sub) sub.innerHTML = `${mood.emoji} ${mood.label} <span id="_ac-hours-badge" class="${open ? 'hours-open' : 'hours-closed'}">${open ? 'Open' : 'Closed'}</span>`;
    }

    typ().classList.add('show');
    el('_ac-ttext').textContent = `${mood.emoji} Getting ready...`;
    scrollBottom();

    setTimeout(async () => {
      typ().classList.remove('show');

      // Business closed message
      if (!open && CONFIG.businessHours) {
        makeBotBubble(CONFIG.businessClosedMsg);
        sounds.pop(); addTimestamp(); scrollBottom(); botMsgs++;
        return;
      }

      if (CONFIG.captureNames && !userName) {
        makeBotBubble(`Hey! I'm ${CONFIG.botName} ${CONFIG.botAvatar} — before we dive in, what's your name? 😊`);
        sounds.pop(); addTimestamp(); botMsgs++;
        awaitingName = true;
      } else {
        const returnGreeting = visitCount > 1 && !userName
          ? `Great to see you again! ✦ You've visited us ${visitCount} times — what can I help you with today?`
          : null;
        const greeting = userName
          ? `Hey ${userName}! ✦ Good to have you back — what can I help with?`
          : (returnGreeting || refMsg || pageMsg || CONFIG.welcomeMessage || `Hey! I'm ${CONFIG.botName} ${CONFIG.botAvatar} — how can I help today? 😊`);
        makeBotBubble(greeting);
        sounds.pop(); addTimestamp();
        renderQuickReplies(CONFIG.quickReplies);
        botMsgs++;
      }
      scrollBottom();
    }, 1000);
  }

  function restoreSession() {
    history.forEach(msg => {
      const d = document.createElement('div');
      d.className = `ac-msg ${msg.role === 'user' ? 'user' : 'bot'}`;
      d.textContent = msg.content; d.style.animation = 'none';
      insertBefore(d);
    });
    setTimeout(() => {
      const name = userName ? `${userName}` : 'there';
      makeBotBubble(`Welcome back, ${name}! ✦ Right where we left off.`);
      sounds.pop(); scrollBottom();
    }, 250);
  }

  function getPageMessage() {
    const path = window.location.pathname;
    for (const [pat, msg] of Object.entries(CONFIG.pageMessages)) {
      if (path.includes(pat)) return msg;
    }
    return null;
  }

  function getReferrerMessage() {
    const ref = document.referrer;
    if (!ref) return null;
    if (/google\.|bing\.|yahoo\.|duckduckgo\./i.test(ref))
      return "Came via search? ✦ Tell me what you're looking for and I'll point you straight there.";
    if (/facebook\.|instagram\.|twitter\.|linkedin\.|tiktok\./i.test(ref))
      return "Hey! ✦ Saw us on social? What caught your eye?";
    return null;
  }

  // =====================================================
  //  LEAD CAPTURE
  // =====================================================
  function maybeShowLead() {
    if (!CONFIG.leadCaptureEnabled || leadDone || botMsgs !== CONFIG.leadCaptureAfter) return;
    const card = document.createElement('div'); card.id = '_ac-lead';
    const nameHook = userName ? `, ${userName}` : '';
    card.innerHTML = `
      <p>Enjoying the chat${nameHook}? Drop your email and I'll follow up 📧</p>
      <div id="_ac-lead-row">
        <input id="_ac-lead-inp" type="email" placeholder="your@email.com" />
        <button id="_ac-lead-sub">Send ✓</button>
      </div>`;
    insertBefore(card); scrollBottom();

    const submit = () => {
      const email = card.querySelector('#_ac-lead-inp').value.trim();
      if (!email || !email.includes('@')) { card.querySelector('#_ac-lead-inp').style.borderColor = '#ff4757'; return; }
      leadDone = true; localStorage.setItem(LS_LEAD, email); card.remove();
      makeBotBubble(`Got it! ✦ I'll be in touch at ${email}. You're awesome 😄`);
      sounds.celebrate(); scrollBottom();
      confetti({ count: 70, y: 0.5 });
      // Fire analytics events
      trackEvent('lead_captured', { email_domain: email.split('@')[1], page: document.title });
      try { if (typeof fbq === 'function' && CONFIG.fbPixel) fbq('track', 'Lead', { content_name: document.title }); } catch {}
      // POST to /api/lead — handles email alert, scoring, tagging, Mailchimp, abandoned recovery
      try {
        fetch(LEAD_URL, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({
          email, name: userName, sessionId: SESSION_ID,
          page: document.title, url: window.location.href, journey,
          // Multi-tenant: tell server which owner to alert
          ownerEmail:      CONFIG.ownerEmail,
          ownerName:       CONFIG.ownerName,
          siteName:        CONFIG.siteName || document.title,
          botName:         CONFIG.botName,
          followupEnabled: CONFIG.followupEnabled,
        }) });
      } catch {}
      // Track A/B variant lead conversion
      if (abVariant) { try { fetch(AB_URL, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ variant: abVariant.name, sessionId: SESSION_ID, event: 'lead' }) }); } catch {} }
      // Also fire custom webhook if configured
      if (CONFIG.webhook) {
        const payload = { email, name: userName, sessionId: SESSION_ID, page: document.title, url: window.location.href, referrer: document.referrer, capturedAt: new Date().toISOString() };
        try { navigator.sendBeacon ? navigator.sendBeacon(CONFIG.webhook, new Blob([JSON.stringify(payload)], { type:'application/json' })) : fetch(CONFIG.webhook, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) }); } catch {}
      }
    };

    card.querySelector('#_ac-lead-sub').onclick = submit;
    card.querySelector('#_ac-lead-inp').addEventListener('keydown', e => { if (e.key === 'Enter') submit(); });
  }

  // =====================================================
  //  CONVERSATION RATING
  // =====================================================
  function showRating() {
    if (ratingShown || !CONFIG.conversationRating || botMsgs < 2) { toggle(false); return; }
    ratingShown = true;
    const win = el('_ac-win');
    const box = document.createElement('div'); box.id = '_ac-rating';
    box.innerHTML = `<p>How was that? 😊</p><div id="_ac-stars">${[1,2,3,4,5].map(n=>`<span class="ac-star" data-v="${n}">⭐</span>`).join('')}</div><button id="_ac-skip-rate">Skip</button>`;
    win.appendChild(box);

    box.querySelectorAll('.ac-star').forEach(s => {
      s.addEventListener('mouseover', () => box.querySelectorAll('.ac-star').forEach((x,i) => x.classList.toggle('lit', i < +s.dataset.v)));
      s.addEventListener('click', () => {
        const rating = +s.dataset.v;
        ping({ rating });
        if (rating >= 4) { confetti({ count: 80, y: 0.7 }); sounds.celebrate(); }
        box.remove(); toggle(false);
      });
    });
    box.querySelector('#_ac-skip-rate').onclick = () => { box.remove(); toggle(false); };
  }

  // =====================================================
  //  EXPORT
  // =====================================================
  function exportChat() {
    closeMenu(); if (!history.length) return;
    const lines = [`${CONFIG.botName} Chat — ${new Date().toLocaleString()}`, '─'.repeat(50), ''];
    history.forEach(m => lines.push(`${m.role === 'user' ? 'You' : CONFIG.botName}: ${m.content}`, ''));
    const blob = new Blob([lines.join('\n')], { type:'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement('a'), { href: url, download: `chat-${Date.now()}.txt` });
    a.click(); URL.revokeObjectURL(url);
  }

  function clearChat() {
    closeMenu(); clearHistory();
    const m = msgs();
    while (m.firstChild !== typ()) m.removeChild(m.firstChild);
    botMsgs = 0; hasOpened = false; ratingShown = false; awaitingName = false;
    setTimeout(showWelcome, 200);
  }

  // =====================================================
  //  MENU
  // =====================================================
  const toggleMenu = () => { menuOpen = !menuOpen; el('_ac-menu').classList.toggle('show', menuOpen); };
  const closeMenu  = () => { menuOpen = false; el('_ac-menu').classList.remove('show'); };

  function updateSoundToggle() {
    const b = el('_ac-sound-toggle');
    if (b) b.textContent = CONFIG.soundEnabled ? '🔊 Sound on' : '🔇 Sound off';
  }

  // =====================================================
  //  VOICE INPUT
  // =====================================================
  let recog = null, listening = false;

  function initVoice() {
    const R = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!R || !CONFIG.voiceInputEnabled) return;
    recog = new R(); recog.continuous = false; recog.interimResults = true; recog.lang = 'en-US';
    recog.onresult = e => {
      const t = Array.from(e.results).map(r => r[0].transcript).join('');
      const inp = el('_ac-inp'); inp.value = t;
      inp.style.height = 'auto'; inp.style.height = Math.min(inp.scrollHeight, 90) + 'px';
      el('_ac-send').disabled = !t.trim();
    };
    const stopListening = () => {
      listening = false;
      const b = el('_ac-mic'); if (b) { b.textContent = '🎙'; b.classList.remove('on'); }
    };
    recog.onend = () => { stopListening(); const inp = el('_ac-inp'); if (inp.value.trim()) sendMessage(inp.value); };
    recog.onerror = stopListening;
  }

  function toggleVoice() {
    if (!recog) return;
    if (listening) { recog.stop(); }
    else { listening = true; const b = el('_ac-mic'); b.textContent = '⏹'; b.classList.add('on'); recog.start(); }
  }

  // =====================================================
  //  INACTIVITY / TRIGGERS
  // =====================================================
  function resetInactivity() {
    if (!CONFIG.timeTriggerEnabled || isOpen) return;
    clearTimeout(inactTimer);
    inactTimer = setTimeout(nudge, CONFIG.timeTriggerDelay);
  }

  function addNotifDot() {
    const btn = el('_ac-btn');
    if (!btn.querySelector('#_ac-notif')) {
      const d = document.createElement('div'); d.id = '_ac-notif'; btn.appendChild(d);
    }
  }

  function nudge() { if (!isOpen && !hasOpened) addNotifDot(); }

  function initTriggers() {
    if (CONFIG.exitIntentEnabled) {
      document.addEventListener('mouseleave', e => { if (e.clientY <= 0 && !isOpen && !hasOpened) toggle(true); });
    }
    if (CONFIG.scrollTriggerEnabled) {
      let fired = false;
      window.addEventListener('scroll', () => {
        if (fired || isOpen || hasOpened) return;
        if ((window.scrollY + window.innerHeight) / document.body.scrollHeight >= 0.70) { fired = true; toggle(true); }
      }, { passive: true });
    }

    setTimeout(() => { if (!isOpen && !hasOpened) addNotifDot(); }, CONFIG.notificationDelay);

    if (CONFIG.timeTriggerEnabled) {
      ['mousemove','keydown','scroll','touchstart'].forEach(e => document.addEventListener(e, resetInactivity, { passive: true }));
      resetInactivity();
    }

    CONFIG.pageTriggers.forEach(({ pattern, delay: d = 10000 }) => {
      if (window.location.pathname.includes(pattern))
        setTimeout(() => { if (!isOpen && !hasOpened) toggle(true); }, d);
    });

    document.addEventListener('click', e => {
      if (menuOpen && !el('_ac-menu').contains(e.target) && e.target.id !== '_ac-menu-btn') closeMenu();
    });
  }

  // =====================================================
  //  AVATAR EASTER EGG
  // =====================================================
  let avatarClicks = 0;
  function initAvatarEgg() {
    el('_ac-av').addEventListener('click', () => {
      avatarClicks++;
      sounds.click();
      if (avatarClicks === 5) {
        confetti({ count: 120, spread: 'full' }); sounds.celebrate();
        toast('🎉 You found a secret!');
        avatarClicks = 0;
      } else {
        floatEmoji(['✨','💫','⭐','🌟','💥'][avatarClicks - 1] || '✨', el('_ac-av'));
      }
    });
  }

  // =====================================================
  //  INIT
  // =====================================================
  function init() {
    // A/B variant selection runs before buildWidget so color/name can be overridden
    selectABVariant();
    buildWidget(); initVoice(); initTriggers(); initAvatarEgg();
    // Track this page in journey
    trackJourney();
    // Cart abandonment detection — auto-open chat if on checkout/cart page
    if (CONFIG.cartUrl && window.location.href.includes(CONFIG.cartUrl) && !isOpen && !hasOpened) {
      setTimeout(() => {
        toggle(true);
        // After welcome, override with cart-specific message
        setTimeout(() => {
          makeBotBubble(`Looks like you've got something in your cart! 🛒 Need help deciding, or want a discount code? 😊`);
          sounds.pop(); addTimestamp(); scrollBottom();
          if (CONFIG.discountCode) setTimeout(showDiscount, 1500);
        }, 1800);
      }, 3000);
    }

    // GDPR consent gate
    if (CONFIG.gdprEnabled && !gdprConsented) {
      el('_ac-inp').disabled  = true;
      el('_ac-send').disabled = true;
      const gdprBtn = el('_ac-gdpr-btn');
      if (gdprBtn) gdprBtn.onclick = () => {
        gdprConsented = true;
        localStorage.setItem(LS_GDPR, '1');
        el('_ac-gdpr').remove();
        el('_ac-inp').disabled  = false;
        el('_ac-inp').focus();
      };
    }

    // Background tasks (non-blocking)
    crawlSite();
    fetchServerFAQs();

    el('_ac-btn').onclick  = () => { sounds.click(); toggle(); };
    el('_ac-close').onclick = showRating;
    el('_ac-menu-btn').onclick = e => { e.stopPropagation(); toggleMenu(); };
    el('_ac-exp').onclick  = exportChat;
    el('_ac-clr').onclick  = clearChat;
    el('_ac-sound-toggle').onclick = () => {
      CONFIG.soundEnabled = !CONFIG.soundEnabled;
      updateSoundToggle(); closeMenu();
    };

    const mic = el('_ac-mic');
    if (mic && !mic.classList.contains('hide')) mic.onclick = toggleVoice;

    const inp  = el('_ac-inp');
    const send = el('_ac-send');

    inp.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (!send.disabled) sendMessage(inp.value); }
    });
    inp.addEventListener('input', () => {
      inp.style.height = 'auto';
      inp.style.height = Math.min(inp.scrollHeight, 90) + 'px';
      send.disabled = !inp.value.trim();
      resetInactivity();
    });
    send.onclick = () => sendMessage(inp.value);

    updateSoundToggle();

    window.AriaChat = { open: () => toggle(true), close: () => toggle(false), send: sendMessage, clear: clearChat };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();
