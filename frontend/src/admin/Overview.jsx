import { useEffect, useRef, useState } from "react";
import { adminApi } from "../lib/api.js";
import { useLoad } from "./hooks.js";
import { field } from "../ui.jsx";

const Card = ({ label, value, live = false }) => (
  <div className=" border border-line bg-surface p-5">
    <p className="flex items-center gap-2 text-sm text-muted">{live && <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />} {label}</p>
    <p className="mt-1 text-3xl font-bold tracking-tight">{value}</p>
  </div>
);

let geoChartLoader;
function loadGeoChart() {
  if (window.google?.visualization?.GeoChart) return Promise.resolve(window.google);
  if (geoChartLoader) return geoChartLoader;
  geoChartLoader = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://www.gstatic.com/charts/loader.js";
    script.onload = () => {
      window.google.charts.load("current", { packages: ["geochart"] });
      window.google.charts.setOnLoadCallback(() => resolve(window.google));
    };
    script.onerror = () => reject(new Error("Could not load the world map."));
    document.head.appendChild(script);
  });
  return geoChartLoader;
}

function LiveWorldMap({ countries = [], locations = [], total = 0 }) {
  const mapElement = useRef(null);
  const chart = useRef(null);
  const [mapError, setMapError] = useState("");

  useEffect(() => {
    let disposed = false;
    const draw = (google) => {
      if (disposed || !mapElement.current) return;
      const table = new google.visualization.DataTable();
      table.addColumn("number", "Latitude");
      table.addColumn("number", "Longitude");
      table.addColumn("number", "Active users");
      table.addColumn({ type: "string", role: "tooltip" });
      const rows = locations
        .filter((location) => Number.isFinite(location.latitude) && Number.isFinite(location.longitude))
        .map((location) => {
          const label = [location.city, location.region, location.country].filter(Boolean).join(", ") || "Location unavailable";
          return [Number(location.latitude), Number(location.longitude), Number(location.users) || 1, `${label} - ${location.users} active`];
        });
      table.addRows(rows);
      chart.current ||= new google.visualization.GeoChart(mapElement.current);
      chart.current.draw(table, {
        region: "world",
        displayMode: "markers",
        colorAxis: { colors: ["#d3f36b", "#d3f36b"] },
        sizeAxis: { minValue: 1, maxValue: Math.max(1, ...locations.map((location) => Number(location.users) || 1)), minSize: 5, maxSize: 18 },
        markerOpacity: 0.85,
        backgroundColor: "#090b0a",
        datalessRegionColor: "#171c19",
        defaultColor: "#252c25",
        keepAspectRatio: true,
        legend: "none",
      });
    };
    loadGeoChart().then(draw).catch((error) => setMapError(error.message));
    const resize = () => window.google?.visualization?.GeoChart && draw(window.google);
    window.addEventListener("resize", resize);
    return () => {
      disposed = true;
      window.removeEventListener("resize", resize);
      chart.current = null;
    };
  }, [countries, locations]);

  return (
    <section className="border border-line bg-surface p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div><h2 className="font-semibold">Active visitors around the world</h2><p className="text-sm text-muted">City-level locations estimated from IP - refreshed every 15 seconds</p></div>
        <span className="shrink-0 text-sm text-accent">{total} online</span>
      </div>
      {mapError ? <p className="grid h-72 place-items-center border border-line text-sm text-muted">{mapError}</p> : <div ref={mapElement} className="h-72 w-full border border-line bg-bg md:h-[28rem]" />}
      {locations.length > 0 && <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
        {locations.map((location) => <li key={`${location.city}-${location.region}-${location.country}-${location.latitude}-${location.longitude}`} className="flex items-start justify-between gap-3 border-b border-line pb-2">
          <span className="min-w-0 text-muted">{[location.city, location.region, location.country].filter(Boolean).join(", ") || "Location unavailable"}</span>
          <span className="shrink-0 text-ink">{location.users}</span>
        </li>)}
      </ul>}
      {locations.length === 0 && <p className="mt-3 text-sm text-muted">No active visitor locations with coordinates yet.</p>}
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

          <LiveWorldMap countries={data.liveByCountry || []} locations={data.liveLocations || []} total={data.liveUsers || 0} />

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
