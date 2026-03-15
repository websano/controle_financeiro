import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const instituicaoId = cookieStore.get("instituicao")?.value;

    const { searchParams } = new URL(request.url);
    const dataInicio = searchParams.get("dataInicio");
    const dataFim = searchParams.get("dataFim");
    const categoriasParam = searchParams.get("categorias"); // IDs separados por vírgula

    const where: Record<string, unknown> = {};
    if (instituicaoId) where.instituicaoId = instituicaoId;
    if (dataInicio || dataFim) {
      where.data = {};
      if (dataInicio) (where.data as Record<string, unknown>).gte = new Date(dataInicio + "T00:00:00");
      if (dataFim) {
        const fim = new Date(dataFim + "T23:59:59");
        (where.data as Record<string, unknown>).lte = fim;
      }
    }
    if (categoriasParam) {
      const ids = categoriasParam.split(",").filter(Boolean);
      if (ids.length > 0) where.categoriaId = { in: ids };
    }

    const [entradas, saidas, transacoes, instituicao] = await Promise.all([
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
      instituicaoId
        ? prisma.instituicao.findUnique({ where: { id: instituicaoId }, select: { nome: true, cor: true } })
        : Promise.resolve(null),
    ]);

    const totalEntradas = Number(entradas._sum.valor ?? 0);
    const totalSaidas = Number(saidas._sum.valor ?? 0);

    // Agrupar por categoria
    const porCategoria: Record<string, { nome: string; cor: string; total: number; count: number }> = {};
    transacoes.forEach((t: { categoriaId: string | null; categoria?: { nome: string; cor: string } | null; valor: unknown } & Record<string, unknown>) => {
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
      transacoes: transacoes.map((t: { valor: unknown } & Record<string, unknown>) => ({ ...t, valor: Number(t.valor) })),
      periodo: { dataInicio, dataFim },
      instituicao: instituicao ? { nome: instituicao.nome, cor: instituicao.cor } : null,
    });
  } catch (error) {
    console.error("Erro no relatório:", error);
    return NextResponse.json({ error: "Erro ao gerar relatório" }, { status: 500 });
  }
}
