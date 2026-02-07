// src/server/verify/numeric.ts
export async function numericCompare({ lhs, rhs, var: variable = 'x', samples = 6, domain = [-2,2], tol = 1e-6 }:{
  lhs: string; rhs: string; var?: string; samples?: number; domain?: [number,number]; tol?: number;
}) {
  const r = await fetch(process.env.VERIFY_ENDPOINT! + '/numeric_compare', {
    method: 'POST',
    headers: { 'Content-Type':'application/json' },
    body: JSON.stringify({ lhs, rhs, var: variable, samples, domain, tol })
  });
  if (!r.ok) return false;
  const j = await r.json();
  return !!j.ok;
}
