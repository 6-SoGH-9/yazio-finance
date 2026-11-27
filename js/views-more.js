/* views-more.js: the "Overview" and "Ratio evolution" tabs of the cockpit.
   Loaded before the main script; uses the cockpit's helpers (h, s, plot, chartCard, kpi, showTip, ...) and the loaded years (Y, LD) when a tab is drawn.
   Everything is computed from the same year objects as the other tabs. Nothing is typed in. */
(function () {
  "use strict";
  var COL = ["var(--s1)", "var(--s2)", "var(--s3)", "var(--s4)"];
  var m2 = function (x) { return x == null ? "n/a" : (x < 0 ? "−" : "") + (Math.abs(x) / 1e6).toFixed(2); };
  var e2 = function (x) { return x == null ? "n/a" : (x < 0 ? "−" : "") + "€" + (Math.abs(x) / 1e6).toFixed(2) + "M"; };
  var e1 = function (x) { return x == null ? "n/a" : (x < 0 ? "−" : "") + "€" + (Math.abs(x) / 1e6).toFixed(1) + "M"; };
  var VX = { ovY: null, unit: "eur", stmt: "inc", amt: ["gp", "ebit", "ni", "cash"], ppl: ["head", "gph", "pph", "eph"] };

  function seg(items, cur, onc, label) {
    return h("div", { style: "display:flex;flex-wrap:wrap;gap:6px", role: "group", "aria-label": label || "" }, items.map(function (it) {
      var b = h("button", { class: "chip", "aria-pressed": String(it[0] === cur) }, it[1]);
      b.onclick = function () { onc(it[0]); }; return b;
    }));
  }
  function legend(items) {
    return h("div", { class: "legend" }, items.map(function (x) { return h("span", {}, h("i", { style: "background:" + x[1] }), x[0]); }));
  }
  function pctChange(cur, pri) { return pri == null || pri <= 0 || cur == null ? null : cur / pri - 1; }
  function deltaTxt(cur, pri, label, count) {
    if (pri == null) return h("span", {}, label);
    var d = cur - pri, p = pctChange(cur, pri), cls = d === 0 ? "" : d > 0 ? "up" : "down";
    var t = p == null ? (count ? (d >= 0 ? "+" : "−") + Math.abs(Math.round(d)) : (d >= 0 ? "+" : "−") + e1(Math.abs(d)).replace("−", "")) : (d >= 0 ? "▲ " : "▼ ") + Math.abs(p * 100).toFixed(1) + "%";
    return h("span", { class: cls }, t + " vs " + label);
  }

  /* horizontal waterfall: items {n, v, t (total)} */
  function waterfall(items) {
    var nar = innerWidth < 640, W = Math.min(620, Math.max(300, innerWidth - 64)), rowH = 28, lw = nar ? 132 : 150, mr = nar ? 56 : 62, H = items.length * rowH + 8, cum = 0, bars = [];
    items.forEach(function (it) {
      var a, b;
      if (it.t) { a = 0; b = it.v; cum = it.v; } else { a = cum; b = cum + it.v; cum = b; }
      bars.push({ n: it.n, v: it.v, a: a, b: b, t: !!it.t });
    });
    var lo = Math.min.apply(null, [0].concat(bars.map(function (x) { return Math.min(x.a, x.b); })));
    var hi = Math.max.apply(null, [0].concat(bars.map(function (x) { return Math.max(x.a, x.b); })));
    if (hi === lo) hi = lo + 1;
    var X = function (v) { return lw + (W - lw - mr) * (v - lo) / (hi - lo); };
    var svg = s("svg", { viewBox: "0 0 " + W + " " + H, width: "100%", role: "img", "aria-label": "waterfall" });
    svg.append(s("line", { x1: X(0), x2: X(0), y1: 0, y2: H, stroke: "var(--axis)" }));
    bars.forEach(function (x, i) {
      var y = 4 + i * rowH, x0 = X(Math.min(x.a, x.b)), w = Math.max(2, Math.abs(X(x.b) - X(x.a)));
      var col = x.t ? "var(--s1)" : x.v >= 0 ? "var(--s3)" : "var(--crit)";
      svg.append(s("text", { x: lw - 8, y: y + 17, "text-anchor": "end", "font-weight": x.t ? 650 : 400 }, x.n));
      var r = s("rect", { x: x0, y: y + 3, width: w, height: rowH - 10, rx: 3, fill: col, tabindex: 0, "aria-label": x.n + " " + e2(x.v) });
      var on = function (ev) { var bb = r.getBoundingClientRect(); showTip(ev.clientX ? ev : { clientX: bb.left, clientY: bb.top }, x.n, [{ c: col, n: x.t ? "Total" : "Effect", v: e2(x.v) }]); };
      r.addEventListener("pointermove", on); r.addEventListener("focus", on); r.addEventListener("pointerleave", hideTip); r.addEventListener("blur", hideTip);
      svg.append(r);
      var right = X(Math.max(x.a, x.b)) + 6;
      svg.append(s("text", { class: "lbl", x: right, y: y + 17 }, (x.v >= 0 && !x.t ? "+" : "") + e2(x.v)));
    });
    return h("div", {}, svg);
  }

  function card(title, sub, body) { return h("div", { class: "card" }, h("h2", {}, title), sub ? h("p", { class: "sub" }, sub) : null, body); }

  /* ---------------- Overview ---------------- */
  function viewOverview() {
    var root = h("div", {}), j = Y.map(function (c) { return c.fy; }).indexOf(VX.ovY);
    if (j < 0) { j = N - 1; VX.ovY = FY[j]; }
    var c = Y[j], p = j > 0 ? Y[j - 1] : null, open = LD.data.opening.balance, priDI = p ? p.di : open.deferred_income;

    root.append(h("div", { class: "filters", style: "margin:0 0 12px" }, h("span", { class: "small" }, "Fiscal year"), seg(Y.map(function (x) { return [x.fy, x.label]; }), VX.ovY, function (v) { VX.ovY = v; render(); }, "Fiscal year")));

    var lab = p ? p.label : "";
    root.append(h("div", { class: "grid", style: "grid-template-columns:repeat(auto-fit,minmax(170px,1fr))" },
      kpi("Gross profit", e2(c.gp), p ? deltaTxt(c.gp, p.gp, lab) : c.label),
      kpi("EBIT", e2(c.ebit), p ? deltaTxt(c.ebit, p.ebit, lab) : c.label),
      kpi("Net income", e2(c.ni), p ? deltaTxt(c.ni, p.ni, lab) : c.label),
      kpi("Operating cash flow", e2(c.ocf), p ? deltaTxt(c.ocf, p.ocf, lab) : c.label),
      kpi("Cash at 31 Dec", e2(c.cash), p ? deltaTxt(c.cash, p.cash, lab) : c.label),
      kpi("Average employees", String(Math.round(c.head)), p ? deltaTxt(c.head, p.head, lab, true) : c.label)));

    var cats = Y.map(function (x) { return x.short; });
    root.append(h("div", { class: "grid", style: "grid-template-columns:repeat(auto-fit,minmax(min(440px,100%),1fr));margin-top:14px" },
      chartCard("Gross profit and cash", "€m, cash at 31 December", { cats: cats, series: [{ name: "Gross profit", color: COL[0], values: Y.map(function (x) { return x.gp / 1e6; }) }, { name: "Cash", color: COL[1], values: Y.map(function (x) { return x.cash / 1e6; }) }], fmt: function (v) { return "€" + v.toFixed(1) + "M"; }, axis: function (v) { return v.toFixed(0); } }),
      chartCard("Net income and operating cash flow", "€m, operating cash flow derived from balance sheet movements", { cats: cats, series: [{ name: "Net income", color: COL[0], values: Y.map(function (x) { return x.ni / 1e6; }) }, { name: "Operating cash flow", color: COL[1], values: Y.map(function (x) { return x.ocf / 1e6; }) }], fmt: function (v) { return "€" + v.toFixed(1) + "M"; }, axis: function (v) { return v.toFixed(0); } })));

    root.append(h("div", { class: "grid", style: "grid-template-columns:repeat(auto-fit,minmax(min(440px,100%),1fr));margin-top:14px" },
      chartCard("Liquidity vs deferred income", "€m. Cash plus securities against what customers prepaid.", { cats: cats, series: [{ name: "Cash + securities", color: COL[0], values: Y.map(function (x) { return (x.cash + x.sec) / 1e6; }) }, { name: "Deferred income", color: COL[1], values: Y.map(function (x) { return x.di / 1e6; }) }], fmt: function (v) { return "€" + v.toFixed(1) + "M"; }, axis: function (v) { return v.toFixed(0); } }),
      chartCard("Net income vs dividends paid", "€m. Dividends from the equity roll-forward.", { cats: cats, series: [{ name: "Net income", color: COL[0], values: Y.map(function (x) { return x.ni / 1e6; }) }, { name: "Paid in year", color: COL[2], values: Y.map(function (x) { return x.dividends / 1e6; }) }], fmt: function (v) { return "€" + v.toFixed(2) + "M"; }, axis: function (v) { return v.toFixed(1); } })));

    var owc = c.ocf - c.ni + c.dep - (c.di - priDI);   // dep is negative in the data
    root.append(h("div", { class: "grid", style: "grid-template-columns:repeat(auto-fit,minmax(min(440px,100%),1fr));margin-top:14px" },
      card("From gross profit to net income, " + c.label, "Where the gross profit goes. Other operating expenses include app-store and payment fees.", waterfall([
        { n: "Gross profit", v: c.gp, t: 1 }, { n: "Personnel", v: c.pers }, { n: "Other expenses", v: c.opex }, { n: "Depreciation", v: c.dep }, { n: "EBIT", v: c.ebit, t: 1 },
        { n: "Financial result", v: c.fin_result }, { n: "Taxes", v: c.tax }, { n: "Net income", v: c.ni, t: 1 }])),
      card("From net income to cash, " + c.label, "What happens to the profit in cash terms. Derived from balance sheet movements.", waterfall([
        { n: "Net income", v: c.ni, t: 1 }, { n: "Depreciation", v: -c.dep }, { n: "Deferred income", v: c.di - priDI }, { n: "Other working capital", v: owc }, { n: "Operating cash flow", v: c.ocf, t: 1 },
        { n: "Capex", v: c.capex }, { n: "Securities and loans", v: c.cf_sec + c.cf_loan }, { n: "Dividends paid", v: c.cff }, { n: "Change in cash", v: c.d_cash, t: 1 }]))));

    return root;
  }

  function statements() {
    var I = idx(), j = I[I.length - 1], c = Y[j];
    var S = {
      inc: [["Gross profit", function (x) { return x.gp; }, 1, "tot"], ["Personnel", function (x) { return x.pers; }, 1], ["Other operating expenses", function (x) { return x.opex; }, 1], ["EBITDA", function (x) { return x.ebitda; }, 1, "tot"], ["Depreciation", function (x) { return x.dep; }, 1], ["EBIT", function (x) { return x.ebit; }, 1, "tot"], ["Financial result", function (x) { return x.fin_result; }, 1], ["Taxes", function (x) { return x.tax; }, 1], ["Net income", function (x) { return x.ni; }, 1, "tot"],
        ["EBITDA margin", function (x) { return x.r.ebitda_margin; }, 1, "pct"], ["EBIT margin", function (x) { return x.r.ebit_margin; }, 1, "pct"], ["Net margin", function (x) { return x.r.net_margin; }, 1, "pct"]],
      bal: [["Cash", function (x) { return x.cash; }, 1], ["Financial assets", function (x) { return x.fin; }, 0], ["Receivables", function (x) { return x.recv; }, 0], ["Fixed assets", function (x) { return x.fixed; }, 0], ["Prepaid expenses", function (x) { return x.prepaid; }, 0], ["Deferred tax assets", function (x) { return x.dta; }, 0], ["Total assets", function (x) { return x.ta; }, 0, "tot"],
        ["Equity", function (x) { return x.equity; }, 1], ["Provisions", function (x) { return x.prov; }, 0], ["Liabilities", function (x) { return x.liab; }, 0], ["Deferred income", function (x) { return x.di; }, 0], ["Total equity and liabilities", function (x) { return x.tel; }, 0, "tot"]],
      cf: [["Operating cash flow", function (x) { return x.ocf; }, 1, "tot"], ["Capex", function (x) { return x.capex; }, 0], ["Securities purchased (−) or sold (+)", function (x) { return x.cf_sec; }, 0], ["Loans to managing directors", function (x) { return x.cf_loan; }, 0], ["Dividends paid", function (x) { return x.cff; }, 0], ["Change in cash", function (x) { return x.d_cash; }, 1, "tot"]]
    };
    var rows = S[VX.stmt].map(function (d) {
      var isP = d[3] === "pct", f = function (x) { var v = d[1](x); return isP ? pl(v) : m2(v); }, chg = "–", cls = "";
      if (j > 0) { var a = d[1](Y[j]), b = d[1](Y[j - 1]);
        if (a != null && b != null) { var dl = a - b; cls = !d[2] || dl === 0 ? "" : dl > 0 ? "up" : "down"; chg = isP ? (dl >= 0 ? "+" : "−") + Math.abs(dl * 100).toFixed(1) + " pts" : (Math.abs(dl) < 5000 ? "–" : (dl >= 0 ? "+" : "−") + m2(Math.abs(dl)) + (b > 0 && Math.abs(dl / b) <= 9.99 ? " (" + pc(dl / b, 0) + ")" : "")); } }
      return h("tr", { style: d[3] === "tot" ? "font-weight:650" : "" }, h("td", {}, d[0]), Y.map(function (x) { return h("td", { class: "n" }, f(x)); }), h("td", { class: "n " + cls }, chg));
    });
    return card("Financial statements, €m", "Change column: selected year against the year before. Green is favourable, red unfavourable, plain is neutral. Cash flow is derived (no cash flow statement is published).",
      h("div", {}, seg([["inc", "Income statement"], ["bal", "Balance sheet"], ["cf", "Cash flow"]], VX.stmt, function (v) { VX.stmt = v; render(); }, "Statement"),
        h("div", { class: "scroll", style: "margin-top:8px" }, h("table", {}, h("thead", {}, h("tr", {}, h("th", {}, "€m"), Y.map(function (x) { return h("th", { class: "n" }, x.label); }), h("th", { class: "n" }, c.label + " vs prior"))), h("tbody", {}, rows)))));
  }

  /* one-line takeaway per tab, built from whatever years are loaded */
  function takeaway(role) {
    if (VX.ovY == null) VX.ovY = FY[N - 1];
    var I = idx(), last = Y[I[I.length - 1]], first = Y[I[0]], li = I[I.length - 1], prev = li > 0 ? Y[li - 1] : null, t = "", head = "";
    var sgn = function (x) { return (x >= 0 ? "+" : "−") + Math.abs(x * 100).toFixed(0) + "%"; };
    if (role === "overview") {
      var c = Y[Math.max(0, Y.map(function (x) { return x.fy; }).indexOf(VX.ovY))], pi = Y.indexOf(c) - 1, p = pi >= 0 ? Y[pi] : null, open = LD.data.opening.balance, dDI = c.di - (p ? p.di : open.deferred_income), inv = c.capex + c.cf_sec + c.cf_loan;
      head = c.label + " in one line. ";
      t = "Net income was " + e1(c.ni) + " and operating cash flow " + e1(c.ocf) + ". " +
        (c.ocf > c.ni && dDI > 0 ? "Deferred income (customer prepayments) grew " + e1(dDI) + ", against a gap of " + e1(c.ocf - c.ni) + " between cash flow and net income. " : "") +
        (inv < 0 ? e1(-inv) + " went into capex, securities and loans" : "Investing flows added " + e1(inv)) + (c.cff ? " and " + e1(-c.cff) + " was paid out as dividends" : "") + ", so cash " + (c.d_cash >= 0 ? "rose" : "fell") + " by " + e1(Math.abs(c.d_cash)) + " to " + e1(c.cash) + ".";
    } else if (role === "analysis") {
      var gA = prev ? gpB(last) / gpB(prev) - 1 : null, gp0 = gA, ox0 = prev ? opexB(last) / opexB(prev) - 1 : null;
      head = last.label + ". ";
      t = (gA != null ? "Gross profit " + sgn(gA) + " to " + e1(gpB(last)) + ". " : "Gross profit " + e1(gpB(last)) + ". ") + "Personnel is " + pl(-last.pers / gpB(last), 0) + " and other operating expenses " + pl(-opexB(last) / gpB(last), 0) + " of gross profit, leaving an operating margin of " + pl(last.ebit / gpB(last)) + (prev ? " (" + pl(prev.ebit / gpB(prev)) + " the year before)" : "") + "." + (gp0 != null && ox0 != null ? " Other operating expenses grew " + sgn(ox0) + " against " + sgn(gp0) + " for gross profit." : "");
    } else {
      var bad = Y.filter(function (x) { return [x.chk_ni, x.chk_ta, x.chk_bs, x.chk_equity, x.chk_ocf].some(function (v) { return v != null && Math.abs(v) >= 1; }); });
      head = last.label + ". ";
      t = "Equity ratio " + pl(last.r.equity_ratio, 0) + ", current ratio " + (last.r.current_ratio == null ? "n/a" : last.r.current_ratio.toFixed(2) + "×") + ", cash conversion " + (last.r.cash_conversion == null ? "n/a" : last.r.cash_conversion.toFixed(2) + "×") + ". " + (bad.length ? "Model checks fail for " + bad.map(function (x) { return x.label; }).join(", ") + ": see the checks below." : "All model checks tie.");
    }
    return h("div", { class: "note" }, h("b", {}, head), t);
  }

  window.YAZIO_VIEWS = { overview: viewOverview, statements: statements, takeaway: takeaway };
})();
