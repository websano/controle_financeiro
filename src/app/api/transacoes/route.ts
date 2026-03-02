import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get("tipo"); // ENTRADA | SAIDA | null
    const pagina = parseInt(searchParams.get("pagina") ?? "1");
    const porPagina = parseInt(searchParams.get("porPagina") ?? "20");
    const busca = searchParams.get("busca") ?? "";
    const dataInicio = searchParams.get("dataInicio");
    const dataFim = searchParams.get("dataFim");

    const where: Record<string, unknown> = {};
    if (tipo && (tipo === "ENTRADA" || tipo === "SAIDA")) where.tipo = tipo;
    if (busca) {
      where.OR = [
        { titulo: { contains: busca, mode: "insensitive" } },
        { observacao: { contains: busca, mode: "insensitive" } },
      ];
    }
    if (dataInicio || dataFim) {
      where.data = {};
      if (dataInicio) (where.data as Record<string, unknown>).gte = new Date(dataInicio);
      if (dataFim) {
        const fim = new Date(dataFim);
        fim.setHours(23, 59, 59, 999);
        (where.data as Record<string, unknown>).lte = fim;
      }
    }

    const [transacoes, total] = await Promise.all([
      prisma.transacao.findMany({
        where,
        include: { anexos: true, categoria: true },
        orderBy: { data: "desc" },
        skip: (pagina - 1) * porPagina,
        take: porPagina,
      }),
      prisma.transacao.count({ where }),
    ]);

    return NextResponse.json({
      transacoes: transacoes.map((t) => ({ ...t, valor: Number(t.valor) })),
      total,
      pagina,
      porPagina,
      totalPaginas: Math.ceil(total / porPagina),
    });
  } catch (error) {
    console.error("Erro ao listar transações:", error);
    return NextResponse.json({ error: "Erro ao listar transações" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { titulo, observacao, data, valor, tipo, categoriaId } = body;

    if (!titulo || !data || !valor || !tipo) {
      return NextResponse.json({ error: "Campos obrigatórios ausentes" }, { status: 400 });
    }

    const transacao = await prisma.transacao.create({
      data: {
        titulo,
        observacao: observacao || null,
        data: new Date(data),
        valor: parseFloat(valor),
        tipo,
        ...(categoriaId ? { categoriaId } : {}),
      },
      include: { anexos: true },
    });

    return NextResponse.json({ ...transacao, valor: Number(transacao.valor) }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar transação:", error);
    return NextResponse.json({ error: "Erro ao criar transação" }, { status: 500 });
  }
}
