import { Parser } from "htmlparser2";

const omittedTags = new Set(["script", "style", "textarea", "option", "xmp"]);

export function htmlDescription(html: string | undefined, preserveLineBreaks = false) {
  let text = "";
  let omittedDepth = 0;
  const parser = new Parser({
    onopentag(name) {
      if (omittedTags.has(name)) omittedDepth++;
      if (!omittedDepth && preserveLineBreaks && name === "br") text += "\n";
    },
    onclosetag(name) {
      if (omittedTags.has(name)) omittedDepth--;
    },
    ontext(value) {
      if (!omittedDepth) text += value;
    }
  });
  parser.end(html ?? "");

  const description = text.length > 150 ? text.slice(0, 150) + "..." : text;
  return preserveLineBreaks
    ? description.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    : description;
}
