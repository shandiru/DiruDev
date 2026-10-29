import { useState } from "react";
import { adminApi } from "../lib/api.js";
import { useLoad, when } from "./hooks.js";
import { btnQuiet, field } from "../ui.jsx";

const types = ["", "visit_start", "visit_end", "page_view", "click", "section_view", "blog_view", "contact_submit", "contact_form_success"];

export default function Events() {
  const [type, setType] = useState("");
  const [country, setCountry] = useState("");
  const [ip, setIp] = useState("");
  const [page, setPage] = useState(1);

  const { data, error, loading, reload } = useLoad(() => {
    const q = new URLSearchParams({ page, limit: 50 });
    if (type) q.set("type", type);
    if (country) q.set("country", country);
    if (ip) q.set("ip", ip);
    return adminApi.get(`/events?${q}`);
  }, [type, country, ip, page]);

  const reset = (fn) => (e) => {
    fn(e.target.value);
    setPage(1);
  };

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Events {data && <span className="text-base font-normal text-muted">({data.total})</span>}</h1>
        <button type="button" onClick={reload} className={`${btnQuiet} cursor-pointer !py-1.5 text-sm`}>Refresh</button>
      </div>

      <div className="flex flex-wrap gap-3">
        <select className={`${field} !w-auto !py-2`} value={type} onChange={reset(setType)}>
          {types.map((t) => <option key={t} value={t}>{t || "All types"}</option>)}
        </select>
        <input className={`${field} !w-48 !py-2`} placeholder="Country (e.g. Sri Lanka)" value={country} onChange={reset(setCountry)} />
        <input className={`${field} !w-44 !py-2`} placeholder="IP address" value={ip} onChange={reset(setIp)} />
      </div>

      {error && <p className="text-red-400">{error}</p>}
      {loading && !data && <p className="text-muted">Loading...</p>}

      {data && (
        <div className="overflow-x-auto  border border-line">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-surface text-muted">
              <tr>{["When", "Action", "Detail", "Page", "IP", "Location", "Device"].map((h) => <th key={h} className="px-3 py-2 font-medium">{h}</th>)}</tr>
            </thead>
            <tbody>
              {data.items.map((e) => (
                <tr key={e._id} className="border-t border-line align-top">
                  <td className="whitespace-nowrap px-3 py-2 text-muted">{when(e.createdAt)}</td>
                  <td className="px-3 py-2 font-medium">{e.type}</td>
                  <td className="max-w-[240px] truncate px-3 py-2" title={e.label}>{e.label}</td>
                  <td className="px-3 py-2 text-muted">{e.path}</td>
                  <td className="whitespace-nowrap px-3 py-2">{e.ip}</td>
                  <td className="px-3 py-2">{e.country}{e.city ? `, ${e.city}` : ""}</td>
                  <td className="px-3 py-2 text-muted">{e.device}</td>
                </tr>
              ))}
              {data.items.length === 0 && <tr><td colSpan={7} className="px-3 py-8 text-center text-muted">No events found.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {data && data.pages > 1 && (
        <div className="flex items-center gap-3 text-sm">
          <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} className={`${btnQuiet} cursor-pointer !py-1.5 disabled:opacity-40`}>Previous</button>
          <span className="text-muted">Page {data.page} of {data.pages}</span>
          <button type="button" disabled={page >= data.pages} onClick={() => setPage(page + 1)} className={`${btnQuiet} cursor-pointer !py-1.5 disabled:opacity-40`}>Next</button>
        </div>
      )}
    </div>
  );
}
