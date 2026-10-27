import "express-async-errors";
import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import bcrypt from "bcryptjs";
import { connectDB } from "./config/db.js";
import Admin from "./models/Admin.js";
import publicRoutes from "./routes/public.js";
import adminRoutes from "./routes/admin.js";

const app = express();
app.set("trust proxy", 1); // real visitor IP behind Render / Vercel / Nginx

app.use(helmet());
const origins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((s) => s.trim().replace(/\/+$/, ""))
  .filter(Boolean);
app.use(cors({ origin: origins }));
app.use(express.json({ limit: "200kb" }));

app.get("/api/health", (req, res) => res.json({ ok: true }));
app.use("/api", publicRoutes);
app.use("/api/admin", adminRoutes);

app.use((req, res) => res.status(404).json({ message: "Not found" }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Server error" });
});

/* Create / update the admin from .env so you can always log in. */
async function seedAdmin() {
  const email = (process.env.ADMIN_EMAIL || "").toLowerCase();
  const pass = process.env.ADMIN_PASSWORD;
  if (!email || !pass) return console.warn("ADMIN_EMAIL / ADMIN_PASSWORD not set, skipping admin seed");
  const hash = await bcrypt.hash(pass, 12);
  const existing = await Admin.findOne({ email }).select("+password");
  if (!existing) {
    await Admin.create({ email, password: hash });
    console.log("Admin created:", email);
  } else if (!(await bcrypt.compare(pass, existing.password))) {
    existing.password = hash;
    await existing.save();
    console.log("Admin password updated from .env");
  }
}

const port = process.env.PORT || 5000;
connectDB()
  .then(seedAdmin)
  .then(() => app.listen(port, () => console.log(`API running on http://localhost:${port}`)))
  .catch((e) => {
    console.error("Startup failed:", e.message);
    process.exit(1);
  });
