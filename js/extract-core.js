/* extract-core.js: reads the balance sheet and income statement lines of a German HGB annual report (text rows) and
   returns them in the shape of data/years.js. Used by extract.html (browser) and tests/extract-test.js (node).
   Input: rows = [{label: "1. Rohergebnis", nums: [{v: 123.45, pos: 812}, ...]}, ...] in reading order.
   Nothing here is specific to one year: lines are found by their label, signs are solved against the printed subtotals. */
(function (root) {
  "use strict";
  var NUMRE = "-?\\d{1,3}(?:\\.\\d{3})*,\\d{2}";
  function parseNum(s) {
    s = String(s).trim(); var neg = /^-/.test(s) || /-$/.test(s);
    var v = parseFloat(s.replace(/[-\s]/g, "").replace(/\./g, "").replace(",", "."));
    return neg ? -Math.abs(v) : v;
  }
  /* text line (pdftotext style) -> row. Only numbers at the END of the line count as amounts. */
  function rowFromText(line) {
    var nums = [], rest = line.replace(/\s+$/, ""), re = new RegExp("(?:^|\\s)(" + NUMRE + ")$"), m;
    while ((m = re.exec(rest))) { nums.unshift({ v: parseNum(m[1]), pos: rest.length }); rest = rest.slice(0, rest.length - m[1].length).replace(/\s+$/, ""); }
    return { label: rest.trim(), nums: nums };
  }
  function isNumToken(s) { return new RegExp("^" + NUMRE + "$").test(s.trim()); }

  function median(a) { a = a.slice().sort(function (x, y) { return x - y; }); return a.length ? a[Math.floor(a.length / 2)] : null; }

  /* assign each row's amounts to [current, prior] using the printed column positions */
  function assignColumns(rows) {
    var p0 = [], p1 = [];
    rows.forEach(function (r) { if (r.nums.length >= 2) { p0.push(r.nums[r.nums.length - 2].pos); p1.push(r.nums[r.nums.length - 1].pos); } });
    var c0 = median(p0), c1 = median(p1);
    rows.forEach(function (r) {
      var n = r.nums, cols = [null, null];
      if (n.length >= 2) { cols[0] = n[n.length - 2].v; cols[1] = n[n.length - 1].v; }
      else if (n.length === 1) {
        if (c0 == null || c1 == null) cols[0] = n[0].v;
        else if (Math.abs(n[0].pos - c0) <= Math.abs(n[0].pos - c1)) cols[0] = n[0].v; else cols[1] = n[0].v;
      }
      r.cols = cols;
    });
    return rows;
  }

  function findFY(rows, from) {
    for (var i = Math.max(0, from - 12); i < Math.min(rows.length, from + 6); i++) {
      var m = /31\.\s?12\.\s?(20\d\d)/.exec(rows[i].label); if (m) return +m[1];
    }
    for (var j = 0; j < rows.length; j++) { var k = /31\.\s?12\.\s?(20\d\d)/.exec(rows[j].label); if (k) return +k[1]; }
    return null;
  }

  /* ---------- balance sheet ---------- */
  function parseBalance(rows) {
    var start = -1, i;
    for (i = 0; i < rows.length; i++) if (/^A\.\s*Anlageverm/i.test(rows[i].label)) { start = i; break; }
    if (start < 0) return null;
    var bound = Math.min(rows.length, start + 150);
    for (i = start + 1; i < bound; i++) if (/^\d+\.\s*Rohergebnis/i.test(rows[i].label)) { bound = i; break; }
    assignColumns(rows.slice(start, bound));
    var side = "A", L = null, R = null, sec = {}, endIdx = rows.length - 1, totalA = null, totalP = null, order = [];
    for (i = start; i < rows.length; i++) {
      var r = rows[i], lab = r.label, m;
      if (i > start && /^\d+\.\s*Rohergebnis/i.test(lab)) { endIdx = i - 1; break; }
      if ((m = /^([A-E])\.\s+(.*)$/.exec(lab))) {
        L = m[1]; R = null;
        if (L === "A" && /Eigenkapital/i.test(m[2])) side = "P";
        var s = { name: m[2], cols: r.cols, romans: [], kids: [] }; sec[side + L] = s; order.push(side + L);
        if (side === "P" && L === "D") { endIdx = i; if (rows[i + 1] && !rows[i + 1].label && rows[i + 1].nums.length) endIdx = i + 1; break; }
        continue;
      }
      if (/(^|\s)(Summe\s+)?Aktiva$/i.test(lab) && r.nums.length) { totalA = r.cols; continue; }
      if (/(^|\s)(Summe\s+)?Passiva$/i.test(lab) && r.nums.length) { totalP = r.cols; continue; }
      if ((m = /^(IV|III|II|I)\.\s+(.*)$/.exec(lab)) && L) {
        R = m[1]; var rm = { key: R, name: m[2], cols: r.cols, kids: [] }; sec[side + L].romans.push(rm); continue;
      }
      if (side === "A" && L === "B" && /^davon mit einer Restlaufzeit von mehr als einem Jahr/i.test(lab) && r.nums.length) { sec.longterm = r.cols; continue; }
      if (lab && r.nums.length && !/^(davon|-|–)/i.test(lab) && L) {
        var tgt = R ? sec[side + L].romans[sec[side + L].romans.length - 1] : sec[side + L];
        tgt.kids.push(r.cols);
      }
    }
    function sumCols(list) { return [0, 1].map(function (c) { var t = 0, any = false; list.forEach(function (x) { if (x[c] != null) { t += x[c]; any = true; } }); return any ? t : null; }); }
    function valRoman(rm) { return [0, 1].map(function (c) { return rm.cols[c] != null ? rm.cols[c] : (sumCols(rm.kids)[c]); }); }
    function val(s) {
      if (!s) return [null, null];
      if (s.cols[0] != null || s.cols[1] != null) return s.cols.map(function (x) { return x; });
      if (s.romans.length) return sumCols(s.romans.map(valRoman));
      return sumCols(s.kids);
    }
    function roman(key, k) { var s = sec[key]; if (!s) return [null, null]; for (var q = 0; q < s.romans.length; q++) if (s.romans[q].key === k) return valRoman(s.romans[q]); return [null, null]; }
    var fehl = sec.AE ? val(sec.AE) : [0, 0];
    var out = [0, 1].map(function (c) {
      var g = function (a) { return (a && a[c] != null) ? a[c] : 0; };
      var assetsComputed = g(val(sec.AA)) + g(val(sec.AB)) + g(val(sec.AC)) + g(val(sec.AD)) + g(val(sec.AE));
      var passComputed = g(val(sec.PA)) + g(val(sec.PB)) + g(val(sec.PC)) + g(val(sec.PD));
      var b = {
        intangible: g(roman("AA", "I")), tangible: g(roman("AA", "II")), financial_assets: g(roman("AA", "III")),
        loan_in_financial_assets: 0,
        receivables: g(roman("AB", "I")), loan_in_receivables: 0, cash: g(roman("AB", "II")),
        prepaid: g(val(sec.AC)), deferred_tax_assets: g(val(sec.AD)),
        total_assets: totalA && totalA[c] != null ? totalA[c] : assetsComputed - g(val(sec.AE)),
        equity: g(val(sec.PA)) - g(fehl), provisions: g(val(sec.PB)), liabilities: g(val(sec.PC)), deferred_income: g(val(sec.PD)),
        total_equity_liabilities: totalP && totalP[c] != null ? totalP[c] : passComputed
      };
      var fl = (function () { var a = g(val(sec.AA)), b2 = g(val(sec.AB)); return { fixed: a, current: b2 }; })();
      b._receivables_longterm = sec.longterm ? sec.longterm[c] : null;
      b._sections_found = order.join(",");
      b._assets_computed = assetsComputed - g(val(sec.AE));
      return b;
    });
    return { cur: out[0], prior: out[1], endIdx: endIdx, startIdx: start };
  }

  /* ---------- income statement ---------- */
  function parseIncome(rows) {
    var start = -1, i;
    for (i = 0; i < rows.length; i++) if (/^\d+\.\s*Rohergebnis/i.test(rows[i].label) && rows[i].nums.length) { start = i; break; }
    if (start < 0) return null;
    var end = rows.length - 1;
    for (i = start; i < rows.length; i++) if (/^\d+\.\s*Bilanzgewinn/i.test(rows[i].label)) { end = i; break; }
    if (end === rows.length - 1) for (i = start; i < rows.length; i++) if (/^\d+\.\s*Jahres(überschuss|fehlbetrag)/i.test(rows[i].label) && rows[i].nums.length) { end = Math.min(rows.length - 1, i + 4); break; }
    var reg = assignColumns(rows.slice(start, end + 1));
    function find(re, needNums) { for (var q = 0; q < reg.length; q++) if (re.test(reg[q].label) && (!needNums || reg[q].nums.length)) return reg[q]; return null; }
    var R = {
      gp: find(/Rohergebnis/i, 1), lohn: find(/L(ö|o)hne und Geh(ä|a)lter/i, 1), soz: find(/^(b\)\s*)?soziale Abgaben/i, 1),
      pers: find(/^\d+\.\s*Personalaufwand/i, 1),
      dep: find(/^\d+\.\s*Abschreibungen/i, 1) || find(/auf immaterielle Verm(ö|o)gensgegenst(ä|a)nde.*Sachanlagen/i, 1),
      opex: find(/^\d+\.\s*sonstige betriebliche Aufwendungen/i, 1),
      sec: find(/^\d+\.\s*Ertr(ä|a)ge aus/i, 1), intinc: find(/^\d+\.\s*sonstige Zinsen und (ä|a)hnliche Ertr/i, 1),
      intexp: find(/^\d+\.\s*Zinsen und (ä|a)hnliche Aufwendungen/i, 1), tax: find(/^\d+\.\s*Steuern vom Einkommen/i, 1),
      ens: find(/Ergebnis nach Steuern/i, 1), otax: find(/^\d+\.\s*sonstige Steuern/i, 1), ni: find(/^\d+\.\s*Jahres(ü|u)berschuss|^\d+\.\s*Jahresfehlbetrag/i, 1),
      div: find(/Aussch(ü|u)ttung/i, 1)
    };
    if (!R.gp || !R.ni) return null;
    var res = [0, 1].map(function (c) {
      var g = function (x) { return x && x.cols[c] != null ? x.cols[c] : 0; };
      var mag = function (x) { return Math.abs(g(x)); };
      var pers = R.lohn || R.soz ? mag(R.lohn) + mag(R.soz) : mag(R.pers);
      var fixed = g(R.gp) - pers - mag(R.dep) - mag(R.opex) + mag(R.sec) + mag(R.intinc);
      var ensP = R.ens && R.ens.cols[c] != null ? R.ens.cols[c] : null, niP = g(R.ni);
      var sIE = -1, sTX = -1, solved = false, note = "";
      var combos = [[-1, -1], [1, -1], [-1, 1], [1, 1]];
      if (ensP != null) {
        for (var k = 0; k < combos.length; k++) { var t = fixed + combos[k][0] * mag(R.intexp) + combos[k][1] * mag(R.tax); if (Math.abs(t - ensP) < 0.015) { sIE = combos[k][0]; sTX = combos[k][1]; solved = true; break; } }
        if (!solved) note = "Signs of interest/tax lines do not tie to 'Ergebnis nach Steuern'";
      } else solved = true;
      var base = fixed + sIE * mag(R.intexp) + sTX * mag(R.tax), sOT = -1, solved2 = false;
      var ensVal = ensP != null ? ensP : base;
      if (Math.abs(ensVal + 0 - niP) < 0.015) { sOT = -1; solved2 = true; }
      else if (Math.abs(ensVal + mag(R.otax) - niP) < 0.015) { sOT = 1; solved2 = true; }
      else if (Math.abs(ensVal - mag(R.otax) - niP) < 0.015) { sOT = -1; solved2 = true; }
      if (!solved2) note += (note ? "; " : "") + "Net income does not tie to 'Ergebnis nach Steuern' + other taxes";
      var inc = {
        gross_profit: g(R.gp), personnel: -pers, depreciation: -mag(R.dep), other_opex: -mag(R.opex),
        income_securities: mag(R.sec), other_interest_income: mag(R.intinc), interest_expense: sIE * mag(R.intexp),
        income_tax: sTX * mag(R.tax), other_taxes: sOT * mag(R.otax), net_income: niP
      };
      var calc = inc.gross_profit + inc.personnel + inc.depreciation + inc.other_opex + inc.income_securities + inc.other_interest_income +
        inc.interest_expense + inc.income_tax + inc.other_taxes;
      return { income: inc, ni_diff: calc - niP, note: note, dividends_printed: R.div ? Math.abs(g(R.div)) : null };
    });
    return { cur: res[0], prior: res[1] };
  }

  /* ---------- text hints (headcount, bookings, fees) ---------- */
  function textHints(text) {
    var h = {}, m, t = text.replace(/\s+/g, " ");
    if ((m = /Gesamtzahl der durchschnittlich besch(ä|a)ftigten Arbeitnehmer betr(ä|a)gt damit\s+(\d+)(?:,\d+)?/i.exec(t))) h.headcount = +m[3];
    if ((m = /durchschnittliche[^.]{0,80}?betrug im abgelaufenen Gesch(ä|a)ftsjahr\s+(\d+)\s*\(Vorjahr:\s*(\d+)\)/i.exec(t))) { h.headcount = h.headcount || +m[2]; h.headcount_prior = +m[3]; }
    if ((m = /(\d+)\s*\(Vorjahr:\s*(\d+)\)\s*und lag damit/i.exec(t)) && !h.headcount_prior) { h.headcount_prior = +m[2]; if (!h.headcount) h.headcount = +m[1]; }
    if ((m = /Bruttoverk(ä|a)ufe[^.]{0,200}?(?:um\s+)?(?:ca\.|etwa)?\s*(\d+)\s*%\s*auf\s*EUR\s*(\d+),(\d)\s*m/i.exec(t))) { h.bookings_growth_pct = +m[2]; h.bookings = Math.round(+(m[3] + "." + m[4]) * 1e6); }
    if ((m = /Transaktionskosten[^.]{0,160}?von EUR\s*(\d+),(\d)\s*m\s*auf\s*EUR\s*(\d+),(\d)\s*m/i.exec(t))) { h.fees_prior = Math.round(+(m[1] + "." + m[2]) * 1e6); h.fees = Math.round(+(m[3] + "." + m[4]) * 1e6); }
    if (!h.fees_prior && (m = /Umgliederung der Transaktionsgeb(ü|u)hren[^.]{0,80}?in H(ö|o)he von EUR\s*(\d+),(\d)\s*m/i.exec(t))) h.fees_prior = Math.round(+(m[3] + "." + m[4]) * 1e6);
    if ((m = /Aussch(ü|u)ttungen? an die Gesellschafterin in H(ö|o)he von EUR\s*([\d.]+),\d\d/i.exec(t))) h.dividends = parseNum(m[3] + ",00");
    return h;
  }

  /* ---------- one PDF -> everything we can read ---------- */
  function parseDocument(rows, fullText) {
    var bal = parseBalance(rows);
    if (!bal) return { error: "No balance sheet found (no line starting 'A. Anlagevermögen')." };
    var pl = parseIncome(rows);
    var fy = findFY(rows, bal.startIdx);
    return { fy: fy, balance: bal, income: pl, hints: textHints(fullText || rows.map(function (r) { return r.label; }).join(" ")) };
  }

  /* ---------- build a years.js entry ---------- */
  function round2(x) { return Math.round(x * 100) / 100; }
  function cleanObj(o) { var r = {}; Object.keys(o).forEach(function (k) { if (k.charAt(0) !== "_") r[k] = typeof o[k] === "number" ? round2(o[k]) : o[k]; }); return r; }

  /* sources: {own: parseDocument result for that fy, next: result of fy+1 (its prior column)} */
  function buildEntry(fy, own, next, prevEntry, opts) {
    opts = opts || {}; var w = [], src = {};
    var b, inc;
    if (own && own.fy === fy) { b = own.balance.cur; src.balance = "FY" + fy + " report"; }
    else if (next && next.fy === fy + 1) { b = next.balance.prior; src.balance = "prior-year column of FY" + (fy + 1) + " report"; w.push("Balance sheet taken from the comparative column of the FY" + (fy + 1) + " report."); }
    if (own && own.fy === fy && own.income) { inc = own.income.cur.income; src.income = "FY" + fy + " report"; if (own.income.cur.note) w.push(own.income.cur.note); }
    else if (next && next.fy === fy + 1 && next.income) { inc = next.income.prior.income; src.income = "prior-year column of FY" + (fy + 1) + " report"; w.push("Income statement taken from the comparative column of the FY" + (fy + 1) + " report (this year's own report has no income statement, or it is not loaded).");
      if (next.income.prior.note) w.push(next.income.prior.note); }
    if (!b) return { error: "No balance sheet for FY" + fy + ". Load the FY" + fy + " report (or the FY" + (fy + 1) + " report for its comparative column)." };
    if (!inc) w.push("No income statement for FY" + fy + ". Load the FY" + (fy + 1) + " report as well: its prior-year column holds it.");
    var balance = cleanObj(b);
    var pe = prevEntry || null;
    /* loan to the managing directors: carried from last year, user must confirm */
    if (pe) {
      var loanTotal = (pe.balance.loan_in_receivables || 0) + (pe.balance.loan_in_financial_assets || 0), lt = b._receivables_longterm;
      if (lt != null && loanTotal) { balance.loan_in_receivables = lt >= loanTotal ? loanTotal : 0; balance.loan_in_financial_assets = loanTotal - balance.loan_in_receivables; }
      else { balance.loan_in_receivables = pe.balance.loan_in_receivables || 0; balance.loan_in_financial_assets = pe.balance.loan_in_financial_assets || 0; }
    }
    if (balance.loan_in_receivables || balance.loan_in_financial_assets) w.push("Loan to the managing directors: carried over from the previous year (receivables / financial assets split). Check the note 'sonstige Ausleihungen / Forderungen gegen Geschäftsführer'.");
    /* dividends from equity roll-forward */
    var h = own && own.fy === fy ? own.hints : {};
    var priorEq = own && own.fy === fy ? own.balance.prior.equity : (pe ? pe.balance.equity : null);
    var div = 0;
    if (inc && priorEq != null) { div = round2(priorEq + inc.net_income - b.equity); if (Math.abs(div) < 1) div = 0; }
    var e = { fy: fy };
    if (inc) e.income = cleanObj(inc);
    e.balance = balance;
    var nh = next && next.fy === fy + 1 ? next.hints : {};
    if (h.headcount == null && nh.headcount_prior != null) h.headcount = nh.headcount_prior;
    if (h.fees == null && nh.fees_prior != null) { h.fees = nh.fees_prior; h._feesFromNext = true; }
    e.headcount = h.headcount != null ? h.headcount : null;
    if (h.headcount == null) w.push("Headcount not found in the text. Type it in (Anhang: 'durchschnittlich beschäftigte Arbeitnehmer').");
    e.flows = { dividends_paid: div, loan_paid_out: 0 };
    if (div) w.push("Dividend EUR " + div.toLocaleString("en") + " derived from the equity roll-forward (prior equity + net income - equity).");
    e.fees = { amount: h.fees != null ? h.fees : null, in_gross_profit: fy <= 2021, estimate: false, source: h.fees != null ? "FY" + (h._feesFromNext ? fy + 1 : fy) + " management report (rounded)" : "" };
    if (h.fees == null) w.push("App-store fees not found in the text. Type the amount from the management report (other opex note), or leave empty.");
    e.mgmt = {};
    if (h.bookings != null) { e.mgmt.bookings = h.bookings; e.mgmt.bookings_reliable = true; e.mgmt.bookings_growth_printed_pct = h.bookings_growth_pct; }
    else w.push("Bookings (Bruttoverkäufe) not found in the text. Type them in if the report gives them.");
    e.outlook = { report: "FY" + fy + " report" };
    return { entry: e, warnings: w, sources: src };
  }

  /* compare two year entries field by field (used for restatements and for tests) */
  function diffEntries(a, b, tol) {
    tol = tol == null ? 0.5 : tol; var out = [];
    ["income", "balance"].forEach(function (g) {
      if (!a[g] || !b[g]) return;
      Object.keys(a[g]).forEach(function (k) { var x = a[g][k], y = b[g][k]; if (typeof x === "number" && typeof y === "number" && Math.abs(x - y) > tol) out.push({ group: g, key: k, a: x, b: y, d: x - y }); });
    });
    return out;
  }

  var api = { parseNum: parseNum, rowFromText: rowFromText, isNumToken: isNumToken, assignColumns: assignColumns, parseBalance: parseBalance,
    parseIncome: parseIncome, parseDocument: parseDocument, buildEntry: buildEntry, diffEntries: diffEntries, textHints: textHints, NUMRE: NUMRE };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.YAZIO_EXTRACT = api;
})(typeof window !== "undefined" ? window : this);
