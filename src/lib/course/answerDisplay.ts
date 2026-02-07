// src/lib/course/answerDisplay.ts
export type AnswerDisplay =
  | { kind: "text"; value: string }
  | { kind: "tex"; value: string };

export function getAnswerDisplay(raw: string): AnswerDisplay {
  const trimmed = (raw ?? "").trim();
  if (!trimmed) return { kind: "text", value: "" };
  if (trimmed === "none" || trimmed === "なし") {
    return { kind: "text", value: "実数解なし" };
  }

  const isTex =
    /\\|[\^_{}]/.test(trimmed) ||
    /\\(text|frac|dfrac|sqrt|binom|cdot|times|Rightarrow|Leftarrow|Leftrightarrow)/.test(
      trimmed
    );

  return isTex ? { kind: "tex", value: trimmed } : { kind: "text", value: trimmed };
}
