import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 200 },
    phone: { type: String, trim: true, maxlength: 40, default: "" },
    subject: { type: String, trim: true, maxlength: 150, default: "" },
    budget: { type: String, trim: true, maxlength: 60, default: "" },
    message: { type: String, required: true, trim: true, maxlength: 5000 },
    ip: String,
    country: String,
    city: String,
    read: { type: Boolean, default: false },
    emailSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Contact", contactSchema);
