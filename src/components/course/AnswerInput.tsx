"use client";

import { useEffect, useRef, useState } from "react";
import type { AnswerKind } from "@/lib/course/types";
import { canonicalizeRootsInputs, parseRootsAnswer } from "@/lib/course/answerUtils";
import KaTeXBlock from "@/components/math/KaTeXBlock";
import { getAnswerDisplay } from "@/lib/course/answerDisplay";

type Props = {
  answerKind: AnswerKind;
  value: string;
  onChange: (value: string) => void;
  onErrorChange?: (error: string | null) => void;
  choices?: string[] | null;
  placeholder?: string;
  className?: string;
};

export default function AnswerInput({
  answerKind,
  value,
  onChange,
  onErrorChange,
  choices,
  placeholder,
  className,
}: Props) {
  const isMultiNumeric = answerKind === "multi_numeric";
  const [rootA, setRootA] = useState("");
  const [rootB, setRootB] = useState("");
  const [noReal, setNoReal] = useState(false);
  const lastErrorRef = useRef<string | null>(null);
  const onErrorRef = useRef<Props["onErrorChange"]>(onErrorChange);

  useEffect(() => {
    onErrorRef.current = onErrorChange;
  }, [onErrorChange]);

  const emitError = (next: string | null) => {
    if (lastErrorRef.current === next) return;
    lastErrorRef.current = next;
    onErrorRef.current?.(next);
  };

  useEffect(() => {
    if (!isMultiNumeric) {
      emitError(null);
      return;
    }
    const parsed = parseRootsAnswer(value);
    if (parsed && "none" in parsed) {
      setNoReal(true);
      setRootA("");
      setRootB("");
      emitError(null);
      return;
    }
    if (parsed && "roots" in parsed) {
      setNoReal(false);
      setRootA(String(parsed.roots[0] ?? ""));
      setRootB(String(parsed.roots[1] ?? ""));
      emitError(null);
      return;
    }
    setNoReal(false);
    setRootA("");
    setRootB("");
    emitError(null);
  }, [isMultiNumeric, value]);

  const emitRoots = (nextA: string, nextB: string, nextNoReal: boolean) => {
    const result = canonicalizeRootsInputs(nextA, nextB, nextNoReal);
    onChange(result.value ?? "");
    emitError(result.error ?? null);
  };

  if (answerKind === "choice") {
    return (
      <div className="grid gap-2">
        {(choices ?? []).map((c) => {
          const selected = value === c;
          const display = getAnswerDisplay(c);
          return (
            <button
              key={c}
              type="button"
              className={`w-full rounded border px-3 py-2 text-left ${
                selected ? "border-black bg-gray-50" : "bg-white"
              }`}
              onClick={() => onChange(c)}
              aria-pressed={selected}
            >
              {display.kind === "tex" ? (
                <KaTeXBlock tex={display.value} inline />
              ) : (
                display.value
              )}
            </button>
          );
        })}
      </div>
    );
  }

  if (isMultiNumeric) {
    return (
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <input
            className={className ?? "w-full border rounded px-3 py-2"}
            value={rootA}
            onChange={(e) => {
              const next = e.target.value;
              setRootA(next);
              emitRoots(next, rootB, noReal);
            }}
            placeholder="解1"
            inputMode="decimal"
            disabled={noReal}
          />
          <input
            className={className ?? "w-full border rounded px-3 py-2"}
            value={rootB}
            onChange={(e) => {
              const next = e.target.value;
              setRootB(next);
              emitRoots(rootA, next, noReal);
            }}
            placeholder="解2"
            inputMode="decimal"
            disabled={noReal}
          />
        </div>
        <button
          type="button"
          className={`w-full rounded border px-3 py-2 text-sm ${
            noReal ? "bg-gray-100 border-gray-400" : "bg-white"
          }`}
          onClick={() => {
            const next = !noReal;
            setNoReal(next);
            if (next) {
              setRootA("");
              setRootB("");
              emitRoots("", "", true);
            } else {
              emitRoots(rootA, rootB, false);
            }
          }}
        >
          実数解なし
        </button>
        <p className="text-xs text-gray-600">
          整数を入力（例: -1 と 3）/ 重解は同じ数を2つ入力<br />
          実数解がない場合は「実数解なし」を選択
        </p>
      </div>
    );
  }

  return (
    <input
      className={className ?? "w-full border rounded px-3 py-2"}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder ?? "数値で入力"}
      inputMode="decimal"
    />
  );
}
