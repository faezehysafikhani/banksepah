import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("ships the Sepah project-management experience", async () => {
  const [page, projects, operations, strategy, reports, users, calendar, wbs, layout, css, hosting] = await Promise.all([
    readFile(new URL("app/page.tsx", root), "utf8"),
    readFile(new URL("app/components/ProjectsWorkspace.tsx", root), "utf8"),
    readFile(new URL("app/components/OperationsWorkspace.tsx", root), "utf8"),
    readFile(new URL("app/components/StrategyWorkspace.tsx", root), "utf8"),
    readFile(new URL("app/components/ReportsWorkspace.tsx", root), "utf8"),
    readFile(new URL("app/components/UsersWorkspace.tsx", root), "utf8"),
    readFile(new URL("app/components/DashboardCalendar.tsx", root), "utf8"),
    readFile(new URL("app/components/WbsWorkspace.tsx", root), "utf8"),
    readFile(new URL("app/layout.tsx", root), "utf8"),
    readFile(new URL("app/globals.css", root), "utf8"),
    readFile(new URL(".openai/hosting.json", root), "utf8"),
  ]);

  assert.match(page, /سامانه مدیریت/);
  assert.match(page, /\/api\/auth\/login/);
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
  assert.match(projects, /برنامه زمان‌بندی پروژه/);
  assert.match(projects, /function ProjectEditor/);
  assert.match(projects, /function ProjectDashboard/);
  assert.match(projects, /خلاصه منشور پروژه/);
  assert.match(projects, /فعالیت‌های سطح بالا/);
  assert.match(projects, /تیم پروژه/);
  assert.match(projects, /ریسک‌های پروژه/);
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
  assert.match(calendar, /PersianDatePicker/);
  assert.match(calendar, /تقویم شمسی مدیریتی/);
  assert.match(calendar, /مشخصات رویداد/);
  assert.match(calendar, /افراد مرتبط/);
  assert.match(calendar, /دستور جلسه/);
  assert.match(calendar, /صورتجلسه و اقدامات/);
  assert.match(calendar, /ارتباط با وظایف/);
  assert.match(calendar, /اربعین حسینی/);
  assert.match(calendar, /شهادت امام رضا/);
  assert.doesNotMatch(calendar, /type="date"/);
  assert.ok(page.indexOf("<DashboardCalendar />") < page.indexOf("status-chart-card"));
  assert.ok(page.indexOf("dashboard-owner-row") > page.indexOf("dashboard-primary-charts"));
  assert.match(projects, /ProjectWorkspaceModal/);
  assert.doesNotMatch(projects, /بازگشت به سبد پروژه‌ها/);
  assert.doesNotMatch(page, /project-subnav/);
  assert.match(wbs, /پیشنهاد هوشمند/);
  assert.match(wbs, /افزودن زیر‌فعالیت/);
  assert.match(wbs, /پایان به شروع \(FS\)/);
  assert.match(wbs, /ذخیره WBS و زمان‌بندی/);
  assert.match(layout, /lang="fa" dir="rtl"/);
  assert.match(layout, /سامانه مدیریت پروژه‌های بانک سپه/);
  assert.match(css, /IRANSans-Medium\.ttf/);
  assert.match(css, /backdrop-filter:\s*blur/);
  assert.match(hosting, /"d1": "DB"/);
  await access(new URL("public/images.jpg", root));
  await access(new URL("public/mob.banking.android.sepah_512x512.webp", root));
  await access(new URL("public/fonts/IRANSans-Medium.ttf", root));
  await assert.rejects(access(new URL("app/_sites-preview/SkeletonPreview.tsx", root)));
  await assert.rejects(access(new URL("app/api/projects/route.ts", root)));
});
