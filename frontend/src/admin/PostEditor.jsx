import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { adminApi } from "../lib/api.js";
import { btnPrimary, btnQuiet, field } from "../ui.jsx";
import Markdown from "../components/Markdown.jsx";

const blank = { title: "", excerpt: "", content: "", coverImage: "", tags: "", published: false };

export default function PostEditor() {
  const { id } = useParams();
  const nav = useNavigate();
  const [f, setF] = useState(blank);
  const [preview, setPreview] = useState(false);
  const [loading, setLoading] = useState(!!id);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    adminApi
      .get(`/posts/${id}`)
      .then((p) => setF({ ...p, tags: (p.tags || []).join(", ") }))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const body = {
      title: f.title,
      excerpt: f.excerpt,
      content: f.content,
      coverImage: f.coverImage,
      published: f.published,
      tags: f.tags.split(",").map((t) => t.trim()).filter(Boolean),
    };
    try {
      if (id) await adminApi.put(`/posts/${id}`, body);
      else await adminApi.post("/posts", body);
      nav("/admin/posts");
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  if (loading) return <p className="text-muted">Loading...</p>;

  return (
    <form onSubmit={save} className="grid gap-5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">{id ? "Edit post" : "New post"}</h1>
        <Link to="/admin/posts" className="text-sm text-muted hover:text-ink">← Back</Link>
      </div>

      <label className="grid gap-1.5 text-sm font-medium">Title *
        <input className={field} value={f.title} onChange={set("title")} required maxLength={200} />
      </label>
      <label className="grid gap-1.5 text-sm font-medium">Short summary
        <input className={field} value={f.excerpt} onChange={set("excerpt")} maxLength={400} placeholder="Shown on the blog list" />
      </label>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm font-medium">Cover image URL
          <input className={field} value={f.coverImage} onChange={set("coverImage")} placeholder="https://..." />
        </label>
        <label className="grid gap-1.5 text-sm font-medium">Tags (comma separated)
          <input className={field} value={f.tags} onChange={set("tags")} placeholder="react, mongodb" />
        </label>
      </div>

      <div className="grid gap-1.5">
        <div className="flex items-center justify-between text-sm font-medium">
          <label htmlFor="content">Content * <span className="font-normal text-muted">(Markdown)</span></label>
          <button type="button" onClick={() => setPreview(!preview)} className="cursor-pointer text-accent hover:text-ink">
            {preview ? "Edit" : "Preview"}
          </button>
        </div>
        {preview ? (
          <div className="min-h-72  border border-line bg-surface p-5"><Markdown text={f.content} /></div>
        ) : (
          <textarea id="content" className={`${field} min-h-72 resize-y font-mono text-sm`} value={f.content} onChange={set("content")} required placeholder={"## Heading\n\nWrite your post in **Markdown**."} />
        )}
      </div>

      <label className="flex items-center gap-2 text-sm font-medium">
        <input type="checkbox" checked={f.published} onChange={(e) => setF((p) => ({ ...p, published: e.target.checked }))} className="h-4 w-4 accent-[var(--accent)]" />
        Published (visible on the website)
      </label>

      {error && <p role="alert" className="text-red-400">{error}</p>}
      <div className="flex gap-3">
        <button className={`${btnPrimary} cursor-pointer`} disabled={busy}>{busy ? "Saving..." : "Save post"}</button>
        <Link to="/admin/posts" className={btnQuiet}>Cancel</Link>
      </div>
    </form>
  );
}
