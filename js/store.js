/* App state + localStorage persistence. Single mutable object, re-render on change. */

const STORAGE_KEY = 'kamer.prototype.v2';

const emptyDraft = () => ({
  roomId: null,
  packageId: null,
  budget: null,                  // set when a package is picked, from its own range
  wish: '',                      // the customer's own words
  styles: [],                    // optional tags the customer adds themselves
  keeps: '',
  photos: [],                    // [{ wall, src, features: { window, door } }]
  dims: { width: 380, length: 450, height: 250 }
});

const defaultState = () => ({
  account: null,                 // { role: 'customer' | 'designer', name, email, designerId? }
  draft: emptyDraft(),
  projects: [],
  seq: 1
});

const Store = {
  state: defaultState(),
  listeners: [],

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) this.state = Object.assign(defaultState(), JSON.parse(raw));
    } catch (e) {
      console.warn('Could not read saved state, starting fresh.', e);
    }
    return this.state;
  },

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      // Photos are stored as data URLs and can blow the ~5MB quota.
      console.warn('Could not persist state (quota?).', e);
    }
  },

  reset() {
    this.state = defaultState();
    localStorage.removeItem(STORAGE_KEY);
    this.emit();
  },

  on(fn) { this.listeners.push(fn); },
  emit() { this.save(); this.listeners.forEach(fn => fn(this.state)); },

  /* --- accounts --- */
  isCustomer() { return this.state.account && this.state.account.role === 'customer'; },
  isDesigner() { return this.state.account && this.state.account.role === 'designer'; },

  signIn(account) {
    this.state.account = account;
    this.emit();
  },

  signOut() {
    this.state.account = null;
    this.emit();
  },

  /* The designer profile the signed-in designer is working as. */
  me() {
    return this.isDesigner() ? designer(this.state.account.designerId) : null;
  },

  /* --- draft --- */
  setDraft(patch) {
    Object.assign(this.state.draft, patch);
    this.emit();
  },

  /* Budget lives on the package's own scale, so picking one (re)seeds it. */
  setPackage(id) {
    const d = this.state.draft;
    const changed = d.packageId !== id;
    d.packageId = id;
    if (changed || d.budget == null) d.budget = budgetRange(id).default;
    this.emit();
  },

  setWish(text) {
    this.state.draft.wish = text;
    this.emit();
  },

  /* Style tags are optional and entirely the customer's choice. */
  toggleStyle(id) {
    const s = this.state.draft.styles;
    const i = s.indexOf(id);
    if (i >= 0) s.splice(i, 1);
    else if (s.length < 3) s.push(id);
    else { toast('Three tags is plenty — remove one first.'); return; }
    this.emit();
  },

  /* --- room capture --- */
  setDims(patch) {
    const d = this.state.draft.dims;
    Object.assign(d, patch);
    d.width = clamp(Math.round(d.width) || 0, 150, 1200);
    d.length = clamp(Math.round(d.length) || 0, 150, 1200);
    d.height = clamp(Math.round(d.height) || 0, 180, 400);
    this.emit();
  },

  /* One photo per wall — recapturing a wall replaces it. */
  setPhoto(wall, src) {
    const photos = this.state.draft.photos;
    const existing = photos.find(p => p.wall === wall);
    if (existing) existing.src = src;
    else photos.push({ wall, src, features: { window: false, door: false } });
    this.save();
  },

  photoFor(wall) {
    return this.state.draft.photos.find(p => p.wall === wall);
  },

  removePhoto(wall) {
    const photos = this.state.draft.photos;
    const i = photos.findIndex(p => p.wall === wall);
    if (i >= 0) photos.splice(i, 1);
    this.emit();
  },

  togglePhotoFeature(wall, feature) {
    const p = this.photoFor(wall);
    if (!p) return;
    p.features[feature] = !p.features[feature];
    this.emit();
  },

  /* --- projects --- */
  project(id) { return this.state.projects.find(p => p.id === id); },

  createProject(designerId) {
    const draft = this.state.draft;
    const p = {
      id: 'PR-' + String(1000 + this.state.seq++),
      createdAt: Date.now(),
      customer: this.state.account ? this.state.account.name : 'Guest',
      brief: JSON.parse(JSON.stringify(draft)),
      designerId,
      packageId: draft.packageId,
      status: 'booked',
      escrow: 'held',
      design: { items: [], plan: '', delivered: false, panorama: null },
      messages: [],
      revisionsUsed: 0,
      review: null
    };
    this.state.projects.unshift(p);
    this.state.draft = emptyDraft();
    this.emit();
    return p;
  },

  updateProject(id, patch) {
    const p = this.project(id);
    if (!p) return;
    Object.assign(p, patch);
    this.emit();
  },

  toggleItem(projectId, productId) {
    const p = this.project(projectId);
    const i = p.design.items.findIndex(it => it.productId === productId);
    if (i >= 0) p.design.items.splice(i, 1);
    else p.design.items.push({ productId, note: '' });
    if (p.status === 'booked') p.status = 'in_progress';
    // The panorama is built from the selection, so it goes stale on any change.
    if (p.design.panorama) p.design.panorama.stale = true;
    this.emit();
  },

  setItemNote(projectId, productId, note) {
    const it = this.project(projectId).design.items.find(x => x.productId === productId);
    if (it) { it.note = note; this.emit(); }
  },

  /* Stands in for the AI render step: everything needed to draw the panorama is
     already in the brief and the selection, so this just marks it as generated. */
  generatePanorama(projectId) {
    const p = this.project(projectId);
    p.design.panorama = {
      generatedAt: Date.now(),
      stale: false,
      fromPhotos: p.brief.photos.length,
      seed: p.design.items.map(i => i.productId).join('-')
    };
    this.emit();
  },

  addMessage(projectId, from, text, itemId) {
    if (!text.trim()) return;
    this.project(projectId).messages.push({ from, text: text.trim(), itemId: itemId || null, at: Date.now() });
    this.emit();
  },

  deliver(projectId) {
    const p = this.project(projectId);
    p.design.delivered = true;
    p.status = 'delivered';
    p.deliveredAt = Date.now();
    this.emit();
  },

  requestRevision(projectId, text) {
    const p = this.project(projectId);
    if (p.revisionsUsed >= 1) { toast('This package includes one revision round, which has been used.'); return; }
    p.revisionsUsed++;
    p.status = 'revision';
    if (text) p.messages.push({ from: 'customer', text, itemId: null, at: Date.now() });
    this.emit();
  },

  approve(projectId, rating, text) {
    const p = this.project(projectId);
    p.status = 'approved';
    p.escrow = 'released';
    p.review = { rating, text, at: Date.now() };
    this.emit();
  },

  /* Loads a finished example so the delivered-design screens can be seen
     without walking the whole flow. */
  seedDemo() {
    const existing = this.state.projects.find(p => p.id === 'PR-DEMO');
    if (existing) return existing;
    const p = {
      id: 'PR-DEMO',
      createdAt: Date.now() - 6 * 864e5,
      customer: 'Demo customer',
      brief: {
        roomId: 'living', packageId: 'refresh', budget: 3000,
        wish: 'Somewhere calm to land after work. I like pale wood and linen, nothing fussy — ' +
              'quite Japandi, quite Scandi. It should feel uncluttered but not cold.',
        styles: ['japandi', 'scandi'],
        keeps: 'Keeping the oak dining table by the window. Rental — no drilling into walls.',
        photos: [
          { wall: 'n', src: '', features: { window: true, door: false } },
          { wall: 'e', src: '', features: { window: false, door: false } },
          { wall: 's', src: '', features: { window: false, door: true } },
          { wall: 'w', src: '', features: { window: false, door: false } }
        ],
        dims: { width: 380, length: 450, height: 250 }
      },
      designerId: 'd1',
      packageId: 'refresh',
      status: 'delivered',
      escrow: 'held',
      deliveredAt: Date.now() - 864e5,
      design: {
        delivered: true,
        panorama: { generatedAt: Date.now() - 864e5, stale: false, fromPhotos: 0, seed: 'demo' },
        plan: 'Sofa on the long wall facing the window, rug pulled forward so the front legs sit on it. ' +
              'Floor lamp in the far corner to bounce light off the ceiling, plant to soften the empty corner ' +
              'by the door. Everything clears your oak table by at least 90cm of walking space.',
        items: [
          { productId: 'p01', note: 'Deep enough to lounge, pale enough to keep the room bright.' },
          { productId: 'p09', note: 'Round edges — safer in a narrow walkway than a rectangle.' },
          { productId: 'p13', note: 'At 300cm it runs the full seating zone without touching the walls.' },
          { productId: 'p17', note: 'Paper shade gives soft indirect light, no drilling needed.' },
          { productId: 'p20', note: 'Closed storage for the clutter, and a surface for the lamp.' },
          { productId: 'p27', note: 'Fills the awkward corner by the door.' }
        ]
      },
      messages: [
        { from: 'designer', text: 'Went slightly warmer than your references — the north-facing light in this room needs it.', itemId: null, at: Date.now() - 864e5 }
      ],
      revisionsUsed: 0,
      review: null
    };
    this.state.projects.unshift(p);
    this.emit();
    return p;
  }
};

/* --- derived helpers --- */

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

function projectTotal(p) {
  return p.design.items.reduce((sum, it) => sum + (product(it.productId)?.price || 0), 0);
}

function briefBudget(brief) {
  const n = Number(brief.budget) || budgetRange(brief.packageId).default;
  return { max: n, label: eur(n) };
}

/* Doors and windows come from what the customer tagged on each wall photo,
   rather than from a separate floor-plan editor. */
function roomOpenings(brief) {
  const out = [];
  (brief.photos || []).forEach(p => {
    if (!p.features) return;
    if (p.features.window) out.push({ wall: p.wall, pos: 0.5, type: 'window', size: 140 });
    if (p.features.door) out.push({ wall: p.wall, pos: p.features.window ? 0.18 : 0.5, type: 'door', size: 90 });
  });
  return out;
}

/* The longest straight run of wall, which is what most big pieces need. */
function longestWall(dims) {
  return Math.max(dims.width, dims.length);
}

/* Fit check against the customer's own measurements. */
function fitsRoom(prod, brief) {
  const d = brief.dims;
  if (!d || !d.width) return { ok: true, reason: '' };
  const limit = longestWall(d);
  if (prod.w > limit) return { ok: false, reason: `${prod.w}cm wide — longest wall is ${limit}cm` };
  const across = Math.min(d.width, d.length);
  if (prod.d > across) return { ok: false, reason: `${prod.d}cm deep — room is only ${across}cm across` };
  if (prod.h > d.height) return { ok: false, reason: `${prod.h}cm tall — ceiling is ${d.height}cm` };
  return { ok: true, reason: '' };
}

/* Match score 0–1. Platform pricing is undecided, so this weighs style fit,
   room type and track record only. */
function matchScore(d, brief) {
  const styles = brief.styles || [];
  const overlap = styles.filter(s => d.styles.includes(s)).length;
  let score = 0;
  score += styles.length ? (overlap / styles.length) * 0.55 : 0.3;
  score += d.rooms.includes(brief.roomId) ? 0.3 : 0.06;
  score += (d.rating - 4.5) * 0.25;
  return clamp(score, 0.15, 0.99);
}

function rankedDesigners(brief) {
  return DESIGNERS
    .map(d => ({ designer: d, score: matchScore(d, brief) }))
    .sort((a, b) => b.score - a.score);
}

/* Products a designer would see for this brief, sorted by relevance. */
function libraryFor(brief, filters = {}) {
  const b = briefBudget(brief);
  return PRODUCTS
    .filter(p => !filters.cat || p.cat === filters.cat)
    .filter(p => !filters.hideMisfit || fitsRoom(p, brief).ok)
    .filter(p => !filters.maxPrice || p.price <= filters.maxPrice)
    .map(p => {
      let rel = 0;
      rel += p.rooms.includes(brief.roomId) ? 2 : 0;
      rel += (brief.styles || []).filter(s => p.styles.includes(s)).length;
      rel += p.price <= b.max * 0.45 ? 0.5 : 0;
      return { p, rel };
    })
    .sort((a, b2) => b2.rel - a.rel || a.p.price - b2.p.price)
    .map(x => x.p);
}

const eur = n => '€' + Math.round(n).toLocaleString('nl-NL');

let toastTimer;
function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, 2600);
}
