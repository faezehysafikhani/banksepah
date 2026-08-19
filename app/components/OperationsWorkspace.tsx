"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  BookOpen,
  CalendarDays,
  Check,
  CheckCheck,
  ChevronDown,
  CircleAlert,
  Clock3,
  Download,
  Eye,
  FileText,
  Filter,
  FolderKanban,
  Inbox,
  Library,
  ListChecks,
  ListTodo,
  MessageSquareText,
  Paperclip,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Search,
  Send,
  Sparkles,
  Star,
  Tag,
  Trash2,
  Upload,
  UserRound,
  X,
} from "lucide-react";

type Section = "تعریف اقدام" | "مرکز وظایف" | "مرکز تأییدات" | "مدیریت دانش";
type ModalState =
  | { type: "action"; id?: number }
  | { type: "task"; id: number }
  | { type: "approval"; id: number }
  | { type: "knowledge"; id: number }
  | { type: "new-knowledge" }
  | null;

type ActionItem = {
  id: number;
  code: string;
  title: string;
  project: string;
  owner: string;
  due: string;
  priority: "بالا" | "متوسط" | "عادی";
  status: "پیش‌نویس" | "در انتظار تأیید" | "در حال انجام" | "تکمیل‌شده";
  progress: number;
  description: string;
};

type TaskItem = {
  id: number;
  title: string;
  project: string;
  creator: string;
  due: string;
  priority: "فوری" | "بالا" | "عادی";
  status: "جدید" | "در حال انجام" | "تکمیل‌شده";
  description: string;
};

type ApprovalItem = {
  id: number;
  subject: string;
  kind: string;
  requester: string;
  submitted: string;
  deadline: string;
  status: "در انتظار" | "تأییدشده" | "ردشده" | "عودت‌شده";
  description: string;
};

type KnowledgeItem = {
  id: number;
  title: string;
  category: string;
  author: string;
  updated: string;
  format: "مقاله" | "درس‌آموخته" | "رویه" | "فرم";
  views: number;
  favorite: boolean;
  summary: string;
  tags: string[];
};

const initialActions: ActionItem[] = [
  { id: 1, code: "ACT-1405-024", title: "تکمیل مستند معماری سرویس‌ها", project: "توسعه سامانه مدیریت پروژه", owner: "علی رضایی", due: "۱۴۰۵/۰۶/۲۰", priority: "بالا", status: "در حال انجام", progress: 65, description: "تهیه نسخه نهایی معماری سرویس‌ها و اخذ تأیید واحد فناوری اطلاعات." },
  { id: 2, code: "ACT-1405-023", title: "بازنگری برنامه مهاجرت داده", project: "نوسازی مرکز داده", owner: "مریم احمدی", due: "۱۴۰۵/۰۶/۲۵", priority: "متوسط", status: "در انتظار تأیید", progress: 35, description: "بازبینی گام‌های مهاجرت و هماهنگی با تیم زیرساخت." },
  { id: 3, code: "ACT-1405-019", title: "نهایی‌سازی گزارش تجربه مشتری", project: "بازطراحی تجربه مشتریان", owner: "سارا محمدی", due: "۱۴۰۵/۰۶/۱۴", priority: "عادی", status: "تکمیل‌شده", progress: 100, description: "تجمیع یافته‌های تحقیق و ارائه پیشنهادهای اجرایی." },
  { id: 4, code: "ACT-1405-018", title: "برنامه کنترل کیفیت پیمانکار", project: "ارتقای زیرساخت مراکز داده", owner: "امیر کاظمی", due: "۱۴۰۵/۰۷/۰۲", priority: "بالا", status: "پیش‌نویس", progress: 10, description: "تعریف نقاط کنترل و شاخص‌های پذیرش تحویل پیمانکار." },
];

const initialTasks: TaskItem[] = [
  { id: 1, title: "بررسی و تأیید منشور پروژه", project: "توسعه سامانه مدیریت پروژه", creator: "مدیر سامانه", due: "امروز، ۱۶:۳۰", priority: "فوری", status: "جدید", description: "منشور پروژه را از نظر محدوده، ذی‌نفعان و شاخص‌های موفقیت بررسی کنید." },
  { id: 2, title: "بارگذاری صورت‌جلسه کمیته راهبری", project: "نوسازی مرکز داده", creator: "علی رضایی", due: "۱۴۰۵/۰۶/۱۸", priority: "بالا", status: "در حال انجام", description: "نسخه امضاشده صورت‌جلسه و پیوست‌های مصوب در سامانه ثبت شود." },
  { id: 3, title: "به‌روزرسانی درصد پیشرفت فعالیت‌ها", project: "بانکداری همراه نسل جدید", creator: "مریم احمدی", due: "۱۴۰۵/۰۶/۲۰", priority: "عادی", status: "در حال انجام", description: "پیشرفت واقعی فعالیت‌های سطح بالا با مستندات مرتبط به‌روز شود." },
  { id: 4, title: "ثبت پاسخ ریسک امنیت اطلاعات", project: "هوشمندسازی تجربه مشتریان", creator: "کمیته ریسک", due: "۱۴۰۵/۰۶/۱۲", priority: "بالا", status: "تکمیل‌شده", description: "برنامه پاسخ و مالک ریسک ثبت و برای تأیید ارسال شد." },
];

const initialApprovals: ApprovalItem[] = [
  { id: 1, subject: "تأیید منشور پروژه نوسازی مرکز داده", kind: "منشور پروژه", requester: "مریم احمدی", submitted: "۱۴۰۵/۰۶/۱۶ ۱۰:۳۵", deadline: "۲ روز", status: "در انتظار", description: "نسخه دوم منشور پس از اعمال نظرات کمیته راهبری برای تأیید ارسال شده است." },
  { id: 2, subject: "تأیید تغییر برنامه زمان‌بندی فاز دوم", kind: "درخواست تغییر", requester: "علی رضایی", submitted: "۱۴۰۵/۰۶/۱۵ ۱۴:۱۰", deadline: "امروز", status: "در انتظار", description: "تغییر تاریخ پایان فاز دوم به دلیل تأخیر در تحویل زیرساخت پیشنهادی است." },
  { id: 3, subject: "تأیید گزارش پیشرفت مردادماه", kind: "گزارش دوره‌ای", requester: "سارا محمدی", submitted: "۱۴۰۵/۰۶/۱۰ ۰۹:۲۰", deadline: "انجام‌شده", status: "تأییدشده", description: "گزارش تجمیعی وضعیت پروژه، هزینه، ریسک و اقدامات اصلاحی." },
  { id: 4, subject: "درخواست خاتمه اقدام ACT-1405-011", kind: "خاتمه اقدام", requester: "امیر کاظمی", submitted: "۱۴۰۵/۰۶/۰۸ ۱۱:۴۵", deadline: "انجام‌شده", status: "ردشده", description: "شواهد کافی برای احراز معیار پذیرش اقدام پیوست نشده بود." },
];

const initialKnowledge: KnowledgeItem[] = [
  { id: 1, title: "راهنمای تدوین منشور پروژه‌های راهبردی", category: "مدیریت پروژه", author: "دفتر مدیریت پروژه", updated: "۱۴۰۵/۰۶/۱۶", format: "رویه", views: 328, favorite: true, summary: "چارچوب استاندارد تعریف مسئله، اهداف، محدوده، ذی‌نفعان و شاخص‌های موفقیت منشور پروژه.", tags: ["منشور", "استاندارد", "PMO"] },
  { id: 2, title: "درس‌آموخته‌های مهاجرت سامانه‌های بانکی", category: "فناوری اطلاعات", author: "مریم احمدی", updated: "۱۴۰۵/۰۶/۱۲", format: "درس‌آموخته", views: 214, favorite: false, summary: "مهم‌ترین چالش‌ها، اقدامات پیشگیرانه و پیشنهادهای حاصل از مهاجرت سامانه‌های عملیاتی.", tags: ["مهاجرت", "زیرساخت", "ریسک"] },
  { id: 3, title: "چک‌لیست کنترل تغییرات پروژه", category: "فرآیندها و فرم‌ها", author: "علی رضایی", updated: "۱۴۰۵/۰۶/۰۹", format: "فرم", views: 176, favorite: true, summary: "چک‌لیست ارزیابی اثر تغییر بر زمان، هزینه، محدوده، کیفیت و ریسک پروژه.", tags: ["کنترل تغییر", "فرم", "CCB"] },
  { id: 4, title: "الگوی مدیریت ریسک پیمانکاران", category: "مدیریت ریسک", author: "کمیته ریسک", updated: "۱۴۰۵/۰۵/۲۹", format: "مقاله", views: 149, favorite: false, summary: "روش شناسایی، امتیازدهی و پایش ریسک‌های قراردادی و عملکردی پیمانکاران.", tags: ["ریسک", "پیمانکار", "کنترل"] },
];

const sectionMeta = {
  "تعریف اقدام": { eyebrow: "مدیریت اقدامات", title: "تعریف و پیگیری اقدام", description: "ثبت اقدام، تعیین مسئول، زمان‌بندی و پایش وضعیت اجرا", icon: ListChecks },
  "مرکز وظایف": { eyebrow: "کارهای روزانه", title: "مرکز وظایف", description: "مشاهده، اولویت‌بندی و انجام وظایف ارجاع‌شده", icon: ListTodo },
  "مرکز تأییدات": { eyebrow: "گردش کار", title: "مرکز تأییدات", description: "بررسی درخواست‌ها و ثبت تصمیم در گردش‌های تأیید", icon: Inbox },
  "مدیریت دانش": { eyebrow: "دانش سازمانی", title: "مدیریت دانش", description: "ثبت، طبقه‌بندی و بازیابی دانش و درس‌آموخته‌های پروژه", icon: Library },
} satisfies Record<Section, { eyebrow: string; title: string; description: string; icon: typeof ListChecks }>;

function EmptyState({ text }: { text: string }) {
  return <div className="ops-empty"><Search size={25} /><strong>نتیجه‌ای پیدا نشد</strong><span>{text}</span></div>;
}

function Modal({ title, subtitle, onClose, children, footer }: { title: string; subtitle?: string; onClose: () => void; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="ops-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="ops-modal" role="dialog" aria-modal="true" aria-label={title}>
        <header>
          <div><small>{subtitle}</small><h2>{title}</h2></div>
          <button type="button" onClick={onClose} aria-label="بستن"><X size={19} /></button>
        </header>
        <div className="ops-modal-body">{children}</div>
        {footer && <footer>{footer}</footer>}
      </section>
    </div>
  );
}

function StatusBadge({ value }: { value: string }) {
  const tone = value.includes("تکمیل") || value.includes("تأییدشده") ? "success" : value.includes("رد") || value.includes("فوری") ? "danger" : value.includes("انتظار") || value.includes("عودت") ? "warning" : "info";
  return <span className={`ops-badge ${tone}`}>{value}</span>;
}

export default function OperationsWorkspace({ collapsed, section }: { collapsed: boolean; section: Section }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("همه");
  const [modal, setModal] = useState<ModalState>(null);
  const [toast, setToast] = useState("");
  const [actions, setActions] = useState(initialActions);
  const [tasks, setTasks] = useState(initialTasks);
  const [approvals, setApprovals] = useState(initialApprovals);
  const [knowledge, setKnowledge] = useState(initialKnowledge);
  const [draftAction, setDraftAction] = useState<Partial<ActionItem>>({});
  const [knowledgeView, setKnowledgeView] = useState<"همه" | "محبوب‌ها">("همه");
  const meta = sectionMeta[section];
  const HeaderIcon = meta.icon;

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  }

  function openAction(item?: ActionItem) {
    setDraftAction(item ?? { title: "", project: "توسعه سامانه مدیریت پروژه", owner: "مدیر سامانه", due: "۱۴۰۵/۰۷/۰۱", priority: "عادی", status: "پیش‌نویس", progress: 0, description: "" });
    setModal({ type: "action", id: item?.id });
  }

  function saveAction(status: ActionItem["status"]) {
    if (!draftAction.title?.trim()) return notify("عنوان اقدام را وارد کنید.");
    const id = modal?.type === "action" ? modal.id : undefined;
    const item: ActionItem = {
      id: id ?? Math.max(0, ...actions.map((action) => action.id)) + 1,
      code: id ? actions.find((action) => action.id === id)?.code ?? "" : `ACT-1405-${String(actions.length + 25).padStart(3, "0")}`,
      title: draftAction.title,
      project: draftAction.project ?? "بدون پروژه",
      owner: draftAction.owner ?? "مدیر سامانه",
      due: draftAction.due ?? "۱۴۰۵/۰۷/۰۱",
      priority: draftAction.priority ?? "عادی",
      status,
      progress: draftAction.progress ?? 0,
      description: draftAction.description ?? "",
    };
    setActions((current) => id ? current.map((action) => action.id === id ? item : action) : [item, ...current]);
    setModal(null);
    notify(status === "پیش‌نویس" ? "پیش‌نویس اقدام ذخیره شد." : "اقدام برای تأیید ارسال شد.");
  }

  const filteredActions = useMemo(() => actions.filter((item) => (filter === "همه" || item.status === filter) && `${item.title} ${item.code} ${item.project} ${item.owner}`.includes(search)), [actions, filter, search]);
  const filteredTasks = useMemo(() => tasks.filter((item) => (filter === "همه" || item.status === filter) && `${item.title} ${item.project} ${item.creator}`.includes(search)), [tasks, filter, search]);
  const filteredApprovals = useMemo(() => approvals.filter((item) => (filter === "همه" || item.status === filter) && `${item.subject} ${item.kind} ${item.requester}`.includes(search)), [approvals, filter, search]);
  const filteredKnowledge = useMemo(() => knowledge.filter((item) => (filter === "همه" || item.category === filter) && (knowledgeView === "همه" || item.favorite) && `${item.title} ${item.category} ${item.author} ${item.tags.join(" ")}`.includes(search)), [knowledge, filter, knowledgeView, search]);

  function renderActionCenter() {
    return <>
      <div className="ops-summary-grid">
        <article><span className="cyan"><ListChecks size={20} /></span><small>همه اقدامات</small><strong>{actions.length}</strong><em>ثبت‌شده در سامانه</em></article>
        <article><span className="orange"><Clock3 size={20} /></span><small>در انتظار تأیید</small><strong>{actions.filter((item) => item.status === "در انتظار تأیید").length}</strong><em>در گردش بررسی</em></article>
        <article><span className="blue"><RotateCcw size={20} /></span><small>در حال انجام</small><strong>{actions.filter((item) => item.status === "در حال انجام").length}</strong><em>نیازمند پیگیری</em></article>
        <article><span className="green"><CheckCheck size={20} /></span><small>تکمیل‌شده</small><strong>{actions.filter((item) => item.status === "تکمیل‌شده").length}</strong><em>خاتمه‌یافته</em></article>
      </div>
      <div className="ops-panel">
        <div className="ops-tabs">
          {["همه", "پیش‌نویس", "در انتظار تأیید", "در حال انجام", "تکمیل‌شده"].map((item) => <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}</button>)}
        </div>
        <div className="ops-table-wrap">
          {filteredActions.length ? <table><thead><tr><th>کد / عنوان اقدام</th><th>پروژه مرتبط</th><th>مسئول</th><th>موعد</th><th>اولویت</th><th>پیشرفت</th><th>وضعیت</th><th>عملیات</th></tr></thead><tbody>
            {filteredActions.map((item) => <tr key={item.id}><td><strong>{item.title}</strong><small>{item.code}</small></td><td>{item.project}</td><td><span className="person-cell"><UserRound size={14} />{item.owner}</span></td><td>{item.due}</td><td><StatusBadge value={item.priority} /></td><td><div className="mini-progress"><i style={{ width: `${item.progress}%` }} /><span>{item.progress}٪</span></div></td><td><StatusBadge value={item.status} /></td><td><div className="ops-actions"><button title="مشاهده" onClick={() => { setDraftAction(item); setModal({ type: "action", id: item.id }); }}><Eye size={15} /></button><button title="ویرایش" onClick={() => openAction(item)}><Pencil size={15} /></button><button title="حذف" onClick={() => { setActions((current) => current.filter((action) => action.id !== item.id)); notify("اقدام حذف شد."); }}><Trash2 size={15} /></button></div></td></tr>)}
          </tbody></table> : <EmptyState text="عبارت جست‌وجو یا فیلتر وضعیت را تغییر دهید." />}
        </div>
      </div>
    </>;
  }

  function renderTaskCenter() {
    const newCount = tasks.filter((item) => item.status === "جدید").length;
    return <div className="ops-split-layout">
      <aside className="ops-inbox-nav">
        <strong>نمای وظایف</strong>
        {[{ label: "همه", icon: Inbox, count: tasks.length }, { label: "جدید", icon: CircleAlert, count: newCount }, { label: "در حال انجام", icon: Clock3, count: tasks.filter((item) => item.status === "در حال انجام").length }, { label: "تکمیل‌شده", icon: CheckCheck, count: tasks.filter((item) => item.status === "تکمیل‌شده").length }].map((item) => { const Icon = item.icon; return <button key={item.label} className={filter === item.label ? "active" : ""} onClick={() => setFilter(item.label)}><Icon size={17} /><span>{item.label}</span><b>{item.count}</b></button>; })}
        <div className="task-focus"><Sparkles size={18} /><strong>تمرکز امروز</strong><span>۲ وظیفه با اولویت بالا و یک تأیید در انتظار شماست.</span></div>
      </aside>
      <section className="ops-panel task-list-panel">
        <header className="panel-heading"><div><small>صف کار</small><h2>{filter === "همه" ? "همه وظایف من" : `وظایف ${filter}`}</h2></div><span>{filteredTasks.length} مورد</span></header>
        <div className="task-cards">
          {filteredTasks.length ? filteredTasks.map((item) => <article key={item.id} className={item.status === "جدید" ? "unread" : ""}>
            <button className="task-check" title="تغییر وضعیت" onClick={() => setTasks((current) => current.map((task) => task.id === item.id ? { ...task, status: task.status === "تکمیل‌شده" ? "در حال انجام" : "تکمیل‌شده" } : task))}>{item.status === "تکمیل‌شده" ? <Check size={17} /> : null}</button>
            <div><div><strong>{item.title}</strong><StatusBadge value={item.priority} /></div><p>{item.description}</p><footer><span><FolderKanban size={13} />{item.project}</span><span><UserRound size={13} />ارجاع از {item.creator}</span><span><CalendarDays size={13} />{item.due}</span></footer></div>
            <button className="task-open" onClick={() => setModal({ type: "task", id: item.id })} aria-label="مشاهده وظیفه"><Eye size={17} /></button>
          </article>) : <EmptyState text="در این نمای وظایف موردی وجود ندارد." />}
        </div>
      </section>
    </div>;
  }

  function renderApprovals() {
    return <>
      <div className="approval-overview">
        {[{ label: "در انتظار تصمیم", value: approvals.filter((item) => item.status === "در انتظار").length, tone: "orange", icon: Clock3 }, { label: "تأییدشده", value: approvals.filter((item) => item.status === "تأییدشده").length, tone: "green", icon: CheckCheck }, { label: "رد یا عودت‌شده", value: approvals.filter((item) => ["ردشده", "عودت‌شده"].includes(item.status)).length, tone: "red", icon: RotateCcw }].map((stat) => { const Icon = stat.icon; return <article key={stat.label}><span className={stat.tone}><Icon size={21} /></span><div><strong>{stat.value}</strong><small>{stat.label}</small></div></article>; })}
      </div>
      <div className="ops-panel">
        <div className="ops-tabs">
          {["همه", "در انتظار", "تأییدشده", "ردشده", "عودت‌شده"].map((item) => <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}{item === "در انتظار" && <b>{approvals.filter((approval) => approval.status === item).length}</b>}</button>)}
        </div>
        <div className="approval-list">
          {filteredApprovals.length ? filteredApprovals.map((item) => <article key={item.id}>
            <span className={`approval-icon ${item.status === "در انتظار" ? "pending" : item.status === "تأییدشده" ? "approved" : "rejected"}`}>{item.status === "تأییدشده" ? <CheckCheck size={20} /> : item.status === "در انتظار" ? <Clock3 size={20} /> : <RotateCcw size={20} />}</span>
            <div><small>{item.kind}</small><strong>{item.subject}</strong><p><UserRound size={13} /> درخواست‌کننده: {item.requester}<i /><CalendarDays size={13} /> ارسال: {item.submitted}</p></div>
            <div className="approval-meta"><StatusBadge value={item.status} /><small>مهلت: {item.deadline}</small></div>
            <button onClick={() => setModal({ type: "approval", id: item.id })}>بررسی درخواست <Eye size={15} /></button>
          </article>) : <EmptyState text="در این وضعیت درخواست تأییدی وجود ندارد." />}
        </div>
      </div>
    </>;
  }

  function renderKnowledge() {
    const categories = ["همه", ...Array.from(new Set(knowledge.map((item) => item.category)))];
    return <div className="knowledge-layout">
      <aside className="knowledge-side">
        <div className="knowledge-hero"><BookOpen size={30} /><strong>کتابخانه دانش</strong><span>{knowledge.length} محتوای سازمانی در دسترس است.</span></div>
        <strong>دسته‌بندی‌ها</strong>
        {categories.map((item) => <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}><span>{item}</span><b>{item === "همه" ? knowledge.length : knowledge.filter((doc) => doc.category === item).length}</b></button>)}
      </aside>
      <section className="knowledge-content">
        <div className="knowledge-switch"><button className={knowledgeView === "همه" ? "active" : ""} onClick={() => setKnowledgeView("همه")}><Library size={16} />همه محتوا</button><button className={knowledgeView === "محبوب‌ها" ? "active" : ""} onClick={() => setKnowledgeView("محبوب‌ها")}><Star size={16} />نشان‌شده‌ها</button><span>{filteredKnowledge.length} نتیجه</span></div>
        <div className="knowledge-grid">
          {filteredKnowledge.length ? filteredKnowledge.map((item) => <article key={item.id}>
            <header><span className={`doc-type ${item.format === "درس‌آموخته" ? "lesson" : ""}`}><FileText size={19} /></span><button className={item.favorite ? "favorite" : ""} onClick={() => setKnowledge((current) => current.map((doc) => doc.id === item.id ? { ...doc, favorite: !doc.favorite } : doc))}><Star size={18} fill={item.favorite ? "currentColor" : "none"} /></button></header>
            <small>{item.category} · {item.format}</small><h3>{item.title}</h3><p>{item.summary}</p><div className="knowledge-tags">{item.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div>
            <footer><div><UserRound size={13} />{item.author}<span>{item.updated}</span></div><button onClick={() => setModal({ type: "knowledge", id: item.id })}>مطالعه <Eye size={14} /></button></footer>
          </article>) : <EmptyState text="عبارت یا دسته‌بندی دیگری را امتحان کنید." />}
        </div>
      </section>
    </div>;
  }

  function renderModal() {
    if (!modal) return null;
    if (modal.type === "action") return <Modal title={modal.id ? "ویرایش اقدام" : "تعریف اقدام جدید"} subtitle="اطلاعات پایه و برنامه اجرا" onClose={() => setModal(null)} footer={<><button className="secondary" onClick={() => saveAction("پیش‌نویس")}><Save size={16} /> ذخیره پیش‌نویس</button><button className="primary" onClick={() => saveAction("در انتظار تأیید")}><Send size={16} /> ارسال برای تأیید</button></>}>
      <div className="ops-form-grid">
        <label className="wide"><span>عنوان اقدام *</span><input value={draftAction.title ?? ""} onChange={(event) => setDraftAction((value) => ({ ...value, title: event.target.value }))} placeholder="عنوان دقیق و قابل‌اندازه‌گیری اقدام" /></label>
        <label><span>پروژه مرتبط</span><select value={draftAction.project} onChange={(event) => setDraftAction((value) => ({ ...value, project: event.target.value }))}><option>توسعه سامانه مدیریت پروژه</option><option>نوسازی مرکز داده</option><option>بانکداری همراه نسل جدید</option><option>بدون پروژه</option></select></label>
        <label><span>مسئول اقدام</span><select value={draftAction.owner} onChange={(event) => setDraftAction((value) => ({ ...value, owner: event.target.value }))}><option>مدیر سامانه</option><option>علی رضایی</option><option>مریم احمدی</option><option>سارا محمدی</option></select></label>
        <label><span>تاریخ شروع</span><input defaultValue="۱۴۰۵/۰۶/۱۸" /></label><label><span>مهلت انجام</span><input value={draftAction.due ?? ""} onChange={(event) => setDraftAction((value) => ({ ...value, due: event.target.value }))} /></label>
        <label><span>اولویت</span><select value={draftAction.priority} onChange={(event) => setDraftAction((value) => ({ ...value, priority: event.target.value as ActionItem["priority"] }))}><option>عادی</option><option>متوسط</option><option>بالا</option></select></label><label><span>وزن اقدام</span><input type="number" defaultValue="20" min="0" max="100" /></label>
        <label className="wide"><span>شرح اقدام و خروجی مورد انتظار</span><textarea rows={4} value={draftAction.description ?? ""} onChange={(event) => setDraftAction((value) => ({ ...value, description: event.target.value }))} placeholder="شرح، معیار پذیرش و نتیجه مورد انتظار را وارد کنید." /></label>
        <label className="wide file-drop"><Paperclip size={20} /><strong>پیوست مستندات</strong><span>فایل‌ها را اینجا رها کنید یا برای انتخاب کلیک کنید.</span><input type="file" multiple /></label>
      </div>
    </Modal>;

    if (modal.type === "task") {
      const item = tasks.find((task) => task.id === modal.id)!;
      return <Modal title={item.title} subtitle="جزئیات وظیفه" onClose={() => setModal(null)} footer={<><button className="secondary"><MessageSquareText size={16} /> ثبت توضیح</button><button className="primary" onClick={() => { setTasks((current) => current.map((task) => task.id === item.id ? { ...task, status: "تکمیل‌شده" } : task)); setModal(null); notify("وظیفه تکمیل شد."); }}><CheckCheck size={16} /> اعلام انجام</button></>}><div className="detail-summary"><div><span>پروژه</span><strong>{item.project}</strong></div><div><span>ارجاع‌دهنده</span><strong>{item.creator}</strong></div><div><span>مهلت</span><strong>{item.due}</strong></div><div><span>وضعیت</span><StatusBadge value={item.status} /></div></div><div className="detail-text"><strong>شرح وظیفه</strong><p>{item.description}</p></div><div className="activity-box"><strong>فعالیت و گفتگو</strong><article><UserRound size={16} /><div><b>{item.creator}</b><span>این وظیفه را به شما ارجاع داد.</span><small>۲ ساعت پیش</small></div></article><label><input placeholder="یادداشت یا گزارش پیشرفت بنویسید..." /><button><Send size={15} /></button></label></div></Modal>;
    }

    if (modal.type === "approval") {
      const item = approvals.find((approval) => approval.id === modal.id)!;
      const decide = (status: ApprovalItem["status"], message: string) => { setApprovals((current) => current.map((approval) => approval.id === item.id ? { ...approval, status } : approval)); setModal(null); notify(message); };
      return <Modal title={item.subject} subtitle={item.kind} onClose={() => setModal(null)} footer={item.status === "در انتظار" ? <><button className="danger" onClick={() => decide("ردشده", "درخواست رد شد.")}><X size={16} /> رد درخواست</button><button className="secondary" onClick={() => decide("عودت‌شده", "درخواست برای اصلاح عودت شد.")}><RotateCcw size={16} /> عودت برای اصلاح</button><button className="primary success" onClick={() => decide("تأییدشده", "درخواست تأیید شد.")}><Check size={16} /> تأیید درخواست</button></> : undefined}><div className="detail-summary"><div><span>درخواست‌کننده</span><strong>{item.requester}</strong></div><div><span>تاریخ ارسال</span><strong>{item.submitted}</strong></div><div><span>مهلت پاسخ</span><strong>{item.deadline}</strong></div><div><span>وضعیت</span><StatusBadge value={item.status} /></div></div><div className="detail-text"><strong>شرح درخواست</strong><p>{item.description}</p></div><div className="approval-route"><strong>مسیر گردش تأیید</strong><div><span className="done"><Check size={14} /></span><p><b>ثبت درخواست</b><small>{item.requester}</small></p><i /><span className={item.status === "در انتظار" ? "current" : "done"}>{item.status === "در انتظار" ? "۲" : <Check size={14} />}</span><p><b>تأیید مدیر پروژه</b><small>مدیر سامانه</small></p><i /><span>۳</span><p><b>ثبت نهایی</b><small>دفتر مدیریت پروژه</small></p></div></div><label className="approval-comment"><span>یادداشت تصمیم</span><textarea rows={3} placeholder="توضیحات تأیید، رد یا موارد اصلاحی را ثبت کنید." /></label></Modal>;
    }

    if (modal.type === "knowledge") {
      const item = knowledge.find((doc) => doc.id === modal.id)!;
      return <Modal title={item.title} subtitle={`${item.category} · ${item.format}`} onClose={() => setModal(null)} footer={<><button className="secondary"><Download size={16} /> دریافت فایل</button><button className="primary" onClick={() => { setKnowledge((current) => current.map((doc) => doc.id === item.id ? { ...doc, favorite: !doc.favorite } : doc)); notify("فهرست نشان‌شده‌ها به‌روز شد."); }}><Star size={16} /> نشان‌کردن</button></>}><div className="knowledge-detail-head"><span><FileText size={28} /></span><div><small>آخرین ویرایش: {item.updated}</small><strong>{item.author}</strong><p>{item.views} بار مشاهده</p></div></div><div className="detail-text"><strong>چکیده محتوا</strong><p>{item.summary}</p><p>این محتوا به‌عنوان بخشی از مخزن دانش سازمانی ثبت شده و شامل دستورالعمل‌ها، تجربه‌های اجرایی و نکات قابل استفاده در پروژه‌های مشابه است.</p></div><div className="knowledge-tags large">{item.tags.map((tag) => <span key={tag}><Tag size={12} />{tag}</span>)}</div><div className="attachment-row"><FileText size={20} /><div><strong>نسخه نهایی مستند</strong><span>PDF · ۲.۴ مگابایت</span></div><button><Download size={16} /></button></div></Modal>;
    }

    return <Modal title="ثبت دانش جدید" subtitle="افزودن به مخزن دانش سازمانی" onClose={() => setModal(null)} footer={<><button className="secondary"><Save size={16} /> ذخیره پیش‌نویس</button><button className="primary" onClick={() => { setModal(null); notify("محتوا برای بررسی ارسال شد."); }}><Send size={16} /> ارسال برای انتشار</button></>}><div className="ops-form-grid"><label className="wide"><span>عنوان محتوا *</span><input placeholder="عنوان روشن و قابل جست‌وجو" /></label><label><span>نوع محتوا</span><select><option>مقاله</option><option>درس‌آموخته</option><option>رویه</option><option>فرم</option></select></label><label><span>دسته‌بندی</span><select><option>مدیریت پروژه</option><option>فناوری اطلاعات</option><option>مدیریت ریسک</option><option>فرآیندها و فرم‌ها</option></select></label><label className="wide"><span>چکیده</span><textarea rows={4} placeholder="شرح کوتاهی از دانش قابل انتقال بنویسید." /></label><label className="wide"><span>برچسب‌ها</span><input placeholder="برای نمونه: ریسک، منشور، PMO" /></label><label className="wide file-drop"><Upload size={20} /><strong>بارگذاری فایل اصلی و پیوست‌ها</strong><span>PDF، Word، Excel یا تصویر تا سقف ۲۰ مگابایت</span><input type="file" multiple /></label></div></Modal>;
  }

  return (
    <section className={`projects-workspace operations-workspace ${collapsed ? "sidebar-collapsed" : ""}`}>
      <header className="ops-heading">
        <div className="ops-title"><span><HeaderIcon size={23} /></span><div><small>{meta.eyebrow}</small><h1>{meta.title}</h1><p>{meta.description}</p></div></div>
        <div className="ops-header-actions">
          <label><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="جست‌وجو در این بخش..." /><kbd>Ctrl K</kbd></label>
          <button className="filter-button" title="فیلترهای بیشتر"><Filter size={18} /><ChevronDown size={14} /></button>
          {section === "تعریف اقدام" && <button className="ops-primary" onClick={() => openAction()}><Plus size={18} /> اقدام جدید</button>}
          {section === "مدیریت دانش" && <button className="ops-primary" onClick={() => setModal({ type: "new-knowledge" })}><Plus size={18} /> ثبت دانش</button>}
        </div>
      </header>

      {section === "تعریف اقدام" && renderActionCenter()}
      {section === "مرکز وظایف" && renderTaskCenter()}
      {section === "مرکز تأییدات" && renderApprovals()}
      {section === "مدیریت دانش" && renderKnowledge()}
      {renderModal()}
      {toast && <div className="ops-toast"><Check size={16} />{toast}</div>}
    </section>
  );
}
