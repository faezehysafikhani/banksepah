"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, Inbox, ShieldAlert, XCircle } from "lucide-react";
import type { ProjectCharter, ReviewStatus } from "../../db/projects";
import { toFaDigits } from "../lib/date";

const reviewStatusLabels: Record<ReviewStatus, string> = { pending: "در انتظار", approved: "تأیید شده", rejected: "رد شده" };
const reviewStatusTone: Record<ReviewStatus, string> = { pending: "amber", approved: "teal", rejected: "rose" };

export default function ApprovalsSection({
  charter,
  canReview,
  onChanged,
}: {
  charter: ProjectCharter;
  canReview: boolean;
  onChanged: () => void;
}) {
  const { documents, wbs, project } = charter;
  const wbsTitle = (wbsId: number | null) => {
    const item = wbs.find((entry) => entry.id === wbsId);
    return item ? item.activity || item.subActivity : "بدون فعالیت مرتبط";
  };

  const pending = documents.filter((doc) => doc.formStatus === "pending" || doc.contentStatus === "pending");
  const approved = documents.filter((doc) => doc.formStatus === "approved" && doc.contentStatus === "approved");
  const rejected = documents.filter((doc) => doc.formStatus === "rejected" || doc.contentStatus === "rejected");

  return (
    <div className="charter-page">
      <div className="approvals-stats">
        <div className="approvals-stat glass-card">
          <span className="stat-icon amber"><Inbox size={20} /></span>
          <div><strong>{toFaDigits(pending.length)}</strong><small>در صف بررسی</small></div>
        </div>
        <div className="approvals-stat glass-card">
          <span className="stat-icon teal"><CheckCircle2 size={20} /></span>
          <div><strong>{toFaDigits(approved.length)}</strong><small>تأییدشده</small></div>
        </div>
        <div className="approvals-stat glass-card">
          <span className="stat-icon rose"><XCircle size={20} /></span>
          <div><strong>{toFaDigits(rejected.length)}</strong><small>رد‌شده</small></div>
        </div>
      </div>

      <article className="charter-section glass-card">
        <h3><Inbox size={16} /> کارتابل تأییدات</h3>
        <p className="section-sub">مستندات بارگذاری‌شده منتظر تأیید شکلی یا محتوایی — {project.name}</p>
        {pending.length === 0 ? (
          <div className="empty-state"><CheckCircle2 size={26} /><p>موردی در صف بررسی نیست.</p></div>
        ) : (
          <ul className="approvals-list">
            {pending.map((doc) => (
              <ApprovalItem
                key={doc.id}
                projectId={project.id}
                doc={doc}
                relatedTitle={wbsTitle(doc.wbsId)}
                canReview={canReview}
                onChanged={onChanged}
              />
            ))}
          </ul>
        )}
      </article>
    </div>
  );
}

function ApprovalItem({
  projectId,
  doc,
  relatedTitle,
  canReview,
  onChanged,
}: {
  projectId: number;
  doc: ProjectCharter["documents"][number];
  relatedTitle: string;
  canReview: boolean;
  onChanged: () => void;
}) {
  const [formStatus, setFormStatus] = useState<ReviewStatus>(doc.formStatus);
  const [contentStatus, setContentStatus] = useState<ReviewStatus>(doc.contentStatus);
  const [note, setNote] = useState(doc.reviewNote);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/documents/${doc.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formStatus, contentStatus, note: note.trim() }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(result.error ?? "ثبت تأییدیه با خطا مواجه شد.");
        return;
      }
      onChanged();
    } catch {
      setError("ارتباط با سرور برقرار نشد.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <li className="approval-item">
      <div className="approval-item-head">
        <a href={`/api/projects/${projectId}/documents/${doc.id}`} target="_blank" rel="noreferrer">{doc.fileName}</a>
        <span className="approval-item-related">{relatedTitle}</span>
        <span className={`status-pill ${reviewStatusTone[doc.formStatus]}`}>شکلی: {reviewStatusLabels[doc.formStatus]}</span>
        <span className={`status-pill ${reviewStatusTone[doc.contentStatus]}`}>محتوایی: {reviewStatusLabels[doc.contentStatus]}</span>
      </div>
      {canReview ? (
        <form className="wbs-review-form" onSubmit={handleSubmit}>
          <label>
            تأیید شکلی
            <select value={formStatus} onChange={(event) => setFormStatus(event.target.value as ReviewStatus)}>
              <option value="pending">در انتظار</option>
              <option value="approved">تأیید شده</option>
              <option value="rejected">رد شده</option>
            </select>
          </label>
          <label>
            تأیید محتوایی
            <select value={contentStatus} onChange={(event) => setContentStatus(event.target.value as ReviewStatus)}>
              <option value="pending">در انتظار</option>
              <option value="approved">تأیید شده</option>
              <option value="rejected">رد شده</option>
            </select>
          </label>
          <input value={note} onChange={(event) => setNote(event.target.value)} placeholder="یادداشت ناظر (اختیاری)" />
          <button type="submit" disabled={submitting}>{submitting ? "..." : "ثبت تأییدیه"}</button>
          {error && <div className="login-error" role="alert"><ShieldAlert size={13} />{error}</div>}
        </form>
      ) : (
        <p className="approval-readonly-note">دسترسی شما فقط جهت مشاهده است.</p>
      )}
    </li>
  );
}
