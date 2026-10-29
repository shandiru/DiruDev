import { marked } from "marked";
import DOMPurify from "dompurify";

/* Markdown -> sanitized HTML (admin content is trusted, but we sanitize anyway). */
export default function Markdown({ text }) {
  let html;
  try {
    html = DOMPurify.sanitize(marked.parse(String(text || ""), { breaks: true }));
  } catch (error) {
    console.error("Could not render blog markdown:", error);
    return <div className="prose-lite whitespace-pre-wrap">{String(text || "The post content could not be rendered.")}</div>;
  }
  return <div className="prose-lite" dangerouslySetInnerHTML={{ __html: html }} />;
}
