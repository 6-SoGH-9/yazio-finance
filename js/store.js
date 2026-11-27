/* store.js: keeps the annual reports a person drops into the cockpit in THIS browser (localStorage), builds the year entries
   from them with extract-core.js, and draws the small "Your statements" panel (add, remove, export, import).
   Nothing is uploaded anywhere. If nothing is stored, the cockpit falls back to data/years.js. */
(function (root) {
  "use strict";
  var KEY = "yazio.statements.v1", X = root.YAZIO_EXTRACT;
  function lsGet() { try { var s = localStorage.getItem(KEY); return s ? JSON.parse(s) : null; } catch (e) { return null; } }
  function lsSet(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); return true; } catch (e) { return false; } }
  function lsClear() { try { localStorage.removeItem(KEY); } catch (e) {} }
  function mem() { return root.__yazioMem || (root.__yazioMem = { docs: {} }); }
  function loadDocs() { var o = lsGet(); return o && o.docs ? o : mem(); }
  function saveDocs(o) { if (!lsSet(o)) root.__yazioMem = o; }

  function docTies(d) {
    var b = d.balance.cur;
    var ok = Math.abs(b.total_assets - b.total_equity_liabilities) < 0.02 && Math.abs(b.total_assets - b._assets_computed) < 0.02;
    if (d.income) ok = ok && Math.abs(d.income.cur.ni_diff) < 0.02;
    return ok;
  }

  /* docs {fy: parsed report} -> data in the shape of data/years.js, plus notes per year */
  function buildData(docs, meta, seed) {
    var fys = Object.keys(docs).map(Number).sort(function (a, b) { return a - b; });
    var data = { company: (meta && meta.company) || "Company", currency: "EUR", standard: "HGB", settings: { deferred_income_is_liability: 1 }, years: [] }, notes = {}, byFy = {};
    (seed || []).forEach(function (y) { byFy[y.fy] = y; });
    fys.forEach(function (fy) {
      var prev = byFy[fy - 1] || null;
      var r = X.buildEntry(fy, docs[fy], docs[fy + 1], prev);
      if (r.error || !r.entry || !r.entry.income) { notes[fy] = [r.error || "No income statement for this year. Add the next year's report, its prior-year column holds it."]; return; }
      var e = r.entry;
      if (e.fees && e.fees.amount == null) { e.fees.amount = 0; r.warnings.push("Store fees not found in the report text: shown as 0."); }
      if (e.headcount == null) e.headcount = 0;
      data.years.push(e); byFy[fy] = e; notes[fy] = r.warnings.filter(function (w) { return !/Loan to the managing|Dividend EUR/.test(w); });
      if (!byFy[fy - 1] && data.years.length > 1) notes[fy].push("FY" + (fy - 1) + " is missing: checks that compare with the previous year will not tie.");
    });
    if (data.years.length && docs[data.years[0].fy]) {
      var p = docs[data.years[0].fy].balance.prior, ob = {};
      Object.keys(p).forEach(function (k) { if (k.charAt(0) !== "_") ob[k] = Math.round(p[k] * 100) / 100; });
      ob.loan_in_receivables = 0; ob.loan_in_financial_assets = 0;
      data.opening = { fy: data.years[0].fy - 1, balance: ob };
    }
    return { data: data, notes: notes };
  }

  function init(builtin) {
    var o = loadDocs(), docs = o.docs || {}, hidden = o.hidden || [];
    var bi = builtin && builtin.years && builtin.years.length ? builtin : null;
    var built = Object.keys(docs).length ? buildData(docs, o.meta, bi ? bi.years : []) : { data: { years: [] }, notes: {} };
    var have = {}; built.data.years.forEach(function (y) { have[y.fy] = 1; });
    var years = [], src = {};
    if (bi) bi.years.forEach(function (y) { if (!have[y.fy] && hidden.indexOf(y.fy) < 0) { years.push(y); src[y.fy] = "example"; } });
    built.data.years.forEach(function (y) { years.push(y); src[y.fy] = "yours"; });
    years.sort(function (a, b) { return a.fy - b.fy; });
    var data = null;
    if (years.length) {
      data = JSON.parse(JSON.stringify(bi || built.data)); data.years = years;
      var f0 = years[0].fy, op = null, all = (bi ? bi.years : []);
      if (bi && bi.opening && bi.opening.fy === f0 - 1) op = bi.opening;
      if (!op) { var pe = all.filter(function (y) { return y.fy === f0 - 1; })[0]; if (pe) op = { fy: pe.fy, balance: pe.balance }; }
      if (!op && built.data.opening && built.data.opening.fy === f0 - 1) op = built.data.opening;
      if (op) data.opening = op; else if (!data.opening) delete data.opening;
    }
    return { source: Object.keys(docs).length && data ? "stored" : (data ? "builtin" : "none"), data: data, notes: built.notes, docs: docs, meta: o.meta || {}, hidden: hidden, builtin: bi, years: years.map(function (y) { return { fy: y.fy, src: src[y.fy] }; }) };
  }

  /* ---- PDF -> parsed report ---- */
  function pageRows(items) {
    var its = items.filter(function (i) { return i.str && i.str.trim(); }).map(function (i) { return { s: i.str.trim(), x: i.transform[4], r: i.transform[4] + i.width, y: i.transform[5] }; });
    its.sort(function (a, b) { return b.y - a.y || a.x - b.x; });
    var rows = [], cur = null;
    its.forEach(function (i) { if (!cur || Math.abs(cur.y - i.y) > 2.5) { cur = { y: i.y, items: [] }; rows.push(cur); } cur.items.push(i); });
    return rows.map(function (r) {
      r.items.sort(function (a, b) { return a.x - b.x; });
      var lab = [], nums = [];
      r.items.forEach(function (i) { if (X.isNumToken(i.s)) nums.push({ v: X.parseNum(i.s), pos: i.r }); else lab.push(i.s); });
      return { label: lab.join(" "), nums: nums };
    });
  }
  async function readPDF(file) {
    if (!root.pdfjsLib) throw new Error("PDF reader not loaded");
    root.pdfjsLib.GlobalWorkerOptions.workerSrc = "js/vendor/pdf.worker.min.js";
    var buf = await file.arrayBuffer(), pdf = await root.pdfjsLib.getDocument({ data: buf }).promise, rows = [];
    for (var p = 1; p <= pdf.numPages; p++) { var pg = await pdf.getPage(p), tc = await pg.getTextContent(); rows = rows.concat(pageRows(tc.items)); }
    var text = rows.map(function (r) { return r.label + (r.nums.length ? " " + r.nums.map(function (n) { return n.v; }).join(" ") : ""); }).join("\n");
    var d = X.parseDocument(rows, text);
    return d;
  }

  /* ---- panel ---- */
  var CSS = ".ys{border:1px solid var(--border,#d9e0e5);background:var(--surface,#fff);border-radius:12px;padding:12px 16px;margin:14px 0}" +
    ".ys h2{font-size:15px;margin:0 0 6px}.ys p{margin:4px 0;color:var(--muted,#566573);font-size:13px}" +
    ".ys .dz{border:2px dashed var(--border,#d9e0e5);border-radius:10px;padding:14px;text-align:center;cursor:pointer;color:var(--muted,#566573);font-size:13.5px}" +
    ".ys .dz.over{border-color:var(--s1,#0e6e68)}.ys .chips{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0}" +
    ".ys .chip2{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--border,#d9e0e5);border-radius:999px;padding:2px 4px 2px 10px;font-size:13px}" +
    ".ys .chip2 button{border:0;background:transparent;cursor:pointer;color:inherit;font-size:15px;line-height:1;padding:0 6px}" +
    ".ys .ok{color:var(--goodtxt,#1b7a3e)}.ys .bad{color:var(--crittxt,#b3261e)}.ys .wn{color:var(--warntxt,#8a5a00)}" +
    ".ys .row{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}.ys .b{font:inherit;font-size:13px;border:1px solid var(--border,#d9e0e5);background:transparent;color:inherit;border-radius:8px;padding:5px 10px;cursor:pointer}" +
    ".ys ul{margin:4px 0 0;padding-left:18px;font-size:12.5px;color:var(--warntxt,#8a5a00)}" +
    ".ys .try{margin:8px 0 0}.ys a.b{display:inline-block;text-decoration:none;margin:0 2px}";

  // Sample report offered to visitors who have no PDF of their own (file lives next to the page).
  var SAMPLE_FY = 2024, SAMPLE_PDF = "samples/annual-report-fy2024.pdf";
  function el(tag, txt, cls) { var e = document.createElement(tag); if (txt != null) e.textContent = txt; if (cls) e.className = cls; return e; }
  function download(name, text, type) { var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], { type: type })); a.download = name; document.body.appendChild(a); a.click(); a.remove(); }

  function mount(box, st, opts) {
    opts = opts || {};
    if (!document.getElementById("ys-css")) { var s = el("style", CSS); s.id = "ys-css"; document.head.appendChild(s); }
    var state = st, busy = el("p", "", "");
    function redraw() {
      box.innerHTML = ""; var wrap = el("div", null, "ys"); box.appendChild(wrap);
      wrap.appendChild(el("h2", "Your statements"));
      var src = state.source === "stored" ? "Showing the example years together with the statements you added. What you add is stored in this browser only and never leaves your computer. A year you drop replaces the same year."
        : state.source === "builtin" ? "Showing the example years. Drop annual report PDFs below to add years or replace them."
        : "No data yet. Drop the annual report PDFs (HGB) below. One or several years; the cockpit builds from them.";
      wrap.appendChild(el("p", src));
      var dz = el("div", "Drop PDF files here or click to choose them", "dz"), inp = el("input"); inp.type = "file"; inp.accept = "application/pdf"; inp.multiple = true; inp.hidden = true;
      dz.onclick = function () { inp.click(); }; inp.onchange = function () { add(inp.files); };
      ["dragover", "dragenter"].forEach(function (ev) { dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.add("over"); }); });
      ["dragleave", "drop"].forEach(function (ev) { dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.remove("over"); }); });
      dz.addEventListener("drop", function (e) { add(e.dataTransfer.files); });
      wrap.appendChild(dz); wrap.appendChild(inp);
      if (state.builtin && !state.docs[SAMPLE_FY]) {
        var tr = el("p", "No report to hand? ", "try"), dl = el("a", "Download the FY" + SAMPLE_FY + " annual report", "b");
        dl.href = SAMPLE_PDF; dl.setAttribute("download", SAMPLE_PDF.split("/").pop());
        tr.appendChild(dl); tr.appendChild(document.createTextNode(" and drop it in above. It is the public filing."));
        wrap.appendChild(tr);
      }
      wrap.appendChild(busy);
      var list = state.years.slice(), seen = {}; list.forEach(function (y) { seen[y.fy] = 1; });
      Object.keys(state.docs).forEach(function (k) { if (!seen[k]) list.push({ fy: +k, src: "yours", skipped: true }); });
      list.sort(function (a, b) { return a.fy - b.fy; });
      var fys = Object.keys(state.docs).map(Number);
      if (list.length) {
        var chips = el("div", null, "chips"); wrap.appendChild(chips);
        list.forEach(function (y) {
          var d = state.docs[y.fy], c = el("span", null, "chip2"); c.appendChild(el("b", "FY" + y.fy));
          if (y.src === "yours" && d) c.appendChild(el("span", d.ties !== false ? "ties" : "check", d.ties !== false && !y.skipped ? "ok" : "bad"));
          else c.appendChild(el("span", "example", "wn"));
          var x = el("button", "×"); x.title = "Remove FY" + y.fy; x.setAttribute("aria-label", "Remove FY" + y.fy); x.onclick = function () { remove(y.fy, y.src); };
          c.appendChild(x); chips.appendChild(c);
        });
        var all = []; list.forEach(function (y) { (state.notes[y.fy] || []).forEach(function (n) { all.push("FY" + y.fy + ": " + n); }); });
        if (all.length) { var det = document.createElement("details"); var sm = el("summary", all.length + " note" + (all.length > 1 ? "s" : "") + " on the extracted data"); det.appendChild(sm); var ul = el("ul"); all.forEach(function (n) { ul.appendChild(el("li", n)); }); det.appendChild(ul); wrap.appendChild(det); }
      }
      var row = el("div", null, "row"); wrap.appendChild(row);
      if (fys.length) { var ex = el("button", "Export my data", "b"); ex.onclick = function () { download("yazio-statements.json", JSON.stringify({ docs: state.docs, meta: state.meta, hidden: state.hidden }), "application/json"); }; row.appendChild(ex); }
      var im = el("button", "Import saved data", "b"), imf = el("input"); imf.type = "file"; imf.accept = ".json,application/json"; imf.hidden = true;
      im.onclick = function () { imf.click(); };
      imf.onchange = function () { var f = imf.files[0]; if (!f) return; f.text().then(function (t) { try { var o = JSON.parse(t); if (!o.docs) throw 0; saveDocs({ docs: o.docs, meta: o.meta || {}, hidden: o.hidden || [] }); location.reload(); } catch (e) { busy.textContent = "That file is not an export from this page."; busy.className = "bad"; } }); };
      row.appendChild(im); row.appendChild(imf);
      if (fys.length || state.hidden.length) { var rs = el("button", state.builtin ? "Reset to the example years" : "Remove all", "b"); rs.onclick = function () { if (confirm("Remove everything you added in this browser?")) { lsClear(); root.__yazioMem = null; location.reload(); } }; row.appendChild(rs); }
    }
    async function add(files) {
      var o = loadDocs(); o.meta = o.meta || {};
      for (var i = 0; i < files.length; i++) {
        busy.className = "wn"; busy.textContent = "Reading " + files[i].name + " ...";
        try {
          var d = await readPDF(files[i]);
          if (d.error) { busy.className = "bad"; busy.textContent = files[i].name + ": " + d.error; return; }
          if (!d.fy) { busy.className = "bad"; busy.textContent = files[i].name + ": could not detect the financial year."; return; }
          d.ties = docTies(d); o.docs[d.fy] = d;
        } catch (e) { busy.className = "bad"; busy.textContent = files[i].name + ": " + e.message; return; }
      }
      saveDocs(o); location.reload();
    }
    function remove(fy, src) {
      var o = loadDocs(); o.docs = o.docs || {}; o.hidden = o.hidden || [];
      if (src === "example") { if (o.hidden.indexOf(fy) < 0) o.hidden.push(fy); } else delete o.docs[fy];
      if (Object.keys(o.docs).length || o.hidden.length) saveDocs(o); else { lsClear(); root.__yazioMem = null; }
      location.reload();
    }
    redraw();
  }

  root.YAZIO_STORE = { init: init, mount: mount, buildData: buildData, readPDF: readPDF };
})(window);
