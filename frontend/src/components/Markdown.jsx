import { useMemo } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";

/* Markdown -> sanitized HTML (admin content is trusted, but we sanitize anyway). */
export default function Markdown({ text }) {
  const html = useMemo(() => DOMPurify.sanitize(marked.parse(text || "", { breaks: true })), [text]);
  return <div className="prose-lite" dangerouslySetInnerHTML={{ __html: html }} />;
}
