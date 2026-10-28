import { useState } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "../lib/api.js";
import { useLoad } from "./hooks.js";
import { btnPrimary, btnQuiet } from "../ui.jsx";

export default function Projects() {
  const { data, error, loading, setData } = useLoad(() => adminApi.get("/projects"), []);
  const [err, setErr] = useState("");

  async function remove(project) {
    if (!confirm(`Delete "${project.name}"?`)) return;
    try {
      await adminApi.del(`/projects/${project._id}`);
      setData((items) => items.filter((item) => item._id !== project._id));
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Portfolio</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Projects</h1>
          <p className="mt-2 max-w-xl text-sm text-muted">Manage the work displayed after your featured projects.</p>
        </div>
        <Link to="/admin/projects/new" className={`${btnPrimary} !py-2 text-center text-sm`}>+ Add project</Link>
      </div>
      {(error || err) && <p role="alert" className="text-red-400">{error || err}</p>}
      {loading && !data && <p className="text-muted">Loading projects...</p>}
      {data?.length === 0 && <div className="border border-dashed border-line bg-surface/60 p-8 text-center"><p className="font-semibold">No additional projects yet</p><p className="mt-1 text-sm text-muted">Add a project to show it on your website.</p></div>}
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {data?.map((project) => (
          <li key={project._id} className="flex min-w-0 flex-col justify-between gap-5 border border-line bg-surface p-5 transition-colors hover:border-accent/70">
            <div className="min-w-0">
              <div className="flex items-start justify-between gap-3">
                <p className="break-words text-lg font-semibold tracking-tight">{project.name}</p>
                <span className={`shrink-0 border px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider ${project.active ? "border-accent/40 text-accent" : "border-line text-muted"}`}>{project.active ? "Live" : "Hidden"}</span>
              </div>
              <a href={project.url} target="_blank" rel="noreferrer" className="mt-2 block break-all text-sm text-muted underline decoration-line underline-offset-4 hover:text-accent">{project.url}</a>
              <p className="mt-3 text-xs uppercase tracking-wider text-muted">Display order <span className="font-semibold text-ink">{project.order}</span></p>
            </div>
            <div className="flex flex-wrap gap-2 border-t border-line pt-4">
              {project.active && <a href={project.url} target="_blank" rel="noreferrer" className={`${btnQuiet} flex-1 !py-2 text-center text-sm`}>View</a>}
              <Link to={`/admin/projects/${project._id}`} className={`${btnQuiet} flex-1 !py-2 text-center text-sm`}>Edit</Link>
              <button type="button" onClick={() => remove(project)} className={`${btnQuiet} cursor-pointer !py-2 text-sm text-red-400`}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
