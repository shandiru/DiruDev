import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { api, getToken, setToken } from "../lib/api.js";
import { btnPrimary, field } from "../ui.jsx";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (getToken()) return <Navigate to="/admin" replace />;

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const r = await api.post("/api/admin/login", { email, password });
      if (!r.token) throw new Error("The server did not return a login token. Check the backend API configuration.");
      setToken(r.token);
      nav("/admin", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center px-5">
      <form onSubmit={submit} className="grid w-full max-w-sm gap-4  border border-line bg-surface p-7">
        <Link to="/" aria-label="DIRU DEV home" className="mb-2 inline-flex w-fit items-baseline gap-2 tracking-[-0.06em]">
          <span className="text-xl font-black text-ink">DIRU</span>
          <span className="border border-accent px-1.5 py-0.5 text-[0.65rem] font-bold tracking-[0.16em] text-accent">DEV</span>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Admin login</h1>
        <label className="grid gap-1.5 text-sm font-medium">
          Email
          <input className={field} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="username" />
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          Password
          <input className={field} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
        </label>
        {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
        <button type="submit" className={`${btnPrimary} cursor-pointer`} disabled={busy}>{busy ? "Signing in..." : "Sign in"}</button>
      </form>
    </div>
  );
}
