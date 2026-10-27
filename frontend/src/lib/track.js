/* Sends visitor actions to the backend. The server adds IP + country itself.
   Tracking never throws or blocks the page. */
// Keep local tracking same-origin through Vite's /api proxy.
const BASE = (import.meta.env.DEV ? "" : import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

function stored(storage, key) {
  try {
    let v = storage.getItem(key);
    if (!v) {
      v = (crypto.randomUUID?.() || String(Math.random()).slice(2) + Date.now()).replace(/-/g, "");
      storage.setItem(key, v);
    }
    return v;
  } catch {
    return "";
  }
}

export const visitorId = () => stored(window.localStorage, "pf_vid");
const sessionId = () => stored(window.sessionStorage, "pf_sid");

export function track(type, label = "", meta = {}) {
  try {
    if (location.pathname.startsWith("/admin")) return;
    fetch(`${BASE}/api/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        type,
        label: String(label).slice(0, 200),
        path: location.pathname + location.hash,
        meta,
        visitorId: visitorId(),
        sessionId: sessionId(),
        referrer: document.referrer.slice(0, 300),
      }),
    }).catch(() => {});
  } catch {
    /* ignore */
  }
}
