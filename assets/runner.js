/* ============================================================
   runner.js - a real JavaScript test runner, coverage counter
   and mutation tester, running entirely in the browser.

   Shared by learn-ai-coding-with-phoebe and learn-ai-qa-with-phoebe.
   Nothing here is simulated: the code is really executed, the
   assertions really run, the coverage is really counted from
   executed lines, and the mutants are really compiled and killed
   or not killed by the learner's own tests.

   Single source of truth. If you change it, change it in both
   repos and re-run the harness in each.
   ============================================================ */
(function (global) {
  "use strict";

  /* ---------- assertion library (tiny, real) ---------------- */
  function makeHarness() {
    var results = [];
    function eq(actual, expected, msg) {
      var ok = Object.is(actual, expected) ||
               (JSON.stringify(actual) === JSON.stringify(expected));
      results.push({ ok: ok, msg: msg || "equals", actual: actual, expected: expected });
      if (!ok) throw new AssertionError(msg, actual, expected);
    }
    function ok(v, msg) {
      var pass = !!v;
      results.push({ ok: pass, msg: msg || "truthy", actual: v, expected: true });
      if (!pass) throw new AssertionError(msg, v, true);
    }
    function throws(fn, msg) {
      var threw = false;
      try { fn(); } catch (e) { threw = true; }
      results.push({ ok: threw, msg: msg || "throws", actual: threw, expected: true });
      if (!threw) throw new AssertionError(msg, "no throw", "throw");
    }
    return { eq: eq, ok: ok, throws: throws, results: results };
  }
  function AssertionError(msg, actual, expected) {
    this.name = "AssertionError";
    this.message = (msg || "assertion failed") +
      " (got " + short(actual) + ", wanted " + short(expected) + ")";
  }
  AssertionError.prototype = Object.create(Error.prototype);
  function short(v) {
    try { var s = typeof v === "string" ? '"' + v + '"' : JSON.stringify(v);
          return s === undefined ? String(v) : (s.length > 40 ? s.slice(0, 38) + "…" : s); }
    catch (e) { return String(v); }
  }

  /* ---------- run one test suite against one source --------- */
  function runTests(source, tests, opts) {
    opts = opts || {};
    var h = makeHarness();
    var cases = [];
    var api = {
      test: function (name, fn) { cases.push({ name: name, fn: fn }); },
      eq: h.eq, ok: h.ok, throws: h.throws
    };
    var factory;
    try {
      /* the source defines functions; the tests use them plus the api */
      factory = new Function("test", "eq", "ok", "throws", "__cov",
        '"use strict";\n' + source + "\n;\n" + tests + "\n");
    } catch (e) {
      return { compileError: String(e.message || e), passed: 0, failed: 0, cases: [] };
    }
    var cov = opts.cov || {};
    try {
      factory(api.test, api.eq, api.ok, api.throws, cov);
    } catch (e) {
      return { compileError: String(e.message || e), passed: 0, failed: 0, cases: [] };
    }
    var passed = 0, failed = 0, out = [];
    cases.forEach(function (c) {
      var before = h.results.length;
      try {
        c.fn();
        passed++;
        out.push({ name: c.name, ok: true, detail: (h.results.length - before) + " assertions" });
      } catch (e) {
        failed++;
        out.push({ name: c.name, ok: false, detail: e.message || String(e) });
      }
    });
    return { passed: passed, failed: failed, cases: out, total: cases.length,
             assertions: h.results.length };
  }

  /* ---------- real statement coverage ----------------------- */
  /* Instruments each executable line with a counter, runs the
     suite, and reports which lines actually ran. Deliberately
     simple: it counts LINES, which is exactly the metric the QA
     course is arguing is a poor proxy for quality. */
  function instrument(source) {
    var lines = source.split("\n"), out = [], map = [];
    lines.forEach(function (ln, i) {
      var t = ln.trim();
      /* A probe can only be prefixed to a line that starts a statement.
         Anything opening with a brace, an else, or a case label would become
         a syntax error, so those lines are passed through uncounted. */
      var skippable = t === "" ||
                      t.indexOf("//") === 0 || t.indexOf("/*") === 0 || t.indexOf("*") === 0 ||
                      t.charAt(0) === "}" || t.charAt(0) === "{" ||
                      /^(else|case|default)\b/.test(t) ||
                      /^(function|var|let|const)\s+\w+\s*=?\s*function/.test(t) === false && false;
      if (skippable) { out.push(ln); return; }
      /* place the probe before the statement on its own line */
      map.push(i + 1);
      out.push("__cov[" + (i + 1) + "]=(__cov[" + (i + 1) + "]||0)+1; " + ln);
    });
    return { code: out.join("\n"), lines: map };
  }
  function coverage(source, tests) {
    var inst = instrument(source);
    var cov = {};
    var res = runTests(inst.code, tests, { cov: cov });
    var hit = inst.lines.filter(function (n) { return cov[n]; });
    return {
      total: inst.lines.length,
      hit: hit.length,
      pct: inst.lines.length ? Math.round((hit.length / inst.lines.length) * 1000) / 10 : 0,
      missed: inst.lines.filter(function (n) { return !cov[n]; }),
      run: res
    };
  }

  /* ---------- real mutation testing ------------------------- */
  /* Each operator rewrites the source. A mutant is KILLED if the
     suite fails on it, and SURVIVES if the suite still passes -
     which means the tests never actually checked that behaviour. */
  var OPERATORS = [
    { id: "cond-boundary", label: "< becomes <=",  find: /([^<>=!])<([^=])/g, put: "$1<=$2" },
    { id: "cond-boundary2", label: "> becomes >=", find: /([^<>=!])>([^=])/g, put: "$1>=$2" },
    { id: "negate-eq",   label: "=== becomes !==", find: /===/g,             put: "!==" },
    { id: "math-add",    label: "+ becomes -",     find: /([\w\)\]]) \+ /g,  put: "$1 - " },
    { id: "math-mul",    label: "* becomes /",     find: /([\w\)\]]) \* /g,  put: "$1 / " },
    { id: "true-lit",    label: "true becomes false", find: /\btrue\b/g,     put: "false" },
    { id: "zero-lit",    label: "0 becomes 1",     find: /([^\w.])0([^\w.])/g, put: "$11$2" },
    { id: "and-or",      label: "&& becomes ||",   find: /&&/g,              put: "||" }
  ];

  function mutants(source) {
    var list = [];
    OPERATORS.forEach(function (op) {
      var re = new RegExp(op.find.source, op.find.flags);
      var m, seen = 0;
      while ((m = re.exec(source)) !== null) {
        var idx = m.index, len = m[0].length;
        var replaced = m[0].replace(new RegExp(op.find.source), op.put);
        if (replaced === m[0]) { if (re.lastIndex === idx) re.lastIndex++; continue; }
        var mutated = source.slice(0, idx) + replaced + source.slice(idx + len);
        var line = source.slice(0, idx).split("\n").length;
        list.push({ id: op.id + "#" + (++seen), label: op.label, line: line,
                    code: mutated, snippet: m[0].trim(), became: replaced.trim() });
        if (re.lastIndex === idx) re.lastIndex++;
        if (list.length > 60) return;
      }
    });
    return list;
  }

  function mutationScore(source, tests) {
    var base = runTests(source, tests);
    if (base.compileError) return { error: "source or tests do not compile: " + base.compileError };
    if (base.failed > 0) {
      return { error: "the suite must be green before mutation testing means anything (" +
                      base.failed + " failing)" , baseline: base };
    }
    var list = mutants(source), killed = [], survived = [];
    list.forEach(function (mu) {
      var r = runTests(mu.code, tests);
      /* a mutant that will not compile is not a useful mutant, skip it */
      if (r.compileError) { mu.skipped = true; return; }
      if (r.failed > 0) { mu.killedBy = r.cases.filter(function (c) { return !c.ok; })
                            .map(function (c) { return c.name; })[0]; killed.push(mu); }
      else survived.push(mu);
    });
    var scored = killed.length + survived.length;
    return {
      baseline: base,
      killed: killed, survived: survived,
      total: scored,
      score: scored ? Math.round((killed.length / scored) * 1000) / 10 : 0
    };
  }

  global.LWP_RUNNER = {
    runTests: runTests, coverage: coverage,
    mutationScore: mutationScore, mutants: mutants, OPERATORS: OPERATORS
  };
})(window);
