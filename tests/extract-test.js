/* Run with:  node tests/extract-test.js <folder with fsYYYY.txt files from "pdftotext -layout">
   Parses each report and compares the result with data/years.js. */
const fs = require("fs"), path = require("path");
global.window = {};
const root = path.join(__dirname, "..");
new Function("window", fs.readFileSync(path.join(root, "data/years.js"), "utf8"))(global.window);
const X = require(path.join(root, "js/extract-core.js"));
const dir = process.argv[2]; if (!dir) { console.log("usage: node tests/extract-test.js <folder>"); process.exit(2); }
const docs = {};
for (const y of [2020, 2021, 2022, 2023, 2024]) {
  const f = path.join(dir, "fs" + y + ".txt"); if (!fs.existsSync(f)) continue;
  const txt = fs.readFileSync(f, "utf8");
  docs[y] = X.parseDocument(txt.split("\n").map(X.rowFromText), txt);
  console.log("FY" + y + " report: detected FY " + docs[y].fy + (docs[y].income ? "" : " (no income statement)"));
}
let bad = 0;
for (const e of window.YAZIO_DATA.years) {
  const r = X.buildEntry(e.fy, docs[e.fy], docs[e.fy + 1], window.YAZIO_DATA.years.find(z => z.fy === e.fy - 1));
  if (r.error) { console.log(e.fy, r.error); bad++; continue; }
  const d = X.diffEntries(r.entry, e, 0.005);
  const extra = [];
  if (r.entry.headcount !== e.headcount) extra.push("headcount " + r.entry.headcount + " vs " + e.headcount);
  if (r.entry.flows.dividends_paid !== e.flows.dividends_paid) extra.push("dividends " + r.entry.flows.dividends_paid + " vs " + e.flows.dividends_paid);
  if (r.entry.fees.amount !== e.fees.amount) extra.push("fees " + r.entry.fees.amount + " vs " + e.fees.amount);
  const mb = r.entry.mgmt.bookings, eb = e.mgmt.bookings; if (mb != null || eb != null) { if (mb !== eb) extra.push("bookings " + mb + " vs " + eb); }
  console.log("FY" + e.fy + " from " + r.sources.balance + " / " + (r.sources.income || "-") + ": " + (d.length || extra.length ? "DIFF" : "identical"));
  d.forEach(x => console.log("    " + x.group + "." + x.key + ": extracted " + x.a + " vs data " + x.b));
  extra.forEach(x => console.log("    " + x));
  if (d.length) bad++;
}
process.exit(bad ? 1 : 0);
