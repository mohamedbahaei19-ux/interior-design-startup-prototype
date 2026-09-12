# Prototype — interior design marketplace

A clickable prototype of the interior design marketplace described in
*Interior Design Startup — Business Plan*: customers with one room to furnish are matched
with emerging designers who deliver a fixed-price, ready-to-buy design.

The brand is shown as "Prototype" for now — `[Company Name]` in the business plan is still open.

## Running it

```
python3 serve.py          # http://localhost:8127
```

To share it with someone else, see [DEPLOY.md](DEPLOY.md) — GitHub Pages, one push.

Plain HTML/CSS/JS — no build step, no dependencies, no network calls. State lives in
`localStorage`, so the customer and designer sides talk to each other in one browser.

## Accounts

There's a sign-in page at `#/login`. You pick a side once — **I have a room to design** or
**I'm an interior designer** — and the whole app follows from that: navigation, permissions,
and which pages you can reach. Customers can't open the designer workspace and vice versa;
sign out to swap sides.

Designers sign in as one of the seeded profiles. There's no password — it's a prototype.

## The loop it demonstrates

1. **Brief** (`#/brief/1`) — room and package.
2. **In your own words** — the customer writes what they want as free text. Style tags are
   optional extras they can add afterwards; we suggest some from what they wrote but never
   apply them. Budget is a slider whose range depends on the package.
3. **Capture the room** — a guided four-shot camera flow: stand in the middle, photograph each
   wall, turning a quarter turn between shots. Tag any wall that has a window or a door.
   Then three measurements, which are what give the 360° view its scale.
4. **Match** — designers ranked by style fit, room type and reviews.
5. **Checkout** — payment marked held in escrow.
6. **Designer workspace** — the brief arrives complete. Filter the product library, add pieces,
   watch the budget meter, write layout notes, **generate the 360° preview**, deliver.
7. **Delivery** — the customer gets the panorama, a to-scale floor plan, and a shopping list
   with dimensions, retailer, delivery time and buy links.
8. **Revision** — one round, enforced.
9. **Approval** — releases escrow and posts a verified review.

`#/demo` (or "Load a finished example") jumps straight to a delivered project, no sign-in needed.
"Reset demo data" in the footer clears everything.

## The 360° preview

Drag it, scroll it, or use the arrows; the compass underneath tracks which wall you're facing.
It unrolls all four walls into one strip and wraps seamlessly, so you can turn all the way round.

Each piece is placed on the wall it actually sits nearest in the floor plan, at its real offset
along that wall, scaled to its real width and height against the real ceiling height. Doors and
windows come from whichever walls the customer tagged during capture. Pieces further into the room
are drawn slightly larger and lower, which is the only bit of fakery in the geometry.

`pano-test.html` drives the viewer with synthetic pointer events and prints pass/fail on the page —
open it after touching the panning, wrap or compass code. It isn't part of the app.

It is labelled in the UI as **AI-assisted, not a survey** — approximate proportions and placement,
a preview of the idea rather than a picture of the room. The shopping list is where the hard
guarantee lives: every product on it is checked against the customer's real measurements.

## Pricing is all X

You haven't set prices, so every platform price renders as `€X` — designer fees, the booking fee,
commission, payouts, escrow amounts. One switch controls it:

```js
// js/data.js
const PRICING_TBD = true;
const feeLabel = () => '€X';
const rateLabel = () => 'X%';
```

**Furniture prices stay real.** They're retailer prices, not ours, and the budget slider, the
running total, the "€806 left" meter and the over-budget warning all depend on them. Making those
X too would gut the feature.

Matching no longer scores designers on price, since there isn't one. It weighs style fit (55%),
room type (30%) and rating (15%).

## What's real vs. faked

Real: role-gated accounts, style suggestions from free text, matching, fit checking against the
customer's measurements, per-package budget ranges, the escrow state machine, the revision limit,
floor-plan auto-layout, and the panorama geometry and wrapping.

The camera capture is real — it uses `getUserMedia`, so it needs an HTTPS origin (or localhost);
elsewhere it falls back to file upload and says why.

Faked: payments, passwords, file storage, and the image-generation step — the panorama is SVG
drawn from measurements and product dimensions, standing in for a real render. Products,
designers, reviews and social handles are seeded in `js/data.js`.

## Still to decide

- **Curated library or open sourcing** — designers currently pick from a fixed product library.
  The alternative is letting them paste any product URL, which is more flexible and much harder
  to keep fit-checked.
- **Shortlist or assignment** — the customer picks their designer. Assigning one is cheaper to
  operate but weakens the "choose who you work with" promise in the plan.
- **Turnaround** — `[X] days` in the plan; seeded here as 3–7 days per designer.
- **Products per package** — 4–6 for a refresh, 8–12 for a complete room (`js/views-designer.js`).

## Files

```
index.html            shell
serve.py              static file server
publish.sh            push to GitHub Pages (see DEPLOY.md)
css/styles.css        all styling
js/data.js            seed data, pricing placeholders, style keywords
js/store.js           state, accounts, persistence, matching, fit checks
js/render.js          SVG: silhouettes, floor plan, 360° panorama
js/views-customer.js  sign-in, landing, brief wizard, matching, checkout, project
js/views-designer.js  queue, workspace, application
js/app.js             hash router + auth gate
```
