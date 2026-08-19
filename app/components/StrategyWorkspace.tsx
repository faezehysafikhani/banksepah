"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  Activity,
  ArrowLeft,
  Check,
  ChevronDown,
  CircleAlert,
  CircleDollarSign,
  Eye,
  FileSpreadsheet,
  Filter,
  FolderKanban,
  Gauge,
  GitBranch,
  GraduationCap,
  Lightbulb,
  Link2,
  Pencil,
  Plus,
  Save,
  Search,
  Sparkles,
  Target,
  Trash2,
  TrendingDown,
  TrendingUp,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";

type Tab = "نمای کلی" | "نقشه استراتژی" | "اهداف راهبردی" | "شاخص‌های کلیدی" | "ابتکارها و برنامه‌ها" | "هم‌راستایی پروژه‌ها";
type Perspective = "مالی" | "مشتری و ذی‌نفعان" | "فرآیندهای داخلی" | "یادگیری و رشد";
type StrategyModal = { type: "goal" | "kpi" | "initiative" | "alignment" | "goal-detail"; id?: number } | null;

type Goal = {
  id: number;
  code: string;
  title: string;
  perspective: Perspective;
  owner: string;
  weight: number;
  progress: number;
  status: "مطلوب" | "نیازمند توجه" | "بحرانی";
  linkedProjects: number;
  description: string;
};

type Kpi = {
  id: number;
  code: string;
  title: string;
  goalId: number;
  unit: string;
  target: number;
  actual: number;
  frequency: string;
  trend: "up" | "down";
};

type Initiative = {
  id: number;
  title: string;
  goalId: number;
  manager: string;
  budget: string;
  progress: number;
  status: "برنامه‌ریزی" | "در حال اجرا" | "تکمیل‌شده";
};

type Alignment = {
  id: number;
  project: string;
  owner: string;
  goals: number[];
  score: number;
  contribution: "مستقیم" | "پشتیبان";
  decision: "مصوب" | "نیازمند بازنگری";
};

const perspectives: { title: Perspective; icon: typeof CircleDollarSign; tone: string; description: string }[] = [
  { title: "مالی", icon: CircleDollarSign, tone: "finance", description: "بهره‌وری سرمایه‌گذاری و کنترل هزینه" },
  { title: "مشتری و ذی‌نفعان", icon: UsersRound, tone: "customer", description: "رضایت، اعتماد و تجربه خدمات بانکی" },
  { title: "فرآیندهای داخلی", icon: GitBranch, tone: "process", description: "چابکی، کیفیت و تحول فرآیندها" },
  { title: "یادگیری و رشد", icon: GraduationCap, tone: "learning", description: "سرمایه انسانی، داده و نوآوری" },
];

const initialGoals: Goal[] = [
  { id: 1, code: "STG-F-01", title: "افزایش بازده سرمایه‌گذاری پروژه‌های راهبردی", perspective: "مالی", owner: "معاونت برنامه‌ریزی", weight: 18, progress: 78, status: "مطلوب", linkedProjects: 4, description: "اولویت‌بندی سرمایه‌گذاری‌ها بر اساس ارزش قابل تحقق و کنترل انحراف هزینه." },
  { id: 2, code: "STG-C-01", title: "ارتقای تجربه یکپارچه مشتریان", perspective: "مشتری و ذی‌نفعان", owner: "معاونت بانکداری", weight: 20, progress: 63, status: "نیازمند توجه", linkedProjects: 3, description: "بهبود تجربه مشتری در کانال‌های حضوری و دیجیتال با تمرکز بر سرعت و سادگی." },
  { id: 3, code: "STG-P-01", title: "افزایش بلوغ مدیریت پروژه سازمانی", perspective: "فرآیندهای داخلی", owner: "دفتر مدیریت پروژه", weight: 17, progress: 84, status: "مطلوب", linkedProjects: 5, description: "استقرار فرآیندهای استاندارد برنامه‌ریزی، پایش، ریسک و مدیریت دانش پروژه." },
  { id: 4, code: "STG-P-02", title: "کاهش زمان عرضه خدمات دیجیتال", perspective: "فرآیندهای داخلی", owner: "فناوری اطلاعات", weight: 16, progress: 48, status: "بحرانی", linkedProjects: 2, description: "کوتاه‌کردن چرخه تحلیل تا انتشار خدمات با معماری و تحویل چابک." },
  { id: 5, code: "STG-L-01", title: "توسعه شایستگی‌های تحول دیجیتال", perspective: "یادگیری و رشد", owner: "سرمایه انسانی", weight: 14, progress: 70, status: "مطلوب", linkedProjects: 2, description: "توسعه مهارت‌های داده، محصول، امنیت و مدیریت پروژه در نقش‌های کلیدی." },
  { id: 6, code: "STG-L-02", title: "تصمیم‌گیری داده‌محور در سبد پروژه‌ها", perspective: "یادگیری و رشد", owner: "معاونت برنامه‌ریزی", weight: 15, progress: 57, status: "نیازمند توجه", linkedProjects: 3, description: "ایجاد مرجع داده قابل اعتماد برای تصمیم‌های سبد، تخصیص منابع و اولویت‌بندی." },
];

const initialKpis: Kpi[] = [
  { id: 1, code: "KPI-101", title: "درصد تحقق منافع پروژه‌ها", goalId: 1, unit: "درصد", target: 85, actual: 79, frequency: "فصلی", trend: "up" },
  { id: 2, code: "KPI-102", title: "شاخص رضایت مشتری دیجیتال", goalId: 2, unit: "امتیاز", target: 90, actual: 76, frequency: "ماهانه", trend: "up" },
  { id: 3, code: "KPI-103", title: "انطباق پروژه‌ها با چارچوب PMO", goalId: 3, unit: "درصد", target: 95, actual: 92, frequency: "ماهانه", trend: "up" },
  { id: 4, code: "KPI-104", title: "میانگین زمان عرضه خدمت", goalId: 4, unit: "روز", target: 45, actual: 62, frequency: "ماهانه", trend: "down" },
  { id: 5, code: "KPI-105", title: "پوشش شایستگی‌های کلیدی", goalId: 5, unit: "درصد", target: 80, actual: 71, frequency: "فصلی", trend: "up" },
];

const initialInitiatives: Initiative[] = [
  { id: 1, title: "استقرار نظام مدیریت منافع پروژه‌ها", goalId: 1, manager: "علی رضایی", budget: "۲۸ میلیارد ریال", progress: 72, status: "در حال اجرا" },
  { id: 2, title: "بازطراحی سفرهای کلیدی مشتری", goalId: 2, manager: "سارا محمدی", budget: "۴۵ میلیارد ریال", progress: 58, status: "در حال اجرا" },
  { id: 3, title: "ارتقای بلوغ دفتر مدیریت پروژه", goalId: 3, manager: "مدیر سامانه", budget: "۱۸ میلیارد ریال", progress: 84, status: "در حال اجرا" },
  { id: 4, title: "آکادمی تحول و مدیریت محصول", goalId: 5, manager: "مریم احمدی", budget: "۱۲ میلیارد ریال", progress: 30, status: "برنامه‌ریزی" },
];

const initialAlignments: Alignment[] = [
  { id: 1, project: "توسعه سامانه مدیریت پروژه بانک", owner: "فناوری اطلاعات", goals: [1, 3, 6], score: 92, contribution: "مستقیم", decision: "مصوب" },
  { id: 2, project: "بانکداری همراه نسل جدید", owner: "بانکداری دیجیتال", goals: [2, 4], score: 88, contribution: "مستقیم", decision: "مصوب" },
  { id: 3, project: "نوسازی مرکز داده و زیرساخت سراسری", owner: "فناوری اطلاعات", goals: [1, 4, 6], score: 74, contribution: "پشتیبان", decision: "مصوب" },
  { id: 4, project: "هوشمندسازی تجربه مشتریان", owner: "توسعه کسب‌وکار", goals: [2, 6], score: 61, contribution: "مستقیم", decision: "نیازمند بازنگری" },
];

function Modal({ title, subtitle, onClose, children, footer }: { title: string; subtitle: string; onClose: () => void; children: ReactNode; footer?: ReactNode }) {
  return <div className="ops-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}><section className="ops-modal strategy-modal" role="dialog" aria-modal="true" aria-label={title}><header><div><small>{subtitle}</small><h2>{title}</h2></div><button onClick={onClose} aria-label="بستن"><X size={19} /></button></header><div className="ops-modal-body">{children}</div>{footer && <footer>{footer}</footer>}</section></div>;
}

function Progress({ value }: { value: number }) {
  return <div className="strategy-progress"><div><i style={{ width: `${Math.min(value, 100)}%` }} /></div><strong>{value}٪</strong></div>;
}

function Status({ value }: { value: string }) {
  const tone = value.includes("مطلوب") || value.includes("مصوب") || value.includes("تکمیل") ? "success" : value.includes("بحرانی") || value.includes("بازنگری") ? "danger" : value.includes("توجه") || value.includes("برنامه") ? "warning" : "info";
  return <span className={`ops-badge ${tone}`}>{value}</span>;
}

export default function StrategyWorkspace({ collapsed }: { collapsed: boolean }) {
  const [tab, setTab] = useState<Tab>("نمای کلی");
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState("۱۴۰۵");
  const [goals, setGoals] = useState(initialGoals);
  const [kpis, setKpis] = useState(initialKpis);
  const [initiatives, setInitiatives] = useState(initialInitiatives);
  const [alignments, setAlignments] = useState(initialAlignments);
  const [modal, setModal] = useState<StrategyModal>(null);
  const [draftGoal, setDraftGoal] = useState<Partial<Goal>>({});
  const [toast, setToast] = useState("");

  const filteredGoals = useMemo(() => goals.filter((goal) => `${goal.title} ${goal.code} ${goal.owner} ${goal.perspective}`.includes(search)), [goals, search]);
  const strategyScore = Math.round(goals.reduce((total, goal) => total + goal.progress * goal.weight, 0) / goals.reduce((total, goal) => total + goal.weight, 0));

  function notify(text: string) {
    setToast(text);
    window.setTimeout(() => setToast(""), 2500);
  }

  function openGoal(goal?: Goal) {
    setDraftGoal(goal ?? { title: "", perspective: "فرآیندهای داخلی", owner: "دفتر مدیریت پروژه", weight: 10, progress: 0, status: "مطلوب", linkedProjects: 0, description: "" });
    setModal({ type: "goal", id: goal?.id });
  }

  function saveGoal() {
    if (!draftGoal.title?.trim()) return notify("عنوان هدف راهبردی را وارد کنید.");
    const id = modal?.type === "goal" ? modal.id : undefined;
    const goal: Goal = {
      id: id ?? Math.max(0, ...goals.map((item) => item.id)) + 1,
      code: id ? goals.find((item) => item.id === id)?.code ?? "" : `STG-N-${String(goals.length + 1).padStart(2, "0")}`,
      title: draftGoal.title,
      perspective: draftGoal.perspective ?? "فرآیندهای داخلی",
      owner: draftGoal.owner ?? "دفتر مدیریت پروژه",
      weight: Number(draftGoal.weight ?? 10),
      progress: Number(draftGoal.progress ?? 0),
      status: draftGoal.status ?? "مطلوب",
      linkedProjects: draftGoal.linkedProjects ?? 0,
      description: draftGoal.description ?? "",
    };
    setGoals((current) => id ? current.map((item) => item.id === id ? goal : item) : [goal, ...current]);
    setModal(null);
    notify(id ? "هدف راهبردی ویرایش شد." : "هدف راهبردی ثبت شد.");
  }

  const tabs: { label: Tab; icon: typeof Gauge }[] = [
    { label: "نمای کلی", icon: Gauge },
    { label: "نقشه استراتژی", icon: GitBranch },
    { label: "اهداف راهبردی", icon: Target },
    { label: "شاخص‌های کلیدی", icon: Activity },
    { label: "ابتکارها و برنامه‌ها", icon: Lightbulb },
    { label: "هم‌راستایی پروژه‌ها", icon: Link2 },
  ];

  function overview() {
    return <>
      <div className="strategy-overview-grid">
        <article className="strategy-score-card"><div className="strategy-ring" style={{ "--score": strategyScore } as React.CSSProperties}><span><strong>{strategyScore}٪</strong><small>امتیاز تحقق</small></span></div><div><small>عملکرد کل استراتژی</small><h2>وضعیت پایدار و رو به رشد</h2><p>تحقق موزون اهداف نسبت به دوره قبل ۶٪ بهبود یافته است.</p><span><TrendingUp size={14} /> ۶٪ رشد دوره‌ای</span></div></article>
        <article className="strategy-stat"><span className="blue"><Target size={21} /></span><div><small>اهداف راهبردی</small><strong>{goals.length}</strong><em>{goals.filter((goal) => goal.status === "مطلوب").length} هدف در وضعیت مطلوب</em></div></article>
        <article className="strategy-stat"><span className="green"><Activity size={21} /></span><div><small>شاخص‌های فعال</small><strong>{kpis.length}</strong><em>{kpis.filter((item) => item.actual >= item.target).length} شاخص محقق‌شده</em></div></article>
        <article className="strategy-stat"><span className="orange"><CircleAlert size={21} /></span><div><small>نیازمند اقدام</small><strong>{goals.filter((goal) => goal.status !== "مطلوب").length}</strong><em>هدف با انحراف معنادار</em></div></article>
      </div>
      <div className="strategy-dashboard-grid">
        <section className="ops-panel strategy-perspective-progress"><header><div><small>کارت امتیازی متوازن</small><h2>تحقق منظرهای استراتژی</h2></div><button onClick={() => setTab("نقشه استراتژی")}>مشاهده نقشه <ArrowLeft size={15} /></button></header><div>{perspectives.map((perspective) => { const items = goals.filter((goal) => goal.perspective === perspective.title); const avg = Math.round(items.reduce((sum, goal) => sum + goal.progress, 0) / Math.max(1, items.length)); const Icon = perspective.icon; return <article key={perspective.title}><span className={perspective.tone}><Icon size={18} /></span><div><p><strong>{perspective.title}</strong><b>{avg}٪</b></p><Progress value={avg} /><small>{items.length} هدف راهبردی</small></div></article>; })}</div></section>
        <section className="ops-panel strategy-alerts"><header><div><small>هشدارهای مدیریتی</small><h2>اهداف نیازمند توجه</h2></div><span>{goals.filter((goal) => goal.status !== "مطلوب").length} مورد</span></header>{goals.filter((goal) => goal.status !== "مطلوب").map((goal) => <article key={goal.id}><span className={goal.status === "بحرانی" ? "critical" : "warning"}><CircleAlert size={17} /></span><div><strong>{goal.title}</strong><p>{goal.owner} · پیشرفت {goal.progress}٪</p></div><button onClick={() => setModal({ type: "goal-detail", id: goal.id })}><Eye size={15} /></button></article>)}</section>
      </div>
    </>;
  }

  function strategyMap() {
    return <section className="strategy-map"><header><div><small>مدل کارت امتیازی متوازن</small><h2>نقشه استراتژی بانک سپه</h2><p>ارتباط علّی اهداف از توانمندسازها تا نتایج مالی و ذی‌نفعان</p></div><span><Sparkles size={16} /> نسخه مصوب ۱۴۰۵</span></header><div className="strategy-map-body">{perspectives.map((perspective, index) => { const Icon = perspective.icon; return <div className={`map-lane ${perspective.tone}`} key={perspective.title}><aside><span><Icon size={20} /></span><strong>{perspective.title}</strong><small>{perspective.description}</small></aside><div>{goals.filter((goal) => goal.perspective === perspective.title).map((goal) => <button key={goal.id} onClick={() => setModal({ type: "goal-detail", id: goal.id })}><span>{goal.code}</span><strong>{goal.title}</strong><footer><Status value={goal.status} /><b>{goal.progress}٪</b></footer></button>)}{!goals.some((goal) => goal.perspective === perspective.title) && <em>هدفی در این منظر تعریف نشده است.</em>}</div>{index < perspectives.length - 1 && <i className="map-flow"><TrendingUp size={17} /></i>}</div>; })}</div></section>;
  }

  function goalsTable() {
    return <section className="ops-panel strategy-table-panel"><div className="strategy-table-tools"><div><strong>فهرست اهداف راهبردی</strong><span>{filteredGoals.length} هدف در دوره {period}</span></div><div><button><Filter size={15} /> فیلتر منظر <ChevronDown size={13} /></button><button><FileSpreadsheet size={15} /> خروجی اکسل</button></div></div><div className="ops-table-wrap"><table><thead><tr><th>کد / عنوان هدف</th><th>منظر</th><th>متولی</th><th>وزن</th><th>پیشرفت</th><th>پروژه‌های مرتبط</th><th>وضعیت</th><th>عملیات</th></tr></thead><tbody>{filteredGoals.map((goal) => <tr key={goal.id}><td><strong>{goal.title}</strong><small>{goal.code}</small></td><td>{goal.perspective}</td><td><span className="person-cell"><UserRound size={14} />{goal.owner}</span></td><td>{goal.weight}٪</td><td><Progress value={goal.progress} /></td><td><span className="linked-projects"><FolderKanban size={14} />{goal.linkedProjects} پروژه</span></td><td><Status value={goal.status} /></td><td><div className="ops-actions"><button onClick={() => setModal({ type: "goal-detail", id: goal.id })}><Eye size={15} /></button><button onClick={() => openGoal(goal)}><Pencil size={15} /></button><button onClick={() => { setGoals((current) => current.filter((item) => item.id !== goal.id)); notify("هدف راهبردی حذف شد."); }}><Trash2 size={15} /></button></div></td></tr>)}</tbody></table></div></section>;
  }

  function kpiCenter() {
    return <div className="strategy-kpi-grid">{kpis.filter((item) => `${item.title} ${item.code}`.includes(search)).map((kpi) => { const goal = goals.find((item) => item.id === kpi.goalId); const ratio = Math.round(kpi.actual / Math.max(1, kpi.target) * 100); const healthy = kpi.unit === "روز" ? kpi.actual <= kpi.target : kpi.actual >= kpi.target; return <article key={kpi.id}><header><span className={healthy ? "healthy" : "attention"}><Activity size={20} /></span><div><small>{kpi.code}</small><strong>{kpi.title}</strong></div><button onClick={() => setModal({ type: "kpi", id: kpi.id })}><Pencil size={15} /></button></header><p>{goal?.title}</p><div className="kpi-values"><div><small>مقدار واقعی</small><strong>{kpi.actual} <i>{kpi.unit}</i></strong></div><div><small>هدف دوره</small><strong>{kpi.target} <i>{kpi.unit}</i></strong></div></div><Progress value={Math.min(ratio, 100)} /><footer><span>{kpi.frequency}</span><b className={kpi.trend === "up" ? "up" : "down"}>{kpi.trend === "up" ? <TrendingUp size={15} /> : <TrendingDown size={15} />}{healthy ? "در مسیر هدف" : "دارای انحراف"}</b></footer></article>; })}</div>;
  }

  function initiativeCenter() {
    return <div className="initiative-board"><section><header><span>برنامه‌ریزی</span><b>{initiatives.filter((item) => item.status === "برنامه‌ریزی").length}</b></header>{initiatives.filter((item) => item.status === "برنامه‌ریزی").map(initiativeCard)}</section><section><header><span>در حال اجرا</span><b>{initiatives.filter((item) => item.status === "در حال اجرا").length}</b></header>{initiatives.filter((item) => item.status === "در حال اجرا").map(initiativeCard)}</section><section><header><span>تکمیل‌شده</span><b>{initiatives.filter((item) => item.status === "تکمیل‌شده").length}</b></header>{initiatives.filter((item) => item.status === "تکمیل‌شده").map(initiativeCard)}</section></div>;
  }

  function initiativeCard(item: Initiative) {
    const goal = goals.find((goalItem) => goalItem.id === item.goalId);
    return <article key={item.id}><div><span><Lightbulb size={17} /></span><button onClick={() => setModal({ type: "initiative", id: item.id })}><Pencil size={14} /></button></div><strong>{item.title}</strong><small>{goal?.code} · {goal?.title}</small><p><UserRound size={13} />{item.manager}</p><Progress value={item.progress} /><footer><span>{item.budget}</span><Status value={item.status} /></footer></article>;
  }

  function alignmentCenter() {
    return <section className="ops-panel alignment-panel"><header><div><small>پیوند استراتژی و اجرا</small><h2>ماتریس هم‌راستایی پروژه‌ها</h2><p>امتیازدهی به میزان مشارکت پروژه‌ها در تحقق اهداف راهبردی</p></div><div className="alignment-legend"><span><i className="strong" />هم‌راستایی قوی</span><span><i className="medium" />متوسط</span><span><i className="weak" />نیازمند بازنگری</span></div></header><div className="ops-table-wrap"><table><thead><tr><th>پروژه</th><th>واحد مالک</th><th>اهداف مرتبط</th><th>نوع مشارکت</th><th>امتیاز هم‌راستایی</th><th>تصمیم سبد</th><th>عملیات</th></tr></thead><tbody>{alignments.map((item) => <tr key={item.id}><td><strong>{item.project}</strong></td><td>{item.owner}</td><td><div className="goal-code-list">{item.goals.map((id) => <span key={id}>{goals.find((goal) => goal.id === id)?.code}</span>)}</div></td><td>{item.contribution}</td><td><div className={`alignment-score ${item.score >= 80 ? "strong" : item.score >= 65 ? "medium" : "weak"}`}><b>{item.score}</b><span>از ۱۰۰</span></div></td><td><Status value={item.decision} /></td><td><div className="ops-actions"><button onClick={() => setModal({ type: "alignment", id: item.id })}><Eye size={15} /></button><button onClick={() => setModal({ type: "alignment", id: item.id })}><Pencil size={15} /></button></div></td></tr>)}</tbody></table></div></section>;
  }

  function renderModal() {
    if (!modal) return null;
    if (modal.type === "goal") return <Modal title={modal.id ? "ویرایش هدف راهبردی" : "تعریف هدف راهبردی"} subtitle="مشخصات هدف و مسئولیت تحقق" onClose={() => setModal(null)} footer={<><button className="secondary" onClick={() => setModal(null)}>انصراف</button><button className="primary" onClick={saveGoal}><Save size={16} /> ذخیره هدف</button></>}><div className="ops-form-grid"><label className="wide"><span>عنوان هدف *</span><input value={draftGoal.title ?? ""} onChange={(event) => setDraftGoal((value) => ({ ...value, title: event.target.value }))} placeholder="عنوان روشن و نتیجه‌محور هدف" /></label><label><span>منظر استراتژی</span><select value={draftGoal.perspective} onChange={(event) => setDraftGoal((value) => ({ ...value, perspective: event.target.value as Perspective }))}>{perspectives.map((item) => <option key={item.title}>{item.title}</option>)}</select></label><label><span>متولی هدف</span><select value={draftGoal.owner} onChange={(event) => setDraftGoal((value) => ({ ...value, owner: event.target.value }))}><option>دفتر مدیریت پروژه</option><option>معاونت برنامه‌ریزی</option><option>فناوری اطلاعات</option><option>سرمایه انسانی</option><option>معاونت بانکداری</option></select></label><label><span>وزن هدف (درصد)</span><input type="number" min="0" max="100" value={draftGoal.weight ?? 0} onChange={(event) => setDraftGoal((value) => ({ ...value, weight: Number(event.target.value) }))} /></label><label><span>وضعیت</span><select value={draftGoal.status} onChange={(event) => setDraftGoal((value) => ({ ...value, status: event.target.value as Goal["status"] }))}><option>مطلوب</option><option>نیازمند توجه</option><option>بحرانی</option></select></label><label><span>تاریخ شروع</span><input defaultValue="۱۴۰۵/۰۱/۰۱" /></label><label><span>تاریخ پایان</span><input defaultValue="۱۴۰۵/۱۲/۲۹" /></label><label className="wide"><span>شرح و نتیجه مورد انتظار</span><textarea rows={4} value={draftGoal.description ?? ""} onChange={(event) => setDraftGoal((value) => ({ ...value, description: event.target.value }))} /></label></div></Modal>;
    if (modal.type === "goal-detail") { const goal = goals.find((item) => item.id === modal.id)!; return <Modal title={goal.title} subtitle={`${goal.code} · ${goal.perspective}`} onClose={() => setModal(null)} footer={<button className="primary" onClick={() => openGoal(goal)}><Pencil size={16} /> ویرایش هدف</button>}><div className="detail-summary"><div><span>متولی</span><strong>{goal.owner}</strong></div><div><span>وزن</span><strong>{goal.weight}٪</strong></div><div><span>پیشرفت</span><strong>{goal.progress}٪</strong></div><div><span>وضعیت</span><Status value={goal.status} /></div></div><div className="detail-text"><strong>شرح هدف</strong><p>{goal.description}</p></div><div className="goal-detail-grid"><section><header><Activity size={17} /><strong>شاخص‌های مرتبط</strong></header>{kpis.filter((item) => item.goalId === goal.id).map((item) => <p key={item.id}><span>{item.code}</span><b>{item.title}</b><em>{item.actual} / {item.target} {item.unit}</em></p>)}</section><section><header><Lightbulb size={17} /><strong>ابتکارهای مرتبط</strong></header>{initiatives.filter((item) => item.goalId === goal.id).map((item) => <p key={item.id}><span>{item.progress}٪</span><b>{item.title}</b><Status value={item.status} /></p>)}</section></div></Modal>; }
    if (modal.type === "kpi") { const item = kpis.find((kpi) => kpi.id === modal.id); return <Modal title={item ? "به‌روزرسانی شاخص" : "تعریف شاخص کلیدی"} subtitle="مقدار هدف، واقعی و دوره اندازه‌گیری" onClose={() => setModal(null)} footer={<button className="primary" onClick={() => { if (item) setKpis((current) => current.map((kpi) => kpi.id === item.id ? { ...kpi, actual: kpi.actual + 1 } : kpi)); setModal(null); notify("اطلاعات شاخص ذخیره شد."); }}><Save size={16} /> ذخیره شاخص</button>}><div className="ops-form-grid"><label className="wide"><span>عنوان شاخص</span><input defaultValue={item?.title} placeholder="عنوان شاخص قابل‌اندازه‌گیری" /></label><label><span>هدف راهبردی</span><select defaultValue={item?.goalId}>{goals.map((goal) => <option value={goal.id} key={goal.id}>{goal.code} - {goal.title}</option>)}</select></label><label><span>تناوب اندازه‌گیری</span><select defaultValue={item?.frequency}><option>ماهانه</option><option>فصلی</option><option>شش‌ماهه</option><option>سالانه</option></select></label><label><span>مقدار هدف</span><input type="number" defaultValue={item?.target} /></label><label><span>مقدار واقعی</span><input type="number" defaultValue={item?.actual} /></label><label><span>واحد اندازه‌گیری</span><input defaultValue={item?.unit} /></label><label><span>مسئول اندازه‌گیری</span><select><option>دفتر مدیریت پروژه</option><option>معاونت برنامه‌ریزی</option><option>فناوری اطلاعات</option></select></label></div></Modal>; }
    if (modal.type === "initiative") { const item = initiatives.find((initiative) => initiative.id === modal.id); return <Modal title={item ? "ویرایش ابتکار راهبردی" : "تعریف ابتکار راهبردی"} subtitle="برنامه اجرایی تحقق اهداف" onClose={() => setModal(null)} footer={<button className="primary" onClick={() => { if (!item) setInitiatives((current) => [...current, { id: Date.now(), title: "ابتکار راهبردی جدید", goalId: goals[0].id, manager: "مدیر سامانه", budget: "۰ ریال", progress: 0, status: "برنامه‌ریزی" }]); setModal(null); notify("ابتکار راهبردی ذخیره شد."); }}><Save size={16} /> ذخیره ابتکار</button>}><div className="ops-form-grid"><label className="wide"><span>عنوان ابتکار</span><input defaultValue={item?.title} placeholder="عنوان برنامه یا ابتکار" /></label><label><span>هدف مرتبط</span><select defaultValue={item?.goalId}>{goals.map((goal) => <option value={goal.id} key={goal.id}>{goal.code} - {goal.title}</option>)}</select></label><label><span>مدیر ابتکار</span><select defaultValue={item?.manager}><option>مدیر سامانه</option><option>علی رضایی</option><option>مریم احمدی</option><option>سارا محمدی</option></select></label><label><span>بودجه مصوب</span><input defaultValue={item?.budget} /></label><label><span>وضعیت</span><select defaultValue={item?.status}><option>برنامه‌ریزی</option><option>در حال اجرا</option><option>تکمیل‌شده</option></select></label><label className="wide"><span>شرح برنامه اجرایی</span><textarea rows={4} /></label></div></Modal>; }
    const item = alignments.find((alignment) => alignment.id === modal.id); return <Modal title={item?.project ?? "ارزیابی هم‌راستایی پروژه"} subtitle="ماتریس ارتباط پروژه و اهداف" onClose={() => setModal(null)} footer={<button className="primary" onClick={() => { if (item) setAlignments((current) => current.map((alignment) => alignment.id === item.id ? { ...alignment, decision: "مصوب" } : alignment)); setModal(null); notify("ارزیابی هم‌راستایی ذخیره شد."); }}><Check size={16} /> ثبت ارزیابی</button>}><div className="alignment-detail"><div className="alignment-big-score"><strong>{item?.score}</strong><span>امتیاز هم‌راستایی</span></div><div><small>واحد مالک</small><strong>{item?.owner}</strong><small>نوع مشارکت</small><strong>{item?.contribution}</strong><small>تصمیم سبد</small><Status value={item?.decision ?? ""} /></div></div><div className="alignment-goals"><strong>اهداف راهبردی مرتبط</strong>{item?.goals.map((id) => { const goal = goals.find((goalItem) => goalItem.id === id)!; return <label key={id}><input type="checkbox" defaultChecked /><span><b>{goal.code}</b>{goal.title}</span><select defaultValue="مستقیم"><option>مستقیم</option><option>پشتیبان</option></select><input type="number" defaultValue="30" min="0" max="100" /></label>; })}</div></Modal>;
  }

  const addAction = tab === "اهداف راهبردی" ? () => openGoal() : tab === "شاخص‌های کلیدی" ? () => setModal({ type: "kpi" }) : tab === "ابتکارها و برنامه‌ها" ? () => setModal({ type: "initiative" }) : tab === "هم‌راستایی پروژه‌ها" ? () => setModal({ type: "alignment" }) : null;
  const addLabel = tab === "اهداف راهبردی" ? "هدف جدید" : tab === "شاخص‌های کلیدی" ? "شاخص جدید" : tab === "ابتکارها و برنامه‌ها" ? "ابتکار جدید" : "ارزیابی پروژه";

  return <section className={`projects-workspace operations-workspace strategy-workspace ${collapsed ? "sidebar-collapsed" : ""}`}>
    <header className="ops-heading strategy-heading"><div className="ops-title"><span><Target size={24} /></span><div><small>راهبری و هم‌راستایی</small><h1>مدیریت استراتژی پروژه‌ها</h1><p>تبدیل اهداف راهبردی به شاخص، ابتکار و پروژه‌های قابل پایش</p></div></div><div className="ops-header-actions"><label><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="جست‌وجو در اهداف و شاخص‌ها..." /></label><select className="strategy-period" value={period} onChange={(event) => setPeriod(event.target.value)}><option>۱۴۰۵</option><option>۱۴۰۴</option><option>۱۴۰۳</option></select>{addAction && <button className="ops-primary" onClick={addAction}><Plus size={18} />{addLabel}</button>}</div></header>
    <nav className="strategy-tabs" aria-label="بخش‌های مدیریت استراتژی">{tabs.map((item) => { const Icon = item.icon; return <button key={item.label} className={tab === item.label ? "active" : ""} onClick={() => setTab(item.label)}><span><Icon size={17} /></span>{item.label}</button>; })}</nav>
    {tab === "نمای کلی" && overview()}{tab === "نقشه استراتژی" && strategyMap()}{tab === "اهداف راهبردی" && goalsTable()}{tab === "شاخص‌های کلیدی" && kpiCenter()}{tab === "ابتکارها و برنامه‌ها" && initiativeCenter()}{tab === "هم‌راستایی پروژه‌ها" && alignmentCenter()}
    {renderModal()}{toast && <div className="ops-toast"><Check size={16} />{toast}</div>}
  </section>;
}
