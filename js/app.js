/* Hash router + mount. Re-renders the whole view on any state change. */

const routes = [
  [/^#?\/?$/,                    () => V.landing(),        'any'],
  [/^#\/login$/,                 () => V.login(),          'any'],
  [/^#\/designers$/,             () => V.designers(),      'any'],
  [/^#\/apply$/,                 () => D.apply(),          'any'],
  [/^#\/brief\/(\d)$/,           m => V.brief(m[1]),       'customer'],
  [/^#\/match$/,                 () => V.match(),          'customer'],
  [/^#\/checkout\/(\w+)$/,       m => V.checkout(m[1]),    'customer'],
  [/^#\/projects$/,              () => V.projects(),       'customer'],
  [/^#\/project\/([\w-]+)$/,     m => V.project(m[1]),     'customer'],
  [/^#\/d$/,                     () => D.dashboard(),      'designer'],
  [/^#\/d\/project\/([\w-]+)$/,  m => D.workspace(m[1]),   'designer'],
  // Open to guests: signs in a throwaway customer so the example is one click away.
  [/^#\/demo$/,                  () => {
    if (!Store.state.account) Store.state.account = { role: 'customer', name: 'Demo customer', email: '' };
    location.replace('#/project/' + Store.seedDemo().id);
    return { html: '' };
  }, 'any']
];

const NAV = {
  customer: () => [
    ['#/', 'How it works'],
    ['#/brief/1', 'Design my room'],
    ['#/designers', 'Designers'],
    [`#/projects`, `Your projects${Store.state.projects.length ? ` (${Store.state.projects.length})` : ''}`]
  ],
  designer: () => {
    const me = Store.me();
    const todo = Store.state.projects.filter(p => p.designerId === me.id && p.status !== 'approved').length;
    return [
      ['#/d', `Queue${todo ? ` (${todo})` : ''}`],
      ['#/designers', 'Designers']
    ];
  },
  guest: () => [
    ['#/', 'How it works'],
    ['#/designers', 'Designers'],
    ['#/apply', 'Become a designer']
  ]
};

let lastRoute = null;

function render() {
  // A re-render throws away the <video>, but the camera stays on until its
  // tracks are stopped. Capture updates the grid in place and doesn't re-render.
  stopCamera();

  const hash = location.hash || '#/';
  const hit = routes.find(([re]) => re.test(hash));
  const account = Store.state.account;
  const role = account ? account.role : 'guest';

  let view;
  if (!hit) {
    view = { html: redirectNotice('Page not found.', '#/') };
  } else if (hit[2] !== 'any' && hit[2] !== role) {
    // Signed in on the wrong side, or not signed in at all.
    view = account
      ? { html: redirectNotice(
          `You're signed in as ${role === 'designer' ? 'a designer' : 'a customer'}. Sign out to view that page.`,
          role === 'designer' ? '#/d' : '#/projects') }
      : V.login(hash);
  } else {
    view = hit[1](hash.match(hit[0]));
  }

  const app = document.getElementById('app');
  app.innerHTML = view.html;
  if (view.mount) view.mount();

  document.getElementById('topnav').innerHTML = NAV[role]()
    .map(([h, t]) => `<a href="${h}" class="${h === hash ? 'on' : ''}">${t}</a>`).join('');

  document.getElementById('account').innerHTML = account
    ? `<div class="account">
        ${account.role === 'designer'
          ? avatar(Store.me(), 32)
          : `<div class="avatar" style="width:32px;height:32px;font-size:13px;background:#8d8275">${
              (account.name[0] || '?').toUpperCase()}</div>`}
        <div>
          <div class="account-name">${esc(account.name)}</div>
          <div class="account-role">${account.role === 'designer' ? 'Designer' : 'Customer'}</div>
        </div>
        <button class="btn-ghost btn-sm" id="signout">Sign out</button>
      </div>`
    : `<a class="btn btn-sm" href="#/login">Sign in</a>`;

  const out = document.getElementById('signout');
  if (out) out.onclick = () => { Store.signOut(); location.hash = '#/'; };

  if (hash !== lastRoute) { window.scrollTo(0, 0); lastRoute = hash; }
}

document.getElementById('resetBtn').onclick = () => {
  if (confirm('Clear all prototype data (account, briefs, projects, photos) and start over?')) {
    Store.reset();
    location.hash = '#/';
  }
};

window.addEventListener('hashchange', render);
Store.on(render);
Store.load();
render();
