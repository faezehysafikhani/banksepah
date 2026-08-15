import { env } from "./env";

export type ProjectSummary = {
  id: number;
  name: string;
  code: string;
  sponsorOrg: string;
  pmName: string;
  status: string;
  progress: number;
  startDate: string;
  endDate: string;
};

export type ProjectTeamMember = {
  id: number;
  seq: number;
  roleTitle: string;
  fullName: string;
  personnelNo: string;
  phone: string;
  email: string;
  workplace: string;
  group: "core" | "member";
};

export type ProjectKpi = {
  id: number;
  seq: number;
  achievement: string;
  lagTitle: string;
  lagFormula: string;
  lagDesc: string;
  leadTitle: string;
  leadFormula: string;
  leadDesc: string;
};

export type ProjectWbsItem = {
  id: number;
  seq: number;
  level: number;
  parentId: number | null;
  activity: string;
  subActivity: string;
  weight: string;
  personHours: number;
  prerequisite: string;
  duration: string;
  startDate: string;
  endDate: string;
  partnerUnit: string;
  deliverable: string;
  qualityControl: string;
  progress: number;
};

export type ProgressLogEntry = {
  id: number;
  progress: number;
  note: string;
  recordedAt: string;
};

export type ReviewStatus = "pending" | "approved" | "rejected";

export type ProjectDocument = {
  id: number;
  wbsId: number | null;
  fileName: string;
  fileType: string;
  fileSize: number;
  note: string;
  uploadedAt: string;
  formStatus: ReviewStatus;
  contentStatus: ReviewStatus;
  reviewNote: string;
  reviewedAt: string | null;
};

export type NewWbsItem = {
  level: number;
  parentId: number | null;
  activity: string;
  subActivity: string;
  weight: string;
  personHours: number;
  prerequisite: string;
  duration: string;
  startDate: string;
  endDate: string;
  partnerUnit: string;
  deliverable: string;
  qualityControl: string;
};

export type ProjectRisk = {
  id: number;
  seq: number;
  title: string;
  probability: number;
  severity: number;
  effect: number;
  rpn: number;
  responsePlan: string;
};

export type ProjectStakeholder = {
  id: number;
  seq: number;
  name: string;
  scope: string;
  expectation: string;
};

export type ProjectCharter = {
  project: {
    id: number;
    name: string;
    code: string;
    sponsorOrg: string;
    pmName: string;
    status: string;
    progress: number;
    startDate: string;
    endDate: string;
    strategy: string;
    strategyTheme: string;
    description: string;
    necessity: string;
  };
  team: ProjectTeamMember[];
  kpis: ProjectKpi[];
  wbs: ProjectWbsItem[];
  risks: ProjectRisk[];
  stakeholders: ProjectStakeholder[];
  documents: ProjectDocument[];
};

export async function ensureProjectsSchema() {
  const database = env.DB;
  if (!database) throw new Error("D1 binding DB is unavailable");

  await database.batch([
    database.prepare(`CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      code TEXT NOT NULL,
      sponsor_org TEXT NOT NULL,
      pm_name TEXT NOT NULL,
      supervisor_name TEXT NOT NULL,
      status TEXT NOT NULL,
      progress INTEGER NOT NULL DEFAULT 0,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      strategy TEXT NOT NULL DEFAULT '',
      strategy_theme TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      necessity TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`),
    database.prepare(`CREATE TABLE IF NOT EXISTS project_team (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      seq INTEGER NOT NULL,
      role_title TEXT NOT NULL,
      full_name TEXT NOT NULL DEFAULT '',
      personnel_no TEXT NOT NULL DEFAULT '',
      phone TEXT NOT NULL DEFAULT '',
      email TEXT NOT NULL DEFAULT '',
      workplace TEXT NOT NULL DEFAULT '',
      grp TEXT NOT NULL DEFAULT 'core'
    )`),
    database.prepare(`CREATE TABLE IF NOT EXISTS project_kpis (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      seq INTEGER NOT NULL,
      achievement TEXT NOT NULL,
      lag_title TEXT NOT NULL DEFAULT '',
      lag_formula TEXT NOT NULL DEFAULT '',
      lag_desc TEXT NOT NULL DEFAULT '',
      lead_title TEXT NOT NULL DEFAULT '',
      lead_formula TEXT NOT NULL DEFAULT '',
      lead_desc TEXT NOT NULL DEFAULT ''
    )`),
    database.prepare(`CREATE TABLE IF NOT EXISTS project_wbs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      seq INTEGER NOT NULL,
      level INTEGER NOT NULL DEFAULT 1,
      parent_id INTEGER REFERENCES project_wbs(id) ON DELETE CASCADE,
      activity TEXT NOT NULL DEFAULT '',
      sub_activity TEXT NOT NULL DEFAULT '',
      weight TEXT NOT NULL DEFAULT '',
      person_hours INTEGER NOT NULL DEFAULT 0,
      prerequisite TEXT NOT NULL DEFAULT '',
      duration TEXT NOT NULL DEFAULT '',
      start_date TEXT NOT NULL DEFAULT '',
      end_date TEXT NOT NULL DEFAULT '',
      partner_unit TEXT NOT NULL DEFAULT '',
      deliverable TEXT NOT NULL DEFAULT '',
      quality_control TEXT NOT NULL DEFAULT '',
      progress INTEGER NOT NULL DEFAULT 0
    )`),
    database.prepare(`CREATE TABLE IF NOT EXISTS project_wbs_progress_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      wbs_id INTEGER NOT NULL REFERENCES project_wbs(id) ON DELETE CASCADE,
      progress INTEGER NOT NULL,
      note TEXT NOT NULL DEFAULT '',
      recorded_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`),
    database.prepare(`CREATE TABLE IF NOT EXISTS project_documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      wbs_id INTEGER REFERENCES project_wbs(id) ON DELETE CASCADE,
      file_name TEXT NOT NULL,
      file_type TEXT NOT NULL DEFAULT 'application/octet-stream',
      file_size INTEGER NOT NULL DEFAULT 0,
      file_data BLOB NOT NULL,
      note TEXT NOT NULL DEFAULT '',
      uploaded_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      form_status TEXT NOT NULL DEFAULT 'pending',
      content_status TEXT NOT NULL DEFAULT 'pending',
      review_note TEXT NOT NULL DEFAULT '',
      reviewed_at TEXT
    )`),
    database.prepare(`CREATE TABLE IF NOT EXISTS project_risks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      seq INTEGER NOT NULL,
      title TEXT NOT NULL,
      probability INTEGER NOT NULL,
      severity INTEGER NOT NULL,
      effect INTEGER NOT NULL,
      rpn INTEGER NOT NULL,
      response_plan TEXT NOT NULL DEFAULT ''
    )`),
    database.prepare(`CREATE TABLE IF NOT EXISTS project_stakeholders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      seq INTEGER NOT NULL,
      name TEXT NOT NULL,
      scope TEXT NOT NULL,
      expectation TEXT NOT NULL DEFAULT ''
    )`),
  ]);

  const existing = await database.prepare("SELECT id FROM projects LIMIT 1").first<{ id: number }>();
  if (!existing) {
    await seedEpmProject(database);
  }

  return database;
}

async function seedEpmProject(database: D1Database) {
  const insertProject = await database
    .prepare(`INSERT INTO projects
      (name, code, sponsor_org, pm_name, supervisor_name, status, progress, start_date, end_date, strategy, strategy_theme, description, necessity)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(
      "توسعه نظام مدیریت پروژه در بانک",
      "EPM-1403-01",
      "اداره کل برنامه‌ریزی و مدیریت تحول",
      "—",
      "—",
      "در حال اجرا",
      34,
      "1403/02/01",
      "1404/12/11",
      "",
      "",
      "نظام مدیریت پروژه در بانک یک نظام اطلاعاتی یکپارچه ای است که از طریق آن امکان ایجاد فضای مناسب  برای جمع آوری، طبقه بندی، ردیابی، کنترل و پایش پروژه ها بر اساس یک الگوی ساختار یافته و روشمند برای اداره کل برنامه ریزی و مدیریت تحول فراهم می آید و پروژه های تحول آفرین بانک را بر اساس الزامات نظام مدیریت پروژه کنترل می کند. از آنجایی که نظام مدیریت پروژه در بانک در سال گذشته تدوین و متناسب با شرایط حاکم بر محیط کسب و کار بانک به مرحله اجرا گذاشته شده است لذا با توجه به افزایش سطح بلوغ دانشی اجزای تشکیل دهنده این نظام و همچنین با اخذ بازخورد از نمایندگان برنامه ریزی و فن‌آوری اطلاعات، دست اندرکاران و تیم های اجرایی پروژه در خصوص نحوه کارکرد نظام و سامانه مدیریت پروژه با توجه به تجربیات کسب  شده در دوره های گذشته در خصوص پیاده سازی فرایند مدیریت پروژه در فضای برنامه ریزی راهبردی بانک و همچنین استقرار سامانه مدیریت پروژه در محیط کسب و کار بانک امکان بهینه سازی و توسعه کمی و کیفی کارکردها، فرایندها و الزامات نظام مدیریت پروژه در سال آینده، بیش از گذشته فراهم بوده و از این طریق سامانه مدیریت پروژه بر اساس الزامات ایزو 100006 و PMbok بهبود می یابد. پروژه توسعه نظام مدیریت پروژه در بانک برای بهبود فرایند تدوین منشور پروژه ها، ثبت WBS پروژه در سامانه EPM، جمع آوری داده های مربوط به پیشرفت پروژه ها و کنترل و پایش پروژه ها مطابق با WBS مندرج در منشور انجام می پذیرد و بر کیفیت مستندات بارگذاری شده توسط مدیران پروژه هم از بعد شکل و هم از بعد محتوا، کنترل های لازم را برقرار می نماید و تأیید مستندات بارگذاری شده را بر اساس تایید ناظر کیفی در سیستم اعمال می نماید. این پروژه منبعی برای ثبت دانش ایجاد شده جهت اجرای فعالیت های کلیدی ذیل پیشرفت پروژه ها اقدام نموده و بر نحوه تغییرات اعمال شده بر روی WBS (ساختار شکست کار) پروژه ها مطابق با صورتجلسه کمیته تغییرات پروژه هااقدامات لازم را مبذول خواهد داشت.پس از پایان زمان اجرائی پروژه‌ها ، ضمن فعالسازی فرم خاتمه پروژه، اطلاعات لازم توسط مدیران پروژه ثبت و پس از تایید و ثبت نظرات ناظر پروژه،مدیربرنامه و معاونین برنامه ریزی و فن آوری اطلاعات پروژه‌ها خاتمه می‌یابد. به منظور توسعه فرهنگ پروژه محوری در محیط کسب و کار بانک، جشنواره انتخاب پروژه های برتر بر اساس الزامات نظام مدیریت پروژه بانک برگزار و به پروژه های برتر جوایز نفیس اعطا می گردد که این امر می تواند به سطح کیفی اجرای پروژه و افزایش توان اجرا کمک نماید.",
      "ابزار نظام مدیریت پروژه در بانک از طریق توسعه سامانه EPM انجام می پذیرد. بر اساس الزامات این سامانه اطلاعاتی نظیر میزان پیشرفت پروژه، دلایل عدم پیشرفت پروژه مطابق با WBS و تعیین نقش و سهم درصد نقش آفرینی هر یک از ارکان اجرای پروژه تعیین می گردد و به طور کلی بر ریسک های اجرای پروژه و موانع و محدودیت های آن اشرافیت اطلاعاتی داشته و خدمات راهبری و هدایت تخصصی مدیران پروژه را در سطوح شعبه، منطقه و ادارات ستاد حوزه مرکزی بر عهده می گیرد. این پروژه بنابر ضرورت های ذیل در اداره کل برنامه ریزی و مدیریت تحول تدوین و در محیط کسب و کار بانک به مرحله اجرا گذاشته می شود. \n1. ارتقای سطح کیفی تدوین منشور پروژه ها در کلیه سطوح بانک \n2. امکان ثبت پیشرفت ها و بارگذاری مستندات مطابق با الزامات نظام مدیریت پروژه \n7. اخذ تأییدیه شکلی و محتوایی مستندات ذیل فعالیت های پروژه \n8. مدیریت بر ریسک های اجرای پروژه \n9. مدیریت دانش پروژه های در دست اجرا \n10. انتخاب پروژه های برتر\n  11. مدیریت بر خاتمه پروژه با تطبیق دستاوردهای مندرج در منشور پروژه\n  12- توسعه گزارشات قابل دریافت از سامانه مدیریت پروژه\n 13-امکان تعریف ساختار شکست کار تا 3 سطح",
    )
    .run();

  const projectId = insertProject.meta.last_row_id as number;

  const team: Array<[string, string, "core" | "member"]> = [
    ["حامی طرح/ مدیر برنامه", "", "core"],
    ["مدیر پروژه", "", "core"],
    ["ناظر پروژه", "", "core"],
  ];
  await database.batch(
    team.map((row, index) =>
      database
        .prepare(`INSERT INTO project_team (project_id, seq, role_title, full_name, grp) VALUES (?, ?, ?, ?, ?)`)
        .bind(projectId, index + 1, row[0], row[1], row[2]),
    ),
  );

  const kpis: Array<[string, string, string, string, string, string, string]> = [
    [
      "ثبت، کنترل و پایش میزان پیشرفت پروژه‌ها مطابق با WBS مصوب",
      "ضریب رشد پروژه‌ها",
      "(متوسط رشد پروژه‌ها انتهای دوره − متوسط رشد پروژه‌ها ابتدای دوره) / متوسط رشد پروژه‌ها ابتدای دوره × ۱۰۰ به ازای هر واحد سازمانی",
      "با توجه به میزان درصد ثبت‌شده توسط کاربران سامانه و مدیران پروژه، میزان رشد پروژه از ابتدا به انتهای پروژه مشخص می‌گردد.",
      "نسبت پروژه‌های دارای پیشرفت تأییدی",
      "نسبت پروژه‌های دارای پیشرفت تأییدی / درصد پیشرفت برنامه‌ای به ازای هر پروژه",
      "",
    ],
    [
      "تحلیل انحراف پیشرفت پروژه",
      "ضریب تغییرات انحراف پروژه به ازای هر واحد سازمانی",
      "دلتای درصد پیشرفت تأییدی هر پروژه / دلتای درصد پیشرفت برنامه‌ای هر پروژه",
      "به‌منظور تعیین شکاف درصد پیشرفت برنامه‌ای با درصد پیشرفت تأییدشده توسط ناظران، انحراف پروژه تعیین می‌گردد.",
      "سرانه پیشرفت تأییدی پروژه‌ها",
      "سرانه پیشرفت تأییدی پروژه‌های شعبه / منطقه / ستاد",
      "",
    ],
    [
      "مدیریت مؤثر بر ریسک‌های اجرای پروژه",
      "ضریب وقوع ریسک در پروژه‌ها",
      "(ریسک‌های به‌وقوع‌پیوسته انتهای دوره − ریسک‌های به‌وقوع‌پیوسته ابتدای دوره) / ریسک‌های به‌وقوع‌پیوسته ابتدای دوره × ۱۰۰",
      "بر اساس محاسبه ریسک‌ها در ابتدا و انتهای پروژه، ضریب وقوع ریسک مشخص می‌گردد.",
      "نسبت ریسک‌های به‌وقوع‌پیوسته",
      "نسبت ریسک‌های به‌وقوع‌پیوسته / ریسک‌های شناسایی‌شده به ازای هر پروژه",
      "",
    ],
    [
      "مدیریت بر دانش اجرای پروژه‌ها",
      "ضریب افزایش ثبت مستندات دانشی پروژه",
      "(مستندات دانشی انتهای دوره − مستندات دانشی ابتدای دوره) / مستندات دانشی ابتدای دوره × ۱۰۰",
      "تعداد مستندات ثبت‌شده کاربران سامانه و مدیران پروژه محاسبه و ضریب مربوطه تعیین می‌گردد.",
      "نسبت مستندات دانشی تأییدشده",
      "نسبت مستندات دانشی تأییدشده / مستندات دانشی ثبت‌شده",
      "",
    ],
    [
      "مدیریت بر دستاوردهای پروژه‌ها مطابق با الزامات منشور پروژه",
      "ضریب انطباق دستاورد پروژه با اهداف حاصله",
      "دلتای تحقق اهداف بر اساس KPI پروژه / دلتای دستاورد کسب‌شده بر اساس الزامات منشور",
      "با توجه به اهداف تعیین‌شده برای اجرای پروژه، میزان تحقق آن در پایان دوره مشخص می‌گردد.",
      "نسبت اهداف محقق‌شده",
      "نسبت اهداف محقق‌شده / اهداف برنامه‌ریزی‌شده به ازای هر شاخص کلیدی",
      "",
    ],
  ];
  await database.batch(
    kpis.map((row, index) =>
      database
        .prepare(`INSERT INTO project_kpis
          (project_id, seq, achievement, lag_title, lag_formula, lag_desc, lead_title, lead_formula, lead_desc)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .bind(projectId, index + 1, row[0], row[1], row[2], row[3], row[4], row[5], row[6]),
    ),
  );

  const wbs: Array<[string, string, string, number, string, string, string, string, string]> = [
    ["بروزرسانی نظام مدیریت پروژه در بانک", "اخذ بازخورد از نمایندگان برنامه‌ریزی مناطق و مدیران پروژه ستاد مرکزی", "2%", 20, "2 هفته", "1403/02/01", "1403/02/14", "ندارد", "ارائه مستندات خلاصه نظرات کاربران در خصوص کارکرد نظام مدیریت پروژه بانک"],
    ["", "مطالعه نمونه‌های موفق از نظامات مدیریت پروژه در شبکه بانکی", "2%", 20, "2 هفته", "1403/02/01", "1403/02/14", "ندارد", "ارائه گزارش مطالعات تطبیقی best practice PMO در شبکه بانکی"],
    ["", "عارضه‌یابی و آسیب‌شناسی نظام مدیریت پروژه در محیط کسب‌وکار بانک", "1%", 10, "1 هفته", "1403/02/16", "1403/02/22", "ندارد", "ارائه گزارش عارضه‌یابی و آسیب‌شناسی نظام مدیریت پروژه بانک"],
    ["", "بروزرسانی نظام مدیریت پروژه بانک بر اساس الزامات ایزو ۱۰۰۰۶ و PMBOK", "3%", 30, "2 هفته", "1403/02/16", "1403/02/29", "ندارد", "ارائه نظام‌نامه مدیریت پروژه بازنگری‌شده به همراه صورت‌خلاصه تغییرات"],
    ["", "استقرار فرایند مدیریت پروژه در محیط کسب‌وکار بانک", "4%", 40, "2 هفته", "1403/02/01", "1403/02/16", "ندارد", "ارائه شناسنامه فرایند مدیریت پروژه بر اساس الزامات اداره کل سازمان و روش‌ها"],
    ["بروزرسانی سامانه مدیریت پروژه در بانک", "اخذ بازخورد از نواقص و اشکالات متداول از کاربران سامانه در واحدهای صف و ستاد", "2%", 20, "1 هفته", "1403/02/01", "1403/02/08", "ندارد", "جمع‌آوری مستندات نواقص سامانه EPM"],
    ["", "انطباق کارکرد سامانه موجود با الزامات نظام مدیریت پروژه", "2%", 20, "1 هفته", "1403/02/16", "1403/02/22", "ندارد", "ارائه تحلیل انحرافات سامانه با الزامات نظام مدیریت پروژه"],
    ["", "ثبت اطلاعات پایه منشور پروژه‌های جدید بانک در سال جاری", "6%", 60, "6 هفته", "1403/02/15", "1403/03/01", "ندارد", "ارائه مستندات ثبت اطلاعات پایه سامانه"],
    ["", "جمع‌آوری داده‌های مربوط به پیشرفت پروژه", "22%", 220, "11 ماه، هر ماه ۲۰ ساعت", "1403/03/01", "1404/02/01", "ندارد", "ارائه خلاصه گزارش جمع‌آوری مستندات بارگذاری‌شده در سامانه EPM"],
    ["برگزاری جشنواره مدیریت پروژه", "ایجاد دبیرخانه برای برگزاری جشنواره مدیریت پروژه‌ها", "1%", 10, "1 هفته", "1404/09/01", "1404/09/08", "ندارد", "ارائه مستندات راه‌اندازی دبیرخانه جشنواره مدیریت پروژه"],
    ["", "تعیین شاخص‌ها و معیارهای انتخاب پروژه‌های برتر", "3%", 30, "2 هفته", "1404/09/03", "1404/09/16", "ندارد", "ارائه مستندات معیارهای انتخاب جشنواره پروژه‌های برتر"],
  ];
  await database.batch(
    wbs.map((row, index) =>
      database
        .prepare(`INSERT INTO project_wbs
          (project_id, seq, activity, sub_activity, weight, person_hours, duration, start_date, end_date, partner_unit, deliverable)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .bind(projectId, index + 1, row[0], row[1], row[2], row[3], row[4], row[5], row[6], row[7], row[8]),
    ),
  );

  const risks: Array<[string, number, number, number, string]> = [
    ["خارج از سرویس بودن سامانه EPM", 2, 2, 2, "بروزرسانی سامانه EPM"],
    ["تأخیر در ثبت اطلاعات پیشرفت پروژه توسط ارکان پروژه‌ها", 2, 2, 2, "اطلاع‌رسانی به‌موقع برای بارگذاری مستندات مطابق با WBS مصوب"],
    ["ضعف در هماهنگی و ساماندهی ارکان پروژه برای اجرای فعالیت‌های مندرج در WBS", 2, 2, 2, "ساماندهی مناسب تیم‌های اجرای پروژه در محیط کسب‌وکار بانک"],
    ["ضعف در شناسایی به‌موقع ریسک‌های مترتب بر اجرای پروژه‌ها", 2, 3, 2, "شناسایی به‌موقع ریسک‌های حاکم بر اجرای پروژه‌های تحول‌آفرین در بانک"],
    ["ضعف در شناسایی و ثبت دانش کسب‌شده حین اجرای پروژه‌ها", 3, 3, 2, "کنترل مؤثر بر نحوه ثبت دانش‌های کسب‌شده برای اجرای پروژه در سامانه PMO"],
    ["عدم تطابق دستاوردها با فرم خاتمه پروژه", 3, 3, 3, "کنترل دستاوردها بر اساس شاخص‌های کلیدی عملکرد به ازای هر پروژه در زمان خاتمه کار"],
    ["نامتوازن بودن درصد پیشرفت پروژه‌ها در بسته پروژه‌های شعب، مناطق و ادارات ستاد", 3, 3, 3, "تمرکز بر اجرای متوازن پروژه‌ها به‌صورت یکپارچه در سطوح شعب، مناطق و ستاد"],
    ["تغییرات متوالی در ارکان پروژه‌های بانک", 2, 2, 2, "انتخاب مناسب ارکان اجرایی بر اساس سوابق و تخصص موردنیاز"],
    ["ضعف در توانمندی ارکان مدیریت پروژه در اجرای فعالیت‌های ذیل پروژه", 3, 4, 3, "توانمندسازی ارکان اجرایی پروژه در سطوح شعب، مناطق و ادارات ستاد"],
    ["ضعف در قابلیت‌های ابزارساز، نهادساز و ظرفیت‌ساز در جهت ارتقای اجرای پروژه‌ها", 3, 3, 3, "ارتقای قابلیت‌های ابزارساز، نهادساز و ظرفیت‌ساز در محیط کسب‌وکار بانک"],
  ];
  await database.batch(
    risks.map((row, index) =>
      database
        .prepare(`INSERT INTO project_risks
          (project_id, seq, title, probability, severity, effect, rpn, response_plan)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
        .bind(projectId, index + 1, row[0], row[1], row[2], row[3], row[1] * row[2] * row[3], row[4]),
    ),
  );

  const stakeholders: Array<[string, string, string]> = [
    ["مدیرعامل", "درون‌سازمانی", "مدیریت و کنترل پروژه‌ها مطابق با آیین‌نامه مصوب بانک"],
    ["معاونت برنامه‌ریزی و هدایت راهبردی", "درون‌سازمانی", "استانداردسازی فرایند مدیریت پروژه در بانک"],
    ["هیأت مدیره بانک", "درون‌سازمانی", "پروژه‌محور کردن فعالیت‌های کلیدی در محیط کسب‌وکار بانک"],
    ["هیأت عامل بانک", "درون‌سازمانی", "ارائه گزارش پیشرفت پروژه‌های مربوط به واحدهای ستادی"],
    ["مدیران مناطق", "درون‌سازمانی", "ارائه گزارش پیشرفت پروژه‌های مناطق و شعب وابسته؛ اعلام بازخورد در خصوص ثبت و تأیید درصد پیشرفت"],
    ["روسای شعب", "درون‌سازمانی", "اعلام بازخورد در خصوص نحوه ثبت و تأیید درصد پیشرفت پروژه"],
    ["مدیران پروژه‌ها", "درون‌سازمانی", "ارائه بازخورد به‌موقع در خصوص تأییدی شکلی و محتوایی مستندات بارگذاری‌شده؛ رفع موانع و ریسک‌های اجرا"],
    ["وزارت اقتصاد و دارایی", "برون‌سازمانی", "ارائه گزارش پیشرفت پروژه‌ها بر اساس شاخص‌های ابلاغی وزارت اقتصاد"],
  ];
  await database.batch(
    stakeholders.map((row, index) =>
      database
        .prepare(`INSERT INTO project_stakeholders (project_id, seq, name, scope, expectation) VALUES (?, ?, ?, ?, ?)`)
        .bind(projectId, index + 1, row[0], row[1], row[2]),
    ),
  );
}

export async function listProjects(): Promise<ProjectSummary[]> {
  const database = await ensureProjectsSchema();
  const { results } = await database
    .prepare(`SELECT id, name, code, sponsor_org AS sponsorOrg, pm_name AS pmName,
      status, progress, start_date AS startDate, end_date AS endDate
      FROM projects ORDER BY id ASC`)
    .all<ProjectSummary>();
  return results ?? [];
}

export async function getProjectCharter(id: number): Promise<ProjectCharter | null> {
  const database = await ensureProjectsSchema();

  const project = await database
    .prepare(`SELECT id, name, code, sponsor_org AS sponsorOrg, pm_name AS pmName,
      status, progress, start_date AS startDate, end_date AS endDate,
      strategy, strategy_theme AS strategyTheme, description, necessity
      FROM projects WHERE id = ? LIMIT 1`)
    .bind(id)
    .first<ProjectCharter["project"]>();

  if (!project) return null;

  const [team, kpis, wbs, risks, stakeholders, documents] = await Promise.all([
    database
      .prepare(`SELECT id, seq, role_title AS roleTitle, full_name AS fullName, personnel_no AS personnelNo,
        phone, email, workplace, grp AS "group" FROM project_team WHERE project_id = ? ORDER BY seq ASC`)
      .bind(id)
      .all<ProjectTeamMember>(),
    database
      .prepare(`SELECT id, seq, achievement, lag_title AS lagTitle, lag_formula AS lagFormula, lag_desc AS lagDesc,
        lead_title AS leadTitle, lead_formula AS leadFormula, lead_desc AS leadDesc
        FROM project_kpis WHERE project_id = ? ORDER BY seq ASC`)
      .bind(id)
      .all<ProjectKpi>(),
    database
      .prepare(`SELECT id, seq, level, parent_id AS parentId, activity, sub_activity AS subActivity, weight, person_hours AS personHours,
        prerequisite, duration, start_date AS startDate, end_date AS endDate, partner_unit AS partnerUnit,
        deliverable, quality_control AS qualityControl, progress FROM project_wbs WHERE project_id = ? ORDER BY seq ASC`)
      .bind(id)
      .all<ProjectWbsItem>(),
    database
      .prepare(`SELECT id, seq, title, probability, severity, effect, rpn, response_plan AS responsePlan
        FROM project_risks WHERE project_id = ? ORDER BY seq ASC`)
      .bind(id)
      .all<ProjectRisk>(),
    database
      .prepare(`SELECT id, seq, name, scope, expectation FROM project_stakeholders WHERE project_id = ? ORDER BY seq ASC`)
      .bind(id)
      .all<ProjectStakeholder>(),
    database
      .prepare(`SELECT id, wbs_id AS wbsId, file_name AS fileName, file_type AS fileType, file_size AS fileSize,
        note, uploaded_at AS uploadedAt, form_status AS formStatus, content_status AS contentStatus,
        review_note AS reviewNote, reviewed_at AS reviewedAt
        FROM project_documents WHERE project_id = ? ORDER BY id DESC`)
      .bind(id)
      .all<ProjectDocument>(),
  ]);

  return {
    project,
    team: team.results ?? [],
    kpis: kpis.results ?? [],
    wbs: wbs.results ?? [],
    risks: risks.results ?? [],
    stakeholders: stakeholders.results ?? [],
    documents: documents.results ?? [],
  };
}

export async function addWbsItem(projectId: number, item: NewWbsItem): Promise<ProjectWbsItem> {
  const database = await ensureProjectsSchema();

  const maxSeqRow = await database
    .prepare("SELECT COALESCE(MAX(seq), 0) AS maxSeq FROM project_wbs WHERE project_id = ?")
    .bind(projectId)
    .first<{ maxSeq: number }>();
  const nextSeq = (maxSeqRow?.maxSeq ?? 0) + 1;

  const inserted = await database
    .prepare(`INSERT INTO project_wbs
      (project_id, seq, level, parent_id, activity, sub_activity, weight, person_hours, prerequisite, duration, start_date, end_date, partner_unit, deliverable, quality_control)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(
      projectId,
      nextSeq,
      item.level,
      item.parentId,
      item.activity,
      item.subActivity,
      item.weight,
      item.personHours,
      item.prerequisite,
      item.duration,
      item.startDate,
      item.endDate,
      item.partnerUnit,
      item.deliverable,
      item.qualityControl,
    )
    .run();

  const id = inserted.meta.last_row_id as number;
  return { id, seq: nextSeq, progress: 0, ...item };
}

export async function deleteWbsItem(projectId: number, itemId: number): Promise<boolean> {
  const database = await ensureProjectsSchema();
  const result = await database
    .prepare("DELETE FROM project_wbs WHERE id = ? AND project_id = ?")
    .bind(itemId, projectId)
    .run();
  return result.meta.changes > 0;
}

export async function recordWbsProgress(
  wbsId: number,
  progress: number,
  note: string,
): Promise<{ progress: number; logs: ProgressLogEntry[] }> {
  const database = await ensureProjectsSchema();
  const clamped = Math.max(0, Math.min(100, Math.round(progress)));

  await database.batch([
    database.prepare("UPDATE project_wbs SET progress = ? WHERE id = ?").bind(clamped, wbsId),
    database
      .prepare("INSERT INTO project_wbs_progress_logs (wbs_id, progress, note) VALUES (?, ?, ?)")
      .bind(wbsId, clamped, note),
  ]);

  const logs = await getWbsProgressLogs(wbsId);
  return { progress: clamped, logs };
}

export async function getWbsProgressLogs(wbsId: number): Promise<ProgressLogEntry[]> {
  const database = await ensureProjectsSchema();
  const { results } = await database
    .prepare(`SELECT id, progress, note, recorded_at AS recordedAt
      FROM project_wbs_progress_logs WHERE wbs_id = ? ORDER BY recorded_at DESC, id DESC`)
    .bind(wbsId)
    .all<ProgressLogEntry>();
  return results ?? [];
}

export async function listDocuments(projectId: number, wbsId?: number): Promise<ProjectDocument[]> {
  const database = await ensureProjectsSchema();
  const query = wbsId
    ? database
        .prepare(`SELECT id, wbs_id AS wbsId, file_name AS fileName, file_type AS fileType, file_size AS fileSize,
          note, uploaded_at AS uploadedAt, form_status AS formStatus, content_status AS contentStatus,
          review_note AS reviewNote, reviewed_at AS reviewedAt
          FROM project_documents WHERE project_id = ? AND wbs_id = ? ORDER BY id DESC`)
        .bind(projectId, wbsId)
    : database
        .prepare(`SELECT id, wbs_id AS wbsId, file_name AS fileName, file_type AS fileType, file_size AS fileSize,
          note, uploaded_at AS uploadedAt, form_status AS formStatus, content_status AS contentStatus,
          review_note AS reviewNote, reviewed_at AS reviewedAt
          FROM project_documents WHERE project_id = ? ORDER BY id DESC`)
        .bind(projectId);
  const { results } = await query.all<ProjectDocument>();
  return results ?? [];
}

export async function addDocument(
  projectId: number,
  wbsId: number | null,
  fileName: string,
  fileType: string,
  fileData: ArrayBuffer,
  note: string,
): Promise<ProjectDocument> {
  const database = await ensureProjectsSchema();
  const inserted = await database
    .prepare(`INSERT INTO project_documents (project_id, wbs_id, file_name, file_type, file_size, file_data, note)
      VALUES (?, ?, ?, ?, ?, ?, ?)`)
    .bind(projectId, wbsId, fileName, fileType, fileData.byteLength, fileData, note)
    .run();

  const id = inserted.meta.last_row_id as number;
  const uploadedAt = new Date().toISOString();
  return {
    id,
    wbsId,
    fileName,
    fileType,
    fileSize: fileData.byteLength,
    note,
    uploadedAt,
    formStatus: "pending",
    contentStatus: "pending",
    reviewNote: "",
    reviewedAt: null,
  };
}

export async function reviewDocument(
  projectId: number,
  documentId: number,
  formStatus: ReviewStatus,
  contentStatus: ReviewStatus,
  reviewNote: string,
): Promise<boolean> {
  const database = await ensureProjectsSchema();
  const result = await database
    .prepare(`UPDATE project_documents
      SET form_status = ?, content_status = ?, review_note = ?, reviewed_at = CURRENT_TIMESTAMP
      WHERE id = ? AND project_id = ?`)
    .bind(formStatus, contentStatus, reviewNote, documentId, projectId)
    .run();
  return result.meta.changes > 0;
}

export async function getDocumentFile(
  projectId: number,
  documentId: number,
): Promise<{ fileName: string; fileType: string; fileData: ArrayBuffer } | null> {
  const database = await ensureProjectsSchema();
  const row = await database
    .prepare(`SELECT file_name AS fileName, file_type AS fileType, file_data AS fileData
      FROM project_documents WHERE id = ? AND project_id = ?`)
    .bind(documentId, projectId)
    .first<{ fileName: string; fileType: string; fileData: unknown }>();
  if (!row) return null;

  // The local D1 emulator returns BLOB columns as a plain byte array instead of an ArrayBuffer.
  const raw = row.fileData;
  const bytes = raw instanceof ArrayBuffer ? new Uint8Array(raw) : new Uint8Array(raw as number[]);
  return { fileName: row.fileName, fileType: row.fileType, fileData: bytes.buffer as ArrayBuffer };
}

export async function deleteDocument(projectId: number, documentId: number): Promise<boolean> {
  const database = await ensureProjectsSchema();
  const result = await database
    .prepare("DELETE FROM project_documents WHERE id = ? AND project_id = ?")
    .bind(documentId, projectId)
    .run();
  return result.meta.changes > 0;
}
