export const PHONE = "+12674730397";
export const PHONE_DISPLAY = "267 473 0397";
export const SERVICES = ["Brand Spark", "Brand System", "Brand Foundation Pro", "Brand Refresh", "Brand on Retainer", "SI Brand Workshop", "Not sure yet"];
export const BUDGETS = ["Under $1,500", "$1,500 to $3,500", "$3,500 to $6,500", "$6,500+", "Monthly retainer"];
export const DELIVERY = ["ASAP", "A few weeks", "1 to 2 months", "Not sure"];
export const AGREEMENT = "I understand that by submitting this form or texting, a 25% deposit is required on all projects discussed before any work begins.";
export const DEPOSIT_ERROR = "Please check the deposit agreement box before sending your details.";

export function validateDetails(d) {
  const e = {};
  for (const [k, label, max] of [["firstName", "first name", 60], ["lastName", "last name", 60], ["details", "project details", 500]]) {
    const v = String(d[k] || "").trim();
    if (!v) e[k] = `Enter your ${label}.`;
    else if (String(d[k]).length > max) e[k] = `Keep ${label} to ${max} characters or fewer.`;
  }
  if (!SERVICES.includes(d.serviceType)) e.serviceType = "Select the service you need.";
  if (!BUDGETS.includes(d.budget)) e.budget = "Select one of the listed budgets.";
  if (!DELIVERY.includes(d.delivery)) e.delivery = "Select a timeframe.";
  if (d.depositAgreement !== "agreed") e.depositAgreement = DEPOSIT_ERROR;
  return e;
}

export function buildMessage(d) {
  if (Object.keys(validateDetails(d)).length) throw new Error("Complete the project details before preparing a text.");
  const name = `${d.firstName.trim()} ${d.lastName.trim()}`.replace(/[\r\n]+/g, " ");
  return `Hi Nasirr, I'd like to discuss a brand project.\n\nName: ${name}\nService: ${d.serviceType}\nProject details: ${d.details.trim()}\nBudget: ${d.budget}\nTimeframe: ${d.delivery}\nDeposit agreement: Agreed. ${AGREEMENT}\n\nSent from shopnasgfx.com`;
}

export const buildSmsHref = m => `sms:${PHONE}?&body=${encodeURIComponent(m)}`;

export function initIntake(form) {
  if (!form || form.dataset.intakeReady === "true") return;
  form.dataset.intakeReady = "true";
  const status = form.querySelector("#brand-intake-status");
  const manual = form.querySelector("#brand-intake-manual");
  const preview = form.querySelector("#brand-intake-message");
  const depositError = form.querySelector("#brand-deposit-error");
  const deposit = form.elements.namedItem("depositAgreement");
  const fields = ["firstName", "lastName", "serviceType", "details", "budget", "delivery", "depositAgreement"];
  deposit.addEventListener("invalid", () => { depositError.hidden = false; });

  const prepare = () => {
    const d = Object.fromEntries(new FormData(form));
    const errors = validateDetails(d);
    for (const n of fields) {
      const f = form.elements.namedItem(n);
      f.setCustomValidity(errors[n] || "");
      if (errors[n]) f.setAttribute("aria-invalid", "true"); else f.removeAttribute("aria-invalid");
    }
    depositError.hidden = !errors.depositAgreement;
    if (!form.reportValidity()) return null;
    return buildMessage(d);
  };
  form.addEventListener("input", e => { e.target.setCustomValidity?.(""); if (e.target.name === "depositAgreement" && e.target.checked) depositError.hidden = true; status.textContent = ""; });
  form.addEventListener("submit", e => {
    e.preventDefault();
    const m = prepare(); if (!m) return;
    window.location.href = buildSmsHref(m);
    status.textContent = `Your text is ready. Tap send in your messaging app. If it did not open, use Copy details instead.`;
  });
  form.querySelector("#brand-intake-copy").addEventListener("click", async () => {
    const m = prepare(); if (!m) return;
    try { await navigator.clipboard.writeText(m); status.textContent = `Details copied. Paste them into a text to ${PHONE_DISPLAY}, then tap send.`; }
    catch { preview.value = m; manual.hidden = false; preview.focus(); preview.select(); status.textContent = `Copy the message below, then text it to ${PHONE_DISPLAY}.`; }
  });
}

if (typeof document !== "undefined") initIntake(document.getElementById("brand-intake-form"));
