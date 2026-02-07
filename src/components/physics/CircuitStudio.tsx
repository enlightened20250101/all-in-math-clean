// src/components/physics/CircuitStudio.tsx
"use client";

import * as React from "react";
import { useIsMobile } from "@/hooks/useIsMobile";
import {
  CIRCUIT_TEMPLATES,
  CircuitTemplateId,
  getTemplateById,
  ElementKind,
  SlotState,
  solveCircuit,
  CircuitSolveResult,
  Scenario,
  normalizeSlotsForScenario,
} from "./circuitTypes";

type Mode = "edit" | "measure" | "explain";

interface SlotUIState extends SlotState {
  x: number;
  y: number;
  orientation: "horizontal" | "vertical";
  label: string;
}

const CircuitStudio: React.FC = () => {
  const isMobile = useIsMobile();

  const [templateId, setTemplateId] =
    React.useState<CircuitTemplateId>("parallel-2R");
  const template = getTemplateById(templateId);

  const [mode, setMode] = React.useState<Mode>("edit");
  const [selectedSlotId, setSelectedSlotId] = React.useState<string | null>(
    null
  );
  const [paletteSlotId, setPaletteSlotId] = React.useState<string | null>(null);
  const [scenario, setScenario] = React.useState<Scenario>("dc-steady");

  // スロット状態
  const [slots, setSlots] = React.useState<SlotUIState[]>(() =>
    createInitialSlotStates(template)
  );

  // テンプレ変更時にスロットをリセット
  React.useEffect(() => {
    setSlots(createInitialSlotStates(template));
    setSelectedSlotId(null);
  }, [template]);

  const selectedSlot = slots.find((s) => s.slotId === selectedSlotId) ?? null;

  const solveResult = React.useMemo(() => {
    const normalizedSlots = normalizeSlotsForScenario(slots, scenario);
    return solveCircuit(template, normalizedSlots);
  }, [template, slots, scenario]);

  return (
    <div className="w-full p-3 sm:p-4 space-y-3">
      {/* テンプレ選択 & モードタブ */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        {/* 左: 回路パターン選択 */}
        <div className="flex items-center gap-2 text-xs sm:text-sm">
          <span className="text-gray-600 whitespace-nowrap">回路パターン</span>
          <select
            className="border rounded px-2 py-1 text-xs sm:text-sm"
            value={templateId}
            onChange={(e) =>
              setTemplateId(e.target.value as CircuitTemplateId)
            }
          >
            {CIRCUIT_TEMPLATES.map((tpl) => (
              <option key={tpl.id} value={tpl.id}>
                {tpl.label}
              </option>
            ))}
          </select>
        </div>

        {/* 中央: シナリオ選択 */}
        <div className="flex items-center gap-2 text-[11px] sm:text-xs text-gray-600">
          <span className="whitespace-nowrap">シナリオ</span>
          <label className="inline-flex items-center gap-1">
            <input
              type="radio"
              className="h-3 w-3"
              checked={scenario === "dc-initial"}
              onChange={() => setScenario("dc-initial")}
            />
            <span>スイッチ投入直後 (t = 0⁺)</span>
          </label>
          <label className="inline-flex items-center gap-1">
            <input
              type="radio"
              className="h-3 w-3"
              checked={scenario === "dc-steady"}
              onChange={() => setScenario("dc-steady")}
            />
            <span>十分時間が経った後 (t → ∞)</span>
          </label>
        </div>

        {/* 右: モードタブ */}
        <div className="flex text-xs sm:text-sm border-b">
          {(["edit", "measure", "explain"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={
                "px-3 py-2 -mb-px border-b-2 transition-colors " +
                (mode === m
                  ? "border-blue-500 text-blue-600 font-semibold"
                  : "border-transparent text-gray-500 hover:text-gray-700")
              }
            >
              {m === "edit" && "編集"}
              {m === "measure" && "計測"}
              {m === "explain" && "解説"}
            </button>
          ))}
        </div>
      </div>

      {/* キャンバス＋右/下パネル */}
      <div className="flex flex-col lg:flex-row gap-3">
        {/* キャンバス */}
        <div className="flex-1 min-w-0">
          <div className="relative w-full max-w-md sm:max-w-xl mx-auto aspect-[5/3] bg-slate-50 rounded-md border border-slate-200">
            <svg
              viewBox={`0 0 ${template.width} ${template.height}`}
              className="w-full h-full"
            >
              <defs>
                <marker
                  id="arrowhead"
                  viewBox="0 0 10 10"
                  refX="10"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" />
                </marker>
              </defs>
              {/* 配線パス */}
              {template.wires.map((wire) => (
                <polyline
                  key={wire.id}
                  fill="none"
                  stroke="#0f172a"
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={wire.points.map((p) => `${p.x},${p.y}`).join(" ")}
                />
              ))}

              {/* 有効な素子の記号 */}
              {slots.map((s) =>
                s.enabled ? (
                  <g key={s.slotId}>
                    {s.kind === "resistor" && renderResistorSymbol(s)}
                    {s.kind === "voltageSource" && renderVoltageSourceSymbol(s)}
                    {s.kind === "capacitor" && renderCapacitorSymbol(s)}
                    {s.kind === "inductor" && renderInductorSymbol(s)}
                    {s.kind === "switch" && renderSwitchSymbol(s)}
                    
                    {(() => {
                      const mainLabel =
                        s.kind === "resistor"
                          ? `${s.label || s.slotId} (${s.value}Ω)`
                          : s.kind === "voltageSource"
                          ? `${s.value}V`
                          : s.kind === "capacitor"
                          ? `${s.label || "C"} (${s.value}F)`
                          : s.kind === "inductor"
                          ? `${s.label || "L"} (${s.value}H)`
                          : `${s.label || "SW"} (${s.value === 1 ? "ON" : "OFF"})`;
                    
                          
                      const textY =
                        s.kind === "voltageSource" && s.orientation === "vertical"
                          ? s.y + 26
                          : s.y - 14;
                          
                      return (
                        <text
                          x={s.x}
                          y={textY}
                          textAnchor="middle"
                          className="fill-slate-700"
                          fontSize={10}
                        >
                          {mainLabel}
                        </text>
                      );
                    })()}
                  </g>
                ) : null
              )}


              {/* スロットのヒットエリア */}
              {slots.map((s) => {
                const isSelected = selectedSlotId === s.slotId;
                return (
                  <g
                    key={`hit-${s.slotId}`}
                    onClick={() => {
                      setSelectedSlotId(s.slotId);
                      setMode("edit");          // 値の編集は右パネルで継続
                      setPaletteSlotId(s.slotId); // ★ パレットを開く
                    }}
                    className="cursor-pointer"
                  >
                    <circle
                      cx={s.x}
                      cy={s.y}
                      r={isSelected ? 18 : 14}
                      fill="transparent"
                      stroke={isSelected ? "#3b82f6" : "transparent"}
                      strokeWidth={isSelected ? 2 : 1}
                    />
                    {!s.enabled && (
                      <>
                        <circle
                          cx={s.x}
                          cy={s.y}
                          r={10}
                          fill="white"
                          stroke="#cbd5f5"
                          strokeWidth={1}
                        />
                        <line
                          x1={s.x - 4}
                          y1={s.y}
                          x2={s.x + 4}
                          y2={s.y}
                          stroke="#9ca3af"
                          strokeWidth={1.5}
                          strokeLinecap="round"
                        />
                        <line
                          x1={s.x}
                          y1={s.y - 4}
                          x2={s.x}
                          y2={s.y + 4}
                          stroke="#9ca3af"
                          strokeWidth={1.5}
                          strokeLinecap="round"
                        />
                      </>
                    )}
                  </g>
                );
              })}
              {/* 枝ごとの電流表示（計測モード時のみ） */}
              {mode === "measure" && solveResult.ok && (
                <>
                  {templateId === "series-2R" &&
                    renderSeriesCurrentOverlay(template, solveResult)}
                  {templateId === "parallel-2R" &&
                    renderParallelCurrentOverlay(template, solveResult)}
                </>
              )}
            </svg>
          </div>
        </div>

        {/* パネル */}
        <div
          className={
            "lg:w-80 w-full space-y-3 " +
            (isMobile ? "mt-1" : "lg:mt-0 flex-shrink-0")
          }
        >
          <SlotEditorCard
            mode={mode}
            slot={selectedSlot}
            onChange={(next) => {
              setSlots((prev) =>
                prev.map((s) => (s.slotId === next.slotId ? next : s))
              );
            }}
          />
          <SolveSummaryCard mode={mode} result={solveResult} />
        </div>
      </div>

      {/* ★ 素子パレット（タップ時に表示） */}
      <ElementPalette
        openSlot={slots.find((s) => s.slotId === paletteSlotId) ?? null}
        onClose={() => setPaletteSlotId(null)}
        onSelectKind={(kind) => {
          if (!paletteSlotId) return;
          setSlots((prev) =>
            prev.map((s) =>
              s.slotId === paletteSlotId
                ? {
                    ...s,
                    enabled: true,
                    kind,
                    value:
                      Number.isFinite(s.value)
                        ? s.value
                        : DEFAULT_VALUE_BY_KIND[kind],
                  }
                : s
            )
          );
          setPaletteSlotId(null);
        }}
        onRemove={() => {
          if (!paletteSlotId) return;
          setSlots((prev) =>
            prev.map((s) =>
              s.slotId === paletteSlotId ? { ...s, enabled: false } : s
            )
          );
          setPaletteSlotId(null);
        }}
      />

      {/* フッターメモ */}
      <p className="text-[11px] text-gray-500">
        ※ 現在はテンプレートごとの配線パターンに対して、単一電源＋任意の抵抗を解く仕様です。
        将来的にテンプレ追加や自由配線に拡張できます。
      </p>
    </div>
  );
};

export default CircuitStudio;

// ==== ユーティリティ =======================================================

function createInitialSlotStates(
  template: ReturnType<typeof getTemplateById>
): SlotUIState[] {
  return template.slots.map((sl) => ({
    slotId: sl.id,
    kind: sl.kind,
    enabled: true,
    value: sl.defaultValue,
    x: sl.x,
    y: sl.y,
    orientation: sl.orientation,
    label: sl.label,
  }));
}

function renderSeriesCurrentOverlay(
  template: ReturnType<typeof getTemplateById>,
  result: CircuitSolveResult
) {
  const I = result.totalCurrentFromSourceA;
  if (I == null || Math.abs(I) < 1e-9) return null;

  // 左の縦レールの wire を探す（id: "left" 前提）
  const leftWire = template.wires.find((w) => w.id === "left");
  if (!leftWire || leftWire.points.length < 2) return null;

  const pTop = leftWire.points[0];
  const pBottom = leftWire.points[leftWire.points.length - 1];

  const x = pTop.x - 16; // レールより少し左側に描く
  const y1 = pTop.y + 10;
  const y2 = pBottom.y - 10;
  const midY = (y1 + y2) / 2;

  const yStart = I >= 0 ? y1 : y2;
  const yEnd = I >= 0 ? y2 : y1;

  return (
    <g>
      <line
        x1={x}
        y1={yStart}
        x2={x}
        y2={yEnd}
        stroke="#3b82f6"
        strokeWidth={2}
        markerEnd="url(#arrowhead)"
      />
      <text
        x={x - 2}
        y={midY}
        textAnchor="end"
        fontSize={9}
        className="fill-blue-600"
      >
        {`I=${I.toFixed(3)}A`}
      </text>
    </g>
  );
}

function renderParallelCurrentOverlay(
  template: ReturnType<typeof getTemplateById>,
  result: CircuitSolveResult
) {
  const elements = result.elements;

  const getCurrent = (slotId: string): number | null => {
    const e = elements.find((el) => el.slotId === slotId);
    if (!e) return null;
    if (Math.abs(e.currentA) < 1e-9) return null;
    return e.currentA;
  };

  const I_total = result.totalCurrentFromSourceA;
  const I_A = getCurrent("A1"); // A枝の電流（A1の電流と同じ）
  const I_B = getCurrent("B1"); // B枝の電流（B1の電流と同じ）

  const overlays: JSX.Element[] = [];

  // 上枝A用：top-left wire を基準に上側に描画
  const topWire = template.wires.find((w) => w.id === "top-left");
  if (topWire && I_A != null) {
    const p1 = topWire.points[0];           // だいたい {x:80,y:70}
    const x1 = 120;
    const x2 = 260;                         // 少し短めに
    const y = p1.y - 14;                    // 上枝の少し上

    overlays.push(
      <g key="Ia">
        <line
          x1={x1}
          y1={y}
          x2={x2}
          y2={y}
          stroke="#3b82f6"
          strokeWidth={2}
          markerEnd="url(#arrowhead)"
        />
        <text
          x={(x1 + x2) / 2}
          y={y - 4}
          textAnchor="middle"
          fontSize={9}
          className="fill-blue-600"
        >
          {`I_A=${Math.abs(I_A).toFixed(3)}A`}
        </text>
      </g>
    );
  }

  // 下枝B用：mid-left wire を基準に少し下に描画
  const midWire = template.wires.find((w) => w.id === "mid-left");
  if (midWire && I_B != null) {
    const p1 = midWire.points[0];           // だいたい {x:80,y:120}
    const x1 = 120;
    const x2 = 260;
    const y = p1.y + 14;                    // 下枝の少し下

    overlays.push(
      <g key="Ib">
        <line
          x1={x1}
          y1={y}
          x2={x2}
          y2={y}
          stroke="#3b82f6"
          strokeWidth={2}
          markerEnd="url(#arrowhead)"
        />
        <text
          x={(x1 + x2) / 2}
          y={y + 10}
          textAnchor="middle"
          fontSize={9}
          className="fill-blue-600"
        >
          {`I_B=${Math.abs(I_B).toFixed(3)}A`}
        </text>
      </g>
    );
  }

  // 合成電流 I_total：bottom wire に沿って描画
  const bottomWire = template.wires.find((w) => w.id === "bottom");
  if (bottomWire && I_total != null && Math.abs(I_total) >= 1e-9) {
    const p1 = bottomWire.points[1]; // 左側 {x:80,y:220}
    const p2 = bottomWire.points[2]; // 右側 {x:320,y:220}
    const xRight = p2.x - 20;        // 右寄り
    const xLeft = p1.x + 20;         // 左寄り
    const y = p1.y + 10;             // 下ループのさらに下

    overlays.push(
      <g key="Itotal">
        {/* 右 -> 左 の矢印 */}
        <line
          x1={xRight}
          y1={y}
          x2={xLeft}
          y2={y}
          stroke="#3b82f6"
          strokeWidth={2}
          markerEnd="url(#arrowhead)"
        />
        <text
          x={(xLeft + xRight) / 2}
          y={y + 10}
          textAnchor="middle"
          fontSize={9}
          className="fill-blue-600"
        >
          {`I=${Math.abs(I_total).toFixed(3)}A`}
        </text>
      </g>
    );
  }

  if (overlays.length === 0) return null;
  return <>{overlays}</>;
}


// ==== サブコンポーネント ===================================================

  interface SlotEditorCardProps {
    mode: Mode;
    slot: SlotUIState | null;
    onChange: (slot: SlotUIState) => void;
  }

  const DEFAULT_VALUE_BY_KIND: Record<ElementKind, number> = {
    resistor: 10,
    voltageSource: 3,
    capacitor: 1e-6,
    inductor: 1e-3,
    switch: 0,
  };

  const UNIT_LABEL_BY_KIND: Record<ElementKind, string> = {
    resistor: "抵抗値 R [Ω]",
    voltageSource: "起電力 V [V]",
    capacitor: "容量 C [F]",
    inductor: "自己インダクタンス L [H]",
    switch: "状態 (0 = OFF, 1 = ON)",
  };

  const EXAMPLE_BY_KIND: Record<ElementKind, string> = {
    resistor: "例: 5, 10, 100",
    voltageSource: "例: 1.5, 3, 6",
    capacitor: "例: 1e-6",
    inductor: "例: 1e-3",
    switch: "例: 0 or 1",
  };

  const SlotEditorCard: React.FC<SlotEditorCardProps> = ({
    mode,
    slot,
    onChange,
  }) => {
    const [inputValue, setInputValue] = React.useState<string>(
      slot ? String(slot.value) : ""
    );
    const slotId = slot?.slotId;
    const slotValue = slot?.value;

    React.useEffect(() => {
      if (!slot) return;
      setInputValue(String(slot.value));
    }, [slot, slotId, slotValue]);

    if (!slot) {
      return (
        <div className="border rounded-md p-3 bg-slate-50 text-xs text-gray-600">
          回路図上の＋や部品をタップすると、その位置の値を編集できます。
        </div>
      );
    }

    const disabled = mode !== "edit";

    const unitLabel = UNIT_LABEL_BY_KIND[slot.kind];
    const placeholderExample = EXAMPLE_BY_KIND[slot.kind];

    // 素子が無効のとき：値は編集せず説明だけ
    if (!slot.enabled) {
      return (
        <div className="border rounded-md p-3 bg-white shadow-sm space-y-2 text-xs sm:text-sm">
          <div className="flex items-center justify-between">
            <div className="font-semibold text-gray-800">スロット設定</div>
            <div className="text-[11px] text-gray-500">
              {slot.label || slot.slotId}
            </div>
          </div>
          <p className="text-[11px] text-gray-600">
            この位置には素子がありません。
            キャンバス上の＋をタップして、素子を追加できます。
          </p>
        </div>
      );
    }

    // 素子が有効なとき：種類・有効フラグは触らせず、値だけ編集
    return (
      <div className="border rounded-md p-3 bg-white shadow-sm space-y-2 text-xs sm:text-sm">
        <div className="flex items-center justify-between">
          <div className="font-semibold text-gray-800">スロット設定</div>
          <div className="text-[11px] text-gray-500">
            {slot.label || slot.slotId}（{slot.kind}）
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-[11px] text-gray-600">
            {unitLabel}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              inputMode="decimal"
              disabled={disabled}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
              }}
              onBlur={() => {
                const trimmed = inputValue.trim();
                if (trimmed === "") {
                  setInputValue(String(slot.value));
                  return;
                }
                const v = parseFloat(trimmed);
                if (Number.isNaN(v)) {
                  setInputValue(String(slot.value));
                  return;
                }
                if (v !== slot.value) {
                  onChange({ ...slot, value: v });
                }
              }}
              className="w-28 px-2 py-1 border rounded text-xs sm:text-sm"
            />
            <span className="text-[11px] text-gray-500">
              {placeholderExample}
            </span>
          </div>
        </div>

        {mode !== "edit" && (
          <div className="text-[11px] text-gray-500 text-right">
            編集は「編集」タブから
          </div>
        )}
      </div>
    );
  };




interface SolveSummaryCardProps {
  mode: Mode;
  result: CircuitSolveResult;
}

const SolveSummaryCard: React.FC<SolveSummaryCardProps> = ({
  mode,
  result,
}) => {
  const { ok, errors, nodeVoltages, totalCurrentFromSourceA, elements } =
    result;

  return (
    <div className="border rounded-md p-3 bg-white shadow-sm space-y-2 text-xs sm:text-sm">
      <div className="flex items-center justify-between">
        <div className="font-semibold text-gray-800">
          {mode === "edit" && "現在の回路"}
          {mode === "measure" && "計測結果"}
          {mode === "explain" && "計算の考え方"}
        </div>
      </div>

      {errors.length > 0 && (
        <ul className="text-[11px] text-red-500 list-disc pl-4 space-y-0.5">
          {errors.map((e, i) => (
            <li key={i}>{e}</li>
          ))}
        </ul>
      )}

      {ok && nodeVoltages && (
        <>
          {/* 電源電流 */}
          <div className="flex flex-wrap gap-2 text-[11px]">
            <Badge
              label="電源電流 I"
              value={`${(totalCurrentFromSourceA ?? 0).toFixed(6)} A`}
            />
          </div>

          {/* 各抵抗の詳細 */}
          {elements.some((e) => e.kind === "resistor") && (
            <div className="mt-1 border-t pt-2 space-y-1">
              <div className="text-[11px] text-gray-500">
                各抵抗の電圧・電流・電力
              </div>
              <ul className="space-y-0.5">
                {elements
                  .filter((e) => e.kind === "resistor")
                  .map((e) => (
                    <li key={e.slotId} className="flex justify-between gap-2">
                      <span className="text-gray-700">{e.slotId}</span>
                      <span className="text-right text-[11px] text-gray-600 space-x-2">
                        <span>V = {e.voltageV.toFixed(3)} V</span>
                        <span>I = {e.currentA.toFixed(6)} A</span>
                        <span>P = {e.powerW.toFixed(3)} W</span>
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          )}

          {/* 解説モード */}
          {mode === "explain" && (
            <div className="mt-2 text-[11px] text-gray-600 space-y-1 leading-relaxed">
              <p>
                このツールでは、回路をノード（接点）と抵抗のネットワークとしてとらえ、
                各ノードに流れ込む電流の合計が 0 になる（KCL）ような電位を連立方程式で求めています。
              </p>
              <p>
                電源の正極と負極（接地）の電位はあらかじめ決めておき、残りのノード電位を解くことで、
                各抵抗の電圧降下 V や電流 I = V / R、電力 P = V × I を計算しています。
              </p>
            </div>
          )}
        </>
      )}

      {!ok && errors.length === 0 && (
        <p className="text-[11px] text-gray-500">
          まだ回路が完成していません。電源と抵抗を有効にすると計算されます。
        </p>
      )}
    </div>
  );
};

const Badge: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
    <span className="text-[10px]">{label}</span>
    <span className="font-mono text-[11px]">{value}</span>
  </div>
);

  interface ElementPaletteProps {
    openSlot: SlotUIState | null;
    onClose: () => void;
    onSelectKind: (kind: ElementKind) => void;
    onRemove: () => void;
  }

  const ElementPalette: React.FC<ElementPaletteProps> = ({
    openSlot,
    onClose,
    onSelectKind,
    onRemove,
  }) => {
    if (!openSlot) return null;

    const items: Array<{
      kind: ElementKind | "remove";
      label: string;
      sub?: string;
      emoji: string;
    }> = [
      { kind: "resistor",      label: "抵抗",       sub: "R",  emoji: "🟥" },
      { kind: "voltageSource", label: "電源",       sub: "V",  emoji: "🔋" },
      { kind: "capacitor",     label: "コンデンサー", sub: "C",  emoji: "⚡" },
      { kind: "inductor",      label: "コイル",     sub: "L",  emoji: "🌀" },
      { kind: "switch",        label: "スイッチ",   sub: "SW", emoji: "🔀" },
      { kind: "remove",        label: "この位置の素子を削除", emoji: "🗑️" },
    ];

    return (
      <div className="fixed inset-x-0 bottom-0 z-40 flex justify-center pointer-events-none">
        <div className="pointer-events-auto mb-4 w-full max-w-md px-3">
          <div className="rounded-2xl bg-white shadow-lg border border-slate-200 p-2 space-y-2">
            <div className="flex items-center justify-between px-1">
              <div className="text-[11px] text-gray-500">
                スロット: {openSlot.label || openSlot.slotId}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-[11px] text-gray-400 hover:text-gray-600"
              >
                閉じる
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {items.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    if (item.kind === "remove") {
                      onRemove();
                    } else {
                      onSelectKind(item.kind);
                    }
                  }}
                  className={
                    "flex flex-col items-center justify-center rounded-xl border px-2 py-2 text-[11px] " +
                    (item.kind === "remove"
                      ? "border-red-200 bg-red-50 text-red-600"
                      : "border-slate-200 bg-slate-50 hover:bg-slate-100")
                  }
                >
                  <span className="text-lg">{item.emoji}</span>
                  <span className="mt-0.5">{item.label}</span>
                  {item.sub && (
                    <span className="text-[10px] text-gray-400">
                      {item.sub}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };


// ==== SVG パーツ描画 =======================================================

function renderResistorSymbol(slot: {
  x: number;
  y: number;
  orientation: "horizontal" | "vertical";
}) {
  const length = 32;
  const height = 10;

  if (slot.orientation === "horizontal") {
    const x = slot.x - length / 2;
    const y = slot.y;
    const points = [
      [x, y],
      [x + 6, y - height / 2],
      [x + 12, y + height / 2],
      [x + 18, y - height / 2],
      [x + 24, y + height / 2],
      [x + length, y],
    ];
    const d = points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`)
      .join(" ");
    return (
      <path
        d={d}
        fill="none"
        stroke="#1f2937"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    );
  } else {
    const y = slot.y - length / 2;
    const x = slot.x;
    const points = [
      [x, y],
      [x - height / 2, y + 6],
      [x + height / 2, y + 12],
      [x - height / 2, y + 18],
      [x + height / 2, y + 24],
      [x, y + length],
    ];
    const d = points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`)
      .join(" ");
    return (
      <path
        d={d}
        fill="none"
        stroke="#1f2937"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    );
  }
}

function renderVoltageSourceSymbol(slot: {
  x: number;
  y: number;
  orientation: "horizontal" | "vertical";
}) {
  const plateGap = 8;
  const longLen = 16;
  const shortLen = 10;
  const cx = slot.x;
  const cy = slot.y;

  if (slot.orientation === "horizontal") {
    return (
      <g>
        {/* マイナス極（短い板） */}
        <line
          x1={cx - plateGap / 2}
          y1={cy - shortLen / 2}
          x2={cx - plateGap / 2}
          y2={cy + shortLen / 2}
          stroke="#b91c1c"
          strokeWidth={2}
          strokeLinecap="round"
        />
        {/* プラス極（長い板） */}
        <line
          x1={cx + plateGap / 2}
          y1={cy - longLen / 2}
          x2={cx + plateGap / 2}
          y2={cy + longLen / 2}
          stroke="#b91c1c"
          strokeWidth={2}
          strokeLinecap="round"
        />
      </g>
    );
  } else {
    return (
      <g>
        {/* マイナス極（短い板） */}
        <line
          x1={cx - shortLen / 2}
          y1={cy - plateGap / 2}
          x2={cx + shortLen / 2}
          y2={cy - plateGap / 2}
          stroke="#b91c1c"
          strokeWidth={2}
          strokeLinecap="round"
        />
        {/* プラス極（長い板） */}
        <line
          x1={cx - longLen / 2}
          y1={cy + plateGap / 2}
          x2={cx + longLen / 2}
          y2={cy + plateGap / 2}
          stroke="#b91c1c"
          strokeWidth={2}
          strokeLinecap="round"
        />
      </g>
    );
  }
}

function renderCapacitorSymbol(slot: {
  x: number;
  y: number;
  orientation: "horizontal" | "vertical";
}) {
  const plateGap = 6;
  const plateLen = 14;
  const cx = slot.x;
  const cy = slot.y;

  if (slot.orientation === "horizontal") {
    // ─ ┃┃ ─ みたいな感じ
    return (
      <g>
        {/* 左の導線 */}
        <line
          x1={cx - plateLen}
          y1={cy}
          x2={cx - plateGap}
          y2={cy}
          stroke="#1f2937"
          strokeWidth={2}
          strokeLinecap="round"
        />
        {/* 左の板 */}
        <line
          x1={cx - plateGap}
          y1={cy - plateLen / 2}
          x2={cx - plateGap}
          y2={cy + plateLen / 2}
          stroke="#1f2937"
          strokeWidth={2}
        />
        {/* 右の板 */}
        <line
          x1={cx + plateGap}
          y1={cy - plateLen / 2}
          x2={cx + plateGap}
          y2={cy + plateLen / 2}
          stroke="#1f2937"
          strokeWidth={2}
        />
        {/* 右の導線 */}
        <line
          x1={cx + plateGap}
          y1={cy}
          x2={cx + plateLen}
          y2={cy}
          stroke="#1f2937"
          strokeWidth={2}
          strokeLinecap="round"
        />
      </g>
    );
  } else {
    // 縦向き
    return (
      <g>
        {/* 上の導線 */}
        <line
          x1={cx}
          y1={cy - plateLen}
          x2={cx}
          y2={cy - plateGap}
          stroke="#1f2937"
          strokeWidth={2}
          strokeLinecap="round"
        />
        {/* 上の板 */}
        <line
          x1={cx - plateLen / 2}
          y1={cy - plateGap}
          x2={cx + plateLen / 2}
          y2={cy - plateGap}
          stroke="#1f2937"
          strokeWidth={2}
        />
        {/* 下の板 */}
        <line
          x1={cx - plateLen / 2}
          y1={cy + plateGap}
          x2={cx + plateLen / 2}
          y2={cy + plateGap}
          stroke="#1f2937"
          strokeWidth={2}
        />
        {/* 下の導線 */}
        <line
          x1={cx}
          y1={cy + plateGap}
          x2={cx}
          y2={cy + plateLen}
          stroke="#1f2937"
          strokeWidth={2}
          strokeLinecap="round"
        />
      </g>
    );
  }
}

function renderInductorSymbol(slot: {
  x: number;
  y: number;
  orientation: "horizontal" | "vertical";
}) {
  const radius = 5;
  const turns = 4;
  const spacing = radius * 2;

  if (slot.orientation === "horizontal") {
    const startX = slot.x - (turns * spacing) / 2;
    const cy = slot.y;

    const pathParts: string[] = [];
    // 左の導線
    pathParts.push(`M ${startX - 8} ${cy}`);
    pathParts.push(`L ${startX} ${cy}`);

    // コイルのループ
    for (let i = 0; i < turns; i++) {
      const cx = startX + i * spacing + radius;
      pathParts.push(
        `C ${cx - radius} ${cy - radius}, ${cx + radius} ${cy - radius}, ${cx + radius} ${cy}`
      );
      pathParts.push(
        `C ${cx + radius} ${cy + radius}, ${cx - radius} ${cy + radius}, ${cx - radius} ${cy}`
      );
    }

    // 右の導線
    const endX = startX + turns * spacing;
    pathParts.push(`L ${endX + 8} ${cy}`);

    return (
      <path
        d={pathParts.join(" ")}
        fill="none"
        stroke="#1f2937"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    );
  } else {
    // 縦向きは簡易版（縦にループ）
    const startY = slot.y - (turns * spacing) / 2;
    const cx = slot.x;

    const pathParts: string[] = [];
    pathParts.push(`M ${cx} ${startY - 8}`);
    pathParts.push(`L ${cx} ${startY}`);

    for (let i = 0; i < turns; i++) {
      const cy = startY + i * spacing + radius;
      pathParts.push(
        `C ${cx - radius} ${cy - radius}, ${cx - radius} ${cy + radius}, ${cx} ${cy + radius}`
      );
      pathParts.push(
        `C ${cx + radius} ${cy + radius}, ${cx + radius} ${cy - radius}, ${cx} ${cy - radius}`
      );
    }

    const endY = startY + turns * spacing;
    pathParts.push(`L ${cx} ${endY + 8}`);

    return (
      <path
        d={pathParts.join(" ")}
        fill="none"
        stroke="#1f2937"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    );
  }
}

function renderSwitchSymbol(slot: {
  x: number;
  y: number;
  orientation: "horizontal" | "vertical";
  value?: number; // 0=OFF, 1=ON
}) {
  const cx = slot.x;
  const cy = slot.y;
  const isOn = slot.value === 1;

  if (slot.orientation === "horizontal") {
    const gap = 6;

    return (
      <g>
        {/* 左の固定接点 */}
        <circle cx={cx - gap} cy={cy} r={2} fill="#1f2937" />
        {/* 右の固定接点 */}
        <circle cx={cx + gap} cy={cy} r={2} fill="#1f2937" />

        {/* 左側導線 */}
        <line
          x1={cx - 20}
          y1={cy}
          x2={cx - gap}
          y2={cy}
          stroke="#1f2937"
          strokeWidth={2}
          strokeLinecap="round"
        />

        {/* 右側導線（ONのときだけ） */}
        {isOn && (
          <line
            x1={cx + gap}
            y1={cy}
            x2={cx + 20}
            y2={cy}
            stroke="#1f2937"
            strokeWidth={2}
            strokeLinecap="round"
          />
        )}

        {/* 可動アーム */}
        <line
          x1={cx - gap}
          y1={cy}
          x2={cx + (isOn ? gap : gap + 4)}
          y2={isOn ? cy : cy - 8}
          stroke="#1f2937"
          strokeWidth={2}
          strokeLinecap="round"
        />
      </g>
    );
  }

  // 縦向きは必要になったら足す
  return null;
}
