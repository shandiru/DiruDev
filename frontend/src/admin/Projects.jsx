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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="mt-1 text-sm text-muted">Projects added here appear after the featured projects on your site.</p>
        </div>
        <Link to="/admin/projects/new" className={`${btnPrimary} !py-2 text-sm`}>Add project</Link>
      </div>
      {(error || err) && <p role="alert" className="text-red-400">{error || err}</p>}
      {loading && !data && <p className="text-muted">Loading projects...</p>}
      {data?.length === 0 && <p className="text-muted">No additional projects yet.</p>}
      <ul className="grid gap-3">
        {data?.map((project) => (
          <li key={project._id} className="flex flex-wrap items-center justify-between gap-4 border border-line bg-surface p-4">
            <div className="min-w-0">
              <p className="font-semibold">{project.name}</p>
              <p className="mt-1 break-all text-sm text-muted">{project.url}</p>
              <p className="mt-1 text-sm text-muted">{project.active ? "Visible on site" : "Hidden"} · Order {project.order}</p>
            </div>
            <div className="flex gap-2">
              {project.active && <a href={project.url} target="_blank" rel="noreferrer" className={`${btnQuiet} !py-1.5 text-sm`}>View</a>}
              <Link to={`/admin/projects/${project._id}`} className={`${btnQuiet} !py-1.5 text-sm`}>Edit</Link>
              <button type="button" onClick={() => remove(project)} className={`${btnQuiet} cursor-pointer !py-1.5 text-sm text-red-400`}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
