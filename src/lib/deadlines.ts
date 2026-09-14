// Deterministic deadline maths. The language model only extracts the letter date;
// the date arithmetic is done here, so it is reproducible and auditable.

export type DeadlineStep = { label: string; date: string; basis: string; sourceId?: string };

export type Einspruchsfrist = {
  bescheidDatum: string;
  bekanntgabe: string;
  fristende: string;
  daysLeft: number;
  steps: DeadlineStep[];
  caveats: string[];
};

const iso = (d: Date) => d.toISOString().slice(0, 10);
const de = (d: Date) => d.toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" });
const addDays = (d: Date, n: number) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + n));

// Gauss/Anonymous Gregorian algorithm
function easterSunday(year: number) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(year, month - 1, day));
}

// nationwide public holidays only; Länder-specific holidays are flagged as a caveat
function nationalHolidays(year: number): Map<string, string> {
  const easter = easterSunday(year);
  return new Map([
    [`${year}-01-01`, "Neujahr"],
    [iso(addDays(easter, -2)), "Karfreitag"],
    [iso(addDays(easter, 1)), "Ostermontag"],
    [`${year}-05-01`, "Tag der Arbeit"],
    [iso(addDays(easter, 39)), "Christi Himmelfahrt"],
    [iso(addDays(easter, 50)), "Pfingstmontag"],
    [`${year}-10-03`, "Tag der Deutschen Einheit"],
    [`${year}-12-25`, "1. Weihnachtstag"],
    [`${year}-12-26`, "2. Weihnachtstag"],
  ]);
}

function nonWorkingReason(d: Date): string | null {
  const dow = d.getUTCDay();
  if (dow === 6) return "Samstag";
  if (dow === 0) return "Sonntag";
  return nationalHolidays(d.getUTCFullYear()).get(iso(d)) ?? null;
}

function nextWorkingDay(d: Date) {
  let x = d;
  while (nonWorkingReason(x)) x = addDays(x, 1);
  return x;
}

// § 188 Abs. 2, 3 BGB: a one-month period ends on the day with the same number,
// or on the last day of the month if that day does not exist
function addMonths(d: Date, n: number) {
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth() + n;
  const lastDay = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  return new Date(Date.UTC(y, m, Math.min(d.getUTCDate(), lastDay)));
}

// Check a computed deadline date: weekday, and the § 108 Abs. 3 AO shift if it is not a working day
export function pruefeFristende(datum: string) {
  const [y, mo, da] = datum.split("-").map(Number);
  const d = new Date(Date.UTC(y, mo - 1, da));
  if (Number.isNaN(d.getTime())) return { fehler: "Datum bitte im Format YYYY-MM-DD angeben" };
  const reason = nonWorkingReason(d);
  const shifted = reason ? nextWorkingDay(d) : d;
  return {
    datum: iso(d),
    wochentag: d.toLocaleDateString("de-DE", { weekday: "long", timeZone: "UTC" }),
    werktag: !reason,
    grund: reason,
    fristendeNach108Abs3AO: iso(shifted),
    fristendeWochentag: shifted.toLocaleDateString("de-DE", { weekday: "long", timeZone: "UTC" }),
    hinweis: "Nur bundeseinheitliche Feiertage berücksichtigt.",
  };
}

export function einspruchsfrist(
  bescheidDatum: string,
  zustellung: "post" | "elektronisch" | "ausland" = "post",
  today = new Date()
): Einspruchsfrist {
  const [y, mo, da] = bescheidDatum.split("-").map(Number);
  const start = new Date(Date.UTC(y, mo - 1, da));
  const steps: DeadlineStep[] = [];

  steps.push({
    label: `Bescheid datiert / zur Post gegeben bzw. abgesendet`,
    date: de(start),
    basis: "Angabe aus dem Bescheid (vom Mandanten zu bestätigen)",
  });

  let bekanntgabe =
    zustellung === "ausland" ? addMonths(start, 1) : addDays(start, 4);
  steps.push({
    label: zustellung === "ausland" ? "Bekanntgabefiktion: ein Monat nach Aufgabe zur Post" : "Bekanntgabefiktion: vierter Tag nach Aufgabe zur Post / Absendung",
    date: de(bekanntgabe),
    basis: zustellung === "elektronisch" ? "§ 122 Abs. 2a AO" : "§ 122 Abs. 2 AO",
    sourceId: "AO-122-1",
  });

  const reason = nonWorkingReason(bekanntgabe);
  if (reason) {
    bekanntgabe = nextWorkingDay(bekanntgabe);
    steps.push({
      label: `Bekanntgabetag fällt auf ${reason} → nächster Werktag`,
      date: de(bekanntgabe),
      basis: "§ 108 Abs. 3 AO; nach BFH-Rechtsprechung auch auf die Bekanntgabefiktion anwendbar (BFH, Urteil v. 14.10.2003 – IX R 68/98)",
      sourceId: "AO-108",
    });
  }

  let ende = addMonths(bekanntgabe, 1);
  steps.push({ label: "Einspruchsfrist: ein Monat nach Bekanntgabe", date: de(ende), basis: "§ 355 Abs. 1 AO i. V. m. § 108 Abs. 1 AO, § 188 BGB", sourceId: "AO-355" });

  const endReason = nonWorkingReason(ende);
  if (endReason) {
    ende = nextWorkingDay(ende);
    steps.push({ label: `Fristende fällt auf ${endReason} → Ablauf des nächsten Werktags`, date: de(ende), basis: "§ 108 Abs. 3 AO", sourceId: "AO-108" });
  }

  const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const daysLeft = Math.round((ende.getTime() - todayUtc) / 86_400_000);

  return {
    bescheidDatum: iso(start),
    bekanntgabe: iso(bekanntgabe),
    fristende: iso(ende),
    daysLeft,
    steps,
    caveats: [
      "Nur bundeseinheitliche Feiertage berücksichtigt – landesrechtliche Feiertage am Kanzleisitz prüfen.",
      "Geht der Bescheid nachweislich später zu, verschiebt sich die Bekanntgabe (§ 122 Abs. 2 AO a. E.).",
      "Fehlt die Rechtsbehelfsbelehrung oder ist sie unrichtig, gilt die Jahresfrist nach § 356 Abs. 2 AO.",
    ],
  };
}
