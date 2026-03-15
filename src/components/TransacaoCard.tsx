"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Paperclip,
  Pencil,
  Trash2,
  ChevronDown,
  FileText,
  Eye,
} from "lucide-react";

interface Anexo {
  id: string;
  nomeOriginal: string;
  url: string;
  tipo: string;
}

interface Categoria {
  id: string;
  nome: string;
  cor: string;
}

interface Transacao {
  id: string;
  titulo: string;
  observacao?: string | null;
  data: string;
  valor: number;
  tipo: "ENTRADA" | "SAIDA";
  anexos: Anexo[];
  categoria?: Categoria | null;
}

interface TransacaoCardProps {
  transacao: Transacao;
  onDeletar: (id: string) => void;
}

function formatarMoeda(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function TransacaoCard({ transacao, onDeletar }: TransacaoCardProps) {
  const [expandido, setExpandido] = useState(false);
  const isEntrada = transacao.tipo === "ENTRADA";

  return (
    <div className={`border-l-4 ${isEntrada ? "border-l-emerald-500" : "border-l-red-500"}`}>
      {/* Linha principal */}
      <div className="flex items-center gap-3 px-3 py-3 sm:py-2.5">
        {/* Data */}
        <p className="text-sm sm:text-xs text-slate-400 w-20 sm:w-16 flex-shrink-0 tabular-nums">
          {format(
            new Date(transacao.data.includes("T") ? transacao.data : transacao.data + "T12:00:00"),
            "dd/MM/yyyy",
            { locale: ptBR }
          )}
        </p>

        {/* Título + categoria */}
        <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2">
          <p className="text-base sm:text-sm font-medium text-slate-800 truncate">{transacao.titulo}</p>
          {transacao.categoria && (
            <span
              className="hidden sm:inline-flex items-center text-[10px] px-1.5 py-0.5 rounded font-medium flex-shrink-0"
              style={{ backgroundColor: transacao.categoria.cor + "1a", color: transacao.categoria.cor }}
            >
              {transacao.categoria.nome}
            </span>
          )}
        </div>

        {/* Anexos badge */}
        {transacao.anexos.length > 0 && (
          <span className="hidden sm:flex items-center gap-0.5 text-[10px] text-slate-400 flex-shrink-0">
            <Paperclip size={11} /> {transacao.anexos.length}
          </span>
        )}

        {/* Valor */}
        <p className={`text-base sm:text-sm font-bold flex-shrink-0 tabular-nums ${isEntrada ? "text-emerald-600" : "text-red-600"}`}>
          {isEntrada ? "+" : "-"}{formatarMoeda(transacao.valor)}
        </p>

        {/* Expandir */}
        <button
          onClick={() => setExpandido(!expandido)}
          className="p-1.5 sm:p-1 rounded text-slate-300 hover:text-slate-500 hover:bg-slate-100 transition flex-shrink-0"
        >
          <ChevronDown size={16} className={`transition-transform ${expandido ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* Detalhes expandidos */}
      {expandido && (
        <div className="px-3 pb-3 pt-1 border-t border-slate-100 bg-slate-50 space-y-2.5">
          {/* Categoria (mobile) */}
          {transacao.categoria && (
            <div className="sm:hidden">
              <span
                className="inline-flex items-center text-[10px] px-1.5 py-0.5 rounded font-medium"
                style={{ backgroundColor: transacao.categoria.cor + "1a", color: transacao.categoria.cor }}
              >
                {transacao.categoria.nome}
              </span>
            </div>
          )}

          {transacao.observacao && (
            <p className="text-xs text-slate-600 bg-white rounded-lg p-2.5 border border-slate-200">
              {transacao.observacao}
            </p>
          )}

          {transacao.anexos.length > 0 && (
            <div>
              <p className="text-[10px] font-medium text-slate-400 mb-1.5 flex items-center gap-1">
                <Paperclip size={10} /> {transacao.anexos.length} anexo{transacao.anexos.length > 1 ? "s" : ""}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {transacao.anexos.map((a) => (
                  <a
                    key={a.id}
                    href={a.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[11px] bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-600 hover:bg-slate-50 transition"
                  >
                    {a.tipo === "pdf" ? (
                      <FileText size={11} className="text-red-500" />
                    ) : (
                      <Eye size={11} className="text-emerald-500" />
                    )}
                    <span className="max-w-[120px] truncate">{a.nomeOriginal}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Link
              href={`/transacoes/${transacao.id}/editar`}
              className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-white transition"
            >
              <Pencil size={13} /> Editar
            </Link>
            <button
              onClick={() => onDeletar(transacao.id)}
              className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition"
            >
              <Trash2 size={13} /> Excluir
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
