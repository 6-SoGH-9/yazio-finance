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
    "loan_in_receivables": 300000,
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
   "mgmt": {
    "bookings": 22300000,
    "bookings_reliable": false,
    "bookings_growth_printed_pct": 2,
    "store_receivable": 1010375.97,
    "revenue_printed": 22.5,
    "note": "FY2022 report calls EUR 22.3m 'Bruttoverkaeufe' but it looks like recognised revenue, so it is not used as bookings"
   },
   "outlook": {
    "report": "FY2022 report",
    "personnel_growth_pct": 36,
    "other_opex_growth_pct": 7
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
    "loan_in_financial_assets": 300000,
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
    "bookings_growth_printed_pct": 50,
    "store_receivable": 2700000
   },
   "outlook": {
    "report": "FY2023 report, conservative scenario",
    "personnel_growth_pct": 48,
    "other_opex_growth_pct": 51,
    "bookings_growth_pct": 40
   }
  },
  {
   "fy": 2024,
   "income": {
    "gross_profit": 47997327.51,
    "personnel": -7001991.69,
    "depreciation": -121550.63,
    "other_opex": -37320225.6,
    "income_securities": 10.18,
    "other_interest_income": 178175.86,
    "interest_expense": -592,
    "income_tax": -1442362.77,
    "other_taxes": -12513.72,
    "net_income": 2276277.14
   },
   "balance": {
    "intangible": 13524.55,
    "tangible": 251552,
    "financial_assets": 17183177.39,
    "loan_in_financial_assets": 300000,
    "receivables": 6403722.84,
    "loan_in_receivables": 0,
    "cash": 7977610.46,
    "prepaid": 358748.36,
    "deferred_tax_assets": 0,
    "total_assets": 32188335.6,
    "equity": 4811372.26,
    "provisions": 1350097.84,
    "liabilities": 2449534.53,
    "deferred_income": 23577330.97,
    "total_equity_liabilities": 32188335.6
   },
   "headcount": 83,
   "flows": {
    "dividends_paid": 1000000,
    "loan_paid_out": 0
   },
   "fees": {
    "amount": 13200000,
    "in_gross_profit": false,
    "estimate": false,
    "source": "FY2024 management report (rounded)"
   },
   "mgmt": {
    "bookings": 59800000,
    "bookings_reliable": true,
    "bookings_growth_printed_pct": 86,
    "store_receivable": 4600000
   },
   "outlook": {
    "report": "FY2024 report, conservative scenario",
    "bookings_growth_text": "mid double-digit (reading: 40-60%)",
    "bookings_growth_low_pct": 40,
    "bookings_growth_high_pct": 60
   }
  }
 ]
};
