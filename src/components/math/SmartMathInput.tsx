'use client';

import { useMemo, useRef } from 'react';
import InlineKatex from '@/components/graphs/InlineKatex';
import { useIsMobile } from '@/hooks/useIsMobile';

type EquationMode = 'function' | 'implicit' | 'ineq' | 'polar' | 'param' | 'auto';

const EQUATION_MODE_LABEL: Record<EquationMode, string> = {
  auto: '自動判定',
  function: '関数 y=f(x)',
  implicit: '陰関数',
  ineq: '不等式',
  polar: '極座標 r=f(θ)',
  param: 'param',
};

// モバイル専用キーボードのキー配置
// モバイル専用キーボードのキー配置
const MOBILE_KEY_ROWS = [
    // 0段目：数字・小数点
    [
      { label: '1', text: '1' },
      { label: '2', text: '2' },
      { label: '3', text: '3' },
      { label: '4', text: '4' },
      { label: '5', text: '5' },
      { label: '6', text: '6' },
      { label: '7', text: '7' },
      { label: '8', text: '8' },
      { label: '9', text: '9' },
      { label: '0', text: '0' },
      { label: '.', text: '.' },
      { label: '⌫', text: 'BACKSPACE' }, // ← 特別扱い用
    ],
  
    // 1段目：変数
    [
      { label: 'x', text: 'x' },
      { label: 'y', text: 'y' },
      { label: 't', text: 't' },
      { label: 'a', text: 'a' },
      { label: 'b', text: 'b' },
      { label: 'c', text: 'c' },
    ],
  
    // 2段目：基本演算・括弧
    [
      { label: '+', text: '+' },
      { label: '−', text: '-' },
      { label: '×', text: '*' },
      { label: '÷', text: '/' },
      { label: '(', text: '(' },
      { label: ')', text: ')' },
    ],
  
    // 3段目：べき & 代表的な関数
    [
      { label: '^', text: '**' },
      { label: 'sin', text: 'sin(' },
      { label: 'cos', text: 'cos(' },
      { label: 'tan', text: 'tan(' },
      { label: '√', text: 'sqrt(' },
      { label: '|x|', text: 'abs(' },
    ],
  
    // 4段目：対数・指数・その他
    [
      { label: 'log', text: 'log(' },   // 自然対数（内部で ln→log 正規化）
      { label: 'ln', text: 'ln(' },
      { label: 'exp', text: 'exp(' },
      { label: 'floor', text: 'floor(' },
      { label: 'ceil', text: 'ceil(' },
      { label: 'sgn', text: 'sign(' },
    ],
  
    // 5段目：不等号・定数など
    [
      { label: '<', text: ' < ' },
      { label: '>', text: ' > ' },
      { label: '≤', text: ' <= ' },
      { label: '≥', text: ' >= ' },
      { label: '≠', text: ' != ' },
      { label: 'π', text: 'PI' },
    ],
  ];  

const TEMPLATE_BY_MODE: Record<
  Exclude<EquationMode, 'auto'>,
  { label: string; value: string }[]
> = {
  function: [
    { label: '一次: y = a*x + b', value: 'y = a*x + b' },
    {
      label: '二次: y = a*x**2 + b*x + c',
      value: 'y = a*x**2 + b*x + c',
    },
    { label: 'sin: y = a*sin(x + b)', value: 'y = a*sin(x + b)' },
    { label: 'cos: y = a*cos(x + b)', value: 'y = a*cos(x + b)' },
    { label: '指数: y = a*exp(b*x)', value: 'y = a*exp(b*x)' },
    { label: '対数: y = a*log(x) + b', value: 'y = a*log(x) + b' },
  ],
  implicit: [
    { label: '円: x**2 + y**2 = 1', value: 'x**2 + y**2 = 1' },
    {
      label: '楕円: x**2/a**2 + y**2/b**2 = 1',
      value: 'x**2 / a**2 + y**2 / b**2 = 1',
    },
    {
      label: '放物線: y**2 = 4*a*x',
      value: 'y**2 = 4*a*x',
    },
  ],
  ineq: [
    {
      label: '円の内部: x**2 + y**2 - 1 <= 0',
      value: 'x**2 + y**2 - 1 <= 0',
    },
    {
      label: '円の外部: x**2 + y**2 - 1 >= 0',
      value: 'x**2 + y**2 - 1 >= 0',
    },
    { label: '直線の上: y - x >= 0', value: 'y - x >= 0' },
    { label: '帯域: 1 <= y <= 2', value: '1 <= y <= 2' },
  ],
  polar: [
    { label: 'r = 1 + 2*cos(x)', value: 'r = 1 + 2*cos(x)' },
    { label: 'r = 2*sin(3*x)', value: 'r = 2*sin(3*x)' },
    { label: 'カードロイド: r = 1 + cos(x)', value: 'r = 1 + cos(x)' },
    { label: 'バラ曲線: r = sin(2*x)', value: 'r = sin(2*x)' },
  ],
  param: [
    {
      label: '単位円 param',
      value: 'param: x = cos(t); y = sin(t)',
    },
    {
      label: '直線 param',
      value: 'param: x = t; y = a*t + b',
    },
    {
      label: '楕円 param',
      value: 'param: x = a*cos(t); y = b*sin(t)',
    },
    {
      label: 'サイクロイド',
      value: 'param: x = t - sin(t); y = 1 - cos(t)',
    },
  ],
};

export type SmartMathInputProps = {
  value: string;
  onChange: (v: string) => void;

  label?: string;
  description?: string;
  placeholder?: string;
  error?: string;

  /** LaTeX プレビューを表示するか（デフォルト true） */
  showPreview?: boolean;

  /** 見た目用: sm = フォーム内 / md = 単独ブロック */
  size?: 'sm' | 'md';

  /** GraphStudio など「外側でモバイルUIを持つ」場合は true にする */
  disableMobilePanel?: boolean;

  className?: string;
};

function detectEquationMode(expr: string): EquationMode {
  const s = expr.trim();
  if (!s) return 'auto';

  if (/^param\s*:/i.test(s)) return 'param';
  if (/^\s*r\s*=/.test(s)) return 'polar';
  if (/[<>]=?|!=/.test(s)) return 'ineq';

  if (s.includes('=') && /[xy]/.test(s) && !/^y\s*=/.test(s)) {
    return 'implicit';
  }
  if (/^y\s*=/.test(s)) return 'function';

  return 'auto';
}

// GraphStudio と同様、** → ^ など見栄え用の軽い変換
function toDisplayTex(s: string) {
  return (s || '').replace(/\*\*/g, '^').replace(/\s*=\s*/g, ' = ');
}

/**
 * どのページからでも使える「SP最適化された数式入力コンポーネント」
 * - PC: 普通のテキスト + LaTeXプレビュー
 * - SP: 下部にミニキーボード + モード別テンプレ候補
 */
export default function SmartMathInput({
  value,
  onChange,
  label,
  description,
  placeholder,
  error,
  showPreview = true,
  size = 'md',
  className,
  disableMobilePanel = false,   // ★ ここで受け取る！
}: SmartMathInputProps) {
  const isMobile = useIsMobile();
  const showMobileKeyboard = isMobile && !disableMobilePanel;  // ★ ここで使う
  const inputRef = useRef<HTMLInputElement | null>(null);

  const mode: EquationMode = useMemo(() => detectEquationMode(value), [value]);

  const templates = useMemo(() => {
    if (mode === 'auto') {
      return [
        ...TEMPLATE_BY_MODE.function,
        ...TEMPLATE_BY_MODE.implicit,
        ...TEMPLATE_BY_MODE.ineq,
      ].slice(0, 4);
    }
    return TEMPLATE_BY_MODE[mode as Exclude<EquationMode, 'auto'>] ?? [];
  }, [mode]);

  function insertAtCursor(text: string) {
    const current = value ?? '';
    const input = inputRef.current;
    if (!input) {
      onChange(current + text);
      return;
    }
    const start = input.selectionStart ?? current.length;
    const end = input.selectionEnd ?? current.length;

    const before = current.slice(0, start);
    const after = current.slice(end);
    const next = before + text + after;
    onChange(next);

    const newPos = start + text.length;
    requestAnimationFrame(() => {
      if (!inputRef.current) return;
      inputRef.current.focus();
      inputRef.current.setSelectionRange(newPos, newPos);
    });
  }

  // ★ バックスペースボタン用: カーソル位置 or 選択範囲を削除
  function deleteAtCursor() {
    const input = inputRef.current;
    if (!input) return;
    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? 0;

    if (start === 0 && end === 0) return; // 先頭で削除するものがない

    const deleteFrom = start === end ? start - 1 : start;
    const before = value.slice(0, Math.max(0, deleteFrom));
    const after = value.slice(end);
    const next = before + after;

    onChange(next);

    const newPos = Math.max(0, deleteFrom);
    requestAnimationFrame(() => {
      if (!inputRef.current) return;
      inputRef.current.focus();
      inputRef.current.setSelectionRange(newPos, newPos);
    });
  }

  function applyTemplate(template: string) {
    onChange(template);
    requestAnimationFrame(() => {
      if (!inputRef.current) return;
      const pos = template.length;
      inputRef.current.focus();
      inputRef.current.setSelectionRange(pos, pos);
    });
  }

  const wrapperBase =
    size === 'sm'
      ? 'w-full space-y-1'
      : 'w-full space-y-2';

  return (
    <div className={`${wrapperBase} ${className ?? ''}`}>
      {/* ラベル行 */}
      {(label || description || mode !== 'auto') && (
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col">
            {label && (
              <span className="text-xs font-medium text-gray-800">
                {label}
              </span>
            )}
            {description && (
              <span className="text-[11px] text-gray-500">
                {description}
              </span>
            )}
          </div>
          {mode && (
            <span className="inline-flex items-center rounded-full bg-gray-50 border px-2 py-0.5 text-[11px] text-gray-600">
              {EQUATION_MODE_LABEL[mode]}
            </span>
          )}
        </div>
      )}

      {/* 入力本体 */}
      <div className="space-y-1">
        <input
          ref={inputRef}
          className={`
            w-full rounded-lg border px-2 py-1.5 text-sm
            focus:outline-none focus:ring-2 focus:ring-sky-500/60 focus:border-sky-500
            ${error ? 'border-red-400' : 'border-gray-300'}
          `}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? 'y = x**2 / (x - 1) など'}
          inputMode="text"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
        />

        {/* エラー */}
        {error && (
          <p className="text-[11px] text-red-600">{error}</p>
        )}

        {/* テンプレ候補（PC/SP共通） */}
        {templates.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {templates.map((t) => (
              <button
                key={t.label}
                type="button"
                className="
                  px-2 py-0.5 rounded-md border bg-white text-[11px]
                  text-gray-700 hover:bg-gray-50 active:bg-gray-100
                "
                onClick={() => applyTemplate(t.value)}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}

        {/* プレビュー */}
        {showPreview && (
          <div className="mt-1 text-sm text-gray-800">
            <InlineKatex tex={toDisplayTex(value)} />
          </div>
        )}

        {/* 関数ヘルプ（軽く） */}
        <div className="mt-1 text-[10px] text-gray-500">
          使用可能な主な関数: sin, cos, tan, log, ln, exp, sqrt, abs, floor, ceil, sign など
        </div>
      </div>

      {/* モバイル専用ミニキーボード */}
      {showMobileKeyboard && (
        <div className="mt-2 border rounded-lg bg-white px-1.5 py-1.5 space-y-1">
          {MOBILE_KEY_ROWS.map((row, idx) => (
            <div key={idx} className="flex justify-center flex-wrap gap-1">
              {row.map((key) => (
                <button
                  key={key.label + idx}
                  type="button"
                  className="
                    flex-1 max-w-[60px]
                    px-2 py-1 rounded-md border text-xs
                    bg-gray-50 active:bg-gray-100
                  "
                  onClick={() => {
                    if (key.label === '⌫') {
                      deleteAtCursor();
                    } else {
                      insertAtCursor(key.text);
                    }
                  }}
                >
                  {key.label}
                </button>
              ))}
            </div>
          ))}

          {/* ★ バックスペースボタン（右寄せ） */}
          <div className="flex justify-end">
            <button
              type="button"
              className="
                px-3 py-1 rounded-md border text-xs
                bg-gray-50 hover:bg-gray-100 active:bg-gray-200
              "
              onClick={deleteAtCursor}
            >
              ⌫
            </button>
          </div>

          <p className="mt-1 text-[10px] text-gray-500">
            ボタンはカーソル位置に挿入されます。長押しで選択 → 上書きもできます。
          </p>
        </div>
      )}
    </div>
  );
}
