"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArrowUpCircle,
  ArrowDownCircle,
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
    <div className={`rounded-2xl border overflow-hidden transition-all ${isEntrada ? "border-emerald-100 bg-emerald-50/30" : "border-red-100 bg-red-50/30"}`}>
      <div className="flex items-center gap-3 p-4">
        {/* Ícone tipo */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isEntrada ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"}`}>
          {isEntrada ? <ArrowUpCircle size={20} /> : <ArrowDownCircle size={20} />}
        </div>

        {/* Conteúdo */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">{transacao.titulo}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-xs text-slate-500">
                  {format(new Date(transacao.data.includes("T") ? transacao.data : transacao.data + "T12:00:00"), "dd/MM/yyyy", { locale: ptBR })}
                </p>
                {transacao.categoria && (
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: transacao.categoria.cor + "22", color: transacao.categoria.cor }}>
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: transacao.categoria.cor }} />
                    {transacao.categoria.nome}
                  </span>
                )}
              </div>
            </div>
            <p className={`text-base font-bold flex-shrink-0 ${isEntrada ? "text-emerald-600" : "text-red-600"}`}>
              {isEntrada ? "+" : "-"}{formatarMoeda(transacao.valor)}
            </p>
          </div>
        </div>

        {/* Ações */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {transacao.anexos.length > 0 && (
            <span className="text-xs text-slate-400 flex items-center gap-0.5">
              <Paperclip size={12} />
              {transacao.anexos.length}
            </span>
          )}
          <button
            onClick={() => setExpandido(!expandido)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <ChevronDown size={16} className={`transition-transform ${expandido ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>

      {/* Detalhes expandidos */}
      {expandido && (
        <div className="px-4 pb-4 border-t border-slate-100 pt-3 space-y-3">
          {transacao.observacao && (
            <p className="text-sm text-slate-600 bg-white rounded-xl p-3 border border-slate-100">
              {transacao.observacao}
            </p>
          )}

          {/* Anexos */}
          {transacao.anexos.length > 0 && (
            <div>
              <p className="text-xs font-medium text-slate-500 mb-2 flex items-center gap-1">
                <Paperclip size={12} /> Anexos ({transacao.anexos.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {transacao.anexos.map((a) => (
                  <a
                    key={a.id}
                    href={a.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-600 hover:bg-slate-50 transition"
                  >
                    {a.tipo === "pdf" ? (
                      <FileText size={12} className="text-red-500" />
                    ) : (
                      <Eye size={12} className="text-emerald-500" />
                    )}
                    <span className="max-w-[120px] truncate">{a.nomeOriginal}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Ações */}
          <div className="flex gap-2 pt-1">
            <Link
              href={`/transacoes/${transacao.id}/editar`}
              className="flex items-center gap-2 text-sm px-4 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
            >
              <Pencil size={15} /> Editar
            </Link>
            <button
              onClick={() => onDeletar(transacao.id)}
              className="flex items-center gap-2 text-sm px-4 py-3 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 transition"
            >
              <Trash2 size={15} /> Excluir
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
