import mongoose from "mongoose";

/* One row per user action: page_view, click, section_view, contact_submit, blog_view ... */
const eventSchema = new mongoose.Schema(
  {
    type: { type: String, required: true, index: true, maxlength: 40 },
    label: { type: String, default: "", maxlength: 200 },
    path: { type: String, default: "", maxlength: 300 },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
    visitorId: { type: String, index: true, maxlength: 64 },
    sessionId: { type: String, maxlength: 64 },
    ip: { type: String, index: true },
    country: { type: String, default: "Unknown", index: true },
    countryCode: { type: String, default: "" },
    region: { type: String, default: "" },
    city: { type: String, default: "" },
    userAgent: { type: String, maxlength: 400 },
    device: { type: String, default: "desktop" },
    referrer: { type: String, default: "", maxlength: 300 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

eventSchema.index({ createdAt: -1 });

export default mongoose.model("Event", eventSchema);
