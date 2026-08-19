"use client";

import { useMemo, useState } from "react";
import {
  BellRing,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Link2,
  ListChecks,
  MapPin,
  MessageSquareText,
  Plus,
  Save,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";

const monthNames = ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"];
const monthLengths = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];
const monthStarts = [0, 3, 6, 2, 5, 1, 4, 6, 1, 3, 5, 0];
const weekDays = ["ش", "ی", "د", "س", "چ", "پ", "ج"];
const officialHolidays: Record<number, Record<number, string>> = {
  0: { 1: "عید فطر و آغاز نوروز", 2: "تعطیلات نوروز و عید فطر", 3: "عید نوروز", 4: "عید نوروز", 12: "روز جمهوری اسلامی", 13: "روز طبیعت", 26: "شهادت امام جعفر صادق (ع)" },
  2: { 6: "عید قربان", 14: "عید غدیر و رحلت امام خمینی (ره)", 15: "قیام ۱۵ خرداد" },
  3: { 3: "تاسوعای حسینی", 4: "عاشورای حسینی" },
  4: { 13: "اربعین حسینی", 21: "رحلت پیامبر اکرم (ص) و شهادت امام حسن (ع)", 22: "شهادت امام رضا (ع)", 30: "شهادت امام حسن عسکری (ع)" },
  5: { 8: "میلاد پیامبر اکرم (ص) و امام جعفر صادق (ع)" },
};

type EventTab = "مشخصات رویداد" | "افراد مرتبط" | "دستور جلسه" | "صورتجلسه و اقدامات" | "یادآوری" | "ارتباط با وظایف";
const eventTabs: { label: EventTab; icon: typeof CalendarDays }[] = [
  { label: "مشخصات رویداد", icon: CalendarDays },
  { label: "افراد مرتبط", icon: UsersRound },
  { label: "دستور جلسه", icon: ListChecks },
  { label: "صورتجلسه و اقدامات", icon: MessageSquareText },
  { label: "یادآوری", icon: BellRing },
  { label: "ارتباط با وظایف", icon: Link2 },
];

function fa(value: number) { return new Intl.NumberFormat("fa-IR", { useGrouping: false }).format(value); }

function PersianDatePicker({ month, day, onMonth, onDay }: { month: number; day: number; onMonth: (month: number) => void; onDay: (day: number) => void }) {
  const cells = [...Array(monthStarts[month]).fill(null), ...Array.from({ length: monthLengths[month] }, (_, index) => index + 1)];
  return <div className="persian-datepicker"><header><button type="button" onClick={() => onMonth((month + 11) % 12)}><ChevronRight size={16} /></button><strong>{monthNames[month]} ۱۴۰۵</strong><button type="button" onClick={() => onMonth((month + 1) % 12)}><ChevronLeft size={16} /></button></header><div className="datepicker-week">{weekDays.map((item) => <span key={item}>{item}</span>)}</div><div className="datepicker-days">{cells.map((item, index) => item === null ? <i key={`empty-${index}`} /> : <button type="button" key={item} className={`${day === item ? "selected" : ""} ${officialHolidays[month]?.[item] || (monthStarts[month] + item - 1) % 7 === 6 ? "holiday" : ""}`} onClick={() => onDay(item)} title={officialHolidays[month]?.[item]}>{fa(item)}</button>)}</div><footer><span>{fa(1405)}/{fa(month + 1)}/{fa(day)}</span>{officialHolidays[month]?.[day] && <strong>{officialHolidays[month][day]}</strong>}</footer></div>;
}

export default function DashboardCalendar() {
  const [month, setMonth] = useState(4);
  const [selectedDay, setSelectedDay] = useState(28);
  const [eventOpen, setEventOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<EventTab>("مشخصات رویداد");
  const [eventTitle, setEventTitle] = useState("");
  const [events, setEvents] = useState([{ day: 28, title: "جلسه پایش سبد پروژه‌ها", time: "۱۰:۰۰" }, { day: 29, title: "کمیته راهبری تحول دیجیتال", time: "۱۴:۳۰" }]);
  const [notice, setNotice] = useState("");
  const cells = useMemo(() => [...Array(monthStarts[month]).fill(null), ...Array.from({ length: monthLengths[month] }, (_, index) => index + 1)], [month]);

  function saveEvent() {
    if (eventTitle.trim()) setEvents((current) => [...current, { day: selectedDay, title: eventTitle, time: "۰۹:۰۰" }]);
    setEventOpen(false);
    setEventTitle("");
    setNotice("رویداد در تقویم شمسی ثبت شد.");
    window.setTimeout(() => setNotice(""), 2400);
  }

  return <>
    <article className="chart-card dashboard-calendar-card">
      <div className="chart-title"><div><strong>تقویم شمسی مدیریتی</strong><small>رویدادها، جلسات و تعطیلات رسمی</small></div><button onClick={() => setEventOpen(true)}><Plus size={15} /> رویداد جدید</button></div>
      <header className="calendar-month"><button onClick={() => setMonth((value) => (value + 11) % 12)}><ChevronRight size={17} /></button><div><strong>{monthNames[month]} ۱۴۰۵</strong><small>{month === 4 ? "۲۳ ژوئیه تا ۲۲ اوت ۲۰۲۶" : "تقویم رسمی ۱۴۰۵"}</small></div><button onClick={() => setMonth((value) => (value + 1) % 12)}><ChevronLeft size={17} /></button></header>
      <div className="calendar-weekdays">{weekDays.map((item) => <span key={item}>{item}</span>)}</div>
      <div className="calendar-grid">{cells.map((item, index) => item === null ? <i key={`empty-${index}`} /> : <button key={item} className={`${selectedDay === item ? "selected" : ""} ${officialHolidays[month]?.[item] || (monthStarts[month] + item - 1) % 7 === 6 ? "holiday" : ""} ${events.some((event) => event.day === item && month === 4) ? "has-event" : ""}`} onClick={() => setSelectedDay(item)} onDoubleClick={() => { setSelectedDay(item); setEventOpen(true); }} title={officialHolidays[month]?.[item]}><span>{fa(item)}</span>{officialHolidays[month]?.[item] && <em>تعطیل</em>}</button>)}</div>
      <footer className="calendar-footer"><div><i /> تعطیلات رسمی</div><div><i /> رویداد ثبت‌شده</div><button onClick={() => setEventOpen(true)}>افزودن برای {fa(selectedDay)} {monthNames[month]}</button></footer>
    </article>

    {eventOpen && <div className="ops-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setEventOpen(false); }}><section className="ops-modal calendar-event-modal" role="dialog" aria-modal="true" aria-label="رویداد جدید"><header><div><small>تقویم مدیریتی</small><h2>رویداد جدید</h2></div><button onClick={() => setEventOpen(false)} aria-label="بستن"><X size={19} /></button></header><nav>{eventTabs.map((item) => { const Icon = item.icon; return <button type="button" key={item.label} className={activeTab === item.label ? "active" : ""} onClick={() => setActiveTab(item.label)}><Icon size={16} />{item.label}</button>; })}</nav><div className="ops-modal-body event-tab-content">
      {activeTab === "مشخصات رویداد" && <div className="event-main-grid"><div className="ops-form-grid"><label className="wide"><span>عنوان رویداد *</span><input value={eventTitle} onChange={(event) => setEventTitle(event.target.value)} placeholder="عنوان جلسه یا رویداد" /></label><label><span>نوع رویداد</span><select><option>جلسه</option><option>رویداد سازمانی</option><option>یادآوری</option><option>نقطه عطف پروژه</option></select></label><label><span>برگزارکننده</span><select><option>مدیر سامانه</option><option>دفتر مدیریت پروژه</option><option>کمیته راهبری</option></select></label><label><span>ساعت شروع</span><input defaultValue="۰۹:۰۰" /></label><label><span>ساعت پایان</span><input defaultValue="۱۰:۳۰" /></label><label className="wide"><span>مکان / لینک جلسه</span><div className="event-location"><MapPin size={16} /><input placeholder="اتاق جلسه یا نشانی آنلاین" /></div></label><label className="wide"><span>توضیحات</span><textarea rows={4} /></label></div><PersianDatePicker month={month} day={selectedDay} onMonth={setMonth} onDay={setSelectedDay} /></div>}
      {activeTab === "افراد مرتبط" && <div className="event-people"><header><div><strong>شرکت‌کنندگان رویداد</strong><span>افراد و واحدهای مرتبط را انتخاب کنید.</span></div><button><Plus size={15} /> افزودن فرد</button></header>{["مدیر سامانه", "علی رضایی", "مریم احمدی", "سارا محمدی"].map((name, index) => <article key={name}><span><UserRound size={17} /></span><div><strong>{name}</strong><small>{index === 0 ? "برگزارکننده" : "عضو پروژه"}</small></div><select defaultValue={index === 0 ? "برگزارکننده" : "الزامی"}><option>برگزارکننده</option><option>الزامی</option><option>اختیاری</option><option>رونوشت</option></select><button><X size={15} /></button></article>)}</div>}
      {activeTab === "دستور جلسه" && <div className="event-agenda"><header><strong>محورهای دستور جلسه</strong><button><Plus size={15} /> افزودن محور</button></header>{["مرور مصوبات جلسه قبل", "بررسی وضعیت پروژه‌های بحرانی", "تصمیم‌گیری درباره تخصیص منابع"].map((item, index) => <article key={item}><b>{fa(index + 1)}</b><input defaultValue={item} /><input defaultValue="۲۰ دقیقه" /><button><X size={15} /></button></article>)}</div>}
      {activeTab === "صورتجلسه و اقدامات" && <div className="event-minutes"><label><span>متن صورتجلسه</span><textarea rows={7} placeholder="خلاصه گفتگوها، تصمیم‌ها و مصوبات جلسه..." /></label><header><strong>اقدامات منتج از جلسه</strong><button><Plus size={15} /> اقدام جدید</button></header><article><input placeholder="عنوان اقدام" /><select><option>علی رضایی</option><option>مریم احمدی</option></select><input value={`${fa(1405)}/${fa(month + 1)}/${fa(selectedDay)}`} readOnly /></article></div>}
      {activeTab === "یادآوری" && <div className="event-reminders"><BellRing size={35} /><strong>یادآوری‌های رویداد</strong><p>زمان و کانال ارسال یادآوری برای شرکت‌کنندگان را تعیین کنید.</p>{["یک روز قبل", "یک ساعت قبل", "۱۵ دقیقه قبل"].map((item, index) => <label key={item}><input type="checkbox" defaultChecked={index < 2} /><span>{item}</span><select><option>اعلان سامانه</option><option>پیامک</option><option>ایمیل</option></select></label>)}</div>}
      {activeTab === "ارتباط با وظایف" && <div className="event-tasks"><header><div><strong>وظایف و پروژه‌های مرتبط</strong><span>رویداد را به موارد موجود پیوند دهید.</span></div><button><Plus size={15} /> انتخاب وظیفه</button></header>{["بررسی و تأیید منشور پروژه", "به‌روزرسانی درصد پیشرفت فعالیت‌ها", "بارگذاری صورت‌جلسه کمیته راهبری"].map((item) => <label key={item}><input type="checkbox" /><span><ClipboardList size={16} />{item}</span><small>مرکز وظایف</small></label>)}</div>}
    </div><footer><button className="secondary" onClick={() => setEventOpen(false)}>انصراف</button><button className="primary" onClick={saveEvent}><Save size={16} /> ذخیره رویداد</button></footer></section></div>}
    {notice && <div className="ops-toast"><Check size={16} />{notice}</div>}
  </>;
}
