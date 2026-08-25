/* ============================================================
   qa-live.js - "The green suite lie"
   learn-ai-qa-with-phoebe

   A real playground. The cart module below is really executed,
   the learner's tests really run, the line coverage is really
   counted from executed lines, and the mutants are really
   compiled and really killed or not killed by those tests.

   Nothing on this page is a scripted number. Requires runner.js.
   ============================================================ */
(function () {
  "use strict";
  var R = window.LWP_RUNNER;

  var SRC = [
    "function price(items, memberSince) {",
    "  var total = 0;",
    "  for (var i = 0; i < items.length; i++) {",
    "    total = total + items[i].price * items[i].qty;",
    "  }",
    "  var discount = 0;",
    "  if (total > 100) {",
    "    discount = 0.1;",
    "  }",
    "  if (memberSince && memberSince < 2020) {",
    "    discount = discount + 0.05;",
    "  }",
    "  var out = total * (1 - discount);",
    "  return Math.round(out * 100) / 100;",
    "}"
  ].join("\n");

  var PRESETS = {
    weak: {
      name: "What a generator often gives you",
      note: "One test, one loose assertion. It runs every line of the function.",
      code: [
        'test("it prices a cart", function () {',
        '  var r = price([{price: 60, qty: 2}], 2019);',
        '  ok(r > 0, "returns a number");',
        '});'
      ].join("\n")
    },
    strong: {
      name: "Tests that actually check the behaviour",
      note: "Same code under test. Same 100 percent coverage. Very different suite.",
      code: [
        'test("sums the line items", function () {',
        '  eq(price([{price: 10, qty: 2}]), 20);',
        '});',
        'test("ten percent off over one hundred", function () {',
        '  eq(price([{price: 60, qty: 2}]), 108);',
        '});',
        'test("no discount at exactly one hundred", function () {',
        '  eq(price([{price: 50, qty: 2}]), 100);',
        '});',
        'test("a long-standing member gets another five", function () {',
        '  eq(price([{price: 60, qty: 2}], 2019), 102);',
        '});',
        'test("a recent member gets no extra", function () {',
        '  eq(price([{price: 60, qty: 2}], 2021), 108);',
        '});'
      ].join("\n")
    }
  };

  function el(t, c, x) { var n = document.createElement(t); if (c) n.className = c; if (x != null) n.textContent = x; return n; }

  function mount(root) {
    if (!R) { root.appendChild(el("p", "qa-err", "runner.js did not load, so this playground cannot run.")); return; }

    var tabs = el("div", "qa-tabs");
    var TABS = [["run", "Run the suite"], ["cover", "Line coverage"], ["mutate", "Mutation score"]];
    var mode = "run";
    var btns = {};
    TABS.forEach(function (t, i) {
      var b = el("button", "qa-tab" + (i === 0 ? " on" : ""), t[1]);
      b.addEventListener("click", function () {
        mode = t[0];
        Object.keys(btns).forEach(function (k) { btns[k].classList.toggle("on", k === mode); });
        paint();
      });
      btns[t[0]] = b; tabs.appendChild(b);
    });
    root.appendChild(tabs);

    var read = el("div", "qa-readout");
    var big = el("output", "qa-big", "-");
    var cap = el("span", "qa-cap", "");
    read.appendChild(big); read.appendChild(cap);
    root.appendChild(read);

    var cols = el("div", "qa-cols");

    var left = el("div", "qa-col");
    left.appendChild(el("h4", "qa-h", "The code under test"));
    var srcBox = el("pre", "qa-src");
    SRC.split("\n").forEach(function (ln, i) {
      var row = el("span", "qa-line");
      row.dataset.line = String(i + 1);
      row.appendChild(el("i", "qa-ln", String(i + 1)));
      row.appendChild(el("code", null, ln));
      srcBox.appendChild(row);
    });
    left.appendChild(srcBox);
    cols.appendChild(left);

    var right = el("div", "qa-col");
    right.appendChild(el("h4", "qa-h", "Your tests"));
    var presetRow = el("div", "qa-presets");
    Object.keys(PRESETS).forEach(function (k) {
      var b = el("button", "qa-preset" + (k === "weak" ? " on" : ""), PRESETS[k].name);
      b.addEventListener("click", function () {
        ta.value = PRESETS[k].code;
        presetRow.querySelectorAll(".qa-preset").forEach(function (q) { q.classList.remove("on"); });
        b.classList.add("on");
        presetNote.textContent = PRESETS[k].note;
        paint();
      });
      presetRow.appendChild(b);
    });
    right.appendChild(presetRow);
    var presetNote = el("p", "qa-pnote", PRESETS.weak.note);
    right.appendChild(presetNote);
    var ta = document.createElement("textarea");
    ta.className = "qa-ta";
    ta.spellcheck = false;
    ta.value = PRESETS.weak.code;
    ta.setAttribute("aria-label", "Your test suite, editable");
    right.appendChild(ta);
    var runRow = el("div", "qa-runrow");
    var runBtn = el("button", "qa-btn", "Run it");
    var hint = el("span", "qa-hint", "test(name, fn) with eq(actual, expected), ok(value) and throws(fn)");
    runRow.appendChild(runBtn); runRow.appendChild(hint);
    right.appendChild(runRow);
    cols.appendChild(right);
    root.appendChild(cols);

    var out = el("div", "qa-out");
    root.appendChild(out);

    var rail = el("p", "qa-rail");
    rail.innerHTML = "<b>Everything here is real.</b> Your tests are compiled and executed in this " +
      "page. The coverage is counted from lines that actually ran. The mutants are real edits to " +
      "the source, recompiled and re-run against your suite. No number on this page is scripted.";
    root.appendChild(rail);

    runBtn.addEventListener("click", paint);
    ta.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { paint(); e.preventDefault(); }
    });

    function markLines(missed) {
      srcBox.querySelectorAll(".qa-line").forEach(function (r) {
        r.classList.remove("miss", "hit");
        if (!missed) return;
        var n = parseInt(r.dataset.line, 10);
        r.classList.add(missed.indexOf(n) === -1 ? "hit" : "miss");
      });
    }

    function paint() {
      var tests = ta.value;
      out.textContent = "";
      markLines(null);

      if (mode === "run") {
        var r = R.runTests(SRC, tests);
        if (r.compileError) {
          big.textContent = "!"; big.className = "qa-big lo";
          cap.textContent = "your tests did not compile";
          out.appendChild(el("p", "qa-err", r.compileError));
          return;
        }
        big.textContent = r.passed + "/" + r.total;
        big.className = "qa-big " + (r.failed ? "lo" : "hi");
        cap.textContent = r.failed ? "tests passing. Fix the red ones before anything else means anything."
          : "tests passing, with " + r.assertions + " assertion" + (r.assertions === 1 ? "" : "s") +
            ". Green, which is not the same as good.";
        var list = el("div", "qa-cases");
        r.cases.forEach(function (c) {
          var row = el("div", "qa-case " + (c.ok ? "ok" : "no"));
          row.appendChild(el("b", null, c.ok ? "PASS" : "FAIL"));
          row.appendChild(el("span", "qa-cname", c.name));
          row.appendChild(el("span", "qa-cdet", c.detail));
          list.appendChild(row);
        });
        out.appendChild(list);
        return;
      }

      if (mode === "cover") {
        var c2 = R.coverage(SRC, tests);
        if (c2.run.compileError) {
          big.textContent = "!"; big.className = "qa-big lo";
          cap.textContent = "your tests did not compile";
          out.appendChild(el("p", "qa-err", c2.run.compileError));
          return;
        }
        big.textContent = c2.pct + "%";
        big.className = "qa-big " + (c2.pct >= 90 ? "hi" : c2.pct >= 60 ? "mid" : "lo");
        cap.textContent = "line coverage: " + c2.hit + " of " + c2.total +
          " executable lines ran at least once.";
        markLines(c2.missed);
        var n = el("p", "qa-note");
        n.innerHTML = c2.pct === 100
          ? "<b>One hundred percent, and it means less than you think.</b> Coverage asks whether a " +
            "line ran. It never asks whether you checked what the line did. Switch to the mutation " +
            "tab with this same suite."
          : "Green lines ran, red lines never did. Getting this to 100 is the easy part, and the " +
            "next tab shows why it is not the useful part.";
        out.appendChild(n);
        return;
      }

      var m = R.mutationScore(SRC, tests);
      if (m.error) {
        big.textContent = "-"; big.className = "qa-big lo";
        cap.textContent = "cannot score yet";
        out.appendChild(el("p", "qa-err", m.error));
        return;
      }
      big.textContent = m.score + "%";
      big.className = "qa-big " + (m.score >= 90 ? "hi" : m.score >= 60 ? "mid" : "lo");
      cap.textContent = "mutation score: your suite killed " + m.killed.length + " of " +
        m.total + " real changes to the code. Survivors are behaviour nothing checks.";

      if (m.survived.length) {
        var sh = el("p", "qa-note");
        sh.innerHTML = "<b>" + m.survived.length + " mutant" + (m.survived.length === 1 ? "" : "s") +
          " survived.</b> Each row below is a genuine edit to the source that your tests did not " +
          "notice. If a change like that shipped, your suite would still be green.";
        out.appendChild(sh);
      } else {
        var sh2 = el("p", "qa-note");
        sh2.innerHTML = "<b>Nothing survived.</b> Every mutation of this function is caught by your " +
          "suite. That is a genuinely strong test suite, and coverage never would have told you.";
        out.appendChild(sh2);
      }

      var tbl = el("table", "qa-mut");
      var hr = el("tr");
      ["", "Change made to the code", "Line", "Result"].forEach(function (h) { hr.appendChild(el("th", null, h)); });
      tbl.appendChild(hr);
      m.survived.concat(m.killed).slice(0, 14).forEach(function (mu) {
        var alive = m.survived.indexOf(mu) !== -1;
        var tr = el("tr", alive ? "alive" : "dead");
        tr.appendChild(el("td", "qa-mi", alive ? "🐛" : "✓"));
        tr.appendChild(el("td", "qa-mc", mu.label));
        tr.appendChild(el("td", "qa-ml", "L" + mu.line));
        tr.appendChild(el("td", "qa-mr", alive ? "survived, nothing noticed" :
          "killed by " + (mu.killedBy || "your suite")));
        tbl.appendChild(tr);
      });
      out.appendChild(tbl);
    }

    paint();
    window.QA_LIVE = {
      src: SRC, presets: PRESETS,
      setTests: function (t) { ta.value = t; paint(); },
      getTests: function () { return ta.value; },
      setMode: function (m) { btns[m].click(); },
      score: function () { return R.mutationScore(SRC, ta.value); },
      cover: function () { return R.coverage(SRC, ta.value); },
      run: function () { return R.runTests(SRC, ta.value); }
    };
  }

  var host = document.getElementById("qa-live");
  if (host) mount(host);
})();
