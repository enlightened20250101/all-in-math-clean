"use client";

import { useState } from "react";

export default function ContactFormClient() {
  const [status, setStatus] = useState<"idle" | "error" | "ready">("idle");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const subject = String(formData.get("subject") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();

    if (!name || !email || !subject || !message) {
      event.preventDefault();
      setError("未入力の項目があります。");
      setStatus("error");
      return;
    }

    setError(null);
    setStatus("ready");
  }

  return (
    <form
      action="mailto:info.manganews@gmail.com"
      method="post"
      encType="text/plain"
      className="space-y-3"
      onSubmit={handleSubmit}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-600">お名前</label>
          <input
            name="name"
            type="text"
            required
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="例）山田 太郎"
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
        />
      </div>
      {status === "error" ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
          {error}
        </div>
      ) : null}
      {status === "ready" ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
          メールアプリが起動します。送信を確定してください。
        </div>
      ) : null}
      <button
        type="submit"
        className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-black"
      >
        メールを作成する
      </button>
    </form>
  );
}
