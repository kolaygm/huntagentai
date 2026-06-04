# HuntAgent AI Website Completion Checklist

Use this checklist before treating the public HuntAgent AI website as ready for production.

## Product Positioning

- Product name is always `HuntAgent AI`.
- Repository and working directory are `X:\ai\huntagentai`.
- Public audience is serious hunters first.
- The first-stage message is an AI hunting agent that helps hunters analyze, predict, plan, execute, and recap hunts.
- Do not lead with dealer cooperation, outfitter SaaS, land manager SaaS, investor strategy, ecosystem roadmap, or internal objectives.
- Do not use `WildMind`, `HuntGPT`, placeholder brands, or reference-image text.

## Public Page Standard

- The homepage must show value immediately: trail-camera intelligence, target animal profiles, field maps, movement prediction, hunt plans, device stewardship, evidence, and recap.
- Use real outdoor, deer, map, and hunting intelligence visuals. Avoid cartoon animals or toy-like graphics.
- Keep the tone formal and hunter-facing. Remove public-facing `demo`, `test`, `testing`, `beta`, `placeholder`, `Safety note`, `TODO`, and internal planning language.
- Do not show implementation goals, future roadmap notes, or design rationale to hunters.
- Copy should explain what the AI agent can do through concrete outputs, not long abstract descriptions.

## Core Pages

- `/` is the hunting intelligence command center.
- `/insights` is field intelligence: maps, albums, target profiles, predictions, agent conversation, and post-hunt learning.
- `/news` is the industry news and event brief page.
- `/contact` is the hunter access request page.
- `/feedback` is the public feedback page.
- `/feedback-admin` is the token-protected feedback management page.

## Visual And Interaction Requirements

- Top navigation, sidebar navigation, language state, and page styling must feel consistent across all pages.
- Avoid duplicate brand/logo blocks in the same visual region.
- Language choice must persist through `localStorage` and apply across pages.
- Map modules should look like real field intelligence, not decorative diagrams.
- Hunting map layers should include water, food, bedding cover, supply or parking, stand position, camera points, animal tracks, movement routes, heat zones, and property context where relevant.
- Device operations should present cameras as intelligent field assets: battery runway, signal quality, angle, facing direction, lens cleanliness, false triggers, storage, service risk, and recommended actions.
- The generated hunt plan must feel like a professional AI output with map context, timing, route logic, evidence, risks, checklist, and field actions.

## Data And Admin Features

- Access requests and feedback use `POST /api/feedback`.
- Admin feedback list uses `GET /api/admin/feedback`.
- Feedback status updates use `PATCH /api/admin/feedback/:id`.
- Feedback storage requires the Cloudflare D1 binding `FEEDBACK_DB`.
- Admin access requires `FEEDBACK_ADMIN_TOKEN`.
- Optional email notifications require `RESEND_API_KEY`.
- News and event briefs are edited in `public/news-data.js`.
- News images should be owned or licensed and placed in `public/news-assets/`.

## Pre-Release Checks

Run these checks before committing:

```powershell
git status --short --branch
rg -n -i '\b(demo|test|testing|beta|safety note|wildmind|huntgpt|lorem|TODO|FIXME)\b' public
node --check public/news.js
node --check public/feedback.js
Get-Content src/index.js -Raw | node --input-type=module --check
```

For visual changes, inspect at least desktop and mobile widths. Confirm:

- Hero image and real map layers render correctly.
- No text overlaps.
- Navigation is not duplicated.
- Language switching updates the current page and remains consistent after navigation.
- `Generate tonight's plan` opens the full plan view.
- Feedback and contact forms submit to the API when Cloudflare bindings are configured.

## Release Steps

1. Work only in `X:\ai\huntagentai`.
2. Confirm the branch is `main` or merge the finished branch into `main`.
3. Review the diff and confirm only intended website files changed.
4. Run the pre-release checks.
5. Commit with a focused message.
6. Push `main` to GitHub.
7. Confirm Cloudflare is deploying from `main`.
8. If auto-deploy is not enabled or the production domain does not update, run:

```powershell
npx wrangler deploy
```

## Deployment Notes

- Production branch is `main`.
- Static assets live in `public`.
- Worker entry is `src/index.js`.
- Config is `wrangler.jsonc`.
- Do not add manual Worker rewrites from extensionless routes to `.html`; Cloudflare Static Assets already handles extensionless HTML routes.
- Do not reintroduce broad `_redirects` fallback rules such as `/* /index.html 200`.
