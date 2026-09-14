# TaxHub – Kanzlei-Wissen mit Quellen

A thin but real slice of a vertical AI hub for **German tax advisory firms (Steuerberater)**, built with Claude Code for the CITO Entrepreneur-in-Residence case.

- **Live demo:** _link added after deploy_
- **One-pager** (why this vertical, what to build, first 30 days, objections): [`/one-pager`](src/app/one-pager/page.tsx) in the running app

## What it does

| Area | What a firm sees | What happens underneath |
| --- | --- | --- |
| **Wissen fragen** (Knowledge) | Ask in German or English: *"Bis wann muss die ESt-Erklärung 2025 abgegeben werden, wenn wir sie erstellen?"* Get a short answer where every statement carries a citation mark. Hovering a mark shows the statutory wording in the margin; one click opens the official text. | Planner model → German keyword queries + likely norms → BM25 retrieval over 3,457 passages → answer model restricted to the retrieved passages, forced to cite `[n]` or say the sources don't cover it. |
| **Posteingang** (Intake) | Paste a client e-mail, voicemail transcript or portal message. Get a case: category, urgency, the **objection deadline as a stamp with the full calculation trail**, a document checklist with citations, next steps (who/until when) and an editable reply draft. | The model extracts the letter date; the deadline itself is computed **deterministically** (§ 122 Abs. 2/2a AO fiction, § 108 Abs. 3 AO weekend/holiday shift, § 355 AO one month, § 188 BGB month end). The draft follows the firm's handbook (callback promises, four-eyes rule). |
| **Quellen** (Sources) | What the assistant knows, with official "Stand" dates and links. | Transparent index statistics per law. |
| **Own documents** | "+ Eigenes Dokument testen": paste an internal instruction and ask about it. | Chunked and searched for that session only (not stored), which shows the knowledge layer isn't a hard-coded demo. |

## Grounded in real content

The corpus is **built automatically from the official XML service of [gesetze-im-internet.de](https://www.gesetze-im-internet.de/)** (Federal Ministry of Justice / juris). Run `npm run ingest` to rebuild it:

| Source | Abbr. |
| --- | --- |
| Abgabenordnung | AO |
| Einführungsgesetz zur AO (incl. transitional filing deadlines, Art. 97 § 36) | EGAO |
| Einkommensteuergesetz | EStG |
| Umsatzsteuergesetz | UStG |
| Körperschaftsteuergesetz | KStG |
| Gewerbesteuergesetz | GewStG |
| Grundsteuergesetz | GrStG |
| Steuerberatungsgesetz | StBerG |
| Steuerberatervergütungsverordnung | StBVV |
| Fiscal Code, official English translation | AO (EN) |

Each § is split at Absatz boundaries into citable chunks carrying `ref` (e.g. `§ 149 Abs. 3, Teil 1/2 AO`), the official URL of that norm and the "Stand" date. Statutes are official works and not protected by copyright (§ 5 UrhG).

The **firm layer** (`knowledge/*.md`) is a handbook of the fictional *Kanzlei Muster*: deadline management, client FAQ on documents, fee policy and a phone guide for the front desk. It is sample content, labelled as such in the UI. It is there to show how a firm's own SOPs sit next to the law. Its statutory references were checked against the corpus. For example, the corpus showed that the lump-sum fee of the former § 14 StBVV has been repealed, so the sample policy was corrected.

## Design decisions

- **Lexical retrieval (BM25) instead of embeddings, for now.** Tax questions hinge on exact statutory terms and § numbers. BM25 with German normalisation (umlauts, light stemming, prefix matching for compounds such as *Einspruch → Einspruchsfrist*), reciprocal-rank fusion over the planner's queries and a direct lookup of explicitly named norms needs no vector database and is deterministic. It is also measurable: `npm run eval` gives hit@3 14/17 and hit@8 17/17 on practitioner queries. Hybrid retrieval with embeddings is the obvious next step.
- **Named norms only if they exist.** The planner may suggest "§ 149 AO", but a norm is used only if it is actually in the corpus. Invented paragraphs never reach the answer model.
- **The model never does date arithmetic.** It reads the date. Code computes the deadline, and every step is shown with its legal basis.
- **Law and firm policy are kept visibly apart** in prompts and UI ("Gesetzlich gilt … / Unsere Kanzleiregel …").
- **Human release by design.** Reply drafts are editable and marked as drafts; nothing is sent.

## Stack

Next.js 16 (App Router) · AI SDK 7 · Tailwind CSS 4 · deployed on Vercel (Hobby).

Model access is picked from the environment:

| Env var present | Provider | Default models (override with `PLANNER_MODEL` / `ANSWER_MODEL`) |
| --- | --- | --- |
| `GOOGLE_GENERATIVE_AI_API_KEY` (or `GEMINI_API_KEY` / `Gemini_API_Key`) | Gemini API directly (the free AI Studio tier needs no card) | `gemini-3.5-flash-lite` planner, `gemini-3.6-flash` answers |
| otherwise | Vercel AI Gateway | `anthropic/claude-haiku-4.5` planner, `anthropic/claude-sonnet-5` answers |

> The demo runs on the free Gemini tier, where Google may use prompts to improve its products. That is acceptable here because the demo only contains public statute text and fictional sample clients. A production deployment for real client data needs a paid, EU-hosted, zero-retention setup (see the one-pager, objection 3).

## Run locally

```bash
npm install
echo GOOGLE_GENERATIVE_AI_API_KEY=your-key > .env.local   # free key from aistudio.google.com
node --env-file=.env.local scripts/check-models.mjs      # which Gemini models this key can use
npm run dev
```

| Script | Purpose |
| --- | --- |
| `npm run ingest` | Rebuild `data/corpus.json` from gesetze-im-internet.de + `knowledge/` |
| `npm run eval` | Retrieval regression check (no API key needed) |
| `npm run check:deadlines` | Print deadline calculations for edge cases (weekends, Easter, 3 October) |
| `npx tsx scripts/try-query.ts "Frage" ["Suchbegriff" …]` | Inspect retrieval for a single question |

## Known limits (honest list)

- No administrative guidance yet (BMF letters, UStAE, AEAO), no case law. These are the next ingestion targets and change many practical answers.
- Holidays: only nationwide public holidays are considered for deadlines. Länder holidays are flagged, not computed.
- The English AO translation can lag behind the German text, and the UI says so.
- Single-tenant demo: no authentication, no persistence, no rate limiting, and pasted documents live only in the browser session.
- The firm handbook is sample content, not a real practice's SOPs.

Built with [Claude Code](https://claude.com/claude-code).
