"use client";

import Image from "next/image";
import Link from "next/link";
import { LegacyHashRedirect } from "@/components/landing/LegacyHashRedirect";
import { LangProvider, LangToggle, useLang } from "@/components/landing/lang";

// Photos: Vitaly Gariev on Unsplash (Unsplash License)
const HERO_PHOTO = "https://images.unsplash.com/photo-1714974528915-4c74c4c0bb27?auto=format&fit=crop&w=2400&q=80";
const CTA_PHOTO = "https://images.unsplash.com/photo-1738566061960-cd810b485d8e?auto=format&fit=crop&w=2000&q=80";

const LAWS = ["AO", "EGAO", "EStG", "UStG", "KStG", "GewStG", "GrStG", "StBerG", "StBVV"];

/* ----------------------------------------------------------- copy (de/en) */

const COPY = {
  de: {
    nav: { produkt: "Produkt", ablauf: "So funktioniert’s", pilot: "Pilot", faq: "FAQ", onePager: "One-Pager", demo: "Live-Demo" },
    mega: {
      bausteine: [
        ["Posteingang", "Wie wird aus einer Anfrage ein Vorgang?", "/app#posteingang"],
        ["Fristen", "Wann läuft die Frist wirklich ab?", "/app#posteingang"],
        ["Kanzlei-Wissen", "Woher kommt die Antwort?", "/app#wissen"],
      ],
      belege: [
        ["Quellen", "Auf welchem Gesetzestext arbeitet TaxHub?", "/app#quellen"],
        ["One-Pager", "Warum diese Vertikale, warum jetzt?", "/one-pager"],
      ],
      cardBadge: "Fristen-Check",
      cardTitle: "Fristende an einem Sonntag? TaxHub verschiebt korrekt.",
      cardLink: "Am Beispiel ansehen",
    },
    hero: {
      title: ["Das KI-Sekretariat", "für Ihre Steuerkanzlei."],
      lead: "TaxHub nimmt Mandantenanfragen entgegen, berechnet Fristen nachvollziehbar und beantwortet Fachfragen mit Fundstelle.",
      ctaPrimary: "Live-Demo starten",
      ctaSecondary: "Posteingang ansehen",
      badges: ["Jede Aussage mit Fundstelle", "Fristen nach §§ 108, 122, 355 AO berechnet", "Freigabe immer durch Ihr Team"],
    },
    strip: { label: "Arbeitet mit dem amtlichen Wortlaut", stand: "Stand 31.08.2026", handbook: "+ Ihr Kanzlei-Handbuch", cta: "One-Pager lesen" },
    modules: {
      eyebrow: "Produkt",
      title: "Was Ihr Sekretariat heute von Hand macht.",
      lead: "Drei Bausteine, die ineinandergreifen: vom ersten Kontakt des Mandanten bis zur fertigen, belegten Antwort – und immer mit Freigabe durch Ihr Team.",
      rows: [
        {
          eyebrow: "KI-Sekretariat",
          title: "Anfrage rein, Vorgang raus.",
          points: [
            "E-Mail, Anrufbeantworter oder Portalnachricht wird eingeordnet: Kategorie, Mandant, Steuerjahr, Dringlichkeit.",
            "Die Checkliste fehlender Unterlagen folgt Ihrem Handbuch – mit Fundstelle.",
            "Der Antwortentwurf liegt bereit und geht erst nach Freigabe raus.",
          ],
          cta: "Posteingang ausprobieren",
        },
        {
          eyebrow: "Fristen",
          title: "Die KI liest das Datum. Gerechnet wird mit Regeln.",
          points: [
            "Bekanntgabefiktion nach § 122 AO, Monatsfrist nach § 355 AO.",
            "Wochenende und bundesweite Feiertage verschieben das Fristende nach § 108 Abs. 3 AO.",
            "Jeder Schritt steht im Rechenweg – zum Gegenzeichnen im Vier-Augen-Prinzip.",
          ],
          cta: "Fristberechnung ansehen",
        },
        {
          eyebrow: "Kanzlei-Wissen",
          title: "Fragen Sie Gesetz und Handbuch zugleich.",
          points: [
            "Antworten aus AO, EStG, UStG, StBVV und weiteren Gesetzen im amtlichen Wortlaut.",
            "Ihre Arbeitsanweisungen und Merkblätter werden mitdurchsucht – sichtbar getrennt vom Gesetz.",
            "Gibt es keine Quelle, sagt TaxHub das, statt eine plausible Antwort zu erfinden.",
          ],
          cta: "Frage stellen",
        },
      ],
    },
    intake: {
      meta: "E-Mail · heute 08:14",
      quote: "„… mein Einkommensteuerbescheid für 2025, datiert auf den 3. September. Können Sie dagegen Einspruch einlegen? Ich bin ab dem 21.09. im Urlaub.“",
      tagKind: "BESCHEID",
      tagUrgency: "DRINGLICHKEIT MITTEL",
      caseTitle: "Einspruch gegen den ESt-Bescheid 2025",
      client: "Thomas Brandt · Nr. 10427",
      stampLabel: "Frist · Einspruch",
      stampDate: "07.10.2026",
      stampNote: "vorläufig",
      checklist: ["Bescheid als Scan anfordern", "Nachweise Fahrtkosten", "Nachweise häusliches Arbeitszimmer"],
    },
    deadline: {
      heading: "Rechenweg der Einspruchsfrist",
      steps: [
        ["Do., 03.09.2026", "Bescheid zur Post gegeben", "Angabe aus dem Bescheid"],
        ["Mo., 07.09.2026", "Bekanntgabe: vierter Tag nach Aufgabe zur Post", "§ 122 Abs. 2 AO"],
        ["Mi., 07.10.2026", "Einspruchsfrist: ein Monat nach Bekanntgabe", "§ 355 Abs. 1 AO"],
      ],
      note: ["Fällt ein Fristende auf Samstag, Sonntag oder einen Feiertag, endet es mit Ablauf des nächsten Werktags – etwa 28.02.2027 (Sonntag) → ", "01.03.2027", "."],
    },
    answer: {
      question: "Bis wann muss die ESt-Erklärung 2025 abgegeben werden, wenn wir sie erstellen?",
      pre: "Spätestens bis ",
      date: "Montag, 1. März 2027",
      mid: ". Das reguläre Fristende am 28. Februar 2027 fällt auf einen Sonntag und verschiebt sich auf den nächsten Werktag",
      end: ".",
      sources: [
        ["1", "§ 149 Abs. 3 AO", "Abgabe der Steuererklärungen"],
        ["7", "§ 108 AO", "Fristen und Termine"],
      ],
      sourceCta: "Amtlicher Text ↗",
    },
    process: {
      eyebrow: "So funktioniert’s",
      title: "Vom ersten Kontakt zur geprüften Antwort.",
      steps: [
        ["Anfrage kommt an", "Per E-Mail, Anrufbeantworter oder Mandantenportal – so, wie Mandanten Sie heute erreichen."],
        ["Einordnen und Frist rechnen", "Mandant, Steuerjahr und Dringlichkeit werden erkannt; Fristen rechnet TaxHub mit festen Regeln."],
        ["Belegen", "Checkliste, nächste Schritte und Einschätzung stützen sich auf Gesetz und Handbuch – mit Fundstelle."],
        ["Freigeben", "Ihr Team prüft den Entwurf und entscheidet. Nichts geht automatisch an den Mandanten."],
      ],
    },
    whyNow: {
      eyebrow: "Warum jetzt",
      title: "Das Wissen ist da. Die Hände fehlen.",
      lead: "Kanzleien verlieren Zeit nicht an der Steuerfrage, sondern an allem davor: Anrufe, Rückfragen, Fristen eintragen, Unterlagen nachfordern.",
      sourceLabel: "Quelle:",
      stats: [
        ["~40 %", "der offenen Stellen konnten Einzelpraxen zuletzt besetzen – Berufsausübungsgesellschaften knapp 70 %.", "BStBK, STAX 2024"],
        ["53,7", "Jahre beträgt das Durchschnittsalter der Steuerberaterinnen und Steuerberater.", "BStBK, Berufsstatistik 2025"],
        ["−1,3 %", "Ausbildungsverhältnisse zum Steuerfachangestellten gegenüber dem Vorjahr (17.081).", "BStBK, Berufsstatistik 2025"],
      ],
    },
    trust: {
      eyebrow: "Vertrauen",
      title: "Gebaut für Berufsträger, die haften.",
      items: [
        ["Keine erfundenen Paragrafen", "Vom Modell vorgeschlagene Normen werden nur verwendet, wenn es sie im amtlichen Text wirklich gibt."],
        ["Der Mensch gibt frei", "Antworten an Mandanten sind Entwürfe. Verbindlich wird nur, was Ihr Team prüft und versendet."],
        ["Nachvollziehbar bis zum Wortlaut", "Jede Aussage verweist auf ihre Fundstelle, jede Fundstelle auf den amtlichen Text mit Stand-Datum."],
      ],
      disclaimer:
        "Diese Demo arbeitet mit öffentlichen Gesetzestexten und der fiktiven Kanzlei Muster. Bitte keine echten Mandantendaten eingeben – für den Produktivbetrieb sind EU-Hosting und eine Dienstleistervereinbarung nach § 62a StBerG vorgesehen.",
    },
    pilot: {
      eyebrow: "Pilot-Vorschlag",
      title: "Vier Wochen auf Ihrem echten Posteingang.",
      lead: "Wir legen das Erfolgskriterium vorher gemeinsam fest – etwa den Anteil der Anfragen, die ohne Berufsträger vorbereitet werden. Wird es verfehlt, zahlen Sie nichts.",
      ctaPrimary: "Live-Demo starten",
      ctaSecondary: "One-Pager lesen",
    },
    faq: {
      eyebrow: "FAQ",
      title: "Was Kanzleiinhaber zuerst fragen.",
      items: [
        ["Ersetzt TaxHub DATEV?", "Nein. DATEV bleibt Ihr führendes System. TaxHub arbeitet den Posteingang ab, bevor jemand am Schreibtisch sitzt, und soll Vorgänge und Fristen in DATEV zurückschreiben – die Schnittstellen sind der nächste Ausbauschritt."],
        ["Was passiert, wenn die KI sich irrt?", "Nichts geht ohne Freigabe an den Mandanten. Fristen werden nicht vom Sprachmodell geschätzt, sondern mit festen Regeln berechnet und mit Rechenweg angezeigt. Jede Aussage trägt eine Fundstelle; fehlt eine Quelle, sagt TaxHub das."],
        ["Wie steht es um die Verschwiegenheit?", "§ 62a StBerG erlaubt die Einbindung von Dienstleistern mit Verschwiegenheitsvereinbarung in Textform. Für den Produktivbetrieb sind EU-Hosting, keine Verwendung Ihrer Daten für Modelltraining und ein Protokoll aller Vorgänge vorgesehen. Die Demo verarbeitet nur öffentliche Texte und fiktive Beispiele."],
        ["Woher kommt das Fachwissen?", "Aus den amtlichen XML-Fassungen auf gesetze-im-internet.de (AO, EGAO, EStG, UStG, KStG, GewStG, GrStG, StBerG, StBVV) und aus den internen Dokumenten Ihrer Kanzlei. BMF-Schreiben und Rechtsprechung sind die nächsten Quellen."],
        ["Was kostet TaxHub?", "Der Preis wird im Pilot festgelegt. Arbeitshypothese: ein Festpreis pro Kanzlei statt Preisen pro Anfrage – gemessen an der Arbeitszeit, die Ihr Team zurückgewinnt."],
      ],
    },
    footer: {
      tagline: "Demo-Projekt für die CITO Case Study (2026). Die Kanzlei Muster und alle Beispielanfragen sind fiktiv; Antworten ersetzen keine steuerliche Beratung.",
      links: [
        ["/app#wissen", "Wissen fragen"],
        ["/app#posteingang", "Posteingang"],
        ["/app#quellen", "Quellen"],
        ["/one-pager", "One-Pager"],
        ["https://github.com/abirkhan792001-pixel/taxhub", "GitHub"],
        ["https://www.gesetze-im-internet.de/", "gesetze-im-internet.de"],
      ],
      creditPre: "Fotos: Vitaly Gariev auf ",
      creditMid: ". Gesetzestexte: Bundesministerium der Justiz / juris.",
    },
    askAria: "Frage an TaxHub stellen",
  },
  en: {
    nav: { produkt: "Product", ablauf: "How it works", pilot: "Pilot", faq: "FAQ", onePager: "One-pager", demo: "Live demo" },
    mega: {
      bausteine: [
        ["Inbox", "How does a request become a case?", "/app#posteingang"],
        ["Deadlines", "When does the deadline really fall?", "/app#posteingang"],
        ["Firm knowledge", "Where does the answer come from?", "/app#wissen"],
      ],
      belege: [
        ["Sources", "Which statutes does TaxHub work from?", "/app#quellen"],
        ["One-pager", "Why this vertical, why now?", "/one-pager"],
      ],
      cardBadge: "Deadline check",
      cardTitle: "Deadline lands on a Sunday? TaxHub shifts it correctly.",
      cardLink: "See the example",
    },
    hero: {
      title: ["The AI back office", "for your tax firm."],
      lead: "TaxHub takes in client requests, computes deadlines you can trace, and answers technical questions with a citation.",
      ctaPrimary: "Start live demo",
      ctaSecondary: "See the inbox",
      badges: ["Every statement carries a citation", "Deadlines computed per §§ 108, 122, 355 AO", "Your team always signs off"],
    },
    strip: { label: "Works from the official statute text", stand: "As of 31 Aug 2026", handbook: "+ your firm handbook", cta: "Read the one-pager" },
    modules: {
      eyebrow: "Product",
      title: "What your back office does by hand today.",
      lead: "Three building blocks that work together: from the client's first contact to a finished, cited answer — always released by your team.",
      rows: [
        {
          eyebrow: "AI back office",
          title: "Request in, case out.",
          points: [
            "An e-mail, voicemail or portal message is sorted: category, client, tax year, urgency.",
            "The checklist of missing documents follows your handbook — with a citation.",
            "The reply draft is ready and only goes out after release.",
          ],
          cta: "Try the inbox",
        },
        {
          eyebrow: "Deadlines",
          title: "The AI reads the date. The rules do the math.",
          points: [
            "Deemed-service fiction under § 122 AO, one-month period under § 355 AO.",
            "Weekends and nationwide public holidays shift the deadline under § 108 (3) AO.",
            "Every step is shown in the calculation trail — to countersign under the four-eyes rule.",
          ],
          cta: "See the deadline math",
        },
        {
          eyebrow: "Firm knowledge",
          title: "Ask the law and your handbook at once.",
          points: [
            "Answers from AO, EStG, UStG, StBVV and other statutes in their official wording.",
            "Your work instructions and memos are searched too — kept visibly apart from the law.",
            "If there is no source, TaxHub says so instead of inventing a plausible answer.",
          ],
          cta: "Ask a question",
        },
      ],
    },
    intake: {
      meta: "E-mail · today 08:14",
      quote: "“… my 2025 income-tax assessment, dated 3 September. Can you file an objection? I'm on holiday from 21 Sept.”",
      tagKind: "ASSESSMENT",
      tagUrgency: "URGENCY MEDIUM",
      caseTitle: "Objection to the 2025 income-tax assessment",
      client: "Thomas Brandt · No. 10427",
      stampLabel: "Deadline · Objection",
      stampDate: "07 Oct 2026",
      stampNote: "provisional",
      checklist: ["Request assessment as a scan", "Proof of commuting costs", "Proof of home office"],
    },
    deadline: {
      heading: "How the objection deadline is calculated",
      steps: [
        ["Thu, 03 Sep 2026", "Assessment posted", "From the assessment"],
        ["Mon, 07 Sep 2026", "Deemed served: fourth day after posting", "§ 122 (2) AO"],
        ["Wed, 07 Oct 2026", "Objection period: one month after service", "§ 355 (1) AO"],
      ],
      note: ["If a deadline falls on a Saturday, Sunday or public holiday, it ends on the next working day — e.g. 28 Feb 2027 (Sunday) → ", "01 Mar 2027", "."],
    },
    answer: {
      question: "By when must the 2025 income-tax return be filed if we prepare it?",
      pre: "No later than ",
      date: "Monday, 1 March 2027",
      mid: ". The regular deadline of 28 February 2027 falls on a Sunday and moves to the next working day",
      end: ".",
      sources: [
        ["1", "§ 149 (3) AO", "Filing of tax returns"],
        ["7", "§ 108 AO", "Time limits and deadlines"],
      ],
      sourceCta: "Official text ↗",
    },
    process: {
      eyebrow: "How it works",
      title: "From first contact to a reviewed answer.",
      steps: [
        ["A request arrives", "By e-mail, voicemail or client portal — the way clients reach you today."],
        ["Sort and compute the deadline", "Client, tax year and urgency are recognised; TaxHub computes deadlines with fixed rules."],
        ["Cite", "The checklist, next steps and assessment rest on the law and your handbook — with a citation."],
        ["Release", "Your team reviews the draft and decides. Nothing goes to the client automatically."],
      ],
    },
    whyNow: {
      eyebrow: "Why now",
      title: "The knowledge is there. The hands are missing.",
      lead: "Firms don't lose time on the tax question itself, but on everything before it: calls, follow-ups, logging deadlines, chasing documents.",
      sourceLabel: "Source:",
      stats: [
        ["~40%", "of open positions could recently be filled by sole practices — professional partnerships nearly 70%.", "BStBK, STAX 2024"],
        ["53.7", "years is the average age of Germany's tax advisors.", "BStBK, professional statistics 2025"],
        ["−1.3%", "apprenticeships as tax clerks versus the prior year (17,081).", "BStBK, professional statistics 2025"],
      ],
    },
    trust: {
      eyebrow: "Trust",
      title: "Built for professionals who are liable.",
      items: [
        ["No invented paragraphs", "Norms the model suggests are used only if they actually exist in the official text."],
        ["A human releases", "Answers to clients are drafts. Only what your team reviews and sends becomes binding."],
        ["Traceable down to the wording", "Every statement points to its source, every source to the official text with an as-of date."],
      ],
      disclaimer:
        "This demo works with public statute texts and the fictional Kanzlei Muster. Please don't enter real client data — production use is planned with EU hosting and a service agreement under § 62a StBerG.",
    },
    pilot: {
      eyebrow: "Pilot proposal",
      title: "Four weeks on your real inbox.",
      lead: "We agree the success criterion up front — for example the share of requests prepared without a professional. If it's missed, you pay nothing.",
      ctaPrimary: "Start live demo",
      ctaSecondary: "Read the one-pager",
    },
    faq: {
      eyebrow: "FAQ",
      title: "What firm owners ask first.",
      items: [
        ["Does TaxHub replace DATEV?", "No. DATEV stays your system of record. TaxHub works through the inbox before anyone sits down at their desk, and is meant to write cases and deadlines back into DATEV — the interfaces are the next build step."],
        ["What happens if the AI is wrong?", "Nothing goes to the client without release. Deadlines aren't estimated by the language model but computed with fixed rules and shown with the calculation trail. Every statement carries a source; if one is missing, TaxHub says so."],
        ["What about confidentiality?", "§ 62a StBerG allows involving service providers under a confidentiality agreement in text form. Production use is planned with EU hosting, no use of your data for model training, and a log of every case. The demo processes only public texts and fictional examples."],
        ["Where does the expertise come from?", "From the official XML versions on gesetze-im-internet.de (AO, EGAO, EStG, UStG, KStG, GewStG, GrStG, StBerG, StBVV) and from your firm's internal documents. BMF letters and case law are the next sources."],
        ["What does TaxHub cost?", "The price is set during the pilot. Working hypothesis: a flat price per firm rather than per-request pricing — measured against the working time your team wins back."],
      ],
    },
    footer: {
      tagline: "Demo project for the CITO case study (2026). Kanzlei Muster and all sample requests are fictional; answers are no substitute for tax advice.",
      links: [
        ["/app#wissen", "Ask a question"],
        ["/app#posteingang", "Inbox"],
        ["/app#quellen", "Sources"],
        ["/one-pager", "One-pager"],
        ["https://github.com/abirkhan792001-pixel/taxhub", "GitHub"],
        ["https://www.gesetze-im-internet.de/", "gesetze-im-internet.de"],
      ],
      creditPre: "Photos: Vitaly Gariev on ",
      creditMid: ". Statute texts: Federal Ministry of Justice / juris.",
    },
    askAria: "Ask TaxHub a question",
  },
};

type Copy = typeof COPY.de;

function useCopy(): Copy {
  const { lang } = useLang();
  return COPY[lang];
}

/* ------------------------------------------------------------------ page */

export default function Landing() {
  return (
    <LangProvider>
      <LandingBody />
    </LangProvider>
  );
}

function LandingBody() {
  const t = useCopy();
  return (
    <div className="bg-sheet text-ink">
      <LegacyHashRedirect />
      <SiteNav />
      <Hero />
      <Modules />
      <Process />
      <WhyNow />
      <Trust />
      <PilotCta />
      <Faq />
      <Footer />
      <Link
        href="/app#wissen"
        aria-label={t.askAria}
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-pruef text-white shadow-[0_12px_30px_-10px_rgba(78,63,143,0.7)] transition-transform hover:scale-105 hover:bg-pruef-strong"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.2 3.6c-.5.4-1.3.1-1.3-.6V16A2.5 2.5 0 0 1 4 13.5v-8Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
          <path d="M8.5 8.5h7M8.5 11.5h4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      </Link>
    </div>
  );
}

/* ------------------------------------------------------------------- nav */

// Scaile-style white sticky bar with a hover mega-menu on the product entry.
function SiteNav() {
  const t = useCopy();
  const links: [string, string][] = [
    ["#ablauf", t.nav.ablauf],
    ["#pilot", t.nav.pilot],
    ["#faq", t.nav.faq],
  ];
  return (
    <header className="sticky top-0 z-50 border-b border-rule bg-sheet/95 backdrop-blur">
      <div className="mx-auto flex h-[74px] w-full max-w-[1280px] items-center gap-6 px-5 sm:px-10">
        <Link href="/" className="text-[1.6rem] font-bold lowercase tracking-[-0.04em] text-ink">
          taxhub
        </Link>

        <nav aria-label="Navigation" className="mx-auto hidden h-full items-center gap-1 lg:flex">
          <div className="group flex h-full items-center">
            <button className="flex h-full items-center gap-1.5 px-4 text-[1.02rem] text-ink-soft transition-colors group-hover:text-ink">
              {t.nav.produkt}
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden className="mt-0.5 transition-transform duration-200 group-hover:rotate-180">
                <path d="m2.5 4 3.5 3.5L9.5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <MegaMenu />
          </div>

          {links.map(([href, label]) => (
            <a key={href} href={href} className="flex h-full items-center px-4 text-[1.02rem] text-ink-soft transition-colors hover:text-ink">
              {label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3 lg:ml-0">
          <LangToggle />
          <Link href="/one-pager" className="hidden rounded-[6px] border border-rule px-5 py-2.5 text-[0.98rem] font-medium text-ink transition-colors hover:border-ink md:inline-block">
            {t.nav.onePager}
          </Link>
          <Link href="/app" className="rounded-[6px] bg-pruef px-5 py-2.5 text-[0.98rem] font-medium text-white transition-colors hover:bg-pruef-strong">
            {t.nav.demo}
          </Link>
        </div>
      </div>
    </header>
  );
}

function MegaMenu() {
  const t = useCopy();
  return (
    <div className="invisible absolute left-0 right-0 top-full z-40 -translate-y-1 border-t border-rule bg-sheet opacity-0 shadow-[0_28px_50px_-30px_rgba(28,26,36,0.45)] transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
      <div className="mx-auto grid w-full max-w-[1280px] grid-cols-[1fr_1fr_1.05fr] gap-0 px-10 py-12">
        <div className="flex flex-col gap-9 pr-10">
          {t.mega.bausteine.map(([title, sub, href]) => (
            <Link key={title} href={href} className="group/i block">
              <span className="block font-display text-[1.5rem] font-medium leading-tight text-ink transition-colors group-hover/i:text-pruef">{title}</span>
              <span className="mt-1 block text-[0.98rem] text-muted">{sub}</span>
            </Link>
          ))}
        </div>
        <div className="flex flex-col gap-9 border-l border-rule pl-10 pr-10">
          {t.mega.belege.map(([title, sub, href]) => (
            <Link key={title} href={href} className="group/i block">
              <span className="block font-display text-[1.5rem] font-medium leading-tight text-ink transition-colors group-hover/i:text-pruef">{title}</span>
              <span className="mt-1 block text-[0.98rem] text-muted">{sub}</span>
            </Link>
          ))}
        </div>
        <div className="border-l border-rule pl-10">
          <Link href="/app#posteingang" className="relative flex min-h-[15rem] flex-col justify-between overflow-hidden rounded-[10px] bg-hero p-6 text-white">
            <Image src={CTA_PHOTO} alt="" fill sizes="380px" className="-z-10 object-cover object-[50%_20%] opacity-45" />
            <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(22,17,13,0.25)_0%,rgba(22,17,13,0.82)_100%)]" />
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-3 py-1 font-mono text-[0.66rem] font-semibold uppercase tracking-[0.14em] backdrop-blur">
              {t.mega.cardBadge}
            </span>
            <div>
              <p className="font-display text-[1.5rem] font-medium leading-tight">{t.mega.cardTitle}</p>
              <span className="mt-3 inline-flex items-center gap-2 text-[0.95rem] font-medium">
                {t.mega.cardLink} <span aria-hidden>↗</span>
              </span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ hero */

function Hero() {
  const t = useCopy();
  return (
    <section className="relative isolate flex min-h-[calc(100svh-4.75rem)] flex-col overflow-hidden bg-hero text-white">
      <div className="absolute inset-y-0 right-0 -z-10 w-full lg:w-[70%] lg:[mask-image:linear-gradient(90deg,transparent_0%,#000_34%)]">
        <Image src={HERO_PHOTO} alt="Steuerberaterin im Flur ihrer Kanzlei" fill priority sizes="(min-width: 1024px) 70vw, 100vw" className="object-cover object-[50%_30%] lg:object-[32%_28%]" />
      </div>
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(22,17,13,0.74)_0%,rgba(22,17,13,0.5)_34%,rgba(22,17,13,0.2)_58%,rgba(22,17,13,0.04)_80%,rgba(22,17,13,0)_100%)] max-lg:bg-[linear-gradient(180deg,rgba(22,17,13,0.45)_0%,rgba(22,17,13,0.8)_58%,rgba(22,17,13,0.92)_100%)]"
      />

      <div className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col justify-center px-5 pb-16 pt-20 sm:px-10">
        <div className="max-w-[52rem]">
          <h1 className="font-display text-[clamp(2.3rem,4.8vw,3.9rem)] font-medium leading-[1.04] tracking-[-0.015em]">
            {t.hero.title[0]}
            <br />
            {t.hero.title[1]}
          </h1>
          <p className="mt-6 max-w-[34rem] text-[clamp(0.98rem,1.3vw,1.12rem)] leading-[1.55] text-white/85">{t.hero.lead}</p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            {/* split-arrow CTA */}
            <Link href="/app" className="group inline-flex items-stretch overflow-hidden rounded-[8px] bg-pruef text-white shadow-[0_10px_30px_-12px_rgba(78,63,143,0.8)] transition-colors hover:bg-pruef-strong">
              <span className="px-8 py-4 text-[1.05rem] font-medium">{t.hero.ctaPrimary}</span>
              <span className="flex w-14 items-center justify-center border-l border-white/20 transition-colors group-hover:bg-white/10">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </Link>
            <Link href="/app#posteingang" className="rounded-[8px] border border-white/35 px-8 py-4 text-[1.05rem] font-medium text-white transition-colors hover:border-white/70 hover:bg-white/5">
              {t.hero.ctaSecondary}
            </Link>
          </div>
        </div>

        <ul className="mt-12 flex max-w-[34rem] flex-col gap-2.5 font-mono text-[0.72rem] uppercase tracking-[0.08em] text-white/90">
          {t.hero.badges.map((b) => (
            <li key={b} className="flex items-center gap-2.5">
              <ShieldIcon />
              {b}
            </li>
          ))}
        </ul>
      </div>

      <HeroSourceStrip />
    </section>
  );
}

// Scaile's pinned "trusted by" strip — filled honestly with the statutes TaxHub is grounded in.
function HeroSourceStrip() {
  const t = useCopy();
  return (
    <div className="relative z-10 border-t border-white/10 bg-[rgba(9,8,7,0.5)] backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-3 px-5 py-4 sm:px-10 lg:flex-row lg:items-center lg:gap-8">
        <p className="shrink-0 max-w-[14rem] text-[0.84rem] font-medium leading-[1.3] text-white/85">
          {t.strip.label}
          <span className="mt-0.5 block font-mono text-[0.64rem] uppercase tracking-[0.1em] text-white/45">{t.strip.stand}</span>
        </p>
        <div className="marquee-mask min-w-0 flex-1 overflow-hidden">
          <div className="marquee-track flex w-max items-center gap-x-8">
            {[...LAWS, t.strip.handbook, ...LAWS, t.strip.handbook].map((l, i) =>
              l.startsWith("+") ? (
                <span key={`${l}-${i}`} className="shrink-0 rounded-full bg-white/10 px-3.5 py-1 font-mono text-[0.76rem] font-medium text-white/75">
                  {l}
                </span>
              ) : (
                <span key={`${l}-${i}`} className="shrink-0 font-mono text-[1.02rem] tracking-[0.01em] text-white/70">
                  {l}
                </span>
              ),
            )}
          </div>
        </div>
        <Link
          href="/one-pager"
          className="inline-flex shrink-0 items-center gap-2 self-start whitespace-nowrap rounded-[6px] border border-white/30 px-5 py-2.5 text-[0.92rem] font-medium text-white transition-colors hover:bg-white/10 lg:self-auto"
        >
          {t.strip.cta} <span aria-hidden>↗</span>
        </Link>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- modules */

function Modules() {
  const t = useCopy();
  const mocks = [<IntakeMock key="i" />, <DeadlineMock key="d" />, <AnswerMock key="a" />];
  const hrefs = ["/app#posteingang", "/app#posteingang", "/app#wissen"];
  return (
    <section id="produkt" className="bg-sheet">
      <div className="mx-auto w-full max-w-[1280px] px-5 pb-10 pt-24 sm:px-10">
        <SectionHead eyebrow={t.modules.eyebrow} title={t.modules.title} lead={t.modules.lead} />

        <div className="mt-20 flex flex-col gap-24">
          {t.modules.rows.map((row, i) => (
            <ModuleRow key={row.eyebrow} eyebrow={row.eyebrow} title={row.title} points={row.points} href={hrefs[i]} cta={row.cta} mock={mocks[i]} reverse={i === 1} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ModuleRow({ eyebrow, title, points, href, cta, mock, reverse = false }: { eyebrow: string; title: string; points: readonly string[]; href: string; cta: string; mock: React.ReactNode; reverse?: boolean }) {
  return (
    <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
      <div className={reverse ? "lg:order-2" : ""}>
        <p className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-pruef">{eyebrow}</p>
        <h3 className="mt-3 font-display text-[clamp(2.1rem,3.6vw,3rem)] font-medium leading-[1.05]">{title}</h3>
        <ul className="mt-7 flex flex-col gap-4">
          {points.map((p) => (
            <li key={p} className="flex gap-3.5 text-[1.02rem] leading-relaxed text-ink-soft">
              <CheckIcon />
              <span>{p}</span>
            </li>
          ))}
        </ul>
        <Link href={href} className="mt-8 inline-flex items-center gap-2 font-medium text-pruef hover:text-pruef-strong">
          {cta} <span aria-hidden>→</span>
        </Link>
      </div>
      <div className={reverse ? "lg:order-1" : ""}>
        <div className="rounded-[18px] bg-paper p-5 sm:p-8">{mock}</div>
      </div>
    </div>
  );
}

// Static previews built from real outputs of the live demo (sample case "Thomas Brandt", tax year 2025)
function IntakeMock() {
  const t = useCopy().intake;
  return (
    <div className="rounded-[12px] border border-rule bg-sheet p-5 shadow-[0_24px_60px_-40px_rgba(28,26,36,0.5)]">
      <p className="font-mono text-[0.68rem] uppercase tracking-[0.12em] text-muted">{t.meta}</p>
      <p className="mt-2 text-[0.92rem] leading-relaxed text-ink-soft">{t.quote}</p>
      <div className="my-4 border-t border-dashed border-rule" />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-md border border-ink px-1.5 py-0.5 font-mono text-[0.66rem] font-semibold tracking-[0.08em]">{t.tagKind}</span>
            <span className="rounded-md bg-marker px-1.5 py-0.5 font-mono text-[0.66rem] font-semibold tracking-[0.08em] text-pruef">{t.tagUrgency}</span>
          </div>
          <p className="mt-3 max-w-[18rem] font-display text-[1.35rem] font-medium leading-tight">{t.caseTitle}</p>
          <p className="mt-1 text-[0.8rem] text-muted">{t.client}</p>
        </div>
        <div className="stamp px-3.5 py-2 text-center">
          <p className="font-mono text-[0.56rem] font-semibold uppercase tracking-[0.22em]">{t.stampLabel}</p>
          <p className="font-mono text-[1.25rem] font-semibold leading-tight">{t.stampDate}</p>
          <p className="font-mono text-[0.58rem] uppercase tracking-[0.14em]">{t.stampNote}</p>
        </div>
      </div>
      <ul className="mt-4 flex flex-col gap-1.5 text-[0.84rem]">
        {t.checklist.map((c) => (
          <li key={c} className="flex items-center gap-2 text-ink-soft">
            <span className="h-3.5 w-3.5 rounded-[4px] border border-rule" aria-hidden />
            {c}
          </li>
        ))}
      </ul>
    </div>
  );
}

function DeadlineMock() {
  const t = useCopy().deadline;
  return (
    <div className="rounded-[12px] border border-rule bg-sheet p-5 shadow-[0_24px_60px_-40px_rgba(28,26,36,0.5)]">
      <p className="text-[0.9rem] font-medium">{t.heading}</p>
      <ol className="mt-4 flex flex-col">
        {t.steps.map(([date, label, basis]) => (
          <li key={date} className="grid grid-cols-[7.4rem_1fr] gap-3 border-t border-rule py-3 first:border-t-0 first:pt-0">
            <span className="font-mono text-[0.78rem] text-ink">{date}</span>
            <span className="text-[0.86rem]">
              {label}
              <span className="mt-0.5 block text-[0.74rem] text-pruef">{basis}</span>
            </span>
          </li>
        ))}
      </ol>
      <div className="mt-4 rounded-[8px] bg-pruef-wash px-3.5 py-2.5 text-[0.8rem] leading-relaxed text-pruef-strong">
        {t.note[0]}
        <strong>{t.note[1]}</strong>
        {t.note[2]}
      </div>
    </div>
  );
}

function AnswerMock() {
  const t = useCopy().answer;
  return (
    <div className="grid gap-3 sm:grid-cols-[1fr_12rem]">
      <div className="rounded-[12px] border border-rule bg-sheet p-5 shadow-[0_24px_60px_-40px_rgba(28,26,36,0.5)]">
        <p className="font-display text-[1.2rem] font-medium leading-snug">{t.question}</p>
        <p className="mt-3 text-[0.9rem] leading-relaxed text-ink-soft">
          {t.pre}
          <strong className="text-pruef-strong">{t.date}</strong>
          <Cite n={1} />
          <Cite n={7} />
          {t.mid}
          <Cite n={7} />
          {t.end}
        </p>
      </div>
      <div className="flex flex-col gap-3">
        {t.sources.map(([n, ref, title]) => (
          <div key={n} className="rounded-[10px] border border-rule bg-sheet px-3.5 py-3 text-[0.76rem] shadow-[0_18px_40px_-34px_rgba(28,26,36,0.5)]">
            <p className="font-mono">
              <span className="font-semibold text-pruef">{n}</span> {ref}
            </p>
            <p className="mt-0.5 text-muted">{title}</p>
            <p className="mt-2 text-right font-medium text-pruef">{t.sourceCta}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Cite({ n }: { n: number }) {
  return <span className="cite">{n}</span>;
}

/* --------------------------------------------------------------- process */

function Process() {
  const t = useCopy();
  return (
    <section id="ablauf" className="bg-paper">
      <div className="mx-auto w-full max-w-[1280px] px-5 py-24 sm:px-10">
        <SectionHead eyebrow={t.process.eyebrow} title={t.process.title} />
        <ol className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {t.process.steps.map(([title, text], i) => (
            <li key={title} className="rounded-[14px] border border-rule bg-sheet p-6">
              <span className="font-mono text-[0.78rem] font-semibold text-pruef">0{i + 1}</span>
              <p className="mt-4 font-display text-[1.6rem] font-medium leading-tight">{title}</p>
              <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-soft">{text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- why now */

function WhyNow() {
  const t = useCopy();
  return (
    <section className="bg-hero text-white">
      <div className="mx-auto w-full max-w-[1280px] px-5 py-24 sm:px-10">
        <div className="max-w-[44rem]">
          <p className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-white/60">{t.whyNow.eyebrow}</p>
          <h2 className="mt-3 font-display text-[clamp(2.3rem,4.4vw,3.6rem)] font-medium leading-[1.04]">{t.whyNow.title}</h2>
          <p className="mt-5 text-[1.05rem] leading-relaxed text-white/75">{t.whyNow.lead}</p>
        </div>
        <dl className="mt-16 grid gap-10 border-t border-white/15 pt-12 md:grid-cols-3">
          {t.whyNow.stats.map(([value, label, source]) => (
            <div key={value}>
              <dt className="font-display text-[clamp(3rem,5vw,4.2rem)] font-medium leading-none">{value}</dt>
              <dd className="mt-4 text-[0.98rem] leading-relaxed text-white/80">{label}</dd>
              <dd className="mt-3 font-mono text-[0.68rem] uppercase tracking-[0.1em] text-white/45">{t.whyNow.sourceLabel} {source}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------- trust */

function Trust() {
  const t = useCopy();
  return (
    <section className="bg-sheet">
      <div className="mx-auto w-full max-w-[1280px] px-5 py-24 sm:px-10">
        <SectionHead eyebrow={t.trust.eyebrow} title={t.trust.title} />
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {t.trust.items.map(([title, text]) => (
            <div key={title} className="rounded-[14px] border border-rule p-7">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-pruef-wash text-pruef">
                <ShieldIcon />
              </span>
              <p className="mt-5 font-display text-[1.6rem] font-medium leading-tight">{title}</p>
              <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-soft">{text}</p>
            </div>
          ))}
        </div>
        <p className="mx-auto mt-10 max-w-[48rem] text-center text-[0.85rem] leading-relaxed text-muted">{t.trust.disclaimer}</p>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------- pilot */

function PilotCta() {
  const t = useCopy();
  return (
    <section id="pilot" className="relative isolate overflow-hidden bg-hero text-white">
      <div className="absolute inset-y-0 right-0 -z-10 w-full lg:w-[58%] lg:[mask-image:linear-gradient(90deg,transparent_0%,#000_40%)]">
        <Image src={CTA_PHOTO} alt="Steuerberater in seinem Büro vor Aktenordnern" fill sizes="(min-width: 1024px) 58vw, 100vw" className="object-cover object-[50%_18%]" />
      </div>
      <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(22,17,13,0.95)_0%,rgba(22,17,13,0.8)_40%,rgba(22,17,13,0.2)_75%,rgba(22,17,13,0.05)_100%)] max-lg:bg-[rgba(22,17,13,0.8)]" />
      <div className="mx-auto w-full max-w-[1280px] px-5 py-28 sm:px-10">
        <div className="max-w-[40rem]">
          <p className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-white/60">{t.pilot.eyebrow}</p>
          <h2 className="mt-3 font-display text-[clamp(2.4rem,4.6vw,3.8rem)] font-medium leading-[1.02]">{t.pilot.title}</h2>
          <p className="mt-5 text-[1.08rem] leading-relaxed text-white/80">{t.pilot.lead}</p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Link href="/app" className="rounded-[8px] bg-pruef px-8 py-4 text-[1.05rem] font-medium text-white transition-colors hover:bg-pruef-strong">
              {t.pilot.ctaPrimary}
            </Link>
            <Link href="/one-pager" className="rounded-[8px] border border-white/35 px-8 py-4 text-[1.05rem] font-medium text-white transition-colors hover:border-white/70 hover:bg-white/5">
              {t.pilot.ctaSecondary}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------- faq */

function Faq() {
  const t = useCopy();
  return (
    <section id="faq" className="bg-paper">
      <div className="mx-auto grid w-full max-w-[1280px] gap-12 px-5 py-24 sm:px-10 lg:grid-cols-[22rem_1fr]">
        <div>
          <p className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-pruef">{t.faq.eyebrow}</p>
          <h2 className="mt-3 font-display text-[clamp(2.3rem,4vw,3.2rem)] font-medium leading-[1.04]">{t.faq.title}</h2>
        </div>
        <div className="divide-y divide-rule rounded-[14px] border border-rule bg-sheet">
          {t.faq.items.map(([q, a]) => (
            <details key={q} className="group px-6 py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-[1.08rem] font-medium">
                {q}
                <span aria-hidden className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-pruef-wash text-pruef transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 max-w-[48rem] text-[0.98rem] leading-relaxed text-ink-soft">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- footer */

function Footer() {
  const t = useCopy();
  return (
    <footer className="bg-hero text-white/70">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-10 px-5 py-14 sm:px-10 md:flex-row md:justify-between">
        <div className="max-w-[26rem]">
          <p className="text-[1.6rem] font-bold lowercase tracking-[-0.04em] text-white">taxhub</p>
          <p className="mt-3 text-[0.9rem] leading-relaxed">{t.footer.tagline}</p>
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-14 gap-y-3 text-[0.92rem]">
          {t.footer.links.map(([href, label]) => (
            <a key={label} href={href} className="hover:text-white">
              {label}
            </a>
          ))}
        </nav>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto w-full max-w-[1280px] px-5 py-5 text-[0.76rem] text-white/45 sm:px-10">
          {t.footer.creditPre}
          <a href="https://unsplash.com/" className="underline underline-offset-2 hover:text-white/70">
            Unsplash
          </a>
          {t.footer.creditMid}
        </p>
      </div>
    </footer>
  );
}

/* ---------------------------------------------------------------- shared */

function SectionHead({ eyebrow, title, lead }: { eyebrow: string; title: string; lead?: string }) {
  return (
    <div className="mx-auto max-w-[46rem] text-center">
      <p className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-pruef">{eyebrow}</p>
      <h2 className="mt-3 font-display text-[clamp(2.4rem,4.6vw,3.8rem)] font-medium leading-[1.02]">{title}</h2>
      {lead && <p className="mx-auto mt-5 max-w-[38rem] text-[1.08rem] leading-relaxed text-ink-soft">{lead}</p>}
    </div>
  );
}

function ShieldIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M8 1.5 2.75 3.5v4c0 3.1 2.2 5.9 5.25 7 3.05-1.1 5.25-3.9 5.25-7v-4L8 1.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="m5.6 8 1.7 1.7L10.6 6.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <span aria-hidden className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-pruef-wash text-pruef">
      <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
        <path d="m2.5 6.2 2.2 2.2 4.8-4.9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}
