const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store"
};

const VALID_STATUSES = new Set(["new", "reviewing", "responded", "closed", "archived"]);
const VALID_TYPES = new Set(["access", "feedback"]);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS" && url.pathname.startsWith("/api/")) {
      return new Response(null, { headers: apiHeaders() });
    }

    if (url.pathname === "/api/feedback" && request.method === "POST") {
      return handleCreateFeedback(request, env);
    }

    if (url.pathname === "/api/admin/feedback" && request.method === "GET") {
      return handleListFeedback(request, env);
    }

    const updateMatch = url.pathname.match(/^\/api\/admin\/feedback\/([^/]+)$/);
    if (updateMatch && request.method === "PATCH") {
      return handleUpdateFeedback(request, env, updateMatch[1]);
    }

    return env.ASSETS.fetch(request);
  }
};

async function handleCreateFeedback(request, env) {
  if (!env.FEEDBACK_DB) {
    return jsonResponse({ ok: false, error: "Feedback storage is not configured." }, 503);
  }

  await ensureSchema(env);
  const payload = await readPayload(request);
  const normalized = normalizeFeedback(payload);

  if (normalized.company) {
    return jsonResponse({ ok: true, id: crypto.randomUUID() });
  }

  const validationError = validateFeedback(normalized);
  if (validationError) {
    return jsonResponse({ ok: false, error: validationError }, 400);
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const meta = {
    region: normalized.region,
    cameraCount: normalized.cameraCount,
    targetSpecies: normalized.targetSpecies,
    mainNeed: normalized.mainNeed,
    sourcePage: normalized.sourcePage,
    userAgent: request.headers.get("user-agent") || "",
    country: request.cf?.country || ""
  };

  await env.FEEDBACK_DB.prepare(
    `INSERT INTO feedback
      (id, created_at, updated_at, type, status, name, email, category, title, content, source, meta_json, email_status)
     VALUES (?, ?, ?, ?, 'new', ?, ?, ?, ?, ?, ?, ?, 'pending')`
  )
    .bind(
      id,
      now,
      now,
      normalized.type,
      normalized.name,
      normalized.email,
      normalized.category,
      normalized.title,
      normalized.content,
      normalized.source,
      JSON.stringify(meta)
    )
    .run();

  const emailStatus = await notifyByEmail(env, { ...normalized, id, createdAt: now, meta });
  await env.FEEDBACK_DB.prepare(
    "UPDATE feedback SET email_status = ?, updated_at = ? WHERE id = ?"
  )
    .bind(emailStatus, new Date().toISOString(), id)
    .run();

  return jsonResponse({ ok: true, id, emailStatus });
}

async function handleListFeedback(request, env) {
  const authError = requireAdmin(request, env);
  if (authError) return authError;
  if (!env.FEEDBACK_DB) {
    return jsonResponse({ ok: false, error: "Feedback storage is not configured." }, 503);
  }

  await ensureSchema(env);
  const url = new URL(request.url);
  const status = (url.searchParams.get("status") || "").trim();
  const type = (url.searchParams.get("type") || "").trim();
  const q = (url.searchParams.get("q") || "").trim().toLowerCase();

  const clauses = [];
  const binds = [];

  if (status && VALID_STATUSES.has(status)) {
    clauses.push("status = ?");
    binds.push(status);
  }

  if (type && VALID_TYPES.has(type)) {
    clauses.push("type = ?");
    binds.push(type);
  }

  if (q) {
    clauses.push("(lower(name) LIKE ? OR lower(email) LIKE ? OR lower(title) LIKE ? OR lower(content) LIKE ? OR lower(category) LIKE ?)");
    const like = `%${q}%`;
    binds.push(like, like, like, like, like);
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const { results } = await env.FEEDBACK_DB.prepare(
    `SELECT id, created_at, updated_at, type, status, name, email, category, title, content, source, meta_json, email_status
     FROM feedback
     ${where}
     ORDER BY datetime(created_at) DESC
     LIMIT 250`
  )
    .bind(...binds)
    .all();

  const stats = await getStats(env);
  return jsonResponse({ ok: true, items: results.map(parseFeedbackRow), stats });
}

async function handleUpdateFeedback(request, env, id) {
  const authError = requireAdmin(request, env);
  if (authError) return authError;
  if (!env.FEEDBACK_DB) {
    return jsonResponse({ ok: false, error: "Feedback storage is not configured." }, 503);
  }

  await ensureSchema(env);
  const payload = await readPayload(request);
  const status = String(payload.status || "").trim();

  if (!VALID_STATUSES.has(status)) {
    return jsonResponse({ ok: false, error: "Invalid status." }, 400);
  }

  const now = new Date().toISOString();
  const result = await env.FEEDBACK_DB.prepare(
    "UPDATE feedback SET status = ?, updated_at = ? WHERE id = ?"
  )
    .bind(status, now, id)
    .run();

  if (!result.meta?.changes) {
    return jsonResponse({ ok: false, error: "Feedback item not found." }, 404);
  }

  return jsonResponse({ ok: true, id, status, updatedAt: now });
}

async function readPayload(request) {
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return request.json();
  }
  if (contentType.includes("form")) {
    const form = await request.formData();
    return Object.fromEntries(form.entries());
  }
  return {};
}

function normalizeFeedback(payload) {
  const type = clean(payload.type || payload.feedback_type || "feedback").toLowerCase();
  const category = clean(payload.category || payload.main_need || payload.target_species || "General");
  const title = clean(payload.title || payload.main_need || payload.category || "HuntAgent AI request");
  const content = clean(payload.content || payload.message || payload.feedback || "");

  return {
    type: VALID_TYPES.has(type) ? type : "feedback",
    name: clean(payload.name || "Hunter"),
    email: clean(payload.email || ""),
    category,
    title,
    content,
    source: clean(payload.source || "web"),
    region: clean(payload.region || ""),
    cameraCount: clean(payload.camera_count || payload.cameraCount || ""),
    targetSpecies: clean(payload.target_species || payload.targetSpecies || ""),
    mainNeed: clean(payload.main_need || payload.mainNeed || ""),
    sourcePage: clean(payload.source_page || payload.sourcePage || ""),
    company: clean(payload.company || "")
  };
}

function validateFeedback(item) {
  if (item.content.length < 8) return "Please include more detail.";
  if (item.content.length > 5000) return "Message is too long.";
  if (item.name.length > 120) return "Name is too long.";
  if (item.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item.email)) return "Email is not valid.";
  if (item.title.length > 160) return "Title is too long.";
  if (item.category.length > 80) return "Category is too long.";
  return "";
}

async function ensureSchema(env) {
  await env.FEEDBACK_DB.batch([
    env.FEEDBACK_DB.prepare(
      `CREATE TABLE IF NOT EXISTS feedback (
        id TEXT PRIMARY KEY,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'feedback',
        status TEXT NOT NULL DEFAULT 'new',
        name TEXT NOT NULL DEFAULT '',
        email TEXT NOT NULL DEFAULT '',
        category TEXT NOT NULL DEFAULT 'General',
        title TEXT NOT NULL DEFAULT '',
        content TEXT NOT NULL,
        source TEXT NOT NULL DEFAULT 'web',
        meta_json TEXT NOT NULL DEFAULT '{}',
        email_status TEXT NOT NULL DEFAULT 'not_configured'
      )`
    ),
    env.FEEDBACK_DB.prepare("CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC)"),
    env.FEEDBACK_DB.prepare("CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status)"),
    env.FEEDBACK_DB.prepare("CREATE INDEX IF NOT EXISTS idx_feedback_type ON feedback(type)")
  ]);
}

async function getStats(env) {
  const { results } = await env.FEEDBACK_DB.prepare(
    "SELECT status, COUNT(*) AS count FROM feedback GROUP BY status"
  ).all();

  return results.reduce((acc, row) => {
    acc[row.status] = row.count;
    return acc;
  }, {});
}

async function notifyByEmail(env, item) {
  if (!env.RESEND_API_KEY) return "not_configured";

  const to = env.FEEDBACK_TO_EMAIL || "aicodeclaw@gmail.com";
  const from = env.FEEDBACK_FROM_EMAIL || "HuntAgent AI <onboarding@resend.dev>";
  const adminUrl = env.FEEDBACK_ADMIN_URL || "https://huntagentai.com/feedback-admin";
  const subject = `[HuntAgent AI] ${item.type === "access" ? "Access request" : "Feedback"}: ${item.title}`;
  const text = [
    `Time: ${item.createdAt}`,
    `Name: ${item.name}`,
    `Email: ${item.email || "(not provided)"}`,
    `Type: ${item.type}`,
    `Category: ${item.category}`,
    `Title: ${item.title}`,
    `Region: ${item.meta.region || "(not provided)"}`,
    `Trail cameras: ${item.meta.cameraCount || "(not provided)"}`,
    `Target species: ${item.meta.targetSpecies || "(not provided)"}`,
    "",
    item.content,
    "",
    `Admin: ${adminUrl}`
  ].join("\n");

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "authorization": `Bearer ${env.RESEND_API_KEY}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({ from, to, subject, text })
    });

    return response.ok ? "sent" : `failed_${response.status}`;
  } catch {
    return "failed_network";
  }
}

function requireAdmin(request, env) {
  const expected = env.FEEDBACK_ADMIN_TOKEN;
  if (!expected) {
    return jsonResponse({ ok: false, error: "Admin token is not configured." }, 503);
  }

  const url = new URL(request.url);
  const header = request.headers.get("authorization") || "";
  const token = header.replace(/^Bearer\s+/i, "") || url.searchParams.get("token") || "";

  if (!token || token !== expected) {
    return jsonResponse({ ok: false, error: "Unauthorized." }, 401);
  }

  return null;
}

function parseFeedbackRow(row) {
  return {
    ...row,
    meta: safeJson(row.meta_json)
  };
}

function safeJson(value) {
  try {
    return JSON.parse(value || "{}");
  } catch {
    return {};
  }
}

function clean(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: apiHeaders()
  });
}

function apiHeaders() {
  return {
    ...JSON_HEADERS,
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,PATCH,OPTIONS",
    "access-control-allow-headers": "content-type,authorization"
  };
}
