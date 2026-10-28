import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import Contact from "../models/Contact.js";
import Event from "../models/Event.js";
import LiveSession from "../models/LiveSession.js";
import Post from "../models/Post.js";
import Project from "../models/Project.js";
import { clientInfo } from "../utils/clientInfo.js";
import { sendContactNotification } from "../utils/mail.js";

const router = Router();

const eventLimiter = rateLimit({ windowMs: 60_000, limit: 120, standardHeaders: true, legacyHeaders: false });
const contactLimiter = rateLimit({
  windowMs: 60 * 60_000,
  limit: 8,
  message: { message: "Too many messages from this address. Please try again later." },
});

/* ---------- Event tracking: stores what the visitor did + IP + country ---------- */
const eventSchema = z.object({
  type: z.string().min(1).max(40),
  label: z.string().max(200).optional(),
  path: z.string().max(300).optional(),
  meta: z.record(z.any()).optional(),
  visitorId: z.string().max(64).optional(),
  sessionId: z.string().max(64).optional(),
  referrer: z.string().max(300).optional(),
});

router.post("/events", eventLimiter, async (req, res) => {
  const parsed = eventSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid event" });
  try {
    const info = clientInfo(req);
    if (info.device === "bot") return res.json({ ok: true });
    const { sessionId, visitorId, path, type } = parsed.data;
    if (sessionId && (type === "visit_start" || type === "heartbeat")) {
      await LiveSession.findOneAndUpdate(
        { sessionId },
        { $set: {
          visitorId,
          path,
          country: info.country,
          countryCode: info.countryCode,
          city: info.city,
          region: info.region,
          latitude: info.latitude,
          longitude: info.longitude,
          device: info.device,
          lastSeen: new Date(),
        } },
        { upsert: true, setDefaultsOnInsert: true }
      );
    } else if (sessionId && type === "visit_end") {
      await LiveSession.deleteOne({ sessionId });
    }
    if (type !== "heartbeat") await Event.create({ ...parsed.data, ...info });
  } catch (e) {
    console.error("event save failed:", e.message);
  }
  res.json({ ok: true });
});

/* ---------- Contact form ---------- */
const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  email: z.string().trim().email("Please enter a valid email").max(200),
  phone: z.string().trim().max(40).optional().default(""),
  subject: z.string().trim().max(150).optional().default(""),
  budget: z.string().trim().max(60).optional().default(""),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(5000),
  website: z.string().optional(), // honeypot, real users leave it empty
});

router.post("/contact", contactLimiter, async (req, res) => {
  const parsed = contactSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0].message });
  }
  const { website, ...data } = parsed.data;
  if (website) return res.json({ ok: true }); // bot: pretend success

  const info = clientInfo(req);
  const doc = await Contact.create({
    ...data,
    ip: info.ip,
    country: info.country,
    city: info.city,
  });

  await Event.create({
    type: "contact_submit",
    label: `Contact form: ${data.name}`,
    path: "/#contact",
    meta: { contactId: doc._id },
    visitorId: String(req.body.visitorId || "").slice(0, 64),
    ...info,
  }).catch(() => {});

  // Email must never block or fail the request: the message is already saved.
  sendContactNotification({ ...data, country: info.country })
    .then((sent) => sent && Contact.updateOne({ _id: doc._id }, { emailSent: true }))
    .catch((e) => console.error("mail failed:", e.message));

  res.status(201).json({ ok: true, message: "Thanks! Your message has been sent." });
});

/* ---------- Blog (public) ---------- */
router.get("/projects", async (req, res) => {
  const projects = await Project.find({ active: true }).sort({ order: 1, createdAt: 1 }).lean();
  res.json(projects);
});

router.get("/posts", async (req, res) => {
  const posts = await Post.find({ published: true })
    .select("title slug excerpt coverImage tags publishedAt views")
    .sort({ publishedAt: -1 })
    .limit(50)
    .lean();
  res.json(posts);
});

router.get("/posts/:slug", async (req, res) => {
  const post = await Post.findOneAndUpdate(
    { slug: req.params.slug, published: true },
    { $inc: { views: 1 } },
    { new: true }
  ).lean();
  if (!post) return res.status(404).json({ message: "Post not found" });
  res.json(post);
});

export default router;
