import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { wrap, fmtDate } from "../ui.jsx";
import { api } from "../lib/api.js";

export default function Blog() {
  const [posts, setPosts] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "Blog | Dirushan";
    api.get("/api/posts").then(setPosts).catch((e) => setError(e.message));
  }, []);

  return (
    <section className={`${wrap} py-16 md:py-24`}>
      <p className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-accent">Writing</p>
      <h1 className="text-[clamp(2.2rem,6vw,3.6rem)] font-bold tracking-[-0.04em]">Notes from the work</h1>
      <p className="mt-3 max-w-[50ch] text-lg text-muted">Things I've learned while building web apps, working with clients, and figuring out what makes a site useful.</p>

      {error && <p className="mt-10 border border-accent p-4 text-ink">Couldn't load posts right now. Please try again later.</p>}
      {!posts && !error && <p className="mt-10 text-muted">Loading posts...</p>}
      {posts && posts.length === 0 && <p className="mt-10 border-t border-line py-6 text-muted">No posts published yet.</p>}

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {posts?.map((p) => (
          <Link key={p.slug} to={`/blog/${p.slug}`} className="card-link group overflow-hidden border border-line bg-surface hover:border-accent">
            {p.coverImage && <img src={p.coverImage} alt="" loading="lazy" className="aspect-[16/9] w-full object-cover" />}
            <div className="p-6">
              <p className="text-xs text-muted">{fmtDate(p.publishedAt)}</p>
              <h2 className="mt-2 text-xl font-bold tracking-tight group-hover:text-accent">{p.title} <span aria-hidden="true">↗</span></h2>
              {p.excerpt && <p className="mt-2 text-muted">{p.excerpt}</p>}
              {p.tags?.length > 0 && (
                <p className="mt-4 flex flex-wrap gap-2 text-xs text-muted">
                  {p.tags.map((t) => <span key={t} className=" border border-line px-2 py-0.5">{t}</span>)}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
