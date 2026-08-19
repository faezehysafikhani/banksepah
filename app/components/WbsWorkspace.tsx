"use client";

import { useMemo, useState } from "react";
import {
  BarChart3,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  CirclePlus,
  Info,
  ListTree,
  Save,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

type Activity = {
  id: number;
  parentId: number | null;
  code: string;
  name: string;
  duration: number;
  start: string;
  end: string;
  weight: number;
  owner: string;
  planned: number;
  actual: number;
  cost: number;
  hours: number;
  importance: "کم" | "متوسط" | "زیاد";
  complexity: "کم" | "متوسط" | "زیاد";
  dependency: string;
  relation: "FS" | "SS" | "FF" | "SF";
  lag: number;
};

const initialActivities: Activity[] = [
  { id: 1, parentId: null, code: "1", name: "تحلیل و طراحی", duration: 45, start: "۱۴۰۵/۰۱/۱۵", end: "۱۴۰۵/۰۳/۰۱", weight: 20, owner: "مریم احمدی", planned: 100, actual: 100, cost: 850000000, hours: 720, importance: "زیاد", complexity: "زیاد", dependency: "-", relation: "FS", lag: 0 },
  { id: 2, parentId: 1, code: "1.1", name: "تحلیل نیازمندی‌های کسب‌وکار", duration: 18, start: "۱۴۰۵/۰۱/۱۵", end: "۱۴۰۵/۰۲/۰۲", weight: 8, owner: "علی رضایی", planned: 100, actual: 100, cost: 230000000, hours: 240, importance: "زیاد", complexity: "متوسط", dependency: "-", relation: "FS", lag: 0 },
  { id: 3, parentId: 1, code: "1.2", name: "طراحی معماری و امنیت", duration: 27, start: "۱۴۰۵/۰۲/۰۳", end: "۱۴۰۵/۰۳/۰۱", weight: 12, owner: "مریم احمدی", planned: 100, actual: 100, cost: 620000000, hours: 480, importance: "زیاد", complexity: "زیاد", dependency: "1.1", relation: "FS", lag: 0 },
  { id: 4, parentId: null, code: "2", name: "توسعه و پیاده‌سازی", duration: 145, start: "۱۴۰۵/۰۳/۰۲", end: "۱۴۰۵/۰۷/۲۷", weight: 50, owner: "مدیر سامانه", planned: 82, actual: 68, cost: 3200000000, hours: 3600, importance: "زیاد", complexity: "زیاد", dependency: "1", relation: "FS", lag: 0 },
  { id: 5, parentId: 4, code: "2.1", name: "توسعه خدمات سمت سرور", duration: 80, start: "۱۴۰۵/۰۳/۰۲", end: "۱۴۰۵/۰۵/۲۲", weight: 25, owner: "رضا کریمی", planned: 100, actual: 85, cost: 1700000000, hours: 1800, importance: "زیاد", complexity: "زیاد", dependency: "1.2", relation: "FS", lag: 0 },
  { id: 6, parentId: 4, code: "2.2", name: "توسعه رابط کاربری و یکپارچه‌سازی", duration: 65, start: "۱۴۰۵/۰۵/۲۳", end: "۱۴۰۵/۰۷/۲۷", weight: 25, owner: "سارا محمدی", planned: 65, actual: 51, cost: 1500000000, hours: 1800, importance: "متوسط", complexity: "زیاد", dependency: "2.1", relation: "SS", lag: 10 },
  { id: 7, parentId: null, code: "3", name: "آزمون، استقرار و تحویل", duration: 85, start: "۱۴۰۵/۰۷/۲۸", end: "۱۴۰۵/۱۰/۲۳", weight: 30, owner: "علی رضایی", planned: 20, actual: 12, cost: 1100000000, hours: 1200, importance: "زیاد", complexity: "متوسط", dependency: "2", relation: "FS", lag: 0 },
];

function fa(value: number) {
  return new Intl.NumberFormat("fa-IR").format(value);
}

export default function WbsWorkspace({ projectName }: { projectName: string }) {
  const [activities, setActivities] = useState(initialActivities);
  const [expanded, setExpanded] = useState(() => new Set([1, 4, 7]));
  const [view, setView] = useState<"table" | "gantt">("table");
  const [detailId, setDetailId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [notice, setNotice] = useState("");

  const rows = useMemo(() => {
    const result: Array<Activity & { level: number; hasChildren: boolean }> = [];
    const walk = (parentId: number | null, level: number) => {
      activities.filter((item) => item.parentId === parentId).forEach((item) => {
        const hasChildren = activities.some((child) => child.parentId === item.id);
        result.push({ ...item, level, hasChildren });
        if (hasChildren && expanded.has(item.id)) walk(item.id, level + 1);
      });
    };
    walk(null, 0);
    return result;
  }, [activities, expanded]);

  const selected = activities.find((item) => item.id === detailId);
  const deleting = activities.find((item) => item.id === deleteId);

  function update(id: number, field: keyof Activity, value: string | number) {
    setActivities((current) => current.map((item) => item.id === id ? { ...item, [field]: value } : item));
  }

  function addActivity(parentId: number | null) {
    const siblings = activities.filter((item) => item.parentId === parentId);
    const parent = activities.find((item) => item.id === parentId);
    const id = Math.max(0, ...activities.map((item) => item.id)) + 1;
    const code = parent ? `${parent.code}.${siblings.length + 1}` : `${siblings.length + 1}`;
    setActivities((current) => [...current, {
      id, parentId, code, name: "فعالیت جدید", duration: 1,
      start: "۱۴۰۵/۰۱/۱۵", end: "۱۴۰۵/۰۱/۱۵", weight: 0, owner: "-",
      planned: 0, actual: 0, cost: 0, hours: 0, importance: "متوسط",
      complexity: "متوسط", dependency: "-", relation: "FS", lag: 0,
    }]);
    if (parentId) setExpanded((current) => new Set(current).add(parentId));
    setNotice(parent ? `زیر‌فعالیت جدید به «${parent.name}» اضافه شد.` : "فعالیت سطح اصلی اضافه شد.");
  }

  function removeActivity(id: number) {
    const descendants = new Set<number>([id]);
    let changed = true;
    while (changed) {
      changed = false;
      activities.forEach((item) => {
        if (item.parentId && descendants.has(item.parentId) && !descendants.has(item.id)) {
          descendants.add(item.id);
          changed = true;
        }
      });
    }
    setActivities((current) => current.filter((item) => !descendants.has(item.id)));
    setDeleteId(null);
    setNotice("فعالیت و زیر‌فعالیت‌های وابسته حذف شدند.");
  }

  function smartStructure() {
    if (activities.some((item) => item.name === "آموزش و انتقال دانش")) {
      setNotice("ساختار پیشنهادی هوشمند قبلاً اعمال شده است.");
      return;
    }
    const id = Math.max(...activities.map((item) => item.id)) + 1;
    setActivities((current) => [...current, { id, parentId: 7, code: "3.1", name: "آموزش و انتقال دانش", duration: 15, start: "۱۴۰۵/۱۰/۰۸", end: "۱۴۰۵/۱۰/۲۳", weight: 5, owner: "مدیر سامانه", planned: 0, actual: 0, cost: 180000000, hours: 160, importance: "متوسط", complexity: "کم", dependency: "3", relation: "FS", lag: 0 }]);
    setExpanded((current) => new Set(current).add(7));
    setNotice("فعالیت پیشنهادی هوشمند به ساختار شکست کار اضافه شد.");
  }

  return (
    <section className="wbs-workspace">
      <header className="wbs-toolbar">
        <div>
          <button type="button" className="smart" onClick={smartStructure}><Sparkles size={16} /> پیشنهاد هوشمند</button>
          <button type="button" onClick={() => addActivity(null)}><CirclePlus size={16} /> فعالیت اصلی</button>
          <button type="button" onClick={() => setExpanded(new Set(activities.map((item) => item.id)))}><ChevronDown size={16} /> باز کردن همه</button>
          <button type="button" onClick={() => setExpanded(new Set())}><ChevronUp size={16} /> بستن همه</button>
        </div>
        <div className="wbs-view-toggle">
          <button type="button" className={view === "table" ? "active" : ""} onClick={() => setView("table")}><ListTree size={16} /> جدول WBS</button>
          <button type="button" className={view === "gantt" ? "active" : ""} onClick={() => setView("gantt")}><BarChart3 size={16} /> گانت</button>
        </div>
      </header>

      <div className="wbs-summary">
        <span><small>پروژه</small><strong>{projectName}</strong></span>
        <span><small>تعداد فعالیت</small><strong>{fa(activities.length)}</strong></span>
        <span><small>وزن کل</small><strong>{fa(activities.filter((item) => item.parentId === null).reduce((sum, item) => sum + item.weight, 0))}٪</strong></span>
        <span><small>پیشرفت واقعی</small><strong>{fa(Math.round(activities.filter((item) => item.parentId === null).reduce((sum, item) => sum + item.actual * item.weight, 0) / 100))}٪</strong></span>
      </div>

      {notice && <div className="wbs-notice"><span>{notice}</span><button type="button" onClick={() => setNotice("")}><X size={14} /></button></div>}

      {view === "table" ? (
        <div className="wbs-table-wrap">
          <table className="wbs-table">
            <thead><tr><th>کد WBS / نام فعالیت</th><th>مدت</th><th>تاریخ شروع</th><th>تاریخ پایان</th><th>وزن</th><th>مسئول</th><th>برنامه‌ای</th><th>واقعی</th><th>عملیات</th></tr></thead>
            <tbody>
              {rows.map((activity) => (
                <tr key={activity.id} className={activity.level === 0 ? "root" : ""}>
                  <td><div className="wbs-name" style={{ paddingRight: `${activity.level * 22}px` }}>
                    {activity.hasChildren ? <button type="button" aria-label={`باز یا بسته کردن ${activity.name}`} onClick={() => setExpanded((current) => { const next = new Set(current); if (next.has(activity.id)) next.delete(activity.id); else next.add(activity.id); return next; })}>{expanded.has(activity.id) ? <ChevronDown size={15} /> : <ChevronLeft size={15} />}</button> : <i />}
                    <em>{activity.code}</em><input aria-label={`نام فعالیت ${activity.code}`} value={activity.name} onChange={(event) => update(activity.id, "name", event.target.value)} />
                  </div></td>
                  <td><input aria-label={`مدت ${activity.name}`} type="number" min="1" value={activity.duration} onChange={(event) => update(activity.id, "duration", Number(event.target.value))} /></td>
                  <td><input aria-label={`شروع ${activity.name}`} value={activity.start} onChange={(event) => update(activity.id, "start", event.target.value)} /></td>
                  <td><input aria-label={`پایان ${activity.name}`} value={activity.end} onChange={(event) => update(activity.id, "end", event.target.value)} /></td>
                  <td><input aria-label={`وزن ${activity.name}`} type="number" min="0" max="100" value={activity.weight} onChange={(event) => update(activity.id, "weight", Number(event.target.value))} /></td>
                  <td><select aria-label={`مسئول ${activity.name}`} value={activity.owner} onChange={(event) => update(activity.id, "owner", event.target.value)}><option>-</option><option>مدیر سامانه</option><option>علی رضایی</option><option>مریم احمدی</option><option>رضا کریمی</option><option>سارا محمدی</option></select></td>
                  <td><span className="wbs-plan">{fa(activity.planned)}٪</span></td>
                  <td><input aria-label={`پیشرفت واقعی ${activity.name}`} type="number" min="0" max="100" value={activity.actual} onChange={(event) => update(activity.id, "actual", Number(event.target.value))} /></td>
                  <td><div className="wbs-actions"><button type="button" title="جزئیات فعالیت" onClick={() => setDetailId(activity.id)}><Info size={14} /></button><button type="button" title="افزودن زیر‌فعالیت" onClick={() => addActivity(activity.id)}><CirclePlus size={14} /></button><button type="button" title="حذف فعالیت" className="danger" onClick={() => setDeleteId(activity.id)}><Trash2 size={14} /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="wbs-gantt">
          <header><span>فعالیت</span><div><b>فروردین</b><b>اردیبهشت</b><b>خرداد</b><b>تیر</b><b>مرداد</b><b>شهریور</b></div></header>
          {rows.filter((item) => item.level < 2).map((activity, index) => (
            <article key={activity.id}><span>{activity.code} — {activity.name}</span><div><i style={{ right: `${(index * 9) % 48}%`, width: `${Math.max(12, Math.min(48, activity.duration / 3))}%` }}><em style={{ width: `${activity.actual}%` }} /></i></div></article>
          ))}
        </div>
      )}

      <footer className="wbs-save"><button type="button" onClick={() => setNotice("ساختار شکست کار و اطلاعات زمان‌بندی ذخیره شد.")}><Save size={16} /> ذخیره WBS و زمان‌بندی</button></footer>

      {selected && (
        <div className="wbs-modal-backdrop" role="presentation">
          <section className="wbs-detail-modal" role="dialog" aria-modal="true" aria-label={`جزئیات فعالیت ${selected.name}`}>
            <header><div><small>جزئیات فعالیت</small><h3>{selected.name}</h3></div><button type="button" onClick={() => setDetailId(null)} aria-label="بستن جزئیات"><X size={17} /></button></header>
            <div className="wbs-detail-grid">
              <label><span>هزینه (ریال)</span><input type="number" value={selected.cost} onChange={(event) => update(selected.id, "cost", Number(event.target.value))} /></label>
              <label><span>نفرساعت</span><input type="number" value={selected.hours} onChange={(event) => update(selected.id, "hours", Number(event.target.value))} /></label>
              <label><span>درجه اهمیت</span><select value={selected.importance} onChange={(event) => update(selected.id, "importance", event.target.value)}><option>کم</option><option>متوسط</option><option>زیاد</option></select></label>
              <label><span>پیچیدگی</span><select value={selected.complexity} onChange={(event) => update(selected.id, "complexity", event.target.value)}><option>کم</option><option>متوسط</option><option>زیاد</option></select></label>
              <label><span>پیش‌نیاز</span><select value={selected.dependency} onChange={(event) => update(selected.id, "dependency", event.target.value)}><option>-</option>{activities.filter((item) => item.id !== selected.id).map((item) => <option key={item.id}>{item.code}</option>)}</select></label>
              <label><span>نوع رابطه</span><select value={selected.relation} onChange={(event) => update(selected.id, "relation", event.target.value)}><option value="FS">پایان به شروع (FS)</option><option value="SS">شروع به شروع (SS)</option><option value="FF">پایان به پایان (FF)</option><option value="SF">شروع به پایان (SF)</option></select></label>
              <label><span>Lag (روز)</span><input type="number" value={selected.lag} onChange={(event) => update(selected.id, "lag", Number(event.target.value))} /></label>
              <label><span>کد WBS</span><input value={selected.code} disabled /></label>
            </div>
            <div className="wbs-float-info"><span>شناوری کل: <strong>{selected.dependency === "-" ? "۲ روز" : "۰ روز"}</strong></span><span>شناوری آزاد: <strong>۰ روز</strong></span><span>مسیر بحرانی: <strong>{selected.importance === "زیاد" ? "بحرانی" : "غیربحرانی"}</strong></span></div>
            <footer><button type="button" onClick={() => setDetailId(null)}><Save size={15} /> ذخیره جزئیات</button></footer>
          </section>
        </div>
      )}

      {deleting && (
        <div className="wbs-modal-backdrop" role="presentation">
          <section className="wbs-delete-modal" role="dialog" aria-modal="true" aria-label="حذف فعالیت WBS">
            <span><Trash2 size={24} /></span><h3>حذف فعالیت</h3><p>فعالیت «{deleting.name}» و تمام زیر‌فعالیت‌های آن حذف شود؟</p>
            <footer><button type="button" onClick={() => setDeleteId(null)}>انصراف</button><button type="button" className="danger" onClick={() => removeActivity(deleting.id)}>حذف فعالیت</button></footer>
          </section>
        </div>
      )}
    </section>
  );
}
