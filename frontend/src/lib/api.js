// In development, use Vite's /api proxy to avoid localhost host/port CORS mismatches.
// Production builds use the configured backend URL.
const BASE = (import.meta.env.DEV ? "" : import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
const TOKEN_KEY = "pf_admin_token";

export const getToken = () => {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
};
export const setToken = (t) => {
  try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ }
};

async function request(path, { method = "GET", body, auth = false } = {}) {
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(BASE) && !["localhost", "127.0.0.1"].includes(window.location.hostname)) {
    throw new Error("Admin API is configured for localhost. Set VITE_API_URL to the deployed backend URL and rebuild the frontend.");
  }
  const headers = {};
  if (body) headers["Content-Type"] = "application/json";
  if (auth && getToken()) headers.Authorization = `Bearer ${getToken()}`;
  let res;
  try {
    res = await fetch(`${BASE}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  } catch {
    throw new Error("Cannot reach the server. Is the backend running?");
  }
  const data = await res.json().catch(() => null);
  if (!data || typeof data !== "object") {
    throw new Error("The API returned an invalid response. Check VITE_API_URL and confirm the backend is running.");
  }
  if (!res.ok) {
    if (res.status === 401 && auth) {
      setToken(null);
      window.dispatchEvent(new Event("admin-logout"));
    }
    throw new Error(data.message || `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  get: (p) => request(p),
  post: (p, body) => request(p, { method: "POST", body }),
};
export const adminApi = {
  get: (p) => request(`/api/admin${p}`, { auth: true }),
  post: (p, body) => request(`/api/admin${p}`, { method: "POST", body, auth: true }),
  put: (p, body) => request(`/api/admin${p}`, { method: "PUT", body, auth: true }),
  patch: (p, body) => request(`/api/admin${p}`, { method: "PATCH", body, auth: true }),
  del: (p) => request(`/api/admin${p}`, { method: "DELETE", auth: true }),
};
