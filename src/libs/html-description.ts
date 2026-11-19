import sanitizeHtml from "sanitize-html";

export function htmlDescription(html: string | undefined, preserveLineBreaks = false) {
  const stripped = sanitizeHtml(html ?? "", {
    allowedTags: preserveLineBreaks ? ["br"] : [],
    allowedAttributes: {}
  });
  const text = preserveLineBreaks ? stripped.replaceAll("<br />", "\n") : stripped;

  return text.length > 150 ? text.slice(0, 150) + "..." : text;
}
