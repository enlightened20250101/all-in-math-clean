import { NextResponse } from 'next/server';
import { tutorTurn } from '@/app/learn/actions';

export async function POST(req: Request) {
  const fd = await req.formData();
  const out = await tutorTurn(fd);
  return NextResponse.json(out);
}
