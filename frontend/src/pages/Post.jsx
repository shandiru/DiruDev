import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { wrap, fmtDate } from "../ui.jsx";
import { api } from "../lib/api.js";
import { track } from "../lib/track.js";
import Markdown from "../components/Markdown.jsx";

export default function Post() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setPost(null);
    setError("");
    api
      .get(`/api/posts/${slug}`)
      .then((p) => {
        setPost(p);
        document.title = `${p.title} | Dirushan`;
        track("blog_view", p.title, { slug: p.slug });
      })
      .catch((e) => setError(e.message));
  }, [slug]);

  return (
    <article className={`${wrap} max-w-[760px] py-16 md:py-24`}>
      <Link to="/blog" className="text-sm text-muted hover:text-ink">← All posts</Link>
      {error && <p className="mt-10 text-red-400">{error}</p>}
      {!post && !error && <p className="mt-10 text-muted">Loading...</p>}
      {post && (
        <>
          <p className="mt-8 text-sm text-muted">{fmtDate(post.publishedAt)}</p>
          <h1 className="mt-2 text-[clamp(2rem,5vw,3.2rem)] font-bold leading-tight tracking-[-0.03em]">{post.title}</h1>
          {post.coverImage && <img src={post.coverImage} alt="" className="mt-8 w-full  border border-line" />}
          <div className="mt-10"><Markdown text={post.content} /></div>
          <Link to="/#contact" className="mt-14 inline-block text-accent hover:text-ink">Have a project in mind? Get in touch</Link>
        </>
      )}
    </article>
  );
}
