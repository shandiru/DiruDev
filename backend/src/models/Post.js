import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, required: true, unique: true, index: true },
    excerpt: { type: String, trim: true, maxlength: 400, default: "" },
    content: { type: String, required: true }, // markdown
    coverImage: { type: String, trim: true, default: "" },
    tags: [{ type: String, trim: true, maxlength: 30 }],
    published: { type: Boolean, default: false },
    publishedAt: Date,
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Post", postSchema);
