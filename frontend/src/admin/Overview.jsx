import { useEffect, useState } from "react";
import { adminApi } from "../lib/api.js";
import { useLoad } from "./hooks.js";
import { field } from "../ui.jsx";

const Card = ({ label, value, live = false }) => (
  <div className=" border border-line bg-surface p-5">
    <p className="flex items-center gap-2 text-sm text-muted">{live && <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />} {label}</p>
    <p className="mt-1 text-3xl font-bold tracking-tight">{value}</p>
  </div>
);

export default function Overview() {
  const [days, setDays] = useState(30);
  const { data, error, loading, reload } = useLoad(() => adminApi.get(`/stats?days=${days}`), [days]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") reload();
    }, 15_000);
    return () => window.clearInterval(timer);
  }, [reload]);

  const maxCountry = Math.max(1, ...(data?.byCountry || []).map((c) => c.events));
  const maxDay = Math.max(1, ...(data?.perDay || []).map((d) => d.events));
  const count = (t) => data?.byType.find((x) => x._id === t)?.count || 0;

  return (
    <div className="grid gap-8">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
        <select className={`${field} !w-auto !py-2`} value={days} onChange={(e) => setDays(Number(e.target.value))}>
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {error && <p className="text-red-400">{error}</p>}
      {loading && !data && <p className="text-muted">Loading...</p>}

      {data && (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            <Card label="Unique visitors" value={data.uniqueVisitors} />
            <Card label="Active visitors now" value={data.liveUsers ?? 0} live />
            <Card label="Site visits" value={count("visit_start")} />
            <Card label="Site exits" value={count("visit_end")} />
            <Card label="Page views" value={count("page_view")} />
            <Card label="Contact forms" value={count("contact_submit")} />
            <Card label="Unread messages" value={data.unreadMessages} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className=" border border-line bg-surface p-5">
              <h2 className="mb-4 font-semibold">Visitors by country</h2>
              {data.byCountry.length === 0 && <p className="text-sm text-muted">No data yet.</p>}
              <ul className="grid gap-3">
                {data.byCountry.map((c) => (
                  <li key={c._id}>
                    <div className="flex justify-between text-sm">
                      <span>{c._id}</span>
                      <span className="text-muted">{c.visitors} visitors · {c.events} events</span>
                    </div>
                    <div className="mt-1 h-1.5  bg-line">
                      <div className="h-full  bg-accent" style={{ width: `${(c.events / maxCountry) * 100}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section className=" border border-line bg-surface p-5">
              <h2 className="mb-4 font-semibold">What people do</h2>
              <ul className="grid gap-2 text-sm">
                {data.byType.map((t) => (
                  <li key={t._id} className="flex justify-between border-b border-line pb-2 last:border-0">
                    <span>{t._id}</span>
                    <span className="text-muted">{t.count}</span>
                  </li>
                ))}
              </ul>
              {data.topClicks.length > 0 && (
                <>
                  <h3 className="mb-3 mt-6 font-semibold">Top clicks</h3>
                  <ul className="grid gap-2 text-sm">
                    {data.topClicks.map((t) => (
                      <li key={t._id} className="flex justify-between gap-4">
                        <span className="truncate">{t._id}</span>
                        <span className="text-muted">{t.count}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </section>
          </div>

          <section className=" border border-line bg-surface p-5">
            <h2 className="mb-4 font-semibold">Events per day</h2>
            {data.perDay.length === 0 ? (
              <p className="text-sm text-muted">No data yet.</p>
            ) : (
              <div className="flex h-36 items-end gap-1 overflow-x-auto">
                {data.perDay.map((d) => (
                  <div key={d._id} title={`${d._id}: ${d.events}`} className="min-w-2 flex-1  bg-accent/80" style={{ height: `${(d.events / maxDay) * 100}%` }} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
