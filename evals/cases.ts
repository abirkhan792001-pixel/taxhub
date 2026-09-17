// Test cases for the live evaluation. Expected facts were checked against the ingested
// statute text (data/corpus.json) before being written down.

export type AskCase = {
  id: string;
  question: string;
  scope: "in" | "out"; // out = the corpus does not contain the answer
  expectSources?: string[]; // chunk id prefixes (e.g. "AO-149") or a session document title
  mustContain?: RegExp[];
  mustNotContain?: RegExp[];
  leadMustContain?: RegExp[]; // must appear in the short answer itself, not just somewhere in the details
  language?: "de" | "en";
  sessionDocs?: { title: string; text: string }[];
  history?: { role: "user" | "assistant"; text: string }[];
  note?: string;
};

export const ASK_CASES: AskCase[] = [
  {
    id: "deadline-2025-advised",
    question: "Bis wann muss die Einkommensteuererklärung 2025 abgegeben werden, wenn wir als Kanzlei sie erstellen?",
    scope: "in",
    expectSources: ["AO-149"],
    mustContain: [/1\.\s*März\s*2027|01\.03\.2027/],
    leadMustContain: [/1\.\s*März\s*2027|01\.03\.2027/],
    note: "§ 149 Abs. 3 AO: last day of February 2027 = Sunday → § 108 Abs. 3 AO → Monday 1 March 2027",
  },
  {
    id: "deadline-2025-unadvised",
    question: "Bis wann muss ein Mandant ohne Steuerberater seine Einkommensteuererklärung 2025 abgeben?",
    scope: "in",
    expectSources: ["AO-149"],
    mustContain: [/31\.\s*Juli\s*2026|31\.07\.2026/],
    leadMustContain: [/31\.\s*Juli\s*2026|31\.07\.2026/],
    note: "§ 149 Abs. 2 AO: seven months after the end of 2025 = Friday 31 July 2026",
  },
  {
    id: "objection-period",
    question: "Wie lange hat ein Mandant Zeit, gegen einen Steuerbescheid Einspruch einzulegen, und ab wann läuft die Frist?",
    scope: "in",
    expectSources: ["AO-355", "AO-122"],
    mustContain: [/eine[nm]?\s+Monat/i, /viert(en|e)\s+Tag|vier\s+Tage/i],
  },
  {
    id: "craftsman-cash",
    question: "Ein Mandant hat die Handwerkerrechnung für sein Bad bar bezahlt. Gibt es die Steuerermäßigung trotzdem?",
    scope: "in",
    expectSources: ["EStG-35a"],
    mustContain: [/\b(nein|nicht|keine)\b/i, /Konto|Überweisung|unbar/i],
  },
  {
    id: "late-filing-surcharge",
    question: "Wie hoch ist der Verspätungszuschlag bei einer verspäteten Einkommensteuererklärung?",
    scope: "in",
    expectSources: ["AO-152"],
    mustContain: [/0,25\s*(%|Prozent)/],
  },
  {
    id: "retention-receipts",
    question: "Wie lange müssen Buchungsbelege aufbewahrt werden?",
    scope: "in",
    expectSources: ["AO-147"],
    mustContain: [/\bacht\s+Jahre|\b8\s+Jahre/i],
    note: "§ 147 Abs. 3 AO in force: Buchungsbelege eight years (model memory often says ten)",
  },
  {
    id: "small-business-limits",
    question: "Welche Umsatzgrenzen gelten für die Kleinunternehmerregelung?",
    scope: "in",
    expectSources: ["UStG-19"],
    mustContain: [/25[.\s]?000/, /100[.\s]?000/],
  },
  {
    id: "small-business-founder",
    question: "Eine Mandantin hat sich im März selbstständig gemacht und erwartet 28.000 Euro Umsatz im ersten Jahr. Kann sie Kleinunternehmerin sein?",
    scope: "in",
    expectSources: ["KB-05-merkblatt-kleinunternehmer"],
    mustContain: [/25[.\s]?000/, /\b(nicht|nein|kein|keine|entfällt|endet)\b/i],
    note: "Firm note on BMF letter 18.03.2025: 25,000 euro limit in the founding year",
  },
  {
    id: "fee-income-tax-return",
    question: "Welche Gebühr dürfen wir für eine Einkommensteuererklärung ohne Ermittlung der Einkünfte abrechnen?",
    scope: "in",
    expectSources: ["StBVV-24"],
    mustContain: [/1\/10\s*(bis|–|-)\s*6\/10/],
  },
  {
    id: "firm-phone-guide",
    question: "Ein Mandant ruft wegen eines Bescheids an. Was muss das Sekretariat laut unserem Leitfaden tun?",
    scope: "in",
    expectSources: ["KB-01-fristenmanagement", "KB-04-telefonleitfaden"],
    mustContain: [/24\s*Stunden|Rückruf/i],
  },
  {
    id: "firm-fee-objection",
    question: "Wie rechnen wir einen Einspruch gegen einen Bescheid ab?",
    scope: "in",
    expectSources: ["KB-03-honorar", "StBVV-40"],
    mustContain: [/Rechtsanwaltsvergütungsgesetz|RVG|§\s*40\s*StBVV/],
  },
  {
    id: "english-late-fee",
    question: "How high is the late-filing surcharge, and when is it mandatory?",
    scope: "in",
    expectSources: ["AO-152", "AO-EN-152"],
    mustContain: [/0[.,]25\s*(%|per\s*cent|percent|Prozent)/i],
    language: "en",
  },
  {
    id: "follow-up-turn",
    question: "Und wenn der Mandant die Erklärung selbst abgibt, ohne Berater?",
    scope: "in",
    expectSources: ["AO-149"],
    mustContain: [/31\.\s*Juli\s*2026|31\.07\.2026/],
    leadMustContain: [/31\.\s*Juli\s*2026|31\.07\.2026/],
    history: [
      { role: "user", text: "Bis wann muss die Einkommensteuererklärung 2025 abgegeben werden, wenn wir als Kanzlei sie erstellen?" },
      { role: "assistant", text: "Die Einkommensteuererklärung 2025 muss bei Erstellung durch die Kanzlei bis Montag, 1. März 2027 abgegeben werden [1][7]." },
    ],
  },
  {
    id: "session-document",
    question: "Ein Mandant bittet per E-Mail um ein neues Passwort für das Mandantenportal. Was tun wir?",
    scope: "in",
    expectSources: ["Arbeitsanweisung Mandantenportal"],
    mustContain: [/Rückruf/i, /214|Okafor/],
    sessionDocs: [
      {
        title: "Arbeitsanweisung Mandantenportal",
        text: "Passwort-Rücksetzungen für das Mandantenportal erfolgen ausschließlich nach telefonischem Rückruf auf die im Mandantenstammblatt hinterlegte Nummer. Anfragen per E-Mail werden nicht direkt bearbeitet, sondern mit einem Rückruf beantwortet. Zuständig ist Frau Okafor (Durchwahl 214).",
      },
    ],
    note: "A document the system has never seen, pasted at runtime: proves the answers are not hardcoded",
  },
  {
    id: "out-inheritance-allowance",
    question: "Wie hoch ist der persönliche Freibetrag bei der Erbschaftsteuer für Kinder?",
    scope: "out",
    mustNotContain: [/400[.\s]?000/],
    note: "ErbStG is not ingested; the memorised answer (400,000 euro) must not appear",
  },
  {
    id: "out-case-law",
    question: "Welches BFH-Urteil hat zur Homeoffice-Pauschale bei gemischt genutzten Räumen entschieden? Bitte mit Aktenzeichen.",
    scope: "out",
    mustNotContain: [/\b(VI|VIII|IX|X|III)\s+R\s+\d+\/\d+/],
    note: "Case law is not ingested; no docket number may be invented",
  },
  {
    id: "out-nonexistent-norm",
    question: "Was regelt § 999 AO?",
    scope: "out",
    note: "The AO has no § 999",
  },
];

export type IntakeCase = {
  id: string;
  channel: "email" | "telefon" | "portal";
  message: string;
  expectCategory: string;
  expectDeadline: { bekanntgabe: string; fristende: string } | null;
  mustContain?: RegExp[]; // searched in summary + checklist
  draftMustNotContain?: RegExp[];
  note?: string;
};

export const INTAKE_CASES: IntakeCase[] = [
  {
    id: "brandt-objection",
    channel: "email",
    message:
      "Betreff: Steuerbescheid 2025 – das kann so nicht stimmen\n\nHallo Frau Weber,\n\ngestern kam mein Einkommensteuerbescheid für 2025, datiert auf den 3. September 2026. Das Finanzamt hat die Fahrtkosten und mein häusliches Arbeitszimmer nicht anerkannt, ich soll 1.840 € nachzahlen. Können Sie dagegen Einspruch einlegen? Ich bin ab dem 21.09. für zwei Wochen im Urlaub.\n\nViele Grüße\nThomas Brandt (Mandantennr. 10427)\n0171 2345678",
    expectCategory: "BESCHEID",
    expectDeadline: { bekanntgabe: "2026-09-07", fristende: "2026-10-07" },
    note: "Thu 3 Sep + 4 days = Mon 7 Sep; + 1 month = Wed 7 Oct",
  },
  {
    id: "weekend-notice",
    channel: "email",
    message:
      "Guten Tag, anbei die Info: Mein Einkommensteuerbescheid 2024 ist mit der Post gekommen, er ist vom 8. September 2026 datiert. Die Erstattung ist viel zu niedrig, bitte prüfen Sie, ob wir Einspruch einlegen sollten. Mit freundlichen Grüßen, Sabine Roth",
    expectCategory: "BESCHEID",
    expectDeadline: { bekanntgabe: "2026-09-14", fristende: "2026-10-14" },
    note: "Tue 8 Sep + 4 days = Sat 12 Sep → next working day Mon 14 Sep (§ 108 Abs. 3 AO); + 1 month = Wed 14 Oct",
  },
  {
    id: "undated-notice",
    channel: "email",
    message: "Hallo, ich habe einen Bescheid vom Finanzamt bekommen, weiß aber nicht mehr genau, von wann der ist. Muss ich da etwas machen? Gruß, Jonas Berg",
    expectCategory: "BESCHEID",
    expectDeadline: null,
    note: "No date given: no deadline may be invented",
  },
  {
    id: "demir-voicemail",
    channel: "telefon",
    message:
      "Ja hallo, hier ist Aylin Demir. Ich hab mich im März als Grafikdesignerin selbstständig gemacht und bisher noch gar nichts mit Steuern gemacht. Jetzt hab ich Post vom Finanzamt, so einen Fragebogen zur steuerlichen Erfassung, und ich weiß nicht, ob ich Kleinunternehmerin bin oder Umsatzsteuer zahlen muss. Umsatz dieses Jahr so ungefähr 28.000 Euro. Können Sie mich zurückrufen? 0152 9876543. Danke!",
    expectCategory: "NEUMANDAT",
    expectDeadline: null,
    mustContain: [/25[.\s]?000/],
    draftMustNotContain: [/Telefonat|Gespräch mit Ihnen|unserem Gespräch|angenehme/i],
  },
  {
    id: "schneider-documents",
    channel: "portal",
    message:
      "Hallo zusammen,\n\nwelche Unterlagen brauchen Sie von uns für die Steuererklärung 2025? Wir haben letztes Jahr eine Eigentumswohnung gekauft und vermieten sie seit Juli 2025. Außerdem gab es eine neue Küche in unserer eigenen Wohnung (Handwerker, bar bezahlt). Bis wann muss alles bei Ihnen sein?\n\nViele Grüße\nFamilie Schneider",
    expectCategory: "UNTERLAGEN",
    expectDeadline: null,
    mustContain: [/Überweisung|unbar|Konto|bar/i],
  },
  {
    id: "status-inquiry",
    channel: "email",
    message: "Guten Tag, ich wollte nachfragen, wann meine Steuererklärung 2025 fertig ist. Die Unterlagen habe ich im April hochgeladen. Viele Grüße, Petra Lindner",
    expectCategory: "STATUS",
    expectDeadline: null,
  },
  {
    id: "payroll-question",
    channel: "email",
    message: "Hallo, unsere neue Mitarbeiterin fängt am 1. Oktober an. Was brauchen Sie von uns für die Lohnabrechnung? Viele Grüße, Malerbetrieb Kowalski GmbH",
    expectCategory: "LOHN",
    expectDeadline: null,
  },
];

// Holdout questions, written after the product was built and never used for tuning.
// They check whether the assistant generalises beyond the cases above.
export const HOLDOUT_CASES: AskCase[] = [
  {
    id: "holdout-assessment-period",
    question: "Bis wann kann das Finanzamt die Einkommensteuer festsetzen, wenn die Erklärung im Jahr 2026 abgegeben wurde?",
    scope: "in",
    expectSources: ["AO-169", "AO-170"],
    mustContain: [/vier\s+Jahre|\b4\s+Jahre/i, /2030/],
    note: "§ 169 Abs. 2 Nr. 2 AO four years; § 170 Abs. 2 Nr. 1 AO starts at the end of 2026 → end of 2030",
  },
  {
    id: "holdout-home-office",
    question: "Wie viel kann ein Mandant für Tage im Homeoffice steuerlich ansetzen?",
    scope: "in",
    expectSources: ["EStG-4"],
    mustContain: [/\b6\s*(Euro|€)/, /1[.\s]?260/],
    note: "§ 4 Abs. 5 Satz 1 Nr. 6c EStG: 6 euro per day, at most 1,260 euro",
  },
  {
    id: "holdout-interest-rate",
    question: "Wie hoch sind die Nachzahlungszinsen nach § 233a AO?",
    scope: "in",
    expectSources: ["AO-238", "AO-233a"],
    mustContain: [/0,15\s*(%|Prozent)/],
    note: "§ 238 Abs. 1a AO: 0.15 percent per month",
  },
  {
    id: "holdout-english-assessment",
    question: "How long does the tax office have to assess income tax, and when does that period start?",
    scope: "in",
    expectSources: ["AO-169", "AO-170", "AO-EN-169", "AO-EN-170"],
    mustContain: [/four\s+years|\b4\s+years|vier\s+Jahre/i],
    language: "en",
  },
  {
    id: "holdout-out-small-invoice",
    question: "Bis zu welchem Betrag gilt eine Rechnung als Kleinbetragsrechnung?",
    scope: "out",
    mustNotContain: [/\b250\b/],
    note: "The threshold is in § 33 UStDV, which is not ingested; the memorised 250 euro must not appear",
  },
];

// Blind holdout v2: written after the fixes prompted by holdout v1, on topics not used anywhere else.
export const HOLDOUT_V2_CASES: AskCase[] = [
  {
    id: "blind-saver-allowance",
    question: "Wie hoch ist der Sparer-Pauschbetrag für eine alleinstehende Mandantin?",
    scope: "in",
    expectSources: ["EStG-20"],
    mustContain: [/1[.\s]?000\s*(Euro|€)/],
    note: "§ 20 Abs. 9 EStG: 1,000 euro",
  },
  {
    id: "blind-trade-tax-allowance",
    question: "Gibt es bei der Gewerbesteuer einen Freibetrag für einen Einzelunternehmer, und wie hoch ist er?",
    scope: "in",
    expectSources: ["GewStG-11"],
    mustContain: [/24[.\s]?500/],
    note: "§ 11 Abs. 1 GewStG: 24,500 euro for individuals and partnerships",
  },
  {
    id: "blind-vat-return-deadline",
    question: "Bis wann muss die Umsatzsteuer-Voranmeldung übermittelt werden?",
    scope: "in",
    expectSources: ["UStG-18"],
    mustContain: [/zehnten\s+Tag|10\.\s*Tag/i],
    note: "§ 18 Abs. 1 UStG: tenth day after the end of each pre-registration period",
  },
  {
    id: "blind-out-minimum-wage",
    question: "Wie hoch ist der gesetzliche Mindestlohn im Jahr 2026?",
    scope: "out",
    mustNotContain: [/\b1[2-4][,.]\d{2}\b/],
    note: "The Mindestlohngesetz is not ingested; no hourly rate may be stated",
  },
];
