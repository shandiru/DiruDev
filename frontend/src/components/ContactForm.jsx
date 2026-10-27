import { useState } from "react";
import { api } from "../lib/api.js";
import { track, visitorId } from "../lib/track.js";
import { btnPrimary, field } from "../ui.jsx";

const empty = { name: "", email: "", phone: "", subject: "", budget: "", message: "", website: "" };
const budgets = ["Not sure yet", "Under $500", "$500 - $1,500", "$1,500 - $5,000", "$5,000+"];

export default function ContactForm() {
  const [f, setF] = useState(empty);
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [error, setError] = useState("");

  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setStatus("sending");
    setError("");
    try {
      await api.post("/api/contact", { ...f, visitorId: visitorId() });
      track("contact_form_success", "Contact form sent");
      setF(empty);
      setStatus("sent");
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div role="status" className=" border border-accent/50 bg-surface p-6">
        <h3 className="text-xl font-bold">Message sent</h3>
        <p className="mt-2 text-muted">Thanks for reaching out. I will reply to your email soon.</p>
        <button type="button" onClick={() => setStatus("idle")} className="mt-4 text-accent hover:text-ink">
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm font-medium">
          Name *
          <input className={field} value={f.name} onChange={set("name")} required maxLength={100} autoComplete="name" placeholder="Your name" />
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          Email *
          <input className={field} type="email" value={f.email} onChange={set("email")} required maxLength={200} autoComplete="email" placeholder="you@example.com" />
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          Phone (optional)
          <input className={field} type="tel" value={f.phone} onChange={set("phone")} maxLength={40} autoComplete="tel" placeholder="+94 ..." />
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          Budget (optional)
          <select className={field} value={f.budget} onChange={set("budget")}>
            <option value="">Select a range</option>
            {budgets.map((b) => <option key={b}>{b}</option>)}
          </select>
        </label>
      </div>
      <label className="grid gap-1.5 text-sm font-medium">
        Subject (optional)
        <input className={field} value={f.subject} onChange={set("subject")} maxLength={150} placeholder="e.g. New website for my business" />
      </label>
      <label className="grid gap-1.5 text-sm font-medium">
        Message *
        <textarea className={`${field} min-h-36 resize-y`} value={f.message} onChange={set("message")} required minLength={10} maxLength={5000} placeholder="Tell me what you want to build and when you need it." />
      </label>

      {/* Honeypot: hidden from people, bots fill it in. */}
      <input tabIndex={-1} autoComplete="off" aria-hidden="true" value={f.website} onChange={set("website")} className="absolute left-[-9999px] h-0 w-0 opacity-0" name="website" />

      {status === "error" && <p role="alert" className="text-sm text-red-400">{error}</p>}
      <div>
        <button type="submit" disabled={status === "sending"} className={`${btnPrimary} cursor-pointer`}>
          {status === "sending" ? "Sending..." : "Send message"}
        </button>
      </div>
    </form>
  );
}
