// src/lib/course/templates/_shared/utils.ts
export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function gradeChoice(userAnswer: string, correct: string) {
  const normalized = userAnswer.trim();
  const ok = normalized === correct;
  return { isCorrect: ok, correctAnswer: correct };
}

export function gradeNumeric(userAnswer: string, correct: number) {
  const user = Number(userAnswer);
  const ok = !Number.isNaN(user) && user === correct;
  return { isCorrect: ok, correctAnswer: String(correct) };
}

export type RootsAnswer = number[] | "none";

export function gradeRoots(userAnswer: string, correctRoots: RootsAnswer) {
  const normalized = userAnswer.trim();
  const lower = normalized.toLowerCase();
  const correctAnswer =
    correctRoots === "none"
      ? "none"
      : [...correctRoots].sort((a, b) => a - b).join(",");

  if (lower === "none" || normalized === "なし") {
    return { isCorrect: correctRoots === "none", correctAnswer };
  }

  const parts = normalized.split(",").map((p) => p.trim()).filter((p) => p.length > 0);
  if (parts.length !== 2) {
    return { isCorrect: false, correctAnswer };
  }

  const nums = parts.map((p) => Number(p));
  if (nums.some((n) => !Number.isInteger(n))) {
    return { isCorrect: false, correctAnswer };
  }

  if (correctRoots === "none") {
    return { isCorrect: false, correctAnswer };
  }

  const sortedUser = [...nums].sort((a, b) => a - b);
  const sortedCorrect = [...correctRoots].sort((a, b) => a - b);
  const ok =
    sortedUser.length === sortedCorrect.length &&
    sortedUser.every((v, i) => v === sortedCorrect[i]);
  return { isCorrect: ok, correctAnswer };
}
