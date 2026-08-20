"use client";

import { FormEvent, useState } from "react";
import { Bot, Database, Send, Sparkles, X } from "lucide-react";
import { api } from "../lib/api";

type Message = { role: "assistant" | "user"; text: string };
type AiResult = { answer: string; provider: string; tenant: string; suggestions: string[] };

const quickPrompts = ["خلاصه وضعیت سبد را بده", "پروژه‌های پرریسک کدام‌اند؟", "بودجه پروژه‌ها را تحلیل کن", "اقدامات باز را جمع‌بندی کن"];

export default function AiAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [provider, setProvider] = useState("Sepah Insight محلی — بدون هزینه");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: "سلام؛ من دستیار هوشمند مدیریت پروژه بانک سپه هستم. تحلیل من فقط بر اساس داده‌های سازمان فعال و سطح دسترسی شماست." },
  ]);

  async function send(text: string) {
    const message = text.trim();
    if (!message || sending) return;
    setMessages((current) => [...current, { role: "user", text: message }]);
    setInput("");
    setSending(true);
    try {
      const result = await api<AiResult>("/ai/chat", { method: "POST", body: JSON.stringify({ message }) });
      setProvider(`${result.provider} • ${result.tenant}`);
      setMessages((current) => [...current, { role: "assistant", text: result.answer }]);
    } catch (error) {
      setMessages((current) => [...current, { role: "assistant", text: error instanceof Error ? error.message : "تحلیل در دسترس نیست." }]);
    } finally { setSending(false); }
  }

  function submit(event: FormEvent) { event.preventDefault(); void send(input); }

  return <>
    <button className="ai-assistant-trigger" type="button" onClick={() => setOpen(true)} aria-label="باز کردن دستیار هوشمند">
      <span><Sparkles size={16} /></span><Bot size={23} /><strong>دستیار AI</strong><i />
    </button>
    {open && <div className="ai-assistant-backdrop">
      <section className="ai-assistant-panel" role="dialog" aria-modal="true" aria-label="دستیار هوشمند مدیریت پروژه">
        <header><div><span><Bot size={25} /></span><div><strong>Sepah Insight</strong><small><i /> تحلیل‌گر هوشمند سبد پروژه</small></div></div><button type="button" onClick={() => setOpen(false)} aria-label="بستن"><X size={20} /></button></header>
        <div className="ai-provider"><Database size={14} /><span>{provider}</span><em>داده‌ها از Tenant فعال</em></div>
        <div className="ai-messages">
          {messages.map((message, index) => <article className={message.role} key={`${message.role}-${index}`}><span>{message.role === "assistant" ? <Bot size={17} /> : "شما"}</span><p>{message.text}</p></article>)}
          {sending && <article className="assistant loading"><span><Bot size={17} /></span><p><i /><i /><i /></p></article>}
        </div>
        <div className="ai-quick-prompts">{quickPrompts.map((prompt) => <button type="button" key={prompt} onClick={() => void send(prompt)}>{prompt}</button>)}</div>
        <form onSubmit={submit}><input value={input} onChange={(event) => setInput(event.target.value)} placeholder="مثلاً پروژه‌های بحرانی را تحلیل کن..." /><button disabled={sending || !input.trim()}><Send size={18} /></button></form>
        <footer>تحلیل‌ها تصمیم‌یار هستند؛ تصمیم نهایی با مدیر پروژه است.</footer>
      </section>
    </div>}
  </>;
}
