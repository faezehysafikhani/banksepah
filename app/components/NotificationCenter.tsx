"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCheck, CircleAlert, ClipboardCheck, FileBarChart, FolderKanban, ShieldAlert, X } from "lucide-react";
import { api } from "../lib/api";

type Notice = { id: number; title: string; message: string; category: string; priority: string; isRead: boolean; createdAtUtc: string };
type NoticeResult = { unread: number; items: Notice[] };

const icons = { "ریسک": ShieldAlert, "تأییدات": ClipboardCheck, "گزارش": FileBarChart, "پروژه": FolderKanban, "اقدام": CircleAlert, "وظیفه": ClipboardCheck };

export default function NotificationCenter({ open, onClose, onUnreadChange }: { open: boolean; onClose: () => void; onUnreadChange: (count: number) => void }) {
  const [data, setData] = useState<NoticeResult>({ unread: 0, items: [] });
  const [filter, setFilter] = useState<"همه" | "خوانده‌نشده">("همه");
  useEffect(() => { if (open) api<NoticeResult>("/notifications").then((result) => { setData(result); onUnreadChange(result.unread); }).catch(() => undefined); }, [open, onUnreadChange]);
  if (!open) return null;

  async function read(item: Notice) {
    if (item.isRead) return;
    await api<void>(`/notifications/${item.id}/read`, { method: "PUT" });
    const next = { unread: Math.max(0, data.unread - 1), items: data.items.map((row) => row.id === item.id ? { ...row, isRead: true } : row) };
    setData(next); onUnreadChange(next.unread);
  }
  async function readAll() {
    await api<void>("/notifications/read-all", { method: "PUT" });
    setData((current) => ({ unread: 0, items: current.items.map((item) => ({ ...item, isRead: true })) })); onUnreadChange(0);
  }
  const items = filter === "همه" ? data.items : data.items.filter((item) => !item.isRead);

  return <div className="notification-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <aside className="notification-panel" role="dialog" aria-modal="true" aria-label="مرکز اعلان‌ها">
      <header><div><span><Bell size={23} /></span><div><strong>مرکز اعلان‌ها</strong><small>{data.unread.toLocaleString("fa-IR")} اعلان خوانده‌نشده</small></div></div><button onClick={onClose} aria-label="بستن"><X size={19} /></button></header>
      <nav><button className={filter === "همه" ? "active" : ""} onClick={() => setFilter("همه")}>همه <b>{data.items.length.toLocaleString("fa-IR")}</b></button><button className={filter === "خوانده‌نشده" ? "active" : ""} onClick={() => setFilter("خوانده‌نشده")}>خوانده‌نشده <b>{data.unread.toLocaleString("fa-IR")}</b></button><button className="read-all" onClick={() => void readAll()}><CheckCheck size={15} /> خواندن همه</button></nav>
      <div className="notification-list">{items.length === 0 ? <div className="notification-empty"><CheckCheck size={34} /><strong>همه چیز مرتب است</strong><p>اعلان تازه‌ای در این بخش وجود ندارد.</p></div> : items.map((item) => { const Icon = icons[item.category as keyof typeof icons] ?? Bell; return <button key={item.id} className={`${item.isRead ? "read" : "unread"} ${item.priority === "بحرانی" ? "critical" : ""}`} onClick={() => void read(item)}><span><Icon size={19} /></span><div><header><strong>{item.title}</strong><em>{item.category}</em></header><p>{item.message}</p><small>{new Intl.DateTimeFormat("fa-IR-u-ca-persian", { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.createdAtUtc))}</small></div>{!item.isRead && <i />}</button>; })}</div>
      <footer><Bell size={14} /> اعلان‌ها فقط از سازمان فعال نمایش داده می‌شوند.</footer>
    </aside>
  </div>;
}
