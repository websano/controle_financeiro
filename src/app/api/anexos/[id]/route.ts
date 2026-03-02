import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { unlink } from "fs/promises";
import path from "path";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const anexo = await prisma.anexo.findUnique({ where: { id } });

    if (!anexo) {
      return NextResponse.json({ error: "Anexo não encontrado" }, { status: 404 });
    }

    // Deletar arquivo físico
    try {
      const filePath = path.join(process.cwd(), "public", "uploads", anexo.nomeArquivo);
      await unlink(filePath);
    } catch {
      // Ignorar se arquivo não existir
    }

    await prisma.anexo.delete({ where: { id } });

    return NextResponse.json({ sucesso: true });
  } catch (error) {
    console.error("Erro ao deletar anexo:", error);
    return NextResponse.json({ error: "Erro ao deletar anexo" }, { status: 500 });
  }
}
