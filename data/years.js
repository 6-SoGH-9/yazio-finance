/* YAZIO data. Plain JSON assigned to a global so the pages also work when opened from disk. See README.md for how to add a year. */
window.YAZIO_DATA = {
 "years": [
  {
   "fy": 2021,
   "income": {
    "gross_profit": 16191572.15,
    "personnel": -2486519.71,
    "depreciation": -46225.13,
    "other_opex": -8138265.94,
    "income_securities": 2.74,
    "other_interest_income": 8631.59,
    "interest_expense": -2637.5,
    "income_tax": -1799126.04,
    "other_taxes": 1098.47,
    "net_income": 3728530.63
   },
   "balance": {
    "intangible": 4582,
    "tangible": 126166,
    "financial_assets": 2789310.82,
    "loan_in_financial_assets": 0,
    "receivables": 2480176.2,
    "loan_in_receivables": 0,
    "cash": 7890388.91,
    "prepaid": 1893666.74,
    "deferred_tax_assets": 0,
    "total_assets": 15184290.67,
    "equity": 3796235.76,
    "provisions": 2643054.64,
    "liabilities": 659434.88,
    "deferred_income": 8085565.39,
    "total_equity_liabilities": 15184290.67
   },
   "headcount": 45,
   "flows": {
    "dividends_paid": 1500000,
    "loan_paid_out": 0
   },
   "fees": {
    "amount": 5400000,
    "in_gross_profit": true,
    "estimate": false,
    "source": "FY2022 management report (rounded)"
   },
   "mgmt": {},
   "outlook": {
    "report": "FY2021 report"
   }
  },
  {
   "fy": 2022,
   "income": {
    "gross_profit": 22186501.7,
    "personnel": -4112539.44,
    "depreciation": -71248.07,
    "other_opex": -16092894.65,
    "income_securities": 24.51,
    "other_interest_income": 25179.46,
    "interest_expense": -1922,
    "income_tax": -653234.65,
    "other_taxes": 0,
    "net_income": 1279866.86
   },
   "balance": {
    "intangible": 3753,
    "tangible": 171477,
    "financial_assets": 3808845.81,
    "loan_in_financial_assets": 0,
    "receivables": 4488142,
    "loan_in_receivables": 0,
    "cash": 7457945.49,
    "prepaid": 174694.69,
    "deferred_tax_assets": 0,
    "total_assets": 16104857.99,
    "equity": 3776102.62,
    "provisions": 751634.97,
    "liabilities": 4471788.1,
    "deferred_income": 7105332.3,
    "total_equity_liabilities": 16104857.99
   },
   "headcount": 63,
   "flows": {
    "dividends_paid": 1300000,
    "loan_paid_out": 0
   },
   "fees": {
    "amount": 6100000,
    "in_gross_profit": false,
    "estimate": false,
    "source": "FY2023 management report (rounded)"
   },
   "mgmt": {},
   "outlook": {
    "report": "FY2022 report"
   }
  },
  {
   "fy": 2023,
   "income": {
    "gross_profit": 25697144.71,
    "personnel": -5183945.2,
    "depreciation": -76072.34,
    "other_opex": -18844637.11,
    "income_securities": 10.94,
    "other_interest_income": 77455.98,
    "interest_expense": -1917,
    "income_tax": -609047.48,
    "other_taxes": 0,
    "net_income": 1058992.5
   },
   "balance": {
    "intangible": 14353.55,
    "tangible": 175146,
    "financial_assets": 4102376.25,
    "loan_in_financial_assets": 0,
    "receivables": 5423069.18,
    "loan_in_receivables": 0,
    "cash": 8827089.48,
    "prepaid": 320199.16,
    "deferred_tax_assets": 0,
    "total_assets": 18862233.62,
    "equity": 3535095.12,
    "provisions": 951498.31,
    "liabilities": 1207556.21,
    "deferred_income": 13168083.98,
    "total_equity_liabilities": 18862233.62
   },
   "headcount": 67,
   "flows": {
    "dividends_paid": 1300000,
    "loan_paid_out": 0
   },
   "fees": {
    "amount": 6700000,
    "in_gross_profit": false,
    "estimate": false,
    "source": "FY2023 management report (rounded)"
   },
   "mgmt": {
    "bookings": 32200000,
    "bookings_reliable": true,
    "bookings_growth_printed_pct": 50
   },
   "outlook": {
    "report": "FY2023 report"
   }
  }
 ],
 "company": "YAZIO GmbH",
 "currency": "EUR",
 "standard": "HGB, Gesamtkostenverfahren",
 "settings": {
  "deferred_income_is_liability": 1
 },
 "_readme": "One entry per financial year. To add a year, copy the last entry in 'years', change fy and the numbers. Expenses are negative, as in the HGB income statement. Amounts in EUR. Nothing else in the pages needs to change.",
 "opening": {
  "fy": 2020,
  "balance": {
   "intangible": 5411,
   "tangible": 69807,
   "financial_assets": 503563.97,
   "loan_in_financial_assets": 0,
   "receivables": 1740819.31,
   "loan_in_receivables": 0,
   "cash": 6444617.73,
   "prepaid": 2337192.87,
   "deferred_tax_assets": 0,
   "total_assets": 11101411.88,
   "equity": 1567705.13,
   "provisions": 756185.2,
   "liabilities": 288184.03,
   "deferred_income": 8489337.52,
   "total_equity_liabilities": 11101411.88
  }
 }
};
