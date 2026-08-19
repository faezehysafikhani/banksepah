"use client";

import type { CSSProperties, FormEvent, ReactNode } from "react";
import { useMemo, useState } from "react";
import WbsWorkspace from "./WbsWorkspace";
import {
  Activity,
  CalendarRange,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ChevronsDownUp,
  ChevronsUpDown,
  Clock3,
  FileText,
  Filter,
  FolderKanban,
  FolderPlus,
  GitBranch,
  History,
  LayoutDashboard,
  Layers3,
  ListChecks,
  Paperclip,
  Pencil,
  RefreshCcw,
  Save,
  Search,
  Send,
  Settings2,
  ShieldAlert,
  Trash2,
  Users,
  X,
} from "lucide-react";

type ProjectKind = "آبشاری" | "چابک" | "اقدام";
type ProjectStatus = "برنامه‌ریزی" | "در حال انجام" | "متوقف شده" | "تکمیل شده";
type WorkspaceMode = "portfolio" | "waterfall" | "agile" | "edit" | "dashboard";
export type ProjectSection = "سبد پروژه‌ها و اقدامات" | "ایجاد پروژه";
type ProjectAction = { type: "history" | "delete"; project: ProjectItem } | null;

type ProjectItem = {
  id: number;
  name: string;
  kind: ProjectKind;
  owner: string;
  manager: string;
  start: string;
  end: string;
  status: ProjectStatus;
  approved: boolean;
};

const initialProjects: ProjectItem[] = [
  { id: 1, name: "توسعه سامانه مدیریت پروژه‌های بانک", kind: "آبشاری", owner: "فناوری اطلاعات", manager: "مدیر سامانه", start: "۱۴۰۵/۰۱/۱۵", end: "۱۴۰۵/۱۲/۲۰", status: "در حال انجام", approved: true },
  { id: 2, name: "نوسازی مرکز داده و زیرساخت سراسری", kind: "آبشاری", owner: "فناوری اطلاعات", manager: "علی رضایی", start: "۱۴۰۵/۰۲/۰۱", end: "۱۴۰۶/۰۳/۳۰", status: "در حال انجام", approved: true },
  { id: 3, name: "بانکداری همراه نسل جدید", kind: "چابک", owner: "فناوری اطلاعات", manager: "مریم احمدی", start: "۱۴۰۵/۰۱/۲۰", end: "۱۴۰۵/۰۹/۳۰", status: "در حال انجام", approved: true },
  { id: 4, name: "هوشمندسازی تجربه مشتریان", kind: "چابک", owner: "فناوری اطلاعات", manager: "مریم احمدی", start: "۱۴۰۵/۰۳/۰۱", end: "۱۴۰۵/۱۱/۱۵", status: "برنامه‌ریزی", approved: false },
  { id: 5, name: "احداث ساختمان مرکزی جدید", kind: "آبشاری", owner: "ساختمان و املاک", manager: "محمد کاظمی", start: "۱۴۰۴/۰۸/۱۰", end: "۱۴۰۶/۰۶/۳۱", status: "در حال انجام", approved: true },
  { id: 6, name: "بهینه‌سازی تأسیسات شعب منتخب", kind: "آبشاری", owner: "ساختمان و املاک", manager: "محمد کاظمی", start: "۱۴۰۵/۰۱/۱۰", end: "۱۴۰۵/۰۸/۳۰", status: "در حال انجام", approved: true },
  { id: 7, name: "بازطراحی هویت بصری شعب", kind: "آبشاری", owner: "ساختمان و املاک", manager: "سارا محمدی", start: "۱۴۰۵/۰۲/۱۵", end: "۱۴۰۵/۱۰/۱۵", status: "متوقف شده", approved: true },
  { id: 8, name: "استقرار باجه‌های خدمت هوشمند", kind: "چابک", owner: "امور اجرایی", manager: "رضا کریمی", start: "۱۴۰۵/۰۳/۱۰", end: "۱۴۰۵/۱۲/۱۰", status: "در حال انجام", approved: true },
  { id: 9, name: "بازنگری دستورالعمل عملیات شعب", kind: "اقدام", owner: "امور اجرایی", manager: "رضا کریمی", start: "۱۴۰۵/۰۴/۰۱", end: "۱۴۰۵/۰۵/۱۵", status: "تکمیل شده", approved: true },
  { id: 10, name: "تجهیز مرکز پشتیبانی و انبار مرکزی", kind: "آبشاری", owner: "پشتیبانی", manager: "حمید مرادی", start: "۱۴۰۵/۰۲/۲۰", end: "۱۴۰۵/۰۹/۲۵", status: "در حال انجام", approved: true },
  { id: 11, name: "انتخاب تأمین‌کننده تجهیزات شبکه", kind: "اقدام", owner: "پشتیبانی", manager: "حمید مرادی", start: "۱۴۰۵/۰۵/۰۱", end: "۱۴۰۵/۰۶/۰۱", status: "برنامه‌ریزی", approved: false },
  { id: 12, name: "تدوین برنامه تداوم کسب‌وکار", kind: "اقدام", owner: "مدیریت ریسک", manager: "نرگس حسینی", start: "۱۴۰۵/۰۳/۱۵", end: "۱۴۰۵/۰۷/۳۰", status: "در حال انجام", approved: true },
];

function ProjectActionModal({
  action,
  onClose,
  onDelete,
}: {
  action: NonNullable<ProjectAction>;
  onClose: () => void;
  onDelete: (id: number) => void;
}) {
  const { project, type } = action;

  return (
    <div className="project-modal-backdrop" role="presentation">
      <section className="project-action-modal" role="dialog" aria-modal="true" aria-labelledby="project-modal-title">
        <header>
          <div>
            <small>{type === "history" ? "گردش رویدادها" : "تأیید عملیات"}</small>
            <h2 id="project-modal-title">{type === "delete" ? "حذف پروژه" : project.name}</h2>
          </div>
          <button className="modal-close" type="button" onClick={onClose} aria-label="بستن"><X size={18} /></button>
        </header>

        {type === "history" && (
          <div className="project-history">
            <article><i /><div><strong>آخرین بروزرسانی وضعیت</strong><span>وضعیت پروژه به «{project.status}» تغییر کرد.</span><small>امروز، ساعت ۱۴:۳۵ · {project.manager}</small></div></article>
            <article><i /><div><strong>ثبت گزارش پیشرفت</strong><span>گزارش دوره‌ای پروژه ثبت و برای حامی ارسال شد.</span><small>۲ روز پیش · مدیر سامانه</small></div></article>
            <article><i /><div><strong>تأیید منشور پروژه</strong><span>منشور پس از بررسی در کارتابل تأیید شد.</span><small>هفته گذشته · مدیریت ارشد</small></div></article>
            <article><i /><div><strong>ایجاد پروژه</strong><span>پروژه از نوع {project.kind} در واحد {project.owner} ایجاد شد.</span><small>{project.start} · admin</small></div></article>
          </div>
        )}

        {type === "delete" && (
          <div className="project-delete-confirm">
            <span><Trash2 size={26} /></span>
            <p>پروژه «<strong>{project.name}</strong>» از سبد حذف شود؟</p>
            <small>این عملیات در نسخه فعلی فقط روی اطلاعات همین نشست اعمال می‌شود.</small>
            <footer><button type="button" onClick={onClose}>انصراف</button><button className="danger-confirm" type="button" onClick={() => onDelete(project.id)}><Trash2 size={16} /> حذف پروژه</button></footer>
          </div>
        )}
      </section>
    </div>
  );
}

function ProjectWorkspaceModal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="project-modal-backdrop project-full-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="project-full-modal" role="dialog" aria-modal="true" aria-label={title}>
        <button className="project-full-close" type="button" onClick={onClose} aria-label="بستن"><X size={20} /></button>
        <div className="project-full-content">{children}</div>
      </section>
    </div>
  );
}

const waterfallTabs = [
  ["charter", "منشور پروژه", FileText],
  ["schedule", "برنامه زمان‌بندی پروژه", CalendarRange],
  ["team", "تیم پروژه", Users],
  ["risks", "ریسک‌های پروژه", ShieldAlert],
  ["status", "وضعیت پروژه", Activity],
  ["delays", "دلایل تأخیر", Clock3],
  ["documents", "اسناد پروژه", Paperclip],
  ["actions", "اقدامات مرتبط", ListChecks],
  ["settings", "تنظیمات پروژه", Settings2],
] as const;

const agileTabs = [
  ...waterfallTabs.slice(0, 8),
  ["sprints", "اسپرینت", RefreshCcw],
] as const;

function fa(value: number) {
  return new Intl.NumberFormat("fa-IR").format(value);
}

function Field({
  label,
  required,
  type = "text",
  placeholder,
  options,
  value,
  disabled,
}: {
  label: string;
  required?: boolean;
  type?: "text" | "number" | "date" | "textarea" | "select";
  placeholder?: string;
  options?: string[];
  value?: string;
  disabled?: boolean;
}) {
  return (
    <label className={type === "textarea" ? "form-field wide" : "form-field"}>
      <span>{label}{required && <b>*</b>}</span>
      {type === "textarea" ? (
        <textarea placeholder={placeholder} defaultValue={value} required={required} />
      ) : type === "select" ? (
        <select defaultValue={value ?? ""}>
          <option value="" disabled>انتخاب کنید</option>
          {options?.map((option) => <option key={option}>{option}</option>)}
        </select>
      ) : (
        <input type={type} placeholder={placeholder} defaultValue={value} disabled={disabled} required={required} />
      )}
    </label>
  );
}

function CharterFields({ agile, project }: { agile: boolean; project?: ProjectItem }) {
  return (
    <div className="project-form-grid">
      <Field label="نام پروژه" required placeholder="عنوان کامل پروژه را وارد کنید" value={project?.name} />
      <Field label="کد پروژه" placeholder="مثال: PRJ-101" />
      <Field label="مالک پروژه" value="admin" disabled />
      <Field label="مدیر پروژه" type="select" required value={project?.manager} options={["مدیر سامانه", "علی رضایی", "مریم احمدی", "محمد کاظمی", "سارا محمدی", "رضا کریمی", "حمید مرادی", "نرگس حسینی"]} />
      <Field label="تقویم پروژه" type="select" required options={["تقویم رسمی بانک سپه", "تقویم فناوری اطلاعات", "تقویم پروژه‌های عمرانی"]} />
      <Field label="وضعیت" type="select" required value={project?.status} options={["برنامه‌ریزی", "در حال انجام", "متوقف شده", "تکمیل شده"]} />
      <Field label="تاریخ شروع" type="date" required />
      <Field label="تاریخ پایان" type="date" required />
      <Field label="واحد مالک" type="select" required options={["فناوری اطلاعات", "ساختمان و املاک", "امور اجرایی", "پشتیبانی", "مدیریت ریسک"]} />
      {agile && <Field label="تعداد اسپرینت" type="number" required value="3" />}
      <Field label="هزینه (ریال)" type="number" placeholder="۱,۰۰۰,۰۰۰,۰۰۰" />
      <Field label="اولویت راهبردی" type="select" options={["بحرانی", "بالا", "متوسط", "پایین"]} />
      <Field label="هدف پروژه" type="textarea" required placeholder="اهداف عملیاتی و نتایج مورد انتظار پروژه..." />
      <Field label="الزامات پروژه" type="textarea" required placeholder="الزامات کلیدی، فنی، امنیتی و اجرایی..." />
      <Field label="محدودیت‌ها و مفروضات" type="textarea" required placeholder="محدودیت‌های بودجه‌ای، زمانی و منابع انسانی..." />
      <Field label="توضیحات تکمیلی" type="textarea" placeholder="سایر توضیحات مرتبط با منشور پروژه..." />
    </div>
  );
}

function TabFields({ tab, agile }: { tab: string; agile: boolean }) {
  if (tab === "charter") return <CharterFields agile={agile} />;
  if (tab === "schedule") return (
    <div className="project-form-grid">
      <Field label="روش زمان‌بندی" type="select" options={["مسیر بحرانی (CPM)", "نقاط عطف", "اسپرینت‌محور"]} />
      <Field label="تقویم کاری" type="select" options={["تقویم رسمی بانک سپه", "تقویم ۲۴/۷", "تقویم سفارشی"]} />
      <Field label="تاریخ خط مبنا" type="date" />
      <Field label="درصد پیشرفت برنامه‌ای" type="number" placeholder="۰ تا ۱۰۰" />
      <Field label="ساختار شکست کار (WBS)" type="textarea" placeholder="بسته‌های کاری، فعالیت‌ها، مدت و وابستگی‌ها را وارد کنید..." />
      <Field label="نقاط عطف کلیدی" type="textarea" placeholder="عنوان نقطه عطف، تاریخ و معیار پذیرش..." />
    </div>
  );
  if (tab === "team") return (
    <div className="project-form-grid">
      <Field label="حامی پروژه" type="select" options={["معاونت فناوری اطلاعات", "معاونت طرح و برنامه", "مدیریت ارشد"]} />
      <Field label="مدیر پروژه" type="select" options={["مدیر سامانه", "علی رضایی", "مریم احمدی"]} />
      {agile && <Field label="مالک محصول" type="select" options={["مدیر سامانه", "مریم احمدی"]} />}
      {agile && <Field label="اسکرام مستر" type="select" options={["علی رضایی", "رضا کریمی"]} />}
      <Field label="عضو تیم" type="select" options={["کارشناس تحلیل", "کارشناس زیرساخت", "کارشناس امنیت", "نماینده کسب‌وکار"]} />
      <Field label="نقش و مسئولیت" placeholder="نقش عضو در پروژه" />
      <Field label="واحد سازمانی" type="select" options={["فناوری اطلاعات", "امور اجرایی", "پشتیبانی"]} />
      <Field label="درصد تخصیص" type="number" placeholder="۰ تا ۱۰۰" />
    </div>
  );
  if (tab === "risks") return (
    <div className="project-form-grid">
      <Field label="عنوان ریسک" required />
      <Field label="دسته‌بندی" type="select" options={["فنی", "زمانی", "مالی", "امنیتی", "منابع انسانی", "تأمین‌کننده"]} />
      <Field label="احتمال وقوع" type="select" options={["۱ - بسیار کم", "۲ - کم", "۳ - متوسط", "۴ - زیاد", "۵ - بسیار زیاد"]} />
      <Field label="شدت اثر" type="select" options={["۱ - ناچیز", "۲ - کم", "۳ - متوسط", "۴ - زیاد", "۵ - بحرانی"]} />
      <Field label="مالک ریسک" type="select" options={["مدیر پروژه", "حامی پروژه", "مسئول فنی"]} />
      <Field label="موعد اقدام" type="date" />
      <Field label="شرح ریسک و علت" type="textarea" />
      <Field label="برنامه پاسخ و اقدام کنترلی" type="textarea" />
    </div>
  );
  if (tab === "status") return (
    <div className="project-form-grid">
      <Field label="تاریخ گزارش" type="date" required />
      <Field label="سلامت پروژه" type="select" options={["سبز - مطلوب", "زرد - نیازمند توجه", "قرمز - بحرانی"]} />
      <Field label="پیشرفت برنامه‌ای" type="number" placeholder="درصد" />
      <Field label="پیشرفت واقعی" type="number" placeholder="درصد" />
      <Field label="هزینه برنامه‌ای" type="number" />
      <Field label="هزینه واقعی" type="number" />
      <Field label="خلاصه مدیریتی وضعیت" type="textarea" />
      <Field label="برنامه دوره بعد" type="textarea" />
    </div>
  );
  if (tab === "delays") return (
    <div className="project-form-grid">
      <Field label="عنوان تأخیر" required />
      <Field label="دسته علت" type="select" options={["تأمین منابع", "فنی", "تصمیم‌گیری", "پیمانکار", "تغییر محدوده", "خارج از کنترل"]} />
      <Field label="تاریخ شروع تأخیر" type="date" />
      <Field label="تعداد روز تأخیر" type="number" />
      <Field label="مسئول پیگیری" type="select" options={["مدیر پروژه", "مسئول فنی", "پیمانکار"]} />
      <Field label="اثر بر برنامه" type="select" options={["بدون اثر", "کم", "متوسط", "زیاد", "بحرانی"]} />
      <Field label="شرح علت ریشه‌ای" type="textarea" />
      <Field label="اقدام اصلاحی و جبرانی" type="textarea" />
    </div>
  );
  if (tab === "documents") return (
    <div className="project-form-grid">
      <Field label="عنوان سند" required />
      <Field label="نوع سند" type="select" options={["منشور", "صورت‌جلسه", "گزارش پیشرفت", "نقشه", "قرارداد", "مستند فنی", "سایر"]} />
      <Field label="نسخه" placeholder="مثال: ۱.۰" />
      <Field label="تاریخ سند" type="date" />
      <Field label="سطح محرمانگی" type="select" options={["عادی", "داخلی", "محرمانه", "خیلی محرمانه"]} />
      <Field label="فایل سند" placeholder="انتخاب فایل..." />
      <Field label="شرح و یادداشت سند" type="textarea" />
    </div>
  );
  if (tab === "actions") return (
    <div className="project-form-grid">
      <Field label="عنوان اقدام" required />
      <Field label="مسئول اقدام" type="select" options={["مدیر پروژه", "عضو تیم", "پیمانکار", "واحد مالک"]} />
      <Field label="تاریخ شروع" type="date" />
      <Field label="تاریخ پایان" type="date" />
      <Field label="وضعیت" type="select" options={["برنامه‌ریزی", "در حال انجام", "تکمیل شده", "لغو شده"]} />
      <Field label="اولویت" type="select" options={["فوری", "بالا", "متوسط", "پایین"]} />
      <Field label="شرح اقدام و خروجی مورد انتظار" type="textarea" />
      <Field label="معیار پذیرش" type="textarea" />
    </div>
  );
  if (tab === "sprints") return (
    <div className="project-form-grid">
      <Field label="نام اسپرینت" required placeholder="مثال: اسپرینت ۱" />
      <Field label="وضعیت اسپرینت" type="select" options={["برنامه‌ریزی", "فعال", "بازبینی", "پایان‌یافته"]} />
      <Field label="تاریخ شروع" type="date" />
      <Field label="تاریخ پایان" type="date" />
      <Field label="ظرفیت تیم" type="number" placeholder="Story Point" />
      <Field label="سرعت هدف" type="number" placeholder="Velocity" />
      <Field label="هدف اسپرینت" type="textarea" />
      <Field label="اقلام بک‌لاگ و معیار پذیرش" type="textarea" />
    </div>
  );
  return (
    <div className="project-form-grid">
      <Field label="گردش تأیید" type="select" options={["تأیید مدیر و حامی", "تأیید مدیر ارشد", "بدون گردش تأیید"]} />
      <Field label="سطح دسترسی" type="select" options={["عمومی سازمان", "واحد مالک", "اعضای پروژه", "محرمانه"]} />
      <Field label="تناوب اعلان پیشرفت" type="select" options={["روزانه", "هفتگی", "ماهانه", "غیرفعال"]} />
      <Field label="بایگانی خودکار" type="select" options={["پس از تکمیل", "پس از تأیید نهایی", "غیرفعال"]} />
      <Field label="قواعد اعلان و یادآوری" type="textarea" />
      <Field label="یادداشت تنظیمات" type="textarea" />
    </div>
  );
}

function ProjectCreator({ kind }: { kind: "waterfall" | "agile" }) {
  const agile = kind === "agile";
  const tabs = agile ? agileTabs : waterfallTabs;
  const [activeTab, setActiveTab] = useState("charter");
  const [notice, setNotice] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("اطلاعات پروژه با موفقیت در نسخه نمایشی ذخیره شد.");
  }

  return (
    <section className="project-creator">
      <header className="creator-heading">
        <div>
          <h1>ایجاد پروژه {agile ? "چابک" : "آبشاری"}</h1>
          <p>{agile ? "تعریف منشور، تیم، ریسک‌ها، بک‌لاگ و اسپرینت‌های پروژه" : "تعریف منشور، ساختار شکست کار، زمان‌بندی و کنترل پروژه"}</p>
        </div>
        <span className={agile ? "agile" : "waterfall"}>{agile ? <RefreshCcw size={19} /> : <GitBranch size={19} />}{agile ? "Agile" : "Waterfall"}</span>
      </header>

      <nav className="creator-tabs" aria-label="مراحل تعریف پروژه">
        {tabs.map(([id, label, Icon]) => (
          <button key={id} className={activeTab === id ? "active" : ""} onClick={() => setActiveTab(id)} type="button">
            <Icon size={16} /><span>{label}</span>{activeTab === id && <i />}
          </button>
        ))}
      </nav>

      <form className="creator-form" onSubmit={submit}>
        <div className="form-section-title">
          <div><strong>{tabs.find(([id]) => id === activeTab)?.[1]}</strong><small>اطلاعات این بخش را با دقت تکمیل کنید.</small></div>
          <em>فیلدهای ستاره‌دار الزامی هستند</em>
        </div>
        <TabFields tab={activeTab} agile={agile} />
        {notice && <div className="form-notice"><CheckCircle2 size={17} />{notice}<button type="button" onClick={() => setNotice("")}><X size={15} /></button></div>}
        <footer className="creator-actions">
          <button type="button" className="draft-button" onClick={() => setNotice("پیش‌نویس پروژه ذخیره شد.")}><Save size={17} /> ذخیره پیش‌نویس</button>
          <button type="submit" className="submit-button"><Send size={17} /> ذخیره و ارسال برای تأیید</button>
        </footer>
      </form>
    </section>
  );
}

function ProjectEditor({ project, onUpdate }: { project: ProjectItem; onUpdate: (project: ProjectItem) => void }) {
  const agile = project.kind === "چابک";
  const tabs = agile ? agileTabs : waterfallTabs;
  const [activeTab, setActiveTab] = useState("charter");
  const [notice, setNotice] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onUpdate(project);
    setNotice("اطلاعات این بخش از پروژه با موفقیت بروزرسانی شد.");
  }

  return (
    <section className="project-editor">
      <header className="creator-heading project-editor-heading">
        <div>
          <small>ویرایش پروژه {project.kind}</small>
          <h1>{project.name}</h1>
          <p>مدیر پروژه: {project.manager} · واحد مالک: {project.owner}</p>
        </div>
        <span className={agile ? "agile" : "waterfall"}>{agile ? <RefreshCcw size={18} /> : <GitBranch size={18} />}{project.kind}</span>
      </header>

      <nav className="creator-tabs project-editor-tabs" aria-label="بخش‌های ویرایش پروژه">
        {tabs.map(([id, label, Icon]) => (
          <button key={id} className={activeTab === id ? "active" : ""} onClick={() => { setActiveTab(id); setNotice(""); }} type="button">
            <Icon size={16} /><span>{label}</span>{activeTab === id && <i />}
          </button>
        ))}
      </nav>

      {activeTab === "schedule" ? (
        <div className="editor-wbs-shell"><WbsWorkspace projectName={project.name} /></div>
      ) : (
        <form className="creator-form project-editor-form" onSubmit={submit}>
          <div className="form-section-title">
            <div><strong>{tabs.find(([id]) => id === activeTab)?.[1]}</strong><small>اطلاعات پروژه انتخاب‌شده را مشاهده و بروزرسانی کنید.</small></div>
            <em>پروژه: {project.name}</em>
          </div>
          {activeTab === "charter" ? <CharterFields agile={agile} project={project} /> : <TabFields tab={activeTab} agile={agile} />}
          {notice && <div className="form-notice"><CheckCircle2 size={17} />{notice}<button type="button" onClick={() => setNotice("")}><X size={15} /></button></div>}
          <footer className="creator-actions"><button type="button" className="draft-button" onClick={() => setNotice("تغییرات این بخش به‌صورت پیش‌نویس نگهداری شد.")}><Save size={17} /> ذخیره پیش‌نویس</button><button type="submit" className="submit-button"><Save size={17} /> بروزرسانی پروژه</button></footer>
        </form>
      )}
    </section>
  );
}

const dashboardTabs = [
  ["charter", "خلاصه منشور پروژه", FileText],
  ["activities", "فعالیت‌های سطح بالا", Layers3],
  ["team", "تیم پروژه", Users],
  ["risks", "ریسک‌های پروژه", ShieldAlert],
  ["actions", "اقدامات مرتبط", ListChecks],
] as const;

function ProjectDashboard({ project }: { project: ProjectItem }) {
  const [activeTab, setActiveTab] = useState<(typeof dashboardTabs)[number][0]>("charter");
  const planned = Math.min(100, 74 + project.id * 2);
  const actual = Math.min(96, 41 + project.id * 4);
  const performance = Math.round((actual / planned) * 100);
  const activities = [
    ["۱", "مطالعات اولیه و تحلیل نیازمندی‌ها", project.start, "۱۴۰۵/۰۳/۱۵", "۲۰", "۱۰۰٪", "۱۰۰٪"],
    ["۲", "طراحی معماری و برنامه اجرایی", "۱۴۰۵/۰۳/۱۶", "۱۴۰۵/۰۵/۳۰", "۲۵", "۹۵٪", "۸۲٪"],
    ["۳", "پیاده‌سازی و یکپارچه‌سازی", "۱۴۰۵/۰۶/۰۱", "۱۴۰۵/۰۹/۳۰", "۴۰", "۷۰٪", "۵۸٪"],
    ["۴", "آزمون، آموزش و تحویل نهایی", "۱۴۰۵/۱۰/۰۱", project.end, "۱۵", "۲۰٪", "۱۰٪"],
  ];
  const team = [
    ["۱", project.manager, "مدیر پروژه", project.owner],
    ["۲", "مریم احمدی", "کارشناس تحلیل و برنامه‌ریزی", "فناوری اطلاعات"],
    ["۳", "علی رضایی", "مسئول فنی پروژه", "فناوری اطلاعات"],
    ["۴", "سارا محمدی", "نماینده کسب‌وکار", project.owner],
  ];
  const risks = [
    ["۱", "تأخیر در تأمین زیرساخت و تجهیزات کلیدی پروژه", "زیاد", "زیاد", "مدیر پروژه", "تدوین برنامه تأمین جایگزین و کنترل هفتگی زمان تحویل"],
    ["۲", "تغییر الزامات ذی‌نفعان در حین اجرا", "متوسط", "زیاد", "حامی پروژه", "استقرار فرآیند کنترل تغییرات و تصویب دامنه"],
    ["۳", "کمبود منابع متخصص در دوره اوج فعالیت", "متوسط", "متوسط", "مدیر منابع", "برنامه‌ریزی ظرفیت و استفاده از نیروی جایگزین"],
    ["۴", "عدم یکپارچگی کامل با سامانه‌های موجود", "کم", "زیاد", "مسئول فنی", "اجرای آزمون یکپارچگی مرحله‌ای و محیط پایلوت"],
  ];
  const actions = [
    ["۱", "بازبینی و تأیید نهایی مستندات فاز جاری", "مریم احمدی", "در حال انجام", "۱۴۰۵/۰۵/۲۰"],
    ["۲", "برگزاری جلسه هماهنگی با واحدهای ذی‌نفع", project.manager, "برنامه‌ریزی", "۱۴۰۵/۰۵/۲۵"],
    ["۳", "رفع موارد آزمون امنیت و تحویل نسخه پایلوت", "علی رضایی", "در حال انجام", "۱۴۰۵/۰۶/۱۰"],
  ];

  return (
    <section className="project-dashboard-view">
      <header className="project-dashboard-heading">
        <div><small>داشبورد پروژه</small><h1>{project.name}</h1><p>نمای یکپارچه اطلاعات کلیدی و وضعیت اجرایی پروژه</p></div>
        <span className={project.kind === "چابک" ? "agile" : "waterfall"}><LayoutDashboard size={18} /> {project.kind}</span>
      </header>

      <nav className="project-dashboard-tabs" aria-label="بخش‌های داشبورد پروژه">
        {dashboardTabs.map(([id, label, Icon]) => <button type="button" key={id} className={activeTab === id ? "active" : ""} onClick={() => setActiveTab(id)}><Icon size={17} /><span>{label}</span></button>)}
      </nav>

      <div className="project-dashboard-content">
        {activeTab === "charter" && <div className="dashboard-charter-tab">
          <div className="charter-summary-grid">
            <article><small>نام پروژه</small><strong>{project.name}</strong></article><article><small>نوع پروژه</small><strong>پروژه {project.kind}</strong></article><article><small>مدیر پروژه</small><strong>{project.manager}</strong></article><article><small>واحد مالک</small><strong>{project.owner}</strong></article>
            <article><small>تاریخ شروع</small><strong>{project.start}</strong></article><article><small>تاریخ پایان</small><strong>{project.end}</strong></article><article><small>وضعیت</small><strong className="status-value">{project.status}</strong></article><article><small>هزینه مصوب</small><strong>{fa(12500000000 + project.id * 850000000)} ریال</strong></article>
          </div>
          <div className="dashboard-gauges">
            <article><div className="dashboard-gauge" style={{ "--value": planned } as CSSProperties}><span>{fa(planned)}٪</span></div><strong>پیشرفت برنامه‌ای</strong></article>
            <article><div className="dashboard-gauge actual" style={{ "--value": actual } as CSSProperties}><span>{fa(actual)}٪</span></div><strong>پیشرفت واقعی</strong></article>
            <article><div className="dashboard-gauge performance" style={{ "--value": performance } as CSSProperties}><span>{fa(performance)}٪</span></div><strong>درصد عملکرد</strong></article>
          </div>
        </div>}

        {activeTab === "activities" && <DashboardTable title="فعالیت‌های سطح بالا" columns={["ردیف", "نام فعالیت", "تاریخ شروع", "تاریخ پایان", "وزن", "پیشرفت برنامه‌ای", "پیشرفت واقعی"]} rows={activities} />}
        {activeTab === "team" && <DashboardTable title="اعضای تیم پروژه" columns={["ردیف", "نام و نام خانوادگی", "نقش در پروژه", "واحد سازمانی"]} rows={team} />}
        {activeTab === "risks" && <DashboardTable title="ریسک‌های پروژه" columns={["ردیف", "عنوان ریسک", "احتمال", "اثر", "مسئول", "برنامه پاسخ"]} rows={risks} risk />}
        {activeTab === "actions" && <DashboardTable title="اقدامات مرتبط" columns={["ردیف", "عنوان اقدام", "فرد مسئول", "وضعیت", "تاریخ پایان"]} rows={actions} />}
      </div>
    </section>
  );
}

function DashboardTable({ title, columns, rows, risk = false }: { title: string; columns: string[]; rows: string[][]; risk?: boolean }) {
  return (
    <section className="dashboard-data-section"><header><div><small>اطلاعات پروژه</small><h2>{title}</h2></div><span>{fa(rows.length)} مورد</span></header><div className="dashboard-table-wrap"><table><thead><tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{rows.map((row, rowIndex) => <tr key={`${title}-${rowIndex}`}>{row.map((cell, cellIndex) => <td key={`${rowIndex}-${cellIndex}`}>{risk && (cellIndex === 2 || cellIndex === 3) ? <span className={`risk-level ${cell === "زیاد" ? "high" : cell === "متوسط" ? "medium" : "low"}`}>{cell}</span> : cellIndex === 3 && title === "اقدامات مرتبط" ? <span className="action-state">{cell}</span> : cell}</td>)}</tr>)}</tbody></table></div></section>
  );
}

export default function ProjectsWorkspace({ collapsed }: { collapsed: boolean; section?: ProjectSection }) {
  const [mode, setMode] = useState<WorkspaceMode>("portfolio");
  const [records, setRecords] = useState(initialProjects);
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);
  const [dashboardProject, setDashboardProject] = useState<ProjectItem | null>(null);
  const [projectAction, setProjectAction] = useState<ProjectAction>(null);
  const [showFilters, setShowFilters] = useState(true);
  const [showGrouping, setShowGrouping] = useState(false);
  const [search, setSearch] = useState("");
  const [kind, setKind] = useState("همه");
  const [owner, setOwner] = useState("همه");
  const [status, setStatus] = useState("همه");
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(["فناوری اطلاعات", "ساختمان و املاک", "امور اجرایی", "پشتیبانی", "مدیریت ریسک"]));

  const filtered = useMemo(() => records.filter((project) =>
    project.name.includes(search) &&
    (kind === "همه" || project.kind === kind) &&
    (owner === "همه" || project.owner === owner) &&
    (status === "همه" || project.status === status)
  ), [records, search, kind, owner, status]);

  const groups = useMemo(() => Object.entries(filtered.reduce<Record<string, ProjectItem[]>>((result, project) => {
    (result[project.owner] ??= []).push(project);
    return result;
  }, {})), [filtered]);

  function toggleGroup(group: string) {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(group)) next.delete(group); else next.add(group);
      return next;
    });
  }

  function deleteProject(id: number) {
    setRecords((current) => current.filter((item) => item.id !== id));
    setProjectAction(null);
  }

  return (
    <main className={`projects-workspace ${collapsed ? "sidebar-collapsed" : ""}`}>
      <header className="projects-heading">
        <div><span>مدیریت یکپارچه</span><h1>سبد پروژه‌ها و اقدامات</h1><p>مشاهده، فیلتر، گروه‌بندی و راهبری پروژه‌های سازمان</p></div>
        <div className="create-project-actions">
          <button className="waterfall" onClick={() => setMode("waterfall")}><FolderPlus size={18} /><span><strong>ایجاد پروژه آبشاری</strong><small>برنامه‌ریزی کلاسیک و WBS</small></span></button>
          <button className="agile" onClick={() => setMode("agile")}><RefreshCcw size={18} /><span><strong>ایجاد پروژه چابک</strong><small>اسپرینت، بک‌لاگ و تیم چابک</small></span></button>
        </div>
      </header>

      <section className="portfolio-toolbar">
        <div>
          <button className={showFilters ? "active" : ""} onClick={() => setShowFilters((value) => !value)}><Filter size={16} /> فیلترها</button>
          <button className={showGrouping ? "active" : ""} onClick={() => setShowGrouping((value) => !value)}><Layers3 size={16} /> گروه‌بندی</button>
        </div>
        <div>
          <button title="باز کردن همه" onClick={() => setExpanded(new Set(groups.map(([group]) => group)))}><ChevronsDownUp size={17} /></button>
          <button title="بستن همه" onClick={() => setExpanded(new Set())}><ChevronsUpDown size={17} /></button>
          <span>{fa(filtered.length)} مورد</span>
        </div>
      </section>

      {showFilters && (
        <section className="portfolio-filters">
          <label className="portfolio-search"><Search size={17} /><input placeholder="فیلتر بر اساس نام پروژه..." value={search} onChange={(event) => setSearch(event.target.value)} /></label>
          <label><span>نوع پروژه / اقدام</span><select value={kind} onChange={(event) => setKind(event.target.value)}><option>همه</option><option>آبشاری</option><option>چابک</option><option>اقدام</option></select></label>
          <label><span>واحد مالک</span><select value={owner} onChange={(event) => setOwner(event.target.value)}><option>همه</option>{Array.from(new Set(records.map((project) => project.owner))).map((item) => <option key={item}>{item}</option>)}</select></label>
          <label><span>وضعیت</span><select value={status} onChange={(event) => setStatus(event.target.value)}><option>همه</option><option>برنامه‌ریزی</option><option>در حال انجام</option><option>متوقف شده</option><option>تکمیل شده</option></select></label>
        </section>
      )}

      {showGrouping && (
        <section className="grouping-panel">
          <label><span>گروه‌بندی سطح ۱</span><select defaultValue="واحد مالک"><option>واحد مالک</option><option>وضعیت</option><option>نوع پروژه / اقدام</option><option>مدیر / مسئول</option><option>بدون گروه‌بندی</option></select></label>
          <label><span>گروه‌بندی سطح ۲</span><select defaultValue="وضعیت"><option>وضعیت</option><option>واحد مالک</option><option>نوع پروژه / اقدام</option><option>مدیر / مسئول</option><option>بدون گروه‌بندی</option></select></label>
        </section>
      )}

      <section className="project-groups">
        {groups.map(([group, items]) => (
          <article className="project-group" key={group}>
            <button className="group-heading" onClick={() => toggleGroup(group)}>
              <span><FolderKanban size={18} /><strong>واحد مالک: {group}</strong><em>{fa(items.length)}</em></span>
              {expanded.has(group) ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            {expanded.has(group) && (
              <div className="project-table-wrap">
                <table className="portfolio-table">
                  <thead><tr><th>عنوان</th><th>مدیر</th><th>تاریخ شروع</th><th>تاریخ پایان</th><th>وضعیت</th><th>تأیید</th><th>عملیات</th></tr></thead>
                  <tbody>
                    {items.map((project) => (
                      <tr key={project.id}>
                        <td><strong>{project.name}</strong><small className={project.kind === "چابک" ? "agile" : project.kind === "آبشاری" ? "waterfall" : "action"}>{project.kind}</small></td>
                        <td>{project.manager}</td><td>{project.start}</td><td>{project.end}</td>
                        <td><span className={`project-status ${project.status === "در حال انجام" ? "running" : project.status === "تکمیل شده" ? "done" : project.status === "متوقف شده" ? "stopped" : "planning"}`}>{project.status}</span></td>
                        <td><span className={project.approved ? "approval approved" : "approval pending"}>{project.approved ? "تأیید شده" : "در انتظار"}</span></td>
                        <td><div className="project-row-actions"><button title="ویرایش" aria-label={`ویرایش ${project.name}`} onClick={() => { setEditingProject(project); setMode("edit"); }}><Pencil size={15} /></button><button title="تاریخچه" aria-label={`تاریخچه ${project.name}`} onClick={() => setProjectAction({ type: "history", project })}><History size={15} /></button><button title="داشبورد" aria-label={`داشبورد ${project.name}`} onClick={() => { setDashboardProject(project); setMode("dashboard"); }}><LayoutDashboard size={15} /></button><button title="حذف" aria-label={`حذف ${project.name}`} className="danger" onClick={() => setProjectAction({ type: "delete", project })}><Trash2 size={15} /></button></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </article>
        ))}
        {groups.length === 0 && <div className="portfolio-empty"><Search size={25} /><strong>موردی پیدا نشد</strong><span>فیلترهای انتخاب‌شده را تغییر دهید.</span></div>}
      </section>
      {projectAction && <ProjectActionModal action={projectAction} onClose={() => setProjectAction(null)} onDelete={deleteProject} />}
      {(mode === "waterfall" || mode === "agile") && <ProjectWorkspaceModal title={`ایجاد پروژه ${mode === "agile" ? "چابک" : "آبشاری"}`} onClose={() => setMode("portfolio")}><ProjectCreator kind={mode} /></ProjectWorkspaceModal>}
      {mode === "edit" && editingProject && <ProjectWorkspaceModal title={`ویرایش ${editingProject.name}`} onClose={() => { setEditingProject(null); setMode("portfolio"); }}><ProjectEditor project={editingProject} onUpdate={(project) => setRecords((current) => current.map((item) => item.id === project.id ? project : item))} /></ProjectWorkspaceModal>}
      {mode === "dashboard" && dashboardProject && <ProjectWorkspaceModal title={`داشبورد ${dashboardProject.name}`} onClose={() => { setDashboardProject(null); setMode("portfolio"); }}><ProjectDashboard project={dashboardProject} /></ProjectWorkspaceModal>}
    </main>
  );
}
