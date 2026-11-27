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
  assert.match(html, /Professional work for owners who are ready to be taken seriously\./);
  assert.match(html, /What do you need designed\?/);
  assert.match(html, /View services from \$15/);
  assert.match(html, /Text me about a project/);
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
  for (const price of ["$15", "$35", "$45", "$125", "$300", "$750"]) assert.match(html, new RegExp(`\\${price}`));
  assert.doesNotMatch(html, /Logo Suite/);
  assert.match(html, /Logo Starter - \$125 intro<\/option>\s*<option>Brand Starter Kit - \$300 intro/);
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
  assert.match(faq, /Practical terms for working with me on a SHOPNASGFX project/);
  assert.match(reviews, /working with me and my SHOPNASGFX team/);
  assert.match(fileFix, /send it to me\. I clean it up/);
});

const offers = await readFile(new URL("./offers.js", import.meta.url), "utf8");
const intake = await import("./brand-intake.mjs");

test("Home leads with brand systems and links to quick designs", () => {
  assert.match(home, /Ten years in practice\. Brands built to scale\./);
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
  for (const p of ["$15\"", "$35\"", "$45\"", "$125\"", "$300\"", "$750\"", "$9/mo", "$15/mo", "$29/mo"]) assert.ok(offers.includes(p), p);
  assert.ok(!/retainer/i.test(home) && !/retainer/i.test(offers));
});

test("Calculator and FAQ use the package deposit rules", () => {
  assert.match(home, /id="calculator-due-label">Due in full</);
  assert.match(home, /id="calculator-deposit">\$125</);
  assert.doesNotMatch(home, /25% project deposit/);
  assert.doesNotMatch(faq, /under \$150/);
  assert.match(faq, /Logo Starter is \$125, paid in full/);
  assert.match(faq, /Brand Starter Kit is \$300, paid in full/);
  assert.match(faq, /Launch Package is \$750, with a 50% deposit/);
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

test("How I work headline can wrap and packages use dropdowns", () => {
  assert.match(home, /id="how-title">I direct the work\. SI carries the repetition\.</);
  assert.match(home, /<details class="soft-details"><summary><b>01<\/b> Strategy<\/summary>/);
  assert.match(home, /id="package-details"/);
  assert.match(home, /<details class="soft-details calculator-terms"><summary>Payment terms<\/summary>/);
  assert.match(html, /<details class="soft-details"><summary>What's included<\/summary>/);
  assert.match(html, /<details class="soft-details"><summary>Payment terms<\/summary>/);
});

test("FAQ package anchors point at the live home sections", () => {
  assert.match(faq, /href="index.html#services"/);
  assert.match(faq, /href="index.html#how"/);
  assert.match(faq, /href="index.html#start"/);
  assert.doesNotMatch(faq, /index.html#packages/);
  assert.doesNotMatch(faq, /index.html#process/);
  assert.doesNotMatch(faq, /index.html#quote/);
});

test("Discuss this project opens a prefilled SMS to 267 473 0397", async () => {
  const pricing = await readFile(new URL("./pricing.js", import.meta.url), "utf8");
  assert.match(home, /id="calculator-continue"/);
  assert.match(home, /sms:\+12674730397\?&body=/);
  assert.match(home, /1%20%C3%97%20Logo%20Starter/);
  assert.match(home, /Due%20in%20full%3A%20%24125/);
  assert.match(pricing, /smsHref/);
  assert.match(pricing, /\?&body=/);
  assert.match(pricing, /\?body=/);
  assert.match(pricing, /encodeURIComponent/);
  assert.match(pricing, /\+12674730397/);
});

test("Package examples open PDFs in a new tab", async () => {
  const { stat } = await import("node:fs/promises");
  const pricing = await readFile(new URL("./pricing.js", import.meta.url), "utf8");
  const paths = [
    "/examples/logo-starter.pdf",
    "/examples/brand-starter-kit.pdf",
    "/examples/launch-package.pdf",
  ];
  for (const href of paths) {
    const escaped = href.replaceAll("/", "\\/");
    assert.match(offers, new RegExp(`example: "${escaped}"`));
    assert.match(html, new RegExp(`href="${escaped}"`));
    assert.match(faq, new RegExp(`href="${escaped}"`));
    const info = await stat(new URL("." + href, import.meta.url));
    assert.ok(info.size > 1000, href);
    assert.ok(info.size < 3 * 1024 * 1024, href);
  }
  assert.match(pricing, /target="_blank" rel="noopener noreferrer">See example</);
  assert.match(html, /target="_blank" rel="noopener noreferrer">See example</);
  assert.match(faq, /target="_blank" rel="noopener noreferrer">See example</);
});
