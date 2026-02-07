export async function postJson<T>(url: string, payload: any, timeoutMs = 10_000): Promise<T> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify(payload ?? {}),
      cache: 'no-store',
      signal: ctrl.signal,
    });
    const ct = res.headers.get('content-type') || '';
    const text = await res.text();
    if (!ct.includes('application/json')) {
      throw new Error(`Non-JSON response (status ${res.status}): ${text.slice(0,120)}`);
    }
    const json = JSON.parse(text);
    if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);
    return json as T;
  } finally { clearTimeout(timer); }
}
