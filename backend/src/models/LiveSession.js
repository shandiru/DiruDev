import mongoose from "mongoose";

const liveSessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true, maxlength: 64 },
  visitorId: { type: String, maxlength: 64 },
  path: { type: String, maxlength: 300, default: "/" },
  country: { type: String, default: "Unknown" },
  countryCode: { type: String, default: "" },
  city: { type: String, default: "" },
  region: { type: String, default: "" },
  latitude: { type: Number, default: null },
  longitude: { type: Number, default: null },
  device: { type: String, default: "desktop" },
  lastSeen: { type: Date, required: true, expires: 120 },
});

export default mongoose.model("LiveSession", liveSessionSchema);
