import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { instituicaoId } = await request.json();
  if (!instituicaoId) {
    return NextResponse.json({ error: "instituicaoId obrigatório" }, { status: 400 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set("instituicao", instituicaoId, {
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete("instituicao");
  return res;
}
