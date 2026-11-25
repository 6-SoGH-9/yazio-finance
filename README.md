# Yazio finance workspace

Two static pages built on one data file:

| Page | What it is |
|---|---|
| `cockpit.html` | Dashboard for the CFO, FP&A and the Controller: KPIs, trends, growth check, forecast bias (guidance vs actual), result bridge, scenario model, 50+ ratios, model checks, and the case-study controller view (mock data). |
| `prep.html` | Interview preparation for the CFO conversation: business story, numbers, role fit, questions. |
| `index.html` | Landing page. It also shows which years are loaded and whether the model ties. |

No build step, no server, no dependencies. Open the files in a browser, or publish the folder with GitHub Pages
(Settings > Pages > Deploy from branch > `main` / root). The prep page loads web fonts from Google Fonts and falls back to system fonts offline.

## How it is built

```
data/years.js       The only place with statement numbers. One entry per year.
data/casestudy.js   Case-study mock data and audit-readiness observations (static).
js/calc.js          Turns the raw lines into every derived figure: comparable P&L, derived cash flow,
                    51 ratios, checks. Works for 1 to n years. Nothing typed in.
cockpit.html        Reads data and calc, draws charts with plain SVG.
prep.html           Same, plus the questions list (edit in the script at the bottom).
tests/verify.js     node tests/verify.js : checks that the model ties to the filed statements.
```

The data file is plain JSON assigned to a global (`window.YAZIO_DATA = {...}`) so the pages also work when opened from disk.
Expenses are negative, as in the HGB income statement. Amounts are in EUR.

### Method (what the numbers mean)

- **Comparable basis.** Until FY2021 the app-store fees were netted inside gross profit (Rohergebnis); from FY2022 they are in
  other operating expenses. `fees.in_gross_profit: true` tells the model to add them back for those years, so gross profit and
  other opex are comparable across all years. EBIT and net income do not change. The FY2020 amount (4.8m) is an estimate
  (`estimate: true`); FY2021 (5.4m) is from the FY2022 management report.
- **Derived cash flow.** No cash flow statement is published. Operating cash flow = change in cash - capex - securities flow -
  loans flow - dividends, all from balance sheet movements. An independent indirect route (net income, depreciation, working
  capital) must give the same number; the check rows show the difference.
- **Loan to the managing directors** (EUR 300k) was paid out in FY2020 (`flows.loan_paid_out`). It sits in receivables FY2020-22
  and in financial assets from FY2023 (`loan_in_receivables`, `loan_in_financial_assets`), so it never counts as securities
  or as operating cash flow.
- **Bookings** (Bruttoverkaeufe) come from the management reports and are rounded. A year with `bookings_reliable: false`
  (FY2022: the printed figure looks like recognised revenue) is excluded from bookings-based ratios and growth.
- **Liquidity ratios** count deferred income as a liability by default (IFRS 15 view). Set
  `settings.deferred_income_is_liability` to 0 for the HGB view.

## Add a year (for example FY2025)

1. Open `data/years.js`. Copy the last entry in `years` and change `fy` to the new year.
2. Type the new statement lines into `income` and `balance` (the filed balance sheet and income statement).
   Expenses negative. Check `total_assets` and `total_equity_liabilities` against the filed totals.
3. Fill `headcount` (average employees), `flows.dividends_paid` (cash dividend paid in the year, from the equity roll-forward)
   and `flows.loan_paid_out` (0 unless a new loan is paid out).
4. `fees`: amount from the management report (rounded), `in_gross_profit: false`.
   `mgmt`: `bookings`, `bookings_growth_printed_pct`, `store_receivable` if the report gives them.
   `outlook`: what the report says about the next year, so the guidance table can compare it later.
5. Run `node tests/verify.js`. All five checks must say OK. A difference points at a typo in that year.
6. Reload the pages. Charts, tables, ratios and year selectors follow. No code change is needed.

To test with fewer years, add `?to=2023` (or `?from=2022`) to a page address.
Starting with FY2020 to FY2023 and adding FY2024 later is exactly this procedure.

## What is static (and how the pages tell you)

Numbers, charts, tables, ratios and the growth/cash/ROE sentences follow the data. Analyst commentary that cites specific years
(the "What happened" paragraph, the question list, the risk ratings from the FY2024 report) is typed text. When data for a year
after FY2024 is loaded, those blocks show a dashed "Written for FY2024 data" badge so stale text is visible. Update them by hand.

## Checks that were run

- The calculation engine reproduces the Excel check workbook: 160 statement lines and 224 ratio cells, no difference.
- All model checks tie to the cent in all five years (net income, total assets, balance, equity roll-forward, cash flow).
- Both pages were opened with 1, 2, 3, 4 and 5 years and with a later start year: no script errors.
