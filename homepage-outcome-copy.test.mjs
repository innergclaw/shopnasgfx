import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const html = await readFile(new URL("./index.html", import.meta.url), "utf8");
const script = await readFile(new URL("./script.js", import.meta.url), "utf8");

test("SHOPNASGFX homepage leads with customer outcomes", () => {
  assert.match(html, /Look ready\. Promote with confidence\./);
  assert.match(html, /What are you trying to sell or promote\?/);
  assert.match(html, /Fill out the short form/);
  assert.match(html, /Text about my project/);
  assert.doesNotMatch(html, /AI-Powered/i);
});

test("SHOPNASGFX homepage keeps the decision path short", () => {
  assert.doesNotMatch(html, /Selected client work/);
  assert.doesNotMatch(html, /id="work"/);
  assert.match(html, /Takes about 2 minutes/);
  assert.match(html, /class="[^"]*reveal-section/);
  assert.match(script, /IntersectionObserver/);
  assert.match(script, /prefers-reduced-motion/);
});

test("SHOPNASGFX homepage preserves price and contact facts", () => {
  for (const price of ["$150", "$250", "$500", "$750"]) assert.match(html, new RegExp(`\\${price}`));
  assert.match(html, /shopnasgfx-intake/);
  assert.match(html, /2674730397/);
  assert.match(html, /shopnasgfx@gmail\.com/);
});
