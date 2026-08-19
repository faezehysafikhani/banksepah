import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("ships the Sepah project-management experience", async () => {
  const [page, projects, operations, strategy, reports, users, calendar, persianInputs, wbs, layout, css, hosting, backend, eventsApi, usersApi, projectsApi, seedData] = await Promise.all([
    readFile(new URL("app/page.tsx", root), "utf8"),
    readFile(new URL("app/components/ProjectsWorkspace.tsx", root), "utf8"),
    readFile(new URL("app/components/OperationsWorkspace.tsx", root), "utf8"),
    readFile(new URL("app/components/StrategyWorkspace.tsx", root), "utf8"),
    readFile(new URL("app/components/ReportsWorkspace.tsx", root), "utf8"),
    readFile(new URL("app/components/UsersWorkspace.tsx", root), "utf8"),
    readFile(new URL("app/components/DashboardCalendar.tsx", root), "utf8"),
    readFile(new URL("app/components/PersianInputs.tsx", root), "utf8"),
    readFile(new URL("app/components/WbsWorkspace.tsx", root), "utf8"),
    readFile(new URL("app/layout.tsx", root), "utf8"),
    readFile(new URL("app/globals.css", root), "utf8"),
    readFile(new URL(".openai/hosting.json", root), "utf8"),
    readFile(new URL("backend/Sepah.Pmo.Api/Program.cs", root), "utf8"),
    readFile(new URL("backend/Sepah.Pmo.Api/Controllers/EventsController.cs", root), "utf8"),
    readFile(new URL("backend/Sepah.Pmo.Api/Controllers/UsersController.cs", root), "utf8"),
    readFile(new URL("backend/Sepah.Pmo.Api/Controllers/ProjectsController.cs", root), "utf8"),
    readFile(new URL("backend/Sepah.Pmo.Api/Data/SeedData.cs", root), "utf8"),
  ]);

  assert.match(page, /سامانه مدیریت/);
  assert.match(page, /api<\{ user: AuthUser \}>\("\/auth\/login"/);
  assert.match(page, /داشبورد مدیریتی/);
  assert.match(page, /sidebar-nav/);
  assert.match(page, /ProjectsWorkspace/);
  assert.match(page, /OperationsWorkspace/);
  assert.doesNotMatch(page, /label: "ایجاد پروژه"/);
  assert.match(projects, /سبد پروژه‌ها و اقدامات/);
  assert.match(projects, /ایجاد پروژه آبشاری/);
  assert.match(projects, /ایجاد پروژه چابک/);
  assert.match(projects, /گروه‌بندی سطح ۱/);
  assert.match(projects, /اسپرینت/);
  assert.match(projects, /دستاوردها و منافع/);
  assert.match(projects, /شاخص‌های KPI/);
  assert.match(projects, /OutcomesDashboard/);
  assert.match(projects, /KpiDashboard/);
  assert.match(projects, /برنامه زمان‌بندی پروژه/);
  assert.match(projects, /function ProjectEditor/);
  assert.match(projects, /function ProjectDashboard/);
  assert.match(projects, /خلاصه منشور پروژه/);
  assert.match(projects, /تأییدات منشور/);
  assert.match(projects, /ارکان و تیم پروژه/);
  assert.match(projects, /فعالیت‌های سطح بالا/);
  assert.match(projects, /تیم پروژه/);
  assert.match(projects, /ریسک‌های پروژه/);
  assert.match(projects, /ذی‌نفعان پروژه/);
  assert.match(projects, /دفتر ثبت و ارزیابی ریسک پروژه/);
  assert.match(projects, /RPN به‌صورت خودکار/);
  assert.match(projects, /شناسنامه ذی‌نفعان پروژه/);
  assert.match(projects, /وزارت امور اقتصادی و دارایی/);
  assert.match(projects, /اقدامات مرتبط/);
  assert.match(operations, /تعریف و پیگیری اقدام/);
  assert.match(operations, /مرکز وظایف/);
  assert.match(operations, /مرکز تأییدات/);
  assert.match(operations, /مدیریت دانش/);
  assert.match(operations, /ارسال برای تأیید/);
  assert.match(operations, /اعلام انجام/);
  assert.match(operations, /عودت برای اصلاح/);
  assert.match(operations, /ثبت دانش جدید/);
  assert.match(page, /StrategyWorkspace/);
  assert.match(strategy, /نقشه استراتژی/);
  assert.match(strategy, /اهداف راهبردی/);
  assert.match(strategy, /شاخص‌های کلیدی/);
  assert.match(strategy, /ابتکارها و برنامه‌ها/);
  assert.match(strategy, /هم‌راستایی پروژه‌ها/);
  assert.match(strategy, /کارت امتیازی متوازن/);
  assert.match(strategy, /ارزیابی هم‌راستایی/);
  assert.match(page, /ReportsWorkspace/);
  assert.match(reports, /داشبورد اجرایی/);
  assert.match(reports, /عملکرد سبد/);
  assert.match(reports, /زمان و پیشرفت/);
  assert.match(reports, /هزینه و بودجه/);
  assert.match(reports, /ریسک و اقدامات/);
  assert.match(reports, /گزارش‌ساز/);
  assert.match(reports, /طراحی گزارش جدید/);
  assert.match(page, /UsersWorkspace/);
  assert.match(page, /DashboardCalendar/);
  assert.match(page, /dashboard-topbar/);
  assert.match(page, /پروفایل کاربری/);
  assert.match(page, /خروج از حساب/);
  assert.match(page, /persianTime/);
  assert.doesNotMatch(page, /اطلاعات به‌روز است/);
  assert.match(users, /اطلاعات کاربری/);
  assert.match(users, /اطلاعات سازمانی/);
  assert.match(users, /نقش‌ها و دسترسی‌ها/);
  assert.match(users, /امنیت و ورود/);
  assert.match(users, /اعلان‌ها/);
  assert.match(users, /سوابق فعالیت/);
  assert.doesNotMatch(users, /امضا/);
  assert.match(users, /مدیریت WBS و زمان‌بندی/);
  assert.match(users, /تخصیص نقش و دسترسی/);
  assert.match(users, /مدیریت گردش کار/);
  assert.match(calendar, /PersianDateInput/);
  assert.match(calendar, /TimeSelect/);
  assert.match(persianInputs, /تقویم رسمی شمسی/);
  assert.match(persianInputs, /دقیقه/);
  assert.match(persianInputs, /sepah-popover-open/);
  assert.match(persianInputs, /closeOutside/);
  assert.match(calendar, /setEventOpen\(true\)/);
  assert.doesNotMatch(calendar, /onDoubleClick/);
  assert.match(calendar, /تقویم شمسی مدیریتی/);
  assert.match(calendar, /مشخصات رویداد/);
  assert.match(calendar, /افراد مرتبط/);
  assert.match(calendar, /دستور جلسه/);
  assert.match(calendar, /صورتجلسه و اقدامات/);
  assert.match(calendar, /ارتباط با وظایف/);
  assert.match(calendar, /onClick=\{addParticipant\}/);
  assert.match(calendar, /onClick=\{addAgenda\}/);
  assert.match(calendar, /onClick=\{addAction\}/);
  assert.match(calendar, /\/events\/references/);
  assert.match(calendar, /اربعین حسینی/);
  assert.match(calendar, /شهادت امام رضا/);
  assert.doesNotMatch(calendar, /type="date"/);
  assert.match(users, /دسترسی پروژه‌ای/);
  assert.match(usersApi, /ProjectUserAccess/);
  assert.match(css, /status-chart-card \.donut-chart/);
  assert.match(css, /project-value-dashboard/);
  assert.match(css, /ops-header-actions > label > input/);
  assert.ok(page.indexOf("<DashboardCalendar />") < page.indexOf("status-chart-card"));
  assert.ok(page.indexOf("dashboard-owner-row") > page.indexOf("dashboard-primary-charts"));
  assert.match(projects, /ProjectWorkspaceModal/);
  assert.doesNotMatch(projects, /بازگشت به سبد پروژه‌ها/);
  assert.doesNotMatch(page, /project-subnav/);
  assert.match(wbs, /پیشنهاد هوشمند/);
  assert.match(wbs, /افزودن زیر‌فعالیت/);
  assert.match(wbs, /پایان به شروع \(FS\)/);
  assert.match(wbs, /ذخیره WBS و زمان‌بندی/);
  assert.match(wbs, /واحد همکار/);
  assert.match(wbs, /درصد مشارکت واحد/);
  assert.match(wbs, /تحویل‌دادنی/);
  assert.match(wbs, /کنترل‌های ناظر کیفی/);
  assert.match(layout, /lang="fa" dir="rtl"/);
  assert.match(layout, /سامانه مدیریت پروژه‌های بانک سپه/);
  assert.match(css, /IRANSans-Medium\.ttf/);
  assert.match(css, /backdrop-filter:\s*blur/);
  assert.match(css, /body \{ font-size: 13px; \}/);
  assert.match(css, /Unified executive glass system/);
  assert.match(css, /\.dashboard-primary-charts[^}]*1\.5fr/);
  assert.match(css, /\.donut-chart[^}]*width:\s*138px/);
  assert.match(css, /\.dashboard-owner-row \.owner-bars[^}]*grid-template-columns:\s*minmax\(0, 1fr\)/);
  assert.match(css, /\.projects-workspace[\s\S]*?overflow-x:\s*hidden/);
  assert.match(css, /\.dashboard-main[\s\S]*?overflow-x:\s*hidden/);
  assert.match(css, /\.project-full-content[^}]*overflow-x:\s*hidden/);
  assert.match(css, /\.project-full-modal[^}]*width:\s*100%[^}]*max-width:\s*1480px/);
  assert.doesNotMatch(css, /\.project-full-modal[^}]*calc\(100vw/);
  assert.match(css, /\.creator-tabs[^}]*grid-template-columns:\s*repeat\(auto-fit/);
  assert.match(css, /Responsive form geometry/);
  assert.match(css, /\.ops-form-grid,[\s\S]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(css, /\.event-main-grid[\s\S]*grid-template-columns:\s*minmax\(0, 1fr\)/);
  assert.match(hosting, /"d1": "DB"/);
  assert.match(backend, /UseSqlServer/);
  assert.match(backend, /AddIdentityCore/);
  assert.match(projectsApi, /SaveWbs/);
  assert.match(projectsApi, /SaveRisks/);
  assert.match(projectsApi, /SaveStakeholders/);
  assert.match(seedData, /ProjectStakeholders/);
  assert.match(seedData, /ProjectWbsItems/);
  assert.match(seedData, /ProjectRisks/);
  assert.match(eventsApi, /EventTaskLinks/);
  assert.match(eventsApi, /\[HttpPost\]/);
  await access(new URL("public/images.jpg", root));
  await access(new URL("public/mob.banking.android.sepah_512x512.webp", root));
  await access(new URL("public/fonts/IRANSans-Medium.ttf", root));
  await assert.rejects(access(new URL("app/_sites-preview/SkeletonPreview.tsx", root)));
  await assert.rejects(access(new URL("app/api/projects/route.ts", root)));
});
