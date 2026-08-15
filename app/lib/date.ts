const FA_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

export function toFaDigits(value: number | string) {
  return String(value).replace(/[0-9]/g, (digit) => FA_DIGITS[Number(digit)]);
}

export const PERSIAN_MONTH_NAMES = [
  "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
];

export const PERSIAN_WEEK_DAYS = [
  "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنج‌شنبه", "جمعه", "شنبه",
];

export type JalaliDate = { jy: number; jm: number; jd: number };
export type GregorianDate = { gy: number; gm: number; gd: number };

export function gregorianToJalali(gy: number, gm: number, gd: number): JalaliDate {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  const gy2 = gm > 2 ? gy + 1 : gy;
  let days =
    355666 +
    365 * gy +
    Math.floor((gy2 + 3) / 4) -
    Math.floor((gy2 + 99) / 100) +
    Math.floor((gy2 + 399) / 400) +
    gd +
    g_d_m[gm - 1];
  let jy = -1595 + 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  let jm: number;
  let jd: number;
  if (days < 186) {
    jm = 1 + Math.floor(days / 31);
    jd = 1 + (days % 31);
  } else {
    jm = 7 + Math.floor((days - 186) / 30);
    jd = 1 + ((days - 186) % 30);
  }
  return { jy, jm, jd };
}

export function jalaliToGregorian(jy: number, jm: number, jd: number): GregorianDate {
  const y = jy + 1595;
  let days =
    -355668 +
    365 * y +
    Math.floor(y / 33) * 8 +
    Math.floor(((y % 33) + 3) / 4) +
    jd +
    (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186);
  let gy = 400 * Math.floor(days / 146097);
  days %= 146097;
  if (days > 36524) {
    days -= 1;
    gy += 100 * Math.floor(days / 36524);
    days %= 36524;
    if (days >= 365) days += 1;
  }
  gy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    gy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  let gd = days + 1;
  const isLeap = (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0;
  const salA = [0, 31, isLeap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let gm = 1;
  while (gm < 13 && gd > salA[gm]) {
    gd -= salA[gm];
    gm += 1;
  }
  return { gy, gm, gd };
}

export function toJalaliFromDate(date: Date): JalaliDate {
  return gregorianToJalali(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

/** Parses "1403/02/01" or "1403-02-01" into a JalaliDate, or null if malformed. */
export function parseJalaliString(value: string): JalaliDate | null {
  const match = value.trim().match(/^(\d{3,4})[/-](\d{1,2})[/-](\d{1,2})$/);
  if (!match) return null;
  const jy = Number(match[1]);
  const jm = Number(match[2]);
  const jd = Number(match[3]);
  if (jm < 1 || jm > 12 || jd < 1 || jd > 31) return null;
  return { jy, jm, jd };
}

export function formatJalali(date: JalaliDate, format: "numeric" | "verbal" = "numeric") {
  if (format === "verbal") {
    return `${toFaDigits(date.jd)} ${PERSIAN_MONTH_NAMES[date.jm - 1] ?? ""} ${toFaDigits(date.jy)}`;
  }
  const mm = String(date.jm).padStart(2, "0");
  const dd = String(date.jd).padStart(2, "0");
  return toFaDigits(`${date.jy}/${mm}/${dd}`);
}

/** Ordinal day number (days since epoch), usable for date-math/positioning like Gantt charts. */
export function jalaliOrdinal(date: JalaliDate): number {
  const { gy, gm, gd } = jalaliToGregorian(date.jy, date.jm, date.jd);
  return Math.floor(Date.UTC(gy, gm - 1, gd) / 86_400_000);
}

/** Best-effort day-count between two "1403/02/01"-style strings; returns null if either is unparsable. */
export function jalaliStringDiffDays(startStr: string, endStr: string): number | null {
  const start = parseJalaliString(startStr);
  const end = parseJalaliString(endStr);
  if (!start || !end) return null;
  return jalaliOrdinal(end) - jalaliOrdinal(start);
}

export function getCurrentJalaliString(): string {
  return formatJalali(toJalaliFromDate(new Date()), "numeric").replace(/[۰-۹]/g, (d) =>
    String(FA_DIGITS.indexOf(d)),
  );
}
