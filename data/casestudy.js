/* Case-study data (mock figures from the take-home case brief) and audit-readiness observations from the filed statements.
   Static: not driven by years.js. */
window.YAZIO_CASE = {
 CTRL: [
  {c:"Vendor bank details dual-approved before payment run",a:"Done",m:"Done",j:"Open",sev:"High",note:"3 changes in June; 1 (the €22,000/month vendor) has one approver, approved verbally. Payment-fraud exposure. Hold further payments, call back on a master-data number, log formally."},
  {c:"Invoices >€10,000 carry a PO reference",a:"Done",m:"Open",j:"Open",sev:"Medium",note:"€14,000 equipment purchase has quote and delivery note but no PO. These prove delivery, not authorisation."},
  {c:"Reverse-charge invoices flagged pre-posting",a:"Done",m:"Done",j:"Done",sev:"Low",note:"Both June invoices flagged correctly."},
  {c:"Duplicate-payment check, trailing 90 days",a:"Done",m:"Done",j:"Done",sev:"Low",note:"One potential duplicate flagged and cleared (different PO and delivery date). Control worked."},
  {c:"Bank reconciliation sign-off, AP clearing",a:"Done",m:"Done",j:"Done",sev:"Low",note:"Signed 2 July (2nd business day), inside the 5-day target."},
  {c:"Vendor master spot-check (VAT ID, IBAN), CC 225100/225200",a:"Open",m:"Open",j:"Open",sev:"High",note:"Recurring gap: not done in April, May or June. The check that would have caught the Irish hosting IBAN mismatch."}
 ],
 ENTRIES: [
  {id:"AE1-ACC",t:"Ad Expenses 1 June accrual",dr:"Advertising expense, CC 225100",cr:"Other liabilities (invoice not received)",amt:54200,conf:"High",st:"Prepared, awaiting sign-off",why:"Accrue from platform estimate (§253 Abs. 1 HGB)."},
  {id:"AE1-REB",t:"Ad Expenses 1 Q2 volume rebate",dr:"Other assets (rebate claim)",cr:"Advertising expense, CC 225100",amt:8185,conf:"Medium",st:"Judgement: needs sign-off",why:"5% of €163,700 once Q2 passes €150,000. June would have to fall below €40,500 to miss it. Reverse if vendor disputes."},
  {id:"AE2-COR",t:"Ad Expenses 2 package: expense to prepaid",dr:"Prepaid expenses",cr:"Advertising expense, CC 225100",amt:43803.28,conf:"High",st:"Prepared, awaiting sign-off",why:"€48,000 × 16/183 = €4,196.72 belongs to June; rest is Jul–Dec (§250 Abs. 1 HGB)."},
  {id:"CARD-1",t:"Card rec: missing top-up 22 Jun",dr:"Advertising expense, CC 225100",cr:"Card clearing",amt:950,conf:"High",st:"Prepared, awaiting sign-off",why:"Never posted (feed gap)."},
  {id:"CARD-2",t:"Card rec: duplicate catering 19 Jun",dr:"Card clearing",cr:"Expense, CC 225200",amt:-275,conf:"High",st:"Prepared, awaiting sign-off",why:"Posted twice."},
  {id:"CARD-3",t:"Card rec: Analytics add-on cost-centre reclass",dr:"CC 225100 +220",cr:"CC 225200 −220",amt:0,conf:"High",st:"Prepared, awaiting sign-off",why:"Wrong cost centre; reclass only (€220 moves, net zero)."}
 ],
 BVA: {months:["Mar-26","Apr-26","May-26","Jun-26"], ad:{b:[50000,50000,52000,52000],a:[49200,51100,58400,63000]}, mt:{b:[8000,8000,8000,12000],a:[8000,8000,8000,4500]}},
 VAT: [
  {v:"Translation Services Provider",ctry:"Germany",net:2400,tr:"Domestic",vat:"German VAT 19% charged by vendor; deductible input VAT.",amt:456},
  {v:"Cloud Hosting Provider",ctry:"Ireland",net:18500,tr:"Reverse charge",vat:"§13b UStG, place of supply Germany (§3a Abs. 2 UStG). Self-assess 19%, deduct in same period. IBAN differs from vendor master: payment held.",amt:3515},
  {v:"Equipment Supplier",ctry:"Switzerland",net:3100,tr:"Import",vat:"Goods, so no §13b. Import VAT per customs assessment (deductible only on the customs document, §15 Abs. 1 Nr. 2 UStG).",amt:null},
  {v:"Freelance Content Contributor",ctry:"Germany",net:850,tr:"Exempt",vat:"§19 UStG small business: no VAT charged, no input VAT. Expense €850.",amt:0},
  {v:"Platform Distribution Partner",ctry:"United States",net:6750,tr:"Reverse charge",vat:"Non-EU B2B service: §13b UStG, self-assess 19%, deduct.",amt:1282.50}
 ],
 PRE: [
  {n:"Analytics Platform",s:"2026-01",d:12,tot:24000,t:"Software"},
  {n:"Cloud Hosting Reserve",s:"2026-03",d:12,tot:36000,t:"Software"},
  {n:"Design Tool Suite",s:"2026-02",d:12,tot:9600,t:"Software"},
  {n:"HR & Payroll System",s:"2026-04",d:12,tot:14400,t:"Software"},
  {n:"Customer Support Platform",s:"2026-05",d:6,tot:7200,t:"Software"},
  {n:"Data Warehouse Subscription",s:"2026-06",d:12,tot:30000,t:"Software"},
  {n:"Business Liability Insurance",s:"2026-01",d:12,tot:18000,t:"Insurance"},
  {n:"Cyber Insurance Policy",s:"2026-04",d:12,tot:10800,t:"Insurance"}
 ],
 OBS: [
  {id:"O1",sev:"High",t:"FY2022 shareholder resolution quotes net income €1,729,866.86; the financial statements show €1,279,866.86",e:"FY2022 file, p.13 vs income statement. Transposed digits, €450,000 apart. Resolution text should be corrected or explained.",act:"Ask legal/auditor how the resolution was filed; confirm no downstream use of the wrong figure.",st:"Confirm"},
  {id:"O2",sev:"Medium",t:"Comparability break in FY2022: transaction fees no longer deferred and moved out of Rohergebnis",e:"FY2022 notes: active deferral item fell from €1.89m to €0.17m; fees (~€5.4m reclassed) now sit in other operating expenses. FY2021 comparatives were not restated.",act:"Use the 'Comparable' basis for any FY2021→FY2022 trend. Say so in every variance commentary.",st:"Known"},
  {id:"O3",sev:"Medium",t:"€16.9m of securities carried as fixed assets, described as 'liquidatable at any time'",e:"FY2024 Lagebericht §3.3 and fixed-asset schedule: Wertpapiere des Anlagevermögens €16.88m at cost. Classification and impairment test are judgement areas (HGB §247 Abs. 2, §253 Abs. 3; unverified).",act:"Ask how permanence of holding is documented and how market values are monitored.",st:"Question"},
  {id:"O4",sev:"Medium",t:"Effective tax rate 38.7% in FY2024 (36.5% FY2023)",e:"Tax €1.44m on pre-tax €3.74m. Statutory combined rate for an Erfurt company is roughly 30–33% (unverified), so drivers are worth knowing.",act:"Ask for the tax reconciliation (non-deductible items, prior-year effects).",st:"Question"},
  {id:"O5",sev:"Medium",t:"FY2024 distribution (€2.25m, resolved 27 Jun 2025) precedes adoption of the accounts (21 Nov 2025)",e:"FY2024 file, shareholder resolution extract. Distribution is 99% of net income; equity ratio already down to 15%.",act:"Confirm legal basis and liquidity planning for the payout against deferred-revenue obligations.",st:"Question"},
  {id:"O6",sev:"Low",t:"FY2022 balance-sheet caption says 'Anteile an verbundenen Unternehmen' for €3.81m; notes and schedule say securities",e:"FY2022 balance sheet vs fixed-asset schedule. Relabelled 'Wertpapiere' from FY2023.",act:"Presentation error only; note for audit file.",st:"Known"},
  {id:"O7",sev:"Low",t:"FY2022 comparatives differ by €271 between the FY2022 and FY2023 statements",e:"Rohergebnis 22,186,501.70 vs 22,186,230.70 and other opex 16,092,894.65 vs 16,092,623.65. Net result unchanged.",act:"Immaterial reclass; the data file uses figures as originally filed.",st:"Known"},
  {id:"O8",sev:"Low",t:"Loan of €300,000 to the two managing directors, 1.5%, repayable 30 Jan 2030",e:"Disclosed every year; no repayments; €4,500 interest p.a.",act:"Related-party item to keep on the audit-readiness list.",st:"Known"},
  {id:"O9",sev:"Medium",t:"Management rates AI competition as a high earnings risk; no formal risk management system exists",e:"FY2024 Lagebericht, Risikobericht.",act:"Controller can propose a light risk register tied to the bookings KPI.",st:"Question"}
 ]
};
