const newsRoot = document.querySelector("[data-news-root]");

if (newsRoot) {
  const allItems = Array.isArray(window.HUNTAGENT_NEWS) ? window.HUNTAGENT_NEWS : [];
  initNewsPage(allItems);
}

function initNewsPage(items) {
  const categoryFilter = document.querySelector("[data-news-category]");
  const typeFilter = document.querySelector("[data-news-type]");
  const searchInput = document.querySelector("[data-news-search]");
  const grid = document.querySelector("[data-news-grid]");
  const featured = document.querySelector("[data-news-featured]");
  const calendar = document.querySelector("[data-news-calendar]");
  const count = document.querySelector("[data-news-count]");

  const sorted = [...items].sort((a, b) => b.date.localeCompare(a.date));
  renderOptions(categoryFilter, unique(sorted.map((item) => item.category)), "All categories");
  renderOptions(typeFilter, unique(sorted.map((item) => item.type)), "All formats");
  renderFeatured(featured, sorted[0]);
  renderCalendar(calendar, sorted);

  const update = () => {
    const category = categoryFilter.value;
    const type = typeFilter.value;
    const query = searchInput.value.trim().toLowerCase();
    const visible = sorted.filter((item) => {
      const haystack = [
        item.title,
        item.deck,
        item.category,
        item.type,
        item.location,
        ...(item.tags || [])
      ].join(" ").toLowerCase();
      return (!category || item.category === category) && (!type || item.type === type) && (!query || haystack.includes(query));
    });
    renderGrid(grid, visible);
    if (count) count.textContent = `${visible.length} briefs`;
  };

  categoryFilter.addEventListener("change", update);
  typeFilter.addEventListener("change", update);
  searchInput.addEventListener("input", debounce(update, 180));
  update();
}

function renderFeatured(element, item) {
  if (!element || !item) return;
  element.style.setProperty("--news-image", `url('${item.image}')`);
  element.innerHTML = `
    <span class="kicker">${escapeHtml(item.type)}</span>
    <h1>${escapeHtml(item.title)}</h1>
    <p class="lead">${escapeHtml(item.deck)}</p>
    <div class="news-meta">
      <span>${formatDate(item.date)}</span>
      <span>${escapeHtml(item.category)}</span>
      <span>${escapeHtml(item.location)}</span>
    </div>
    <div class="hero-actions">
      <a class="btn" href="#news-list">Read latest briefs</a>
      <a class="btn secondary" href="${escapeHtml(item.sourceUrl)}">Source</a>
    </div>
  `;
}

function renderCalendar(element, items) {
  if (!element) return;
  element.innerHTML = items.slice(0, 4).map((item) => `
    <article class="calendar-row">
      <div>
        <b>${formatMonthDay(item.date)}</b>
        <span>${escapeHtml(item.type)}</span>
      </div>
      <div>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.location)}</p>
      </div>
    </article>
  `).join("");
}

function renderGrid(element, items) {
  if (!element) return;
  if (!items.length) {
    element.innerHTML = '<div class="admin-empty">No matching briefs found.</div>';
    return;
  }

  element.innerHTML = items.map((item) => `
    <article class="news-card card">
      <div class="news-thumb" style="--news-image:url('${escapeHtml(item.image)}')"></div>
      <div class="news-card-body">
        <div class="card-top">
          <span class="tag">${escapeHtml(item.type)}</span>
          <span class="tag amber">${formatDate(item.date)}</span>
        </div>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.deck)}</p>
        <div class="news-tags">
          ${(item.tags || []).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}
        </div>
        <details class="news-detail">
          <summary>Brief notes</summary>
          ${(item.body || []).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}
          <a href="${escapeHtml(item.sourceUrl)}">${escapeHtml(item.sourceLabel)}</a>
        </details>
      </div>
    </article>
  `).join("");
}

function renderOptions(select, values, label) {
  if (!select) return;
  select.innerHTML = [`<option value="">${label}</option>`, ...values.map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`)].join("");
}

function unique(values) {
  return [...new Set(values.filter(Boolean))].sort();
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "2-digit", year: "numeric" }).format(new Date(`${value}T00:00:00Z`));
}

function formatMonthDay(value) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "2-digit" }).format(new Date(`${value}T00:00:00Z`));
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
