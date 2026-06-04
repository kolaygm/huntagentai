# HuntAgent AI

Formal website for **HuntAgent AI**, an AI hunting intelligence platform for serious hunters using trail-camera data, field notes, weather, wind, maps, target animal profiles, planning, prediction, and post-hunt recap workflows.

## Cloudflare deployment

This project deploys as **Cloudflare Workers + Static Assets**.

- Production branch: `main`
- Worker entry: `src/index.js`
- Static asset directory: `public`
- Config: `wrangler.jsonc`
- Deploy command: `npx wrangler deploy`

Cloudflare Static Assets handles extensionless HTML routes by default:

- `/` serves `public/index.html`
- `/insights` serves `public/insights.html`
- `/news` serves `public/news.html`
- `/contact` serves `public/contact.html`
- `/feedback` serves `public/feedback.html`
- `/feedback-admin` serves `public/feedback-admin.html`

Do not add manual Worker rewrites from extensionless paths to `.html` files. Static Assets redirects direct `.html` requests back to extensionless paths, so manual rewrites can create redirect loops.

## Files

- `public/index.html` - HuntAgent AI command center homepage
- `public/insights.html` - field intelligence and AI hunting workflow page
- `public/news.html` - industry news and event brief page
- `public/news-data.js` - editable news and event data
- `public/news-assets/` - uploaded news images
- `public/contact.html` - hunter access request page
- `public/feedback.html` - public feedback page
- `public/feedback-admin.html` - token-protected feedback management page
- `public/styles.css` - shared visual system
- `public/app.js` - language toggle
- `public/feedback.js` - contact, feedback, and admin interactions
- `public/news.js` - news page rendering and filters
- `src/index.js` - Worker API routes and Static Assets passthrough
- `migrations/0001_feedback.sql` - D1 feedback schema
- `FEEDBACK_SETUP.md` - feedback backend setup
- `NEWS_PUBLISHING_GUIDE.md` - news publishing workflow

## Content updates

For industry news and event briefs, update `public/news-data.js` and place owned or licensed images in `public/news-assets/`.

For feedback storage and email notifications, configure Cloudflare D1 and secrets following `FEEDBACK_SETUP.md`.
