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
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriasFiltro, setCategoriasFiltro] = useState<Set<string>>(new Set());
  const [pagina, setPagina] = useState(1);
  const [confirmandoId, setConfirmandoId] = useState<string | null>(null);
  const [deletandoId, setDeletandoId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/categorias")
      .then((r) => r.json())
      .then((data) => setCategorias(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const toggleCategoria = (id: string) => {
    setCategoriasFiltro((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setPagina(1);
  };

  const carregarTransacoes = useCallback(async () => {
    setCarregando(true);
    try {
      const params = new URLSearchParams();
      if (filtroTipo) params.set("tipo", filtroTipo);
      if (busca) params.set("busca", busca);
      if (dataInicio) params.set("dataInicio", dataInicio);
      if (dataFim) params.set("dataFim", dataFim);
      if (categoriasFiltro.size > 0) params.set("categorias", [...categoriasFiltro].join(","));
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
  }, [filtroTipo, busca, dataInicio, dataFim, categoriasFiltro, pagina]);

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
    setCategoriasFiltro(new Set());
    setPagina(1);
  };

  const temFiltros = busca || filtroTipo || dataInicio || dataFim || categoriasFiltro.size > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Transações</h1>
          <p className="text-[#e5d3b9]/70 text-sm">{paginacao.total} registros encontrados</p>
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
      <div className="bg-[#054f54] rounded-2xl p-4 border border-[#e5d3b9]/10 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-[#e5d3b9]">
          <Filter size={14} /> Filtros
          {temFiltros && (
            <button
              onClick={limparFiltros}
              className="ml-auto text-xs text-[#e5d3b9]/50 hover:text-red-400 flex items-center gap-1 transition"
            >
              <X size={12} /> Limpar
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Busca */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#e5d3b9]/40" />
            <input
              type="text"
              value={busca}
              onChange={(e) => { setBusca(e.target.value); setPagina(1); }}
              placeholder="Buscar..."
              className="w-full pl-8 pr-4 py-3 rounded-xl border border-[#e5d3b9]/15 bg-[#065c62] text-white placeholder:text-[#e5d3b9]/30 text-base outline-none focus:ring-2 focus:ring-[#e5d3b9]/20 focus:border-[#e5d3b9]/40"
            />
          </div>

          {/* Tipo */}
          <select
            value={filtroTipo}
            onChange={(e) => { setFiltroTipo(e.target.value as "" | "ENTRADA" | "SAIDA"); setPagina(1); }}
            className="w-full px-3 py-3 rounded-xl border border-[#e5d3b9]/15 bg-[#065c62] text-white text-base outline-none focus:ring-2 focus:ring-[#e5d3b9]/20 focus:border-[#e5d3b9]/40"
          >
            <option value="">Todos os tipos</option>
            <option value="ENTRADA">Entradas</option>
            <option value="SAIDA">Saídas</option>
          </select>

          {/* Data início */}
          <div className="min-w-0">
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => { setDataInicio(e.target.value); setPagina(1); }}
              className="w-full max-w-full px-3 py-3 rounded-xl border border-[#e5d3b9]/15 bg-[#065c62] text-white text-base outline-none focus:ring-2 focus:ring-[#e5d3b9]/20 focus:border-[#e5d3b9]/40 [color-scheme:dark]"
            />
          </div>

          {/* Data fim */}
          <div className="min-w-0">
            <input
              type="date"
              value={dataFim}
              onChange={(e) => { setDataFim(e.target.value); setPagina(1); }}
              className="w-full max-w-full px-3 py-3 rounded-xl border border-[#e5d3b9]/15 bg-[#065c62] text-white text-base outline-none focus:ring-2 focus:ring-[#e5d3b9]/20 focus:border-[#e5d3b9]/40 [color-scheme:dark]"
            />
          </div>
        </div>

        {/* Pills de tipo */}
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
                    : "bg-[#065c62] text-white border-[#065c62]"
                  : "border-[#e5d3b9]/20 text-[#e5d3b9]/60 hover:bg-[#065c62] hover:text-white"
                }`}
            >
              {t === "ENTRADA" && <ArrowUpCircle size={11} />}
              {t === "SAIDA" && <ArrowDownCircle size={11} />}
              {t === "" ? "Todos" : t === "ENTRADA" ? "Entradas" : "Saídas"}
            </button>
          ))}
        </div>

        {/* Pills de categoria */}
        {categorias.length > 0 && (
          <div className="flex gap-2 flex-wrap pt-1 border-t border-[#e5d3b9]/10">
            {categorias.map((c) => {
              const ativa = categoriasFiltro.has(c.id);
              return (
                <button
                  key={c.id}
                  onClick={() => toggleCategoria(c.id)}
                  className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border transition"
                  style={
                    ativa
                      ? { backgroundColor: c.cor, borderColor: c.cor, color: "#fff" }
                      : { backgroundColor: c.cor + "15", borderColor: c.cor + "40", color: c.cor }
                  }
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: ativa ? "#fff" : c.cor }}
                  />
                  {c.nome}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Lista */}
      {carregando ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-[#054f54] rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : transacoes.length === 0 ? (
        <div className="bg-[#054f54] rounded-2xl p-12 text-center border border-[#e5d3b9]/10 shadow-sm">
          <p className="text-[#e5d3b9]/50 text-sm mb-3">Nenhuma transação encontrada</p>
          {temFiltros && (
            <button onClick={limparFiltros} className="text-emerald-400 text-xs hover:underline">
              Limpar filtros
            </button>
          )}
        </div>
      ) : (
        <div className="bg-[#054f54] rounded-2xl border border-[#e5d3b9]/15 shadow-sm overflow-hidden divide-y divide-[#e5d3b9]/10">
          {/* Cabeçalho da tabela - apenas desktop */}
          <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 bg-[#043f43] border-b border-[#e5d3b9]/10">
            <p className="text-[10px] font-semibold text-[#e5d3b9]/40 uppercase tracking-wide w-16 flex-shrink-0">Data</p>
            <p className="text-[10px] font-semibold text-[#e5d3b9]/40 uppercase tracking-wide flex-1">Descrição</p>
            <p className="text-[10px] font-semibold text-[#e5d3b9]/40 uppercase tracking-wide text-right">Valor</p>
            <div className="w-6" />
          </div>
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
            className="px-5 py-3 rounded-xl border border-[#e5d3b9]/15 bg-[#054f54] text-sm font-medium text-[#e5d3b9]/80 disabled:opacity-40 hover:bg-[#065c62] transition"
          >
            Anterior
          </button>
          <span className="text-sm text-[#e5d3b9]/60">
            {pagina} de {paginacao.totalPaginas}
          </span>
          <button
            disabled={pagina === paginacao.totalPaginas}
            onClick={() => setPagina((p) => p + 1)}
            className="px-5 py-3 rounded-xl border border-[#e5d3b9]/15 bg-[#054f54] text-sm font-medium text-[#e5d3b9]/80 disabled:opacity-40 hover:bg-[#065c62] transition"
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
