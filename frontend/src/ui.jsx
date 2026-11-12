import { useEffect, useRef, useState } from "react";

export const wrap = "page-wrap";
export const btn =
  "inline-flex min-h-11 items-center justify-center border px-5 py-2.5 text-[0.95rem] font-semibold transition-colors";
export const btnPrimary = `${btn} primary-action border-accent bg-accent text-on-accent hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60`;
export const btnQuiet = `${btn} border-line hover:border-accent hover:text-accent`;
export const field =
  "w-full border border-line bg-surface px-4 py-3 text-ink placeholder:text-muted/70 focus:border-accent focus:outline-none";

export function LoadingState({ label = "Loading" }) {
  return (
    <div role="status" className="mt-10 flex items-center gap-3 text-sm text-muted">
      <span aria-hidden="true" className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-line border-t-accent motion-reduce:animate-none" />
      <span>{label}<span className="loading-dots" aria-hidden="true">...</span></span>
      <span className="sr-only">Please wait</span>
    </div>
  );
}

/* Fades content in when it scrolls into view.
   Content is visible by default and only hidden after we know the observer works,
   so previews / iframes / old browsers can never end up with a blank page. */
export function Reveal({ children, className = "" }) {
  const ref = useRef(null);
  const [state, setState] = useState("visible"); // visible | hidden | shown

  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return;
    let alive = false;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!alive) {
          alive = true;
          // first callback = observer works. Hide only if below the fold.
          if (!e.isIntersecting) setState("hidden");
          return;
        }
        if (e.isIntersecting) {
          setState("shown");
          io.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const hidden = state === "hidden";
  return (
    <div
      ref={ref}
      className={`transition duration-300 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none ${
        hidden ? "translate-y-3 opacity-0" : "translate-y-0 opacity-100"
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function Section({ id, title, children }) {
  return (
    <section id={id} className={`${wrap} page-section`}>
      <Reveal>
      <h2 className="section-heading mb-10 text-[clamp(1.8rem,4vw,2.6rem)] font-bold leading-tight tracking-[-0.04em] md:mb-14">
          {title}
        </h2>
      </Reveal>
      {children}
    </section>
  );
}

export const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "";
