"use client";

import { Award, CheckCircle2, Target, TrendingUp } from "lucide-react";
import type { ProjectCharter } from "../../db/projects";
import { toFaDigits } from "../lib/date";

export default function AchievementsSection({ charter }: { charter: ProjectCharter }) {
  const { kpis, wbs } = charter;
  const completedDeliverables = wbs.filter((item) => item.progress >= 100 && item.deliverable.trim());

  return (
    <div className="charter-page">
      <article className="charter-section glass-card">
        <h3><Award size={16} /> دستاوردهای پروژه</h3>
        <p className="section-sub">دستاوردهای هدف‌گذاری‌شده در منشور پروژه و شاخص‌های سنجش هر یک</p>
        {kpis.length === 0 ? (
          <div className="empty-state">دستاوردی ثبت نشده است.</div>
        ) : (
          <div className="achievement-grid">
            {kpis.map((kpi) => (
              <div className="achievement-card" key={kpi.id}>
                <span className="achievement-index">{toFaDigits(kpi.seq)}</span>
                <div>
                  <strong>{kpi.achievement}</strong>
                  <div className="achievement-metrics">
                    <span><Target size={13} /> {kpi.lagTitle || "—"}</span>
                    <span><TrendingUp size={13} /> {kpi.leadTitle || "—"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </article>

      <article className="charter-section glass-card">
        <h3><CheckCircle2 size={16} /> فعالیت‌های تکمیل‌شده (تحویل‌دادنی‌های محقق‌شده)</h3>
        <p className="section-sub">فعالیت‌های ساختار شکست کار با پیشرفت ۱۰۰٪ و تحویل‌دادنی ثبت‌شده</p>
        {completedDeliverables.length === 0 ? (
          <div className="empty-state">هنوز فعالیتی به‌طور کامل تکمیل نشده است.</div>
        ) : (
          <div className="data-table-wrap">
            <table className="data-table">
              <thead><tr><th>#</th><th>فعالیت</th><th>تحویل‌دادنی</th><th>تاریخ پایان</th></tr></thead>
              <tbody>
                {completedDeliverables.map((item) => (
                  <tr key={item.id}>
                    <td className="num">{toFaDigits(item.seq)}</td>
                    <td>{item.activity || item.subActivity}</td>
                    <td>{item.deliverable}</td>
                    <td className="num">{item.endDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </article>
    </div>
  );
}
