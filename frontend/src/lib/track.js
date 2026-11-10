/* Sends visitor actions to the backend. The server adds IP + country itself.
   Tracking never throws or blocks the page. */
// Keep local tracking same-origin through Vite's /api proxy.
const BASE = (import.meta.env.DEV ? "" : import.meta.env.VITE_API_URL || "")
  .replace(/\/+$/, "")
  .replace(/\/api$/i, "");

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

function trafficAttribution() {
  const key = "pf_attribution";
  try {
    const saved = sessionStorage.getItem(key);
    if (saved) return JSON.parse(saved);

    const params = new URLSearchParams(location.search);
    const referrer = document.referrer;
    const refHost = referrer ? new URL(referrer).hostname.replace(/^www\./, "") : "";
    const utmSource = params.get("utm_source")?.slice(0, 100);
    const source = utmSource || (refHost ? ( {
      "youtube.com": "YouTube", "youtu.be": "YouTube", "facebook.com": "Facebook",
      "m.facebook.com": "Facebook", "instagram.com": "Instagram", "google.com": "Google",
      "google.lk": "Google", "github.com": "GitHub", "linkedin.com": "LinkedIn",
      "t.co": "X", "x.com": "X", "twitter.com": "X", "tiktok.com": "TikTok",
      "reddit.com": "Reddit", "wa.me": "WhatsApp", "whatsapp.com": "WhatsApp",
    }[refHost] || refHost) : "Direct");
    const attribution = {
      source,
      medium: params.get("utm_medium")?.slice(0, 100) || (utmSource ? "Tagged" : refHost ? "Referral" : "Direct"),
      campaign: params.get("utm_campaign")?.slice(0, 150) || "",
      referrerHost: refHost,
    };
    sessionStorage.setItem(key, JSON.stringify(attribution));
    return attribution;
  } catch {
    return { source: "Direct", medium: "Direct", campaign: "", referrerHost: "" };
  }
}

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
        meta: { ...meta, attribution: trafficAttribution() },
        visitorId: visitorId(),
        sessionId: sessionId(),
        referrer: document.referrer.slice(0, 300),
      }),
    }).catch(() => {});
  } catch {
    /* ignore */
  }
}
