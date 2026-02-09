"use client";

import { useState } from "react";

type FormState = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export default function ContactFormClient() {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "error" | "success" | "sending">("idle");
  const [error, setError] = useState<string | null>(null);

  function updateField(key: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = form.name.trim();
    const email = form.email.trim();
    const subject = form.subject.trim();
    const message = form.message.trim();

    if (!name || !email || !subject || !message) {
      setError("未入力の項目があります。");
      setStatus("error");
      return;
    }

    setStatus("sending");
    setError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? "送信に失敗しました。");
      }
      setStatus("success");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "送信に失敗しました。");
    }
  }

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-600">お名前</label>
          <input
            name="name"
            type="text"
            required
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="例）山田 太郎"
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-600">メールアドレス</label>
          <input
            name="email"
            type="email"
            required
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="example@email.com"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
          />
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-xs font-semibold text-slate-600">件名</label>
        <input
          name="subject"
          type="text"
          required
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          placeholder="お問い合わせ件名"
          value={form.subject}
          onChange={(e) => updateField("subject", e.target.value)}
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-semibold text-slate-600">内容</label>
        <textarea
          name="message"
          rows={5}
          required
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          placeholder="お問い合わせ内容を入力してください"
          value={form.message}
          onChange={(e) => updateField("message", e.target.value)}
        />
      </div>
      {status === "error" ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
          {error}
        </div>
      ) : null}
      {status === "success" ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
          送信しました。ご連絡ありがとうございます。
        </div>
      ) : null}
      <button
        type="submit"
        disabled={status === "sending"}
        className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-black disabled:opacity-60"
      >
        {status === "sending" ? "送信中..." : "送信する"}
      </button>
    </form>
  );
}
