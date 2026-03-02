"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Filter,
  X,
  ArrowUpCircle,
  ArrowDownCircle,
} from "lucide-react";
import TransacaoCard from "@/components/TransacaoCard";
import ModalConfirmacao from "@/components/ModalConfirmacao";

interface Transacao {
  id: string;
  titulo: string;
  observacao?: string | null;
  data: string;
  valor: number;
  tipo: "ENTRADA" | "SAIDA";
  anexos: Array<{ id: string; nomeOriginal: string; url: string; tipo: string }>;
  categoria?: { id: string; nome: string; cor: string } | null;
}

interface Paginacao {
  total: number;
  pagina: number;
  totalPaginas: number;
}

export default function TransacoesPage() {
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [paginacao, setPaginacao] = useState<Paginacao>({ total: 0, pagina: 1, totalPaginas: 1 });
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<"" | "ENTRADA" | "SAIDA">("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [pagina, setPagina] = useState(1);
  const [confirmandoId, setConfirmandoId] = useState<string | null>(null);
  const [deletandoId, setDeletandoId] = useState<string | null>(null);

  const carregarTransacoes = useCallback(async () => {
    setCarregando(true);
    try {
      const params = new URLSearchParams();
      if (filtroTipo) params.set("tipo", filtroTipo);
      if (busca) params.set("busca", busca);
      if (dataInicio) params.set("dataInicio", dataInicio);
      if (dataFim) params.set("dataFim", dataFim);
      params.set("pagina", String(pagina));
      params.set("porPagina", "20");

      const res = await fetch(`/api/transacoes?${params.toString()}`);
      const data = await res.json();
      setTransacoes(data.transacoes);
      setPaginacao({ total: data.total, pagina: data.pagina, totalPaginas: data.totalPaginas });
    } catch (err) {
      console.error("Erro ao carregar transações:", err);
    } finally {
      setCarregando(false);
    }
  }, [filtroTipo, busca, dataInicio, dataFim, pagina]);

  useEffect(() => {
    const timer = setTimeout(carregarTransacoes, 300);
    return () => clearTimeout(timer);
  }, [carregarTransacoes]);

  const handleDeletar = async (id: string) => {
    setDeletandoId(id);
    try {
      await fetch(`/api/transacoes/${id}`, { method: "DELETE" });
      await carregarTransacoes();
    } catch {
      alert("Erro ao excluir");
    } finally {
      setDeletandoId(null);
      setConfirmandoId(null);
    }
  };

  const limparFiltros = () => {
    setBusca("");
    setFiltroTipo("");
    setDataInicio("");
    setDataFim("");
    setPagina(1);
  };

  const temFiltros = busca || filtroTipo || dataInicio || dataFim;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Transações</h1>
          <p className="text-slate-500 text-sm">{paginacao.total} registros encontrados</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/transacoes/nova?tipo=ENTRADA"
            className="flex items-center gap-1.5 px-5 py-3 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 transition shadow-sm"
          >
            <Plus size={16} /> Entrada
          </Link>
          <Link
            href="/transacoes/nova?tipo=SAIDA"
            className="flex items-center gap-1.5 px-5 py-3 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition shadow-sm"
          >
            <Plus size={16} /> Saída
          </Link>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
          <Filter size={14} /> Filtros
          {temFiltros && (
            <button
              onClick={limparFiltros}
              className="ml-auto text-xs text-slate-400 hover:text-red-500 flex items-center gap-1 transition"
            >
              <X size={12} /> Limpar
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Busca */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={busca}
              onChange={(e) => { setBusca(e.target.value); setPagina(1); }}
              placeholder="Buscar..."
              className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 text-base outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400"
            />
          </div>

          {/* Tipo */}
          <select
            value={filtroTipo}
            onChange={(e) => { setFiltroTipo(e.target.value as "" | "ENTRADA" | "SAIDA"); setPagina(1); }}
            className="w-full px-3 py-3 rounded-xl border border-slate-200 text-base outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 bg-white"
          >
            <option value="">Todos os tipos</option>
            <option value="ENTRADA">Entradas</option>
            <option value="SAIDA">Saídas</option>
          </select>

          {/* Data início */}
          <div>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => { setDataInicio(e.target.value); setPagina(1); }}
              className="w-full px-3 py-3 rounded-xl border border-slate-200 text-base outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400"
            />
          </div>

          {/* Data fim */}
          <div>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => { setDataFim(e.target.value); setPagina(1); }}
              className="w-full px-3 py-3 rounded-xl border border-slate-200 text-base outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400"
            />
          </div>
        </div>

        {/* Filtro tipo - pills */}
        <div className="flex gap-2 flex-wrap">
          {(["", "ENTRADA", "SAIDA"] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setFiltroTipo(t); setPagina(1); }}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition border
                ${filtroTipo === t
                  ? t === "ENTRADA"
                    ? "bg-emerald-500 text-white border-emerald-500"
                    : t === "SAIDA"
                    ? "bg-red-500 text-white border-red-500"
                    : "bg-slate-700 text-white border-slate-700"
                  : "border-slate-200 text-slate-500 hover:bg-slate-50"
                }`}
            >
              {t === "ENTRADA" && <ArrowUpCircle size={11} />}
              {t === "SAIDA" && <ArrowDownCircle size={11} />}
              {t === "" ? "Todos" : t === "ENTRADA" ? "Entradas" : "Saídas"}
            </button>
          ))}
        </div>
      </div>

      {/* Lista */}
      {carregando ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : transacoes.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm">
          <p className="text-slate-400 text-sm mb-3">Nenhuma transação encontrada</p>
          {temFiltros && (
            <button onClick={limparFiltros} className="text-emerald-600 text-xs hover:underline">
              Limpar filtros
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {transacoes.map((t) => (
            <TransacaoCard key={t.id} transacao={t} onDeletar={(id) => setConfirmandoId(id)} />
          ))}
        </div>
      )}

      {/* Paginação */}
      {paginacao.totalPaginas > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            disabled={pagina === 1}
            onClick={() => setPagina((p) => p - 1)}
            className="px-5 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition"
          >
            Anterior
          </button>
          <span className="text-sm text-slate-500">
            {pagina} de {paginacao.totalPaginas}
          </span>
          <button
            disabled={pagina === paginacao.totalPaginas}
            onClick={() => setPagina((p) => p + 1)}
            className="px-5 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition"
          >
            Próximo
          </button>
        </div>
      )}

      {/* Modal confirmação */}
      {confirmandoId && (
        <ModalConfirmacao
          titulo="Excluir Transação"
          mensagem="Esta ação não pode ser desfeita. Todos os anexos também serão removidos."
          onConfirmar={() => handleDeletar(confirmandoId)}
          onCancelar={() => setConfirmandoId(null)}
          carregando={deletandoId === confirmandoId}
        />
      )}
    </div>
  );
}
