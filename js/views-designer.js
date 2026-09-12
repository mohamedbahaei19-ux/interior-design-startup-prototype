/* Designer-side views: queue, workspace, application. */

const D = {};

let libFilters = { cat: '', hideMisfit: false, q: '' };

D.dashboard = () => {
  const me = Store.me();
  const mine = Store.state.projects.filter(p => p.designerId === me.id);

  return {
    html: `
    <div class="spread" style="margin-bottom:20px">
      <div class="row">
        ${avatar(me, 52)}
        <div>
          <h1 style="font-size:1.7rem">${me.name}</h1>
          <div class="small muted">${me.level} · ${me.city} · ${stars(me.rating)} ${me.rating.toFixed(1)} (${me.reviews} reviews)</div>
        </div>
      </div>
      ${socialLinks(me)}
    </div>

    <div class="grid g4" style="margin-bottom:24px">
      ${[
        ['Active projects', mine.filter(p => p.status !== 'approved').length],
        ['Completed here', mine.filter(p => p.status === 'approved').length],
        ['Paid out', feeLabel()],
        ['In escrow', feeLabel()]
      ].map(([k, v]) => `<div class="card">
        <div class="tiny muted">${k}</div>
        <div style="font-family:var(--serif);font-size:1.7rem">${v}</div></div>`).join('')}
    </div>

    <h2 style="margin-bottom:12px">Your queue</h2>
    ${mine.length ? `<div class="stack">${mine.map(p => {
      const needs = p.status === 'booked' || p.status === 'in_progress' || p.status === 'revision';
      return `<div class="card spread">
        <div>
          <strong>${roomName(p.brief.roomId)} · ${pkg(p.packageId).name}</strong>
          <div class="small muted">${p.id} · ${p.brief.dims.width}×${p.brief.dims.length}cm ·
            budget ${briefBudget(p.brief).label}</div>
        </div>
        <div class="row">
          ${statusPill(p)}
          <span class="small muted">you earn ${feeLabel()}</span>
          <a class="btn ${needs ? 'btn-accent' : 'btn-ghost'} btn-sm" href="#/d/project/${p.id}">
            ${p.status === 'revision' ? 'Handle revision' : needs ? 'Open workspace' : 'View'}</a>
        </div>
      </div>`;
    }).join('')}</div>` : `<div class="card empty">
      <h3>No briefs yet for ${me.name}</h3>
      <p class="small">Sign in as a customer and book a project — it lands here.</p>
      <a class="btn btn-accent" href="#/demo">Load a finished example</a>
    </div>`}

    <h2 style="margin:32px 0 12px">How you get paid</h2>
    <div class="card">
      <table class="shoplist">
        <tr><td>Your fee, ${pkg('refresh').name}</td><td class="num">${feeLabel()}</td></tr>
        <tr><td>Platform commission</td><td class="num">−${rateLabel()}</td></tr>
        <tr><td><strong>You receive</strong></td><td class="num"><strong>${feeLabel()}</strong></td></tr>
      </table>
      <p class="small muted" style="margin:12px 0 0">Fees and commission aren't set yet — these are placeholders.
      Released when the customer approves the design. You set your own prices and choose which projects to accept.</p>
    </div>`
  };
};

D.workspace = (id) => {
  const p = Store.project(id);
  if (!p) return { html: redirectNotice('Project not found.', '#/d') };
  const me = designer(p.designerId);
  const b = briefBudget(p.brief);
  const total = projectTotal(p);
  const picked = p.design.items.map(i => i.productId);
  const target = pkg(p.packageId).id === 'refresh' ? [4, 6] : [8, 12];
  const lib = libraryFor(p.brief, libFilters)
    .filter(x => !libFilters.q || x.name.toLowerCase().includes(libFilters.q.toLowerCase()));
  const pano = p.design.panorama;

  return {
    html: `
    <div class="spread" style="margin-bottom:16px">
      <div>
        <h1 style="font-size:1.7rem">${roomName(p.brief.roomId)} — ${pkg(p.packageId).name}</h1>
        <div class="small muted">${p.id} · working as ${me.name}</div>
      </div>
      <div class="row">${statusPill(p)}<a class="btn btn-ghost btn-sm" href="#/d">Back to queue</a></div>
    </div>

    ${p.status === 'revision' ? `<div class="card" style="background:var(--warn-soft);border-color:#eddfc4;margin-bottom:16px">
      <strong>Revision requested.</strong>
      <p class="small" style="margin:6px 0 0">${esc([...p.messages].reverse().find(m => m.from === 'customer')?.text || 'See comments below.')}</p>
    </div>` : ''}

    <div class="card" style="margin-bottom:20px">
      <div class="spread" style="margin-bottom:10px"><h3>The brief</h3>
        <span class="small muted">Their words, wall photos and measurements arrive with the project</span></div>
      <p class="small" style="margin:0 0 12px">"${esc(p.brief.wish)}"</p>
      <div class="row" style="gap:22px;border-top:1px solid var(--line);padding-top:12px">
        <div><div class="tiny muted">Furniture budget</div><strong>${b.label}</strong></div>
        <div><div class="tiny muted">Room</div><strong>${p.brief.dims.width} × ${p.brief.dims.length} cm</strong></div>
        <div><div class="tiny muted">Ceiling</div><strong>${p.brief.dims.height} cm</strong></div>
        <div><div class="tiny muted">Longest wall</div><strong>${longestWall(p.brief.dims)} cm</strong></div>
        <div><div class="tiny muted">Target</div><strong>${target[0]}–${target[1]} products</strong></div>
      </div>
      ${roomOpenings(p.brief).length ? `<p class="small muted" style="margin:10px 0 0">
        Openings: ${roomOpenings(p.brief).map(o => `${o.type} on the ${wallName(o.wall).toLowerCase()}`).join(', ')}.</p>` : ''}
      ${p.brief.keeps ? `<p class="small" style="margin:10px 0 0"><strong>Must stay:</strong> ${esc(p.brief.keeps)}</p>` : ''}
      ${briefPhotoStrip(p.brief)}
    </div>

    <div class="grid" style="grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);gap:20px;align-items:start">
      <div class="card">
        <div class="spread" style="margin-bottom:12px">
          <h2>Product library</h2>
          <span class="small muted">${lib.length} items</span>
        </div>
        <div class="row" style="margin-bottom:12px;flex-wrap:nowrap">
          <select id="cat" style="max-width:150px">
            <option value="">All categories</option>
            ${CATEGORIES.map(c => `<option value="${c}" ${libFilters.cat === c ? 'selected' : ''}>${c}</option>`).join('')}
          </select>
          <input type="text" id="q" placeholder="Search…" value="${esc(libFilters.q)}">
          <label style="display:flex;gap:6px;align-items:center;margin:0;white-space:nowrap">
            <input type="checkbox" id="fit" ${libFilters.hideMisfit ? 'checked' : ''} style="width:auto">
            Only what fits</label>
        </div>
        <div class="library">
          ${lib.map(prod => {
            const fit = fitsRoom(prod, p.brief);
            const on = picked.includes(prod.id);
            return `<div class="prod-card ${on ? 'picked' : ''} ${fit.ok ? '' : 'toobig'}">
              ${svgProduct(prod, 120)}
              <div class="prod-name">${esc(prod.name)}</div>
              <div class="tiny muted">${prod.w}×${prod.d}×${prod.h}cm · ${prod.shop}</div>
              <div class="tiny ${fit.ok ? 'muted' : ''}" style="${fit.ok ? '' : 'color:var(--accent)'}">
                ${fit.ok ? '✓ fits' : '⚠ ' + fit.reason}</div>
              <div class="spread">
                <strong class="small">${eur(prod.price)}</strong>
                <button class="btn-sm ${on ? 'btn-ghost' : ''}" data-pick="${prod.id}">${on ? 'Remove' : 'Add'}</button>
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>

      <div class="stack sticky-side">
        <div class="card">
          <div class="spread"><h3>Selection</h3><span class="pill ${
            p.design.items.length >= target[0] ? 'pill-good' : 'pill-grey'}">${p.design.items.length}/${target[0]}–${target[1]}</span></div>
          <div style="margin:12px 0">
            <div class="spread small"><span>Furniture total</span><strong>${eur(total)}</strong></div>
            <div class="budget-meter ${total > b.max ? 'over' : ''}" style="margin:6px 0">
              <i style="width:${Math.min(100, b.max ? total / b.max * 100 : 0)}%"></i></div>
            <div class="spread tiny muted"><span>Budget ${b.label}</span>
              <span>${total > b.max ? eur(total - b.max) + ' over' : eur(b.max - total) + ' left'}</span></div>
          </div>
          ${p.design.items.length ? `<div class="stack" style="gap:8px">
            ${p.design.items.map(it => {
              const prod = product(it.productId);
              return `<div class="row" style="flex-wrap:nowrap;gap:8px">
                ${svgProduct(prod, 34)}
                <div style="flex:1;min-width:0">
                  <div class="small" style="font-weight:600">${esc(prod.name)}</div>
                  <input type="text" class="tiny" data-note="${prod.id}" value="${esc(it.note)}"
                    placeholder="Why this piece…" style="padding:4px 8px;margin-top:2px">
                </div>
                <span class="small num">${eur(prod.price)}</span>
                <button class="btn-ghost btn-sm" data-pick="${prod.id}">×</button>
              </div>`;
            }).join('')}</div>` : '<p class="small muted">Nothing selected yet.</p>'}
        </div>

        <div class="card">
          <h3 style="margin-bottom:8px">Layout notes</h3>
          <textarea id="plan" placeholder="Sofa on the long wall facing the window, rug pulled forward so the front legs sit on it…">${esc(p.design.plan)}</textarea>
          <button class="btn-ghost btn-sm" id="saveplan" style="margin-top:8px">Save notes</button>
        </div>

        <div class="card">
          <h3 style="margin-bottom:8px">Deliver</h3>
          <p class="small muted" style="margin:0 0 12px">
            ${total > b.max ? '⚠ You are over the customer\'s budget. ' : ''}
            ${p.design.items.length < target[0] ? `⚠ ${pkg(p.packageId).name} usually includes at least ${target[0]} products. ` : ''}
            ${!pano || pano.stale ? '⚠ Generate the 360° preview before delivering. ' : ''}
            The customer gets the preview, layout and shopping list, and one revision round.</p>
          <button class="btn-accent" id="deliver" style="width:100%"
            ${p.design.items.length ? '' : 'disabled'}>
            ${p.status === 'revision' ? 'Deliver revised design' : 'Deliver design'}</button>
        </div>
      </div>
    </div>

    <div class="card" style="margin-top:20px">
      <div class="spread" style="margin-bottom:12px">
        <div>
          <h2>360° preview</h2>
          <p class="small muted" style="margin:4px 0 0">Built from the customer's
            ${p.brief.photos.length || 'uploaded'} photo${p.brief.photos.length === 1 ? '' : 's'},
            their blueprint, and the products you picked.</p>
        </div>
        <div class="row">
          ${pano && !pano.stale ? `<span class="pill pill-good">Up to date</span>`
            : pano ? `<span class="pill pill-warn">Out of date</span>` : ''}
          <button class="${pano && !pano.stale ? 'btn-ghost' : 'btn-accent'}" id="genpano"
            ${p.design.items.length ? '' : 'disabled'}>
            ${pano ? 'Regenerate' : 'Generate preview'}</button>
        </div>
      </div>
      ${pano
        ? panoramaViewer(p)
        : `<div class="empty"><p>Pick your products, then generate the preview.<br>
             <span class="small">AI-assisted — it approximates the room rather than surveying it.</span></p></div>`}
    </div>

    <div class="grid g2" style="margin-top:20px;align-items:start">
      <div class="card">
        <div class="spread" style="margin-bottom:12px"><h3>Live elevation</h3>
          <span class="small muted">Updates as you pick</span></div>
        ${svgRender(p)}
      </div>
      <div class="card">
        <div class="spread" style="margin-bottom:12px"><h3>Floor plan</h3>
          <span class="small muted">Auto-placed from real dimensions</span></div>
        ${svgFloorPlan(p)}
      </div>
    </div>

    <div style="margin-top:20px">${messageThread(p, 'designer')}</div>`,
    mount: () => {
      const q = s => document.querySelector(s);
      bindPanorama();

      document.querySelectorAll('[data-pick]').forEach(btn =>
        btn.onclick = () => Store.toggleItem(p.id, btn.dataset.pick));
      document.querySelectorAll('[data-note]').forEach(i =>
        i.onchange = () => Store.setItemNote(p.id, i.dataset.note, i.value));

      q('#cat').onchange = e => { libFilters.cat = e.target.value; Store.emit(); };
      q('#fit').onchange = e => { libFilters.hideMisfit = e.target.checked; Store.emit(); };
      q('#q').onchange = e => { libFilters.q = e.target.value; Store.emit(); };

      q('#genpano').onclick = () => {
        Store.generatePanorama(p.id);
        toast('Preview generated from the photos and measurements.');
      };
      q('#saveplan').onclick = () => {
        p.design.plan = q('#plan').value; Store.emit(); toast('Notes saved.');
      };
      q('#deliver').onclick = () => {
        p.design.plan = q('#plan').value;
        if (!p.design.panorama || p.design.panorama.stale) Store.generatePanorama(p.id);
        Store.deliver(p.id);
        toast('Delivered. The customer can now review it.');
        location.hash = '#/d';
      };
      const send = q('#send');
      if (send) send.onclick = () => Store.addMessage(p.id, 'designer', q('#msg').value);
    }
  };
};

D.apply = () => ({
  html: `<div style="max-width:640px;margin:0 auto" class="stack">
    <h1 style="font-size:1.9rem">Design with us</h1>
    <p class="muted">Paid projects, a portfolio that builds itself, and verified reviews.
    You set your prices, choose your projects, and keep your own clients.</p>
    <div class="card">
      <div class="grid g2">
        <div><label for="ap-name">Name</label><input id="ap-name" type="text" placeholder="Your name"></div>
        <div><label for="ap-city">City</label><input id="ap-city" type="text" placeholder="Amsterdam"></div>
      </div>
      <div style="height:12px"></div>
      <div class="grid g2">
        <div><label for="ap-ig">Instagram</label><input id="ap-ig" type="text" placeholder="@yourhandle"></div>
        <div><label for="ap-li">LinkedIn</label><input id="ap-li" type="text" placeholder="in/yourname"></div>
      </div>
      <div style="height:12px"></div>
      <label for="ap-port">Portfolio link</label>
      <input id="ap-port" type="text" placeholder="A site or a PDF link">
      <div style="height:12px"></div>
      <label for="ap-about">Which rooms and styles do you work in?</label>
      <textarea id="ap-about" placeholder="Mostly small apartments. Japandi and Scandi, lots of second-hand sourcing."></textarea>
      <button class="btn-accent" id="apply" style="margin-top:14px">Submit application</button>
      <p class="tiny muted" style="margin:10px 0 0">Every applicant is reviewed by a person before joining.</p>
    </div>
    <div class="card">
      <h3>What you get</h3>
      <div class="stack" style="gap:10px;margin-top:10px">
        ${[
          ['Structured briefs', 'The customer\'s own description, photos, a blueprint and a budget arrive with the project.'],
          ['A product library', 'Filtered by budget, dimensions and local availability.'],
          ['AI-assisted previews', 'Your layout and products become a 360° view of the room in minutes.'],
          ['Levels that pay', 'Completed projects and strong reviews unlock higher prices and bigger work.']
        ].map(([t, s], i) => `<div class="step-item"><span class="step-num">${i + 1}</span>
          <div><strong class="small">${t}</strong><div class="small muted">${s}</div></div></div>`).join('')}
      </div>
    </div>
  </div>`,
  mount: () => {
    document.getElementById('apply').onclick = () => {
      toast('Application received — prototype, nothing was sent.');
      location.hash = '#/login';
    };
  }
});
