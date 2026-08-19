"use client";

import type { FormEvent, PointerEvent as ReactPointerEvent } from "react";
import { useEffect, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { api } from "./lib/api";
import {
  BarChart3,
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  CircleGauge,
  ClipboardList,
  Clock3,
  Eye,
  EyeOff,
  FileText,
  FolderKanban,
  Inbox,
  KeyRound,
  LayoutDashboard,
  LogOut,
  ListChecks,
  PanelRightClose,
  PanelRightOpen,
  ShieldAlert,
  Sparkles,
  Settings2,
  Target,
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
  { label: "سبد پروژه‌ها و اقدامات", icon: FolderKanban },
  { label: "تعریف اقدام", icon: ListChecks },
  { label: "مرکز وظایف", icon: ClipboardList },
  { label: "مرکز تأییدات", icon: Inbox },
  { label: "مدیریت دانش", icon: FileText },
  { label: "مدیریت استراتژی پروژه‌ها", icon: Target },
  { label: "داشبوردها و گزارشات", icon: BarChart3 },
  { label: "مدیریت کاربران", icon: UsersRound },
  { label: "تنظیمات سامانه", icon: Settings2 },
];

const dashboardStats = [
  { label: "تعداد کل پروژه‌ها", value: "۱۵", detail: "سبد پروژه‌های بانک", icon: FolderKanban, tone: "cyan" },
  { label: "تعداد کل اقدامات", value: "۱۰", detail: "اقدامات ثبت‌شده", icon: ClipboardList, tone: "blue" },
  { label: "پروژه‌های در حال انجام", value: "۱۴", detail: "۹۳٪ از کل پروژه‌ها", icon: Target, tone: "green" },
  { label: "اقدامات در حال انجام", value: "۴", detail: "نیازمند پیگیری", icon: Inbox, tone: "orange" },
];

const ownerUnits = [
  { label: "فناوری اطلاعات", value: 6, width: "100%" },
  { label: "ساختمان و املاک", value: 5, width: "83%" },
  { label: "امور اجرایی", value: 2, width: "34%" },
  { label: "پشتیبانی", value: 2, width: "34%" },
];

const ProjectsWorkspace = dynamic(() => import("./components/ProjectsWorkspace"));
const OperationsWorkspace = dynamic(() => import("./components/OperationsWorkspace"));
const StrategyWorkspace = dynamic(() => import("./components/StrategyWorkspace"));
const ReportsWorkspace = dynamic(() => import("./components/ReportsWorkspace"));
const UsersWorkspace = dynamic(() => import("./components/UsersWorkspace"));
const DashboardCalendar = dynamic(() => import("./components/DashboardCalendar"));

function LoadingScreen() {
  return (
    <main className="loading-screen" aria-live="polite">
      <Image src="/mob.banking.android.sepah_512x512.webp" alt="نشان بانک سپه" width={88} height={88} priority />
      <span />
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

  function moveWatermark(event: ReactPointerEvent<HTMLElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
    event.currentTarget.style.setProperty("--x", String(x));
    event.currentTarget.style.setProperty("--y", String(y));
  }

  function resetWatermark(event: ReactPointerEvent<HTMLElement>) {
    event.currentTarget.style.removeProperty("--x");
    event.currentTarget.style.removeProperty("--y");
  }

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const result = await api<{ user: AuthUser }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      onAuthenticated(result.user);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "ارتباط با سرور برقرار نشد.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="login-page" onPointerMove={moveWatermark} onPointerLeave={resetWatermark}>
      <div className="login-watermark" aria-hidden="true">
        <span />
        <Image src="/sepah-emblem.png" alt="" width={620} height={706} priority />
      </div>

      <section className="login-intro">
        <div className="bank-brand">
          <Image src="/images.jpg" alt="بانک سپه" width={52} height={52} priority />
          <strong>بانک سپه</strong>
        </div>
        <div>
          <p><Sparkles size={17} /> یکپارچه، هوشمند و شفاف</p>
          <h1>سامانه مدیریت<br /><b>پروژه‌های راهبردی</b></h1>
          <span>ورود امن به درگاه مدیریت پروژه‌های بانک سپه</span>
        </div>
        <div className="login-features">
          <span><CircleGauge size={20} /> پایش لحظه‌ای</span>
          <span><ShieldAlert size={20} /> مدیریت ریسک</span>
          <span><FileText size={20} /> گردش مستندات</span>
        </div>
      </section>

      <section className="login-form-wrap">
        <form className="login-card" onSubmit={login}>
          <div className="mobile-logo">
            <Image src="/mob.banking.android.sepah_512x512.webp" alt="نشان بانک سپه" width={68} height={68} priority />
          </div>
          <small>ورود امن به سامانه</small>
          <h2>خوش آمدید</h2>
          <p>اطلاعات حساب کاربری خود را وارد کنید.</p>

          <label htmlFor="username">نام کاربری</label>
          <div className="input-box">
            <UserRound size={20} />
            <input id="username" value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" required />
          </div>

          <label htmlFor="password">رمز عبور</label>
          <div className="input-box">
            <KeyRound size={20} />
            <input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required />
            <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label="نمایش یا مخفی کردن رمز">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && <div className="login-error" role="alert"><ShieldAlert size={16} />{error}</div>}
          <button className="login-submit" disabled={submitting}>
            {submitting ? <i /> : <><span>ورود به سامانه</span><ChevronLeft size={20} /></>}
          </button>
          <div className="secure-note"><Check size={15} /> ارتباط امن برقرار است.</div>
        </form>
      </section>
    </main>
  );
}

function MenuScreen({ user, onLogout }: { user: AuthUser; onLogout: () => void }) {
  const [active, setActive] = useState(navigation[0].label);
  const [collapsed, setCollapsed] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const projectActive = active === "سبد پروژه‌ها و اقدامات";
  const operationsActive = ["تعریف اقدام", "مرکز وظایف", "مرکز تأییدات", "مدیریت دانش"].includes(active);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const persianDate = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(now);
  const persianTime = new Intl.DateTimeFormat("fa-IR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(now);

  return (
    <main className="menu-page">
      <div className="menu-orb orb-one" />
      <div className="menu-orb orb-two" />
      <div className="menu-watermark" aria-hidden="true">
        <Image src="/sepah-emblem.png" alt="" width={520} height={592} />
      </div>

      {active === "داشبورد مدیریتی" && (
        <section className={`dashboard-main ${collapsed ? "sidebar-collapsed" : ""}`}>
          <header className="dashboard-topbar">
            <div className="dashboard-profile">
              <button
                className="dashboard-avatar"
                type="button"
                onClick={() => setProfileMenuOpen((value) => !value)}
                aria-expanded={profileMenuOpen}
                aria-label="باز کردن منوی کاربری"
              >
                <span><UserRound size={25} /></span>
                <ChevronDown size={15} />
              </button>
              <div className="dashboard-person">
                <strong>{user.displayName}</strong>
                <small>{user.role}</small>
                <p><CalendarDays size={13} />{persianDate}<i /><Clock3 size={13} />{persianTime}</p>
              </div>
              {profileMenuOpen && (
                <div className="dashboard-profile-menu" role="menu">
                  <button type="button" onClick={() => { setProfileOpen(true); setProfileMenuOpen(false); }}><UserRound size={16} /> پروفایل کاربری</button>
                  <button type="button" className="danger" onClick={onLogout}><LogOut size={16} /> خروج از حساب</button>
                </div>
              )}
            </div>
            <button className="dashboard-notifications" type="button" aria-label="اعلان‌ها" title="اعلان‌ها">
              <Bell size={21} />
              <i />
            </button>
          </header>

          <div className="dashboard-stats">
            {dashboardStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <article className={`dashboard-stat ${stat.tone}`} key={stat.label}>
                  <span><Icon size={22} /></span>
                  <div><small>{stat.label}</small><strong>{stat.value}</strong><em>{stat.detail}</em></div>
                </article>
              );
            })}
          </div>

          <div className="dashboard-charts dashboard-primary-charts">
            <DashboardCalendar />
            <article className="chart-card status-chart-card">
              <div className="chart-title"><div><strong>پروژه‌ها بر اساس وضعیت</strong><small>توزیع وضعیت پروژه‌های فعال</small></div><span>دایره‌ای</span></div>
              <div className="donut-layout">
                <div className="donut-chart" role="img" aria-label="۱۴ پروژه در حال انجام و یک پروژه در برنامه‌ریزی">
                  <div><strong>۱۵</strong><small>مجموع</small></div>
                </div>
                <div className="chart-legend">
                  <p><i className="ongoing" /><span>در حال انجام</span><strong>۱۴</strong></p>
                  <p><i className="planning" /><span>برنامه‌ریزی</span><strong>۱</strong></p>
                </div>
              </div>
            </article>

          </div>

          <div className="dashboard-owner-row">
            <article className="chart-card owner-chart-card">
              <div className="chart-title"><div><strong>پروژه‌ها بر اساس واحد مالک</strong><small>مقایسه تعداد پروژه‌های واحدهای سازمانی</small></div><span>میله‌ای</span></div>
              <div className="owner-bars" role="img" aria-label="نمودار میله‌ای پروژه‌ها بر اساس واحد مالک">
                {ownerUnits.map((unit) => (
                  <div className="owner-row" key={unit.label}>
                    <div><span>{unit.label}</span><strong>{unit.value}</strong></div>
                    <p><i style={{ width: unit.width }} /></p>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>
      )}

      {profileOpen && (
        <div className="profile-dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setProfileOpen(false); }}>
          <section className="profile-dialog" role="dialog" aria-modal="true" aria-label="پروفایل کاربری">
            <button className="profile-dialog-close" type="button" onClick={() => setProfileOpen(false)} aria-label="بستن"><X size={18} /></button>
            <div className="profile-dialog-avatar"><UserRound size={42} /></div>
            <small>پروفایل کاربری</small>
            <h2>{user.displayName}</h2>
            <span>{user.role}</span>
            <div><span>نام کاربری</span><strong>{user.username}</strong></div>
            <div><span>سمت سازمانی</span><strong>{user.role}</strong></div>
          </section>
        </div>
      )}

      {projectActive && <ProjectsWorkspace key={active} collapsed={collapsed} section={active} />}
      {operationsActive && (
        <OperationsWorkspace
          key={active}
          collapsed={collapsed}
          section={active as "تعریف اقدام" | "مرکز وظایف" | "مرکز تأییدات" | "مدیریت دانش"}
        />
      )}
      {active === "مدیریت استراتژی پروژه‌ها" && <StrategyWorkspace collapsed={collapsed} />}
      {active === "داشبوردها و گزارشات" && <ReportsWorkspace collapsed={collapsed} />}
      {active === "مدیریت کاربران" && <UsersWorkspace collapsed={collapsed} />}

      <aside className={`menu-sidebar ${collapsed ? "collapsed" : ""}`}>
        <div className="menu-brand">
          <Image src="/mob.banking.android.sepah_512x512.webp" alt="بانک سپه" width={58} height={58} priority />
          <div><strong>بانک سپه</strong><span>سامانه مدیریت پروژه‌ها</span></div>
          <button
            className="sidebar-toggle"
            onClick={() => setCollapsed((value) => !value)}
            aria-label={collapsed ? "باز کردن منو" : "جمع کردن منو"}
            title={collapsed ? "باز کردن منو" : "جمع کردن منو"}
          >
            {collapsed ? <PanelRightOpen size={18} /> : <PanelRightClose size={18} />}
          </button>
        </div>

        <nav className="sidebar-nav" aria-label="منوی اصلی">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.label} className={active === item.label ? "active" : ""} onClick={() => setActive(item.label)} title={collapsed ? item.label : undefined}>
                <span><Icon size={26} /></span>
                <strong>{item.label}</strong>
              </button>
            );
          })}
        </nav>

        <div className="menu-user">
          <div><UserRound size={18} /><span>{user.displayName}</span></div>
          <button onClick={onLogout} aria-label="خروج از حساب"><LogOut size={18} /><span>خروج</span></button>
        </div>
      </aside>
    </main>
  );
}

export default function Home() {
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    api<{ user?: AuthUser }>("/auth/me", { cache: "no-store", signal: controller.signal })
      .then((result) => { if (result?.user) setUser(result.user); })
      .catch(() => undefined)
      .finally(() => { if (!controller.signal.aborted) setChecking(false); });
    return () => controller.abort();
  }, []);

  async function logout() {
    await api<void>("/auth/logout", { method: "POST" }).catch(() => undefined);
    setUser(null);
  }

  if (checking) return <LoadingScreen />;
  return user ? <MenuScreen user={user} onLogout={logout} /> : <LoginScreen onAuthenticated={setUser} />;
}
