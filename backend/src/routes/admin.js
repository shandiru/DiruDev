import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import mongoose from "mongoose";
import Admin from "../models/Admin.js";
import Contact from "../models/Contact.js";
import Event from "../models/Event.js";
import LiveSession from "../models/LiveSession.js";
import Post from "../models/Post.js";
import Project from "../models/Project.js";
import { requireAdmin, signToken } from "../middleware/auth.js";
import { slugify } from "../utils/slug.js";

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60_000,
  limit: 10,
  message: { message: "Too many login attempts. Try again in 15 minutes." },
});

/* ---------- Auth ---------- */
router.post("/login", loginLimiter, async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  const admin = await Admin.findOne({ email }).select("+password");
  if (!admin || !(await admin.matches(password))) {
    return res.status(401).json({ message: "Wrong email or password" });
  }
  res.json({ token: signToken(admin), email: admin.email });
});

router.use(requireAdmin);

router.get("/me", (req, res) => res.json({ email: req.admin.email }));

const validId = (req, res, next) =>
  mongoose.isValidObjectId(req.params.id) ? next() : res.status(400).json({ message: "Bad id" });

/* ---------- Dashboard stats ---------- */
router.get("/stats", async (req, res) => {
  const days = Math.min(Number(req.query.days) || 30, 365);
  const since = new Date(Date.now() - days * 86400_000);
  const match = { createdAt: { $gte: since } };

  const liveSince = new Date(Date.now() - 60_000);
  const [totals, byCountry, byType, perDay, topLabels, unreadMessages, posts, liveUsers, liveByCountry, liveLocations] = await Promise.all([
    Event.aggregate([
      { $match: match },
      { $group: { _id: null, events: { $sum: 1 }, visitors: { $addToSet: "$visitorId" } } },
      { $project: { events: 1, visitors: { $size: "$visitors" } } },
    ]),
    Event.aggregate([
      { $match: match },
      { $group: { _id: "$country", events: { $sum: 1 }, visitors: { $addToSet: "$visitorId" } } },
      { $project: { country: "$_id", events: 1, visitors: { $size: "$visitors" } } },
      { $sort: { events: -1 } },
      { $limit: 15 },
    ]),
    Event.aggregate([{ $match: match }, { $group: { _id: "$type", count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
    Event.aggregate([
      { $match: match },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, events: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Event.aggregate([
      { $match: { ...match, type: "click" } },
      { $group: { _id: "$label", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]),
    Contact.countDocuments({ read: false }),
    Post.countDocuments({ published: true }),
    LiveSession.countDocuments({ lastSeen: { $gte: liveSince } }),
    LiveSession.aggregate([
      { $match: { lastSeen: { $gte: liveSince } } },
      { $group: { _id: { country: "$country", countryCode: "$countryCode" }, users: { $sum: 1 } } },
      { $project: { _id: 0, country: "$_id.country", countryCode: "$_id.countryCode", users: 1 } },
      { $sort: { users: -1 } },
    ]),
    LiveSession.aggregate([
      { $match: { lastSeen: { $gte: liveSince }, latitude: { $ne: null }, longitude: { $ne: null } } },
      { $group: {
        _id: { city: "$city", region: "$region", country: "$country", latitude: "$latitude", longitude: "$longitude" },
        users: { $sum: 1 },
      } },
      { $project: {
        _id: 0,
        city: "$_id.city",
        region: "$_id.region",
        country: "$_id.country",
        latitude: "$_id.latitude",
        longitude: "$_id.longitude",
        users: 1,
      } },
      { $sort: { users: -1 } },
    ]),
  ]);

  res.json({
    days,
    totalEvents: totals[0]?.events || 0,
    uniqueVisitors: totals[0]?.visitors || 0,
    byCountry,
    byType,
    perDay,
    topClicks: topLabels,
    unreadMessages,
    publishedPosts: posts,
    liveUsers,
    liveByCountry,
    liveLocations,
  });
});

/* ---------- Events list ---------- */
router.get("/events", async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 50, 200);
  const q = {};
  if (req.query.type) q.type = String(req.query.type);
  if (req.query.country) q.country = String(req.query.country);
  if (req.query.ip) q.ip = String(req.query.ip);
  const [items, total] = await Promise.all([
    Event.find(q).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Event.countDocuments(q),
  ]);
  res.json({ items, total, page, pages: Math.ceil(total / limit) });
});

router.delete("/events", async (req, res) => {
  const olderThan = Number(req.query.olderThanDays);
  if (!olderThan) return res.status(400).json({ message: "olderThanDays required" });
  const r = await Event.deleteMany({ createdAt: { $lt: new Date(Date.now() - olderThan * 86400_000) } });
  res.json({ deleted: r.deletedCount });
});

/* ---------- Contact messages ---------- */
router.get("/contacts", async (req, res) => {
  res.json(await Contact.find().sort({ createdAt: -1 }).limit(300).lean());
});

router.patch("/contacts/:id", validId, async (req, res) => {
  const c = await Contact.findByIdAndUpdate(req.params.id, { read: !!req.body.read }, { new: true });
  if (!c) return res.status(404).json({ message: "Not found" });
  res.json(c);
});

router.delete("/contacts/:id", validId, async (req, res) => {
  await Contact.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

/* ---------- Project management ---------- */
const projectInputSchema = z.object({
  name: z.string().trim().min(2).max(120),
  url: z.string().trim().url().max(500).refine((v) => /^https?:\/\//i.test(v), "URL must start with http:// or https://"),
  text: z.string().trim().min(10).max(600),
  own: z.boolean().optional().default(false),
  active: z.boolean().optional().default(true),
  order: z.number().int().min(0).max(999).optional().default(0),
});

router.get("/projects", async (req, res) => {
  res.json(await Project.find().sort({ order: 1, createdAt: 1 }).lean());
});

router.get("/projects/:id", validId, async (req, res) => {
  const project = await Project.findById(req.params.id).lean();
  if (!project) return res.status(404).json({ message: "Not found" });
  res.json(project);
});

router.post("/projects", async (req, res) => {
  const parsed = projectInputSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: parsed.error.issues[0].message });
  res.status(201).json(await Project.create(parsed.data));
});

router.put("/projects/:id", validId, async (req, res) => {
  const parsed = projectInputSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: parsed.error.issues[0].message });
  const project = await Project.findByIdAndUpdate(req.params.id, parsed.data, { new: true, runValidators: true });
  if (!project) return res.status(404).json({ message: "Not found" });
  res.json(project);
});

router.delete("/projects/:id", validId, async (req, res) => {
  await Project.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

/* ---------- Blog management ---------- */
const postSchema = z.object({
  title: z.string().trim().min(3).max(200),
  excerpt: z.string().trim().max(400).optional().default(""),
  content: z.string().min(10, "Content is too short"),
  coverImage: z
    .string()
    .trim()
    .refine((v) => v === "" || /^https?:\/\//i.test(v), "Cover image must be an http(s) URL")
    .optional()
    .default(""),
  tags: z.array(z.string().trim().min(1).max(30)).max(8).optional().default([]),
  published: z.boolean().optional().default(false),
});

async function uniqueSlug(title, ignoreId) {
  const base = slugify(title);
  let slug = base;
  let n = 2;
  while (await Post.exists({ slug, ...(ignoreId ? { _id: { $ne: ignoreId } } : {}) })) slug = `${base}-${n++}`;
  return slug;
}

router.get("/posts", async (req, res) => {
  res.json(await Post.find().select("-content").sort({ createdAt: -1 }).lean());
});

router.get("/posts/:id", validId, async (req, res) => {
  const p = await Post.findById(req.params.id).lean();
  if (!p) return res.status(404).json({ message: "Not found" });
  res.json(p);
});

router.post("/posts", async (req, res) => {
  const parsed = postSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: parsed.error.issues[0].message });
  const d = parsed.data;
  const post = await Post.create({
    ...d,
    slug: await uniqueSlug(d.title),
    publishedAt: d.published ? new Date() : undefined,
  });
  res.status(201).json(post);
});

router.put("/posts/:id", validId, async (req, res) => {
  const parsed = postSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: parsed.error.issues[0].message });
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: "Not found" });
  const d = parsed.data;
  if (d.title !== post.title) post.slug = await uniqueSlug(d.title, post._id);
  if (d.published && !post.publishedAt) post.publishedAt = new Date();
  Object.assign(post, d);
  await post.save();
  res.json(post);
});

router.delete("/posts/:id", validId, async (req, res) => {
  await Post.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

export default router;
