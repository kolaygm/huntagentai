const feedbackForms = document.querySelectorAll("[data-feedback-form]");

feedbackForms.forEach((form) => {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submitButton = form.querySelector("button[type='submit']");
    const success = form.querySelector("[data-form-success]");
    const error = form.querySelector("[data-form-error]");

    setFormMessage(success, "");
    setFormMessage(error, "");
    setSubmitting(submitButton, true);

    try {
      const payload = formToPayload(form);
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Request failed.");
      }

      form.reset();
      setFormMessage(success, localizedText(success, "Request received."));
    } catch (err) {
      setFormMessage(error, err.message || "Unable to send. Please try again.");
    } finally {
      setSubmitting(submitButton, false);
    }
  });
});

function formToPayload(form) {
  const payload = Object.fromEntries(new FormData(form).entries());
  payload.type = payload.type || form.dataset.feedbackType || "feedback";
  payload.source = "website";
  return payload;
}

function setFormMessage(element, message) {
  if (!element) return;
  element.textContent = message;
  element.style.display = message ? "block" : "none";
}

function setSubmitting(button, isSubmitting) {
  if (!button) return;
  button.disabled = isSubmitting;
  if (!button.dataset.defaultText) button.dataset.defaultText = button.textContent;
  button.textContent = isSubmitting ? "Sending..." : button.dataset.defaultText;
}

function localizedText(element, fallback) {
  if (!element) return fallback;
  const language = document.documentElement.lang?.toLowerCase().startsWith("zh") ? "zh" : "en";
  return element.dataset[language] || element.dataset.en || element.textContent || fallback;
}

const adminApp = document.querySelector("[data-feedback-admin]");

if (adminApp) {
  initFeedbackAdmin(adminApp);
}

function initFeedbackAdmin(app) {
  const tokenInput = app.querySelector("[data-admin-token]");
  const saveToken = app.querySelector("[data-save-token]");
  const refresh = app.querySelector("[data-refresh-feedback]");
  const list = app.querySelector("[data-feedback-list]");
  const statusFilter = app.querySelector("[data-status-filter]");
  const typeFilter = app.querySelector("[data-type-filter]");
  const searchInput = app.querySelector("[data-search-feedback]");
  const stats = app.querySelector("[data-feedback-stats]");
  const error = app.querySelector("[data-admin-error]");

  const url = new URL(window.location.href);
  const tokenFromUrl = url.searchParams.get("token");
  if (tokenFromUrl) {
    sessionStorage.setItem("huntagent-feedback-token", tokenFromUrl);
    url.searchParams.delete("token");
    window.history.replaceState({}, "", url.pathname + url.search);
  }

  tokenInput.value = sessionStorage.getItem("huntagent-feedback-token") || "";

  saveToken.addEventListener("click", () => {
    sessionStorage.setItem("huntagent-feedback-token", tokenInput.value.trim());
    loadFeedback();
  });

  refresh.addEventListener("click", loadFeedback);
  statusFilter.addEventListener("change", loadFeedback);
  typeFilter.addEventListener("change", loadFeedback);
  searchInput.addEventListener("input", debounce(loadFeedback, 250));

  async function loadFeedback() {
    const token = tokenInput.value.trim();
    if (!token) {
      showAdminError("Enter the admin token.");
      return;
    }

    showAdminError("");
    list.innerHTML = "<div class=\"admin-empty\">Loading feedback...</div>";

    const params = new URLSearchParams();
    if (statusFilter.value) params.set("status", statusFilter.value);
    if (typeFilter.value) params.set("type", typeFilter.value);
    if (searchInput.value.trim()) params.set("q", searchInput.value.trim());

    try {
      const response = await fetch(`/api/admin/feedback?${params.toString()}`, {
        headers: { authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || "Unable to load feedback.");
      renderStats(data.stats || {});
      renderList(data.items || []);
    } catch (err) {
      list.innerHTML = "";
      showAdminError(err.message || "Unable to load feedback.");
    }
  }

  async function updateStatus(id, status) {
    const token = tokenInput.value.trim();
    const response = await fetch(`/api/admin/feedback/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({ status })
    });
    const data = await response.json();
    if (!response.ok || !data.ok) throw new Error(data.error || "Unable to update status.");
    await loadFeedback();
  }

  function renderStats(values) {
    const order = ["new", "reviewing", "responded", "closed", "archived"];
    stats.innerHTML = order
      .map((status) => `<div class="stat-pill"><b>${values[status] || 0}</b><span>${escapeHtml(status)}</span></div>`)
      .join("");
  }

  function renderList(items) {
    if (!items.length) {
      list.innerHTML = "<div class=\"admin-empty\">No feedback found.</div>";
      return;
    }

    list.innerHTML = items.map((item) => {
      const meta = item.meta || {};
      return `
        <article class="feedback-item">
          <div class="feedback-time">
            <b>${formatDate(item.created_at)}</b>
            <span>${escapeHtml(item.status)}</span>
          </div>
          <div class="feedback-body">
            <div class="feedback-head">
              <div>
                <span class="tag">${escapeHtml(item.type)}</span>
                <span class="tag amber">${escapeHtml(item.category)}</span>
                <h3>${escapeHtml(item.title)}</h3>
              </div>
              <select class="input feedback-status" data-item-status="${escapeHtml(item.id)}">
                ${["new", "reviewing", "responded", "closed", "archived"].map((status) => `<option value="${status}" ${status === item.status ? "selected" : ""}>${status}</option>`).join("")}
              </select>
            </div>
            <div class="feedback-meta">
              <span>${escapeHtml(item.name || "Hunter")}</span>
              <span>${escapeHtml(item.email || "No email")}</span>
              <span>${escapeHtml(meta.region || "No region")}</span>
              <span>${escapeHtml(meta.cameraCount || "No camera count")}</span>
              <span>${escapeHtml(meta.targetSpecies || "No target species")}</span>
              <span>Email: ${escapeHtml(item.email_status || "not_configured")}</span>
            </div>
            <p>${escapeHtml(item.content)}</p>
          </div>
        </article>
      `;
    }).join("");

    list.querySelectorAll("[data-item-status]").forEach((select) => {
      select.addEventListener("change", async () => {
        try {
          await updateStatus(select.dataset.itemStatus, select.value);
        } catch (err) {
          showAdminError(err.message || "Unable to update status.");
        }
      });
    });

    window.HuntAgentUI?.enhanceSelects(list);
  }

  function showAdminError(message) {
    error.textContent = message;
    error.style.display = message ? "block" : "none";
  }

  loadFeedback();
}

function formatDate(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
