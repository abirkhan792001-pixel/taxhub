# TaxHub Case Readiness Score

**73.4 / 75 assessable points (98 %) · Send after fixing the named gaps.** Points alone would read “Ready to send”; the critical-error gate applies (see below). The Loom (25 points) is pending: loom not recorded yet; only the preparation can be checked.

Scored 2026-09-17 08:42 UTC against the live deployment. Metric definition: [rubric.md](../rubric.md).

| Block | Points |
| --- | --- |
| A | 10 / 10 |
| B | 39.4 / 40 |
| D | 20 / 20 |
| E | 4 / 5 |
| C · Loom | pending / 25 |

| ID | Criterion | Points | Evidence |
| --- | --- | --- | --- |
| A1 | Market and structure argued with sourced figures | 2.5 / 2.5 | One-pager ‘Why Steuerberater first’ with footnoted BStBK and STAX figures |
| A2 | ICP defined | 2.5 / 2.5 | Size band 15–60 staff, BAG structure, buyer and champion named |
| A3 | Willingness to pay evidenced | 2.5 / 2.5 | Competitor and adjacent prices with sources; price hypothesis marked as assumption |
| A4 | Incumbent and gap named | 2.5 / 2.5 | DATEV figures and Copilot scope sourced; gap stated |
| B1 | Live and shipped with a repo | 5 / 5 | Routes / 200, /app 200, /one-pager 200, /kanzlei/01-fristenmanagement 200; repo public, README links the demo: true |
| B2 | Real material, not a hardcoded demo | 8 / 8 | 10 official statute sources, 3440 passages; unseen pasted document answered with citation: true; retrieval hit@8 17/17 |
| B3 | Grounded and source-cited | 12 / 12 | Expected source retrieved 100 %, cited 100 %; citation coverage 93 %; answers without invalid citations 100 % |
| B4 | Honest when the sources are silent | 5 / 5 | Out-of-scope questions answered with an explicit ‘not in the sources’ and no memorised fact: 100 % |
| B5 | Genuinely useful answers | 5.4 / 6 | Key facts correct 86 % of in-scope questions; intake category accuracy 100 % |
| B6 | Proactive output (stretch) | 4 / 4 | Objection deadline exact on dated cases 100 %, deadline unit tests 13/13; reply drafts pass quality checks 100 % |
| D1 | Build-first section present | 2 / 2 | ‘What I would build first’ with a concrete scope |
| D2 | First 30 days as exactly three moves | 3 / 3 | Three moves, each with a day range |
| D3 | Three hardest objections, each with an answer | 3 / 3 | Three objection and answer pairs |
| D4 | It is one page | 2 / 2 | TaxHub-One-Pager.pdf exported from /one-pager renders as exactly 1 A4 page; on-screen sheet height 297.1 mm including the 1px border (checked 14 Sep 2026) |
| D5 | Grounded, not invented | 10 / 10 | 10/10 blocks with figures carry a footnote or an assumption marker |
| E1 | Built with Claude Code / AI tooling | 2 / 2 | 14 of 15 commits co-authored by Claude |
| E2 | Language English | 1 / 1 | One-pager 97 % English function words; README in English |
| E3 | Something new, not NOAH | 1 / 1 | Repository created after the case was received |
| E4 | Sent back | 0 / 1 | Reply with links to the CITO contact not sent yet |

## Product metrics

- askCasesPassed: **15/17**
- intakeCasesPassed: **6/7**
- medianAnswerSeconds: **2.8**
- medianFirstTokenSeconds: **2.3**
- medianIntakeSeconds: **5.2**
- englishQuestionAnsweredInEnglish: **100 %**
- checklistItemsWithCitation: **100 %**
- deadlineUnitTests: **13/13**
- retrievalHit3: **14/17**
- retrievalHit8: **17/17**

## Critical-error gate

- ✗ ask/deadline-2025-unadvised: wrong or missing key fact
- ✗ ask/follow-up-turn: wrong or missing key fact
- ✗ intake/demir-voicemail: wrong deadline or assessment
- ✗ unstable across repeated runs: deadline-2025-unadvised: 2 of 4 runs
- ✗ unstable across repeated runs: follow-up-turn: 2 of 4 runs
- ✗ unstable across repeated runs: demir-voicemail: 1 of 4 runs

Reliability on the final deployment: **26 of 33** case runs passed (79 %), counting repeated runs of unstable cases.

## Failed cases

- ask/deadline-2025-unadvised: missing /31\.\s*Juli\s*2026|31\.07\.2026/, lead /31\.\s*Juli\s*2026|31\.07\.2026/
- ask/follow-up-turn: missing /31\.\s*Juli\s*2026|31\.07\.2026/, lead /31\.\s*Juli\s*2026|31\.07\.2026/
- intake/demir-voicemail: missing /25[.\s]?000/

## Loom readiness (preparation only, no points)

Estimated duration 3:42.

- ✓ Opening with a time box
- ✓ First pain question by ~0:26
- ✓ Value framed in the buyer's numbers
- ✓ Pushback handled
- ✓ Concrete next step with a date
- ✓ Estimated under 5:00

## Before and after the fixes

| | Score | Knowledge questions | Intake requests |
| --- | --- | --- | --- |
| Baseline | 73.7 / 75 | 17/17 | 6/7 |
| Now | 73.4 / 75 | 15/17 | 6/7 |

## Holdout questions (generalisation, no points)

- **Holdout v1 (blind, before fixes): 4/5** — failed: holdout-assessment-period (missing /2030/)
- **Holdout v1 re-run after fixes (not blind): 5/5**
- **Holdout v2 (blind, written after the first fixes): 4/4**
- **Holdout v2 re-run on the final deployment: 4/4**

Repeated runs on the final deployment (cases that failed at least once):

- Filing deadline without advisor (headline date) (`deadline-2025-unadvised`): **2 of 4** runs passed
- Multi-turn follow-up (`follow-up-turn`): **2 of 4** runs passed
- Founder intake (25,000 euro founding-year limit) (`demir-voicemail`): **1 of 4** runs passed

## Limits of this metric

- The rubric and the test cases were written by the builder, who knew the corpus. The holdout sets reduce, but do not remove, that bias.
- Structural checks confirm that the one-pager contains each required part and marks its figures; they cannot judge how persuasive the argument is.
- Fact checks use regular expressions: an answer can contain the right number and still reason badly. Failed and borderline answers were read in full.
- Expected sources match on any listed norm, so an answer can pass the source check while missing one of several needed norms.
- Model output varies between runs; latency and coverage move by several points on the free Gemini tier.
- The Loom, a quarter of the brief, is not scored until it is recorded.
