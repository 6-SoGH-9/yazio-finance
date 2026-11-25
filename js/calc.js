/* calc.js: turns the raw statement lines in data/years.js into every figure the pages show.
   Works for any number of years (1..n). Nothing here is typed in; change the data, not this file.
   Sign convention: raw expenses are negative (as in the HGB income statement); derived "cost" ratios are positive. */
(function (root) {
  "use strict";

  function sum() { var s = 0; for (var i = 0; i < arguments.length; i++) s += arguments[i] || 0; return s; }
  function div(a, b) { return (a == null || b == null || !isFinite(a) || !isFinite(b) || b === 0) ? null : a / b; }
  function growth(cur, prev) { return (prev == null || prev === 0 || cur == null) ? null : cur / prev - 1; }

  /* balance sheet lines in the shape the calculations use */
  function bal(b) {
    var fixed = sum(b.intangible, b.tangible);
    return {
      cash: b.cash,
      fin: b.financial_assets,
      sec: b.financial_assets - (b.loan_in_financial_assets || 0),   // securities = financial assets excl. the loan
      fixed: fixed,
      recv: b.receivables,
      recv_x: b.receivables - (b.loan_in_receivables || 0),          // receivables excl. the loan
      prepaid: b.prepaid,
      dta: b.deferred_tax_assets || 0,
      ta: sum(b.cash, b.financial_assets, fixed, b.receivables, b.prepaid, b.deferred_tax_assets),
      equity: b.equity, prov: b.provisions, liab: b.liabilities, di: b.deferred_income,
      tel: sum(b.equity, b.provisions, b.liabilities, b.deferred_income),
      reported_total: b.total_assets
    };
  }

  function compute(data) {
    var L = data.settings && data.settings.deferred_income_is_liability != null ? data.settings.deferred_income_is_liability : 1;
    var out = [];
    var prevB = bal(data.opening.balance), prevCalc = null;

    data.years.forEach(function (y, idx) {
      var inc = y.income, B = bal(y.balance), f = y.fees || { amount: 0, in_gross_profit: false };
      var addback = f.in_gross_profit ? f.amount : 0;                // fees sitting inside gross profit are added back
      var c = { fy: y.fy, label: "FY" + y.fy, short: "FY" + String(y.fy).slice(2), raw: y, bal: B };

      /* income statement, comparable basis: app-store fees in other opex in every year */
      c.gp_filed = inc.gross_profit;
      c.gp = inc.gross_profit + addback;
      c.pers = inc.personnel;
      c.opex_filed = inc.other_opex;
      c.opex = inc.other_opex - addback;
      c.ebitda = c.gp + c.pers + c.opex;
      c.dep = inc.depreciation;
      c.ebit = c.ebitda + c.dep;
      c.fin_result = sum(inc.income_securities, inc.other_interest_income, inc.interest_expense);
      c.ebt = c.ebit + c.fin_result;
      c.tax = sum(inc.income_tax, inc.other_taxes);
      c.ni = c.ebt + c.tax;
      c.ni_reported = inc.net_income;
      c.fees = f.amount;
      c.fees_in_gp = !!f.in_gross_profit;

      /* balance sheet */
      c.cash = B.cash; c.fin = B.fin; c.sec = B.sec; c.fixed = B.fixed; c.recv = B.recv; c.prepaid = B.prepaid;
      c.dta = B.dta; c.ta = B.ta; c.equity = B.equity; c.prov = B.prov; c.liab = B.liab; c.di = B.di; c.tel = B.tel;
      c.head = y.headcount;

      /* derived cash flow (no cash flow statement is published) */
      c.d_cash = B.cash - prevB.cash;
      c.capex = -(B.fixed - prevB.fixed - c.dep);
      c.cf_sec = -(B.sec - prevB.sec);
      c.cf_loan = -(y.flows.loan_paid_out || 0);
      c.cfi = c.capex + c.cf_sec + c.cf_loan;
      c.cff = -(y.flows.dividends_paid || 0);
      c.dividends = y.flows.dividends_paid || 0;
      c.ocf = c.d_cash - c.cfi - c.cff;
      c.fcf = c.ocf + c.capex;
      /* independent indirect route as a cross-check */
      c.ocf_indirect = sum(c.ni, -c.dep, -(B.recv_x - prevB.recv_x), -(B.prepaid - prevB.prepaid), -(B.dta - prevB.dta),
        B.prov - prevB.prov, B.liab - prevB.liab, B.di - prevB.di);

      /* checks */
      c.chk_ni = c.ni - c.ni_reported;
      c.chk_ta = c.ta - B.reported_total;
      c.chk_bs = B.ta - B.tel;
      c.chk_equity = prevCalc || data.opening ? (B.equity - (prevB.equity + c.ni_reported - c.dividends)) : null;
      c.chk_ocf = c.ocf - c.ocf_indirect;

      /* management-report items */
      var m = y.mgmt || {};
      c.bookings = (m.bookings != null && m.bookings_reliable !== false) ? m.bookings : null;
      c.bookings_any = m.bookings != null ? m.bookings : null;
      c.bookings_printed_growth = m.bookings_growth_printed_pct != null ? m.bookings_growth_printed_pct / 100 : null;
      c.store_recv = m.store_receivable != null ? m.store_receivable : null;

      /* growth */
      var P = prevCalc;
      c.g = {
        gp: P ? growth(c.gp, P.gp) : null,
        ebit: P && P.ebit > 0 ? growth(c.ebit, P.ebit) : null,
        ni: P ? growth(c.ni, P.ni) : null,
        ta: growth(c.ta, prevB.ta), equity: P ? growth(c.equity, P.equity) : null,
        di: growth(c.di, prevB.di), head: P ? growth(c.head, P.head) : null,
        pers: P ? growth(c.pers, P.pers) : null, opex: P ? growth(c.opex, P.opex) : null,
        opex_filed: P ? growth(c.opex_filed, P.opex_filed) : null,
        gp_filed: P ? growth(c.gp_filed, P.gp_filed) : null,
        bookings: (P && c.bookings != null && P.bookings != null) ? growth(c.bookings, P.bookings) : null
      };
      /* implied billings = gross profit + change in deferred income (inference from audited lines) */
      c.billings_implied = c.gp + (B.di - prevB.di);
      c.g.billings_implied = (P && P.billings_implied != null) ? growth(c.billings_implied, P.billings_implied) : null;

      /* ratios */
      var cl = B.prov + B.liab + B.di * L;     // liabilities used in liquidity ratios
      var r = {};
      r.ebitda_margin = div(c.ebitda, c.gp); r.ebit_margin = div(c.ebit, c.gp); r.ebt_margin = div(c.ebt, c.gp); r.net_margin = div(c.ni, c.gp);
      r.roe = div(c.ni, c.equity); r.roa = div(c.ni, c.ta);
      r.pers_pct = div(-c.pers, c.gp); r.opex_pct = div(-c.opex, c.gp); r.dep_pct = div(-c.dep, c.gp); r.fin_pct = div(c.fin_result, c.gp);
      r.tax_rate = div(-inc.income_tax, c.ebt); r.tax_pct = div(-c.tax, c.gp);
      r.cash_ratio = div(B.cash, cl); r.quick_ratio = div(B.cash + B.recv, cl); r.current_ratio = div(B.cash + B.recv + B.prepaid, cl);
      r.cash_sec_to_di = div(B.cash + B.sec, B.di);
      r.runway_months = div(B.cash, (-c.pers - c.opex) / 12);
      r.runway_sec_months = div(B.cash + B.sec, (-c.pers - c.opex) / 12);
      r.equity_ratio = div(B.equity, B.ta); r.equity_multiplier = div(B.ta, B.equity);
      r.liab_to_equity = div(cl, B.equity); r.liab_x_di_to_equity = div(B.prov + B.liab, B.equity);
      r.di_pct_assets = div(B.di, B.ta); r.fin_pct_assets = div(B.fin, B.ta);
      r.asset_turnover = div(c.gp, B.ta); r.cash_turnover = div(c.gp, B.cash); r.recv_turnover = div(c.gp, B.recv);
      r.fixed_turnover = div(c.gp, B.fixed); r.di_turnover = div(c.gp, B.di); r.recv_days = div(B.recv, c.gp) == null ? null : B.recv / c.gp * 365;
      r.gp_per_head = div(c.gp, c.head); r.pers_per_head = div(-c.pers, c.head); r.ebit_per_head = div(c.ebit, c.head); r.gp_per_pers = div(c.gp, -c.pers);
      r.cash_conversion = div(c.ocf, c.ni); r.ocf_margin = div(c.ocf, c.gp); r.fcf_margin = div(c.fcf, c.gp); r.capex_pct = div(-c.capex, c.gp);
      r.payout = P ? div(c.dividends, P.ni) : null;
      r.di_share_ocf = div(B.di - prevB.di, c.ocf);
      r.dupont_margin = r.net_margin; r.dupont_turnover = r.asset_turnover; r.dupont_leverage = r.equity_multiplier;
      /* bookings-based (only where the management report gives a usable bookings figure) */
      var bk = c.bookings;
      r.fees_pct_bookings = bk != null ? div(c.fees, bk) : null;
      r.opex_x_fees_pct_bookings = bk != null ? div(-c.opex - c.fees, bk) : null;
      r.gp_pct_bookings = bk != null ? div(c.gp, bk) : null;
      r.di_pct_bookings = bk != null ? div(B.di, bk) : null;
      r.store_recv_days = (bk != null && c.store_recv != null) ? c.store_recv / bk * 365 : null;
      c.r = r;

      out.push(c); prevCalc = c; prevB = B;
    });
    return out;
  }

  /* ratio registry: drives the ratio tables on the pages. kind: pct, x (multiple), days, months, eur */
  var RATIOS = [
    ["Growth", [["Gross profit growth", "g.gp", "pct"], ["EBIT growth", "g.ebit", "pct"], ["Net income growth", "g.ni", "pct"], ["Total assets growth", "g.ta", "pct"], ["Equity growth", "g.equity", "pct"], ["Deferred income growth", "g.di", "pct"], ["Headcount growth", "g.head", "pct"], ["Bookings growth (where usable)", "g.bookings", "pct"]]],
    ["Profitability", [["EBITDA margin", "r.ebitda_margin", "pct"], ["EBIT margin", "r.ebit_margin", "pct"], ["EBT margin", "r.ebt_margin", "pct"], ["Net profit margin", "r.net_margin", "pct"], ["Return on equity", "r.roe", "pct"], ["Return on assets", "r.roa", "pct"]]],
    ["Cost structure, % of gross profit", [["Personnel", "r.pers_pct", "pct"], ["Other operating expenses", "r.opex_pct", "pct"], ["Depreciation", "r.dep_pct", "pct"], ["Net financial result", "r.fin_pct", "pct"], ["Effective tax rate (on EBT)", "r.tax_rate", "pct"], ["Taxes", "r.tax_pct", "pct"]]],
    ["Liquidity", [["Cash ratio", "r.cash_ratio", "x"], ["Quick ratio", "r.quick_ratio", "x"], ["Current ratio", "r.current_ratio", "x"], ["Cash + securities / deferred income", "r.cash_sec_to_di", "x"], ["Cash runway, months of costs (cash only)", "r.runway_months", "months"], ["Cash runway incl. securities, months", "r.runway_sec_months", "months"]]],
    ["Capital structure", [["Equity ratio", "r.equity_ratio", "pct"], ["Equity multiplier", "r.equity_multiplier", "x"], ["Liabilities / equity", "r.liab_to_equity", "x"], ["Liabilities excl. deferred income / equity", "r.liab_x_di_to_equity", "x"], ["Deferred income % of assets", "r.di_pct_assets", "pct"], ["Financial assets % of assets", "r.fin_pct_assets", "pct"]]],
    ["Efficiency and productivity", [["Asset turnover", "r.asset_turnover", "x"], ["Cash turnover", "r.cash_turnover", "x"], ["Deferred income turnover", "r.di_turnover", "x"], ["Receivable days", "r.recv_days", "days"], ["Gross profit per head (EUR)", "r.gp_per_head", "eur"], ["Personnel cost per head (EUR)", "r.pers_per_head", "eur"], ["EBIT per head (EUR)", "r.ebit_per_head", "eur"], ["Gross profit per EUR of personnel", "r.gp_per_pers", "x"]]],
    ["Cash flow (derived)", [["Cash conversion (OCF / net income)", "r.cash_conversion", "x"], ["Operating cash flow margin", "r.ocf_margin", "pct"], ["Free cash flow margin", "r.fcf_margin", "pct"], ["Capex % of gross profit", "r.capex_pct", "pct"], ["Dividend payout (on prior-year net income)", "r.payout", "pct"], ["Deferred income share of OCF", "r.di_share_ocf", "pct"]]],
    ["Bookings based (usable years only)", [["Store fees % of bookings", "r.fees_pct_bookings", "pct"], ["Other opex excl. fees % of bookings", "r.opex_x_fees_pct_bookings", "pct"], ["Gross profit % of bookings", "r.gp_pct_bookings", "pct"], ["Deferred income % of bookings", "r.di_pct_bookings", "pct"], ["Store receivable days", "r.store_recv_days", "days"]]]
  ];

  function pick(c, path) { var p = path.split("."), o = c; for (var i = 0; i < p.length; i++) { if (o == null) return null; o = o[p[i]]; } return o == null ? null : o; }

  /* formatting helpers shared by the pages */
  var fmt = {
    m1: function (x) { return x == null ? "n/a" : (x / 1e6).toFixed(1); },
    em: function (x) { return x == null ? "n/a" : (x < 0 ? "−" : "") + "€" + (Math.abs(x) / 1e6).toFixed(1) + "M"; },
    eur: function (x) { return x == null ? "n/a" : (x < 0 ? "−" : "") + "€" + Math.abs(Math.round(x)).toLocaleString("en-GB"); },
    pct: function (x, d) { return x == null || !isFinite(x) ? "n/a" : (x * 100).toFixed(d == null ? 1 : d) + "%"; },
    spct: function (x, d) { return x == null || !isFinite(x) ? "n/a" : (x >= 0 ? "+" : "−") + Math.abs(x * 100).toFixed(d == null ? 0 : d) + "%"; },
    x: function (x) { return x == null ? "n/a" : x.toFixed(2); },
    ratio: function (v, kind) {
      if (v == null) return "n/a";
      if (kind === "pct") return fmt.pct(v, 1);
      if (kind === "x") return v.toFixed(2) + "x";
      if (kind === "days") return v.toFixed(0) + " days";
      if (kind === "months") return v.toFixed(1) + " mo";
      if (kind === "eur") return fmt.eur(v);
      return String(v);
    }
  };

  /* load(): optional ?from=2021&to=2023 style slicing, used to test the pages with fewer years.
     If the first kept year is not the first in the data, the balance sheet of the year before becomes the opening balance. */
  function load(data, opts) {
    opts = opts || {};
    var ys = data.years.slice().sort(function (a, b) { return a.fy - b.fy; });
    var firstIdx = 0;
    if (opts.from) { firstIdx = ys.findIndex(function (y) { return y.fy >= opts.from; }); if (firstIdx < 0) firstIdx = 0; }
    var kept = ys.filter(function (y) { return y.fy >= ys[firstIdx].fy && (!opts.to || y.fy <= opts.to); });
    var opening = firstIdx === 0 ? data.opening : { fy: ys[firstIdx - 1].fy, balance: ys[firstIdx - 1].balance };
    var sub = { settings: data.settings, opening: opening, years: kept };
    return { data: sub, years: compute(sub) };
  }

  var api = { compute: compute, load: load, RATIOS: RATIOS, pick: pick, fmt: fmt };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.YAZIO_CALC = api;
})(typeof window !== "undefined" ? window : this);
