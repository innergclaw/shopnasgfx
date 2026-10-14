import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const html = await readFile(new URL("./index.html", import.meta.url), "utf8");
const script = await readFile(new URL("./script.js", import.meta.url), "utf8");
const faq = await readFile(new URL("./faq.html", import.meta.url), "utf8");
const reviews = await readFile(new URL("./reviews.html", import.meta.url), "utf8");
const fileFix = await readFile(new URL("./ai-design-file-fix.html", import.meta.url), "utf8");

test("SHOPNASGFX homepage leads with the builder path", () => {
  assert.match(html, /Built for the builders\. Priced for real life\./);
  assert.match(html, /What are you trying to sell or promote\?/);
  assert.match(html, /See services from \$15/);
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
  assert.match(html, /href="ecosystem\.css(?:\?[^\"]+)?"/);
});

test("SHOPNASGFX homepage preserves price and contact facts", () => {
  for (const price of ["$15", "$35", "$45", "$50", "$150", "$250"]) assert.match(html, new RegExp(`\\${price}`));
  assert.doesNotMatch(html, /Logo Suite/);
  assert.doesNotMatch(html, /\$100/);
  assert.match(html, /Logo Starter - \$50 intro<\/option>\s*<option>Brand Starter Kit - \$150 intro/);
  const packages = html.slice(html.indexOf('id="packages"'), html.indexOf('id="agents"'));
  assert.match(packages, /<h3>Logo Starter<\/h3>[\s\S]*?<h3>Brand Starter Kit<\/h3>/);
  assert.doesNotMatch(packages, /<h3>Logo Suite<\/h3>/);
  assert.match(html, /shopnasgfx-intake/);
  assert.match(html, /2674730397/);
  assert.match(html, /shopnasgfx@gmail\.com/);
});

test("SHOPNASGFX speaks in the lead designer's first-person voice", () => {
  for (const page of [html, faq, reviews, fileFix]) {
    assert.doesNotMatch(page, /\b(?:we|we'll|our|us)\b/i);
    assert.doesNotMatch(page, /ShopNasGraphics/);
  }

  assert.match(html, /I'm Nasirr, the lead designer behind SHOPNASGFX\./);
  assert.match(html, /Introductory prices/);
  assert.match(faq, /starting a project with me/);
  assert.match(reviews, /working with me and my SHOPNASGFX team/);
  assert.match(fileFix, /send it to me\. I clean it up/);
});
