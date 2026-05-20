import { ReactNode } from "react";

interface CardProps {
  titulo: string;
  valor: string;
  subtitulo?: string;
  icone: ReactNode;
  cor: "emerald" | "red" | "blue" | "slate";
  variacao?: string;
}

const coresMap = {
  emerald: {
    container: "bg-emerald-50 border-emerald-100",
    icone: "bg-emerald-500",
    valor: "text-emerald-700",
    titulo: "text-emerald-600",
  },
  red: {
    container: "bg-red-50 border-red-100",
    icone: "bg-red-500",
    valor: "text-red-700",
    titulo: "text-red-600",
  },
  blue: {
    container: "bg-blue-50 border-blue-100",
    icone: "bg-blue-500",
    valor: "text-blue-700",
    titulo: "text-blue-600",
  },
  slate: {
    container: "bg-slate-50 border-slate-200",
    icone: "bg-slate-700",
    valor: "text-slate-800",
    titulo: "text-slate-600",
  },
};

export default function CardResumo({ titulo, valor, subtitulo, icone, cor, variacao }: CardProps) {
  const cores = coresMap[cor];
  return (
    <div className={`rounded-2xl border p-5 flex items-start gap-4 ${cores.container}`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white flex-shrink-0 ${cores.icone}`}>
        {icone}
      </div>
      <div className="min-w-0">
        <p className={`text-xs font-semibold uppercase tracking-wide ${cores.titulo}`}>{titulo}</p>
        <p className={`text-2xl font-bold mt-1 ${cores.valor}`}>{valor}</p>
        {subtitulo && <p className="text-slate-500 text-xs mt-1">{subtitulo}</p>}
        {variacao && <p className="text-slate-400 text-xs mt-0.5">{variacao}</p>}
      </div>
    </div>
  );
}
