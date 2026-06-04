# Codex Handoff - HuntAgent AI

This repository contains the formal web version of **HuntAgent AI**, an AI hunting intelligence platform for serious hunters. The public positioning should stay hunter-first: AI trail-camera analysis, target animal profiles, field intelligence, hunt planning, prediction, and post-hunt recap workflows.

Avoid public-facing B2B ecosystem, dealer, land-manager, investor, roadmap, beta, demo, or testing language unless the user explicitly asks for that version.

## Current Production Status

- Repository: `kolaygm/huntagentai`
- Production branch: `main`
- Live domain: `https://huntagentai.com/`
- Worker preview URL: `https://huntagentai.kolaygm.workers.dev/`
- Deployment target: Cloudflare Workers + Static Assets
- Deploy command: `npx wrangler deploy`

## Cloudflare Configuration

The project uses `wrangler.jsonc` at the repository root.

Important settings:

```jsonc
{
  "name": "huntagentai",
  "compatibility_date": "2026-06-03",
  "main": "./src/index.js",
  "assets": {
    "directory": "./public",
    "binding": "ASSETS",
    "run_worker_first": true
  }
}
```

`src/index.js` now handles API routes before passing normal page requests to `env.ASSETS.fetch(request)`.

Current API routes:

- `POST /api/feedback`
- `GET /api/admin/feedback`
- `PATCH /api/admin/feedback/:id`

Feedback storage requires Cloudflare D1 binding `FEEDBACK_DB`. Setup details are in `FEEDBACK_SETUP.md`.

## Routes

Cloudflare Static Assets handles extensionless HTML routes:

```text
/               -> public/index.html
/insights       -> public/insights.html
/news           -> public/news.html
/contact        -> public/contact.html
/feedback       -> public/feedback.html
/feedback-admin -> public/feedback-admin.html
```

Do not add manual Worker rewrites from extensionless paths to `.html` files. Static Assets redirects direct `.html` requests back to extensionless URLs; combining those redirects with manual rewrites can create a redirect loop.

## Current Pages

### `/`

HuntAgent AI command center homepage. It should immediately show hunters what the AI agent can do: analyze trail-camera events, produce hunt scores, plan entry routes, profile target animals, predict movement windows, and support post-hunt learning.

### `/insights`

Field intelligence page for AI hunting workflows. Keep it focused on hunter-facing analysis, planning, prediction, and recap value.

### `/news`

Industry news and event brief page. Content is data-driven from `public/news-data.js`. Use `NEWS_PUBLISHING_GUIDE.md` when adding new industry events, gear signals, trail-camera briefs, or hunting technology updates.

### `/contact`

Hunter access request page. The form posts to `POST /api/feedback` with type `access`.

### `/feedback`

Public feedback page. Hunters can submit category, title, optional email, and content without sending an email.

### `/feedback-admin`

Token-protected feedback management page. Use `FEEDBACK_ADMIN_TOKEN`; the page accepts `/feedback-admin?token=...`, stores the token in session storage, then removes it from the URL.

## Maintenance Notes

- Keep public language formal and hunter-first.
- Use real hunting/outdoor imagery, not cartoon animals.
- Update `public/news-data.js` for news and event briefs.
- Put uploaded news images in `public/news-assets/`.
- Run syntax checks after JS changes:

```bash
node --check public/news.js
node --check public/feedback.js
Get-Content src/index.js -Raw | node --input-type=module --check
```

## Deployment Gotchas

1. The Cloudflare auto-generated branch `cloudflare/workers-autoconfig` previously had a correct preview while `main` was older.
2. If worker preview and production ever diverge again, check which branch Cloudflare is deploying.
3. Do not reintroduce `_redirects` fallback rules such as `/* /index.html 200`; they can conflict with Workers Static Assets.
