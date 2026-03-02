import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dataInicio = searchParams.get("dataInicio");
    const dataFim = searchParams.get("dataFim");

    const where: Record<string, unknown> = {};
    if (dataInicio || dataFim) {
      where.data = {};
      if (dataInicio) (where.data as Record<string, unknown>).gte = new Date(dataInicio + "T00:00:00");
      if (dataFim) {
        const fim = new Date(dataFim + "T23:59:59");
        (where.data as Record<string, unknown>).lte = fim;
      }
    }

    const [entradas, saidas, transacoes] = await Promise.all([
      prisma.transacao.aggregate({
        where: { ...where, tipo: "ENTRADA" },
        _sum: { valor: true },
        _count: true,
      }),
      prisma.transacao.aggregate({
        where: { ...where, tipo: "SAIDA" },
        _sum: { valor: true },
        _count: true,
      }),
      prisma.transacao.findMany({
        where,
        orderBy: { data: "desc" },
        include: { categoria: true },
      }),
    ]);

    const totalEntradas = Number(entradas._sum.valor ?? 0);
    const totalSaidas = Number(saidas._sum.valor ?? 0);

    // Agrupar por categoria
    const porCategoria: Record<string, { nome: string; cor: string; total: number; count: number }> = {};
    transacoes.forEach((t) => {
      const key = t.categoriaId ?? "__sem_categoria__";
      const nome = t.categoria?.nome ?? "Sem categoria";
      const cor = t.categoria?.cor ?? "#94a3b8";
      if (!porCategoria[key]) porCategoria[key] = { nome, cor, total: 0, count: 0 };
      porCategoria[key].total += Number(t.valor);
      porCategoria[key].count++;
    });

    return NextResponse.json({
      totalEntradas,
      totalSaidas,
      saldoCaixa: totalEntradas - totalSaidas,
      contadorEntradas: entradas._count,
      contadorSaidas: saidas._count,
      totalTransacoes: transacoes.length,
      porCategoria: Object.values(porCategoria),
      transacoes: transacoes.map((t) => ({ ...t, valor: Number(t.valor) })),
      periodo: { dataInicio, dataFim },
    });
  } catch (error) {
    console.error("Erro no relatório:", error);
    return NextResponse.json({ error: "Erro ao gerar relatório" }, { status: 500 });
  }
}
