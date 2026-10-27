import { useEffect } from "react";
import { Link, NavLink, Navigate, Outlet, useNavigate } from "react-router-dom";
import { getToken, setToken } from "../lib/api.js";
import { wrap } from "../ui.jsx";

const tabs = [
  ["/admin", "Overview", true],
  ["/admin/events", "Events"],
  ["/admin/messages", "Messages"],
  ["/admin/posts", "Blog"],
  ["/admin/projects", "Projects"],
];

export default function AdminLayout() {
  const nav = useNavigate();

  useEffect(() => {
    document.title = "Admin | Dirushan";
    const out = () => nav("/admin/login", { replace: true });
    window.addEventListener("admin-logout", out);
    return () => window.removeEventListener("admin-logout", out);
  }, [nav]);

  if (!getToken()) return <Navigate to="/admin/login" replace />;

  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-bg/90">
        <div className={`${wrap} flex flex-wrap items-center justify-between gap-3 py-3`}>
          <nav className="flex flex-wrap items-center gap-1 text-sm font-medium">
            <Link to="/" aria-label="DIRU DEV home" className="mr-4 inline-flex items-baseline gap-2 tracking-[-0.06em]">
              <span className="text-xl font-black text-ink">DIRU</span>
              <span className="border border-accent px-1.5 py-0.5 text-[0.65rem] font-bold tracking-[0.16em] text-accent">DEV</span>
            </Link>
            <span className="mr-3 text-base font-bold">Admin</span>
            {tabs.map(([to, label, end]) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  ` px-3 py-1.5 ${isActive ? "bg-surface text-ink" : "text-muted hover:text-ink"}`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-4 text-sm">
            <a href="/" className="text-muted hover:text-ink" target="_blank" rel="noreferrer">View site</a>
            <button
              className="cursor-pointer text-muted hover:text-ink"
              onClick={() => {
                setToken(null);
                nav("/admin/login", { replace: true });
              }}
            >
              Log out
            </button>
          </div>
        </div>
      </header>
      <main className={`${wrap} py-8`}>
        <Outlet />
      </main>
    </div>
  );
}
