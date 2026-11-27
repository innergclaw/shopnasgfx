import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const home = await readFile(new URL("./index.html", import.meta.url), "utf8");
const html = await readFile(new URL("./quick-designs/index.html", import.meta.url), "utf8");
const script = await readFile(new URL("./script.js", import.meta.url), "utf8");
const faq = await readFile(new URL("./faq.html", import.meta.url), "utf8");
const reviews = await readFile(new URL("./reviews.html", import.meta.url), "utf8");
const fileFix = await readFile(new URL("./si-design-file-fix.html", import.meta.url), "utf8");

test("Quick designs page leads with the builder path", () => {
  assert.match(html, /Built for the builders\. Priced for real life\./);
  assert.match(html, /What are you trying to sell or promote\?/);
  assert.match(html, /See services from \$15/);
  assert.match(html, /Text about my project/);
  assert.doesNotMatch(html, /AI-Powered/i);
});

test("Quick designs page keeps the decision path short", () => {
  assert.doesNotMatch(html, /Selected client work/);
  assert.doesNotMatch(html, /id="work"/);
  assert.match(html, /Takes about 2 minutes/);
  assert.match(html, /class="[^"]*reveal-section/);
  assert.match(script, /IntersectionObserver/);
  assert.match(script, /prefers-reduced-motion/);
  assert.match(html, /href="\.\.\/ecosystem\.css(?:\?[^\"]+)?"/);
});

test("Quick designs page preserves price and contact facts", () => {
  for (const price of ["$15", "$35", "$45", "$100", "$250", "$500"]) assert.match(html, new RegExp(`\\${price}`));
  assert.doesNotMatch(html, /Logo Suite/);
  assert.match(html, /Logo Starter - \$100 intro<\/option>\s*<option>Brand Starter Kit - \$250 intro/);
  const packages = html.slice(html.indexOf('id="packages"'), html.indexOf('id="agents"'));
  assert.match(packages, /<h3>Logo Starter<\/h3>[\s\S]*?<h3>Brand Starter Kit<\/h3>/);
  assert.doesNotMatch(packages, /<h3>Logo Suite<\/h3>/);
  assert.match(html, /shopnasgfx-intake/);
  assert.match(html, /2674730397/);
  assert.match(html, /shopnasgfx@gmail\.com/);
});

test("SHOPNASGFX speaks in the lead designer's first-person voice", () => {
  for (const page of [home, html, faq, reviews, fileFix]) {
    assert.doesNotMatch(page, /\b(?:we|we'll|our|us)\b/i);
    assert.doesNotMatch(page, /ShopNasGraphics/);
  }

  assert.match(html, /I'm Nasirr, the lead designer behind SHOPNASGFX\./);
  assert.match(html, /Introductory prices/);
  assert.match(faq, /starting a project with me/);
  assert.match(reviews, /working with me and my SHOPNASGFX team/);
  assert.match(fileFix, /send it to me\. I clean it up/);
});

const offers = await readFile(new URL("./offers.js", import.meta.url), "utf8");
const intake = await import("./brand-intake.mjs");

test("Home leads with brand systems and links to quick designs", () => {
  assert.match(home, /I build brands that run with SI behind them\./);
  assert.match(home, /500\+/);
  assert.match(home, /2015/);
  assert.match(html, /href="\.\.\/"/);
  assert.match(home, /id="how"/);
  for (const n of ["Honey &amp; Friends Events", "Brinx Fitness", "Omni Global Solutions LLC"]) assert.ok(home.includes(n));
});

const archivedWorkshops = await readFile(new URL("./archived/workshops.js", import.meta.url), "utf8");

test("Prices live in offers.js and are marked proposed", () => {
  assert.match(offers, /pricesAreProposed: false/);
  assert.ok(!home.includes("$750/mo"));
  for (const gone of ["Brand Spark", "Brand Foundation Pro", "Brand Refresh", "Brand System\""]) { assert.ok(!offers.includes(gone), gone); assert.ok(!home.includes(gone), gone); }
  for (const p of ["$15\"", "$35\"", "$45\"", "$100\"", "$250\"", "$500\"", "$9/mo", "$15/mo", "$29/mo"]) assert.ok(offers.includes(p), p);
  assert.ok(!/retainer/i.test(home) && !/retainer/i.test(offers));
});

test("Calculator and FAQ use the package deposit rules", () => {
  assert.match(home, /id="calculator-due-label">Due in full</);
  assert.match(home, /id="calculator-deposit">\$100</);
  assert.doesNotMatch(home, /25% project deposit/);
  assert.doesNotMatch(faq, /under \$150/);
  assert.match(faq, /Logo Starter is \$100, paid in full/);
  assert.match(faq, /Brand Starter Kit is \$250, paid in full/);
  assert.match(faq, /Launch Package is \$500, with a 50% deposit/);
});

test("SI brand workshops are archived and off the public site", () => {
  for (const p of ["$97 ($79 early)", "$297", "$1,800", "$3,200"]) assert.ok(archivedWorkshops.includes(p), p);
  assert.match(archivedWorkshops, /SI Brand Workshop seat/);
  assert.doesNotMatch(offers, /workshops\s*:/);
  assert.doesNotMatch(home, /Teach the Process/);
  assert.doesNotMatch(home, /id="teach"/);
  assert.doesNotMatch(home, /SI Brand Workshop/);
  assert.doesNotMatch(home, /offers-workshop/);
});

test("Intake requires the exact deposit agreement and texts 267 473 0397", () => {
  const sentence = "I understand that by submitting this form or texting, Logo Starter and Brand Starter Kit are paid in full before any work begins, and the Launch Package requires a 50% deposit before work begins, with the remaining 50% due before final files.";
  assert.ok(home.includes(sentence));
  assert.match(home, /name="depositAgreement" value="agreed" required/);
  const ok = { firstName: "A", lastName: "B", serviceType: "Brand design", details: "x", budget: "$500 to $1,500", delivery: "Not sure", depositAgreement: "agreed" };
  assert.deepEqual(intake.validateDetails(ok), {});
  assert.ok(intake.validateDetails({ ...ok, depositAgreement: undefined }).depositAgreement);
  assert.match(intake.buildSmsHref(intake.buildMessage(ok)), /^sms:\+12674730397\?&body=/);
});

test("Site copy avoids AI wording, em dashes, and emoji glyphs", async () => {
  const files = ["index.html", "quick-designs/index.html", "si-design-file-fix.html", "faq.html", "reviews.html", "prompts.html", "dashboard/index.html", "offers.js", "brand-home.js", "brand-intake.mjs", "brand-home.css"];
  for (const f of files) {
    const t = await readFile(new URL("./" + f, import.meta.url), "utf8");
    assert.doesNotMatch(t, /\bAI\b/, f);
    assert.doesNotMatch(t, /\u2014/, f);
    assert.doesNotMatch(t, /[\u2190-\u21FF\u2600-\u27BF]|[\u{1F300}-\u{1FAFF}]/u, f);
  }
});
