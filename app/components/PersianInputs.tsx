"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Check, ChevronLeft, ChevronRight, Clock3 } from "lucide-react";

const monthNames = ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"];
const baseMonthLengths = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];
const weekdays = ["ش", "ی", "د", "س", "چ", "پ", "ج"];
const fa = (value: number) => new Intl.NumberFormat("fa-IR", { useGrouping: false }).format(value);
const toEnglishDigits = (value: string) => value.replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)));
const isLeapJalali = (year: number) => [1, 5, 9, 13, 17, 22, 26, 30].includes(year % 33);
function yearStartOffset(year: number) {
  let offset = 0;
  if (year >= 1405) for (let current = 1405; current < year; current++) offset += isLeapJalali(current) ? 2 : 1;
  else for (let current = 1404; current >= year; current--) offset -= isLeapJalali(current) ? 2 : 1;
  return offset;
}
function monthStartOffset(month: number) { return baseMonthLengths.slice(0, month - 1).reduce((sum, length) => sum + length, 0); }

function parseDate(value?: string) {
  const parts = toEnglishDigits(value ?? "").split("/").map(Number);
  return { year: parts[0] || 1405, month: Math.min(12, Math.max(1, parts[1] || 5)), day: Math.min(31, Math.max(1, parts[2] || 28)) };
}

export function PersianDateInput({ value, defaultValue, onChange, placeholder = "۱۴۰۵/۰۵/۲۸" }: { value?: string; defaultValue?: string; onChange?: (value: string) => void; placeholder?: string }) {
  const initial = parseDate(value ?? defaultValue); const [open, setOpen] = useState(false); const [viewYear, setViewYear] = useState(initial.year); const [viewMonth, setViewMonth] = useState(initial.month);
  const [internal, setInternal] = useState(value ?? defaultValue ?? ""); const display = value ?? internal; const selected = parseDate(display);
  const monthLength = viewMonth === 12 && isLeapJalali(viewYear) ? 30 : baseMonthLengths[viewMonth - 1];
  const startOffset = yearStartOffset(viewYear) + monthStartOffset(viewMonth);
  const start = ((startOffset % 7) + 7) % 7;
  const cells = useMemo(() => [...Array(start).fill(null), ...Array.from({ length: monthLength }, (_, index) => index + 1)], [start, monthLength]);
  function choose(day: number) { const next = `${fa(viewYear)}/${fa(viewMonth).padStart(2, "۰")}/${fa(day).padStart(2, "۰")}`; setInternal(next); onChange?.(next); setOpen(false); }
  function move(delta: number) { let month = viewMonth + delta; let year = viewYear; if (month < 1) { month = 12; year--; } if (month > 12) { month = 1; year++; } setViewMonth(month); setViewYear(year); }
  return <div className="persian-input"><button type="button" className="persian-input-trigger" onClick={() => setOpen((current) => !current)}><CalendarDays size={17} /><span className={display ? "" : "placeholder"}>{display || placeholder}</span></button>{open && <div className="persian-calendar-popover"><header><button type="button" onClick={() => move(-1)}><ChevronRight size={17} /></button><div><select value={viewMonth} onChange={(event) => setViewMonth(Number(event.target.value))}>{monthNames.map((month, index) => <option value={index + 1} key={month}>{month}</option>)}</select><select value={viewYear} onChange={(event) => setViewYear(Number(event.target.value))}>{Array.from({length:26},(_,index)=>1395+index).map((year) => <option key={year} value={year}>{fa(year)}</option>)}</select></div><button type="button" onClick={() => move(1)}><ChevronLeft size={17} /></button></header><div className="persian-calendar-week">{weekdays.map((day) => <span key={day}>{day}</span>)}</div><div className="persian-calendar-days">{cells.map((day,index) => day === null ? <i key={`empty-${index}`} /> : <button type="button" key={day} className={`${selected.year === viewYear && selected.month === viewMonth && selected.day === day ? "selected" : ""} ${(start + day - 1) % 7 === 6 ? "holiday" : ""}`} onClick={() => choose(day)}>{fa(day)}</button>)}</div><footer><button type="button" onClick={() => { setInternal(""); onChange?.(""); setOpen(false); }}>پاک‌کردن</button><span>تقویم رسمی شمسی</span></footer></div>}</div>;
}

export function TimeSelect({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false); const [hour, minute] = value.split(":");
  function setTime(nextHour: string, nextMinute: string) { onChange(`${nextHour.padStart(2,"0")}:${nextMinute.padStart(2,"0")}`); }
  function setNow() {
    const now = new Date();
    const rounded = Math.round(now.getMinutes() / 5) * 5;
    const nextHour = (now.getHours() + (rounded === 60 ? 1 : 0)) % 24;
    setTime(String(nextHour), String(rounded % 60));
  }
  return <div className="time-select"><button type="button" className="time-select-trigger" onClick={() => setOpen((current) => !current)}><Clock3 size={17} /><span>{fa(Number(hour)).padStart(2,"۰")}:{fa(Number(minute)).padStart(2,"۰")}</span></button>{open && <div className="time-select-popover"><div><label><span>ساعت</span><select value={hour} onChange={(event) => setTime(event.target.value, minute)}>{Array.from({length:24},(_,index)=>String(index).padStart(2,"0")).map((item)=><option key={item} value={item}>{fa(Number(item)).padStart(2,"۰")}</option>)}</select></label><b>:</b><label><span>دقیقه</span><select value={minute} onChange={(event) => setTime(hour, event.target.value)}>{["00","05","10","15","20","25","30","35","40","45","50","55"].map((item)=><option key={item} value={item}>{fa(Number(item)).padStart(2,"۰")}</option>)}</select></label></div><footer><button type="button" onClick={setNow}>اکنون</button><button type="button" onClick={() => setOpen(false)}><Check size={15} /> تأیید</button></footer></div>}</div>;
}
