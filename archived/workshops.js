// Archived SI brand workshops. Not loaded by the public site.
// Taken off the live site on 2026-11-27 at Mr G's request, to bring back later.
//
// To restore:
// 1. Copy the workshops array below into window.SHOPNASGFX_OFFERS.workshops in /offers.js
// 2. Paste archived/workshop-section.html into the home page #services offer-groups
// 3. Add the "SI Brand Workshop" option back to the home service select and to SERVICES in brand-intake.mjs
// 4. The existing brand-home.js fill("offers-workshop", ...) will render the list again if #offers-workshop is in the page

window.SHOPNASGFX_ARCHIVED_WORKSHOPS = {
  hiddenOn: "2026-11-27",
  workshopNote: "",
  serviceType: "SI Brand Workshop",
  workshops: [
    { id: "seat", name: "SI Brand Workshop seat", price: "$97 ($79 early)", turnaround: "Live group session", for: "Owners and solo founders", deliverables: ["Use SI without losing your identity", "Prompt templates to keep"] },
    { id: "series", name: "4 session series", price: "$297", turnaround: "4 weeks", for: "Done-with-you setup", deliverables: ["Build your own brand prompt kit", "Weekly review"] },
    { id: "half", name: "Private half day", price: "$1,800", turnaround: "Scheduled", for: "Your team", deliverables: ["On-brand SI workflow for your team"] },
    { id: "full", name: "Private full day", price: "$3,200", turnaround: "Scheduled", for: "Your team", deliverables: ["Strategy, prompts, and workflow build"] }
  ]
};
