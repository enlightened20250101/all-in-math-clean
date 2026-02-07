// src/server/learning/json.ts
/** 
 * モデル出力から「素のJSONオブジェクト」だけを取り出す。
 * - ```json ... ``` フェンスを剥がす
 * - 先頭/末尾のプロンプト残骸を除去（最初の { 〜 最後の } を切り出し）
 */
export function extractJsonObject(raw: string): string {
  let t = (raw ?? '').trim();

  // ```json ... ``` / ``` ... ``` を最優先で剥がす
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) t = fence[1].trim();

  // 先頭に余計な文字が付いた場合の保険：最初の { から最後の } までを切り出す
  const start = t.indexOf('{');
  const end = t.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    t = t.slice(start, end + 1);
  }

  return t;
}
