"use client";
import { useState } from "react";

const KINDS = [
  { key: "integral_linear", label: "積分: ax + b" },
  { key: "derivative_sin", label: "微分: sin(kx)" },
];

export default function GenAdmin() {
  const [kind, setKind] = useState("integral_linear");
  const [skillId, setSkillId] = useState("hs.calc.integral.basic");
  const [params, setParams] = useState<any>({});
  const [preview, setPreview] = useState("");
  const [log, setLog] = useState("");

  async function doPreview() {
    setLog(""); setPreview("");
    const r = await fetch("/api/generate/preview", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, skillId, params }),
    });
    const txt = await r.text();
    let js: any = {}; try { js = JSON.parse(txt); } catch { js = {}; }
    if (js?.ok) setPreview(js.preview || "(プレビューなし)");
    else setLog(`preview error: ${js?.error || txt || r.status}`);
  }

  async function doCommit() {
    setLog("");
    const r = await fetch("/api/generate/commit", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, skillId, params }),
    });
    const txt = await r.text();
    let js: any = {}; try { js = JSON.parse(txt); } catch { js = {}; }
    if (js?.ok) setLog(`保存OK: ${js.problem?.id || ""}`);
    else setLog(`commit error: ${js?.error || txt || r.status}`);
  }

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-4">
      <h1 className="text-2xl font-semibold">問題生成（簡易）</h1>

      <div className="grid sm:grid-cols-2 gap-3">
        <label className="space-y-1">
          <div className="text-sm text-gray-600">種類</div>
          <select value={kind} onChange={(e)=>setKind(e.target.value)} className="w-full border rounded-lg px-3 py-2">
            {KINDS.map(k=> <option key={k.key} value={k.key}>{k.label}</option>)}
          </select>
        </label>
        <label className="space-y-1">
          <div className="text-sm text-gray-600">Skill ID</div>
          <input value={skillId} onChange={(e)=>setSkillId(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
        </label>
      </div>

      {/* パラメータ（kindごとに簡易実装） */}
      {kind === "integral_linear" && (
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="space-y-1">
            <div className="text-sm text-gray-600">a（空なら乱数）</div>
            <input type="number" onChange={(e)=>setParams((p:any)=>({ ...p, a: e.target.valueAsNumber }))} className="w-full border rounded-lg px-3 py-2" />
          </label>
          <label className="space-y-1">
            <div className="text-sm text-gray-600">b（空なら乱数）</div>
            <input type="number" onChange={(e)=>setParams((p:any)=>({ ...p, b: e.target.valueAsNumber }))} className="w-full border rounded-lg px-3 py-2" />
          </label>
        </div>
      )}
      {kind === "derivative_sin" && (
        <label className="space-y-1">
          <div className="text-sm text-gray-600">k（空なら乱数）</div>
          <input type="number" onChange={(e)=>setParams((p:any)=>({ ...p, k: e.target.valueAsNumber }))} className="w-full border rounded-lg px-3 py-2" />
        </label>
      )}

      <div className="flex gap-2">
        <button onClick={doPreview} className="px-3 py-2 rounded-xl border">プレビュー</button>
        <button onClick={doCommit} className="px-3 py-2 rounded-xl border bg-blue-600 text-white">保存</button>
      </div>

      {preview && (
        <div className="rounded-xl border p-4 bg-gray-50 whitespace-pre-wrap">{preview}</div>
      )}
      {log && <div className="text-sm text-gray-600">{log}</div>}
    </div>
  );
}
