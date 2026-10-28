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

const countryCenters = {
  US: [-98, 39], CA: [-106, 57], MX: [-102, 23], BR: [-52, -10], AR: [-64, -34], CL: [-71, -30], CO: [-74, 4],
  GB: [-3, 55], IE: [-8, 53], FR: [2, 46], DE: [10, 51], ES: [-4, 40], IT: [12, 42], NL: [5, 52],
  SE: [15, 62], NO: [10, 62], FI: [26, 64], PL: [19, 52], UA: [32, 49], RU: [90, 60], TR: [35, 39],
  EG: [30, 27], ZA: [24, -29], NG: [8, 9], KE: [38, 0], MA: [-7, 32],
  IN: [79, 22], LK: [80.7, 7.9], PK: [69, 30], BD: [90, 24], NP: [84, 28], CN: [104, 35], JP: [138, 37],
  KR: [127, 36], TH: [101, 15], VN: [108, 16], MY: [102, 4], SG: [104, 1.3], ID: [117, -2], PH: [122, 12],
  AU: [134, -25], NZ: [172, -41], SA: [45, 24], AE: [54, 24], IL: [35, 31],
};

function LiveWorldMap({ countries = [], total = 0 }) {
  const markers = countries.map((item) => {
    const center = countryCenters[item.countryCode];
    return center ? { ...item, x: ((center[0] + 180) / 360) * 960, y: ((90 - center[1]) / 180) * 500 } : null;
  }).filter(Boolean);

  return (
    <section className="border border-line bg-surface p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div><h2 className="font-semibold">Active visitors around the world</h2><p className="text-sm text-muted">Live sessions from the last 60 seconds</p></div>
        <span className="shrink-0 text-sm text-accent">{total} online</span>
      </div>
      <div className="overflow-hidden border border-line bg-bg/60">
        <svg viewBox="0 0 960 500" role="img" aria-label={`World map showing ${total} active visitors`} className="block h-auto w-full">
          <defs><pattern id="map-grid" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M48 0H0V48" fill="none" stroke="currentColor" strokeOpacity=".08" /></pattern></defs>
          <rect width="960" height="500" fill="url(#map-grid)" />
          <g fill="currentColor" fillOpacity=".16" stroke="currentColor" strokeOpacity=".2" strokeWidth="2">
            <path d="M75 105 115 75 180 66 215 83 246 75 280 93 295 119 270 139 250 165 222 173 208 204 180 213 166 192 143 185 133 158 105 151 94 128Z" />
            <path d="M236 215 267 223 290 252 283 286 268 317 259 354 239 388 225 357 220 323 206 292 212 261Z" />
            <path d="M421 109 453 91 489 96 508 111 530 107 549 119 568 111 587 122 611 116 638 130 669 128 698 143 722 160 714 176 686 178 673 194 645 190 628 207 610 203 596 217 581 211 567 191 548 189 533 177 517 181 497 163 475 166 458 150 437 151 423 132Z" />
            <path d="M470 191 506 186 536 205 547 237 537 269 521 302 505 337 487 355 473 326 465 291 449 259 451 227Z" />
            <path d="M626 221 654 212 678 226 691 251 682 278 660 286 644 266Z" />
            <path d="M716 314 752 301 790 309 817 329 807 350 778 356 752 346 730 334Z" />
            <path d="M794 146 824 132 856 141 874 164 860 183 832 181 813 169Z" />
            <path d="M856 350 878 341 895 355 889 377 870 381Z" />
            <path d="M330 117 343 109 354 119 348 136 335 137Z" />
          </g>
          {markers.map((marker) => <g key={`${marker.countryCode}-${marker.country}`}>
            <circle cx={marker.x} cy={marker.y} r="13" fill="var(--accent)" fillOpacity=".16"><title>{marker.country}: {marker.users} active</title></circle>
            <circle cx={marker.x} cy={marker.y} r="5" fill="var(--accent)" stroke="var(--bg)" strokeWidth="2"><title>{marker.country}: {marker.users} active</title></circle>
          </g>)}
        </svg>
      </div>
      {countries.length > 0 ? <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
        {countries.map((item) => <li key={`${item.countryCode}-${item.country}`} className="flex items-center gap-2 text-muted"><span className="h-2 w-2 rounded-full bg-accent" />{item.country}: <span className="text-ink">{item.users}</span></li>)}
      </ul> : <p className="mt-3 text-sm text-muted">No active visitors right now.</p>}
    </section>
  );
}

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

          <LiveWorldMap countries={data.liveByCountry || []} total={data.liveUsers || 0} />

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
