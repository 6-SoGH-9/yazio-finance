/* Run with:  node tests/verify.js
   Checks the data in data/years.js after you add a year: the model must tie to the filed statements.
   Exits with code 1 if any check fails. */
const fs = require("fs"), path = require("path");
global.window = {};
const root = path.join(__dirname, "..");
new Function("window", fs.readFileSync(path.join(root, "data/years.js"), "utf8"))(global.window);
const calc = require(path.join(root, "js/calc.js"));
const Y = calc.load(global.window.YAZIO_DATA).years;
const checks = [["Net income: model vs reported", "chk_ni"], ["Total assets: model vs reported", "chk_ta"], ["Assets = equity + liabilities", "chk_bs"],
  ["Equity roll-forward (prior + net income - dividends)", "chk_equity"], ["Operating cash flow: direct vs indirect route", "chk_ocf"]];
let bad = 0;
console.log("Years loaded: " + Y.map(c => c.fy).join(", "));
checks.forEach(([label, key]) => {
  const worst = Math.max(...Y.map(c => Math.abs(c[key])));
  const ok = worst < 1;
  if (!ok) { bad++; Y.forEach(c => { if (Math.abs(c[key]) >= 1) console.log("   " + c.fy + ": " + c[key].toFixed(2)); }); }
  console.log((ok ? "OK    " : "CHECK ") + label + " (largest difference EUR " + worst.toFixed(2) + ")");
});
process.exit(bad ? 1 : 0);
