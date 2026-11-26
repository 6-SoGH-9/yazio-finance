/* YAZIO data. Plain JSON assigned to a global so the pages also work when opened from disk. See README.md for how to add a year. */
window.YAZIO_DATA = {
 "_readme": "One entry per financial year. To add a year, copy the last entry in 'years', change fy and the numbers. Expenses are negative, as in the HGB income statement. Amounts in EUR. Nothing else in the pages needs to change.",
 "company": "YAZIO GmbH",
 "currency": "EUR",
 "standard": "HGB, Gesamtkostenverfahren",
 "settings": {
  "deferred_income_is_liability": 1
 },
 "opening": {
  "fy": 2019,
  "balance": {
   "intangible": 0,
   "tangible": 70486,
   "financial_assets": 0,
   "loan_in_financial_assets": 0,
   "receivables": 1262782.39,
   "loan_in_receivables": 0,
   "cash": 2499867.37,
   "prepaid": 1491709.65,
   "deferred_tax_assets": 205860,
   "total_assets": 5807883.96,
   "equity": -277178.55,
   "provisions": 64345.09,
   "liabilities": 239599.6,
   "deferred_income": 5503939.27,
   "total_equity_liabilities": 5807883.96
  }
 },
 "years": [
  {
   "fy": 2020,
   "income": {
    "gross_profit": 13580299.34,
    "personnel": -1608847.99,
    "depreciation": -28974.2,
    "other_opex": -9092942.9,
    "income_securities": 1.96,
    "other_interest_income": 0.01,
    "interest_expense": 600,
    "income_tax": -1005252.54,
    "other_taxes": 0,
    "net_income": 1844883.68
   },
   "balance": {
    "intangible": 5411,
    "tangible": 69807,
    "financial_assets": 503563.97,
    "loan_in_financial_assets": 0,
    "receivables": 1740819.31,
    "loan_in_receivables": 300000,
    "cash": 6444617.73,
    "prepaid": 2337192.87,
    "deferred_tax_assets": 0,
    "total_assets": 11101411.88,
    "equity": 1567705.13,
    "provisions": 756185.2,
    "liabilities": 288184.03,
    "deferred_income": 8489337.52,
    "total_equity_liabilities": 11101411.88
   },
   "headcount": 28,
   "flows": {
    "dividends_paid": 0,
    "loan_paid_out": 300000
   },
   "fees": {
    "amount": 4800000,
    "in_gross_profit": true,
    "estimate": true,
    "source": "Own estimate: fees sat inside purchased services until FY2021"
   },
   "mgmt": {
    "revenue_printed": 18.6
   }
  },
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
    "loan_in_receivables": 300000,
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
   "mgmt": {
    "store_receivable": 1606933.74,
    "revenue_printed": 21.8
   },
   "outlook": {
    "report": "FY2021 report",
    "personnel_growth_pct": 94,
    "other_opex_growth_pct": 49
   }
  }
 ]
};
