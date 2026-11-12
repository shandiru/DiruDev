import { useEffect, useRef, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { profile } from "../data.js";
import { wrap, btnPrimary } from "../ui.jsx";
import { track } from "../lib/track.js";

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const { pathname, hash } = useLocation();

  useEffect(() => setMenuOpen(false), [pathname, hash]);

  useEffect(() => {
    if (pathname !== "/" || !("IntersectionObserver" in window)) {
      setActiveSection("");
      return;
    }
    const sections = ["about", "projects", "experience", "contact"]
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    const observer = new IntersectionObserver(
      (entries) => {
        const current = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (current) setActiveSection(current.target.id);
      },
      { rootMargin: "-20% 0px -65% 0px", threshold: [0, 0.1, 0.5, 1] }
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [pathname]);

  useEffect(() => {
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.href = `https://imdiru.online${pathname}`;
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  const navLink = (section, label) => (
    <Link
      to={`/#${section}`}
      aria-current={activeSection === section ? "location" : undefined}
      className={`min-h-11 px-2 py-3 transition-colors hover:text-accent ${activeSection === section ? "text-accent" : "text-muted"}`}
    >
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-bg/90 backdrop-blur">
      <div className={`${wrap} relative flex h-16 items-center justify-between gap-4`}>
        <Link to="/" aria-label="DIRU DEV" className="inline-flex shrink-0 items-baseline gap-2 tracking-[-0.06em]">
          <span className="text-xl font-black text-ink">DIRU</span>
          <span className="border border-accent px-1.5 py-0.5 text-[0.65rem] font-bold tracking-[0.16em] text-accent">PORTFOLIO</span>
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-5 text-sm font-medium sm:gap-7 md:flex">
          {navLink("about", "About")}
          {navLink("projects", "Work")}
          {navLink("experience", "Experience")}
          <Link to="/blog" aria-current={pathname.startsWith("/blog") ? "page" : undefined} className={`min-h-11 px-2 py-3 transition-colors hover:text-accent ${pathname.startsWith("/blog") ? "text-accent" : "text-muted"}`}>Writing</Link>
          <Link to="/#contact" data-track="Header: Contact" className={`${btnPrimary} !py-2 text-sm`}>Contact</Link>
        </nav>
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center border border-line text-ink md:hidden"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="sr-only">{menuOpen ? "Close menu" : "Open menu"}</span>
          <span className="flex w-5 flex-col gap-1.5" aria-hidden="true">
            <span className={`h-0.5 w-full bg-current transition-transform ${menuOpen ? "translate-y-1 rotate-45" : ""}`} />
            <span className={`h-0.5 w-full bg-current transition-opacity ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`h-0.5 w-full bg-current transition-transform ${menuOpen ? "-translate-y-2 -rotate-45" : ""}`} />
          </span>
        </button>
      </div>
      {menuOpen && (
        <nav id="mobile-navigation" aria-label="Mobile" className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-line bg-bg px-5 py-3 md:hidden">
          <div className={`${wrap} flex flex-col items-stretch gap-1 text-sm font-medium`}>
            {navLink("about", "About")}
            {navLink("projects", "Work")}
            {navLink("experience", "Experience")}
            <Link to="/blog" aria-current={pathname.startsWith("/blog") ? "page" : undefined} className={`min-h-11 px-2 py-3 transition-colors hover:text-accent ${pathname.startsWith("/blog") ? "text-accent" : "text-muted"}`}>Writing</Link>
            <Link to="/#contact" data-track="Header: Contact" className={`${btnPrimary} mt-2 justify-center text-sm`}>Contact</Link>
          </div>
        </nav>
      )}
    </header>
  );
}

/* Page views, clicks and section views are all recorded from here. */
function useTracking() {
  const { pathname } = useLocation();
  const visitStartedAt = useRef(0);

  useEffect(() => {
    if (!visitStartedAt.current) {
      visitStartedAt.current = Date.now();
      track("visit_start", "Site visit started");
    }
    const heartbeat = window.setInterval(() => track("heartbeat"), 20_000);
    const onPageHide = () => {
      track("visit_end", "Site visit ended", {
        durationSeconds: Math.max(0, Math.round((Date.now() - visitStartedAt.current) / 1000)),
      });
    };
    window.addEventListener("pagehide", onPageHide);
    return () => {
      window.clearInterval(heartbeat);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, []);

  useEffect(() => {
    track("page_view", pathname);
  }, [pathname]);

  useEffect(() => {
    const onClick = (e) => {
      const el = e.target.closest?.("a,button");
      if (!el) return;
      const label =
        el.dataset.track || el.getAttribute("aria-label") || el.textContent.trim().replace(/\s+/g, " ").slice(0, 80);
      if (!label) return;
      track("click", label, { href: el.getAttribute("href") || undefined });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const seen = new Set();
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting && !seen.has(e.target.id)) {
            seen.add(e.target.id);
            track("section_view", e.target.id);
          }
        }),
      { threshold: 0.4 }
    );
    const t = setTimeout(() => document.querySelectorAll("main section[id]").forEach((s) => io.observe(s)), 400);
    return () => {
      clearTimeout(t);
      io.disconnect();
    };
  }, [pathname]);
}

/* Scroll to #hash after route changes (React Router does not do it for us). */
function useHashScroll() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: "auto" });
      return;
    }
    const t = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView(), 60);
    return () => clearTimeout(t);
  }, [pathname, hash]);
}

export default function SiteLayout() {
  useTracking();
  useHashScroll();
  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <Header />
      <main id="main-content" tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="border-t border-line">
        <div className={`${wrap} flex flex-col gap-5 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between`}>
          <span><span className="font-semibold text-ink">{profile.name}</span> - Based in {profile.location}</span>
          <div className="flex flex-wrap items-center gap-3 sm:gap-5">
            <Link to="/#projects" className="min-h-11 inline-flex items-center px-1 hover:text-accent">Work</Link>
            <Link to="/#contact" className="min-h-11 inline-flex items-center px-1 text-accent">Start a project</Link>
            <Link to="/blog" className="min-h-11 inline-flex items-center px-1 hover:text-accent">Writing</Link>
            <a href={`mailto:${profile.email}`} className="min-h-11 inline-flex items-center px-1 hover:text-accent">Email</a>
          </div>
        </div>
      </footer>
    </>
  );
}
