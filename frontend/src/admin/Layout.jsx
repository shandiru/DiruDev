import { useEffect, useState } from "react";
import { Link, NavLink, Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
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
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.title = "Admin | Dirushan";
    const out = () => nav("/admin/login", { replace: true });
    window.addEventListener("admin-logout", out);
    return () => window.removeEventListener("admin-logout", out);
  }, [nav]);

  useEffect(() => setMenuOpen(false), [location.pathname]);

  if (!getToken()) return <Navigate to="/admin/login" replace />;

  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-bg/90">
        <div className={`${wrap} flex flex-wrap items-center justify-between gap-3 py-3`}>
          <div className="flex w-full items-center justify-between md:w-auto">
            <Link to="/" aria-label="DIRU DEV home" className="mr-4 inline-flex items-baseline gap-2 tracking-[-0.06em]">
              <span className="text-xl font-black text-ink">DIRU</span>
              <span className="border border-accent px-1.5 py-0.5 text-[0.65rem] font-bold tracking-[0.16em] text-accent">DEV</span>
            </Link>
            <span className="mr-auto text-base font-bold md:mr-3">Admin</span>
            <button type="button" aria-expanded={menuOpen} aria-controls="admin-navigation" aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"} onClick={() => setMenuOpen((open) => !open)} className="grid h-10 w-10 place-items-center border border-line text-xl text-ink md:hidden">
              {menuOpen ? "×" : "☰"}
            </button>
          </div>
          <nav id="admin-navigation" className={`${menuOpen ? "flex" : "hidden"} w-full flex-col gap-1 text-sm font-medium md:flex md:w-auto md:flex-row md:items-center`}>
            {tabs.map(([to, label, end]) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2 md:py-1.5 ${isActive ? "bg-surface text-ink" : "text-muted hover:bg-surface hover:text-ink"}`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
          <div className={`${menuOpen ? "flex" : "hidden"} w-full items-center justify-between gap-4 border-t border-line pt-3 text-sm md:flex md:w-auto md:border-0 md:pt-0`}>
            <a href="/" className="text-muted hover:text-ink" target="_blank" rel="noreferrer">View site</a>
            <button type="button"
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
