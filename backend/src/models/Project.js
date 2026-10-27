import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    url: { type: String, required: true, trim: true, maxlength: 500 },
    text: { type: String, required: true, trim: true, maxlength: 600 },
    own: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    order: { type: Number, default: 0, min: 0, max: 999 },
  },
  { timestamps: true }
);

projectSchema.index({ order: 1, createdAt: 1 });

export default mongoose.model("Project", projectSchema);
