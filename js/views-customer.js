/* Customer-side views. Each view returns { html, mount? }. */

const V = {};

/* ---------------- sign in ---------------- */

let authRole = 'customer';
let authDesignerId = 'd1';

V.login = (next) => ({
  html: `<div class="auth stack">
    <div class="center">
      <h1 style="font-size:1.9rem">Welcome</h1>
      <p class="muted">One account. Tell us which side of the room you're on.</p>
    </div>
    <div class="role-pick">
      <button class="role ${authRole === 'customer' ? 'on' : ''}" data-role="customer">
        <span class="role-icon">🛋️</span>
        <span>
          <strong>I have a room to design</strong>
          <div class="small muted">Describe your room, pick a designer, and receive a
          ready-to-buy shopping list.</div>
        </span>
      </button>
      <button class="role ${authRole === 'designer' ? 'on' : ''}" data-role="designer">
        <span class="role-icon">✎</span>
        <span>
          <strong>I'm an interior designer</strong>
          <div class="small muted">Take on small, fixed-scope projects, build a portfolio, and collect
          verified reviews.</div>
        </span>
      </button>
    </div>
    <div class="card">
      ${authRole === 'customer' ? `
        <div class="grid g2">
          <div><label for="a-name">Your name</label><input id="a-name" type="text" placeholder="Mohamed"></div>
          <div><label for="a-email">Email</label><input id="a-email" type="email" placeholder="you@example.com"></div>
        </div>` : `
        <label for="a-who">Sign in as</label>
        <select id="a-who">${DESIGNERS.map(d =>
          `<option value="${d.id}" ${d.id === authDesignerId ? 'selected' : ''}>${d.name} — ${d.level}, ${d.city}</option>`).join('')}</select>
        <p class="tiny muted" style="margin:10px 0 0">Prototype: pick one of the seeded designer profiles.
        A real sign-up would go through the portfolio review described in
        <a href="#/apply">become a designer</a>.</p>`}
      <button class="btn-accent" id="signin" style="width:100%;margin-top:14px">
        ${authRole === 'customer' ? 'Continue' : 'Enter my workspace'}</button>
      <p class="tiny muted center" style="margin:12px 0 0">No password — prototype only.</p>
    </div>
  </div>`,
  mount: () => {
    document.querySelectorAll('[data-role]').forEach(b => b.onclick = () => {
      authRole = b.dataset.role; render();
    });
    const who = document.getElementById('a-who');
    if (who) who.onchange = e => { authDesignerId = e.target.value; };
    document.getElementById('signin').onclick = () => {
      if (authRole === 'designer') {
        const d = designer(authDesignerId);
        Store.signIn({ role: 'designer', name: d.name, email: '', designerId: d.id });
        location.hash = '#/d';
      } else {
        const name = (document.getElementById('a-name').value || '').trim();
        Store.signIn({
          role: 'customer',
          name: name || 'Guest',
          email: (document.getElementById('a-email').value || '').trim()
        });
        location.hash = next || '#/';
      }
    };
  }
});

/* ---------------- landing ---------------- */

V.landing = () => ({
  html: `
  <section class="hero">
    <div>
      <span class="pill">Amsterdam · now taking projects</span>
      <h1 style="margin-top:14px">A real designer for<br>one room.</h1>
      <p class="lede">Tell us about your room and your budget. An emerging interior designer picks every
      piece, checks it fits, and sends you a shopping list you can actually buy — one fixed price, no hourly rates.</p>
      <div class="row" style="margin-top:22px">
        <a class="btn btn-accent" href="#/brief/1">Design my room</a>
        <a class="btn btn-ghost" href="#/designers">Meet the designers</a>
      </div>
      <p class="small muted" style="margin-top:18px">One revision round included · Payment held until you get your design</p>
      <p class="small" style="margin-top:10px"><a href="#/demo">Or jump straight to a finished example project →</a></p>
    </div>
    <div class="hero-art">${svgHero()}</div>
  </section>

  <section class="grid g3" style="margin-bottom:56px">
    ${[
      ['Describe the room', 'Say what you want in your own words, set a budget, and photograph your four walls.'],
      ['Choose your designer', 'Browse real portfolios and verified reviews, and pick who you want. One fixed price, no hourly billing.'],
      ['See it before you buy', 'A 360° preview of your room with the new furniture in it, plus a shopping list of real products that fit.']
    ].map(([t, s], i) => `
      <div class="card">
        <div class="step-item">
          <span class="step-num">${i + 1}</span>
          <div><h3>${t}</h3><p class="muted small" style="margin:6px 0 0">${s}</p></div>
        </div>
      </div>`).join('')}
  </section>

  <section class="card" style="margin-bottom:48px">
    <div class="spread">
      <div>
        <h2>Two packages</h2>
        <p class="muted small" style="margin:4px 0 0">Designers set their own price within a suggested range.</p>
      </div>
      <a class="btn btn-ghost btn-sm" href="#/brief/1">Design my room</a>
    </div>
    <div class="grid g2" style="margin-top:18px">
      ${PACKAGES.map(p => `
        <div style="border:1px solid var(--line);border-radius:10px;padding:16px">
          <div class="spread"><h3>${p.name}</h3><span class="pill pill-grey">${p.items}</span></div>
          <p class="muted small" style="margin:8px 0 12px">${p.sub}</p>
          <div class="small"><strong>${feeLabel()}</strong> · delivered in ~${p.days} days
            <span class="tiny muted">· pricing not set yet</span></div>
        </div>`).join('')}
    </div>
  </section>

  <section>
    <h2 style="margin-bottom:14px">Designers on the platform</h2>
    <div class="grid g3">${DESIGNERS.slice(0, 3).map(d => designerCard(d)).join('')}</div>
  </section>`
});

/* ---------------- designer directory ---------------- */

V.designers = () => ({
  html: `<h1 style="margin-bottom:8px">Designers</h1>
    <p class="muted" style="margin-bottom:24px">Every applicant is reviewed before joining. Levels rise with completed projects and verified reviews.</p>
    <div class="grid g3">${DESIGNERS.map(d => designerCard(d)).join('')}</div>`
});

function designerCard(d, cta) {
  const st = Store.state;
  const completed = d.projects + st.projects.filter(p => p.designerId === d.id && p.status === 'approved').length;
  return `<div class="card designer-card">
    <div class="designer-top">
      ${avatar(d)}
      <div style="min-width:0">
        <h3>${d.name}</h3>
        <div class="small muted">${d.level} · ${d.city}</div>
      </div>
    </div>
    ${socialLinks(d)}
    <div class="portfolio">${svgPortfolio(d, 1, false)}${svgPortfolio(d, 1, true)}</div>
    <p class="small muted" style="margin:0">${d.bio}</p>
    <div class="row small" style="gap:8px">
      ${d.styles.map(s => `<span class="pill pill-grey">${styleName(s)}</span>`).join('')}
    </div>
    <div class="spread small">
      <span>${stars(d.rating)} ${d.rating.toFixed(1)} <span class="muted">(${d.reviews})</span></span>
      <span class="muted">${completed} projects</span>
    </div>
    <div class="spread" style="border-top:1px solid var(--line);padding-top:12px">
      <div>
        <div style="font-family:var(--serif);font-size:20px">${feeLabel()}</div>
        <div class="tiny muted">price not set yet · ~${d.turnaround} days</div>
      </div>
      ${cta || ''}
    </div>
  </div>`;
}

/* ---------------- brief wizard ---------------- */

function progressBar(step) {
  return `<div class="progress">${[1, 2, 3].map(i => `<span class="${i <= step ? 'on' : ''}"></span>`).join('')}</div>`;
}

V.brief = (step) => {
  step = Math.min(3, Math.max(1, parseInt(step) || 1));
  const d = Store.state.draft;
  const body = { 1: briefStep1, 2: briefStep2, 3: briefStep3 }[step](d);
  return {
    html: `<div style="max-width:760px;margin:0 auto">
      ${progressBar(step)}
      <div class="wizard-head">
        <div class="tiny muted">Step ${step} of 3</div>
        <h1 style="font-size:1.9rem">${['', 'What are we working on?', 'What should it feel like?', 'Show us the room'][step]}</h1>
      </div>
      ${body}
    </div>`,
    mount: () => briefMount(step)
  };
};

function briefStep1(d) {
  return `<div class="stack">
    <div class="card">
      <h3 style="margin-bottom:12px">Which room?</h3>
      <div class="choice-grid">
        ${ROOMS.map(r => `<button class="choice ${d.roomId === r.id ? 'on' : ''}" data-room="${r.id}">
          <span class="choice-title">${r.name}</span><span class="choice-sub">${r.sub}</span></button>`).join('')}
      </div>
    </div>
    <div class="card">
      <h3 style="margin-bottom:12px">How much of it?</h3>
      <div class="grid g2">
        ${PACKAGES.map(p => `<button class="choice ${d.packageId === p.id ? 'on' : ''}" data-pkg="${p.id}">
          <span class="choice-title">${p.name}</span>
          <span class="choice-sub">${p.sub}</span>
          <span class="pill pill-grey" style="margin-top:8px;align-self:flex-start">${p.items} · ~${p.days} days</span>
        </button>`).join('')}
      </div>
    </div>
    <div class="spread">
      <a class="btn btn-ghost" href="#/">Back</a>
      <button id="next" ${d.roomId && d.packageId ? '' : 'disabled'}>Continue</button>
    </div>
  </div>`;
}
function briefStep2(d) {
  const r = budgetRange(d.packageId);
  const budget = d.budget == null ? r.default : d.budget;
  return `<div class="stack">
    <div class="card">
      <h3 style="margin-bottom:4px">Tell your designer what you want</h3>
      <p class="small muted">In your own words. How should the room feel, what do you love, what do you
      hate? Mention colours, materials, anything you've seen and liked. A person reads this — there's no
      right way to write it.</p>
      <textarea id="wish" rows="7" placeholder="Somewhere calm to land after work. I like pale wood and linen, nothing fussy. I'd rather it felt uncluttered than cosy, but not cold — and please no grey.">${esc(d.wish)}</textarea>
    </div>

    <div class="card">
      <div class="spread" style="margin-bottom:4px">
        <h3>Furniture budget</h3>
        <span class="pill pill-grey">${pkg(d.packageId).name}</span>
      </div>
      <p class="small muted">What you expect to spend on the products themselves. The designer's fee is separate.</p>
      <div class="slider-row" style="margin-top:16px">
        <span class="tiny muted">${eur(r.min)}</span>
        <input type="range" id="budget" min="${r.min}" max="${r.max}" step="${r.step}" value="${budget}">
        <span class="tiny muted">${eur(r.max)}+</span>
        <span class="budget-value" id="budgetval">${eur(budget)}</span>
      </div>
    </div>

    <div class="spread">
      <a class="btn btn-ghost" href="#/brief/1">Back</a>
      <button id="next">Continue</button>
    </div>
  </div>`;
}

function briefStep3(d) {
  const captured = d.photos.filter(p => p.src).length;
  return `<div class="stack">
    <div class="card">
      <div class="spread" style="margin-bottom:4px">
        <h3>Capture the room</h3>
        <span class="pill ${captured === 4 ? 'pill-good' : 'pill-grey'}">${captured}/4 walls</span>
      </div>
      <p class="small muted">Stand in the middle of the room and take one photo of each wall, turning a
      quarter turn between shots. Four shots from one spot is what lets us rebuild the room as a
      to-scale 360° view later.</p>
      <div id="capture"></div>
    </div>

    <div class="card">
      <h3 style="margin-bottom:4px">Measurements</h3>
      <p class="small muted">Photos alone can't tell us how big anything is. These three numbers are what
      set the scale — for the 360° view and for checking that every piece fits.</p>
      <div class="grid g3" style="margin-top:12px">
        <div><label for="f-width">Width (cm)</label><input type="number" id="f-width" data-dim="width" value="${d.dims.width}"></div>
        <div><label for="f-length">Length (cm)</label><input type="number" id="f-length" data-dim="length" value="${d.dims.length}"></div>
        <div><label for="f-height">Ceiling (cm)</label><input type="number" id="f-height" data-dim="height" value="${d.dims.height}"></div>
      </div>
      <p class="tiny muted" id="areahint" style="margin:10px 0 0">${areaHint(d.dims)}</p>
    </div>

    <div class="card">
      <h3 style="margin-bottom:4px">Anything that has to stay?</h3>
      <p class="small muted">A sofa you love, a rental kitchen you can't touch, a landlord who forbids drilling.</p>
      <textarea id="keeps" placeholder="Keeping the oak dining table. Rental — no drilling into walls.">${esc(d.keeps)}</textarea>
    </div>

    <div class="spread">
      <a class="btn btn-ghost" href="#/brief/2">Back</a>
      <button id="next">See matched designers</button>
    </div>
  </div>`;
}

const areaHint = dims =>
  `That's ${(dims.width * dims.length / 10000).toFixed(1)} m² of floor, ${dims.height}cm to the ceiling.`;

function briefMount(step) {
  const d = Store.state.draft;
  const q = s => document.querySelector(s);

  document.querySelectorAll('[data-room]').forEach(b => b.onclick = () => Store.setDraft({ roomId: b.dataset.room }));
  document.querySelectorAll('[data-pkg]').forEach(b => b.onclick = () => Store.setPackage(b.dataset.pkg));

  const next = q('#next');
  if (next) next.onclick = () => { location.hash = step < 3 ? `#/brief/${step + 1}` : '#/match'; };

  if (step === 2) {
    // Update in place so typing doesn't re-render and lose the caret.
    const wish = q('#wish');
    wish.oninput = () => { d.wish = wish.value; Store.save(); };

    const slider = q('#budget');
    slider.oninput = () => {
      d.budget = +slider.value;
      q('#budgetval').textContent = eur(d.budget);
      Store.save();
    };
  }

  if (step === 3) {
    mountCapture();
    document.querySelectorAll('[data-dim]').forEach(input => input.onchange = () => {
      Store.setDims({ [input.dataset.dim]: +input.value || 0 });
    });
    q('#keeps').onchange = e => { d.keeps = e.target.value; Store.save(); };
  }
}

/* ---------------- guided room capture ---------------- */

let camStream = null;
let camShot = 0;

/* Called from the router before every re-render: the <video> is thrown away
   with the DOM, but the camera stays on until the tracks are stopped. */
function stopCamera() {
  if (!camStream) return;
  camStream.getTracks().forEach(t => t.stop());
  camStream = null;
}

const cameraSupported = () =>
  !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) && window.isSecureContext;

function mountCapture() {
  const host = document.getElementById('capture');
  if (!host) return;
  const d = Store.state.draft;

  const drawGrid = () => {
    const captured = d.photos.filter(p => p.src).length;
    host.innerHTML = `
      <div class="shot-grid">
        ${CAPTURE_SHOTS.map((shot, i) => {
          const photo = Store.photoFor(shot.wall);
          const has = photo && photo.src;
          return `<div class="shot ${has ? 'has' : ''}">
            <div class="shot-frame" data-open="${i}">
              ${has ? `<img src="${photo.src}" alt="${shot.name}">`
                    : `<span class="shot-num">${i + 1}</span>`}
              <span class="shot-label">${shot.name}</span>
            </div>
            ${has ? `<div class="shot-tags">
              <button class="tag ${photo.features.window ? 'on' : ''}" data-feat="${shot.wall}:window">Window</button>
              <button class="tag ${photo.features.door ? 'on' : ''}" data-feat="${shot.wall}:door">Door</button>
              <button class="tag ghost" data-drop="${shot.wall}">Retake</button>
            </div>` : `<div class="shot-tags"><span class="tiny muted">${shot.hint}</span></div>`}
          </div>`;
        }).join('')}
      </div>
      <div class="row" style="margin-top:14px">
        <button class="${captured ? 'btn-ghost' : 'btn-accent'}" id="startcam">
          ${captured ? 'Continue capture' : 'Start camera capture'}</button>
        <button class="btn-ghost" id="uploadinstead">Upload photos instead</button>
        <input type="file" id="slotfile" accept="image/*" hidden>
      </div>
      ${cameraSupported() ? '' : `<p class="tiny muted" style="margin:10px 0 0">
        ${window.isSecureContext ? 'No camera available on this device' :
          'The camera needs a secure (https) connection — on a plain http address browsers block it'},
        so upload works instead. The 360° view is built the same way either way.</p>`}
      <p class="tiny muted" style="margin:10px 0 0">Tag a wall with a window or a door and it shows up in
      your floor plan and 360° view.</p>`;
    bindGrid();
  };

  let uploadTarget = 0;

  function bindGrid() {
    host.querySelectorAll('[data-open]').forEach(el => el.onclick = () => {
      const i = +el.dataset.open;
      if (cameraSupported()) openCamera(i);
      else { uploadTarget = i; document.getElementById('slotfile').click(); }
    });
    host.querySelectorAll('[data-feat]').forEach(b => b.onclick = () => {
      const [wall, feat] = b.dataset.feat.split(':');
      Store.togglePhotoFeature(wall, feat);
    });
    host.querySelectorAll('[data-drop]').forEach(b => b.onclick = () => Store.removePhoto(b.dataset.drop));

    const start = document.getElementById('startcam');
    start.onclick = () => {
      const firstEmpty = CAPTURE_SHOTS.findIndex(s => !(Store.photoFor(s.wall) || {}).src);
      if (cameraSupported()) openCamera(firstEmpty < 0 ? 0 : firstEmpty);
      else { uploadTarget = firstEmpty < 0 ? 0 : firstEmpty; document.getElementById('slotfile').click(); }
    };
    document.getElementById('uploadinstead').onclick = () => {
      const firstEmpty = CAPTURE_SHOTS.findIndex(s => !(Store.photoFor(s.wall) || {}).src);
      uploadTarget = firstEmpty < 0 ? 0 : firstEmpty;
      document.getElementById('slotfile').click();
    };
    document.getElementById('slotfile').onchange = e => {
      const f = e.target.files[0];
      if (!f) return;
      shrink(f, src => {
        Store.setPhoto(CAPTURE_SHOTS[uploadTarget].wall, src);
        drawGrid();
        updateCount();
      });
      e.target.value = '';
    };
  }

  function updateCount() {
    const pill = document.querySelector('.wizard-head ~ .stack .pill, .card .pill');
    const n = Store.state.draft.photos.filter(p => p.src).length;
    document.querySelectorAll('.pill').forEach(el => {
      if (/\d\/4 walls/.test(el.textContent)) {
        el.textContent = `${n}/4 walls`;
        el.classList.toggle('pill-good', n === 4);
        el.classList.toggle('pill-grey', n !== 4);
      }
    });
  }

  async function openCamera(index) {
    camShot = index;
    host.innerHTML = `
      <div class="cam">
        <div class="cam-stage">
          <video id="camvideo" autoplay playsinline muted></video>
          <div class="cam-guide" aria-hidden="true">
            <span class="cam-h"></span><span class="cam-v"></span>
            <i class="c tl"></i><i class="c tr"></i><i class="c bl"></i><i class="c br"></i>
          </div>
          <div class="cam-top">
            <span id="camstep"></span>
            <button class="cam-x" id="camclose" aria-label="Close camera">×</button>
          </div>
          <div class="cam-level" id="camlevel" hidden><span></span>Hold the camera level</div>
        </div>
        <div class="cam-bar">
          <div class="cam-dots" id="camdots"></div>
          <button class="shutter" id="shutter" aria-label="Take photo"><span></span></button>
          <button class="btn-ghost btn-sm" id="camskip">Skip</button>
        </div>
        <p class="cam-hint" id="camhint"></p>
      </div>`;

    const video = document.getElementById('camvideo');
    document.getElementById('camclose').onclick = closeCamera;
    document.getElementById('camskip').onclick = () => advance();
    document.getElementById('shutter').onclick = () => capture(video);
    paintCamStep();

    try {
      camStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 } },
        audio: false
      });
      video.srcObject = camStream;
    } catch (err) {
      host.innerHTML = `<div class="card" style="background:var(--warn-soft);border-color:#eddfc4">
        <strong class="small">Couldn't open the camera</strong>
        <p class="small" style="margin:6px 0 10px">${esc(err && err.name === 'NotAllowedError'
          ? 'Camera permission was declined. You can allow it in your browser settings, or upload photos instead.'
          : 'No camera was available. Upload photos instead — nothing else changes.')}</p>
        <button class="btn-ghost btn-sm" id="backtogrid">Back</button>
      </div>`;
      document.getElementById('backtogrid').onclick = () => { stopCamera(); drawGrid(); };
      return;
    }

    startLevelMeter();
  }

  function paintCamStep() {
    const shot = CAPTURE_SHOTS[camShot];
    const step = document.getElementById('camstep');
    if (step) step.textContent = `Shot ${camShot + 1} of 4 · ${shot.name}`;
    const hint = document.getElementById('camhint');
    if (hint) hint.textContent = shot.hint + ' Keep the camera upright and try to get the floor and the ceiling in frame.';
    const dots = document.getElementById('camdots');
    if (dots) dots.innerHTML = CAPTURE_SHOTS.map((s, i) => {
      const has = (Store.photoFor(s.wall) || {}).src;
      return `<i class="${has ? 'done' : ''} ${i === camShot ? 'now' : ''}"></i>`;
    }).join('');
  }

  function capture(video) {
    if (!video.videoWidth) { toast('Camera is still warming up.'); return; }
    const max = 640;
    const scale = Math.min(1, max / video.videoWidth);
    const c = document.createElement('canvas');
    c.width = Math.round(video.videoWidth * scale);
    c.height = Math.round(video.videoHeight * scale);
    c.getContext('2d').drawImage(video, 0, 0, c.width, c.height);
    Store.setPhoto(CAPTURE_SHOTS[camShot].wall, c.toDataURL('image/jpeg', 0.62));
    const stage = document.querySelector('.cam-stage');
    if (stage) { stage.classList.add('flash'); setTimeout(() => stage.classList.remove('flash'), 180); }
    advance();
  }

  function advance() {
    if (camShot >= CAPTURE_SHOTS.length - 1) { closeCamera(); return; }
    camShot++;
    paintCamStep();
  }

  function closeCamera() {
    stopCamera();
    Store.emit();               // full re-render now that the video is gone
  }

  /* Optional nicety: show a level bubble where the browser exposes tilt. */
  function startLevelMeter() {
    if (typeof DeviceOrientationEvent === 'undefined') return;
    const el = document.getElementById('camlevel');
    if (!el) return;
    const onTilt = e => {
      if (e.gamma == null) return;
      el.hidden = false;
      el.classList.toggle('ok', Math.abs(e.gamma) < 6);
    };
    window.addEventListener('deviceorientation', onTilt);
  }

  drawGrid();
}

/* Downscale before storing: full-size data URLs overflow localStorage. */
function shrink(file, done) {
  if (!file.type.startsWith('image/')) return;
  const fr = new FileReader();
  fr.onload = () => {
    const img = new Image();
    img.onload = () => {
      const max = 640;
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = img.width * scale; c.height = img.height * scale;
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      done(c.toDataURL('image/jpeg', 0.62));
    };
    img.src = fr.result;
  };
  fr.readAsDataURL(file);
}

/* Wall-labelled thumbnails, used on both sides of the marketplace. */
function briefPhotoStrip(brief) {
  const shots = (brief.photos || []).filter(p => p.src);
  if (!shots.length) return '';
  return `<div class="thumbs">${shots.map(p => `
    <div class="thumb thumb-wall">
      <img src="${p.src}" alt="${wallName(p.wall)}">
      <span>${wallName(p.wall).replace(' wall', '')}</span>
    </div>`).join('')}</div>`;
}

/* ---------------- matches ---------------- */

V.match = () => {
  const d = Store.state.draft;
  if (!d.roomId || !d.packageId) return { html: redirectNotice('Start a brief first.', '#/brief/1') };
  const list = designerList(d);
  return {
    html: `
    <div class="spread" style="margin-bottom:6px">
      <h1 style="font-size:1.9rem">Choose your designer</h1>
      <a class="btn btn-ghost btn-sm" href="#/brief/3">Edit brief</a>
    </div>
    <p class="muted" style="margin-bottom:20px">${list.length} designers taking projects. Read their work
    and pick whoever feels right — they'll read your brief themselves.</p>
    ${briefSummary(d)}
    <div class="grid g3" style="margin-top:24px">
      ${list.map(dz => designerCard(dz,
        `<button class="btn-accent btn-sm" data-book="${dz.id}">Choose</button>`)).join('')}
    </div>`,
    mount: () => document.querySelectorAll('[data-book]').forEach(b =>
      b.onclick = () => { location.hash = '#/checkout/' + b.dataset.book; })
  };
};

function briefSummary(d) {
  return `<div class="card">
    <div class="row" style="gap:22px">
      <div><div class="tiny muted">Room</div><strong>${roomName(d.roomId)}</strong></div>
      <div><div class="tiny muted">Package</div><strong>${pkg(d.packageId).name}</strong></div>
      <div><div class="tiny muted">Furniture budget</div><strong>${eur(d.budget)}</strong></div>
      <div><div class="tiny muted">Size</div><strong>${d.dims.width} × ${d.dims.length} cm</strong></div>
      <div><div class="tiny muted">Walls captured</div><strong>${(d.photos || []).filter(p => p.src).length}/4</strong></div>
    </div>
    ${d.wish ? `<p class="small" style="margin:12px 0 0;border-top:1px solid var(--line);padding-top:10px">
      <span class="muted">In their words:</span> "${esc(d.wish)}"</p>` : ''}
    ${d.keeps ? `<p class="small muted" style="margin:8px 0 0"><strong>Must stay:</strong> ${esc(d.keeps)}</p>` : ''}
  </div>`;
}

/* ---------------- checkout ---------------- */

V.checkout = (designerId) => {
  const d = Store.state.draft;
  const dz = designer(designerId);
  if (!dz || !d.packageId) return { html: redirectNotice('That booking is no longer available.', '#/brief/1') };
  const p = pkg(d.packageId);
  const captured = (d.photos || []).filter(x => x.src).length;

  const includes = [
    [`${p.name} for your ${roomName(d.roomId).toLowerCase()}`, `${p.items}, chosen for your room`],
    ['A 360° preview', 'Your room with the new pieces in it, built to your measurements'],
    ['A shopping list you can buy from', 'Real products with sizes, prices and links, each checked to fit'],
    ['One round of revisions', `Delivered in about ${dz.turnaround} days`]
  ];

  return {
    html: `<div class="checkout">
      <h1 style="font-size:1.9rem;margin-bottom:18px">Confirm your project</h1>

      <div class="card co-card">
        <div class="co-designer">
          ${avatar(dz, 48)}
          <div style="min-width:0;flex:1">
            <strong>${dz.name}</strong>
            <div class="small muted">${dz.level} · ${dz.city}</div>
          </div>
          <span class="small muted">${stars(dz.rating)} ${dz.rating.toFixed(1)}</span>
        </div>

        <ul class="co-list">
          ${includes.map(([t, sub]) => `<li>
            <svg viewBox="0 0 20 20" width="15" height="15" aria-hidden="true">
              <path d="M4 10.5 8 14.5 16 6" fill="none" stroke="currentColor" stroke-width="2.2"
                stroke-linecap="round" stroke-linejoin="round"/></svg>
            <div><strong>${t}</strong><span>${sub}</span></div>
          </li>`).join('')}
        </ul>

        <table class="co-price">
          <tr><td>${dz.name.split(' ')[0]}'s fee</td><td class="num">${feeLabel()}</td></tr>
          <tr><td>Booking fee</td><td class="num">${feeLabel()}</td></tr>
          <tr class="co-total"><td>Total today</td><td class="num">${feeLabel()}</td></tr>
        </table>
        <p class="tiny muted co-fine">Pricing isn't set yet — these are placeholders.</p>

        <div class="co-notes">
          <p><span class="muted">Paid now, held until you approve.</span> If the design doesn't land, the
          revision round is included and nothing is released until you're happy.</p>
          <p><span class="muted">Furniture is separate.</span> You buy it yourself, at your own pace,
          within your ${eur(d.budget)} budget.</p>
        </div>
      </div>

      <div class="spread" style="margin-top:20px">
        <a class="btn btn-ghost" href="#/match">Back</a>
        <button class="btn-accent" id="pay">Confirm &amp; book</button>
      </div>

      <p class="tiny muted center" style="margin-top:14px">
        Your brief${captured ? `, ${captured} wall photo${captured > 1 ? 's' : ''}` : ''} and measurements
        go to ${dz.name.split(' ')[0]} as soon as you confirm.
      </p>
    </div>`,
    mount: () => {
      document.getElementById('pay').onclick = () => {
        const proj = Store.createProject(designerId);
        toast('Booked. Payment is held until delivery.');
        location.hash = '#/project/' + proj.id;
      };
    }
  };
};

/* ---------------- projects ---------------- */

V.projects = () => {
  const ps = Store.state.projects;
  if (!ps.length) return { html: `<div class="empty"><h2>No projects yet</h2>
    <p>Describe your room and choose a designer.</p>
    <div class="row" style="justify-content:center">
      <a class="btn btn-accent" href="#/brief/1">Design my room</a>
      <a class="btn btn-ghost" href="#/demo">Load a finished example</a>
    </div></div>` };
  return {
    html: `<h1 style="margin-bottom:20px">Your projects</h1>
    <div class="stack">${ps.map(p => {
      const dz = designer(p.designerId);
      return `<a class="card spread" href="#/project/${p.id}" style="text-decoration:none">
        <div class="row">
          ${avatar(dz, 40)}
          <div>
            <strong>${roomName(p.brief.roomId)} · ${pkg(p.packageId).name}</strong>
            <div class="small muted">${p.id} · with ${dz.name}</div>
          </div>
        </div>
        <div class="row">${statusPill(p)}<span class="muted small">${feeLabel()}</span></div>
      </a>`;
    }).join('')}</div>`
  };
};

const STATUS_TEXT = {
  booked: ['Booked', 'pill-grey'], in_progress: ['In progress', ''], delivered: ['Delivered', 'pill-good'],
  revision: ['Revision requested', 'pill-warn'], approved: ['Approved', 'pill-good']
};
function statusPill(p) {
  const [t, cls] = STATUS_TEXT[p.status] || ['—', 'pill-grey'];
  return `<span class="pill ${cls}">${t}</span>`;
}

V.project = (id) => {
  const p = Store.project(id);
  if (!p) return { html: redirectNotice('Project not found.', '#/projects') };
  const dz = designer(p.designerId);
  const steps = ['Brief', 'Designing', 'Delivered', 'Approved'];
  const at = { booked: 1, in_progress: 1, delivered: 2, revision: 1, approved: 3 }[p.status];

  const head = `
    <div class="spread" style="margin-bottom:16px">
      <div>
        <h1 style="font-size:1.9rem">${roomName(p.brief.roomId)}</h1>
        <div class="muted small">${p.id} · ${pkg(p.packageId).name} · with ${dz.name}</div>
      </div>
      <div class="row">${statusPill(p)}
        <span class="pill ${p.escrow === 'held' ? 'pill-grey' : 'pill-good'}">
          ${p.escrow === 'held' ? 'Payment held' : 'Paid out'} · ${feeLabel()}</span>
      </div>
    </div>
    <div class="card" style="margin-bottom:20px">
      <div class="timeline">${steps.map((s, i) =>
        `<div class="tl-step ${i < at ? 'done' : ''} ${i === at ? 'on' : ''}">${s}</div>`).join('')}</div>
    </div>`;

  if (!p.design.delivered) return { html: waitingView(p, dz) };

  return { html: head + deliveredView(p, dz), mount: () => deliveredMount(p) };
};

const shortDate = ts => new Date(ts).toLocaleDateString('en-GB',
  { weekday: 'short', day: 'numeric', month: 'short' });

/* Deliberately quiet: one thing to read, one date to hold on to, and the
   detail folded away until it's wanted. */
function waitingView(p, dz) {
  const revising = p.status === 'revision';
  const from = revising ? Date.now() : p.createdAt;
  const due = shortDate(from + dz.turnaround * 864e5);

  const stages = [
    { t: 'Brief received', s: shortDate(p.createdAt), state: 'done' },
    revising
      ? { t: 'Reworking your revision', s: 'in progress', state: 'now' }
      : { t: `${dz.name.split(' ')[0]} is choosing pieces`, s: 'in progress', state: 'now' },
    { t: '360° preview and shopping list', s: `by ${due}`, state: '' }
  ];

  return `
  <div class="wait">
    <div class="wait-title">
      <h1>${roomName(p.brief.roomId)}</h1>
      <p class="muted small">${p.id} · ${pkg(p.packageId).name}</p>
    </div>

    <div class="card wait-card">
      ${avatar(dz, 56)}
      <h2>${revising ? 'Your notes are with ' + dz.name.split(' ')[0] : dz.name + ' has your brief'}</h2>
      <p class="muted">Expected back by <strong>${due}</strong></p>

      <ol class="wait-steps">
        ${stages.map(s => `<li class="${s.state}">
          <span class="wd"></span>
          <div><strong>${s.t}</strong><em>${s.s}</em></div>
        </li>`).join('')}
      </ol>

      <p class="tiny muted wait-foot">Your payment stays held until you've seen the design and approved it.</p>
    </div>

    <details class="wait-more">
      <summary>What you sent</summary>
      <div style="margin-top:12px">${briefSummary(p.brief)}${briefPhotoStrip(p.brief)}</div>
    </details>

    ${p.messages.length ? messageThread(p, 'customer') : ''}

    <p class="tiny muted center" style="margin-top:20px">
      Prototype: sign out and back in as ${dz.name} to deliver this design.
    </p>
  </div>`;
}

function deliveredView(p, dz) {
  const b = briefBudget(p.brief);
  const total = projectTotal(p);
  const over = total > b.max;
  const items = p.design.items.map(it => ({ it, prod: product(it.productId) })).filter(x => x.prod);

  return `
  <div class="grid" style="grid-template-columns:minmax(0,1.55fr) minmax(0,1fr);gap:20px;align-items:start">
    <div class="stack">
      <div class="card">
        <div class="spread" style="margin-bottom:12px">
          <h2>Your room</h2><span class="pill">360° preview</span>
        </div>
        ${p.design.panorama
          ? panoramaViewer(p)
          : `<div class="empty"><p>Your designer hasn't generated the preview yet.</p></div>`}
      </div>
      <div class="card">
        <div class="spread" style="margin-bottom:12px">
          <h2>Layout</h2><span class="small muted">Top-down, drawn to your measurements</span>
        </div>
        ${svgFloorPlan(p)}
        ${p.design.plan ? `<p class="small" style="margin:14px 0 0;border-top:1px solid var(--line);padding-top:12px">
          <strong>${dz.name}'s notes:</strong> ${esc(p.design.plan)}</p>` : ''}
      </div>
      <div class="card">
        <div class="spread" style="margin-bottom:6px">
          <h2>Shopping list</h2><span class="small muted">${items.length} products · all checked to fit</span>
        </div>
        <table class="shoplist">
          <thead><tr><th>Product</th><th>Size (cm)</th><th>Where</th><th class="num">Price</th><th></th></tr></thead>
          <tbody>
            ${items.map(({ it, prod }) => {
              const fit = fitsRoom(prod, p.brief);
              return `<tr>
                <td><div class="prod">${svgProduct(prod, 46)}
                  <div><div style="font-weight:600">${esc(prod.name)}</div>
                  ${it.note ? `<div class="tiny muted">${esc(it.note)}</div>` : ''}
                  <div class="tiny ${fit.ok ? 'muted' : ''}" style="${fit.ok ? '' : 'color:var(--accent)'}">
                    ${fit.ok ? '✓ fits your room' : '⚠ ' + fit.reason}</div></div></div></td>
                <td class="small muted">${prod.w}×${prod.d}×${prod.h}</td>
                <td class="small">${prod.shop}<div class="tiny muted">${prod.ship}</div></td>
                <td class="num">${eur(prod.price)}</td>
                <td><a class="btn btn-ghost btn-sm" href="#/project/${p.id}" data-buy="${prod.id}">Buy</a></td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
        <div style="margin-top:16px">
          <div class="spread small"><span>Total</span><strong>${eur(total)}</strong></div>
          <div class="budget-meter ${over ? 'over' : ''}" style="margin:6px 0">
            <i style="width:${Math.min(100, total / b.max * 100)}%"></i></div>
          <div class="spread tiny muted"><span>Your budget: ${b.label}</span>
            <span>${over ? eur(total - b.max) + ' over' : eur(b.max - total) + ' left'}</span></div>
        </div>
      </div>
      ${messageThread(p, 'customer')}
    </div>

    <div class="stack sticky-side">
      ${p.status === 'approved' ? `
        <div class="card" style="background:var(--good-soft);border-color:#cfe2d6">
          <h3>Project complete</h3>
          <p class="small" style="margin:8px 0">${feeLabel()} released to ${dz.name}. Your review is on their profile.</p>
          <div>${stars(p.review.rating)} ${p.review.rating}.0</div>
          ${p.review.text ? `<p class="small muted" style="margin:8px 0 0">"${esc(p.review.text)}"</p>` : ''}
        </div>` : `
        <div class="card">
          <h3>Happy with it?</h3>
          <p class="small muted" style="margin:8px 0 12px">Approving releases the fee to ${dz.name} and posts your review.</p>
          <label for="rate">Rating</label>
          <select id="rate">${[5, 4, 3, 2, 1].map(n => `<option value="${n}">${'★'.repeat(n)}</option>`).join('')}</select>
          <div style="height:10px"></div>
          <textarea id="reviewtext" placeholder="What worked? Anything the next customer should know?"></textarea>
          <button class="btn-accent" id="approve" style="width:100%;margin-top:10px">Approve &amp; release payment</button>
        </div>
        <div class="card">
          <h3>Need changes?</h3>
          <p class="small muted" style="margin:8px 0 12px">
            ${p.revisionsUsed >= 1
              ? 'Your included revision round has been used.'
              : 'One revision round is included in your package.'}</p>
          <textarea id="revtext" placeholder="The sofa is too dark for the light in this room — can we try something lighter?"
            ${p.revisionsUsed >= 1 ? 'disabled' : ''}></textarea>
          <button class="btn-ghost" id="revise" style="width:100%;margin-top:10px"
            ${p.revisionsUsed >= 1 ? 'disabled' : ''}>Request revision</button>
        </div>`}
      <div class="card">
        <h3>Your brief</h3>
        <p class="small" style="margin:8px 0 0">"${esc(p.brief.wish)}"</p>
        <div class="small" style="margin-top:10px;border-top:1px solid var(--line);padding-top:10px">
          <div class="spread"><span class="muted">Room</span><span>${p.brief.dims.width}×${p.brief.dims.length} cm</span></div>
          <div class="spread"><span class="muted">Budget</span><span>${briefBudget(p.brief).label}</span></div>
        </div>
        ${p.brief.keeps ? `<p class="tiny muted" style="margin:10px 0 0">Must stay: ${esc(p.brief.keeps)}</p>` : ''}
        ${briefPhotoStrip(p.brief)}
      </div>
    </div>
  </div>`;
}

function messageThread(p, me) {
  return `<div class="card">
    <h3 style="margin-bottom:12px">Comments</h3>
    ${p.messages.length ? p.messages.map(m => `
      <div class="comment ${m.from === 'designer' ? 'from-designer' : ''}">
        <div class="tiny muted">${m.from === 'designer' ? designer(p.designerId).name : 'Customer'}
          ${m.itemId ? '· on ' + esc(product(m.itemId).name) : ''}</div>
        <div class="small">${esc(m.text)}</div>
      </div>`).join('') : '<p class="small muted">No comments yet.</p>'}
    <div class="row" style="margin-top:12px;flex-wrap:nowrap">
      <input type="text" id="msg" placeholder="Add a comment…">
      <button class="btn-ghost" id="send">Send</button>
    </div>
  </div>`;
}

function deliveredMount(p) {
  const q = s => document.querySelector(s);
  bindPanorama();
  const send = q('#send');
  if (send) send.onclick = () => {
    Store.addMessage(p.id, Store.isDesigner() ? 'designer' : 'customer', q('#msg').value);
  };
  const rev = q('#revise');
  if (rev) rev.onclick = () => {
    Store.requestRevision(p.id, q('#revtext').value);
    toast('Revision requested — sent to your designer.');
  };
  const ap = q('#approve');
  if (ap) ap.onclick = () => {
    Store.approve(p.id, +q('#rate').value, q('#reviewtext').value);
    toast('Approved. Payment released to your designer.');
  };
  document.querySelectorAll('[data-buy]').forEach(a => a.onclick = e => {
    e.preventDefault();
    toast('Prototype: this would open ' + product(a.dataset.buy).shop + ' with the item pre-selected.');
  });
}

/* Drag / arrow / trackpad panning for the 360° viewer.

   The track holds three copies of the strip and we park the scroll position in
   the middle one, so there is always a full strip of runway on either side and
   the browser's clamp at scrollLeft 0 never bites. `offset` is the unbounded
   logical heading; scrollLeft is always strip + (offset mod strip). */
const panoWrap = (offset, strip) => ((offset % strip) + strip) % strip;

function panoWallIndex(centre, walls, strip) {
  const total = walls.reduce((s, w) => s + w.len, 0);
  let acc = 0, idx = 0;
  walls.forEach((w, i) => {
    const end = acc + (w.len / total) * strip;
    if (centre >= acc && centre < end) idx = i;
    acc = end;
  });
  return idx;
}

function bindPanorama() {
  document.querySelectorAll('[data-pano]').forEach(root => {
    const view = root.querySelector('[data-pano-view]');
    const strip = +root.dataset.strip;
    const walls = JSON.parse(root.dataset.walls);
    const ticks = root.querySelectorAll('.pano-compass span');
    let offset = 0;
    let syncing = false;

    const apply = () => {
      syncing = true;
      view.scrollLeft = strip + panoWrap(offset, strip);
      const centre = panoWrap(offset + view.clientWidth / 2, strip);
      const idx = panoWallIndex(centre, walls, strip);
      ticks.forEach((t, i) => t.classList.toggle('on', i === idx));
      requestAnimationFrame(() => { syncing = false; });
    };

    // Trackpad / shift-wheel scrolling is handled natively; re-park it afterwards.
    view.onscroll = () => {
      if (syncing) return;
      offset = view.scrollLeft - strip;
      apply();
    };

    let down = false, startX = 0, startOffset = 0;
    view.onpointerdown = e => {
      if (e.button !== 0) return;
      down = true; startX = e.clientX; startOffset = offset;
      view.classList.add('dragging');
      try { view.setPointerCapture(e.pointerId); } catch (_) { /* no live pointer */ }
    };
    view.onpointermove = e => {
      if (!down) return;
      offset = startOffset - (e.clientX - startX);
      apply();
    };
    const end = e => {
      if (!down) return;
      down = false;
      view.classList.remove('dragging');
      try {
        if (view.hasPointerCapture(e.pointerId)) view.releasePointerCapture(e.pointerId);
      } catch (_) { /* capture was never taken */ }
    };
    view.onpointerup = end;
    view.onpointercancel = end;

    root.querySelectorAll('[data-pano-nudge]').forEach(b => {
      b.onpointerdown = e => e.stopPropagation();   // don't start a drag
      b.onclick = () => {
        offset += (+b.dataset.panoNudge) * view.clientWidth * 0.7;
        apply();
      };
    });

    apply();
  });
}

function redirectNotice(msg, href) {
  return `<div class="empty"><h2>${msg}</h2><a class="btn btn-accent" href="${href}">Continue</a></div>`;
}
