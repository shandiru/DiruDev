import { useEffect, useState } from "react";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import {
  siLaravel,
  siReact,
  siTailwindcss,
  siWordpress,
  siExpress,
  siMongodb,
  siMysql,
  siGooglesearchconsole,
  siGoogleanalytics,
} from "simple-icons/icons";
import { profile, projects as featuredProjects, experience, skills } from "../data.js";
import { wrap, btnPrimary, btnQuiet, Reveal, Section, fmtDate } from "../ui.jsx";
import { api } from "../lib/api.js";
import ContactForm from "../components/ContactForm.jsx";

gsap.registerPlugin(useGSAP);

const tools = [
  ["Laravel", siLaravel],
  ["React", siReact],
  ["Tailwind CSS", siTailwindcss],
  ["WordPress", siWordpress],
  ["Express.js", siExpress],
  ["MongoDB", siMongodb],
  ["MySQL", siMysql],
  ["Google Search Console", siGooglesearchconsole],
  ["Google Analytics", siGoogleanalytics],
];

function Hero() {
  const heroRef = useRef(null);

  useGSAP(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.timeline({ defaults: { duration: 0.5, ease: "power2.out" } })
      .from("[data-hero-kicker]", { autoAlpha: 0, y: 8 })
      .from("[data-hero-title]", { autoAlpha: 0, y: 12 }, "-=0.28")
      .from("[data-hero-copy]", { autoAlpha: 0, y: 8 }, "-=0.3")
      .from("[data-hero-action]", { autoAlpha: 0, y: 6, stagger: 0.06 }, "-=0.26")
      .from("[data-hero-aside]", { autoAlpha: 0, y: 8, stagger: 0.06 }, "-=0.28");
  }, { scope: heroRef });

  return (
    <section ref={heroRef} id="top" className={`${wrap} grid gap-10 pb-16 pt-20 md:grid-cols-[1.35fr_0.65fr] md:items-end md:gap-16 md:pb-24 md:pt-32`}>
      <div>
        <p data-hero-kicker className="mb-5 text-sm font-semibold uppercase tracking-[0.16em] text-accent">Sri Lanka</p>
        <h1 data-hero-title className="max-w-[18ch] text-[clamp(2.8rem,7vw,5.8rem)] font-bold leading-[0.98] tracking-[-0.055em]">
          I build websites and apps that scale.
        </h1>
        <p data-hero-copy className="mt-7 max-w-[52ch] text-lg leading-8 text-muted">
          I build fast, secure applications with Laravel, React and Express, along with business websites in WordPress. I also set up and support Google Analytics and Search Console.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a data-hero-action href="#projects" className={btnPrimary}>View my work</a>
          <a data-hero-action href="#contact" className={btnQuiet}>Contact me</a>
        </div>
      </div>
      <aside className="grid content-end gap-7 md:mb-1 md:pl-8">
        <div data-hero-aside>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Freelance</p>
          <p className="mt-2 max-w-[30ch] text-lg font-semibold leading-snug">Web projects for clients in the UK.</p>
        </div>
        <div data-hero-aside>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">At Amplifyd</p>
          <p className="mt-2 max-w-[30ch] text-lg font-semibold leading-snug">Software engineering for Australian client projects.</p>
        </div>
        <p className="text-sm text-muted"><span className="mr-2 text-3xl font-bold tracking-tight text-ink">70+</span> client projects</p>
      </aside>
    </section>
  );
}

function TechStack() {
  const toolsRef = useRef(null);
  const trackRef = useRef(null);

  useGSAP((_, contextSafe) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const marquee = gsap.to(trackRef.current, {
      xPercent: -50,
      duration: 72,
      ease: "none",
      repeat: -1,
    });

    const viewport = toolsRef.current?.querySelector(".tech-viewport");
    if (!viewport) return;
    const pause = contextSafe(() => marquee.pause());
    const resume = contextSafe(() => marquee.play());
    const onFocusOut = (event) => {
      if (!viewport.contains(event.relatedTarget)) resume();
    };
    viewport.addEventListener("pointerenter", pause);
    viewport.addEventListener("pointerleave", resume);
    viewport.addEventListener("focusin", pause);
    viewport.addEventListener("focusout", onFocusOut);
    return () => {
      viewport.removeEventListener("pointerenter", pause);
      viewport.removeEventListener("pointerleave", resume);
      viewport.removeEventListener("focusin", pause);
      viewport.removeEventListener("focusout", onFocusOut);
    };
  }, { scope: toolsRef });

  return (
    <section ref={toolsRef} aria-label="Technologies and services" className="border-y border-line py-7 md:py-9">
      <div className={wrap}>
        <p className="mb-7 text-sm font-semibold uppercase tracking-[0.16em] text-muted">Tools I work with</p>
        <div className="tech-viewport">
          <div ref={trackRef} className="tech-track flex w-max">
            {[false, true].map((duplicate) => (
              <div key={String(duplicate)} aria-hidden={duplicate || undefined} className="tech-group flex shrink-0 items-center gap-12 pr-12 md:gap-16 md:pr-16">
                {tools.map(([name, icon]) => (
                  <div data-tool-logo key={`${duplicate}-${name}`} className="flex min-h-14 shrink-0 items-center gap-4 text-base font-semibold text-ink">
                    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-12 w-12 shrink-0" style={{ color: `#${icon.hex}` }}>
                      <path fill="currentColor" d={icon.path} />
                    </svg>
                    <span>{name}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
function Projects({ projects }) {
  return (
    <Section id="projects" title="Live projects">
      <div className="grid gap-12 md:gap-20">
        {projects.map((p, i) => (
          <Reveal key={p.name} className="grid items-center gap-6 md:grid-cols-2 md:gap-12">
            <a
              href={p.url}
              target="_blank"
              rel="noreferrer"
              aria-label={`Open ${p.name} (opens in a new tab)`}
              className={`project-panel group relative flex aspect-[16/10] min-h-56 flex-col justify-between overflow-hidden  border border-line p-6 transition duration-300 hover:-translate-y-1 sm:p-8 ${i % 2 ? "md:order-2" : ""}`}
            >
              <div className="relative z-10 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                <span>Project</span>
                <span>{String(i + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}</span>
              </div>
              <div className="relative z-10">
                {p.own && <span className="project-badge mb-3 inline-block px-3 py-1 text-xs font-semibold">Independent product</span>}
                <h3 className="max-w-[14ch] text-3xl font-bold leading-tight tracking-[-0.04em] text-ink sm:text-4xl">{p.name}</h3>
              </div>
              <div className="relative z-10 flex items-center justify-between gap-3 border-t border-line pt-4 text-sm font-medium text-muted">
                <span className="truncate">{p.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}</span>
                <span className="shrink-0 text-accent" aria-hidden="true">Open</span>
              </div>
            </a>
            <div className={i % 2 ? "md:order-1" : ""}>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-accent">Project {String(i + 1).padStart(2, "0")}</p>
              <h3 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">{p.name}</h3>
              <p className="mt-3 max-w-[48ch] leading-7 text-muted">{p.text}</p>
              <a href={p.url} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-ink transition hover:text-accent">
                Visit website <span aria-hidden="true">&rarr;</span>
              </a>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
function Experience() {
  return (
    <Section id="experience" title="Experience">
      <div className="grid gap-12">
        {experience.map((e) => (
          <Reveal key={e.role + e.period} className="grid gap-2 md:grid-cols-[190px_1fr] md:gap-10">
            <p className="text-sm text-muted md:pt-1.5">{e.period}</p>
            <div>
              <h3 className="text-xl font-bold tracking-tight">{e.role}</h3>
              <p className="mt-0.5 text-muted">{e.company}</p>
              <ul className="mt-4 grid max-w-[62ch] gap-2 text-muted">
                {e.points.map((pt) => (
                  <li key={pt} className="ml-5 list-disc marker:text-line">
                    {pt}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

function About() {
  return (
    <Section id="about" title="About">
      <Reveal className="grid gap-10 md:grid-cols-[1.3fr_1fr] md:gap-16">
        <div>
          {profile.about.map((t) => (
            <p key={t} className="mb-4 max-w-[56ch] text-lg text-muted">
              {t}
            </p>
          ))}
        </div>
        <dl className="grid content-start gap-5">
          {skills.map((s) => (
            <div key={s.group}>
              <dt className="font-semibold">{s.group}</dt>
              <dd className="text-muted">{s.items}</dd>
            </div>
          ))}
        </dl>
      </Reveal>
    </Section>
  );
}

function LatestPosts() {
  const [posts, setPosts] = useState([]);
  useEffect(() => {
    api.get("/api/posts").then((p) => setPosts(p.slice(0, 3))).catch(() => {});
  }, []);
  if (!posts.length) return null; // nothing published yet (or backend offline): hide section
  return (
    <Section id="blog" title="From the blog">
      <div className="grid gap-6 md:grid-cols-3">
        {posts.map((p) => (
          <Reveal key={p.slug}>
            <Link to={`/blog/${p.slug}`} className="block h-full  border border-line bg-surface p-5 transition hover:border-accent">
              <p className="text-xs text-muted">{fmtDate(p.publishedAt)}</p>
              <h3 className="mt-2 text-lg font-bold tracking-tight">{p.title}</h3>
              {p.excerpt && <p className="mt-2 line-clamp-3 text-sm text-muted">{p.excerpt}</p>}
            </Link>
          </Reveal>
        ))}
      </div>
      <Link to="/blog" className={`${btnQuiet} mt-8`}>All posts</Link>
    </Section>
  );
}

function Contact() {
  const [copied, setCopied] = useState(false);
  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${profile.email}`;
    }
  };
  return (
    <section id="contact" className="border-y border-line bg-bg py-16 md:py-24">
      <div className={wrap}>
        <div className="grid gap-10 md:grid-cols-[0.9fr_1.1fr] md:gap-16">
          <Reveal>
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.16em] text-accent">Contact / 06</p>
            <h2 className="max-w-[12ch] text-[clamp(2.2rem,5vw,4rem)] font-bold leading-[1.02] tracking-[-0.05em]">Have a project? Let's talk.</h2>
            <p className="mt-5 max-w-[38ch] leading-7 text-muted">Share what you need, your timeline, and how to reach you. I take on selected freelance projects alongside my engineering work.</p>
            <a href={`mailto:${profile.email}`} className="mt-8 inline-block text-lg font-semibold text-accent [overflow-wrap:anywhere] hover:text-ink">
              {profile.email}
            </a>
            <div className="mt-6 flex flex-wrap items-center gap-5 text-sm">
              <button type="button" onClick={copyEmail} className="cursor-pointer text-muted hover:text-accent">
                {copied ? "Email copied" : "Copy email"}
              </button>
              <a href={profile.github} target="_blank" rel="noreferrer" className="text-muted hover:text-accent">GitHub</a>
            </div>
          </Reveal>
          <div className="border-t border-line pt-8 md:border-l md:border-t-0 md:pl-12 md:pt-0">
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const [projects, setProjects] = useState(featuredProjects);

  useEffect(() => {
    api.get("/api/projects").then((managed) => {
      if (!Array.isArray(managed) || managed.length === 0) return;

      const byName = new Map(managed.map((project) => [project.name.trim().toLowerCase(), project]));
      const featured = featuredProjects.map((project) =>
        byName.get(project.name.trim().toLowerCase()) || project
      );
      const featuredNames = new Set(featuredProjects.map((project) => project.name.trim().toLowerCase()));
      const additions = managed.filter((project) => !featuredNames.has(project.name.trim().toLowerCase()));
      setProjects([...featured, ...additions]);
    }).catch(() => {});
  }, []);

  return (
    <>
      <Hero />
      <TechStack />
      <About />
      <Experience />
      <Projects projects={projects} />
      <LatestPosts />
      <Contact />
    </>
  );
}
