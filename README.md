# HuntAgent AI

Static web workspace demo for **HuntAgent AI**.

HuntAgent AI is a web-based AI hunting intelligence workspace for trail-camera data, target animal tracking, field maps, predictions, device operations, reports, and team workflows.

## Cloudflare Pages settings

- Framework preset: `None`
- Production branch: `main`
- Build command: leave blank, or use `exit 0`
- Build output directory: `public`
- Root directory: leave blank

## Files

- `public/index.html` — static HuntAgent AI web app workspace
- `public/_redirects` — SPA fallback routing
- `public/_headers` — basic security headers

After connecting this GitHub repository to Cloudflare Pages, every push to `main` will trigger a new production deployment.
