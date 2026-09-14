import type { Metadata } from "next";
import Link from "next/link";
import "./one-pager.css";

export const metadata: Metadata = {
  title: "TaxHub – One-pager",
  description: "Why Steuerberater, what to build first, the first 30 days and the hardest objections.",
};

// [n] -> footnote marker
function S({ n }: { n: number | string }) {
  return <sup className="op-fn">{n}</sup>;
}
function A() {
  return <span className="op-assume" title="Assumption – not backed by a source">A</span>;
}

export default function OnePager() {
  return (
    <main className="op">
      <header className="op-head">
        <div>
          <p className="op-eyebrow">CITO case · Vertical AI Hub · Beachhead: Steuerberater</p>
          <h1>
            Tax<span>Hub</span> · the AI front office for tax practices
          </h1>
        </div>
        <p className="op-meta">
          Abir Khan · September 2026
          <br />
          Live MVP: taxhub · <Link href="/">open demo</Link>
        </p>
      </header>

      <p className="op-thesis">
        Tax practices don’t lack tax knowledge – DATEV and the publishers sell that. They lack hands: every client call, e-mail and Bescheid still passes a front desk the profession can no longer staff. TaxHub turns inbound client
        communication into a prepared, source-cited case that follows the firm’s own rules.
      </p>

      <div className="op-grid">
        <section>
          <h2>Why Steuerberater first</h2>
          <ul>
            <li>
              <b>Fragmented, reachable market.</b> 53,932 practices; 36,167 sole practices and 17,765 partnerships/companies (BAG). 89,549 Steuerberater, average age 53.7, 31.6% older than 60.
              <S n={1} />
            </li>
            <li>
              <b>The pain is staff, not software.</b> Sole practices filled only ~40% of open positions, BAGs ~70%
              <S n={2} />; trainee contracts fell again to 17,081 (−1.3%).
              <S n={1} />
            </li>
            <li>
              <b>Time saved becomes margin.</b> Median BAG revenue €1.27m (2023); 32.4% of fees already billed via free fee agreements instead of the StBVV schedule (13.5% in 2017).
              <S n={3} />
            </li>
            <li>
              <b>Built for grounding.</b> Deadline-driven text work on a public, machine-readable statute corpus; mistakes are costly, so “cited and checkable” is a buying criterion.
            </li>
            <li>
              <b>Why not Handwerk first:</b> bigger, but a thinner written corpus and lower software maturity. Steuerberater share one system (DATEV) and 21 chambers, so one sales motion repeats. <A />
            </li>
          </ul>

          <h2>ICP and willingness to pay</h2>
          <ul>
            <li>
              <b>ICP:</b> owner-managed BAG, 15–60 staff, on DATEV, 1–4 partners, 1–3 people on reception, open Steuerfachangestellte roles. Buyer: managing partner; champion: office manager. Roughly 5,000–7,000 practices (30–40% of BAGs; STAX average BAG ≈ 24–33 staff
              <S n={3} />
              ). <A />
            </li>
            <li>
              <b>They already pay for AI:</b> publisher research assistants cost up to €61–€232/month
              <S n={4} />. Adjacent proof: JUPUS charges law firms €97/user/month + €97 platform fee
              <S n={5} /> and reports 700+ firms.
              <S n={6} />
            </li>
            <li>
              <b>Price hypothesis:</b> €790/month per practice up to 20 seats, +€29/seat. <A /> Anchor: a Steuerfachangestellte earns a median ~€44k gross
              <S n={7} /> ≈ €4.4k/month with employer costs <A />. TaxHub pays for itself if it absorbs ~20% of one front-office FTE – the role firms can’t hire.
            </li>
          </ul>

          <h2>The incumbent and the gap</h2>
          <ul>
            <li>
              <b>DATEV</b> is the system of record: 40,296 members, €1.65bn revenue 2025
              <S n={8} />. Its Copilot (free licence) drafts texts, summarises documents and searches LEXinform when licensed
              <S n={9} /> – an assistant you go to, not a front desk that takes the call.
            </li>
            <li>
              <b>Publishers</b> (Haufe, NWB, Beck, Otto Schmidt, Stollfuß) answer from their commentary; most can’t ingest the firm’s own documents.
              <S n={4} /> <b>Phone bots</b> (from €29/month) turn calls into callback requests.
              <S n={10} />
            </li>
            <li className="op-gap">
              <b>Gap nobody owns:</b> “client writes or calls” → case prepared by the firm’s rules, with deadline, checklist and reply draft, written back to DATEV.
            </li>
          </ul>
        </section>

        <section>
          <h2>What I would build first</h2>
          <p>
            <b>Mandanten-Posteingang:</b> one queue for phone (voice AI), e-mail, portal and scanned post.
          </p>
          <ol>
            <li>Qualify each request against the firm’s handbook (category, client, tax year, urgency).</li>
            <li>Deterministic deadline engine (Einspruch, filing, Vorabanforderung) → DATEV deadline list, four-eyes sign-off.</li>
            <li>Answer routine requests from firm knowledge + statute, with sources; staff release every reply, and each approved answer grows the knowledge base.</li>
            <li>Write-back to DATEV DMS/tasks via DATEV’s partner interfaces (to validate). <A /></li>
          </ol>
          <p className="op-note">The live MVP already shows 2 and 3 on 3,440 statute passages plus a firm handbook. Not first: return preparation and bookkeeping – DATEV’s home turf.</p>

          <h2>First 30 days</h2>
          <ol className="op-moves">
            <li>
              <b>Days 1–10 · Measure the pain first.</b> 15 owner interviews (chamber events, DATEV Systempartner network), 2 front-desk shadowing days logging every inbound contact by type and minutes. Kill rule: under 30% routine → pivot to the Bescheid/deadline workflow.
            </li>
            <li>
              <b>Days 8–25 · Three paid design partners</b> (€400/month, credited to year 1) on their real inbox and handbook. Weekly scorecard: % prepared without an advisor, minutes saved, zero missed deadlines. § 62a StBerG contract, GDPR DPA, EU hosting.
            </li>
            <li>
              <b>Days 20–30 · Make it repeatable.</b> ROI case per partner, final pricing, DATEV partner application, one channel partner (chamber working group or Systemhaus), 2 LOIs.
            </li>
          </ol>

          <h2>Three hardest objections</h2>
          <dl className="op-obj">
            <dt>“DATEV just gave us Copilot for free.”</dt>
            <dd>Keep DATEV – TaxHub writes into it. Copilot helps whoever already sits at the desk; TaxHub works the inbound queue before anyone does, with your handbook and deadline rules. Four-week pilot on your inbox: miss the agreed target, you don’t pay.</dd>
            <dt>“One wrong deadline and it’s my liability.”</dt>
            <dd>Nothing reaches a client without staff release. Deadlines come from fixed rules with the full trail (§§ 122, 108, 355 AO) and your four-eyes rule; every statement cites its source or says none exists. Today’s error source is retyping at a busy front desk.</dd>
            <dt>“Client data in an AI – Verschwiegenheit?”</dt>
            <dd>
              § 62a StBerG allows service providers under a text-form confidentiality contract, abroad only with comparable protection
              <S n={11} /> → EU hosting, no training on your data, audit log. Open point for the chamber: when single-mandate processing needs client consent (§ 62a (5)).
            </dd>
          </dl>
        </section>
      </div>

      <footer className="op-sources">
        <p>
          <b>Sources</b> (accessed 14 Sep 2026) · <span className="op-assume">A</span> = my assumption, not sourced. <S n={1} /> BStBK, Berufsstatistik 2025 (as of 1 Jan 2026), bstbk.de · <S n={2} /> BStBK STAX 2024, reported by Haufe, 24 Jan 2025 ·{" "}
          <S n={3} /> BStBK STAX 2024, summary by tax &amp; bytes · <S n={4} /> tax &amp; bytes, market overview of 11 AI research tools for tax, Jan 2026 · <S n={5} /> jupus.de/preise · <S n={6} /> Deutsche Wirtschafts Nachrichten, citing FAZ · <S n={7} />{" "}
          Entgeltatlas (Bundesagentur für Arbeit) via stellenschmiede.de · <S n={8} /> DATEV press release, 27 Mar 2026 · <S n={9} /> datev.de, “DATEV Copilot: Das kann der KI-Assistent heute” · <S n={10} /> voice-one.ai/steuerberater · <S n={11} /> § 62a StBerG,
          gesetze-im-internet.de.
        </p>
      </footer>
    </main>
  );
}
