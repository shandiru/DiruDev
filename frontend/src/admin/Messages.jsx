import { useState } from "react";
import { adminApi } from "../lib/api.js";
import { useLoad, when } from "./hooks.js";
import { btnQuiet } from "../ui.jsx";

export default function Messages() {
  const { data, error, loading, setData } = useLoad(() => adminApi.get("/contacts"), []);
  const [open, setOpen] = useState(null);
  const [err, setErr] = useState("");

  async function toggleRead(c, read) {
    try {
      const u = await adminApi.patch(`/contacts/${c._id}`, { read });
      setData((d) => d.map((x) => (x._id === c._id ? u : x)));
    } catch (e) { setErr(e.message); }
  }
  async function remove(c) {
    if (!confirm(`Delete the message from ${c.name}?`)) return;
    try {
      await adminApi.del(`/contacts/${c._id}`);
      setData((d) => d.filter((x) => x._id !== c._id));
    } catch (e) { setErr(e.message); }
  }
  function toggle(c) {
    setOpen(open === c._id ? null : c._id);
    if (!c.read) toggleRead(c, true);
  }

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
      {(error || err) && <p className="text-red-400">{error || err}</p>}
      {loading && !data && <p className="text-muted">Loading...</p>}
      {data?.length === 0 && <p className="text-muted">No messages yet.</p>}

      <ul className="grid gap-3">
        {data?.map((c) => (
          <li key={c._id} className=" border border-line bg-surface">
            <button type="button" onClick={() => toggle(c)} className="flex w-full cursor-pointer items-start justify-between gap-4 p-4 text-left">
              <div className="min-w-0">
                <p className="flex items-center gap-2 font-semibold">
                  {!c.read && <span className="h-2 w-2  bg-accent" aria-label="Unread" />}
                  {c.name} <span className="font-normal text-muted">· {c.email}</span>
                </p>
                <p className="mt-0.5 truncate text-sm text-muted">{c.subject || c.message}</p>
              </div>
              <span className="shrink-0 text-xs text-muted">{when(c.createdAt)}</span>
            </button>
            {open === c._id && (
              <div className="border-t border-line p-4">
                <p className="whitespace-pre-wrap">{c.message}</p>
                <dl className="mt-4 grid gap-1 text-sm text-muted sm:grid-cols-2">
                  <div>Phone: {c.phone || "-"}</div>
                  <div>Budget: {c.budget || "-"}</div>
                  <div>Country: {c.country || "-"}{c.city ? `, ${c.city}` : ""}</div>
                  <div>IP: {c.ip || "-"}</div>
                  <div>Email notification: {c.emailSent ? "sent" : "not sent"}</div>
                </dl>
                <div className="mt-4 flex flex-wrap gap-3">
                  <a className={`${btnQuiet} !py-1.5 text-sm`} href={`mailto:${c.email}?subject=Re: ${encodeURIComponent(c.subject || "your message")}`}>Reply by email</a>
                  <button type="button" onClick={() => toggleRead(c, !c.read)} className={`${btnQuiet} cursor-pointer !py-1.5 text-sm`}>Mark as {c.read ? "unread" : "read"}</button>
                  <button type="button" onClick={() => remove(c)} className={`${btnQuiet} cursor-pointer !py-1.5 text-sm text-red-400`}>Delete</button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
