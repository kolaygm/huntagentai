# HuntAgent AI Feedback Backend

The site now supports:

- `POST /api/feedback` for access requests and field feedback.
- `GET /api/admin/feedback` for the token-protected feedback list.
- `PATCH /api/admin/feedback/:id` for status updates.
- `/feedback` as the public feedback page.
- `/feedback-admin?token=...` as the management page.

## Cloudflare setup

Create a D1 database:

```bash
npx wrangler d1 create huntagentai-feedback
```

Add the returned database id to `wrangler.jsonc`:

```jsonc
"d1_databases": [
  {
    "binding": "FEEDBACK_DB",
    "database_name": "huntagentai-feedback",
    "database_id": "YOUR_D1_DATABASE_ID"
  }
]
```

Apply the schema:

```bash
npx wrangler d1 execute huntagentai-feedback --file=./migrations/0001_feedback.sql
```

For the production Cloudflare database, add `--remote`:

```bash
npx wrangler d1 execute huntagentai-feedback --remote --file=./migrations/0001_feedback.sql
```

Set the admin token:

```bash
npx wrangler secret put FEEDBACK_ADMIN_TOKEN
```

Open the management page:

```text
https://huntagentai.com/feedback-admin?token=YOUR_TOKEN
```

The page stores the token in session storage and removes it from the URL.

## Email notification

Submissions are always stored in D1. To also send each request to the inbox, configure a Resend API key:

```bash
npx wrangler secret put RESEND_API_KEY
```

Optional variables:

```bash
npx wrangler secret put FEEDBACK_TO_EMAIL
npx wrangler secret put FEEDBACK_FROM_EMAIL
npx wrangler secret put FEEDBACK_ADMIN_URL
```

Defaults:

- `FEEDBACK_TO_EMAIL`: `aicodeclaw@gmail.com`
- `FEEDBACK_FROM_EMAIL`: `HuntAgent AI <onboarding@resend.dev>`
- `FEEDBACK_ADMIN_URL`: `https://huntagentai.com/feedback-admin`

For production, use a verified sender domain for `FEEDBACK_FROM_EMAIL`.
