"use client";

import type { ProjectRisk } from "../../../db/projects";
import { toFaDigits } from "../../lib/date";

const AXIS_STEPS = [1, 2, 3, 4, 5];
const CELL = 46;
const PAD_LEFT = 34;
const PAD_TOP = 10;
const PAD_BOTTOM = 30;

function rpnTone(rpn: number) {
  if (rpn >= 20) return "rose";
  if (rpn >= 10) return "amber";
  return "teal";
}

export default function RiskHeatmap({ risks }: { risks: ProjectRisk[] }) {
  const width = PAD_LEFT + AXIS_STEPS.length * CELL + 10;
  const height = PAD_TOP + AXIS_STEPS.length * CELL + PAD_BOTTOM;

  const grouped = new Map<string, ProjectRisk[]>();
  for (const risk of risks) {
    const p = Math.min(5, Math.max(1, Math.round(risk.probability)));
    const s = Math.min(5, Math.max(1, Math.round(risk.severity)));
    const key = `${p}:${s}`;
    const bucket = grouped.get(key) ?? [];
    bucket.push(risk);
    grouped.set(key, bucket);
  }

  return (
    <div className="chart-widget">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="نمودار حرارتی ریسک‌ها" className="risk-heatmap-svg">
        {AXIS_STEPS.map((severity, rowIndex) =>
          AXIS_STEPS.map((probability, colIndex) => {
            const key = `${probability}:${severity}`;
            const bucket = grouped.get(key) ?? [];
            const x = PAD_LEFT + colIndex * CELL;
            const y = PAD_TOP + (AXIS_STEPS.length - 1 - rowIndex) * CELL;
            const maxRpn = bucket.reduce((max, risk) => Math.max(max, risk.rpn), 0);
            const tone = bucket.length ? rpnTone(maxRpn) : "empty";
            return (
              <g key={key}>
                <rect
                  x={x + 2}
                  y={y + 2}
                  width={CELL - 4}
                  height={CELL - 4}
                  rx={9}
                  className={`risk-heatmap-cell ${tone}`}
                />
                {bucket.length > 0 && (
                  <text x={x + CELL / 2} y={y + CELL / 2 + 4} textAnchor="middle" className="risk-heatmap-count">
                    {toFaDigits(bucket.length)}
                  </text>
                )}
              </g>
            );
          }),
        )}
        {AXIS_STEPS.map((probability, colIndex) => (
          <text
            key={`x-${probability}`}
            x={PAD_LEFT + colIndex * CELL + CELL / 2}
            y={height - PAD_BOTTOM + 18}
            textAnchor="middle"
            className="risk-heatmap-axis"
          >
            {toFaDigits(probability)}
          </text>
        ))}
        {AXIS_STEPS.map((severity, rowIndex) => (
          <text
            key={`y-${severity}`}
            x={PAD_LEFT - 12}
            y={PAD_TOP + (AXIS_STEPS.length - 1 - rowIndex) * CELL + CELL / 2 + 4}
            textAnchor="middle"
            className="risk-heatmap-axis"
          >
            {toFaDigits(severity)}
          </text>
        ))}
        <text x={PAD_LEFT + (AXIS_STEPS.length * CELL) / 2} y={height - 4} textAnchor="middle" className="risk-heatmap-label">
          احتمال وقوع
        </text>
        <text
          x={-(PAD_TOP + (AXIS_STEPS.length * CELL) / 2)}
          y={12}
          textAnchor="middle"
          transform="rotate(-90)"
          className="risk-heatmap-label"
        >
          شدت اثر
        </text>
      </svg>
      <div className="risk-heatmap-legend">
        <span><i className="teal" /> ریسک کم</span>
        <span><i className="amber" /> ریسک متوسط</span>
        <span><i className="rose" /> ریسک بحرانی</span>
      </div>
    </div>
  );
}
