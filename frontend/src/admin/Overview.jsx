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

let leafletLoader;
function loadLeaflet() {
  if (window.L) return Promise.resolve(window.L);
  if (leafletLoader) return leafletLoader;
  leafletLoader = new Promise((resolve, reject) => {
    if (!document.querySelector('link[data-leaflet="true"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      link.dataset.leaflet = "true";
      document.head.appendChild(link);
    }
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => resolve(window.L);
    script.onerror = () => reject(new Error("Could not load the map library."));
    document.head.appendChild(script);
  });
  return leafletLoader;
}

function drawLocations(L, layer, locations) {
  layer.clearLayers();
  locations.forEach((location) => {
    if (!Number.isFinite(location.latitude) || !Number.isFinite(location.longitude)) return;
    const label = [location.city, location.region, location.country].filter(Boolean).join(", ") || "Unknown location";
    const users = Number(location.users) || 1;
    const size = Math.min(38, 28 + Math.ceil(Math.log2(users)) * 2);
    const icon = L.divIcon({
      className: "active-map-marker",
      html: `<span>${users > 99 ? "99+" : users}</span>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
    L.marker([location.latitude, location.longitude], { icon }).bindTooltip(`${label} - ${users} active`).addTo(layer);
  });
}

function LiveWorldMap({ countries = [], locations = [], total = 0 }) {
  const mapElement = useRef(null);
  const mapInstance = useRef(null);
  const markerLayer = useRef(null);
  const latestLocations = useRef(locations);
  const [mapError, setMapError] = useState("");
  latestLocations.current = locations;

  useEffect(() => {
    let disposed = false;
    loadLeaflet().then((L) => {
      if (disposed || !mapElement.current || mapInstance.current) return;
      const map = L.map(mapElement.current, { worldCopyJump: true }).setView([20, 0], 2);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);
      markerLayer.current = L.layerGroup().addTo(map);
      mapInstance.current = map;
      drawLocations(L, markerLayer.current, latestLocations.current);
      window.setTimeout(() => map.invalidateSize(), 0);
    }).catch((error) => setMapError(error.message));
    return () => {
      disposed = true;
      mapInstance.current?.remove();
      mapInstance.current = null;
      markerLayer.current = null;
    };
  }, []);

  useEffect(() => {
    const L = window.L;
    if (!L || !markerLayer.current) return;
    drawLocations(L, markerLayer.current, locations);
  }, [locations]);

  return (
    <section className="border border-line bg-surface p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div><h2 className="font-semibold">Active visitors around the world</h2><p className="text-sm text-muted">Location estimated from IP - refreshed every 15 seconds</p></div>
        <span className="shrink-0 text-sm text-accent">{total} online</span>
      </div>
      {mapError ? <p className="grid h-72 place-items-center border border-line text-sm text-muted">{mapError}</p> : <div ref={mapElement} className="h-72 w-full border border-line bg-bg md:h-[28rem]" />}
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
