import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const html = await readFile(new URL("./index.html", import.meta.url), "utf8");

test("SHOPNASGFX homepage leads with customer outcomes", () => {
  assert.match(html, /Look ready\. Promote with confidence\./);
  assert.match(html, /What are you trying to sell or promote\?/);
  assert.match(html, /Make my business look ready/);
  assert.doesNotMatch(html, /AI-Powered/i);
});

test("SHOPNASGFX homepage preserves price and contact facts", () => {
  for (const price of ["$150", "$250", "$500", "$750"]) assert.match(html, new RegExp(`\\${price}`));
  assert.match(html, /shopnasgfx-intake/);
  assert.match(html, /2674730397/);
  assert.match(html, /shopnasgfx@gmail\.com/);
});
