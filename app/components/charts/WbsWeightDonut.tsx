"use client";

import type { ProjectWbsItem } from "../../../db/projects";
import { toFaDigits } from "../../lib/date";

const PALETTE = ["#1594c5", "#20a0bd", "#ed6b2d", "#8ad7e6", "#c17a1e", "#5c7280", "#43d49f", "#c95555"];

function parseWeight(weight: string) {
  const match = weight.match(/[\d.]+/);
  return match ? Number.parseFloat(match[0]) : 0;
}

export function groupWbsByPhase(items: ProjectWbsItem[]) {
  const groups: { phase: string; weight: number }[] = [];
  let lastPhase = "بدون گروه";
  for (const item of items) {
    const phase = item.activity.trim() || lastPhase;
    lastPhase = phase;
    const value = parseWeight(item.weight);
    const existing = groups.find((group) => group.phase === phase);
    if (existing) existing.weight += value;
    else groups.push({ phase, weight: value });
  }
  return groups.filter((group) => group.weight > 0);
}

export default function WbsWeightDonut({ items }: { items: ProjectWbsItem[] }) {
  const groups = groupWbsByPhase(items);
  const total = groups.reduce((sum, group) => sum + group.weight, 0);

  if (!total) {
    return <div className="empty-state">وزنی برای فعالیت‌ها ثبت نشده است.</div>;
  }

  const RADIUS = 52;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  let cumulative = 0;

  return (
    <div className="donut-widget">
      <svg viewBox="0 0 140 140" role="img" aria-label="توزیع وزنی فعالیت‌ها" className="donut-svg">
        <circle cx="70" cy="70" r={RADIUS} fill="none" stroke="rgba(16,44,59,.08)" strokeWidth="16" />
        {groups.map((group, index) => {
          const fraction = group.weight / total;
          const dash = fraction * CIRCUMFERENCE;
          const offset = CIRCUMFERENCE - (cumulative / total) * CIRCUMFERENCE;
          cumulative += group.weight;
          return (
            <circle
              key={group.phase}
              cx="70"
              cy="70"
              r={RADIUS}
              fill="none"
              stroke={PALETTE[index % PALETTE.length]}
              strokeWidth="16"
              strokeDasharray={`${dash} ${CIRCUMFERENCE - dash}`}
              strokeDashoffset={offset}
              transform="rotate(-90 70 70)"
              strokeLinecap="butt"
            />
          );
        })}
        <text x="70" y="66" textAnchor="middle" className="donut-total">{toFaDigits(Math.round(total))}٪</text>
        <text x="70" y="82" textAnchor="middle" className="donut-total-label">وزن کل</text>
      </svg>
      <ul className="donut-legend">
        {groups.map((group, index) => (
          <li key={group.phase}>
            <i style={{ background: PALETTE[index % PALETTE.length] }} />
            <span>{group.phase}</span>
            <b>{toFaDigits(Math.round(group.weight))}٪</b>
          </li>
        ))}
      </ul>
    </div>
  );
}
