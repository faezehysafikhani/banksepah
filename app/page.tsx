"use client";

import type { ChangeEvent, CSSProperties, FormEvent, PointerEvent as ReactPointerEvent } from "react";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import type { ProjectCharter, ProjectDocument, ProjectSummary, ProjectWbsItem, ReviewStatus } from "../db/projects";
import { canManage } from "./lib/permissions";
import AchievementsSection from "./components/AchievementsSection";
import ApprovalsSection from "./components/ApprovalsSection";
import ScheduleSection from "./components/ScheduleSection";
import ReportsSection from "./components/ReportsSection";
import DateConverterModal from "./components/DateConverterModal";
import NotificationModal, { type NotificationItem } from "./components/NotificationModal";
import RiskHeatmap from "./components/charts/RiskHeatmap";
import WbsWeightDonut from "./components/charts/WbsWeightDonut";
import {
  Activity,
  Award,
  BarChart3,
  Bell,
  BookOpenCheck,
  CalendarDays,
  CalendarRange,
  ChartNoAxesCombined,
  Check,
  ChevronLeft,
  CircleGauge,
  ClipboardList,
  Clock3,
  Eye,
  EyeOff,
  FileCheck2,
  FileText,
  FolderKanban,
  Gauge,
  Inbox,
  KeyRound,
  LayoutDashboard,
  Lock,
  LogOut,
  Menu,
  MessageSquareText,
  Search,
  Settings,
  ShieldAlert,
  Sparkles,
  Target,
  TrendingUp,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";

type AuthUser = {
  id: number;
  username: string;
  displayName: string;
  role: string;
};

const navigation = [
  { label: "داشبورد مدیریتی", icon: LayoutDashboard },
  { label: "پروژه‌ها", icon: FolderKanban },
  { label: "منشور پروژه", icon: FileText },
  { label: "ساختار شکست کار", icon: ClipboardList },
  { label: "زمان‌بندی پروژه", icon: CalendarRange },
  { label: "شاخص‌های عملکرد", icon: Target },
  { label: "دستاوردهای پروژه", icon: Award },
  { label: "مدیریت ریسک", icon: ShieldAlert },
  { label: "ذی‌نفعان", icon: UsersRound },
  { label: "کارتابل تأییدات", icon: Inbox },
  { label: "گزارش‌ها", icon: BarChart3 },
];

function buildStats(projects: ProjectSummary[], charter: ProjectCharter | null) {
  const criticalRisks = charter ? charter.risks.filter((risk) => risk.rpn >= 20).length : 0;
  const avgProgress = projects.length
    ? Math.round(projects.reduce((sum, project) => sum + project.progress, 0) / projects.length)
    : 0;

  return [
    {
      title: "پروژه‌های فعال",
      value: toFaDigits(projects.length),
      detail: projects.length ? "بر اساس منشور ثبت‌شده" : "هنوز پروژه‌ای ثبت نشده",
      trend: "سامانه EPM",
      icon: FolderKanban,
      tone: "blue",
    },
    {
      title: "میانگین پیشرفت",
      value: `${toFaDigits(avgProgress)}٪`,
      detail: "بر اساس آخرین ثبت پیشرفت",
      trend: "به‌روزرسانی زنده",
      icon: ChartNoAxesCombined,
      tone: "teal",
    },
    {
      title: "فعالیت‌های WBS",
      value: toFaDigits(charter?.wbs.length ?? 0),
      detail: "ثبت‌شده در ساختار شکست کار",
      trend: "طبق منشور پروژه",
      icon: FileCheck2,
      tone: "amber",
    },
    {
      title: "ریسک‌های بحرانی",
      value: toFaDigits(criticalRisks),
      detail: charter ? `از مجموع ${toFaDigits(charter.risks.length)} ریسک شناسایی‌شده` : "در حال بارگذاری",
      trend: "RPN ≥ ۲۰",
      icon: ShieldAlert,
      tone: "rose",
    },
  ];
}

const faDigitMap = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
function toFaDigits(value: number | string) {
  return String(value).replace(/[0-9]/g, (digit) => faDigitMap[Number(digit)]);
}

const quickActions = [
  { label: "گزارش اجرایی", detail: "نمای کلان عملکرد سبد پروژه‌ها", icon: BarChart3, tone: "blue", target: "گزارش‌ها" },
  { label: "زمان‌بندی پروژه", detail: "مرور جدول زمانی فعالیت‌ها", icon: TrendingUp, tone: "teal", target: "زمان‌بندی پروژه" },
  { label: "کارتابل تأییدات", detail: "مستندات در صف بررسی", icon: BookOpenCheck, tone: "amber", target: "کارتابل تأییدات" },
];

function LoadingScreen() {
  return (
    <main className="loading-screen" aria-live="polite">
      <div className="loading-emblem">
        <Image src="/mob.banking.android.sepah_512x512.webp" alt="نشان بانک سپه" width={92} height={92} priority />
      </div>
      <div className="loading-line"><span /></div>
      <p>در حال آماده‌سازی سامانه...</p>
    </main>
  );
}

function LoginScreen({ onAuthenticated }: { onAuthenticated: (user: AuthUser) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  function handlePointerMove(event: ReactPointerEvent<HTMLElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    setTilt({ x: Math.max(-1, Math.min(1, x * 2)), y: Math.max(-1, Math.min(1, y * 2)) });
  }

  function resetTilt() {
    setTilt({ x: 0, y: 0 });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const result = (await response.json()) as { user?: AuthUser; error?: string };
      if (!response.ok || !result.user) {
        setError(result.error ?? "ورود به سامانه انجام نشد.");
        return;
      }
      onAuthenticated(result.user);
    } catch {
      setError("ارتباط با سرور برقرار نشد. لطفاً دوباره تلاش کنید.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="login-page" onPointerMove={handlePointerMove} onPointerLeave={resetTilt}>
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="login-watermark" aria-hidden="true">
        <div className="watermark-stage" style={{ "--tilt-x": tilt.x, "--tilt-y": tilt.y } as CSSProperties}>
          <span className="watermark-glow" />
          <span className="watermark-halo halo-two" />
          <span className="watermark-halo halo-one" />
          <span className="watermark-halo halo-three" />
          <Image src="/sepah-emblem.png" alt="" width={666} height={760} priority />
        </div>
      </div>
      <div className="login-grid">
        <section className="login-brand-panel" aria-label="معرفی سامانه">
          <div className="brand-topline">
            <span className="brand-logo-small"><Image src="/images.jpg" alt="بانک سپه" width={50} height={50} priority /></span>
            <span>بانک سپه</span>
          </div>

          <div className="brand-message">
            <div className="brand-pill"><Sparkles size={17} /> یکپارچه، هوشمند و شفاف</div>
            <h1>سامانه مدیریت<br /><strong>پروژه‌های راهبردی</strong></h1>
            <p>بستر یکپارچه تعریف، پایش و راهبری پروژه‌ها؛ از تدوین منشور تا تحقق دستاوردها.</p>
          </div>

          <div className="brand-features">
            <div><span><CircleGauge size={22} /></span><p><b>پایش لحظه‌ای</b><small>کنترل پیشرفت و انحراف پروژه‌ها</small></p></div>
            <div><span><FileCheck2 size={22} /></span><p><b>گردش تأیید هوشمند</b><small>فرآیند شفاف بررسی و تصویب</small></p></div>
            <div><span><ShieldAlert size={22} /></span><p><b>مدیریت ریسک</b><small>شناسایی و کنترل ریسک‌های کلیدی</small></p></div>
          </div>

          <div className="brand-footer">نسخه ۱.۰ &nbsp;•&nbsp; معاونت برنامه‌ریزی و هدایت راهبردی</div>
        </section>

        <section className="login-form-zone">
          <div className="login-card glass-card">
            <div className="login-mobile-logo"><Image src="/mob.banking.android.sepah_512x512.webp" alt="نشان بانک سپه" width={72} height={72} priority /></div>
            <div className="login-heading">
              <span className="eyebrow">ورود امن به سامانه</span>
              <h2>خوش آمدید</h2>
              <p>برای ادامه، اطلاعات حساب کاربری خود را وارد کنید.</p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              <label htmlFor="username">نام کاربری</label>
              <div className="input-shell">
                <UserRound size={20} />
                <input
                  id="username"
                  name="username"
                  autoComplete="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="نام کاربری را وارد کنید"
                  required
                />
              </div>

              <div className="field-line">
                <label htmlFor="password">رمز عبور</label>
                <button type="button" className="text-button">رمز عبور را فراموش کرده‌اید؟</button>
              </div>
              <div className="input-shell">
                <KeyRound size={20} />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="رمز عبور را وارد کنید"
                  required
                />
                <button
                  className="password-toggle"
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "مخفی کردن رمز عبور" : "نمایش رمز عبور"}
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>

              {error && <div className="login-error" role="alert"><ShieldAlert size={17} />{error}</div>}

              <button className="login-submit" type="submit" disabled={submitting}>
                {submitting ? <span className="button-loader" /> : <><span>ورود به سامانه</span><ChevronLeft size={20} /></>}
              </button>
            </form>

            <div className="security-note"><Check size={15} /> ارتباط شما با سامانه به‌صورت امن برقرار می‌شود.</div>
          </div>
          <p className="login-copyright">© ۱۴۰۵ بانک سپه؛ کلیه حقوق محفوظ است.</p>
        </section>
      </div>
    </main>
  );
}

function Dashboard({ user, onLogout }: { user: AuthUser; onLogout: () => Promise<void> }) {
  const [activeNav, setActiveNav] = useState("داشبورد مدیریتی");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [charter, setCharter] = useState<ProjectCharter | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDateConverter, setShowDateConverter] = useState(false);
  const canReview = canManage(user.role);
  const dateText = useMemo(
    () => new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date()),
    [],
  );

  function refreshCharter(projectId: number) {
    return fetch(`/api/projects/${projectId}`)
      .then((response) => response.json())
      .then((result: ProjectCharter) => {
        if (result?.project) setCharter(result);
      })
      .catch((error) => console.error("Loading project charter failed", error));
  }

  useEffect(() => {
    let active = true;
    fetch("/api/projects")
      .then((response) => response.json())
      .then((result: { projects?: ProjectSummary[] }) => {
        if (!active || !result.projects?.length) return;
        setProjects(result.projects);
        return refreshCharter(result.projects[0].id);
      })
      .catch((error) => console.error("Loading project data failed", error));
    return () => { active = false; };
  }, []);

  const stats = useMemo(() => buildStats(projects, charter), [projects, charter]);

  const notifications = useMemo<NotificationItem[]>(() => {
    if (!charter) return [];
    const items: NotificationItem[] = [];
    const pendingDocs = charter.documents.filter((doc) => doc.formStatus === "pending" || doc.contentStatus === "pending");
    if (pendingDocs.length > 0) {
      items.push({
        id: "approvals",
        icon: "approval",
        title: `${toFaDigits(pendingDocs.length)} مستند در صف بررسی`,
        detail: "برای مشاهده و تأیید به کارتابل تأییدات مراجعه کنید.",
        onClick: () => setActiveNav("کارتابل تأییدات"),
      });
    }
    const criticalRisks = charter.risks.filter((risk) => risk.rpn >= 20);
    if (criticalRisks.length > 0) {
      items.push({
        id: "risks",
        icon: "risk",
        title: `${toFaDigits(criticalRisks.length)} ریسک بحرانی شناسایی‌شده`,
        detail: "ریسک‌های با RPN بالای ۲۰ نیازمند برنامه واکنش هستند.",
        onClick: () => setActiveNav("مدیریت ریسک"),
      });
    }
    return items;
  }, [charter]);

  return (
    <main className="dashboard-shell">
      <div className="dashboard-ambient dashboard-ambient-one" />
      <div className="dashboard-ambient dashboard-ambient-two" />
      {sidebarOpen && <button className="mobile-backdrop" aria-label="بستن منو" onClick={() => setSidebarOpen(false)} />}

      <aside className={`sidebar glass-card ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand">
          <Image src="/mob.banking.android.sepah_512x512.webp" alt="نشان بانک سپه" width={46} height={46} priority />
          <div><strong>بانک سپه</strong><span>مدیریت پروژه‌ها</span></div>
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)} aria-label="بستن منو"><X size={20} /></button>
        </div>

        <div className="sidebar-context">
          <span>سامانه سازمانی</span>
          <strong>دفتر مدیریت پروژه‌ها</strong>
        </div>

        <nav className="sidebar-nav" aria-label="منوی اصلی">
          <span className="nav-label">منوی اصلی</span>
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = activeNav === item.label;
            const badge =
              item.label === "پروژه‌ها" && projects.length
                ? toFaDigits(projects.length)
                : item.label === "مدیریت ریسک" && charter
                  ? toFaDigits(charter.risks.filter((risk) => risk.rpn >= 20).length)
                  : item.label === "کارتابل تأییدات" && charter
                    ? toFaDigits(charter.documents.filter((doc) => doc.formStatus === "pending" || doc.contentStatus === "pending").length)
                    : null;
            return (
              <button
                key={item.label}
                className={active ? "active" : ""}
                onClick={() => { setActiveNav(item.label); setSidebarOpen(false); }}
              >
                <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
                <span>{item.label}</span>
                {badge && <em>{badge}</em>}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <button><Settings size={20} /><span>تنظیمات سامانه</span></button>
          <button className="logout-button" onClick={onLogout}><LogOut size={20} /><span>خروج از حساب</span></button>
          <div className="sidebar-user">
            <span className="avatar">م</span>
            <p><strong>{user.displayName}</strong><small>مدیر سامانه</small></p>
            <span className="online-dot" />
          </div>
        </div>
      </aside>

      <section className="dashboard-content">
        <header className="topbar glass-card">
          <div className="topbar-title">
            <button className="menu-toggle" onClick={() => setSidebarOpen(true)} aria-label="باز کردن منو"><Menu size={22} /></button>
            <div><span>نمای کلی سامانه</span><h1>{activeNav}</h1></div>
          </div>
          <div className="topbar-tools">
            <div className="search-box"><Search size={19} /><input aria-label="جست‌وجو" placeholder="جست‌وجوی پروژه، مدیر یا واحد..." /></div>
            <button
              className="icon-button notification-button"
              aria-label="اعلان‌ها"
              onClick={() => setShowNotifications(true)}
            >
              <Bell size={20} />
              {notifications.length > 0 && <i>{toFaDigits(notifications.length)}</i>}
            </button>
            <button className="today" onClick={() => setShowDateConverter(true)} aria-label="تبدیل تاریخ">
              <CalendarDays size={18} /><span>{dateText || "امروز"}</span>
            </button>
          </div>
        </header>

        {showNotifications && (
          <NotificationModal items={notifications} onClose={() => setShowNotifications(false)} />
        )}
        {showDateConverter && <DateConverterModal onClose={() => setShowDateConverter(false)} />}

        <div className="dashboard-scroll">
          {activeNav === "داشبورد مدیریتی" && (
            <>
              <section className="welcome-row">
                <div>
                  <span className="welcome-kicker"><Activity size={16} /> وضعیت سامانه پایدار است</span>
                  <h2>سلام، {user.displayName} <span>👋</span></h2>
                  <p>آخرین وضعیت پروژه‌ها، تأییدات و ریسک‌های سازمان را اینجا دنبال کنید.</p>
                </div>
                <div className="overview-meta glass-card" aria-label="وضعیت به‌روزرسانی داشبورد">
                  <span className="live-pulse" />
                  <p><small>آخرین همگام‌سازی</small><strong>امروز، ساعت ۱۴:۳۸</strong></p>
                  <span className="overview-divider" />
                  <p><small>دوره گزارش</small><strong>مرداد ۱۴۰۵</strong></p>
                </div>
              </section>

              <section className="stats-grid" aria-label="شاخص‌های کلیدی">
                {stats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <article className="stat-card glass-card" key={stat.title}>
                      <div className={`stat-icon ${stat.tone}`}><Icon size={23} /></div>
                      <div className="stat-heading"><span>{stat.title}</span><strong>{stat.value}</strong></div>
                      <div className="stat-footer"><span>{stat.detail}</span><em className={stat.tone}>{stat.trend}</em></div>
                    </article>
                  );
                })}
              </section>

              <section className="dashboard-grid">
                <article className="projects-panel glass-card">
                  <div className="panel-header">
                    <div><span className="panel-icon"><FolderKanban size={20} /></span><p><strong>پروژه‌های در جریان</strong><small>آخرین وضعیت پروژه‌های راهبردی</small></p></div>
                    <button onClick={() => setActiveNav("پروژه‌ها")}>مشاهده همه <ChevronLeft size={17} /></button>
                  </div>
                  {projects.length === 0 ? (
                    <div className="empty-state">در حال بارگذاری پروژه‌ها...</div>
                  ) : (
                    <div className="project-table" role="table" aria-label="پروژه‌های در جریان">
                      <div className="project-table-head" role="row">
                        <span>عنوان پروژه</span><span>پیشرفت</span><span>وضعیت</span><span>تاریخ پایان</span><span />
                      </div>
                      {projects.map((project) => (
                        <div className="project-row" role="row" key={project.id}>
                          <div className="project-name"><span className="project-mark teal"><FolderKanban size={18} /></span><p><strong>{project.name}</strong><small>{project.sponsorOrg}</small></p></div>
                          <div className="progress-cell"><div><span style={{ width: `${project.progress}%` }} /></div><b>{toFaDigits(project.progress)}٪</b></div>
                          <span className="status-pill teal">{project.status}</span>
                          <span className="project-date">{project.endDate}</span>
                          <button className="row-action" onClick={() => setActiveNav("منشور پروژه")} aria-label={`مشاهده ${project.name}`}><ChevronLeft size={18} /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </article>

                <aside className="side-panels">
                  <article className="performance-card glass-card">
                    <div className="panel-header compact">
                      <div><span className="panel-icon"><Gauge size={20} /></span><p><strong>سلامت سبد پروژه‌ها</strong><small>برآیند عملکرد کل سازمان</small></p></div>
                    </div>
                    <div className="performance-visual">
                      <div className="gauge-ring"><span><strong>{toFaDigits(charter?.project.progress ?? 0)}</strong><small>از ۱۰۰</small></span></div>
                      <div className="performance-copy"><strong>{charter?.project.status ?? "در حال بارگذاری"}</strong><span>طبق آخرین ثبت پیشرفت WBS</span></div>
                    </div>
                    <div className="performance-legend">
                      <span><i className="teal" /> ریسک کم <b>{toFaDigits(charter ? charter.risks.filter((r) => r.rpn < 10).length : 0)}</b></span>
                      <span><i className="amber" /> ریسک متوسط <b>{toFaDigits(charter ? charter.risks.filter((r) => r.rpn >= 10 && r.rpn < 20).length : 0)}</b></span>
                      <span><i className="rose" /> ریسک بحرانی <b>{toFaDigits(charter ? charter.risks.filter((r) => r.rpn >= 20).length : 0)}</b></span>
                    </div>
                  </article>

                  <article className="activity-card glass-card">
                    <div className="panel-header compact">
                      <div><span className="panel-icon"><Clock3 size={20} /></span><p><strong>خلاصه منشور پروژه</strong><small>بر اساس داده‌های ثبت‌شده</small></p></div>
                    </div>
                    <div className="activity-list">
                      <div><span className="activity-icon blue"><FileCheck2 size={17} /></span><p><strong>{toFaDigits(charter?.team.length ?? 0)} نفر در ارکان پروژه</strong><small>حامی، مدیر و ناظر پروژه</small></p></div>
                      <div><span className="activity-icon amber"><MessageSquareText size={17} /></span><p><strong>{toFaDigits(charter?.stakeholders.length ?? 0)} ذی‌نفع شناسایی‌شده</strong><small>درون‌سازمانی و برون‌سازمانی</small></p></div>
                      <div><span className="activity-icon teal"><TrendingUp size={17} /></span><p><strong>{toFaDigits(charter?.kpis.length ?? 0)} شاخص کلیدی عملکرد</strong><small>ثبت‌شده برای دستاوردهای پروژه</small></p></div>
                    </div>
                  </article>
                </aside>
              </section>

              <section className="quick-actions glass-card">
                <div className="quick-title"><span><Sparkles size={19} /></span><p><strong>دسترسی سریع</strong><small>کارهای پرتکرار سامانه</small></p></div>
                <div className="quick-list">
                  {quickActions.map((action) => {
                    const Icon = action.icon;
                    return (
                      <button key={action.label} onClick={() => setActiveNav(action.target)}>
                        <span className={`quick-icon ${action.tone}`}><Icon size={19} /></span>
                        <p><strong>{action.label}</strong><small>{action.detail}</small></p>
                        <ChevronLeft size={17} />
                      </button>
                    );
                  })}
                </div>
              </section>
            </>
          )}

          {activeNav === "پروژه‌ها" && <ProjectsSection projects={projects} onOpenCharter={() => setActiveNav("منشور پروژه")} />}
          {activeNav === "منشور پروژه" && (
            <CharterSection charter={charter} view="full" canManage={canReview} onRefresh={() => charter && refreshCharter(charter.project.id)} />
          )}
          {activeNav === "ساختار شکست کار" && (
            <CharterSection charter={charter} view="wbs" canManage={canReview} onRefresh={() => charter && refreshCharter(charter.project.id)} />
          )}
          {activeNav === "زمان‌بندی پروژه" && (
            charter ? <ScheduleSection charter={charter} /> : <div className="charter-section glass-card empty-state"><CalendarRange size={28} /><p>در حال بارگذاری زمان‌بندی...</p></div>
          )}
          {activeNav === "شاخص‌های عملکرد" && (
            <CharterSection charter={charter} view="kpi" canManage={canReview} onRefresh={() => charter && refreshCharter(charter.project.id)} />
          )}
          {activeNav === "دستاوردهای پروژه" && (
            charter ? <AchievementsSection charter={charter} /> : <div className="charter-section glass-card empty-state"><Award size={28} /><p>در حال بارگذاری دستاوردها...</p></div>
          )}
          {activeNav === "مدیریت ریسک" && (
            <CharterSection charter={charter} view="risks" canManage={canReview} onRefresh={() => charter && refreshCharter(charter.project.id)} />
          )}
          {activeNav === "ذی‌نفعان" && (
            <CharterSection charter={charter} view="stakeholders" canManage={canReview} onRefresh={() => charter && refreshCharter(charter.project.id)} />
          )}
          {activeNav === "کارتابل تأییدات" && (
            charter
              ? <ApprovalsSection charter={charter} canReview={canReview} onChanged={() => refreshCharter(charter.project.id)} />
              : <div className="charter-section glass-card empty-state"><Inbox size={28} /><p>در حال بارگذاری کارتابل...</p></div>
          )}
          {activeNav === "گزارش‌ها" && (
            charter ? <ReportsSection charter={charter} /> : <div className="charter-section glass-card empty-state"><BarChart3 size={28} /><p>در حال بارگذاری گزارش...</p></div>
          )}
        </div>
      </section>
    </main>
  );
}

function ProjectsSection({ projects, onOpenCharter }: { projects: ProjectSummary[]; onOpenCharter: () => void }) {
  return (
    <div className="charter-page">
      <article className="projects-panel glass-card">
        <div className="panel-header">
          <div><span className="panel-icon"><FolderKanban size={20} /></span><p><strong>فهرست پروژه‌ها</strong><small>پروژه‌های ثبت‌شده در سامانه مدیریت پروژه</small></p></div>
        </div>
        {projects.length === 0 ? (
          <div className="empty-state">هنوز پروژه‌ای ثبت نشده است.</div>
        ) : (
          <div className="project-table" role="table" aria-label="فهرست پروژه‌ها">
            <div className="project-table-head" role="row">
              <span>عنوان پروژه</span><span>پیشرفت</span><span>وضعیت</span><span>تاریخ پایان</span><span />
            </div>
            {projects.map((project) => (
              <div className="project-row" role="row" key={project.id}>
                <div className="project-name"><span className="project-mark teal"><FolderKanban size={18} /></span><p><strong>{project.name}</strong><small>{project.sponsorOrg} • {project.code}</small></p></div>
                <div className="progress-cell"><div><span style={{ width: `${project.progress}%` }} /></div><b>{toFaDigits(project.progress)}٪</b></div>
                <span className="status-pill teal">{project.status}</span>
                <span className="project-date">{project.endDate}</span>
                <button className="row-action" onClick={onOpenCharter} aria-label={`مشاهده منشور ${project.name}`}><ChevronLeft size={18} /></button>
              </div>
            ))}
          </div>
        )}
      </article>
    </div>
  );
}

function CharterSection({
  charter,
  view,
  canManage,
  onRefresh,
}: {
  charter: ProjectCharter | null;
  view: "full" | "wbs" | "kpi" | "risks" | "stakeholders";
  canManage: boolean;
  onRefresh: () => void;
}) {
  if (!charter) {
    return (
      <div className="charter-section glass-card empty-state">
        <FileText size={28} />
        <p>در حال بارگذاری منشور پروژه...</p>
      </div>
    );
  }

  const { project, team, kpis, wbs, risks, stakeholders, documents } = charter;
  const showOverview = view === "full";
  const showKpi = view === "full" || view === "kpi";
  const showWbs = view === "full" || view === "wbs";
  const showRisks = view === "full" || view === "risks";
  const showStakeholders = view === "full" || view === "stakeholders";

  return (
    <div className="charter-page">
      {showOverview && (
        <>
          <div className="charter-hero glass-card">
            <div>
              <div className="charter-hero-meta"><span>{project.code}</span><span>{project.sponsorOrg}</span></div>
              <h2>{project.name}</h2>
            </div>
            <div className="charter-hero-progress">
              <div className="gauge-ring" style={{ background: `conic-gradient(#20a0bd 0 ${project.progress}%, rgba(255,255,255,.12) ${project.progress}% 100%)` }}>
                <span><strong>{toFaDigits(project.progress)}</strong><small>درصد</small></span>
              </div>
              <span className="status-pill teal">{project.status}</span>
            </div>
          </div>

          <article className="charter-section glass-card">
            <h3><FileText size={16} /> شرح کلی پروژه</h3>
            {(project.strategy || project.strategyTheme) && (
              <p className="section-sub">
                {project.strategy && `استراتژی کلان: ${project.strategy}`}
                {project.strategy && project.strategyTheme && " — "}
                {project.strategyTheme && `مضمون استراتژی: ${project.strategyTheme}`}
              </p>
            )}
            <p className="charter-text">{project.description}</p>
          </article>

          <article className="charter-section glass-card">
            <h3><ShieldAlert size={16} /> ضرورت و دلایل انجام پروژه</h3>
            <p className="charter-text">{project.necessity}</p>
          </article>

          <article className="charter-section glass-card">
            <h3><UsersRound size={16} /> ارکان پروژه</h3>
            <p className="section-sub">حامی طرح، مدیر پروژه و ناظر پروژه</p>
            <div className="data-table-wrap">
              <table className="data-table">
                <thead><tr><th>ردیف</th><th>عنوان</th><th>نام و نام خانوادگی</th></tr></thead>
                <tbody>
                  {team.map((member) => (
                    <tr key={member.id}>
                      <td className="num">{toFaDigits(member.seq)}</td>
                      <td>{member.roleTitle}</td>
                      <td>{member.fullName || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </>
      )}

      {showKpi && (
        <article className="charter-section glass-card">
          <h3><Target size={16} /> شاخص‌های عملکرد (KPI)</h3>
          <p className="section-sub">شاخص اثربخشی (Lag) و شاخص کارایی (Lead) به ازای هر دستاورد پروژه</p>
          {kpis.length === 0 ? (
            <div className="empty-state">شاخصی ثبت نشده است.</div>
          ) : (
            <div className="data-table-wrap">
              <table className="data-table">
                <thead><tr><th>#</th><th>دستاورد حاصل از اجرای پروژه</th><th>شاخص اثربخشی (Lag)</th><th>نحوه محاسبه</th><th>شاخص کارایی (Lead)</th></tr></thead>
                <tbody>
                  {kpis.map((kpi) => (
                    <tr key={kpi.id}>
                      <td className="num">{toFaDigits(kpi.seq)}</td>
                      <td>{kpi.achievement}</td>
                      <td>{kpi.lagTitle}</td>
                      <td>{kpi.lagFormula}</td>
                      <td>{kpi.leadTitle}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>
      )}

      {showWbs && wbs.length > 0 && (
        <article className="charter-section glass-card">
          <h3><ChartNoAxesCombined size={16} /> توزیع وزنی فعالیت‌ها</h3>
          <p className="section-sub">سهم هر فاز از وزن کل ساختار شکست کار</p>
          <WbsWeightDonut items={wbs} />
        </article>
      )}

      {showWbs && <WbsManager projectId={project.id} wbs={wbs} documents={documents} canManage={canManage} onChanged={onRefresh} />}

      {showRisks && risks.length > 0 && (
        <article className="charter-section glass-card">
          <h3><ShieldAlert size={16} /> نقشه حرارتی ریسک‌ها</h3>
          <p className="section-sub">جایگاه ریسک‌ها بر اساس احتمال وقوع و شدت اثر</p>
          <RiskHeatmap risks={risks} />
        </article>
      )}

      {showRisks && (
        <article className="charter-section glass-card">
          <h3><ShieldAlert size={16} /> ثبت ریسک‌ها</h3>
          <p className="section-sub">احتمال وقوع، شدت و اثر هر ریسک برای محاسبه RPN</p>
          {risks.length === 0 ? (
            <div className="empty-state">ریسکی ثبت نشده است.</div>
          ) : (
            <div className="data-table-wrap">
              <table className="data-table">
                <thead><tr><th>#</th><th>عنوان ریسک</th><th>احتمال</th><th>شدت</th><th>اثر</th><th>RPN</th><th>برنامه واکنش به ریسک</th></tr></thead>
                <tbody>
                  {risks.map((risk) => (
                    <tr key={risk.id}>
                      <td className="num">{toFaDigits(risk.seq)}</td>
                      <td>{risk.title}</td>
                      <td className="num">{toFaDigits(risk.probability)}</td>
                      <td className="num">{toFaDigits(risk.severity)}</td>
                      <td className="num">{toFaDigits(risk.effect)}</td>
                      <td className="num">
                        <span className={`rpn-pill ${risk.rpn >= 20 ? "high" : risk.rpn >= 10 ? "mid" : "low"}`}>{toFaDigits(risk.rpn)}</span>
                      </td>
                      <td>{risk.responsePlan}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>
      )}

      {showStakeholders && (
        <article className="charter-section glass-card">
          <h3><UsersRound size={16} /> ذی‌نفعان پروژه</h3>
          <p className="section-sub">ذی‌نفعان درون‌سازمانی و برون‌سازمانی و انتظارات اصلی هرکدام</p>
          {stakeholders.length === 0 ? (
            <div className="empty-state">ذی‌نفعی ثبت نشده است.</div>
          ) : (
            <div className="data-table-wrap">
              <table className="data-table">
                <thead><tr><th>#</th><th>ذی‌نفع پروژه</th><th>حوزه</th><th>انتظارات اصلی</th></tr></thead>
                <tbody>
                  {stakeholders.map((stakeholder) => (
                    <tr key={stakeholder.id}>
                      <td className="num">{toFaDigits(stakeholder.seq)}</td>
                      <td>{stakeholder.name}</td>
                      <td><span className={`status-pill ${stakeholder.scope === "درون‌سازمانی" ? "blue" : "amber"}`}>{stakeholder.scope}</span></td>
                      <td>{stakeholder.expectation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>
      )}
    </div>
  );
}

const emptyWbsForm = {
  level: "1",
  parentId: "",
  title: "",
  weight: "",
  personHours: "",
  prerequisite: "",
  duration: "",
  startDate: "",
  endDate: "",
  partnerUnit: "",
  deliverable: "",
  qualityControl: "",
};

function WbsManager({
  projectId,
  wbs,
  documents,
  canManage,
  onChanged,
}: {
  projectId: number;
  wbs: ProjectWbsItem[];
  documents: ProjectDocument[];
  canManage: boolean;
  onChanged: () => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyWbsForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const level = Number(form.level);
  const parentOptions = wbs.filter((item) => item.level === level - 1);

  function updateField<K extends keyof typeof emptyWbsForm>(key: K, value: string) {
    setForm((current) => ({ ...current, [key]: value, ...(key === "level" ? { parentId: "" } : {}) }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!form.title.trim()) {
      setError("عنوان فعالیت را وارد کنید.");
      return;
    }
    if (level > 1 && !form.parentId) {
      setError("برای این سطح باید فعالیت والد را انتخاب کنید.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/wbs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          level,
          parentId: form.parentId ? Number(form.parentId) : null,
          activity: level === 1 ? form.title.trim() : "",
          subActivity: level > 1 ? form.title.trim() : "",
          weight: form.weight.trim(),
          personHours: form.personHours ? Number(form.personHours) : 0,
          prerequisite: form.prerequisite.trim(),
          duration: form.duration.trim(),
          startDate: form.startDate.trim(),
          endDate: form.endDate.trim(),
          partnerUnit: form.partnerUnit.trim(),
          deliverable: form.deliverable.trim(),
          qualityControl: form.qualityControl.trim(),
        }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(result.error ?? "ثبت فعالیت با خطا مواجه شد.");
        return;
      }
      setForm(emptyWbsForm);
      setShowForm(false);
      onChanged();
    } catch {
      setError("ارتباط با سرور برقرار نشد.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(itemId: number) {
    try {
      await fetch(`/api/projects/${projectId}/wbs/${itemId}`, { method: "DELETE" });
      onChanged();
    } catch (deleteError) {
      console.error("Deleting WBS item failed", deleteError);
    }
  }

  return (
    <article className="charter-section glass-card">
      <div className="panel-header">
        <div>
          <h3><ClipboardList size={16} /> ساختار شکست کار (WBS)</h3>
        </div>
        {canManage ? (
          <button className="wbs-add-button" type="button" onClick={() => setShowForm((value) => !value)}>
            {showForm ? "انصراف" : "+ افزودن فعالیت"}
          </button>
        ) : (
          <span className="readonly-badge"><Lock size={12} /> فقط مشاهده</span>
        )}
      </div>
      <p className="section-sub">فعالیت‌ها، زیرفعالیت‌ها و وظایف پروژه تا ۳ سطح، به همراه وزن، نفرساعت و بازه زمانی</p>

      {showForm && canManage && (
        <form className="wbs-form" onSubmit={handleSubmit}>
          <div className="wbs-form-grid">
            <label>
              سطح
              <select value={form.level} onChange={(event) => updateField("level", event.target.value)}>
                <option value="1">سطح ۱ — فعالیت اصلی</option>
                <option value="2">سطح ۲ — زیرفعالیت</option>
                <option value="3">سطح ۳ — وظیفه</option>
              </select>
            </label>
            {level > 1 && (
              <label>
                فعالیت والد
                <select value={form.parentId} onChange={(event) => updateField("parentId", event.target.value)}>
                  <option value="">انتخاب کنید...</option>
                  {parentOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.activity || option.subActivity}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label className="wbs-field-wide">
              عنوان
              <input value={form.title} onChange={(event) => updateField("title", event.target.value)} placeholder="عنوان فعالیت را بنویسید" />
            </label>
            <label>
              وزن
              <input value={form.weight} onChange={(event) => updateField("weight", event.target.value)} placeholder="مثال: 5%" />
            </label>
            <label>
              نفرساعت
              <input type="number" value={form.personHours} onChange={(event) => updateField("personHours", event.target.value)} />
            </label>
            <label>
              مدت زمان
              <input value={form.duration} onChange={(event) => updateField("duration", event.target.value)} placeholder="مثال: 2 هفته" />
            </label>
            <label>
              تاریخ شروع
              <input value={form.startDate} onChange={(event) => updateField("startDate", event.target.value)} placeholder="1403/02/01" />
            </label>
            <label>
              تاریخ پایان
              <input value={form.endDate} onChange={(event) => updateField("endDate", event.target.value)} placeholder="1403/02/14" />
            </label>
            <label>
              واحد همکار
              <input value={form.partnerUnit} onChange={(event) => updateField("partnerUnit", event.target.value)} />
            </label>
            <label className="wbs-field-wide">
              تحویل‌دادنی
              <input value={form.deliverable} onChange={(event) => updateField("deliverable", event.target.value)} />
            </label>
            <label className="wbs-field-wide">
              کنترل ناظر کیفی
              <input value={form.qualityControl} onChange={(event) => updateField("qualityControl", event.target.value)} />
            </label>
          </div>
          {error && <div className="login-error" role="alert"><ShieldAlert size={15} />{error}</div>}
          <button className="wbs-submit-button" type="submit" disabled={submitting}>
            {submitting ? "در حال ثبت..." : "ثبت فعالیت"}
          </button>
        </form>
      )}

      {wbs.length === 0 ? (
        <div className="empty-state">فعالیتی ثبت نشده است.</div>
      ) : (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead><tr><th>#</th><th>عنوان</th><th>وزن</th><th>پیشرفت</th><th>مدت</th><th>شروع</th><th>پایان</th><th>تحویل‌دادنی</th><th></th></tr></thead>
            <tbody>
              {wbs.map((item) => {
                const itemDocs = documents.filter((doc) => doc.wbsId === item.id);
                const expanded = expandedId === item.id;
                return (
                  <Fragment key={item.id}>
                    <tr>
                      <td className="num">{toFaDigits(item.seq)}</td>
                      <td>
                        <span className="wbs-title" style={{ paddingRight: `${(item.level - 1) * 16}px` }}>
                          {item.level > 1 && <span className="wbs-level-dot" />}
                          {item.activity || item.subActivity || "—"}
                        </span>
                      </td>
                      <td className="num">{item.weight}</td>
                      <td>
                        <div className="progress-cell">
                          <div><span style={{ width: `${item.progress}%` }} /></div>
                          <b>{toFaDigits(item.progress)}٪</b>
                        </div>
                      </td>
                      <td className="num">{item.duration}</td>
                      <td className="num">{item.startDate}</td>
                      <td className="num">{item.endDate}</td>
                      <td>{item.deliverable}</td>
                      <td className="num wbs-row-actions">
                        <button
                          className="row-action"
                          type="button"
                          onClick={() => setExpandedId(expanded ? null : item.id)}
                          aria-label={`ثبت پیشرفت و مستندات ${item.activity || item.subActivity}`}
                        >
                          {itemDocs.length > 0 ? <FileCheck2 size={14} /> : <TrendingUp size={14} />}
                        </button>
                        {canManage && (
                          <button className="row-action" type="button" onClick={() => handleDelete(item.id)} aria-label={`حذف ${item.activity || item.subActivity}`}>
                            <X size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                    {expanded && (
                      <WbsRowDetails projectId={projectId} item={item} documents={itemDocs} canManage={canManage} onChanged={onChanged} />
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </article>
  );
}

function WbsRowDetails({
  projectId,
  item,
  documents,
  canManage,
  onChanged,
}: {
  projectId: number;
  item: ProjectWbsItem;
  documents: ProjectDocument[];
  canManage: boolean;
  onChanged: () => void;
}) {
  const [progressValue, setProgressValue] = useState(String(item.progress));
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleProgressSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/wbs/${item.id}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ progress: Number(progressValue), note: note.trim() }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(result.error ?? "ثبت پیشرفت با خطا مواجه شد.");
        return;
      }
      setNote("");
      onChanged();
    } catch {
      setError("ارتباط با سرور برقرار نشد.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("wbsId", String(item.id));
      const response = await fetch(`/api/projects/${projectId}/documents`, { method: "POST", body });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(result.error ?? "بارگذاری مستند با خطا مواجه شد.");
        return;
      }
      onChanged();
    } catch {
      setError("ارتباط با سرور برقرار نشد.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDeleteDocument(docId: number) {
    try {
      await fetch(`/api/projects/${projectId}/documents/${docId}`, { method: "DELETE" });
      onChanged();
    } catch (deleteError) {
      console.error("Deleting document failed", deleteError);
    }
  }

  return (
    <tr className="wbs-detail-row">
      <td colSpan={9}>
        <div className="wbs-detail-panel">
          <div className="wbs-detail-block">
            <span className="wbs-detail-title">ثبت پیشرفت فعالیت</span>
            {canManage ? (
              <form className="wbs-progress-form" onSubmit={handleProgressSubmit}>
                <input type="number" min={0} max={100} value={progressValue} onChange={(event) => setProgressValue(event.target.value)} />
                <input value={note} onChange={(event) => setNote(event.target.value)} placeholder="توضیح پیشرفت (اختیاری)" />
                <button type="submit" disabled={submitting}>{submitting ? "..." : "ثبت پیشرفت"}</button>
              </form>
            ) : (
              <p className="approval-readonly-note"><Lock size={12} /> پیشرفت فعلی: {toFaDigits(item.progress)}٪</p>
            )}
          </div>
          <div className="wbs-detail-block">
            <span className="wbs-detail-title">مستندات ({toFaDigits(documents.length)})</span>
            <div className="wbs-docs-body">
              {documents.length > 0 && (
                <ul className="wbs-doc-list">
                  {documents.map((doc) => (
                    <DocumentListItem
                      key={doc.id}
                      projectId={projectId}
                      doc={doc}
                      canManage={canManage}
                      onChanged={onChanged}
                      onDelete={() => handleDeleteDocument(doc.id)}
                    />
                  ))}
                </ul>
              )}
              {canManage && (
                <label className="wbs-upload-button">
                  {uploading ? "در حال بارگذاری..." : "+ بارگذاری مستند"}
                  <input ref={fileInputRef} type="file" onChange={handleFileChange} disabled={uploading} hidden />
                </label>
              )}
            </div>
          </div>
          {error && <div className="login-error" role="alert"><ShieldAlert size={14} />{error}</div>}
        </div>
      </td>
    </tr>
  );
}

const reviewStatusLabels: Record<ReviewStatus, string> = { pending: "در انتظار", approved: "تأیید شده", rejected: "رد شده" };
const reviewStatusTone: Record<ReviewStatus, string> = { pending: "amber", approved: "teal", rejected: "rose" };

function DocumentListItem({
  projectId,
  doc,
  canManage,
  onChanged,
  onDelete,
}: {
  projectId: number;
  doc: ProjectDocument;
  canManage: boolean;
  onChanged: () => void;
  onDelete: () => void;
}) {
  const [showReview, setShowReview] = useState(false);
  const [formStatus, setFormStatus] = useState<ReviewStatus>(doc.formStatus);
  const [contentStatus, setContentStatus] = useState<ReviewStatus>(doc.contentStatus);
  const [note, setNote] = useState(doc.reviewNote);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleReviewSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/documents/${doc.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formStatus, contentStatus, note: note.trim() }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(result.error ?? "ثبت تأییدیه با خطا مواجه شد.");
        return;
      }
      setShowReview(false);
      onChanged();
    } catch {
      setError("ارتباط با سرور برقرار نشد.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <li className="wbs-doc-item">
      <div className="wbs-doc-row">
        <a href={`/api/projects/${projectId}/documents/${doc.id}`} target="_blank" rel="noreferrer">{doc.fileName}</a>
        <span className="wbs-doc-size">{Math.max(1, Math.round(doc.fileSize / 1024))} KB</span>
        <span className={`status-pill ${reviewStatusTone[doc.formStatus]}`}>شکلی: {reviewStatusLabels[doc.formStatus]}</span>
        <span className={`status-pill ${reviewStatusTone[doc.contentStatus]}`}>محتوایی: {reviewStatusLabels[doc.contentStatus]}</span>
        {canManage && (
          <button type="button" className="wbs-doc-review-toggle" onClick={() => setShowReview((value) => !value)}>
            {showReview ? "بستن" : "بررسی"}
          </button>
        )}
        {canManage && (
          <button type="button" onClick={onDelete} aria-label={`حذف ${doc.fileName}`}><X size={12} /></button>
        )}
      </div>
      {showReview && canManage && (
        <form className="wbs-review-form" onSubmit={handleReviewSubmit}>
          <label>
            تأیید شکلی
            <select value={formStatus} onChange={(event) => setFormStatus(event.target.value as ReviewStatus)}>
              <option value="pending">در انتظار</option>
              <option value="approved">تأیید شده</option>
              <option value="rejected">رد شده</option>
            </select>
          </label>
          <label>
            تأیید محتوایی
            <select value={contentStatus} onChange={(event) => setContentStatus(event.target.value as ReviewStatus)}>
              <option value="pending">در انتظار</option>
              <option value="approved">تأیید شده</option>
              <option value="rejected">رد شده</option>
            </select>
          </label>
          <input value={note} onChange={(event) => setNote(event.target.value)} placeholder="یادداشت ناظر (اختیاری)" />
          <button type="submit" disabled={submitting}>{submitting ? "..." : "ثبت تأییدیه"}</button>
          {error && <div className="login-error" role="alert"><ShieldAlert size={13} />{error}</div>}
        </form>
      )}
    </li>
  );
}

export default function Home() {
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/session", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return null;
        return (await response.json()) as { user?: AuthUser };
      })
      .then((result) => { if (active && result?.user) setUser(result.user); })
      .finally(() => { if (active) setChecking(false); });
    return () => { active = false; };
  }, []);

  const app = useMemo(() => {
    if (checking) return <LoadingScreen />;
    if (!user) return <LoginScreen onAuthenticated={setUser} />;
    return <Dashboard user={user} onLogout={async () => {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
    }} />;
  }, [checking, user]);

  return app;
}
