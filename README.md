# metzner.uk

The apex landing page for the `metzner.uk` domain — a deliberately minimal
`501 Not Implemented` placeholder while the rooms under the roof get built.

It's a single, self-contained `index.html`: a full-screen generative flow-field
behind the wordmark, and a couple of rubber ducks (the same mascot as the
[portfolio](https://daniel.metzner.uk)) waddling along a horizon line. No build
step, no framework, no dependencies — CSS and JS are inline, fonts are
self-hosted.

## Structure

```
index.html        the whole site — markup, styles, canvas field, ducks
fonts/            self-hosted woff2 (Syne, Hanken Grotesk, JetBrains Mono)
CNAME             metzner.uk
.github/          Pages deploy workflow + Dependabot (actions only)
```

## Develop

No tooling. Just serve the folder and open it:

```bash
python3 -m http.server 8731   # then http://localhost:8731
```

Editing `index.html` and refreshing is the whole loop. `file://` won't load the
fonts (CORS), so use a local server.

## Deploy

GitHub Pages, on every push to `main` via `.github/workflows/deploy.yml`. It's a
static upload — there's nothing to compile, so the workflow just publishes the
repo as the Pages artifact. `CNAME` pins the custom domain.

DNS for the apex: A records to GitHub Pages
(`185.199.108–111.153`), or an ALIAS/ANAME to `dmetzner.github.io`.

## Notes

- **Dark-only** — the generative field is tuned for it. `prefers-reduced-motion`
  gets a single static frame and no ducks.
- **Cookieless analytics** via GoatCounter, shared `metzner` dashboard with the
  other sites.
- Links out to [`daniel.metzner.uk`](https://daniel.metzner.uk) (portfolio) and
  [`til.metzner.uk`](https://til.metzner.uk) (writing) — siblings, each its own repo.
