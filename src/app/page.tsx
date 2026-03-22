"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowUpCircle,
  ArrowDownCircle,
  Wallet,
  TrendingUp,
  Plus,
  RefreshCw,
  FileDown,
} from "lucide-react";
import ExportModal from "@/components/ExportModal";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import GraficoMensal from "@/components/GraficoMensal";
import TransacaoCard from "@/components/TransacaoCard";
import ModalConfirmacao from "@/components/ModalConfirmacao";

interface DashboardData {
  totalEntradas: number;
  totalSaidas: number;
  saldoCaixa: number;
  contadorEntradas: number;
  contadorSaidas: number;
  totalTransacoes: number;
  ultimasTransacoes: Array<{
    id: string;
    titulo: string;
    observacao?: string | null;
    data: string;
    valor: number;
    tipo: "ENTRADA" | "SAIDA";
    anexos: Array<{ id: string; nomeOriginal: string; url: string; tipo: string }>;
    categoria?: { id: string; nome: string; cor: string } | null;
  }>;
  graficoMensal: Array<{ mes: string; entradas: number; saidas: number }>;
}

function formatarMoeda(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function DashboardPage() {
  const [dados, setDados] = useState<DashboardData | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [deletandoId, setDeletandoId] = useState<string | null>(null);
  const [confirmandoId, setConfirmandoId] = useState<string | null>(null);
  const [exportModalAberto, setExportModalAberto] = useState(false);

  const carregarDados = async () => {
    setCarregando(true);
    setErro(null);
    try {
      const res = await fetch("/api/dashboard");
      if (!res.ok) throw new Error("Erro ao carregar dados");
      const data = await res.json();
      setDados(data);
    } catch (e) {
      setErro("Não foi possível conectar ao servidor. Verifique a conexão com o banco de dados.");
      console.error(e);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleDeletar = async (id: string) => {
    setDeletandoId(id);
    try {
      await fetch(`/api/transacoes/${id}`, { method: "DELETE" });
      await carregarDados();
    } catch {
      alert("Erro ao excluir transação");
    } finally {
      setDeletandoId(null);
      setConfirmandoId(null);
    }
  };


  if (carregando) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-[#054f54] rounded-xl w-1/3" />
        <div className="space-y-3">
          <div className="h-32 bg-[#054f54] rounded-2xl" />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-24 bg-[#054f54] rounded-2xl" />
            <div className="h-24 bg-[#054f54] rounded-2xl" />
          </div>
        </div>
        <div className="h-80 bg-[#054f54] rounded-2xl" />
      </div>
    );
  }

  if (erro) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-16 h-16 rounded-full bg-red-900/30 flex items-center justify-center">
          <RefreshCw size={28} className="text-red-400" />
        </div>
        <p className="text-[#e5d3b9]/80 text-center max-w-sm">{erro}</p>
        <button
          onClick={carregarDados}
          className="px-6 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 transition"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Principal</h1>
          <p className="text-[#e5d3b9]/70 text-sm capitalize">
            {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
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

      {/* Exportar relatório */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setExportModalAberto(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#e5d3b9]/20 bg-[#054f54] text-sm font-medium text-[#e5d3b9] hover:bg-[#065c62] transition shadow-sm"
        >
          <FileDown size={15} className="text-emerald-400" />
          Exportar Relatório
        </button>
      </div>

      {exportModalAberto && <ExportModal onFechar={() => setExportModalAberto(false)} />}

      {/* Cards resumo */}
      <div className="space-y-3">
        {/* Saldo em Caixa — card hero */}
        <div className={`rounded-2xl p-5 md:p-6 border ${
          dados && dados.saldoCaixa >= 0
            ? "bg-gradient-to-br from-emerald-600 to-emerald-700 border-emerald-700"
            : "bg-gradient-to-br from-red-600 to-red-700 border-red-700"
        } text-white shadow-md`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <Wallet size={18} />
              </div>
              <span className="text-sm font-semibold uppercase tracking-wide opacity-90">Saldo em Caixa</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1 text-xs font-medium">
              <TrendingUp size={12} />
              {dados?.totalTransacoes ?? 0} transações
            </div>
          </div>
          <p className="text-4xl md:text-5xl font-bold tracking-tight">
            {formatarMoeda(dados?.saldoCaixa ?? 0)}
          </p>
          <p className="text-sm opacity-75 mt-1">Total disponível</p>
        </div>

        {/* Entradas e Saídas lado a lado */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-[#e5d3b9]/10 bg-[#054f54] p-4 md:p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
                <ArrowUpCircle size={16} />
              </div>
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">Entradas</span>
            </div>
            <p className="text-xl md:text-2xl font-bold text-emerald-300 leading-tight">
              {formatarMoeda(dados?.totalEntradas ?? 0)}
            </p>
            <p className="text-xs text-[#e5d3b9]/50 mt-1">{dados?.contadorEntradas ?? 0} lançamentos</p>
          </div>

          <div className="rounded-2xl border border-[#e5d3b9]/10 bg-[#054f54] p-4 md:p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400 flex-shrink-0">
                <ArrowDownCircle size={16} />
              </div>
              <span className="text-xs font-semibold text-red-400 uppercase tracking-wide">Saídas</span>
            </div>
            <p className="text-xl md:text-2xl font-bold text-red-300 leading-tight">
              {formatarMoeda(dados?.totalSaidas ?? 0)}
            </p>
            <p className="text-xs text-[#e5d3b9]/50 mt-1">{dados?.contadorSaidas ?? 0} lançamentos</p>
          </div>
        </div>
      </div>

      {/* Gráfico + Últimas transações */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Gráfico */}
        <div className="xl:col-span-2 bg-[#054f54] rounded-2xl p-6 shadow-sm border border-[#e5d3b9]/10">
          <h2 className="text-base font-semibold text-white mb-4">
            Entradas e Saídas — Últimos 6 meses
          </h2>
          <GraficoMensal dados={dados?.graficoMensal ?? []} />
        </div>

        {/* Últimas transações */}
        <div className="bg-[#054f54] rounded-2xl p-6 shadow-sm border border-[#e5d3b9]/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">Últimas Transações</h2>
            <Link href="/transacoes" className="text-xs text-[#e5d3b9] hover:underline font-medium">
              Ver todas
            </Link>
          </div>
          {dados?.ultimasTransacoes.length === 0 ? (
            <div className="text-center py-10 text-[#e5d3b9]/50 text-sm">
              <p className="mb-3">Nenhuma transação ainda</p>
              <Link
                href="/transacoes/nova?tipo=ENTRADA"
                className="text-emerald-400 hover:underline text-xs"
              >
                Adicionar primeira transação
              </Link>
            </div>
          ) : (
            <div className="rounded-xl border border-[#e5d3b9]/15 overflow-hidden divide-y divide-[#e5d3b9]/10">
              {dados?.ultimasTransacoes.map((t) => (
                <TransacaoCard
                  key={t.id}
                  transacao={t}
                  onDeletar={(id) => setConfirmandoId(id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmação */}
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
