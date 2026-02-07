import OpenAI from "openai";
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

/** 埋め込み：まず small、失敗時に graceful degrade */
export async function embed(text: string): Promise<number[] | null> {
  const input = text.slice(0, 6000); // 短縮してコスト&失敗率低下
  try {
    const res = await client.embeddings.create({
      model: "text-embedding-3-small", // ← small に変更
      input
    });
    return res.data[0].embedding as number[];
  } catch (e: any) {
    // 429/500 系は null を返して、上位が“重複チェック省略”で続行
    if (e?.status === 429 || e?.status >= 500) return null;
    throw e; // それ以外は従来通りエラー
  }
}

export async function formatMarkdown(input: { title?: string; body_md: string }) {
  const sys = `You are a math writing assistant. Keep TeX as-is. Improve Markdown. Return JSON: {title, body_md, summary, tagSuggestions}.`;
  const user = `${input.title ? `# Title:\n${input.title}` : ""}\n\n# Body:\n${input.body_md}`.trim();

  const res = await client.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [{ role: "system", content: sys }, { role: "user", content: user }],
    temperature: 0.2,
  });
  const json = JSON.parse(res.choices[0].message.content || "{}");
  return {
    title: json.title ?? (input.title || ""),
    body_md: json.body_md ?? input.body_md,
    summary: json.summary ?? "",
    tagSuggestions: Array.isArray(json.tagSuggestions) ? json.tagSuggestions : [],
  };
}
