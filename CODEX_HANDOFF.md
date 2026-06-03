# Codex Handoff — HuntAgent AI

This repository contains the static web version of **HuntAgent AI**, an AI-powered hunting intelligence platform for trail-camera networks, target animal tracking, scouting reports, maps, predictions, device operations, industry intelligence, and contact/beta conversion.

## Current production status

- Repository: `kolaygm/huntagentai`
- Production branch: `main`
- Live domain: `https://huntagentai.com/`
- Worker preview URL: `https://huntagentai.kolaygm.workers.dev/`
- Known-good branch preview URL used during setup: `https://cloudflare-workers-autoconfig-huntagentai.kolaygm.workers.dev/`
- Deployment target: Cloudflare Workers + Static Assets, not traditional Pages output-only deployment.
- Deploy command: `npx wrangler deploy`

## Cloudflare configuration

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

Do not add D1 just to serve the current site. The current site is static and only needs the `ASSETS` binding. D1 may be added later for forms, article storage, users, or saved analysis history.

## File structure

```text
/
  CODEX_HANDOFF.md
  README.md
  wrangler.jsonc
  src/
    index.js
  public/
    index.html
    insights.html
    contact.html
    _headers
```

## Routes

`src/index.js` should stay a minimal Static Assets passthrough:

```js
return env.ASSETS.fetch(request);
```

Cloudflare Workers Static Assets handles extensionless HTML routes:

```text
/          -> public/index.html
/insights  -> public/insights.html
/contact   -> public/contact.html
```

Do not add manual Worker rewrites from `/insights` to `/insights.html` or `/contact` to `/contact.html`. Static Assets redirects direct `.html` requests back to extensionless URLs; combining those redirects with manual rewrites creates a 307 loop.

## Current pages

### `/`

Product workspace / command center demo.

Includes:

- Hunting Intelligence Command Center
- Agent Brief
- Hunt Score
- Tonight’s Action Plan
- Field Map & AI Hot Zones
- Smart Album
- Target Animal Profile
- Predictions & Pattern Analytics
- Agent Chat
- Trail Camera Event Stream
- Device Operations
- Industry Intelligence & Scouting Reports entry block
- Contact / Demo CTA
- Professional footer
- English / Chinese toggle

Brand copy has been updated away from the earlier unprofessional wording such as “Web hunting intelligence / 网页版猎场智能体”. Preferred positioning:

```text
HuntAgent AI
AI hunting intelligence platform
专业级 AI 猎场情报平台
```

### `/insights`

Industry intelligence and lead-generation content hub.

Includes:

- AI Trail Camera Buyer’s Guide
- Whitetail Movement Intelligence Brief
- Smart Camera Placement Playbook
- Smart Hunting Gear Radar
- Free Hunt Score mini-tool demo
- Contact / report request CTA
- English / Chinese toggle

This page should become the SEO and content-marketing hub. Prefer evergreen reports, buyer guides, gear radar, field notes, and hunting-tech intelligence over generic “news”.

### `/contact`

Contact and conversion page.

Intended audiences:

- Beta hunters
- Outfitters / guides
- Land managers
- Trail camera brands
- Dealers / distributors
- Investors / media
- Newsletter subscribers

The form is currently static and only shows a client-side success state. It does not submit data yet.

## Important deployment history / gotchas

1. The Cloudflare auto-generated branch `cloudflare/workers-autoconfig` had the correct preview while `main` was older.
2. The correct content and Worker config have now been synchronized into `main`.
3. If `https://cloudflare-workers-autoconfig-huntagentai.kolaygm.workers.dev/` and `https://huntagentai.kolaygm.workers.dev/` ever diverge again, check which branch Cloudflare is deploying.
4. `_redirects` previously had a fallback rule:

```text
/* /index.html 200
```

This caused an infinite-loop validation error under Workers Static Assets. Do not reintroduce that fallback.

Also do not add these rewrite rules in `src/index.js` or `public/_redirects`:

```text
/insights /insights.html 200
/contact /contact.html 200
```

Workers Static Assets already serves `/insights` and `/contact` from the corresponding `.html` files. Manual rewrites to `.html` can loop because direct `.html` requests are redirected back to extensionless URLs.

5. Production should deploy with:

```text
npx wrangler deploy
```

Avoid `npx wrangler versions upload` for normal production deployments unless you intentionally want to upload a version without routing production traffic to it.

## Recommended next work for Codex

### Phase 1 — Stabilization

- Verify `main` is the only production source branch.
- Confirm `https://huntagentai.com/`, `/insights`, and `/contact` all render the latest version.
- Remove or close stale Cloudflare autoconfig PRs if they are no longer needed.
- Add a simple visual smoke test checklist in the repo.
- Improve HTML formatting. Current files are mostly single-file static pages with compressed CSS/HTML, which makes future edits harder.

### Phase 2 — Contact and lead capture

Implement a real form backend. Recommended options:

1. Cloudflare Workers + email notification.
2. Cloudflare Workers + D1 lead storage.
3. External form service such as Formspree, Formspark, Tally, HubSpot, Mailchimp, or Beehiiv.

Minimum lead fields:

- Name
- Email
- User type: hunter / outfitter / land manager / camera brand / dealer / investor / media
- Target species
- Number of trail cameras
- Primary problem to solve
- Consent to receive follow-up emails

### Phase 3 — Content and SEO

Build the `/insights` hub into structured pages:

```text
/insights/ai-trail-camera-buyers-guide
/insights/whitetail-movement-intelligence
/insights/smart-camera-placement-playbook
/insights/smart-hunting-gear-radar
/tools/hunt-score
/tools/trail-camera-roi
/partners/trail-camera-brands
```

Use professional positioning:

```text
Industry Intelligence
Hunting Tech Intelligence
Scouting Reports
Gear Radar
Buyer Guides
Field Notes
```

Avoid generic “News” unless there is a clear editorial process and dated source verification.

### Phase 4 — Product evolution

Move from static demo to real web app features:

- Account login
- Trail camera data import
- Photo upload and AI analysis
- Event database
- Target animal profiles
- Hunt Score calculation
- Map layers
- Device health tracking
- Weekly scouting reports
- Team/workspace sharing

Likely Cloudflare resources when needed:

- D1 for relational data: users, leads, events, target profiles, reports
- R2 for images / uploaded trail-camera media
- KV for lightweight config and cached content
- Queues for async photo-processing workflows
- Workers AI / external AI APIs for inference and agent orchestration

## Brand and UX notes

Primary name:

```text
HuntAgent AI
```

Preferred English tagline options:

```text
AI hunting intelligence platform.
Turn trail-camera data into hunting decisions.
Your AI command center for trail-camera intelligence.
```

Preferred Chinese positioning:

```text
专业级 AI 猎场情报平台
面向打猎相机网络的 AI 决策引擎
基于打猎相机数据的 AI 猎场智能
```

Avoid wording that sounds casual or amateur, such as:

```text
网页版猎场智能体
普通 App 页面
聊天机器人
```

## Safety and compliance copy

Keep a visible safety note somewhere in the footer or product flow:

```text
Safety note: Always verify local hunting laws, seasons, permissions, legal shooting light, and safe field practices.
```

Chinese:

```text
安全提示：请自行确认本地狩猎法规、猎季、土地许可、合法射击时间和安全户外操作。
```

## Immediate Codex maintenance task list

- [ ] Confirm Cloudflare production deploy uses `main` and `npx wrangler deploy`.
- [ ] Check live routes: `/`, `/insights`, `/contact`.
- [ ] Close or supersede stale PR #1 if it no longer applies.
- [ ] Refactor static HTML into maintainable components or templates.
- [ ] Implement real contact form submission.
- [ ] Add a simple privacy/contact disclaimer.
- [ ] Create first real content article for `/insights`.
- [ ] Add analytics with privacy-conscious tracking.
- [ ] Add a changelog or release notes section for future handoffs.
