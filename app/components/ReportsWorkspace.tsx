"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  BarChart3,
  CalendarClock,
  Check,
  ChevronDown,
  CircleAlert,
  CircleDollarSign,
  Download,
  Eye,
  FileBarChart,
  FileSpreadsheet,
  Filter,
  FolderKanban,
  Gauge,
  LayoutDashboard,
  LineChart,
  Plus,
  Printer,
  RefreshCcw,
  Search,
  Settings2,
  ShieldAlert,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";

type View = "داشبورد اجرایی" | "عملکرد سبد" | "زمان و پیشرفت" | "هزینه و بودجه" | "ریسک و اقدامات" | "گزارش‌ساز";
type ReportModal = { type: "report" | "designer" | "drilldown"; title: string } | null;

const portfolioRows = [
  ["توسعه سامانه مدیریت پروژه بانک", "فناوری اطلاعات", "۸۴٪", "۷۸٪", "+۶ روز", "مطلوب"],
  ["بانکداری همراه نسل جدید", "بانکداری دیجیتال", "۷۲٪", "۶۷٪", "+۱۲ روز", "نیازمند توجه"],
  ["نوسازی مرکز داده سراسری", "فناوری اطلاعات", "۶۱٪", "۵۴٪", "+۲۱ روز", "بحرانی"],
  ["هوشمندسازی تجربه مشتریان", "توسعه کسب‌وکار", "۴۸٪", "۵۱٪", "بدون انحراف", "مطلوب"],
  ["ارتقای زیرساخت شعب منتخب", "ساختمان و املاک", "۴۳٪", "۳۸٪", "+۸ روز", "نیازمند توجه"],
];

const reportCatalog = [
  { title: "گزارش جامع وضعیت پروژه", description: "منشور، پیشرفت، زمان، هزینه، ریسک، اقدام و آخرین تصمیم‌ها", category: "پروژه", format: "PDF / Excel", icon: FileBarChart },
  { title: "گزارش عملکرد سبد پروژه‌ها", description: "نمای مقایسه‌ای پروژه‌ها بر اساس واحد، وضعیت و درصد تحقق", category: "سبد", format: "Excel", icon: FolderKanban },
  { title: "گزارش زمان‌بندی و مسیر بحرانی", description: "فعالیت‌های کلیدی، نقاط عطف، تأخیرها و پیش‌بینی پایان", category: "زمان", format: "PDF / Excel", icon: CalendarClock },
  { title: "گزارش بودجه و جریان هزینه", description: "بودجه مصوب، هزینه واقعی، تعهدات و پیش‌بینی تکمیل", category: "مالی", format: "Excel", icon: CircleDollarSign },
  { title: "گزارش ریسک‌ها و برنامه پاسخ", description: "ماتریس ریسک، مالک، روند تغییر و اثربخشی برنامه پاسخ", category: "ریسک", format: "PDF", icon: ShieldAlert },
  { title: "گزارش اقدامات و وظایف باز", description: "مسئول، سررسید، اولویت، وضعیت و میزان تأخیر اقدامات", category: "اقدامات", format: "Excel", icon: Target },
  { title: "گزارش شاخص‌های عملکرد", description: "مقادیر هدف و واقعی KPIها با روند و تحلیل انحراف", category: "شاخص", format: "PDF / Excel", icon: Gauge },
  { title: "گزارش گردش تأییدات", description: "درخواست‌ها، زمان پاسخ، تصمیم‌ها و گلوگاه‌های گردش کار", category: "فرآیند", format: "Excel", icon: RefreshCcw },
];

function Modal({ title, subtitle, onClose, children, footer }: { title: string; subtitle: string; onClose: () => void; children: ReactNode; footer?: ReactNode }) {
  return <div className="ops-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="ops-modal reports-modal" role="dialog" aria-modal="true" aria-label={title}><header><div><small>{subtitle}</small><h2>{title}</h2></div><button onClick={onClose} aria-label="بستن"><X size={19} /></button></header><div className="ops-modal-body">{children}</div>{footer && <footer>{footer}</footer>}</section></div>;
}

function Status({ value }: { value: string }) {
  const tone = value.includes("مطلوب") || value.includes("انجام") ? "success" : value.includes("بحرانی") ? "danger" : value.includes("توجه") ? "warning" : "info";
  return <span className={`ops-badge ${tone}`}>{value}</span>;
}

export default function ReportsWorkspace({ collapsed }: { collapsed: boolean }) {
  const [view, setView] = useState<View>("داشبورد اجرایی");
  const [period, setPeriod] = useState("شهریور ۱۴۰۵");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<ReportModal>(null);
  const [toast, setToast] = useState("");
  const [favoriteReports, setFavoriteReports] = useState<string[]>([]);

  const filteredReports = useMemo(() => reportCatalog.filter((item) => `${item.title} ${item.description} ${item.category}`.includes(search)), [search]);
  function notify(message: string) { setToast(message); window.setTimeout(() => setToast(""), 2400); }

  const views: { label: View; icon: typeof LayoutDashboard }[] = [
    { label: "داشبورد اجرایی", icon: LayoutDashboard },
    { label: "عملکرد سبد", icon: FolderKanban },
    { label: "زمان و پیشرفت", icon: LineChart },
    { label: "هزینه و بودجه", icon: CircleDollarSign },
    { label: "ریسک و اقدامات", icon: ShieldAlert },
    { label: "گزارش‌ساز", icon: FileBarChart },
  ];

  function ExecutiveDashboard() {
    return <>
      <div className="report-stat-grid">
        <article><span className="cyan"><FolderKanban size={21} /></span><div><small>کل پروژه‌های فعال</small><strong>۱۵</strong><em><TrendingUp size={12} /> ۳ پروژه جدید</em></div></article>
        <article><span className="blue"><Gauge size={21} /></span><div><small>میانگین پیشرفت واقعی</small><strong>۶۸٪</strong><em><TrendingUp size={12} /> ۵٪ رشد ماهانه</em></div></article>
        <article><span className="orange"><CalendarClock size={21} /></span><div><small>پروژه دارای تأخیر</small><strong>۴</strong><em className="warning"><TrendingDown size={12} /> ۲ مورد بحرانی</em></div></article>
        <article><span className="green"><CircleDollarSign size={21} /></span><div><small>تحقق بودجه مصوب</small><strong>۷۶٪</strong><em><Check size={12} /> در محدوده مجاز</em></div></article>
      </div>
      <div className="report-dashboard-layout">
        <section className="ops-panel report-trend-card"><header><div><small>روند شش‌ماهه</small><h2>پیشرفت برنامه‌ای و واقعی سبد</h2></div><span>درصد تجمعی</span></header><div className="line-chart-mock" role="img" aria-label="نمودار روند پیشرفت برنامه‌ای و واقعی"><div className="chart-grid-lines" /><div className="trend-bars">{[38,47,55,64,72,81].map((value, index) => <i key={value} style={{ height: `${value}%` }}><b style={{ height: `${Math.max(22, value - (index % 3 + 3) * 3)}%` }} /></i>)}</div><footer>{["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور"].map((month) => <span key={month}>{month}</span>)}</footer></div><div className="chart-key"><span><i className="planned" />برنامه‌ای</span><span><i className="actual" />واقعی</span></div></section>
        <section className="ops-panel report-health-card"><header><div><small>سلامت سبد</small><h2>توزیع وضعیت پروژه‌ها</h2></div><button onClick={() => setView("عملکرد سبد")}><Eye size={15} /></button></header><div className="report-donut"><div><strong>۱۵</strong><small>پروژه</small></div></div><div className="health-legend"><p><i className="healthy" /><span>مطلوب</span><strong>۹</strong></p><p><i className="attention" /><span>نیازمند توجه</span><strong>۴</strong></p><p><i className="critical" /><span>بحرانی</span><strong>۲</strong></p></div></section>
      </div>
      <section className="ops-panel executive-summary-table"><header><div><small>پایش کلیدی</small><h2>پروژه‌های نیازمند تصمیم مدیریت</h2></div><button onClick={() => setModal({ type: "report", title: "گزارش پروژه‌های نیازمند تصمیم" })}>مشاهده گزارش <Eye size={14} /></button></header><div className="ops-table-wrap"><table><thead><tr><th>پروژه</th><th>واحد مالک</th><th>برنامه</th><th>واقعی</th><th>انحراف زمان</th><th>وضعیت</th></tr></thead><tbody>{portfolioRows.slice(1, 4).map((row) => <tr key={row[0]}>{row.map((cell, index) => <td key={cell}>{index === 0 ? <strong>{cell}</strong> : index === 5 ? <Status value={cell} /> : cell}</td>)}</tr>)}</tbody></table></div></section>
    </>;
  }

  function PortfolioView() {
    return <section className="ops-panel report-table-panel"><header className="report-panel-heading"><div><small>تحلیل مقایسه‌ای</small><h2>عملکرد سبد پروژه‌ها</h2><p>مقایسه برنامه، عملکرد و سلامت اجرایی پروژه‌ها</p></div><div><button><Filter size={15} /> فیلترها <ChevronDown size={13} /></button><button onClick={() => notify("خروجی اکسل آماده شد.")}><FileSpreadsheet size={15} /> خروجی اکسل</button></div></header><div className="report-portfolio-chart">{portfolioRows.map((row) => <article key={row[0]}><div><strong>{row[0]}</strong><small>{row[1]}</small></div><div className="dual-progress"><span><i style={{ width: row[2] }} /><b>{row[2]}</b></span><span><i style={{ width: row[3] }} /><b>{row[3]}</b></span></div><Status value={row[5]} /></article>)}</div><div className="ops-table-wrap"><table><thead><tr><th>پروژه</th><th>واحد مالک</th><th>پیشرفت برنامه‌ای</th><th>پیشرفت واقعی</th><th>انحراف زمان</th><th>وضعیت</th><th>جزئیات</th></tr></thead><tbody>{portfolioRows.map((row) => <tr key={row[0]}>{row.map((cell, index) => <td key={cell}>{index === 0 ? <strong>{cell}</strong> : index === 5 ? <Status value={cell} /> : cell}</td>)}<td><button className="report-row-button" onClick={() => setModal({ type: "drilldown", title: row[0] })}><Eye size={14} /></button></td></tr>)}</tbody></table></div></section>;
  }

  function ProgressView() {
    const milestones = [["تحویل نسخه پایلوت سامانه مدیریت پروژه", "۱۴۰۵/۰۶/۲۵", "فناوری اطلاعات", "۸۸٪", "در مسیر"], ["راه‌اندازی مرکز داده پشتیبان", "۱۴۰۵/۰۷/۱۰", "زیرساخت", "۶۴٪", "نیازمند توجه"], ["انتشار بانکداری همراه نسل جدید", "۱۴۰۵/۰۸/۱۵", "بانکداری دیجیتال", "۵۷٪", "نیازمند توجه"], ["پایان بازطراحی سفر مشتری", "۱۴۰۵/۰۹/۰۱", "توسعه کسب‌وکار", "۴۶٪", "در مسیر"]];
    return <div className="report-progress-layout"><section className="ops-panel schedule-performance"><header><div><small>شاخص زمان‌بندی</small><h2>عملکرد زمانی سبد</h2></div><span>SPI = ۰.۸۹</span></header><div className="schedule-gauges"><article><div className="semi-gauge good"><strong>۸۹٪</strong></div><span>شاخص عملکرد زمان</span></article><article><div className="semi-gauge medium"><strong>۷۶٪</strong></div><span>تحقق نقاط عطف</span></article><article><div className="semi-gauge danger"><strong>۴</strong></div><span>فعالیت بحرانی</span></article></div></section><section className="ops-panel milestone-panel"><header><div><small>تقویم راهبردی</small><h2>نقاط عطف پیش‌رو</h2></div><CalendarClock size={19} /></header>{milestones.map((item) => <article key={item[0]}><span><CalendarClock size={16} /></span><div><strong>{item[0]}</strong><small>{item[2]} · {item[1]}</small></div><b>{item[3]}</b><Status value={item[4]} /></article>)}</section></div>;
  }

  function FinancialView() {
    const units = [["فناوری اطلاعات", 42, 35], ["ساختمان و املاک", 30, 24], ["بانکداری دیجیتال", 22, 18], ["پشتیبانی", 15, 11]];
    return <><div className="finance-summary"><article><small>بودجه مصوب</small><strong>۱,۰۹۰</strong><span>میلیارد ریال</span></article><article><small>هزینه واقعی</small><strong>۸۲۵</strong><span>میلیارد ریال</span></article><article><small>تعهدات باز</small><strong>۱۴۸</strong><span>میلیارد ریال</span></article><article><small>پیش‌بینی تکمیل</small><strong>۱,۰۶۲</strong><span>میلیارد ریال</span></article></div><div className="report-finance-layout"><section className="ops-panel unit-budget"><header><div><small>بودجه واحدها</small><h2>مصوب در برابر هزینه واقعی</h2></div><CircleDollarSign size={19} /></header>{units.map((unit) => <article key={unit[0]}><div><strong>{unit[0]}</strong><span>{unit[2]} از {unit[1]} میلیارد</span></div><p><i style={{ width: `${unit[1] * 2}%` }} /><b style={{ width: `${unit[2] * 2}%` }} /></p></article>)}</section><section className="ops-panel cost-analysis"><header><small>تحلیل مالی</small><h2>شاخص‌های ارزش کسب‌شده</h2></header><div><article><span>CV</span><strong>+۲.۸٪</strong><small>انحراف هزینه</small></article><article><span>CPI</span><strong>۱.۰۳</strong><small>عملکرد هزینه</small></article><article><span>EAC</span><strong>۱,۰۶۲</strong><small>برآورد تکمیل</small></article><article><span>VAC</span><strong>۲۸+</strong><small>انحراف پایان</small></article></div></section></div></>;
  }

  function RiskView() {
    return <div className="risk-report-layout"><section className="ops-panel risk-heatmap-card"><header><div><small>نقشه حرارتی</small><h2>ریسک‌های فعال سبد</h2></div><span>۲۱ ریسک</span></header><div className="risk-matrix">{Array.from({ length: 25 }, (_, index) => { const level = index > 18 ? "high" : index > 10 ? "medium" : "low"; return <button className={level} key={index} onClick={() => setModal({ type: "drilldown", title: "ریسک‌های خانه انتخاب‌شده" })}>{[0,0,1,2,1,0,1,2,2,1,0,1,3,1,0,1,2,1,1,0,1,0,0,0,0][index] || ""}</button>; })}</div><footer><span>احتمال ←</span><span>اثر ↑</span></footer></section><section className="ops-panel risk-actions-card"><header><div><small>اقدام مدیریتی</small><h2>ریسک‌ها و اقدامات بحرانی</h2></div><CircleAlert size={19} /></header>{[["تأخیر در تأمین زیرساخت", "نوسازی مرکز داده", "زیاد", "برنامه جایگزین تأمین"], ["تغییر الزامات کلیدی", "بانکداری همراه", "زیاد", "کمیته کنترل تغییر"], ["کمبود منابع متخصص", "سامانه مدیریت پروژه", "متوسط", "تخصیص نیروی جایگزین"], ["ریسک یکپارچگی سامانه", "تجربه مشتری", "متوسط", "آزمون پایلوت مرحله‌ای"]].map((item) => <article key={item[0]}><span className={item[2] === "زیاد" ? "critical" : "warning"}><ShieldAlert size={16} /></span><div><strong>{item[0]}</strong><small>{item[1]}</small><p>{item[3]}</p></div><button onClick={() => setModal({ type: "drilldown", title: item[0] })}><Eye size={14} /></button></article>)}</section></div>;
  }

  function ReportBuilder() {
    return <><div className="report-library-head"><div><small>کتابخانه گزارش‌ها</small><h2>گزارش‌های آماده و سفارشی</h2><p>گزارش موردنیاز را اجرا کنید یا ساختار جدید بسازید.</p></div><button className="ops-primary" onClick={() => setModal({ type: "designer", title: "طراحی گزارش جدید" })}><Plus size={17} /> گزارش سفارشی</button></div><div className="report-catalog">{filteredReports.map((report) => { const Icon = report.icon; const favorite = favoriteReports.includes(report.title); return <article key={report.title}><header><span><Icon size={21} /></span><button className={favorite ? "favorite" : ""} onClick={() => setFavoriteReports((current) => favorite ? current.filter((title) => title !== report.title) : [...current, report.title])}><Sparkles size={16} /></button></header><small>{report.category} · {report.format}</small><h3>{report.title}</h3><p>{report.description}</p><footer><button onClick={() => setModal({ type: "report", title: report.title })}><Eye size={14} /> پیش‌نمایش</button><button onClick={() => notify(`${report.title} آماده دریافت شد.`)}><Download size={14} /> دریافت</button></footer></article>; })}</div></>;
  }

  function renderModal() {
    if (!modal) return null;
    if (modal.type === "designer") return <Modal title="طراحی گزارش جدید" subtitle="انتخاب داده، فیلتر و قالب خروجی" onClose={() => setModal(null)} footer={<><button className="secondary" onClick={() => setModal(null)}>انصراف</button><button className="primary" onClick={() => { setModal(null); notify("قالب گزارش ذخیره شد."); }}><Check size={15} /> ذخیره قالب</button></>}><div className="report-designer-grid"><section><strong>۱. منبع داده</strong>{["پروژه‌ها و منشورها", "زمان‌بندی و WBS", "هزینه و بودجه", "ریسک‌ها و اقدامات", "تأییدات و وظایف"].map((item, index) => <label key={item}><input type="radio" name="source" defaultChecked={index === 0} />{item}</label>)}</section><section><strong>۲. ستون‌های گزارش</strong>{["عنوان پروژه", "واحد مالک", "مدیر پروژه", "پیشرفت برنامه‌ای", "پیشرفت واقعی", "وضعیت", "تاریخ پایان"].map((item) => <label key={item}><input type="checkbox" defaultChecked />{item}</label>)}</section><section><strong>۳. فیلترها و خروجی</strong><label>دوره گزارش<select><option>شهریور ۱۴۰۵</option><option>سه‌ماهه دوم ۱۴۰۵</option><option>سال ۱۴۰۵</option></select></label><label>نوع خروجی<select><option>PDF</option><option>Excel</option><option>نمای داشبوردی</option></select></label><label>گروه‌بندی<select><option>واحد مالک</option><option>وضعیت</option><option>مدیر پروژه</option></select></label></section></div></Modal>;
    return <Modal title={modal.title} subtitle={modal.type === "report" ? "پیش‌نمایش گزارش" : "جزئیات تحلیلی"} onClose={() => setModal(null)} footer={<><button className="secondary" onClick={() => window.print()}><Printer size={15} /> چاپ</button><button className="secondary" onClick={() => notify("نسخه Excel آماده شد.")}><FileSpreadsheet size={15} /> Excel</button><button className="primary" onClick={() => notify("نسخه PDF آماده شد.")}><Download size={15} /> دریافت PDF</button></>}><div className="report-preview"><header><div><strong>بانک سپه</strong><span>سامانه مدیریت پروژه‌های راهبردی</span></div><div><span>دوره: {period}</span><span>تاریخ تهیه: ۱۴۰۵/۰۶/۱۹</span></div></header><h2>{modal.title}</h2><div className="preview-summary"><article><small>پروژه‌های بررسی‌شده</small><strong>۱۵</strong></article><article><small>میانگین پیشرفت</small><strong>۶۸٪</strong></article><article><small>نیازمند تصمیم</small><strong>۴</strong></article></div><div className="ops-table-wrap"><table><thead><tr><th>پروژه</th><th>واحد</th><th>برنامه</th><th>واقعی</th><th>انحراف</th><th>وضعیت</th></tr></thead><tbody>{portfolioRows.map((row) => <tr key={row[0]}>{row.map((cell, index) => <td key={cell}>{index === 5 ? <Status value={cell} /> : cell}</td>)}</tr>)}</tbody></table></div><p className="report-note">این گزارش بر اساس آخرین اطلاعات ثبت‌شده در سامانه تهیه شده است.</p></div></Modal>;
  }

  return <section className={`projects-workspace operations-workspace reports-workspace ${collapsed ? "sidebar-collapsed" : ""}`}>
    <header className="ops-heading"><div className="ops-title"><span><BarChart3 size={24} /></span><div><small>هوشمندی مدیریتی</small><h1>داشبوردها و گزارشات</h1><p>پایش یکپارچه عملکرد سبد و تهیه گزارش‌های مدیریتی</p></div></div><div className="ops-header-actions"><label><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="جست‌وجوی گزارش یا پروژه..." /></label><select className="strategy-period" value={period} onChange={(event) => setPeriod(event.target.value)}><option>شهریور ۱۴۰۵</option><option>مرداد ۱۴۰۵</option><option>سه‌ماهه دوم</option></select><button className="filter-button"><Settings2 size={17} /></button></div></header>
    <nav className="strategy-tabs report-tabs" aria-label="بخش‌های داشبورد و گزارش">{views.map((item) => { const Icon = item.icon; return <button key={item.label} className={view === item.label ? "active" : ""} onClick={() => setView(item.label)}><span><Icon size={17} /></span>{item.label}</button>; })}</nav>
    {view === "داشبورد اجرایی" && ExecutiveDashboard()}{view === "عملکرد سبد" && PortfolioView()}{view === "زمان و پیشرفت" && ProgressView()}{view === "هزینه و بودجه" && FinancialView()}{view === "ریسک و اقدامات" && RiskView()}{view === "گزارش‌ساز" && ReportBuilder()}{renderModal()}{toast && <div className="ops-toast"><Check size={16} />{toast}</div>}
  </section>;
}
