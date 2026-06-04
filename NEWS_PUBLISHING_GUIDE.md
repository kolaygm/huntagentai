# HuntAgent AI News Publishing Guide

The public news page is `/news`.

## Add a news item

Edit:

```text
public/news-data.js
```

Add one object to `window.HUNTAGENT_NEWS`:

```js
{
  id: "unique-url-safe-id",
  type: "Event Watch",
  category: "Trail Cameras",
  date: "2026-06-04",
  location: "North America",
  title: "Brief title",
  deck: "One short hunter-facing summary.",
  image: "/news-assets/your-image.jpg",
  tags: ["trail cameras", "AI scouting"],
  body: [
    "Paragraph one.",
    "Paragraph two."
  ],
  sourceLabel: "Source name",
  sourceUrl: "https://example.com/source"
}
```

## Upload images

Place owned or licensed images in:

```text
public/news-assets/
```

Then reference them as:

```text
/news-assets/image-name.jpg
```

## Editorial standard

- Write for hunters first.
- Translate every event or announcement into field impact.
- Include one source link for event dates, company announcements, or factual claims.
- Avoid internal roadmap language, placeholders, and public-facing testing labels.
- Keep titles direct: what happened, why it matters, and what a hunter can do with it.
