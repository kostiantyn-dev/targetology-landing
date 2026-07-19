export default {
  fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/googleb10e1b4f26160139.html") {
      return new Response(
        "google-site-verification: googleb10e1b4f26160139.html",
        {
          headers: {
            "content-type": "text/html; charset=utf-8",
            "cache-control": "public, max-age=0, must-revalidate",
          },
        }
      );
    }

    return env.ASSETS.fetch(request);
  },
};
