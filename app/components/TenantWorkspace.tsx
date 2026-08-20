"use client";

import { useEffect, useState } from "react";
import { Building2, Check, FolderKanban, KeyRound, ShieldCheck, UsersRound } from "lucide-react";
import { api } from "../lib/api";

type TenantDetails = {
  id: number; code: string; name: string; canManage: boolean;
  members: Array<{ userId: number; role: string; displayName: string; username: string; jobTitle: string; department: string }>;
  projects: Array<{ id: number; code: string; name: string; status: string; ownerUnit: string; accessCount: number }>;
};

const roles = ["مالک سامانه", "مدیر سازمان", "مدیر پروژه", "کاربر", "مشاهده‌گر"];

export default function TenantWorkspace({ collapsed }: { collapsed: boolean }) {
  const [data, setData] = useState<TenantDetails | null>(null);
  const [notice, setNotice] = useState("");
  useEffect(() => { api<TenantDetails>("/tenants/current").then(setData).catch(() => setData(null)); }, []);

  async function changeRole(userId: number, role: string) {
    if (!data) return;
    try {
      await api<void>(`/tenants/${data.id}/members/${userId}`, { method: "PUT", body: JSON.stringify({ role }) });
      setData({ ...data, members: data.members.map((member) => member.userId === userId ? { ...member, role } : member) });
      setNotice("نقش سازمانی ذخیره شد."); window.setTimeout(() => setNotice(""), 2200);
    } catch (error) { setNotice(error instanceof Error ? error.message : "ذخیره نقش انجام نشد."); }
  }

  if (!data) return <section className={`projects-workspace tenant-workspace ${collapsed ? "sidebar-collapsed" : ""}`}><div className="tenant-loading">در حال دریافت ساختار سازمانی…</div></section>;
  return <section className={`projects-workspace tenant-workspace ${collapsed ? "sidebar-collapsed" : ""}`}>
    <header className="tenant-heading"><div><span><Building2 size={25} /></span><div><small>Multi Tenant</small><h1>سازمان‌ها و دسترسی‌ها</h1><p>جداسازی کامل داده‌ها، پروژه‌ها و اعضای هر سازمان</p></div></div><em>{data.name}<b>{data.code}</b></em></header>
    <div className="tenant-stats">
      <article><span><FolderKanban size={21} /></span><div><strong>{data.projects.length.toLocaleString("fa-IR")}</strong><small>پروژه در سازمان فعال</small></div></article>
      <article><span><UsersRound size={21} /></span><div><strong>{data.members.length.toLocaleString("fa-IR")}</strong><small>عضو سازمانی</small></div></article>
      <article><span><ShieldCheck size={21} /></span><div><strong>ایزوله</strong><small>جداسازی داده در SQL Server</small></div></article>
      <article><span><KeyRound size={21} /></span><div><strong>پروژه‌ای</strong><small>مشاهده، ویرایش، تیم، WBS و تأیید</small></div></article>
    </div>
    <div className="tenant-grid">
      <section className="tenant-panel"><header><div><strong>اعضای سازمان</strong><small>نقش Tenant سطح دسترسی کلان را تعیین می‌کند.</small></div><UsersRound size={21} /></header><div className="tenant-member-head"><span>کاربر</span><span>واحد / سمت</span><span>نقش سازمانی</span></div>{data.members.map((member) => <article className="tenant-member-row" key={member.userId}><div><strong>{member.displayName}</strong><small>{member.username}</small></div><div><strong>{member.department || "—"}</strong><small>{member.jobTitle || "—"}</small></div>{data.canManage ? <select value={member.role} onChange={(event) => void changeRole(member.userId, event.target.value)}>{roles.map((role) => <option key={role}>{role}</option>)}</select> : <span>{member.role}</span>}</article>)}</section>
      <section className="tenant-panel"><header><div><strong>پروژه‌های سازمان</strong><small>کاربران فقط پروژه‌های دارای مجوز مشاهده را می‌بینند.</small></div><FolderKanban size={21} /></header>{data.projects.map((project) => <article className="tenant-project-row" key={project.id}><span><FolderKanban size={17} /></span><div><strong>{project.name}</strong><small>{project.code} • {project.ownerUnit}</small></div><em>{project.status}</em><b>{project.accessCount.toLocaleString("fa-IR")} دسترسی</b></article>)}</section>
    </div>
    <div className="tenant-security-note"><ShieldCheck size={20} /><div><strong>مدل امنیتی دو لایه فعال است</strong><p>ابتدا عضویت سازمانی کنترل می‌شود؛ سپس مجوز اختصاصی هر پروژه برای مشاهده، ویرایش، تیم، WBS و تأیید اعمال می‌گردد.</p></div></div>
    {notice && <div className="tenant-notice"><Check size={16} />{notice}</div>}
  </section>;
}
