import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { adminApi } from "../lib/api.js";
import { btnPrimary, btnQuiet, field } from "../ui.jsx";

const blank = { name: "", url: "", text: "", own: false, active: true, order: 0 };

export default function ProjectEditor() {
  const { id } = useParams();
  const nav = useNavigate();
  const [form, setForm] = useState(blank);
  const [loading, setLoading] = useState(!!id);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    adminApi.get(`/projects/${id}`)
      .then((project) => setForm({ ...blank, ...project }))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const set = (key) => (e) => setForm((current) => ({ ...current, [key]: e.target.value }));

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const body = { ...form, order: Number(form.order) || 0 };
    try {
      if (id) await adminApi.put(`/projects/${id}`, body);
      else await adminApi.post("/projects", body);
      nav("/admin/projects");
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  if (loading) return <p className="text-muted">Loading project...</p>;

  return (
    <form onSubmit={save} className="grid max-w-3xl gap-5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">{id ? "Edit project" : "Add project"}</h1>
        <Link to="/admin/projects" className="text-sm text-muted hover:text-ink">Back to projects</Link>
      </div>
      <label className="grid gap-1.5 text-sm font-medium">Project name *
        <input className={field} value={form.name} onChange={set("name")} required maxLength={120} />
      </label>
      <label className="grid gap-1.5 text-sm font-medium">Website URL *
        <input className={field} type="url" value={form.url} onChange={set("url")} required maxLength={500} placeholder="https://example.com" />
      </label>
      <label className="grid gap-1.5 text-sm font-medium">Description *
        <textarea className={`${field} min-h-32 resize-y`} value={form.text} onChange={set("text")} required minLength={10} maxLength={600} />
      </label>
      <label className="grid max-w-48 gap-1.5 text-sm font-medium">Display order
        <input className={field} type="number" min="0" max="999" value={form.order} onChange={set("order")} />
      </label>
      <div className="grid gap-3 text-sm font-medium">
        <label className="flex items-center gap-3">
          <input type="checkbox" checked={form.own} onChange={(e) => setForm((current) => ({ ...current, own: e.target.checked }))} className="h-4 w-4 accent-[var(--accent)]" />
          Mark as my own product
        </label>
        <label className="flex items-center gap-3">
          <input type="checkbox" checked={form.active} onChange={(e) => setForm((current) => ({ ...current, active: e.target.checked }))} className="h-4 w-4 accent-[var(--accent)]" />
          Show on the website
        </label>
      </div>
      {error && <p role="alert" className="text-red-400">{error}</p>}
      <div className="flex gap-3">
        <button type="submit" className={`${btnPrimary} cursor-pointer`} disabled={busy}>{busy ? "Saving..." : "Save project"}</button>
        <Link to="/admin/projects" className={btnQuiet}>Cancel</Link>
      </div>
    </form>
  );
}
