export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/insights") {
      return env.ASSETS.fetch(new Request(new URL("/insights.html", url), request));
    }

    if (url.pathname === "/contact") {
      return env.ASSETS.fetch(new Request(new URL("/contact.html", url), request));
    }

    return env.ASSETS.fetch(request);
  }
};
