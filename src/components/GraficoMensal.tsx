"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface DadosMes {
  mes: string;
  entradas: number;
  saidas: number;
}

interface GraficoMensalProps {
  dados: DadosMes[];
}

const mesesAbrev: Record<string, string> = {
  "01": "Jan", "02": "Fev", "03": "Mar", "04": "Abr",
  "05": "Mai", "06": "Jun", "07": "Jul", "08": "Ago",
  "09": "Set", "10": "Out", "11": "Nov", "12": "Dez",
};

function formatarMoedaCurta(v: number) {
  if (v >= 1000) return `R$ ${(v / 1000).toFixed(1)}k`;
  return `R$ ${v.toFixed(0)}`;
}

export default function GraficoMensal({ dados }: GraficoMensalProps) {
  const dadosFormatados = dados.map((d) => {
    const partes = d.mes.split("-");
    const mesAbrev = mesesAbrev[partes[1]] ?? partes[1];
    return {
      ...d,
      nome: `${mesAbrev}/${partes[0]?.slice(2)}`,
    };
  });

  if (dados.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-[#e5d3b9]/40 text-sm">
        Nenhum dado disponível para o período
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={dadosFormatados} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#065c62" />
        <XAxis dataKey="nome" tick={{ fontSize: 12, fill: "#e5d3b9", opacity: 0.6 }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={formatarMoedaCurta} tick={{ fontSize: 11, fill: "#e5d3b9", opacity: 0.6 }} axisLine={false} tickLine={false} />
        <Tooltip
          formatter={(v: number | undefined, name: string | undefined) => [
            typeof v === "number"
              ? v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
              : "R$ 0,00",
            name === "entradas" ? "Entradas" : "Saídas",
          ]}
          contentStyle={{
            borderRadius: "12px",
            border: "1px solid rgba(229,211,185,0.2)",
            backgroundColor: "#032e31",
            color: "#ffffff",
            fontSize: "13px",
          }}
          labelStyle={{ color: "#e5d3b9" }}
        />
        <Legend
          formatter={(v) => (v === "entradas" ? "Entradas" : "Saídas")}
          wrapperStyle={{ fontSize: "13px", color: "#e5d3b9", opacity: 0.7 }}
        />
        <Bar dataKey="entradas" fill="#10b981" radius={[6, 6, 0, 0]} />
        <Bar dataKey="saidas" fill="#f87171" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
