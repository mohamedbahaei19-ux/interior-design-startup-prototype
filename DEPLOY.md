# Putting it online

The prototype is plain static files, so GitHub Pages hosts it as-is — no build, no server.
It's already committed to a local git repo; it just needs a remote.

**Why HTTPS matters here:** browsers only allow camera access on a secure origin. On
`http://localhost` the guided capture works, on a plain `http://192.168.x.x` LAN address it
does not. GitHub Pages serves over HTTPS, so the camera works for anyone you send the link to.

## 1. Create the empty repo

Go to <https://github.com/new>:

- **Name:** `kamer-prototype`
- **Public** — free GitHub Pages needs a public repo
- **Don't** tick "Add a README", ".gitignore" or a licence — this repo already has a commit

## 2. Push

```bash
cd "/Users/mohamed/Desktop/interior design startup"
./publish.sh <your-github-username>
```

Git will ask for your username and a password. The "password" is **not** your GitHub password —
it's a personal access token from <https://github.com/settings/tokens> with `repo` scope.

If you'd rather not deal with tokens, GitHub Desktop is already installed:
**File → Add Local Repository →** pick this folder **→ Publish repository** (untick "Keep this
code private").

## 3. Turn on Pages

`https://github.com/<username>/kamer-prototype/settings/pages`

Source → **Deploy from a branch** → Branch **main**, folder **/ (root)** → Save.

A minute later it's live at:

```
https://<username>.github.io/kamer-prototype/
```

That's the link to send your cofounder.

## Pushing changes later

```bash
git add -A
git commit -m "what changed"
git push
```

Pages redeploys automatically, usually within a minute.

## What your cofounder should try

Send them straight to the finished example — it needs no sign-up:

```
https://<username>.github.io/kamer-prototype/#/demo
```

From there: drag the 360° view, open the shopping list, then sign out and back in as
**Lotte van Dijk** to see the designer's side.

## A note on the public repo

Free Pages requires a public repo, so the code and copy are visible to anyone with the URL
(though not indexed unless linked). There's nothing sensitive in it — no keys, no real
payments, no customer data, and pricing is all `X`. If you'd rather it weren't public, the
options are a paid GitHub plan (private Pages), or a host with free private static sites
like Netlify or Cloudflare Pages.
