import { Link } from "react-router-dom";
import { useState } from "react";
import { adminApi } from "../lib/api.js";
import { useLoad } from "./hooks.js";
import { btnPrimary, btnQuiet, fmtDate } from "../ui.jsx";

export default function Posts() {
  const { data, error, loading, setData } = useLoad(() => adminApi.get("/posts"), []);
  const [err, setErr] = useState("");

  async function remove(p) {
    if (!confirm(`Delete "${p.title}"?`)) return;
    try {
      await adminApi.del(`/posts/${p._id}`);
      setData((d) => d.filter((x) => x._id !== p._id));
    } catch (e) { setErr(e.message); }
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Blog posts</h1>
        <Link to="/admin/posts/new" className={`${btnPrimary} !py-2 text-sm`}>New post</Link>
      </div>
      {(error || err) && <p className="text-red-400">{error || err}</p>}
      {loading && !data && <p className="text-muted">Loading...</p>}
      {data?.length === 0 && <p className="text-muted">No posts yet. Create your first one.</p>}
      <ul className="grid gap-3">
        {data?.map((p) => (
          <li key={p._id} className="flex flex-wrap items-center justify-between gap-3  border border-line bg-surface p-4">
            <div className="min-w-0">
              <p className="font-semibold">{p.title}</p>
              <p className="text-sm text-muted">
                {p.published ? `Published ${fmtDate(p.publishedAt)}` : "Draft"} · {p.views} views · /blog/{p.slug}
              </p>
            </div>
            <div className="flex gap-2">
              {p.published && <a href={`/blog/${p.slug}`} target="_blank" rel="noreferrer" className={`${btnQuiet} !py-1.5 text-sm`}>View</a>}
              <Link to={`/admin/posts/${p._id}`} className={`${btnQuiet} !py-1.5 text-sm`}>Edit</Link>
              <button onClick={() => remove(p)} className={`${btnQuiet} cursor-pointer !py-1.5 text-sm text-red-400`}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
