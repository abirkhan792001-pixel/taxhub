import Image from "next/image";
import Link from "next/link";
import { AnnouncementBar } from "@/components/landing/AnnouncementBar";
import { LegacyHashRedirect } from "@/components/landing/LegacyHashRedirect";

// Photos: Vitaly Gariev on Unsplash (Unsplash License)
const HERO_PHOTO = "https://images.unsplash.com/photo-1714974528915-4c74c4c0bb27?auto=format&fit=crop&w=2400&q=80";
const CTA_PHOTO = "https://images.unsplash.com/photo-1738566061960-cd810b485d8e?auto=format&fit=crop&w=2000&q=80";

const LAWS = ["AO", "EGAO", "EStG", "UStG", "KStG", "GewStG", "GrStG", "StBerG", "StBVV"];

export default function Landing() {
  return (
    <div className="bg-sheet text-ink">
      <LegacyHashRedirect />
      <AnnouncementBar />
      <Hero />
      <SourcesBand />
      <Modules />
      <Process />
      <WhyNow />
      <Trust />
      <PilotCta />
      <Faq />
      <Footer />
      <Link
        href="/app#wissen"
        aria-label="Frage an TaxHub stellen"
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

/* ---------------------------------------------------------------- hero */

function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-hero text-white">
      <div className="absolute inset-y-0 right-0 -z-10 w-full lg:w-[66%] lg:[mask-image:linear-gradient(90deg,transparent_0%,#000_38%)]">
        <Image src={HERO_PHOTO} alt="Steuerberaterin im Flur ihrer Kanzlei" fill priority sizes="(min-width: 1024px) 66vw, 100vw" className="object-cover object-[50%_30%] lg:object-[32%_28%]" />
      </div>
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(22,17,13,0.92)_0%,rgba(22,17,13,0.72)_36%,rgba(22,17,13,0.28)_58%,rgba(22,17,13,0.05)_80%,rgba(22,17,13,0)_100%)] max-lg:bg-[linear-gradient(180deg,rgba(22,17,13,0.55)_0%,rgba(22,17,13,0.85)_55%,rgba(22,17,13,0.95)_100%)]"
      />

      <div aria-hidden className="absolute inset-x-0 top-0 -z-10 h-44 bg-[linear-gradient(180deg,rgba(22,17,13,0.7)_0%,rgba(22,17,13,0)_100%)]" />

      <SiteNav />

      <div className="mx-auto flex min-h-[calc(100svh-7.5rem)] w-full max-w-[1280px] flex-col justify-center px-5 pb-10 pt-16 sm:px-10 lg:pt-10">
        <div className="max-w-[52rem]">
          <h1 className="font-display text-[clamp(2.9rem,6.2vw,5.1rem)] font-medium leading-[1] tracking-[-0.015em]">
            Das KI-Sekretariat
            <br />
            für Ihre Steuerkanzlei.
          </h1>
          <p className="mt-7 max-w-[38rem] text-[clamp(1.05rem,1.6vw,1.3rem)] leading-[1.6] text-white/85">
            TaxHub nimmt Mandantenanfragen entgegen, berechnet Fristen nachvollziehbar und beantwortet Fachfragen mit Fundstelle – aus dem amtlichen Gesetzestext und Ihrem Kanzlei-Handbuch.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/app" className="rounded-[8px] bg-pruef px-8 py-4 text-[1.05rem] font-medium text-white shadow-[0_10px_30px_-12px_rgba(78,63,143,0.8)] transition-colors hover:bg-pruef-strong">
              Live-Demo starten
            </Link>
            <Link href="/app#posteingang" className="rounded-[8px] border border-white/35 px-8 py-4 text-[1.05rem] font-medium text-white transition-colors hover:border-white/70 hover:bg-white/5">
              Posteingang ansehen
            </Link>
          </div>
        </div>

        <ul className="mt-16 flex flex-wrap gap-x-9 gap-y-3 font-mono text-[0.74rem] uppercase tracking-[0.08em] text-white/90">
          {["Jede Aussage mit Fundstelle", "Fristen nach §§ 108, 122, 355 AO berechnet", "Freigabe immer durch Ihr Team"].map((t) => (
            <li key={t} className="flex items-center gap-2.5">
              <ShieldIcon />
              {t}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function SiteNav() {
  const links = [
    ["#produkt", "Produkt"],
    ["#ablauf", "So funktioniert’s"],
    ["#quellen", "Quellen"],
    ["#pilot", "Pilot"],
    ["#faq", "FAQ"],
  ];
  return (
    <header className="mx-auto flex w-full max-w-[1280px] items-center justify-between gap-6 px-5 py-6 sm:px-10">
      <Link href="/" className="text-[1.75rem] font-bold lowercase tracking-[-0.04em] text-white">
        taxhub
      </Link>
      <nav aria-label="Hauptnavigation" className="hidden items-center gap-9 text-[1rem] text-white/85 lg:flex">
        {links.map(([href, label]) => (
          <a key={href} href={href} className="transition-colors hover:text-white">
            {label}
          </a>
        ))}
      </nav>
      <div className="flex items-center gap-6">
        <Link href="/one-pager" className="hidden text-[1rem] text-white/85 transition-colors hover:text-white sm:inline">
          One-Pager
        </Link>
        <Link href="/app" className="rounded-[8px] bg-pruef px-5 py-3 text-[0.98rem] font-medium text-white transition-colors hover:bg-pruef-strong">
          Live-Demo
        </Link>
      </div>
    </header>
  );
}

/* ---------------------------------------------------------------- sources */

function SourcesBand() {
  return (
    <section id="quellen" className="border-b border-rule bg-sheet">
      <div className="mx-auto w-full max-w-[1280px] px-5 py-12 sm:px-10">
        <p className="text-center font-mono text-[0.72rem] uppercase tracking-[0.14em] text-muted">Arbeitet mit dem amtlichen Wortlaut · gesetze-im-internet.de · Stand 31.08.2026</p>
        <ul className="mt-7 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {LAWS.map((l) => (
            <li key={l} className="font-display text-[1.9rem] font-medium tracking-[0.01em] text-ink/45">
              {l}
            </li>
          ))}
          <li className="rounded-full bg-pruef-wash px-4 py-1.5 text-[0.9rem] font-medium text-pruef">+ Ihr Kanzlei-Handbuch</li>
        </ul>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- modules */

function Modules() {
  return (
    <section id="produkt" className="bg-sheet">
      <div className="mx-auto w-full max-w-[1280px] px-5 pb-10 pt-24 sm:px-10">
        <SectionHead
          eyebrow="Produkt"
          title="Was Ihr Sekretariat heute von Hand macht."
          lead="Drei Bausteine, die ineinandergreifen: vom ersten Kontakt des Mandanten bis zur fertigen, belegten Antwort – und immer mit Freigabe durch Ihr Team."
        />

        <div className="mt-20 flex flex-col gap-24">
          <ModuleRow
            eyebrow="KI-Sekretariat"
            title="Anfrage rein, Vorgang raus."
            points={[
              "E-Mail, Anrufbeantworter oder Portalnachricht wird eingeordnet: Kategorie, Mandant, Steuerjahr, Dringlichkeit.",
              "Die Checkliste fehlender Unterlagen folgt Ihrem Handbuch – mit Fundstelle.",
              "Der Antwortentwurf liegt bereit und geht erst nach Freigabe raus.",
            ]}
            href="/app#posteingang"
            cta="Posteingang ausprobieren"
            mock={<IntakeMock />}
          />
          <ModuleRow
            reverse
            eyebrow="Fristen"
            title="Die KI liest das Datum. Gerechnet wird mit Regeln."
            points={[
              "Bekanntgabefiktion nach § 122 AO, Monatsfrist nach § 355 AO.",
              "Wochenende und bundesweite Feiertage verschieben das Fristende nach § 108 Abs. 3 AO.",
              "Jeder Schritt steht im Rechenweg – zum Gegenzeichnen im Vier-Augen-Prinzip.",
            ]}
            href="/app#posteingang"
            cta="Fristberechnung ansehen"
            mock={<DeadlineMock />}
          />
          <ModuleRow
            eyebrow="Kanzlei-Wissen"
            title="Fragen Sie Gesetz und Handbuch zugleich."
            points={[
              "Antworten aus AO, EStG, UStG, StBVV und weiteren Gesetzen im amtlichen Wortlaut.",
              "Ihre Arbeitsanweisungen und Merkblätter werden mitdurchsucht – sichtbar getrennt vom Gesetz.",
              "Gibt es keine Quelle, sagt TaxHub das, statt eine plausible Antwort zu erfinden.",
            ]}
            href="/app#wissen"
            cta="Frage stellen"
            mock={<AnswerMock />}
          />
        </div>
      </div>
    </section>
  );
}

function ModuleRow({ eyebrow, title, points, href, cta, mock, reverse = false }: { eyebrow: string; title: string; points: string[]; href: string; cta: string; mock: React.ReactNode; reverse?: boolean }) {
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
  return (
    <div className="rounded-[12px] border border-rule bg-sheet p-5 shadow-[0_24px_60px_-40px_rgba(28,26,36,0.5)]">
      <p className="font-mono text-[0.68rem] uppercase tracking-[0.12em] text-muted">E-Mail · heute 08:14</p>
      <p className="mt-2 text-[0.92rem] leading-relaxed text-ink-soft">„… mein Einkommensteuerbescheid für 2025, datiert auf den 3. September. Können Sie dagegen Einspruch einlegen? Ich bin ab dem 21.09. im Urlaub.“</p>
      <div className="my-4 border-t border-dashed border-rule" />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-md border border-ink px-1.5 py-0.5 font-mono text-[0.66rem] font-semibold tracking-[0.08em]">BESCHEID</span>
            <span className="rounded-md bg-marker px-1.5 py-0.5 font-mono text-[0.66rem] font-semibold tracking-[0.08em] text-pruef">DRINGLICHKEIT MITTEL</span>
          </div>
          <p className="mt-3 max-w-[18rem] font-display text-[1.35rem] font-medium leading-tight">Einspruch gegen den ESt-Bescheid 2025</p>
          <p className="mt-1 text-[0.8rem] text-muted">Thomas Brandt · Nr. 10427</p>
        </div>
        <div className="stamp px-3.5 py-2 text-center">
          <p className="font-mono text-[0.56rem] font-semibold uppercase tracking-[0.22em]">Frist · Einspruch</p>
          <p className="font-mono text-[1.25rem] font-semibold leading-tight">07.10.2026</p>
          <p className="font-mono text-[0.58rem] uppercase tracking-[0.14em]">vorläufig</p>
        </div>
      </div>
      <ul className="mt-4 flex flex-col gap-1.5 text-[0.84rem]">
        {["Bescheid als Scan anfordern", "Nachweise Fahrtkosten", "Nachweise häusliches Arbeitszimmer"].map((t) => (
          <li key={t} className="flex items-center gap-2 text-ink-soft">
            <span className="h-3.5 w-3.5 rounded-[4px] border border-rule" aria-hidden />
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}

function DeadlineMock() {
  const steps = [
    ["Do., 03.09.2026", "Bescheid zur Post gegeben", "Angabe aus dem Bescheid"],
    ["Mo., 07.09.2026", "Bekanntgabe: vierter Tag nach Aufgabe zur Post", "§ 122 Abs. 2 AO"],
    ["Mi., 07.10.2026", "Einspruchsfrist: ein Monat nach Bekanntgabe", "§ 355 Abs. 1 AO"],
  ];
  return (
    <div className="rounded-[12px] border border-rule bg-sheet p-5 shadow-[0_24px_60px_-40px_rgba(28,26,36,0.5)]">
      <p className="text-[0.9rem] font-medium">Rechenweg der Einspruchsfrist</p>
      <ol className="mt-4 flex flex-col">
        {steps.map(([date, label, basis]) => (
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
        Fällt ein Fristende auf Samstag, Sonntag oder einen Feiertag, endet es mit Ablauf des nächsten Werktags – etwa 28.02.2027 (Sonntag) → <strong>01.03.2027</strong>.
      </div>
    </div>
  );
}

function AnswerMock() {
  return (
    <div className="grid gap-3 sm:grid-cols-[1fr_12rem]">
      <div className="rounded-[12px] border border-rule bg-sheet p-5 shadow-[0_24px_60px_-40px_rgba(28,26,36,0.5)]">
        <p className="font-display text-[1.2rem] font-medium leading-snug">Bis wann muss die ESt-Erklärung 2025 abgegeben werden, wenn wir sie erstellen?</p>
        <p className="mt-3 text-[0.9rem] leading-relaxed text-ink-soft">
          Spätestens bis <strong className="text-pruef-strong">Montag, 1. März 2027</strong>
          <Cite n={1} />
          <Cite n={7} />. Das reguläre Fristende am 28. Februar 2027 fällt auf einen Sonntag und verschiebt sich auf den nächsten Werktag
          <Cite n={7} />.
        </p>
      </div>
      <div className="flex flex-col gap-3">
        {[
          ["1", "§ 149 Abs. 3 AO", "Abgabe der Steuererklärungen"],
          ["7", "§ 108 AO", "Fristen und Termine"],
        ].map(([n, ref, title]) => (
          <div key={n} className="rounded-[10px] border border-rule bg-sheet px-3.5 py-3 text-[0.76rem] shadow-[0_18px_40px_-34px_rgba(28,26,36,0.5)]">
            <p className="font-mono">
              <span className="font-semibold text-pruef">{n}</span> {ref}
            </p>
            <p className="mt-0.5 text-muted">{title}</p>
            <p className="mt-2 text-right font-medium text-pruef">Amtlicher Text ↗</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Cite({ n }: { n: number }) {
  return <span className="cite">{n}</span>;
}

/* ---------------------------------------------------------------- process */

function Process() {
  const steps = [
    ["Anfrage kommt an", "Per E-Mail, Anrufbeantworter oder Mandantenportal – so, wie Mandanten Sie heute erreichen."],
    ["Einordnen und Frist rechnen", "Mandant, Steuerjahr und Dringlichkeit werden erkannt; Fristen rechnet TaxHub mit festen Regeln."],
    ["Belegen", "Checkliste, nächste Schritte und Einschätzung stützen sich auf Gesetz und Handbuch – mit Fundstelle."],
    ["Freigeben", "Ihr Team prüft den Entwurf und entscheidet. Nichts geht automatisch an den Mandanten."],
  ];
  return (
    <section id="ablauf" className="bg-paper">
      <div className="mx-auto w-full max-w-[1280px] px-5 py-24 sm:px-10">
        <SectionHead eyebrow="So funktioniert’s" title="Vom ersten Kontakt zur geprüften Antwort." />
        <ol className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map(([title, text], i) => (
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

/* ---------------------------------------------------------------- why now */

function WhyNow() {
  const stats = [
    ["~40 %", "der offenen Stellen konnten Einzelpraxen zuletzt besetzen – Berufsausübungsgesellschaften knapp 70 %.", "BStBK, STAX 2024"],
    ["53,7", "Jahre beträgt das Durchschnittsalter der Steuerberaterinnen und Steuerberater.", "BStBK, Berufsstatistik 2025"],
    ["−1,3 %", "Ausbildungsverhältnisse zum Steuerfachangestellten gegenüber dem Vorjahr (17.081).", "BStBK, Berufsstatistik 2025"],
  ];
  return (
    <section className="bg-hero text-white">
      <div className="mx-auto w-full max-w-[1280px] px-5 py-24 sm:px-10">
        <div className="max-w-[44rem]">
          <p className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-white/60">Warum jetzt</p>
          <h2 className="mt-3 font-display text-[clamp(2.3rem,4.4vw,3.6rem)] font-medium leading-[1.04]">Das Wissen ist da. Die Hände fehlen.</h2>
          <p className="mt-5 text-[1.05rem] leading-relaxed text-white/75">Kanzleien verlieren Zeit nicht an der Steuerfrage, sondern an allem davor: Anrufe, Rückfragen, Fristen eintragen, Unterlagen nachfordern.</p>
        </div>
        <dl className="mt-16 grid gap-10 border-t border-white/15 pt-12 md:grid-cols-3">
          {stats.map(([value, label, source]) => (
            <div key={value}>
              <dt className="font-display text-[clamp(3rem,5vw,4.2rem)] font-medium leading-none">{value}</dt>
              <dd className="mt-4 text-[0.98rem] leading-relaxed text-white/80">{label}</dd>
              <dd className="mt-3 font-mono text-[0.68rem] uppercase tracking-[0.1em] text-white/45">Quelle: {source}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- trust */

function Trust() {
  const items = [
    ["Keine erfundenen Paragrafen", "Vom Modell vorgeschlagene Normen werden nur verwendet, wenn es sie im amtlichen Text wirklich gibt."],
    ["Der Mensch gibt frei", "Antworten an Mandanten sind Entwürfe. Verbindlich wird nur, was Ihr Team prüft und versendet."],
    ["Nachvollziehbar bis zum Wortlaut", "Jede Aussage verweist auf ihre Fundstelle, jede Fundstelle auf den amtlichen Text mit Stand-Datum."],
  ];
  return (
    <section className="bg-sheet">
      <div className="mx-auto w-full max-w-[1280px] px-5 py-24 sm:px-10">
        <SectionHead eyebrow="Vertrauen" title="Gebaut für Berufsträger, die haften." />
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {items.map(([title, text]) => (
            <div key={title} className="rounded-[14px] border border-rule p-7">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-pruef-wash text-pruef">
                <ShieldIcon />
              </span>
              <p className="mt-5 font-display text-[1.6rem] font-medium leading-tight">{title}</p>
              <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-soft">{text}</p>
            </div>
          ))}
        </div>
        <p className="mx-auto mt-10 max-w-[48rem] text-center text-[0.85rem] leading-relaxed text-muted">
          Diese Demo arbeitet mit öffentlichen Gesetzestexten und der fiktiven Kanzlei Muster. Bitte keine echten Mandantendaten eingeben – für den Produktivbetrieb sind EU-Hosting und eine Dienstleistervereinbarung nach § 62a StBerG vorgesehen.
        </p>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- pilot */

function PilotCta() {
  return (
    <section id="pilot" className="relative isolate overflow-hidden bg-hero text-white">
      <div className="absolute inset-y-0 right-0 -z-10 w-full lg:w-[58%] lg:[mask-image:linear-gradient(90deg,transparent_0%,#000_40%)]">
        <Image src={CTA_PHOTO} alt="Steuerberater in seinem Büro vor Aktenordnern" fill sizes="(min-width: 1024px) 58vw, 100vw" className="object-cover object-[50%_18%]" />
      </div>
      <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(22,17,13,0.95)_0%,rgba(22,17,13,0.8)_40%,rgba(22,17,13,0.2)_75%,rgba(22,17,13,0.05)_100%)] max-lg:bg-[rgba(22,17,13,0.8)]" />
      <div className="mx-auto w-full max-w-[1280px] px-5 py-28 sm:px-10">
        <div className="max-w-[40rem]">
          <p className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-white/60">Pilot-Vorschlag</p>
          <h2 className="mt-3 font-display text-[clamp(2.4rem,4.6vw,3.8rem)] font-medium leading-[1.02]">Vier Wochen auf Ihrem echten Posteingang.</h2>
          <p className="mt-5 text-[1.08rem] leading-relaxed text-white/80">Wir legen das Erfolgskriterium vorher gemeinsam fest – etwa den Anteil der Anfragen, die ohne Berufsträger vorbereitet werden. Wird es verfehlt, zahlen Sie nichts.</p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Link href="/app" className="rounded-[8px] bg-pruef px-8 py-4 text-[1.05rem] font-medium text-white transition-colors hover:bg-pruef-strong">
              Live-Demo starten
            </Link>
            <Link href="/one-pager" className="rounded-[8px] border border-white/35 px-8 py-4 text-[1.05rem] font-medium text-white transition-colors hover:border-white/70 hover:bg-white/5">
              One-Pager lesen
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- faq */

function Faq() {
  const faqs = [
    ["Ersetzt TaxHub DATEV?", "Nein. DATEV bleibt Ihr führendes System. TaxHub arbeitet den Posteingang ab, bevor jemand am Schreibtisch sitzt, und soll Vorgänge und Fristen in DATEV zurückschreiben – die Schnittstellen sind der nächste Ausbauschritt."],
    ["Was passiert, wenn die KI sich irrt?", "Nichts geht ohne Freigabe an den Mandanten. Fristen werden nicht vom Sprachmodell geschätzt, sondern mit festen Regeln berechnet und mit Rechenweg angezeigt. Jede Aussage trägt eine Fundstelle; fehlt eine Quelle, sagt TaxHub das."],
    ["Wie steht es um die Verschwiegenheit?", "§ 62a StBerG erlaubt die Einbindung von Dienstleistern mit Verschwiegenheitsvereinbarung in Textform. Für den Produktivbetrieb sind EU-Hosting, keine Verwendung Ihrer Daten für Modelltraining und ein Protokoll aller Vorgänge vorgesehen. Die Demo verarbeitet nur öffentliche Texte und fiktive Beispiele."],
    ["Woher kommt das Fachwissen?", "Aus den amtlichen XML-Fassungen auf gesetze-im-internet.de (AO, EGAO, EStG, UStG, KStG, GewStG, GrStG, StBerG, StBVV) und aus den internen Dokumenten Ihrer Kanzlei. BMF-Schreiben und Rechtsprechung sind die nächsten Quellen."],
    ["Was kostet TaxHub?", "Der Preis wird im Pilot festgelegt. Arbeitshypothese: ein Festpreis pro Kanzlei statt Preisen pro Anfrage – gemessen an der Arbeitszeit, die Ihr Team zurückgewinnt."],
  ];
  return (
    <section id="faq" className="bg-paper">
      <div className="mx-auto grid w-full max-w-[1280px] gap-12 px-5 py-24 sm:px-10 lg:grid-cols-[22rem_1fr]">
        <div>
          <p className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-pruef">FAQ</p>
          <h2 className="mt-3 font-display text-[clamp(2.3rem,4vw,3.2rem)] font-medium leading-[1.04]">Was Kanzleiinhaber zuerst fragen.</h2>
        </div>
        <div className="divide-y divide-rule rounded-[14px] border border-rule bg-sheet">
          {faqs.map(([q, a]) => (
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
  return (
    <footer className="bg-hero text-white/70">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-10 px-5 py-14 sm:px-10 md:flex-row md:justify-between">
        <div className="max-w-[26rem]">
          <p className="text-[1.6rem] font-bold lowercase tracking-[-0.04em] text-white">taxhub</p>
          <p className="mt-3 text-[0.9rem] leading-relaxed">Demo-Projekt für die CITO Case Study (2026). Die Kanzlei Muster und alle Beispielanfragen sind fiktiv; Antworten ersetzen keine steuerliche Beratung.</p>
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-14 gap-y-3 text-[0.92rem]">
          <Link href="/app#wissen" className="hover:text-white">Wissen fragen</Link>
          <Link href="/app#posteingang" className="hover:text-white">Posteingang</Link>
          <Link href="/app#quellen" className="hover:text-white">Quellen</Link>
          <Link href="/one-pager" className="hover:text-white">One-Pager</Link>
          <a href="https://github.com/abirkhan792001-pixel/taxhub" className="hover:text-white">GitHub</a>
          <a href="https://www.gesetze-im-internet.de/" className="hover:text-white">gesetze-im-internet.de</a>
        </nav>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto w-full max-w-[1280px] px-5 py-5 text-[0.76rem] text-white/45 sm:px-10">
          Fotos: Vitaly Gariev auf{" "}
          <a href="https://unsplash.com/" className="underline underline-offset-2 hover:text-white/70">
            Unsplash
          </a>
          . Gesetzestexte: Bundesministerium der Justiz / juris.
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
