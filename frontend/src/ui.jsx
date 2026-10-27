import { useEffect, useRef, useState } from "react";

export const wrap = "mx-auto w-full max-w-[1080px] px-5 sm:px-8";
export const btn =
  "inline-flex items-center justify-center  border px-5 py-2.5 text-[0.95rem] font-semibold transition";
export const btnPrimary = `${btn} border-accent bg-accent text-on-accent hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed`;
export const btnQuiet = `${btn} border-line hover:border-accent`;
export const field =
  "w-full  border border-line bg-surface px-4 py-3 text-ink placeholder:text-muted/70 focus:border-accent focus:outline-none";

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
      className={`transition duration-500 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none ${
        hidden ? "translate-y-3 opacity-0" : "translate-y-0 opacity-100"
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function Section({ id, title, children }) {
  return (
    <section id={id} className={`${wrap} py-16 md:py-24`}>
      <Reveal>
        <h2 className="mb-10 text-[clamp(1.8rem,4vw,2.6rem)] font-bold leading-tight tracking-[-0.03em] md:mb-14">
          {title}
        </h2>
      </Reveal>
      {children}
    </section>
  );
}

export const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "";
