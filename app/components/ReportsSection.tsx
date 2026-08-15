"use client";

import { BarChart3, Printer, ShieldAlert, Target, UsersRound } from "lucide-react";
import type { ProjectCharter } from "../../db/projects";
import { toFaDigits } from "../lib/date";
import WbsWeightDonut from "./charts/WbsWeightDonut";
import RiskHeatmap from "./charts/RiskHeatmap";

export default function ReportsSection({ charter }: { charter: ProjectCharter }) {
  const { project, wbs, kpis, risks, stakeholders } = charter;
  const criticalRisks = risks.filter((risk) => risk.rpn >= 20).length;
  const completedActivities = wbs.filter((item) => item.progress >= 100).length;

  return (
    <div className="charter-page report-page">
      <article className="charter-section glass-card no-print">
        <div className="panel-header">
          <div>
            <h3><BarChart3 size={16} /> گزارش اجرایی پروژه</h3>
            <p className="section-sub">خروجی قابل چاپ از وضعیت لحظه‌ای منشور، پیشرفت و ریسک‌های پروژه</p>
          </div>
          <button className="wbs-add-button" type="button" onClick={() => window.print()}>
            <Printer size={14} /> چاپ گزارش
          </button>
        </div>
      </article>

      <article className="charter-section glass-card report-print-block">
        <h3>{project.name}</h3>
        <p className="section-sub">{project.code} — {project.sponsorOrg}</p>
        <div className="report-summary-grid">
          <div><span>پیشرفت کلی</span><strong>{toFaDigits(project.progress)}٪</strong></div>
          <div><span>فعالیت‌های WBS</span><strong>{toFaDigits(wbs.length)}</strong></div>
          <div><span>فعالیت‌های تکمیل‌شده</span><strong>{toFaDigits(completedActivities)}</strong></div>
          <div><span>ریسک‌های بحرانی</span><strong>{toFaDigits(criticalRisks)}</strong></div>
          <div><span>شاخص‌های کلیدی</span><strong>{toFaDigits(kpis.length)}</strong></div>
          <div><span>ذی‌نفعان</span><strong>{toFaDigits(stakeholders.length)}</strong></div>
        </div>
      </article>

      <div className="report-charts-grid">
        <article className="charter-section glass-card report-print-block">
          <h3><BarChart3 size={16} /> توزیع وزنی فعالیت‌ها</h3>
          <WbsWeightDonut items={wbs} />
        </article>
        <article className="charter-section glass-card report-print-block">
          <h3><ShieldAlert size={16} /> نقشه حرارتی ریسک‌ها</h3>
          <RiskHeatmap risks={risks} />
        </article>
      </div>

      <article className="charter-section glass-card report-print-block">
        <h3><Target size={16} /> شاخص‌های کلیدی عملکرد</h3>
        {kpis.length === 0 ? (
          <div className="empty-state">شاخصی ثبت نشده است.</div>
        ) : (
          <div className="data-table-wrap">
            <table className="data-table">
              <thead><tr><th>#</th><th>دستاورد</th><th>شاخص اثربخشی (Lag)</th><th>شاخص کارایی (Lead)</th></tr></thead>
              <tbody>
                {kpis.map((kpi) => (
                  <tr key={kpi.id}>
                    <td className="num">{toFaDigits(kpi.seq)}</td>
                    <td>{kpi.achievement}</td>
                    <td>{kpi.lagTitle}</td>
                    <td>{kpi.leadTitle}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </article>

      <article className="charter-section glass-card report-print-block">
        <h3><UsersRound size={16} /> ذی‌نفعان کلیدی</h3>
        {stakeholders.length === 0 ? (
          <div className="empty-state">ذی‌نفعی ثبت نشده است.</div>
        ) : (
          <div className="data-table-wrap">
            <table className="data-table">
              <thead><tr><th>#</th><th>ذی‌نفع</th><th>حوزه</th><th>انتظار اصلی</th></tr></thead>
              <tbody>
                {stakeholders.map((stakeholder) => (
                  <tr key={stakeholder.id}>
                    <td className="num">{toFaDigits(stakeholder.seq)}</td>
                    <td>{stakeholder.name}</td>
                    <td>{stakeholder.scope}</td>
                    <td>{stakeholder.expectation}</td>
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
