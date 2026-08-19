"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  BellRing,
  Check,
  CheckCheck,
  ChevronDown,
  CircleAlert,
  Clock3,
  Filter,
  KeyRound,
  Lock,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Search,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserRound,
  UsersRound,
  UserX,
  X,
} from "lucide-react";

type UserStatus = "فعال" | "غیرفعال" | "مسدود";
type UserRecord = { id: number; username: string; fullName: string; email: string; mobile: string; role: string; unit: string; position: string; status: UserStatus; lastLogin: string; online: boolean };
type UserTab = "اطلاعات کاربری" | "اطلاعات سازمانی" | "نقش‌ها و دسترسی‌ها" | "امنیت و ورود" | "اعلان‌ها" | "سوابق فعالیت";

const initialUsers: UserRecord[] = [
  { id: 1, username: "admin", fullName: "مدیر سامانه", email: "admin@sepah.ir", mobile: "۰۹۱۲۱۲۳۴۵۶۷", role: "مدیر سیستم", unit: "دفتر مدیریت پروژه", position: "مدیر سامانه", status: "فعال", lastLogin: "امروز، ۱۶:۲۲", online: true },
  { id: 2, username: "a.rezaei", fullName: "علی رضایی", email: "a.rezaei@sepah.ir", mobile: "۰۹۱۲۳۴۵۶۷۸۹", role: "مدیر پروژه", unit: "فناوری اطلاعات", position: "مدیر پروژه ارشد", status: "فعال", lastLogin: "امروز، ۱۴:۰۸", online: true },
  { id: 3, username: "m.ahmadi", fullName: "مریم احمدی", email: "m.ahmadi@sepah.ir", mobile: "۰۹۱۲۹۸۷۶۵۴۳", role: "مدیر پروژه", unit: "بانکداری دیجیتال", position: "مدیر محصول", status: "فعال", lastLogin: "دیروز، ۱۱:۴۵", online: false },
  { id: 4, username: "s.mohammadi", fullName: "سارا محمدی", email: "s.mohammadi@sepah.ir", mobile: "۰۹۳۵۱۲۳۴۵۶۷", role: "کارشناس پروژه", unit: "برنامه‌ریزی", position: "کارشناس کنترل پروژه", status: "فعال", lastLogin: "۱۴۰۵/۰۵/۲۷", online: false },
  { id: 5, username: "r.karimi", fullName: "رضا کریمی", email: "r.karimi@sepah.ir", mobile: "۰۹۱۰۲۲۳۳۴۴۵", role: "ناظر", unit: "امور اجرایی", position: "ناظر پروژه", status: "غیرفعال", lastLogin: "۱۴۰۵/۰۴/۲۱", online: false },
  { id: 6, username: "n.hosseini", fullName: "نرگس حسینی", email: "n.hosseini@sepah.ir", mobile: "۰۹۱۹۸۸۷۷۶۶۵", role: "مدیر ریسک", unit: "مدیریت ریسک", position: "رئیس اداره ریسک", status: "مسدود", lastLogin: "۱۴۰۵/۰۵/۰۳", online: false },
];

const permissionGroups = [
  { title: "داشبورد مدیریتی", items: ["مشاهده داشبورد مدیریتی", "مشاهده کارت‌ها و نمودارها", "مشاهده تقویم و رویدادها", "تعریف و ویرایش رویداد", "دریافت خروجی داشبورد"] },
  { title: "سبد پروژه‌ها و اقدامات", items: ["مشاهده سبد پروژه‌ها", "ایجاد پروژه آبشاری", "ایجاد پروژه چابک", "ویرایش مشخصات پروژه", "حذف پروژه", "مشاهده داشبورد پروژه", "مدیریت منشور پروژه", "مدیریت WBS و زمان‌بندی", "مدیریت تیم پروژه", "مدیریت ریسک‌های پروژه", "مدیریت اسناد پروژه", "مدیریت اقدامات مرتبط", "تأیید تغییرات پروژه"] },
  { title: "اقدامات، وظایف و تأییدات", items: ["مشاهده اقدامات", "تعریف اقدام", "ویرایش و حذف اقدام", "ارجاع اقدام", "مشاهده مرکز وظایف", "ارجاع وظیفه", "اعلام انجام وظیفه", "مشاهده مرکز تأییدات", "تأیید درخواست", "رد درخواست", "عودت برای اصلاح"] },
  { title: "مدیریت دانش", items: ["مشاهده مخزن دانش", "ثبت محتوای دانش", "ویرایش محتوا", "انتشار و تأیید محتوا", "حذف محتوا", "دریافت مستندات"] },
  { title: "مدیریت استراتژی پروژه‌ها", items: ["مشاهده نمای کلی استراتژی", "مشاهده نقشه استراتژی", "تعریف و ویرایش اهداف راهبردی", "حذف اهداف راهبردی", "مدیریت شاخص‌های کلیدی", "مدیریت ابتکارها و برنامه‌ها", "ارزیابی هم‌راستایی پروژه‌ها", "تصویب هم‌راستایی"] },
  { title: "داشبوردها و گزارشات", items: ["مشاهده داشبورد اجرایی", "مشاهده عملکرد سبد", "مشاهده گزارش زمان و پیشرفت", "مشاهده گزارش هزینه و بودجه", "مشاهده گزارش ریسک و اقدامات", "استفاده از گزارش‌ساز", "ساخت گزارش سفارشی", "دریافت PDF و Excel", "چاپ گزارش"] },
  { title: "مدیریت کاربران", items: ["مشاهده فهرست کاربران", "ایجاد کاربر", "ویرایش کاربر", "فعال یا غیرفعال‌کردن کاربر", "مسدودکردن حساب", "بازنشانی رمز عبور", "تخصیص نقش و دسترسی", "مشاهده سوابق فعالیت", "حذف کاربر"] },
  { title: "تنظیمات سامانه", items: ["مشاهده تنظیمات", "ویرایش تنظیمات عمومی", "مدیریت واحدهای سازمانی", "مدیریت نقش‌ها", "مدیریت گردش کار", "مشاهده گزارش ممیزی", "مدیریت اعلان‌ها"] },
];
const allPermissions = permissionGroups.flatMap((group) => group.items);

function Modal({ title, subtitle, onClose, children, footer }: { title: string; subtitle: string; onClose: () => void; children: ReactNode; footer?: ReactNode }) {
  return <div className="ops-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="ops-modal user-modal" role="dialog" aria-modal="true" aria-label={title}><header><div><small>{subtitle}</small><h2>{title}</h2></div><button onClick={onClose} aria-label="بستن"><X size={19} /></button></header>{children}{footer && <footer>{footer}</footer>}</section></div>;
}

function StatusBadge({ value }: { value: UserStatus }) {
  return <span className={`user-status ${value === "فعال" ? "active" : value === "مسدود" ? "blocked" : "inactive"}`}><i />{value}</span>;
}

export default function UsersWorkspace({ collapsed }: { collapsed: boolean }) {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("همه نقش‌ها");
  const [statusFilter, setStatusFilter] = useState("همه وضعیت‌ها");
  const [modalUser, setModalUser] = useState<UserRecord | "new" | null>(null);
  const [activeTab, setActiveTab] = useState<UserTab>("اطلاعات کاربری");
  const [draft, setDraft] = useState<Partial<UserRecord>>({});
  const [permissions, setPermissions] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState("");
  const [deleteUser, setDeleteUser] = useState<UserRecord | null>(null);

  const filtered = useMemo(() => users.filter((user) => `${user.fullName} ${user.username} ${user.email} ${user.unit}`.includes(search) && (roleFilter === "همه نقش‌ها" || user.role === roleFilter) && (statusFilter === "همه وضعیت‌ها" || user.status === statusFilter)), [users, search, roleFilter, statusFilter]);
  const roles = Array.from(new Set(users.map((user) => user.role)));

  function notify(message: string) { setToast(message); window.setTimeout(() => setToast(""), 2400); }
  function openUser(user?: UserRecord) {
    const target = user ?? { id: 0, username: "", fullName: "", email: "", mobile: "", role: "کارشناس پروژه", unit: "دفتر مدیریت پروژه", position: "", status: "فعال" as UserStatus, lastLogin: "—", online: false };
    setDraft(target);
    setPermissions(new Set(user?.role === "مدیر سیستم" ? allPermissions : user?.role === "مدیر پروژه" ? allPermissions.filter((item) => !item.includes("حذف کاربر") && !item.includes("تنظیمات") && !item.includes("مدیریت نقش")) : allPermissions.filter((_, index) => index % 3 === 0)));
    setActiveTab("اطلاعات کاربری");
    setModalUser(user ?? "new");
  }
  function saveUser() {
    if (!draft.fullName?.trim() || !draft.username?.trim()) return notify("نام و نام کاربری الزامی است.");
    if (modalUser === "new") setUsers((current) => [{ ...draft, id: Date.now(), lastLogin: "هنوز وارد نشده", online: false } as UserRecord, ...current]);
    else if (modalUser) setUsers((current) => current.map((user) => user.id === modalUser.id ? { ...user, ...draft } as UserRecord : user));
    setModalUser(null);
    notify("اطلاعات و دسترسی‌های کاربر ذخیره شد.");
  }
  function togglePermission(permission: string) { setPermissions((current) => { const next = new Set(current); if (next.has(permission)) next.delete(permission); else next.add(permission); return next; }); }

  const tabs: { label: UserTab; icon: typeof UserRound }[] = [
    { label: "اطلاعات کاربری", icon: UserRound },
    { label: "اطلاعات سازمانی", icon: UsersRound },
    { label: "نقش‌ها و دسترسی‌ها", icon: ShieldCheck },
    { label: "امنیت و ورود", icon: KeyRound },
    { label: "اعلان‌ها", icon: BellRing },
    { label: "سوابق فعالیت", icon: Clock3 },
  ];

  function userModal() {
    if (!modalUser) return null;
    return <Modal title={modalUser === "new" ? "ایجاد کاربر جدید" : `ویرایش ${modalUser.fullName}`} subtitle="مدیریت حساب، سازمان و سطح دسترسی" onClose={() => setModalUser(null)} footer={<><button className="secondary" onClick={() => setModalUser(null)}>انصراف</button><button className="primary" onClick={saveUser}><Save size={16} /> ذخیره اطلاعات</button></>}><nav className="user-modal-tabs">{tabs.map((item) => { const Icon = item.icon; return <button type="button" key={item.label} className={activeTab === item.label ? "active" : ""} onClick={() => setActiveTab(item.label)}><Icon size={16} />{item.label}</button>; })}</nav><div className="ops-modal-body user-tab-body">
      {activeTab === "اطلاعات کاربری" && <div className="user-profile-form"><aside><div className="user-avatar-large"><UserRound size={36} /></div><button>انتخاب تصویر</button><small>JPG یا PNG تا ۲ مگابایت</small></aside><div className="ops-form-grid"><label><span>نام و نام خانوادگی *</span><input value={draft.fullName ?? ""} onChange={(event) => setDraft((value) => ({ ...value, fullName: event.target.value }))} /></label><label><span>نام کاربری *</span><input dir="ltr" value={draft.username ?? ""} onChange={(event) => setDraft((value) => ({ ...value, username: event.target.value }))} /></label><label><span>ایمیل سازمانی</span><input dir="ltr" value={draft.email ?? ""} onChange={(event) => setDraft((value) => ({ ...value, email: event.target.value }))} /></label><label><span>شماره همراه</span><input value={draft.mobile ?? ""} onChange={(event) => setDraft((value) => ({ ...value, mobile: event.target.value }))} /></label><label><span>وضعیت حساب</span><select value={draft.status} onChange={(event) => setDraft((value) => ({ ...value, status: event.target.value as UserStatus }))}><option>فعال</option><option>غیرفعال</option><option>مسدود</option></select></label><label><span>زبان رابط</span><select><option>فارسی</option><option>English</option></select></label><label className="wide"><span>توضیحات</span><textarea rows={4} placeholder="یادداشت مدیر سیستم درباره حساب کاربری" /></label></div></div>}
      {activeTab === "اطلاعات سازمانی" && <div className="ops-form-grid organization-form"><label><span>واحد سازمانی</span><select value={draft.unit} onChange={(event) => setDraft((value) => ({ ...value, unit: event.target.value }))}><option>دفتر مدیریت پروژه</option><option>فناوری اطلاعات</option><option>بانکداری دیجیتال</option><option>برنامه‌ریزی</option><option>مدیریت ریسک</option><option>امور اجرایی</option></select></label><label><span>سمت سازمانی</span><input value={draft.position ?? ""} onChange={(event) => setDraft((value) => ({ ...value, position: event.target.value }))} /></label><label><span>مدیر مستقیم</span><select><option>مدیر سامانه</option><option>علی رضایی</option><option>مریم احمدی</option></select></label><label><span>محل خدمت</span><select><option>ساختمان مرکزی</option><option>اداره فناوری اطلاعات</option><option>مدیریت شعب</option></select></label><label><span>کد پرسنلی</span><input dir="ltr" defaultValue="PM-1405-021" /></label><label><span>نوع همکاری</span><select><option>رسمی</option><option>قراردادی</option><option>مشاور</option></select></label><div className="wide user-project-field"><span>پروژه‌های تحت مسئولیت</span><div className="user-project-tags"><span>سامانه مدیریت پروژه <X size={13} /></span><span>نوسازی مرکز داده <X size={13} /></span><button><Plus size={14} /> افزودن پروژه</button></div></div></div>}
      {activeTab === "نقش‌ها و دسترسی‌ها" && <div className="permissions-tab"><header><div><strong>نقش و الگوی دسترسی</strong><span>{permissions.size} دسترسی از {allPermissions.length} مورد فعال است.</span></div><select value={draft.role} onChange={(event) => { const role = event.target.value; setDraft((value) => ({ ...value, role })); if (role === "مدیر سیستم") setPermissions(new Set(allPermissions)); }}><option>مدیر سیستم</option><option>مدیر پروژه</option><option>کارشناس پروژه</option><option>مدیر ریسک</option><option>ناظر</option><option>مشاهده‌گر</option></select><button onClick={() => setPermissions(new Set(allPermissions))}>انتخاب همه</button><button onClick={() => setPermissions(new Set())}>حذف همه</button></header><div className="permission-groups">{permissionGroups.map((group) => { const groupSelected = group.items.every((item) => permissions.has(item)); return <section key={group.title}><header><label><input type="checkbox" checked={groupSelected} onChange={() => setPermissions((current) => { const next = new Set(current); group.items.forEach((item) => groupSelected ? next.delete(item) : next.add(item)); return next; })} /><strong>{group.title}</strong></label><span>{group.items.filter((item) => permissions.has(item)).length} از {group.items.length}</span></header><div>{group.items.map((permission) => <label key={permission}><span>{permission}</span><input type="checkbox" checked={permissions.has(permission)} onChange={() => togglePermission(permission)} /><i /></label>)}</div></section>; })}</div></div>}
      {activeTab === "امنیت و ورود" && <div className="security-tab"><div className="security-cards"><article><span><KeyRound size={21} /></span><div><strong>بازنشانی رمز عبور</strong><p>ارسال لینک تعیین رمز جدید به کاربر</p></div><button onClick={() => notify("لینک بازنشانی رمز آماده شد.")}>ارسال لینک</button></article><article><span><Lock size={21} /></span><div><strong>ورود دومرحله‌ای</strong><p>افزایش امنیت حساب با کد یک‌بارمصرف</p></div><label><span className="sr-only">فعال‌سازی ورود دومرحله‌ای</span><input type="checkbox" defaultChecked /><i /></label></article><article><span><UserX size={21} /></span><div><strong>مسدودسازی ورود</strong><p>قطع دسترسی فوری کاربر به سامانه</p></div><label><span className="sr-only">مسدودسازی ورود کاربر</span><input type="checkbox" checked={draft.status === "مسدود"} onChange={(event) => setDraft((value) => ({ ...value, status: event.target.checked ? "مسدود" : "فعال" }))} /><i /></label></article></div><div className="login-policy"><strong>سیاست ورود</strong><label><span>انقضای رمز عبور</span><select><option>۹۰ روز</option><option>۶۰ روز</option><option>بدون انقضا</option></select></label><label><span>حداکثر نشست همزمان</span><select><option>۱ نشست</option><option>۲ نشست</option><option>نامحدود</option></select></label><label><span>محدوده IP مجاز</span><input dir="ltr" placeholder="برای نمونه 10.10.0.0/16" /></label></div></div>}
      {activeTab === "اعلان‌ها" && <div className="notifications-tab"><header><BellRing size={30} /><div><strong>تنظیمات اعلان کاربر</strong><p>رویدادها و کانال‌های اطلاع‌رسانی موردنیاز را تعیین کنید.</p></div></header>{["ارجاع وظیفه یا اقدام جدید", "درخواست تأیید جدید", "نزدیک‌شدن موعد پروژه", "ثبت ریسک بحرانی", "تغییر وضعیت پروژه", "رویدادها و جلسات تقویم"].map((item, index) => <article key={item}><strong>{item}</strong><label><input type="checkbox" defaultChecked /><i />اعلان سامانه</label><label><input type="checkbox" defaultChecked={index < 3} /><i />ایمیل</label><label><input type="checkbox" defaultChecked={index === 0 || index === 2} /><i />پیامک</label></article>)}</div>}
      {activeTab === "سوابق فعالیت" && <div className="user-audit"><header><div><strong>آخرین فعالیت‌های کاربر</strong><span>سوابق امنیتی و عملیاتی حساب</span></div><button><Filter size={15} /> فیلتر</button></header>{[["ورود موفق به سامانه", "امروز، ۱۴:۰۸", "192.168.10.24", "ورود"], ["ویرایش منشور پروژه", "دیروز، ۱۱:۳۵", "سامانه مدیریت پروژه", "پروژه"], ["تأیید گزارش پیشرفت", "۱۴۰۵/۰۵/۲۶", "گزارش مردادماه", "تأیید"], ["دریافت خروجی Excel", "۱۴۰۵/۰۵/۲۴", "عملکرد سبد", "گزارش"]].map((item) => <article key={item[0]}><span><CheckCheck size={17} /></span><div><strong>{item[0]}</strong><small>{item[2]}</small></div><em>{item[3]}</em><time>{item[1]}</time></article>)}</div>}
    </div></Modal>;
  }

  return <section className={`projects-workspace operations-workspace users-workspace ${collapsed ? "sidebar-collapsed" : ""}`}>
    <header className="ops-heading"><div className="ops-title"><span><UsersRound size={24} /></span><div><small>تنظیمات سازمانی</small><h1>مدیریت کاربران</h1><p>ایجاد حساب، تخصیص نقش و کنترل دسترسی‌های سامانه بانک سپه</p></div></div><div className="ops-header-actions"><label><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="نام، نام کاربری یا واحد..." /></label><button className="filter-button"><Filter size={17} /><ChevronDown size={13} /></button><button className="ops-primary" onClick={() => openUser()}><Plus size={17} /> کاربر جدید</button></div></header>
    <div className="user-stat-grid"><article><span className="cyan"><UsersRound size={20} /></span><div><small>کل کاربران</small><strong>{users.length}</strong><em>حساب ثبت‌شده</em></div></article><article><span className="green"><UserCheck size={20} /></span><div><small>کاربران فعال</small><strong>{users.filter((user) => user.status === "فعال").length}</strong><em>{users.filter((user) => user.online).length} نفر آنلاین</em></div></article><article><span className="orange"><Clock3 size={20} /></span><div><small>ورود در ۳۰ روز اخیر</small><strong>{users.filter((user) => user.lastLogin !== "هنوز وارد نشده").length}</strong><em>کاربر فعال دوره</em></div></article><article><span className="red"><UserX size={20} /></span><div><small>غیرفعال یا مسدود</small><strong>{users.filter((user) => user.status !== "فعال").length}</strong><em>نیازمند بررسی</em></div></article></div>
    <section className="ops-panel users-table-panel"><header className="users-toolbar"><div><strong>فهرست کاربران سامانه</strong><span>{filtered.length} کاربر نمایش داده می‌شود</span></div><div><select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}><option>همه نقش‌ها</option>{roles.map((role) => <option key={role}>{role}</option>)}</select><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option>همه وضعیت‌ها</option><option>فعال</option><option>غیرفعال</option><option>مسدود</option></select><button><Filter size={15} /> فیلترهای بیشتر</button></div></header><div className="ops-table-wrap"><table><thead><tr><th>کاربر</th><th>نام کاربری</th><th>واحد سازمانی</th><th>نقش</th><th>آخرین ورود</th><th>وضعیت</th><th>عملیات</th></tr></thead><tbody>{filtered.map((user) => <tr key={user.id}><td><div className="user-cell"><span><UserRound size={18} />{user.online && <i />}</span><div><strong>{user.fullName}</strong><small>{user.email}</small></div></div></td><td dir="ltr">{user.username}</td><td><strong>{user.unit}</strong><small>{user.position}</small></td><td><span className="role-badge"><ShieldCheck size={13} />{user.role}</span></td><td>{user.lastLogin}</td><td><StatusBadge value={user.status} /></td><td><div className="ops-actions"><button title="مشاهده و ویرایش" onClick={() => openUser(user)}><Pencil size={15} /></button><button title="بازنشانی رمز" onClick={() => notify(`بازنشانی رمز ${user.fullName} آماده شد.`)}><RotateCcw size={15} /></button><button title={user.status === "مسدود" ? "رفع مسدودی" : "مسدودکردن"} onClick={() => setUsers((current) => current.map((item) => item.id === user.id ? { ...item, status: item.status === "مسدود" ? "فعال" : "مسدود" } : item))}><Lock size={15} /></button><button className="danger" title="حذف" onClick={() => setDeleteUser(user)}><Trash2 size={15} /></button></div></td></tr>)}</tbody></table></div></section>
    {userModal()}
    {deleteUser && <Modal title="حذف کاربر" subtitle="تأیید عملیات" onClose={() => setDeleteUser(null)} footer={<><button className="secondary" onClick={() => setDeleteUser(null)}>انصراف</button><button className="danger" onClick={() => { setUsers((current) => current.filter((user) => user.id !== deleteUser.id)); setDeleteUser(null); notify("کاربر حذف شد."); }}><Trash2 size={16} /> حذف کاربر</button></>}><div className="user-delete"><CircleAlert size={32} /><strong>حساب «{deleteUser.fullName}» حذف شود؟</strong><p>سوابق عملیاتی باقی می‌ماند اما دسترسی کاربر قطع خواهد شد.</p></div></Modal>}
    {toast && <div className="ops-toast"><Check size={16} />{toast}</div>}
  </section>;
}
