"use client";

import type { ProjectWbsItem } from "../../../db/projects";
import { jalaliOrdinal, parseJalaliString, toFaDigits } from "../../lib/date";

type Bar = {
  item: ProjectWbsItem;
  startOrdinal: number;
  endOrdinal: number;
};

export default function GanttChart({ items }: { items: ProjectWbsItem[] }) {
  const bars: Bar[] = [];
  for (const item of items) {
    const start = parseJalaliString(item.startDate);
    const end = parseJalaliString(item.endDate);
    if (!start || !end) continue;
    const startOrdinal = jalaliOrdinal(start);
    const endOrdinal = jalaliOrdinal(end);
    if (endOrdinal < startOrdinal) continue;
    bars.push({ item, startOrdinal, endOrdinal: Math.max(endOrdinal, startOrdinal + 1) });
  }

  if (!bars.length) {
    return <div className="empty-state">تاریخ شروع/پایان معتبری برای رسم زمان‌بندی ثبت نشده است.</div>;
  }

  const min = Math.min(...bars.map((bar) => bar.startOrdinal));
  const max = Math.max(...bars.map((bar) => bar.endOrdinal));
  const span = Math.max(1, max - min);
  const today = Math.floor(Date.now() / 86_400_000);
  const todayPercent = ((today - min) / span) * 100;

  return (
    <div className="gantt-widget">
      <div className="gantt-rows">
        {bars.map(({ item, startOrdinal, endOrdinal }) => {
          const left = ((startOrdinal - min) / span) * 100;
          const width = Math.max(1.2, ((endOrdinal - startOrdinal) / span) * 100);
          const title = item.activity.trim() || item.subActivity || "—";
          return (
            <div className="gantt-row" key={item.id}>
              <span className="gantt-row-label" title={title}>{title}</span>
              <div className="gantt-track" dir="ltr">
                {todayPercent >= 0 && todayPercent <= 100 && (
                  <span className="gantt-today" style={{ left: `${todayPercent}%` }} />
                )}
                <div
                  className={`gantt-bar ${item.progress >= 100 ? "done" : item.progress > 0 ? "active" : "pending"}`}
                  style={{ left: `${left}%`, width: `${width}%` }}
                  title={`${item.startDate} تا ${item.endDate} — ${toFaDigits(item.progress)}٪`}
                >
                  <span className="gantt-bar-fill" style={{ width: `${item.progress}%` }} />
                </div>
              </div>
              <span className="gantt-row-progress">{toFaDigits(item.progress)}٪</span>
            </div>
          );
        })}
      </div>
      <div className="gantt-legend">
        <span><i className="pending" /> شروع‌نشده</span>
        <span><i className="active" /> در حال اجرا</span>
        <span><i className="done" /> تکمیل‌شده</span>
        <span><i className="today-dot" /> امروز</span>
      </div>
    </div>
  );
}
