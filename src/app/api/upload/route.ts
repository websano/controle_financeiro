import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const transacaoId = formData.get("transacaoId") as string;
    const arquivo = formData.get("arquivo") as File;

    if (!transacaoId || !arquivo) {
      return NextResponse.json({ error: "Dados ausentes" }, { status: 400 });
    }

    // Verificar tipo de arquivo
    const tiposPermitidos = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
    ];
    if (!tiposPermitidos.includes(arquivo.type)) {
      return NextResponse.json(
        { error: "Tipo de arquivo não permitido. Use imagens (JPG, PNG, GIF, WEBP) ou PDF." },
        { status: 400 }
      );
    }

    // Limitar tamanho: 10MB
    const MAX_SIZE = 10 * 1024 * 1024;
    if (arquivo.size > MAX_SIZE) {
      return NextResponse.json({ error: "Arquivo muito grande. Máximo 10MB." }, { status: 400 });
    }

    // Criar pasta de uploads se não existir
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Gerar nome único
    const ext = arquivo.name.split(".").pop();
    const nomeArquivo = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;
    const filePath = path.join(uploadDir, nomeArquivo);

    // Salvar arquivo
    const bytes = await arquivo.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Determinar tipo
    const tipo = arquivo.type.startsWith("image/") ? "image" : "pdf";

    // Salvar no banco
    const anexo = await prisma.anexo.create({
      data: {
        nomeOriginal: arquivo.name,
        nomeArquivo,
        url: `/uploads/${nomeArquivo}`,
        tipo,
        tamanho: arquivo.size,
        transacaoId,
      },
    });

    return NextResponse.json(anexo, { status: 201 });
  } catch (error) {
    console.error("Erro no upload:", error);
    return NextResponse.json({ error: "Erro ao fazer upload" }, { status: 500 });
  }
}
