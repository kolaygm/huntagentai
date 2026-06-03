# HuntAgent AI

Static web workspace demo for **HuntAgent AI**.

HuntAgent AI is a web-based AI hunting intelligence workspace for trail-camera data, target animal tracking, field maps, predictions, device operations, reports, and team workflows.

## Cloudflare deployment

This project deploys as **Cloudflare Workers + Static Assets**, not as a traditional Cloudflare Pages `public` output deployment.

- Production branch: `main`
- Worker entry: `src/index.js`
- Static asset directory: `public`
- Config: `wrangler.jsonc`
- Deploy command: `npx wrangler deploy`

Cloudflare Static Assets handles extensionless HTML routes by default:

- `/` serves `public/index.html`
- `/insights` serves `public/insights.html`
- `/contact` serves `public/contact.html`

Do not add Worker rewrites from `/insights` to `/insights.html` or `/contact` to `/contact.html`. Static Assets redirects direct `.html` requests back to extensionless paths, so manual rewrites can create a 307 redirect loop.

## Files

- `public/index.html` — static HuntAgent AI web app workspace
- `public/insights.html` — industry intelligence and lead-generation hub
- `public/contact.html` — beta, demo, and partnership contact page
- `public/_headers` — basic security headers
- `src/index.js` — minimal Worker passthrough to `env.ASSETS.fetch(request)`
- `wrangler.jsonc` — Workers + Static Assets configuration

See `CODEX_HANDOFF.md` for the maintenance roadmap and deployment gotchas.
