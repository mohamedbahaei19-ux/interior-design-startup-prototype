/* SVG generators. Everything is drawn locally — no image assets, no network. */

const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const shade = (hex, amt) => {
  const n = parseInt(hex.slice(1), 16);
  const f = v => Math.max(0, Math.min(255, Math.round(v + amt)));
  return '#' + [f(n >> 16), f((n >> 8) & 255), f(n & 255)].map(v => v.toString(16).padStart(2, '0')).join('');
};

/* Wall tint follows the assigned designer's palette. */
const STYLE_HUE = { scandi: 36, japandi: 30, midcentury: 24, industrial: 210, boho: 20, minimal: 210, classic: 140, eclectic: 280 };
const projectHue = project => STYLE_HUE[(designer(project.designerId) || {}).styles?.[0]] || 36;

/* Silhouettes live in a 100×100 box, bottom-aligned on y=100, so the same
   markup works for a thumbnail, an elevation and the panorama. */
function silhouette(cat, color) {
  const dark = shade(color, -32);
  const light = shade(color, 18);
  switch (cat) {
    case 'sofa': return `
      <rect x="2" y="34" width="96" height="40" rx="8" fill="${light}"/>
      <rect x="0" y="52" width="100" height="34" rx="7" fill="${color}"/>
      <rect x="0" y="48" width="16" height="40" rx="7" fill="${dark}"/>
      <rect x="84" y="48" width="16" height="40" rx="7" fill="${dark}"/>
      <rect x="10" y="86" width="7" height="14" rx="2" fill="#7a6a58"/>
      <rect x="83" y="86" width="7" height="14" rx="2" fill="#7a6a58"/>`;
    case 'chair': return `
      <rect x="24" y="6" width="52" height="46" rx="14" fill="${color}"/>
      <rect x="18" y="50" width="64" height="14" rx="6" fill="${dark}"/>
      <rect x="22" y="62" width="6" height="38" rx="2" fill="#7a6a58"/>
      <rect x="72" y="62" width="6" height="38" rx="2" fill="#7a6a58"/>`;
    case 'table': return `
      <rect x="2" y="30" width="96" height="13" rx="5" fill="${color}"/>
      <rect x="12" y="43" width="7" height="57" rx="2" fill="${dark}"/>
      <rect x="81" y="43" width="7" height="57" rx="2" fill="${dark}"/>`;
    case 'desk': return `
      <rect x="2" y="28" width="96" height="11" rx="4" fill="${color}"/>
      <rect x="8" y="39" width="7" height="61" rx="2" fill="${dark}"/>
      <rect x="85" y="39" width="7" height="61" rx="2" fill="${dark}"/>
      <rect x="20" y="39" width="44" height="22" rx="3" fill="${light}"/>`;
    case 'rug': return `
      <rect x="2" y="72" width="96" height="26" rx="4" fill="${color}"/>
      <rect x="10" y="79" width="80" height="3" fill="${dark}" opacity=".55"/>
      <rect x="10" y="87" width="80" height="3" fill="${dark}" opacity=".35"/>`;
    case 'lighting': return `
      <path d="M32 6 h36 l10 26 h-56 z" fill="${color}"/>
      <rect x="47" y="32" width="6" height="62" fill="${dark}"/>
      <ellipse cx="50" cy="97" rx="22" ry="5" fill="${dark}"/>`;
    case 'storage': return `
      <rect x="6" y="8" width="88" height="86" rx="5" fill="${color}"/>
      <rect x="12" y="14" width="36" height="74" rx="3" fill="${light}"/>
      <rect x="52" y="14" width="36" height="74" rx="3" fill="${light}"/>
      <circle cx="45" cy="52" r="2.6" fill="${dark}"/>
      <circle cx="55" cy="52" r="2.6" fill="${dark}"/>
      <rect x="6" y="94" width="88" height="6" rx="2" fill="${dark}"/>`;
    case 'bed': return `
      <rect x="2" y="10" width="22" height="78" rx="5" fill="${shade(color, -14)}"/>
      <rect x="20" y="52" width="78" height="34" rx="6" fill="${light}"/>
      <rect x="26" y="42" width="34" height="16" rx="7" fill="#fbf7ef"/>
      <rect x="20" y="86" width="78" height="8" rx="3" fill="${dark}"/>
      <rect x="88" y="92" width="7" height="8" rx="2" fill="#7a6a58"/>`;
    default: return `
      <rect x="34" y="66" width="32" height="32" rx="4" fill="${shade(color, 40)}"/>
      <path d="M50 70 C30 60 26 34 50 12 C74 34 70 60 50 70 z" fill="${color}"/>
      <rect x="48" y="44" width="4" height="26" fill="${shade(color, -50)}"/>`;
  }
}

/* Aspect-correct tile used for product cards and shopping-list rows. */
function svgProduct(p, size = 100) {
  const aspect = p.w / Math.max(p.h, 12);
  const box = 74;
  const dw = aspect >= 1 ? box : box * aspect;
  const dh = aspect >= 1 ? box / aspect : box;
  const x = 50 - dw / 2;
  const y = 92 - dh;
  return `<svg viewBox="0 0 100 100" width="${size}" height="${size}" role="img" aria-label="${esc(p.name)}">
    <rect width="100" height="100" rx="8" fill="#f6f1e8"/>
    <rect x="0" y="86" width="100" height="14" fill="#ece4d7"/>
    <g transform="translate(${x} ${y}) scale(${dw / 100} ${dh / 100})">${silhouette(p.cat, p.color)}</g>
  </svg>`;
}

function stars(rating) {
  const full = Math.round(rating);
  return `<span class="stars">${'★'.repeat(full)}${'☆'.repeat(5 - full)}</span>`;
}

function avatar(d, size = 46) {
  const initials = d.name.split(' ').map(w => w[0]).slice(0, 2).join('');
  return `<div class="avatar" style="width:${size}px;height:${size}px;font-size:${size * .4}px;background:hsl(${d.hue} 42% 46%)">${initials}</div>`;
}

/* Placeholder social links — not wired to real profiles. */
function socialLinks(d) {
  return `<div class="socials">
    <a href="#/designers" class="social" title="Instagram (placeholder)" aria-label="${esc(d.name)} on Instagram">
      <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="1.9"/>
        <circle cx="12" cy="12" r="4.1" fill="none" stroke="currentColor" stroke-width="1.9"/>
        <circle cx="17.2" cy="6.8" r="1.2" fill="currentColor"/>
      </svg><span>@${esc(d.social.ig)}</span></a>
    <a href="#/designers" class="social" title="LinkedIn (placeholder)" aria-label="${esc(d.name)} on LinkedIn">
      <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="4" fill="none" stroke="currentColor" stroke-width="1.9"/>
        <rect x="6.6" y="10" width="2.3" height="7.6" fill="currentColor"/>
        <circle cx="7.75" cy="7.1" r="1.35" fill="currentColor"/>
        <path d="M11.4 17.6V10h2.2v1a2.7 2.7 0 0 1 2.4-1.2c1.7 0 2.6 1.1 2.6 3.1v4.7h-2.3v-4.3c0-1-.4-1.6-1.3-1.6s-1.4.6-1.4 1.6v4.3z" fill="currentColor"/>
      </svg><span>in/${esc(d.social.li)}</span></a>
  </div>`;
}

/* Abstract before/after portfolio tiles, deterministic per designer. */
function svgPortfolio(d, i, after) {
  const hue = (d.hue + i * 40) % 360;
  const wall = after ? `hsl(${hue} 26% 82%)` : '#dcd7cf';
  const floor = after ? `hsl(${hue} 22% 66%)` : '#c4bdb2';
  const obj = after ? `hsl(${hue} 38% 46%)` : '#b0a89c';
  return `<svg viewBox="0 0 140 100" aria-label="${after ? 'after' : 'before'}">
    <rect width="140" height="100" fill="${wall}"/>
    <rect y="68" width="140" height="32" fill="${floor}"/>
    ${after ? `<rect x="14" y="22" width="34" height="26" rx="2" fill="hsl(${hue} 40% 92%)" opacity=".9"/>` : ''}
    <rect x="${18 + i * 6}" y="50" width="54" height="20" rx="4" fill="${obj}"/>
    <rect x="${20 + i * 6}" y="44" width="50" height="9" rx="4" fill="${after ? `hsl(${hue} 34% 58%)` : '#9e968a'}"/>
    ${after ? `<circle cx="104" cy="58" r="9" fill="hsl(${(hue + 60) % 360} 45% 55%)"/>
               <rect x="100" y="58" width="8" height="14" fill="hsl(${hue} 20% 40%)"/>` : ''}
    <rect x="8" y="70" width="${after ? 118 : 70}" height="6" rx="3" fill="${after ? `hsl(${hue} 30% 88%)` : '#b5aea3'}"/>
    <text x="6" y="14" font-size="9" font-family="sans-serif" fill="hsl(${hue} 20% 32%)">${after ? 'after' : 'before'}</text>
  </svg>`;
}

function svgHero() {
  return `<svg viewBox="0 0 600 420" aria-label="Illustration of a designed living room">
    <rect width="600" height="420" fill="#efe6d8"/>
    <rect y="300" width="600" height="120" fill="#dccfb8"/>
    <rect x="40" y="40" width="150" height="120" rx="4" fill="#cfe0e4"/>
    <rect x="40" y="40" width="150" height="120" rx="4" fill="none" stroke="#b9a98f" stroke-width="6"/>
    <line x1="115" y1="40" x2="115" y2="160" stroke="#b9a98f" stroke-width="5"/>
    <rect x="250" y="120" width="300" height="14" rx="3" fill="#c09a6a"/>
    <rect x="262" y="134" width="8" height="30" fill="#a9835a"/>
    <rect x="530" y="134" width="8" height="30" fill="#a9835a"/>
    <rect x="280" y="88" width="40" height="32" rx="3" fill="#8ea88c"/>
    <rect x="340" y="96" width="70" height="24" rx="3" fill="#d8cbb4"/>
    <rect x="60" y="290" width="420" height="80" rx="10" fill="#c8beb0"/>
    <rect x="70" y="250" width="400" height="52" rx="12" fill="#b6a897"/>
    <rect x="52" y="244" width="44" height="70" rx="12" fill="#a3937f"/>
    <rect x="444" y="244" width="44" height="70" rx="12" fill="#a3937f"/>
    <rect x="130" y="236" width="60" height="26" rx="8" fill="#e8dcc6"/>
    <rect x="330" y="236" width="60" height="26" rx="8" fill="#d6a97e"/>
    <ellipse cx="300" cy="392" rx="230" ry="24" fill="#cbbb9f"/>
    <rect x="520" y="150" width="10" height="160" fill="#8c7a63"/>
    <path d="M492 120 h66 l16 34 h-98 z" fill="#f2e8d2"/>
    <circle cx="150" cy="330" r="26" fill="#7d9a6f"/>
    <rect x="142" y="330" width="16" height="34" fill="#b98b5e"/>
  </svg>`;
}

/* ---------- plan geometry ---------- */

const BP = { W: 600, H: 430, pad: 56 };

function bpGeometry(dims, fixedK) {
  const usableW = BP.W - BP.pad * 2;
  const usableH = BP.H - BP.pad * 2;
  const k = fixedK || Math.min(usableW / dims.width, usableH / dims.length);
  return {
    k,
    ox: BP.pad + (usableW - dims.width * k) / 2,
    oy: BP.pad + (usableH - dims.length * k) / 2,
    w: dims.width * k,
    h: dims.length * k
  };
}

/* Where an opening sits, in plan pixels. */
function openingRect(o, dims, g) {
  const len = (o.wall === 'n' || o.wall === 's') ? dims.width : dims.length;
  const size = Math.min(o.size, len * 0.8) * g.k;
  const at = o.pos * len * g.k;
  if (o.wall === 'n') return { x: g.ox + at - size / 2, y: g.oy - 5, w: size, h: 10, horiz: true };
  if (o.wall === 's') return { x: g.ox + at - size / 2, y: g.oy + g.h - 5, w: size, h: 10, horiz: true };
  if (o.wall === 'w') return { x: g.ox - 5, y: g.oy + at - size / 2, w: 10, h: size, horiz: false };
  return { x: g.ox + g.w - 5, y: g.oy + at - size / 2, w: 10, h: size, horiz: false };
}

/* ---------- floor plan ---------- */

/* Greedy wall-slot placement. Rugs are ignored for collisions and drawn first. */
function autoLayout(items, W, L) {
  const placed = [];
  const pref = {
    sofa: ['bottom', 'top', 'left'], bed: ['top', 'left'], storage: ['top', 'right', 'left'],
    desk: ['left', 'right', 'top'], table: ['center'], chair: ['center', 'right', 'left'],
    lighting: ['corner'], decor: ['corner', 'right'], rug: ['center']
  };
  const hit = (a, b) => !(a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.d <= b.y || b.y + b.d <= a.y);

  for (const p of items) {
    const isRug = p.cat === 'rug';
    const isBig = p.cat === 'table' && p.w > 130;
    const walls = isBig ? ['center'] : (pref[p.cat] || ['center', 'top', 'bottom']);
    const cands = [];
    for (const wall of walls) {
      for (const f of [0.5, 0.22, 0.78, 0.08, 0.92]) {
        if (wall === 'top')    cands.push({ x: (W - p.w) * f, y: 8, w: p.w, d: p.d });
        if (wall === 'bottom') cands.push({ x: (W - p.w) * f, y: L - p.d - 8, w: p.w, d: p.d });
        if (wall === 'left')   cands.push({ x: 8, y: (L - p.w) * f, w: p.d, d: p.w });
        if (wall === 'right')  cands.push({ x: W - p.d - 8, y: (L - p.w) * f, w: p.d, d: p.w });
        if (wall === 'center') cands.push({ x: (W - p.w) / 2, y: (L - p.d) * (f < .3 ? .5 : f), w: p.w, d: p.d });
        if (wall === 'corner') cands.push({ x: f < .5 ? 10 : W - p.w - 10, y: f < .5 ? L - p.d - 10 : 10, w: p.w, d: p.d });
      }
    }
    const solid = placed.filter(q => q.cat !== 'rug');
    const spot = cands.find(c =>
      c.x >= 0 && c.y >= 0 && c.x + c.w <= W && c.y + c.d <= L &&
      (isRug || !solid.some(q => hit(c, q)))
    ) || cands[0];
    placed.push(Object.assign({ cat: p.cat, prod: p }, spot));
  }
  return placed;
}

function svgFloorPlan(project) {
  const dims = project.brief.dims;
  const W = dims.width, L = dims.length;
  const items = project.design.items.map(it => product(it.productId)).filter(Boolean);
  const placed = autoLayout(items, W, L);
  const g = bpGeometry(dims);

  const rugs = placed.filter(p => p.cat === 'rug');
  const rest = placed.filter(p => p.cat !== 'rug');
  const draw = p => {
    const x = g.ox + p.x * g.k, y = g.oy + p.y * g.k, w = p.w * g.k, h = p.d * g.k;
    const label = w > 44 ? `<text x="${x + w / 2}" y="${y + h / 2 + 3}" font-size="9" text-anchor="middle"
        fill="#3a332c" font-family="sans-serif">${esc(p.prod.name.split(' ')[0])}</text>` : '';
    return `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3"
        fill="${p.cat === 'rug' ? p.prod.color : shade(p.prod.color, 12)}"
        fill-opacity="${p.cat === 'rug' ? .55 : 1}"
        stroke="${shade(p.prod.color, -55)}" stroke-width="1"/>${label}
      <title>${esc(p.prod.name)} — ${p.prod.w}×${p.prod.d}cm</title></g>`;
  };

  const openings = roomOpenings(project.brief).map(o => {
    const r = openingRect(o, dims, g);
    return `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" fill="#fbf7f0"
      stroke="${o.type === 'door' ? '#241f1b' : '#3d7ea6'}" stroke-width="1.5"/>`;
  }).join('');

  return `<svg viewBox="0 0 ${BP.W} ${BP.H}" width="100%" aria-label="Floor plan">
    <rect width="${BP.W}" height="${BP.H}" fill="#fbf7f0"/>
    <rect x="${g.ox}" y="${g.oy}" width="${g.w}" height="${g.h}" fill="#fff" stroke="#241f1b" stroke-width="3"/>
    <g opacity=".16" stroke="#8d8275">
      ${Array.from({ length: Math.floor(W / 50) }, (_, i) => `<line x1="${g.ox + (i + 1) * 50 * g.k}" y1="${g.oy}" x2="${g.ox + (i + 1) * 50 * g.k}" y2="${g.oy + g.h}"/>`).join('')}
      ${Array.from({ length: Math.floor(L / 50) }, (_, i) => `<line x1="${g.ox}" y1="${g.oy + (i + 1) * 50 * g.k}" x2="${g.ox + g.w}" y2="${g.oy + (i + 1) * 50 * g.k}"/>`).join('')}
    </g>
    ${rugs.map(draw).join('')}
    ${rest.map(draw).join('')}
    ${openings}
    <text x="${g.ox + g.w / 2}" y="${g.oy - 14}" font-size="11" text-anchor="middle" fill="#1f3f6b" font-family="sans-serif">${W} cm</text>
    <text x="${g.ox - 14}" y="${g.oy + g.h / 2}" font-size="11" text-anchor="middle" fill="#1f3f6b"
      font-family="sans-serif" transform="rotate(-90 ${g.ox - 14} ${g.oy + g.h / 2})">${L} cm</text>
    ${items.length ? '' : `<text x="${BP.W / 2}" y="${BP.H / 2}" font-size="13" text-anchor="middle" fill="#8d8275" font-family="sans-serif">No products selected yet</text>`}
  </svg>`;
}

/* Quick elevation preview: items stand on the floor, scaled to true height. */
function svgRender(project) {
  const dims = project.brief.dims;
  const items = project.design.items.map(it => product(it.productId))
    .filter(Boolean).filter(p => p.cat !== 'rug').sort((a, c) => c.h - a.h);

  const VW = 640, VH = 400, floorY = 330;
  const k = Math.min((VW - 40) / dims.width, (floorY - 40) / dims.height);
  const hue = projectHue(project);

  let cursor = 24;
  const drawn = items.map(p => {
    const w = p.w * k, h = p.h * k;
    if (cursor + w > VW - 24) cursor = 24;
    const x = cursor; cursor += w + 14;
    return `<g transform="translate(${x} ${floorY - h}) scale(${w / 100} ${h / 100})" opacity=".97">
      ${silhouette(p.cat, p.color)}<title>${esc(p.name)}</title></g>`;
  }).join('');

  const rug = project.design.items.map(it => product(it.productId)).find(p => p && p.cat === 'rug');

  return `<svg viewBox="0 0 ${VW} ${VH}" width="100%" aria-label="Elevation preview of the room">
    <rect width="${VW}" height="${floorY}" fill="hsl(${hue} 24% 87%)"/>
    <rect y="${floorY}" width="${VW}" height="${VH - floorY}" fill="hsl(${hue} 23% 61%)"/>
    <rect y="${floorY - 8}" width="${VW}" height="8" fill="hsl(${hue} 18% 94%)"/>
    <rect x="430" y="60" width="150" height="140" rx="3" fill="#cfe1e6" stroke="hsl(${hue} 15% 70%)" stroke-width="7"/>
    <line x1="505" y1="60" x2="505" y2="200" stroke="hsl(${hue} 15% 70%)" stroke-width="6"/>
    ${rug ? `<ellipse cx="${VW / 2}" cy="${floorY + 40}" rx="${Math.min(VW / 2 - 20, rug.w * k / 1.6)}" ry="28" fill="${rug.color}" opacity=".9"/>` : ''}
    ${drawn}
    <rect x="0" y="${VH - 26}" width="${VW}" height="26" fill="rgba(36,31,27,.72)"/>
    <text x="12" y="${VH - 9}" font-size="11" fill="#fdfdfb" font-family="sans-serif">
      Live preview · drawn to scale (room ${dims.width}×${dims.height}cm) · not the final render
    </text>
  </svg>`;
}

/* ---------- 360° panorama ---------- */

/* Unrolls the four walls into one strip. Each item is assigned to the wall it
   sits nearest, at its real offset along that wall, scaled by its real size. */
function panoramaWalls(dims) {
  return [
    { id: 'n', len: dims.width },
    { id: 'e', len: dims.length },
    { id: 's', len: dims.width },
    { id: 'w', len: dims.length }
  ];
}

function assignToWalls(placed, dims) {
  return placed.map(p => {
    const cx = p.x + p.w / 2, cy = p.y + p.d / 2;
    const opts = [
      { wall: 'n', dist: p.y,                    offset: cx,               extent: p.w },
      { wall: 's', dist: dims.length - (p.y + p.d), offset: dims.width - cx,  extent: p.w },
      { wall: 'w', dist: p.x,                    offset: dims.length - cy, extent: p.d },
      { wall: 'e', dist: dims.width - (p.x + p.w),  offset: cy,               extent: p.d }
    ];
    const best = opts.reduce((a, b) => (b.dist < a.dist ? b : a));
    return Object.assign({}, p, best);
  });
}

function svgPanoramaStrip(project, idSuffix) {
  const dims = project.brief.dims;
  const hue = projectHue(project);
  const items = project.design.items.map(it => product(it.productId)).filter(Boolean);
  const placed = assignToWalls(autoLayout(items, dims.width, dims.length), dims);

  const H = 380, floorY = 300, ceilY = 26;
  const k = (floorY - ceilY) / dims.height;          // px per cm, vertical
  const walls = panoramaWalls(dims);
  const stripW = walls.reduce((s, w) => s + w.len, 0) * k;

  let cursor = 0;
  const starts = {};
  const wallFaces = walls.map((w, i) => {
    const x = cursor;
    starts[w.id] = { x, w: w.len * k };
    cursor += w.len * k;
    const lightness = [30, 24, 27, 21][i];          // each wall catches light differently
    return `<rect x="${x}" y="${ceilY}" width="${w.len * k}" height="${floorY - ceilY}" fill="hsl(${hue} 22% ${58 + lightness}%)"/>
      <line x1="${x}" y1="${ceilY}" x2="${x}" y2="${floorY}" stroke="hsl(${hue} 14% 52%)" stroke-width="1.5" opacity=".5"/>
      <text x="${x + 12}" y="${ceilY + 18}" font-size="11" font-family="sans-serif" fill="hsl(${hue} 12% 42%)">${wallName(w.id).toLowerCase()}</text>`;
  }).join('');

  const openings = roomOpenings(project.brief).map(o => {
    const s = starts[o.wall];
    const len = (o.wall === 'n' || o.wall === 's') ? dims.width : dims.length;
    const ow = Math.min(o.size, len * 0.8) * k;
    const x = s.x + o.pos * len * k - ow / 2;
    if (o.type === 'door') {
      const dh = Math.min(210, dims.height - 10) * k;
      return `<g><rect x="${x}" y="${floorY - dh}" width="${ow}" height="${dh}" rx="3" fill="hsl(${hue} 16% 74%)" stroke="#241f1b" stroke-width="2"/>
        <circle cx="${x + ow - 10}" cy="${floorY - dh / 2}" r="3" fill="#241f1b"/>
        <title>Door on the ${wallName(o.wall).toLowerCase()}</title></g>`;
    }
    const wh = 120 * k, sill = 95 * k;
    return `<g><rect x="${x}" y="${floorY - sill - wh}" width="${ow}" height="${wh}" rx="2" fill="#cfe1e6" stroke="#3d7ea6" stroke-width="3"/>
      <line x1="${x + ow / 2}" y1="${floorY - sill - wh}" x2="${x + ow / 2}" y2="${floorY - sill}" stroke="#3d7ea6" stroke-width="2.5"/>
      <title>Window on the ${wallName(o.wall).toLowerCase()}</title></g>`;
  }).join('');

  /* Nearer the middle of the room = nearer the camera = drawn bigger and lower. */
  const maxDist = Math.max(dims.width, dims.length) / 2;
  const furniture = placed
    .filter(p => p.cat !== 'rug')
    .sort((a, b) => a.dist - b.dist)
    .map(p => {
      const s = starts[p.wall];
      const t = Math.min(1, p.dist / maxDist);
      const zoom = 1 + t * 0.4;
      const w = p.extent * k * zoom;
      const h = p.prod.h * k * zoom;
      const x = s.x + p.offset * k - w / 2;
      const y = floorY + t * 44 - h;
      return `<g transform="translate(${x} ${y}) scale(${w / 100} ${h / 100})">
        ${silhouette(p.cat, p.prod.color)}
        <title>${esc(p.prod.name)} — ${p.prod.w}×${p.prod.d}×${p.prod.h}cm, on the ${wallName(p.wall).toLowerCase()}</title></g>`;
    }).join('');

  const rugs = placed.filter(p => p.cat === 'rug').map(p => {
    const s = starts[p.wall];
    return `<ellipse cx="${s.x + p.offset * k}" cy="${floorY + 46}" rx="${p.extent * k * 0.75}" ry="26"
      fill="${p.prod.color}" opacity=".85"><title>${esc(p.prod.name)}</title></ellipse>`;
  }).join('');

  return {
    stripW,
    starts,
    walls,
    svg: `<svg viewBox="0 0 ${stripW} ${H}" width="${stripW}" height="${H}" preserveAspectRatio="none"
      class="pano-strip" aria-label="Unrolled 360 degree view of the room with the new furniture">
      <rect width="${stripW}" height="${ceilY}" fill="hsl(${hue} 16% 93%)"/>
      ${wallFaces}
      <rect y="${floorY}" width="${stripW}" height="${H - floorY}" fill="hsl(${hue} 23% 58%)"/>
      <rect y="${floorY - 7}" width="${stripW}" height="7" fill="hsl(${hue} 18% 92%)"/>
      ${openings}
      ${rugs}
      ${furniture}
    </svg>`
  };
}

/* Drag-to-look-around viewer. Two copies of the strip make the wrap seamless. */
function panoramaViewer(project, opts = {}) {
  const built = svgPanoramaStrip(project);
  const dims = project.brief.dims;
  const pano = project.design.panorama;
  const wallTicks = built.walls.map(w =>
    `<span style="flex:${w.len}">${wallName(w.id).replace(' wall', '')}</span>`).join('');

  return `<div class="pano" data-pano data-strip="${built.stripW}"
      data-walls='${JSON.stringify(built.walls.map(w => ({ id: w.id, name: wallName(w.id), len: w.len })))}'>
    <div class="pano-stage">
      <div class="pano-view" data-pano-view>
        <div class="pano-track" data-pano-track>${built.svg}${built.svg}${built.svg}</div>
      </div>
      <div class="pano-badge">360° · drag to look around</div>
      <button class="pano-arrow left" data-pano-nudge="-1" aria-label="Look left">‹</button>
      <button class="pano-arrow right" data-pano-nudge="1" aria-label="Look right">›</button>
    </div>
    <div class="pano-compass">${wallTicks}</div>
    <p class="pano-note">
      <strong>AI-assisted, not a survey.</strong> Built from your
      ${(project.brief.photos || []).length || 'four'}-wall capture and your
      ${dims.width}×${dims.length}×${dims.height}cm measurements. Proportions and placement are
      approximate — treat it as a preview of the idea, not an exact picture of your room.
      Every product on the shopping list is still checked against your real measurements.
    </p>
    ${opts.footer || ''}
  </div>`;
}
