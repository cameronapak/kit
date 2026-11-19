import assert from "node:assert/strict";
import test from "node:test";
import { htmlDescription } from "./html-description.ts";

test("uses only text in page descriptions", () => {
  assert.equal(htmlDescription("<p>A <strong>project</strong><br> update</p>"), "A project update");
  assert.equal(htmlDescription(undefined), "");
  assert.equal(htmlDescription("a".repeat(151)), "a".repeat(150) + "...");
});

test("preserves line breaks and literal percentages in feed descriptions", () => {
  assert.equal(htmlDescription("<p>50% complete<br class='break'>Next step</p>", true), "50% complete\nNext step");
});
