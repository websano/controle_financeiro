import { NextRequest, NextResponse } from "next/server";

// Credenciais fixas de admin
const TELEFONE = "33984104224";
const SENHA = "admin123";

export async function POST(request: NextRequest) {
  const { telefone, senha } = await request.json();
  const telLimpo = telefone?.replace(/\D/g, "");
  if (telLimpo === TELEFONE && senha === SENHA) {
    const res = NextResponse.json({ ok: true });
    res.cookies.set("auth", "1", { httpOnly: true, path: "/", maxAge: 60 * 60 * 24 * 7 });
    return res;
  }
  return NextResponse.json({ error: "Telefone ou senha inválidos" }, { status: 401 });
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete("auth");
  return res;
}
