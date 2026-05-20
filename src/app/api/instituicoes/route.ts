import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

function gerarSlug(nome: string) {
  return nome
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function GET() {
  try {
    const instituicoes = await prisma.instituicao.findMany({
      orderBy: { nome: "asc" },
      include: { _count: { select: { transacoes: true } } },
    });
    return NextResponse.json(instituicoes);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao listar instituições" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { nome, cor } = await request.json();
    if (!nome?.trim()) return NextResponse.json({ error: "Nome obrigatório" }, { status: 400 });

    const slug = gerarSlug(nome.trim());
    const id = `inst_${slug.replace(/-/g, "_")}`;

    const instituicao = await prisma.instituicao.create({
      data: { id, nome: nome.trim(), slug, cor: cor ?? "#6366f1" },
    });
    return NextResponse.json(instituicao, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao criar instituição" }, { status: 500 });
  }
}
