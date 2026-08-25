# AI + QA and Testing - official source map and coverage

Verified 2026-08-25. Every fact on a course page traces to a URL below.

## The 80% bar

Each session teaches ~80% of its mapped sources' working content. Certificates, videos and
assessments stay with the official providers. Said plainly on every session page.

## THE SPINE: coverage is not quality, and there is peer-reviewed proof

This course exists because the industry's default quality metric is the one metric the research
says does not measure quality. Two papers carry the argument, and they point in opposite
directions on purpose.

**Coverage is a weak signal.** Inozemtseva and Holmes, "Coverage Is Not Strongly Correlated with
Test Suite Effectiveness", ICSE 2014, ACM Distinguished Paper. 31,000 generated test suites across
five systems totalling up to 724,000 lines. Mutation testing used to measure fault detection.
Finding: "there is a low to moderate correlation between coverage and effectiveness when the
number of test cases in the suite is controlled for", and "stronger forms of coverage do not
provide greater insight". Conclusion, which is this course's thesis: coverage "should not be used
as a quality target because it is not a good indicator of test suite effectiveness."
https://dl.acm.org/doi/10.1145/2568225.2568271 · PDF https://www.cs.ubc.ca/~rtholmes/papers/icse_2014_inozemtseva.pdf

**Assertions are a strong signal.** Zhang and Mesbah, "Assertions Are Strongly Correlated with
Test Suite Effectiveness", ESEC/FSE 2015. 6,700 test suites built from 24,000 assertions across
five real Java projects. "the number of assertions in a test suite strongly correlates with its
effectiveness", and "assertion coverage is strongly correlated with effectiveness". Their premise
line is the one to put on a slide: "coverage without checking for correctness is meaningless."
https://dl.acm.org/doi/10.1145/2786805.2786858 · PDF https://people.ece.ubc.ca/amesbah/resources/papers/fse15.pdf

**Google says the same thing in plainer words, and I checked the canonical page myself.**
"A high code coverage percentage does not guarantee high quality in the test coverage." The
asymmetry that makes coverage still worth having: "a low code coverage number does guarantee that
large areas of the product are going completely untested." Their published bands are **60%
acceptable, 75% commendable, 90% exemplary**, and "The gains of increasing code coverage beyond a
certain point are logarithmic."
https://testing.googleblog.com/2020/08/code-coverage-best-practices.html

**Fowler on the 100% smell.** "high coverage numbers are too easy to reach with low quality
testing", and 100% "smells of someone writing tests to make the coverage numbers happy, but not
thinking about what they are doing." He quotes Brian Marick: "I expect a high level of coverage.
Sometimes managers require one. There's a subtle difference."
https://martinfowler.com/bliki/TestCoverage.html

## Mutation testing: the honest alternative

**Mutants stand in for real faults, and this was measured.** Just, Jalali, Inozemtseva, Ernst,
Holmes and Fraser, "Are Mutants a Valid Substitute for Real Faults in Software Testing?", FSE 2014.
357 real faults across five applications, 321,000 lines. "The results show a statistically
significant correlation between mutant detection and real fault detection, **independently of code
coverage**." 73% of real faults were coupled to mutants from common operators.
https://homes.cs.washington.edu/~rjust/publ/mutants_real_faults_fse_2014.pdf

**Teach its limit in the same breath.** In the same paper, "for 95 out of 357 real faults (27%),
none of the triggering tests detected any additional mutants." Mutation testing is a better proxy
than coverage. It is still a proxy.

**Why coverage misleads, in Google's own mutation-testing paper:** "code coverage alone might be
misleading, in particular when program statements are covered but the expected program outcome is
not asserted upon." That sentence describes exactly what this course's playground demonstrates.
Scale: two billion lines, 500,000,000 tests daily, 16,935,148 generated mutants, 24,000+
developers. The number that made it usable: developers initially rated **85% of mutants
unproductive**, and suppression heuristics moved the productive ratio **from 15% to 89%**, cutting
a changelist from a median of 820 mutants to **7**.
https://arxiv.org/abs/2102.11378

**Change-detector tests, named by Google:** tests whose "change-detector nature (specifically
testing the current implementation rather than the specification) violates testing best practices
and causes brittle tests and false alarms." Same paper.

**The tools.** Stryker for JS/TS, C# and Scala https://stryker-mutator.io/docs/ · PIT for the JVM
https://pitest.org/ · mutmut for Python https://mutmut.readthedocs.io/en/latest/ · cosmic-ray
https://cosmic-ray.readthedocs.io/en/latest/ - its docs carry a 2019 copyright and no current
version, so verify maintenance before recommending it.

## AI-generated tests: does the quality hold up

**The failure mode that matters most, and it has two independent studies behind it.** Tests
generated *after* faulty code inherit the fault.
- Konstantinou, Tambon and Papadakis, 2026: tests generated after faulty code detect **14%** of
  faults; tests generated independently detect **25%**. Their sentence: "incorrect implementations
  and tests are mutually consistent, masking defects rather than revealing them." The effect
  "persists across different prompting strategies and multi-step workflows."
  https://arxiv.org/abs/2607.05139
- Huang, Zhang, Harman, Du and Cui, 2024-25, across 11 models: prompting with correct rather than
  incorrect code improved test accuracy, coverage and bug detection by **57%, 12% and 24%**. On
  real-world examples, tests generated for incorrect code had a **47% worse bug detection rate**.
  Mitigation with evidence: supplying a natural-language description of intent recovered **+34%
  bug detection**. https://arxiv.org/abs/2409.09464

**What raw LLM test generation actually yields, at industrial scale.** Meta's TestGen-LLM, FSE 2024:
**75%** of generated test cases built, **57%** passed reliably, **25%** increased coverage, and
**73%** of surviving recommendations were accepted by engineers. The architectural lesson Meta
draws is that the value came from the filter chain, which "verifies that its generated test classes
successfully clear a set of filters that assure measurable improvement over the original test
suite, thereby eliminating problems due to LLM hallucination." https://arxiv.org/abs/2402.09171

**The academic benchmark.** Schäfer, Nadi, Eghbali and Tip, IEEE TSE 2024. TestPilot on 25 npm
packages and 1,684 API functions: median **70.2% statement** and **52.8% branch** coverage, against
51.3% / 25.6% for the prior state of the art. 92.8% of generated tests had 50% or less similarity
to existing tests. https://arxiv.org/abs/2302.06527

## Flaky tests

Google, and I confirmed these on the canonical page: "a continual rate of about **1.5% of all test
runs** reporting a flaky result"; "Almost **16% of our tests** have some level of flakiness"; and
"about **84% of the transitions we observe from pass to fail involve a flaky test**." Definition
used: "a test that exhibits both a passing and a failing result with the same code."
https://testing.googleblog.com/2016/05/flaky-tests-at-google-and-how-we.html

**Flakiness scales with test size**, which is the actionable finding: small **0.5%**, medium
**1.6%**, large **14%**. Binary size correlates at R² 0.82 and RAM at R² 0.76, and "size is more
predictive than tool."
https://testing.googleblog.com/2017/04/where-do-our-flaky-tests-come-from.html

**Why it wrecks your signal.** Memon et al., ICSE-SEIP 2017, on 5,562,881 Google test targets:
91.3% never failed once, 2.07% both passed and failed at some point, and of those, 46,694 were
flakes. After filtering flakes, only **1.23%** of targets actually caught a developer-introduced
breakage. Consequence in their words: "we could not rely on regression test selection heuristics
such as 'rerun tests that failed recently' as we would end up mostly re-running flaky tests."
https://dl.acm.org/doi/10.1109/ICSE-SEIP.2017.16

Playwright's handling: a flaky test is one that "failed on the first run, but passed when retried",
reported in three buckets, with retries configurable globally, per file, or per group.
https://playwright.dev/docs/test-retries

## Verified tool reality

| Tool | What it really does | The catch | Source |
|---|---|---|---|
| Copilot `/tests` | "Generate unit tests for the selected code" in VS Code, Visual Studio, JetBrains, Xcode | GitHub's own words: tests "may not cover all scenarios", complex scenarios "require more detailed prompts", and "You should always review the generated code" | https://docs.github.com/en/copilot/reference/chat-cheat-sheet · https://docs.github.com/en/copilot/tutorials/write-tests |
| Playwright Test Agents | three agents: **planner** writes a Markdown test plan, **generator** turns it into real test files verifying selectors live, **healer** repairs failures | agent definitions are static files that go stale on every Playwright upgrade; generated tests "may require subsequent repairs"; and the healer "can skip tests if it determines underlying functionality is broken" - a silently skipped test is a green suite testing nothing | https://playwright.dev/docs/test-agents |
| Playwright MCP | drives a real browser off the accessibility tree, not screenshots. 50+ tools | "Playwright MCP is **not** a security boundary". Docker image is headless chromium only | https://github.com/microsoft/playwright-mcp |
| Vitest | the only unit framework of the three with first-party AI guidance, and it is guidance not a tool | documents the real failure modes: models trained on Jest emit `jest.fn()` and fail; mocks leak unless `restoreMocks: true`; AI "defaults to excessive test doubles"; agents hang unless they use `vitest run` | https://vitest.dev/guide/learn/writing-tests-with-ai |
| Jest / pytest | no first-party AI features documented | state it as "none documented", not "none exist" | https://jestjs.io/docs/getting-started · https://docs.pytest.org/en/stable/changelog.html |

**Teaching point:** the first-party AI surface in unit testing is prompting guidance and an IDE
command. The genuinely engineered AI testing system in 2026 is Playwright's, and it is for browser
end-to-end, not units.

**Brittle selectors, with the antidote from the vendor.** Playwright: "Prefer user-facing
attributes to XPath or CSS selectors" because "Your DOM can easily change so having your tests
depend on your DOM structure can lead to failing tests". Priority order: role, text, label,
placeholder, alt, title, test id, and CSS or XPath only as a last resort.
https://playwright.dev/docs/best-practices · https://playwright.dev/docs/locators

## Official learning paths to map coverage against

- Microsoft Learn, "Develop unit tests using GitHub Copilot tools" - module, **8 units**,
  Intermediate, updated 2026. Covers Plan and Agent modes, ghost text, fixing failing tests.
  https://learn.microsoft.com/en-us/training/modules/develop-unit-tests-using-github-copilot-tools/
- Coursera, "Automation, Advanced Testing, and AI" (Microsoft) - Intermediate, ~10 hours,
  11 modules including AI Defect Analytics.
  https://www.coursera.org/learn/automation-advanced-testing-and-ai
- LinkedIn Learning, "AI for Software Testers" - Mike Smith, **1h 17m**, released 2025-07-09.
  https://www.linkedin.com/learning/ai-for-software-testers-apply-ai-tools-and-techniques-to-the-software-testing-life-cycle
- Test Automation University, "Introduction to Playwright" (Renata Andrade, 5 chapters) and
  "Advanced Playwright", both free. https://testautomationu.applitools.com/playwright-intro/

**The gap this course fills:** none of the above teaches mutation testing, the coverage-is-not-
quality evidence, or the ordering problem where a test written after the code inherits the code's
bug. They teach the tool surface.

## Simulator canon - VERIFIED IN-BROWSER 2026-08-25

`assets/qa-live.js` with `assets/runner.js`. **Nothing here is scripted.** The learner's tests are
really compiled and executed, coverage is really counted from executed lines, and mutants are
really recompiled and really killed or not.

The demonstration, on the same 15-line `price()` function:

| Suite | Tests green | Line coverage | Mutation score | Mutants surviving |
|---|---|---|---|---|
| What a generator often gives you | 1/1 | **100%** | **25%** | **9 of 12** |
| Tests that check the behaviour | 5/5 | **100%** | **91.7%** | 1 of 12 |
| After the learner kills the survivor | 6/6 | 100% | **100%** | 0 |

**Identical coverage, wildly different suites.** That is Inozemtseva's finding, reproduced live in
the browser on a function the learner can read in fifteen seconds.

The surviving mutant in the strong suite is genuine and teachable: `memberSince < 2020` becomes
`<= 2020`, and the suite tests 2019 and 2021 but never exactly 2020. Adding
`eq(price([{price:60,qty:2}], 2020), 108)` passes on the real code, fails on the mutant, and takes
the score to 100%. Verified end to end.

**The honesty rail for the pages, and it is an unusual one:** every other simulator in this course
estate carries a "this number is a teaching model" disclaimer. This one does not need it. The
coverage, the pass and fail results and the mutation score are all real execution of the learner's
own tests. Say that plainly, because it is the whole point of building it this way.

## Do not state as fact (unverified)

The per-category percentages in the Luo et al. flaky-test taxonomy (async wait, concurrency, test
order) - the study scale and the ten-cause taxonomy are verified, the specific split is not. The
exact DOI for Luo et al. 2014 - search indexing returns a conflicting DOI; use the Illinois record
https://experts.illinois.edu/en/publications/an-empirical-analysis-of-flaky-tests . Any specific
"fraction of AI tests that assert the wrong thing" figure - the 2026 Empirical Software Engineering
study of 216,300 generated test cases is paywalled and was not read. The claim that "1 in 6"
flaky-to-stable transitions trace to real production bugs - unsourced. Minute counts for the
Microsoft Learn module and for any Test Automation University course - the pages render no
durations. Cosmic-ray's current maintenance status.
