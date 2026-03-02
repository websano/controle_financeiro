import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { unlink } from "fs/promises";
import path from "path";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const transacao = await prisma.transacao.findUnique({
      where: { id },
      include: { anexos: true, categoria: true },
    });

    if (!transacao) {
      return NextResponse.json({ error: "Transação não encontrada" }, { status: 404 });
    }

    return NextResponse.json({ ...transacao, valor: Number(transacao.valor) });
  } catch (error) {
    console.error("Erro ao buscar transação:", error);
    return NextResponse.json({ error: "Erro ao buscar transação" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { titulo, observacao, data, valor, tipo, categoriaId } = body;

    const transacao = await prisma.transacao.update({
      where: { id },
      data: {
        titulo,
        observacao: observacao || null,
        data: new Date(data),
        valor: parseFloat(valor),
        tipo,
        ...(categoriaId !== undefined ? { categoriaId: categoriaId || null } : {}),
      },
      include: { anexos: true, categoria: true },
    });

    return NextResponse.json({ ...transacao, valor: Number(transacao.valor) });
  } catch (error) {
    console.error("Erro ao atualizar transação:", error);
    return NextResponse.json({ error: "Erro ao atualizar transação" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Buscar anexos para deletar arquivos
    const transacao = await prisma.transacao.findUnique({
      where: { id },
      include: { anexos: true },
    });

    if (!transacao) {
      return NextResponse.json({ error: "Transação não encontrada" }, { status: 404 });
    }

    // Deletar arquivos físicos
    for (const anexo of transacao.anexos) {
      try {
        const filePath = path.join(process.cwd(), "public", "uploads", anexo.nomeArquivo);
        await unlink(filePath);
      } catch {
        // Arquivo pode não existir mais
      }
    }

    await prisma.transacao.delete({ where: { id } });

    return NextResponse.json({ sucesso: true });
  } catch (error) {
    console.error("Erro ao deletar transação:", error);
    return NextResponse.json({ error: "Erro ao deletar transação" }, { status: 500 });
  }
}
