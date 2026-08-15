"use client";

import { useMemo, useState } from "react";
import { CalendarClock, X } from "lucide-react";
import {
  formatJalali,
  gregorianToJalali,
  jalaliToGregorian,
  parseJalaliString,
  toFaDigits,
} from "../lib/date";

export default function DateConverterModal({ onClose }: { onClose: () => void }) {
  const today = new Date();
  const [gregorianInput, setGregorianInput] = useState(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`,
  );
  const [jalaliInput, setJalaliInput] = useState(
    formatJalali(gregorianToJalali(today.getFullYear(), today.getMonth() + 1, today.getDate())).replace(
      /[۰-۹]/g,
      (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)),
    ),
  );

  const jalaliFromGregorian = useMemo(() => {
    const parts = gregorianInput.split("-").map(Number);
    if (parts.length !== 3 || parts.some((part) => Number.isNaN(part))) return null;
    return gregorianToJalali(parts[0], parts[1], parts[2]);
  }, [gregorianInput]);

  const gregorianFromJalali = useMemo(() => {
    const parsed = parseJalaliString(jalaliInput);
    if (!parsed) return null;
    return jalaliToGregorian(parsed.jy, parsed.jm, parsed.jd);
  }, [jalaliInput]);

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal-panel glass-card date-converter-modal"
        role="dialog"
        aria-modal="true"
        aria-label="تبدیل تاریخ"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <span className="panel-icon"><CalendarClock size={18} /></span>
            <p><strong>تبدیل تاریخ</strong><small>میان تقویم شمسی و میلادی</small></p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="بستن"><X size={18} /></button>
        </div>

        <div className="date-converter-grid">
          <label className="date-converter-field">
            تاریخ میلادی
            <input type="date" value={gregorianInput} onChange={(event) => setGregorianInput(event.target.value)} />
            <span className="date-converter-result">
              {jalaliFromGregorian ? formatJalali(jalaliFromGregorian, "verbal") : "تاریخ نامعتبر"}
            </span>
          </label>

          <label className="date-converter-field">
            تاریخ شمسی
            <input
              value={jalaliInput}
              onChange={(event) => setJalaliInput(event.target.value)}
              placeholder="1403/02/01"
            />
            <span className="date-converter-result">
              {gregorianFromJalali
                ? `${toFaDigits(gregorianFromJalali.gd)} / ${toFaDigits(gregorianFromJalali.gm)} / ${toFaDigits(gregorianFromJalali.gy)}`
                : "تاریخ نامعتبر"}
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
