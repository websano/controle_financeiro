import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const instituicaoId = cookieStore.get("instituicao")?.value;
    const filtroInst = instituicaoId ? { instituicaoId } : {};

    const [entradas, saidas, totalTransacoes] = await Promise.all([
      prisma.transacao.aggregate({
        where: { ...filtroInst, tipo: "ENTRADA" },
        _sum: { valor: true },
        _count: true,
      }),
      prisma.transacao.aggregate({
        where: { ...filtroInst, tipo: "SAIDA" },
        _sum: { valor: true },
        _count: true,
      }),
      prisma.transacao.count({ where: filtroInst }),
    ]);

    const totalEntradas = Number(entradas._sum.valor ?? 0);
    const totalSaidas = Number(saidas._sum.valor ?? 0);
    const saldoCaixa = totalEntradas - totalSaidas;

    // Últimas 6 transações
    const ultimasTransacoes = await prisma.transacao.findMany({
      where: filtroInst,
      take: 6,
      orderBy: { data: "desc" },
      include: { anexos: true, categoria: true },
    });

    // Resumo por mês (últimos 6 meses)
    const seisMesesAtras = new Date();
    seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 5);
    seisMesesAtras.setDate(1);
    seisMesesAtras.setHours(0, 0, 0, 0);

    const transacoesPorMes = await prisma.transacao.findMany({
      where: { ...filtroInst, data: { gte: seisMesesAtras } },
      select: {
        data: true,
        valor: true,
        tipo: true,
      },
      orderBy: { data: "asc" },
    });

    // Agrupar por mês
    const meses: Record<string, { entradas: number; saidas: number }> = {};
    transacoesPorMes.forEach((t: { data: Date; valor: unknown; tipo: string }) => {
      const chave = `${t.data.getFullYear()}-${String(t.data.getMonth() + 1).padStart(2, "0")}`;
      if (!meses[chave]) meses[chave] = { entradas: 0, saidas: 0 };
      if (t.tipo === "ENTRADA") meses[chave].entradas += Number(t.valor);
      else meses[chave].saidas += Number(t.valor);
    });

    const graficoMensal = Object.entries(meses).map(([mes, valores]) => ({
      mes,
      ...valores,
    }));

    return NextResponse.json({
      totalEntradas,
      totalSaidas,
      saldoCaixa,
      contadorEntradas: entradas._count,
      contadorSaidas: saidas._count,
      totalTransacoes,
      ultimasTransacoes: ultimasTransacoes.map((t: { valor: unknown } & Record<string, unknown>) => ({
        ...t,
        valor: Number(t.valor),
      })),
      graficoMensal,
    });
  } catch (error) {
    console.error("Erro no dashboard:", error);
    return NextResponse.json({ error: "Erro ao carregar dashboard" }, { status: 500 });
  }
}
