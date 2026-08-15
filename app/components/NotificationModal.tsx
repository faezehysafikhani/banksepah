"use client";

import { Inbox, ShieldAlert, X } from "lucide-react";
import { toFaDigits } from "../lib/date";

export type NotificationItem = {
  id: string;
  icon: "approval" | "risk";
  title: string;
  detail: string;
  onClick: () => void;
};

export default function NotificationModal({
  items,
  onClose,
}: {
  items: NotificationItem[];
  onClose: () => void;
}) {
  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal-panel glass-card notification-modal"
        role="dialog"
        aria-modal="true"
        aria-label="اعلان‌ها"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <span className="panel-icon"><Inbox size={18} /></span>
            <p><strong>اعلان‌ها</strong><small>{toFaDigits(items.length)} مورد نیازمند توجه</small></p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="بستن"><X size={18} /></button>
        </div>

        {items.length === 0 ? (
          <div className="empty-state">اعلان جدیدی وجود ندارد.</div>
        ) : (
          <ul className="notification-list">
            {items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => {
                    item.onClick();
                    onClose();
                  }}
                >
                  <span className={`activity-icon ${item.icon === "risk" ? "rose" : "amber"}`}>
                    {item.icon === "risk" ? <ShieldAlert size={16} /> : <Inbox size={16} />}
                  </span>
                  <p><strong>{item.title}</strong><small>{item.detail}</small></p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
