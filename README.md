# Learn AI QA with Phoebe

Six 45-minute sessions, single track, and **one test suite you can genuinely defend**.

Two test suites. The same fifteen lines of code under test. Both green, both at one hundred
percent line coverage. One catches three of the twelve ways that code can break, the other
catches eleven. Coverage cannot tell them apart, and coverage is what your dashboard shows you.

**Live:** https://phoebefu6.github.io/learn-ai-qa-with-phoebe/

## The sessions

| # | Session | What your suite gains |
|---|---------|------------------------|
| 1 | The green suite lie | A metric that actually distinguishes quality, and a mutant you killed yourself |
| 2 | What a test is for | Assertions instead of execution, and your change-detector tests found |
| 3 | Generating tests | Generation that helps, in the order that does not lock in the bug |
| 4 | Mutation testing | The operators, the tools, the validation, and the honest limits |
| 5 | Flakes and speed | A suite people still trust on a Friday |
| 6 | The quality gate | A gate your team can actually run on Monday |

## The playground is not a simulation

`assets/runner.js` is a real JavaScript test runner, coverage counter and mutation tester that
runs entirely in the browser. Your tests are compiled and executed. The coverage is counted from
lines that actually ran. The mutants are real edits to the source, recompiled and re-run.

On the same `price()` function:

| Suite | Tests | Line coverage | Mutation score | Survivors |
|---|---|---|---|---|
| What a generator often gives you | 1/1 green | **100%** | **25%** | **9 of 12** |
| Tests that check the behaviour | 5/5 green | **100%** | **91.7%** | 1 of 12 |
| After you kill the last one | 6/6 green | 100% | **100%** | 0 |

That surviving mutant is genuine and teachable: `memberSince < 2020` becomes `<= 2020`, and the
good suite tests 2019 and 2021 but never exactly 2020.

## The evidence

- **Coverage is a weak signal.** Inozemtseva and Holmes, ICSE 2014, ACM Distinguished Paper.
  31,000 suites. Coverage "should not be used as a quality target."
- **Assertions are a strong signal.** Zhang and Mesbah, ESEC/FSE 2015. 6,700 suites, 24,000
  assertions. "coverage without checking for correctness is meaningless."
- **Mutants stand in for real faults.** Just et al., FSE 2014. 357 real faults, correlation holds
  "independently of code coverage." Its own limit is taught alongside it: for 27 percent of those
  faults, no mutant was coupled at all.
- **Order matters when generating.** Tests written after faulty code detect 14 percent of faults;
  tests written independently detect 25.

Full source map with every URL and a dated do-not-state-as-fact list:
[`materials/official-course-map.md`](materials/official-course-map.md).

Pairs with [Learn AI Coding with Phoebe](https://phoebefu6.github.io/learn-ai-coding-with-phoebe/),
which arrives at the same lesson from the other side.

by Phoebe Fu · part of [Learn with Phoebe](https://phoebefu6.github.io/learn-with-phoebe/)
