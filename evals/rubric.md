# TaxHub Case Readiness Score

An evaluation metric derived line by line from the CITO case brief ("Vertical AI Hub, build it and sell it"). Each criterion quotes what the brief asks for, then defines how it is measured. Where possible the measurement is automated and reproducible (`npm run eval:all`); where judgement is needed, the rule for that judgement is written down here.

**Total: 100 points.** The Loom (25 points) can only be scored once it is recorded, so results are reported as *points earned / points assessable*.

| Block | Brief says | Points |
| --- | --- | --- |
| A | "Pick ONE beachhead vertical (convince us)" | 10 |
| B | "The build … a thin but real slice … deploy it live" | 40 |
| C | "The pitch … a Loom of five minutes or less … a sales call" | 25 (pending) |
| D | "A one-pager … every fact or number backed by a real source or clearly marked as your assumption" | 20 |
| E | "Use as much AI, tooling and automation as possible … Language: English … build something new" | 5 |

---

## A · Vertical choice (10)

> "Pick ONE beachhead vertical (convince us)" · one-pager: "why this vertical (market and structure, ICP, willingness to pay, the incumbent and where it leaves a gap)"

| ID | Criterion | Measure | Points |
| --- | --- | --- | --- |
| A1 | Market and structure argued with sourced figures | One-pager section present and contains ≥ 2 footnoted figures | 2.5 |
| A2 | ICP defined | Named size band, structure and buyer role present | 2.5 |
| A3 | Willingness to pay evidenced | Price anchor with a source or assumption marker | 2.5 |
| A4 | Incumbent and gap named | Incumbent named with a source and a gap stated | 2.5 |

## B · Build (40)

> "build a thin but real slice of the hub for that vertical, and deploy it live … ingest a set of that profession's real material … expose a grounded, source-cited assistant that a firm in that vertical would recognise as genuinely useful … Grounded in real content, with sources, not a hardcoded demo. Optional stretch: a proactive output (a drafted client email, a quote, a checklist)."

| ID | Criterion | Measure (automated) | Points |
| --- | --- | --- | --- |
| B1 | Live and shipped with a repo | All public routes return HTTP 200 (3); repository is public and its README links the live demo (2) | 5 |
| B2 | Real material, not a hardcoded demo | ≥ 5 official statutes ingested (3); an unseen document pasted at runtime is retrieved and cited (3); retrieval regression hit@8 ≥ 90 % (2) | 8 |
| B3 | Grounded and source-cited | Over in-scope questions: expected source retrieved (3), expected source cited (3), citation coverage of factual sentences, full points at ≥ 0.8 (3), no invalid citation numbers (3) | 12 |
| B4 | Honest when the sources are silent | Share of out-of-scope questions answered with an explicit "the sources don't cover this" and without the tempting memorised fact | 5 |
| B5 | Genuinely useful answers | Key-fact accuracy on in-scope questions (4); intake category accuracy (2) | 6 |
| B6 | Proactive output (stretch) | Objection deadline exactly right on dated cases (2); reply drafts pass quality checks: deadline date stated, no raw citation marks, no invented channel details (2) | 4 |

Quality flags reported with B, not scored: median answer latency (target ≤ 20 s), language match for English questions.

### How the automated metrics are defined

- **Factual sentence:** a sentence of ≥ 30 characters in the answer that is not a heading and not itself a statement that the sources are silent.
- **Citation coverage:** factual sentences containing at least one `[n]` ÷ all factual sentences (citations placed right after the full stop count for that sentence).
- **Citation validity:** every cited `[n]` exists in the source list returned with that answer.
- **Expected source:** the test case names the norm(s) or document(s) a correct answer must rest on (e.g. `AO-149`); retrieved = present in the returned sources; cited = one of those sources is cited.
- **Key facts:** per case, regular expressions that must appear (e.g. `1. März 2027`) and, for out-of-scope cases, facts that must *not* appear (e.g. the memorised ErbStG allowance).
- **Abstention:** the answer states that the provided sources do not contain the answer.

## C · Pitch / Loom (25, pending)

> "how you open, how you find the pain in the first sixty seconds, how you frame value in their numbers rather than in features, how you handle the moment where they push back, and how you close on a concrete next step. Speak to a human, not to a slide." · "five minutes or less" · "the Loom is the one part that has to be you"

| ID | Criterion | Points |
| --- | --- | --- |
| C1 | Opening earns attention and sets a time box | 4 |
| C2 | Pain found within the first 60 seconds, in the buyer's words | 6 |
| C3 | Value framed in the buyer's numbers, not features | 6 |
| C4 | Pushback handled (acknowledge, question, answer, proof) | 5 |
| C5 | Closes on a concrete next step with a date | 4 |

Hard gates: ≤ 5:00 duration; spoken by the candidate; speaking to a person, not presenting slides. Until recorded, only **readiness of the preparation** is checked (structure present, estimated duration ≤ 5:00, first pain question before 0:60, numbers in the value framing, dated next step) and reported without points.

## D · One-pager (20)

> "why this vertical …, what you would build first as the real product, and the first three moves in the first 30 days. Plus the three hardest objections you expect from that buyer, and your actual answer to each." · "every fact or number backed by a real source or clearly marked as your assumption"

| ID | Criterion | Measure | Points |
| --- | --- | --- | --- |
| D1 | Build-first section present | Section with a concrete product scope | 2 |
| D2 | First 30 days as exactly three moves | Three moves, each with a timeframe | 3 |
| D3 | Three hardest objections, each with an answer | Three objection/answer pairs | 3 |
| D4 | It is one page | Printable on one A4 page | 2 |
| D5 | Grounded, not invented | Numeric claims in the argument sections (vertical, ICP/WTP, incumbent, objections) that carry a footnote or an assumption marker ÷ all numeric claims there; full points at 100 %, linear | 10 |

## E · Rules of the case (5)

| ID | Criterion | Measure | Points |
| --- | --- | --- | --- |
| E1 | Built with Claude Code / AI tooling | Commits co-authored by Claude in the public history | 2 |
| E2 | Language English | Deliverables addressed to CITO are in English (the product UI is German for its German users) | 1 |
| E3 | Something new, not NOAH | Repository created for this case | 1 |
| E4 | Sent back | Reply with links sent to the CITO contact | 1 |

---

### Grading bands (for the assessable total)

| Share of assessable points | Reading |
| --- | --- |
| ≥ 90 % | Ready to send |
| 75–89 % | Send after fixing the named gaps |
| < 75 % | Not ready |
