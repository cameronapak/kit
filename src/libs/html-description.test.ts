import assert from "node:assert/strict";
import test from "node:test";
import { htmlDescription } from "./html-description.ts";

test("uses only text in page descriptions", () => {
  assert.equal(htmlDescription("<p>A <strong>project</strong><br> update</p>"), "A project update");
  assert.equal(htmlDescription(undefined), "");
  assert.equal(htmlDescription("a".repeat(151)), "a".repeat(150) + "...");
});

test("omits non-description text and decodes entities in page descriptions", () => {
  assert.equal(htmlDescription("<style>discard</style><p>R&amp;D &lt;3</p><textarea>discard</textarea>"), "R&D <3");
});

test("preserves line breaks and percentages and escapes markup for feed readers", () => {
  assert.equal(
    htmlDescription("<p>50% complete<br class='break'>&lt;em&gt;R&amp;D&lt;/em&gt;</p>", true),
    "50% complete\n&lt;em&gt;R&amp;D&lt;/em&gt;"
  );
});
