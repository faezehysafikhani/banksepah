"use client";

import { CalendarRange } from "lucide-react";
import type { ProjectCharter } from "../../db/projects";
import GanttChart from "./charts/GanttChart";

export default function ScheduleSection({ charter }: { charter: ProjectCharter }) {
  return (
    <div className="charter-page">
      <article className="charter-section glass-card">
        <h3><CalendarRange size={16} /> زمان‌بندی پروژه (نمودار گانت)</h3>
        <p className="section-sub">بازه‌ زمانی فعالیت‌های ثبت‌شده در ساختار شکست کار، بر اساس تاریخ شمسی</p>
        <GanttChart items={charter.wbs} />
      </article>
    </div>
  );
}
