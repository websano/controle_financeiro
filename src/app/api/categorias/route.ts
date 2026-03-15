import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const instituicaoId = cookieStore.get("instituicao")?.value;

    const categorias = await prisma.categoria.findMany({
      where: { instituicaoId: instituicaoId ?? null },
      orderBy: { nome: "asc" },
      include: { _count: { select: { transacoes: true } } },
    });
    return NextResponse.json(categorias);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao listar categorias" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const instituicaoId = cookieStore.get("instituicao")?.value;

    const { nome, cor, icone } = await request.json();
    if (!nome?.trim()) return NextResponse.json({ error: "Nome obrigatório" }, { status: 400 });

    const categoria = await prisma.categoria.create({
      data: {
        nome: nome.trim(),
        cor: cor ?? "#6366f1",
        icone,
        instituicaoId: instituicaoId ?? null,
      },
    });
    return NextResponse.json(categoria, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao criar categoria" }, { status: 500 });
  }
}
