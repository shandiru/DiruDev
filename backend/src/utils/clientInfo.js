import geoip from "geoip-lite";

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

export function getIp(req) {
  const fwd = req.headers["x-forwarded-for"];
  let ip = (Array.isArray(fwd) ? fwd[0] : fwd || "").split(",")[0].trim() || req.socket?.remoteAddress || "";
  if (ip.startsWith("::ffff:")) ip = ip.slice(7);
  if (ip === "::1") ip = "127.0.0.1";
  return ip;
}

export function getGeo(req, ip) {
  // Hosting platforms (Cloudflare / Vercel) already send the country, prefer it.
  const hdr = req.headers["cf-ipcountry"] || req.headers["x-vercel-ip-country"];
  const g = geoip.lookup(ip) || {};
  const code = (hdr && hdr !== "XX" ? String(hdr) : g.country) || "";
  let country = "Unknown";
  try {
    if (code) country = regionNames.of(code.toUpperCase()) || code;
  } catch {
    country = code || "Unknown";
  }
  if (!code && /^(127\.|10\.|192\.168\.)/.test(ip)) country = "Local (dev)";
  return { country, countryCode: code, region: g.region || "", city: g.city || "" };
}

export function getDevice(ua = "") {
  if (/bot|crawl|spider|preview/i.test(ua)) return "bot";
  if (/tablet|ipad/i.test(ua)) return "tablet";
  if (/mobi|android|iphone/i.test(ua)) return "mobile";
  return "desktop";
}

export function clientInfo(req) {
  const ip = getIp(req);
  const ua = String(req.headers["user-agent"] || "").slice(0, 400);
  return { ip, userAgent: ua, device: getDevice(ua), ...getGeo(req, ip) };
}
