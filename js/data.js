/* Seed data for the prototype. Dimensions in cm.

   PRICING: what *we* charge is still undecided, so every platform price
   (designer fee, booking fee, commission, payout) renders as "X" via feeLabel().
   Furniture prices are real retail prices and stay numeric — the budget slider,
   the running total and the fit-to-budget checks all depend on them. */

const PRICING_TBD = true;
const feeLabel = () => '€X';
const rateLabel = () => 'X%';

const STYLES = [
  { id: 'scandi',     name: 'Scandi',          hint: 'Pale wood, soft neutrals' },
  { id: 'japandi',    name: 'Japandi',         hint: 'Calm, low, uncluttered' },
  { id: 'midcentury', name: 'Mid-century',     hint: 'Walnut, tapered legs' },
  { id: 'industrial', name: 'Industrial',      hint: 'Metal, leather, raw' },
  { id: 'boho',       name: 'Bohemian',        hint: 'Texture, plants, layers' },
  { id: 'minimal',    name: 'Modern minimal',  hint: 'Clean lines, low contrast' },
  { id: 'classic',    name: 'Warm classic',    hint: 'Deep tones, timeless' },
  { id: 'eclectic',   name: 'Eclectic',        hint: 'Bold colour, mixed eras' }
];

const ROOMS = [
  { id: 'living',  name: 'Living room', sub: 'Sofa, seating, lighting' },
  { id: 'bedroom', name: 'Bedroom',     sub: 'Bed, storage, soft light' },
  { id: 'studio',  name: 'Studio / dorm', sub: 'One room, many jobs' },
  { id: 'office',  name: 'Home office',  sub: 'Desk, chair, focus' },
  { id: 'dining',  name: 'Dining area',  sub: 'Table, chairs, pendant' }
];

const PACKAGES = [
  {
    id: 'refresh',
    name: 'Room Refresh',
    sub: 'A few key pieces for a room you already live in — a new sofa, rug and lighting.',
    items: '4–6 products',
    days: 5
  },
  {
    id: 'complete',
    name: 'Complete Room',
    sub: 'Furnishing a room from scratch, from the big pieces down to the lamp in the corner.',
    items: '8–12 products',
    days: 7
  }
];

/* The customer's furniture budget, set with a slider. A refresh is a few
   pieces, so it gets a much tighter range than furnishing a room from scratch. */
const BUDGET_RANGES = {
  refresh:  { min: 100, max: 5000,  step: 50,  default: 1000 },
  complete: { min: 300, max: 10000, step: 100, default: 3000 }
};
const budgetRange = pkgId => BUDGET_RANGES[pkgId] || BUDGET_RANGES.refresh;

/* The four shots the guided capture asks for, taken from one spot in the
   middle of the room. Together with the measurements they give the panorama
   its scale. */
const CAPTURE_SHOTS = [
  { wall: 'n', name: 'North wall', hint: 'Start facing any wall — we\'ll call it north.' },
  { wall: 'e', name: 'East wall',  hint: 'Turn a quarter turn to your right.' },
  { wall: 's', name: 'South wall', hint: 'Another quarter turn. You\'re facing the first wall\'s opposite.' },
  { wall: 'w', name: 'West wall',  hint: 'Last quarter turn to finish the circle.' }
];

const DESIGNERS = [
  {
    id: 'd1', name: 'Lotte van Dijk', city: 'Amsterdam', hue: 18,
    level: 'Rising', projects: 14, rating: 4.9, reviews: 12,
    styles: ['scandi', 'japandi', 'minimal'],
    rooms: ['living', 'bedroom', 'studio'],
    social: { ig: 'lotte.interiors', li: 'lottevandijk' },
    bio: 'Graduated from the Rietveld Academie in 2024. Works mostly with pale wood, linen and one quiet accent per room.',
    turnaround: 4
  },
  {
    id: 'd2', name: 'Mateo Rossi', city: 'Amsterdam', hue: 205,
    level: 'Rising', projects: 9, rating: 4.8, reviews: 8,
    styles: ['midcentury', 'classic', 'eclectic'],
    rooms: ['living', 'dining', 'office'],
    social: { ig: 'mateo.sources', li: 'mateorossi' },
    bio: 'Ex-furniture buyer turned designer. Very good at finding the one vintage piece a room needs.',
    turnaround: 5
  },
  {
    id: 'd3', name: 'Amara Osei', city: 'Rotterdam', hue: 330,
    level: 'Established', projects: 31, rating: 5.0, reviews: 27,
    styles: ['boho', 'eclectic', 'classic'],
    rooms: ['living', 'bedroom', 'studio'],
    social: { ig: 'amara.makes.rooms', li: 'amaraosei' },
    bio: 'Colour-forward interiors with a lot of texture. Specialises in rentals where nothing can be drilled.',
    turnaround: 3
  },
  {
    id: 'd4', name: 'Jonas Meijer', city: 'Utrecht', hue: 145,
    level: 'New', projects: 3, rating: 4.7, reviews: 3,
    styles: ['industrial', 'minimal', 'midcentury'],
    rooms: ['office', 'studio', 'living'],
    social: { ig: 'jonas.small.spaces', li: 'jonasmeijer' },
    bio: 'Just off his first three platform projects. Sharp on small floor plans and cable management.',
    turnaround: 6
  },
  {
    id: 'd5', name: 'Sanne Bakker', city: 'Amsterdam', hue: 262,
    level: 'Rising', projects: 18, rating: 4.9, reviews: 16,
    styles: ['japandi', 'minimal', 'scandi'],
    rooms: ['bedroom', 'office', 'dining'],
    social: { ig: 'sanne.quiet.rooms', li: 'sannebakker' },
    bio: 'Believes a bedroom should have four things in it and no more. Meticulous with measurements.',
    turnaround: 4
  },
  {
    id: 'd6', name: 'Ines Ferreira', city: 'Amsterdam', hue: 38,
    level: 'Rising', projects: 11, rating: 4.8, reviews: 10,
    styles: ['classic', 'boho', 'midcentury'],
    rooms: ['living', 'dining', 'bedroom'],
    social: { ig: 'ines.ferreira.studio', li: 'inesferreira' },
    bio: 'Portuguese-born, Amsterdam-based. Warm palettes, deep greens, and a lot of second-hand sourcing.',
    turnaround: 5
  }
];

/* w = width, d = depth, h = height, all cm. */
const PRODUCTS = [
  { id: 'p01', name: 'Söderhamn 3-seat sofa', cat: 'sofa', price: 749, w: 198, d: 99, h: 83, shop: 'IKEA', styles: ['scandi','minimal'], rooms: ['living','studio'], color: '#c9c1b4', ship: 'Next-day, Amsterdam' },
  { id: 'p02', name: 'Kave Home Gilma 2-seat', cat: 'sofa', price: 899, w: 168, d: 88, h: 78, shop: 'Kave Home', styles: ['midcentury','classic'], rooms: ['living','studio'], color: '#7d6350', ship: '3–5 days' },
  { id: 'p03', name: 'Zuiver Jean sofa, bouclé', cat: 'sofa', price: 1049, w: 180, d: 90, h: 76, shop: 'Flinders', styles: ['japandi','minimal','boho'], rooms: ['living'], color: '#e4dccd', ship: '1 week' },
  { id: 'p04', name: 'Loveseat, cognac leather', cat: 'sofa', price: 1250, w: 155, d: 85, h: 80, shop: 'Loods 5', styles: ['industrial','midcentury'], rooms: ['living','office'], color: '#96562c', ship: '2 weeks' },

  { id: 'p05', name: 'HAY About A Chair', cat: 'chair', price: 219, w: 55, d: 52, h: 79, shop: 'Flinders', styles: ['scandi','minimal','midcentury'], rooms: ['dining','office'], color: '#3f4a45', ship: 'Next-day' },
  { id: 'p06', name: 'Rattan lounge chair', cat: 'chair', price: 289, w: 72, d: 78, h: 85, shop: 'vtwonen', styles: ['boho','eclectic'], rooms: ['living','bedroom'], color: '#c99a5b', ship: '4 days' },
  { id: 'p07', name: 'Ergonomic task chair', cat: 'chair', price: 329, w: 64, d: 64, h: 115, shop: 'Flinders', styles: ['minimal','industrial'], rooms: ['office','studio'], color: '#2f3336', ship: 'Next-day' },
  { id: 'p08', name: 'Woood Jasmijn armchair', cat: 'chair', price: 375, w: 76, d: 80, h: 82, shop: 'Woood', styles: ['classic','midcentury'], rooms: ['living','bedroom'], color: '#4a5b4e', ship: '5 days' },

  { id: 'p09', name: 'Oak coffee table, round', cat: 'table', price: 249, w: 80, d: 80, h: 42, shop: 'Woood', styles: ['scandi','japandi'], rooms: ['living'], color: '#cfa878', ship: '3 days' },
  { id: 'p10', name: 'Marble-top side table', cat: 'table', price: 165, w: 45, d: 45, h: 52, shop: 'Flinders', styles: ['classic','minimal'], rooms: ['living','bedroom'], color: '#ded9d2', ship: 'Next-day' },
  { id: 'p11', name: 'Extendable dining table', cat: 'table', price: 549, w: 160, d: 90, h: 75, shop: 'Kave Home', styles: ['scandi','classic'], rooms: ['dining'], color: '#b98f61', ship: '1 week' },
  { id: 'p12', name: 'Compact desk, 120cm', cat: 'desk', price: 229, w: 120, d: 60, h: 74, shop: 'IKEA', styles: ['minimal','scandi','industrial'], rooms: ['office','studio','bedroom'], color: '#d8cdb9', ship: 'Next-day' },

  { id: 'p13', name: 'Wool rug 200×300, sand', cat: 'rug', price: 389, w: 300, d: 200, h: 1, shop: 'Flinders', styles: ['scandi','japandi','minimal'], rooms: ['living','bedroom'], color: '#ddd0bb', ship: '5 days' },
  { id: 'p14', name: 'Berber rug 160×230', cat: 'rug', price: 259, w: 230, d: 160, h: 2, shop: 'vtwonen', styles: ['boho','eclectic'], rooms: ['living','bedroom','studio'], color: '#efe7d8', ship: '3 days' },
  { id: 'p15', name: 'Vintage-wash rug 140×200', cat: 'rug', price: 179, w: 200, d: 140, h: 1, shop: 'Loods 5', styles: ['eclectic','classic','industrial'], rooms: ['living','office','studio'], color: '#9a6f63', ship: '4 days' },

  { id: 'p16', name: 'Arc floor lamp, brass', cat: 'lighting', price: 199, w: 180, d: 40, h: 210, shop: 'Flinders', styles: ['midcentury','classic'], rooms: ['living'], color: '#c39a4e', ship: 'Next-day' },
  { id: 'p17', name: 'Paper shade floor lamp', cat: 'lighting', price: 89, w: 45, d: 45, h: 160, shop: 'IKEA', styles: ['japandi','scandi','minimal'], rooms: ['living','bedroom','studio'], color: '#f0ead9', ship: 'Next-day' },
  { id: 'p18', name: 'Linen table lamp, pair', cat: 'lighting', price: 145, w: 32, d: 32, h: 48, shop: 'Woood', styles: ['classic','scandi','boho'], rooms: ['bedroom','living'], color: '#e6dcc9', ship: '3 days' },
  { id: 'p19', name: 'Ribbed glass pendant', cat: 'lighting', price: 129, w: 30, d: 30, h: 35, shop: 'Zuiver', styles: ['industrial','midcentury','eclectic'], rooms: ['dining','office'], color: '#d7cdbc', ship: '4 days' },

  { id: 'p20', name: 'Oak sideboard 160cm', cat: 'storage', price: 629, w: 160, d: 42, h: 75, shop: 'Woood', styles: ['scandi','midcentury','japandi'], rooms: ['living','dining'], color: '#c8a276', ship: '1 week' },
  { id: 'p21', name: 'Open shelving unit', cat: 'storage', price: 189, w: 80, d: 35, h: 190, shop: 'IKEA', styles: ['minimal','industrial','scandi'], rooms: ['office','studio','living'], color: '#cbbfa9', ship: 'Next-day' },
  { id: 'p22', name: 'Cane-front nightstand', cat: 'storage', price: 149, w: 45, d: 40, h: 58, shop: 'Kave Home', styles: ['boho','japandi','classic'], rooms: ['bedroom'], color: '#d3ae7e', ship: '4 days' },
  { id: 'p23', name: 'Wardrobe 150cm, matt', cat: 'storage', price: 549, w: 150, d: 58, h: 201, shop: 'IKEA', styles: ['minimal','scandi'], rooms: ['bedroom','studio'], color: '#e2ddd4', ship: '1 week' },

  { id: 'p24', name: 'Oak bed frame 160×200', cat: 'bed', price: 699, w: 172, d: 212, h: 95, shop: 'Woood', styles: ['scandi','japandi','minimal'], rooms: ['bedroom'], color: '#c5a077', ship: '2 weeks' },
  { id: 'p25', name: 'Upholstered bed 140×200', cat: 'bed', price: 589, w: 152, d: 212, h: 105, shop: 'Kave Home', styles: ['classic','boho','midcentury'], rooms: ['bedroom','studio'], color: '#8e8778', ship: '10 days' },

  { id: 'p26', name: 'Large mirror 80×180', cat: 'decor', price: 179, w: 80, d: 4, h: 180, shop: 'Flinders', styles: ['minimal','classic','eclectic'], rooms: ['bedroom','living','studio'], color: '#cdd4d3', ship: '5 days' },
  { id: 'p27', name: 'Ficus + ceramic planter', cat: 'decor', price: 89, w: 50, d: 50, h: 150, shop: 'Loods 5', styles: ['boho','japandi','scandi'], rooms: ['living','bedroom','office','studio'], color: '#5c7a52', ship: '2 days' },
  { id: 'p28', name: 'Framed print set of 3', cat: 'decor', price: 115, w: 120, d: 3, h: 50, shop: 'vtwonen', styles: ['eclectic','midcentury','classic'], rooms: ['living','office','bedroom','dining'], color: '#b9a893', ship: 'Next-day' }
];

const CATEGORIES = ['sofa', 'chair', 'table', 'desk', 'rug', 'lighting', 'storage', 'bed', 'decor'];

const WALLS = [
  { id: 'n', name: 'North wall' },
  { id: 'e', name: 'East wall' },
  { id: 's', name: 'South wall' },
  { id: 'w', name: 'West wall' }
];

const styleName = id => (STYLES.find(s => s.id === id) || {}).name || id;
const roomName  = id => (ROOMS.find(r => r.id === id) || {}).name || id;
const wallName  = id => (WALLS.find(w => w.id === id) || {}).name || id;
const product   = id => PRODUCTS.find(p => p.id === id);
const designer  = id => DESIGNERS.find(d => d.id === id);
const pkg       = id => PACKAGES.find(p => p.id === id);
