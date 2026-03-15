import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { nome, cor } = await request.json();
    const instituicao = await prisma.instituicao.update({ where: { id }, data: { nome, cor } });
    return NextResponse.json(instituicao);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao atualizar instituição" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.instituicao.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao excluir instituição" }, { status: 500 });
  }
}
