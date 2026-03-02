"use client";

import { useState, useRef } from "react";
import { X, FileDown, ImageDown, Loader2, Calendar, TrendingUp, ArrowUpCircle, ArrowDownCircle, Wallet } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface RelatorioData {
  totalEntradas: number;
  totalSaidas: number;
  saldoCaixa: number;
  contadorEntradas: number;
  contadorSaidas: number;
  totalTransacoes: number;
  porCategoria: Array<{ nome: string; cor: string; total: number; count: number }>;
  transacoes: Array<{ id: string; titulo: string; valor: number; tipo: string; data: string; categoria?: { nome: string; cor: string } | null }>;
  periodo: { dataInicio: string | null; dataFim: string | null };
}

function formatarMoeda(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

interface ExportModalProps {
  onFechar: () => void;
}

export default function ExportModal({ onFechar }: ExportModalProps) {
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [dados, setDados] = useState<RelatorioData | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [exportando, setExportando] = useState<"png" | "pdf" | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const relatorioRef = useRef<HTMLDivElement>(null);

  const buscarRelatorio = async () => {
    setCarregando(true);
    setErro(null);
    try {
      const params = new URLSearchParams();
      if (dataInicio) params.set("dataInicio", dataInicio);
      if (dataFim) params.set("dataFim", dataFim);
      const res = await fetch(`/api/relatorio?${params}`);
      if (!res.ok) throw new Error("Erro ao buscar relatório");
      setDados(await res.json());
    } catch {
      setErro("Não foi possível gerar o relatório");
    } finally {
      setCarregando(false);
    }
  };

  const capturar = async () => {
    const { toPng } = await import("html-to-image");
    const el = relatorioRef.current;
    if (!el) return null;
    return toPng(el, { pixelRatio: 2, backgroundColor: "#f1f5f9" });
  };

  const exportarPNG = async () => {
    setExportando("png");
    try {
      const dataUrl = await capturar();
      if (!dataUrl) return;
      const link = document.createElement("a");
      link.download = `relatorio-${dataInicio || "tudo"}-${dataFim || "tudo"}.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      setExportando(null);
    }
  };

  const exportarPDF = async () => {
    setExportando("pdf");
    try {
      const dataUrl = await capturar();
      if (!dataUrl) return;
      const { jsPDF } = await import("jspdf");
      const img = new Image();
      img.src = dataUrl;
      await new Promise((r) => (img.onload = r));
      const pdfW = 210;
      const pdfH = (img.height * pdfW) / img.width;
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageH = pdf.internal.pageSize.getHeight();
      let posY = 0;
      while (posY < pdfH) {
        if (posY > 0) pdf.addPage();
        pdf.addImage(dataUrl, "PNG", 0, -posY, pdfW, pdfH);
        posY += pageH;
      }
      pdf.save(`relatorio-${dataInicio || "tudo"}-${dataFim || "tudo"}.pdf`);
    } finally {
      setExportando(null);
    }
  };

  const labelPeriodo = () => {
    if (!dataInicio && !dataFim) return "Todo o período";
    const fmt = (d: string) => format(new Date(d + "T12:00:00"), "dd/MM/yyyy");
    if (dataInicio && dataFim) return `${fmt(dataInicio)} até ${fmt(dataFim)}`;
    if (dataInicio) return `A partir de ${fmt(dataInicio)}`;
    return `Até ${fmt(dataFim!)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onFechar} />
      <div className="relative bg-white w-full sm:max-w-2xl max-h-[95vh] rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-800">Exportar Relatório</h2>
            <p className="text-xs text-slate-500 mt-0.5">Escolha o período e o formato</p>
          </div>
          <button onClick={onFechar} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition">
            <X size={18} />
          </button>
        </div>

        {/* Filtros de período */}
        <div className="px-5 py-4 border-b border-slate-100 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
            <Calendar size={14} /> Período do relatório
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Data inicial</label>
              <input
                type="date"
                value={dataInicio}
                onChange={(e) => { setDataInicio(e.target.value); setDados(null); }}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Data final</label>
              <input
                type="date"
                value={dataFim}
                onChange={(e) => { setDataFim(e.target.value); setDados(null); }}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400"
              />
            </div>
          </div>
          <button
            onClick={buscarRelatorio}
            disabled={carregando}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {carregando ? <><Loader2 size={15} className="animate-spin" /> Gerando...</> : "Gerar Pré-visualização"}
          </button>
          {erro && <p className="text-red-500 text-xs">{erro}</p>}
        </div>

        {/* Pré-visualização */}
        {dados && (
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            <div ref={relatorioRef} className="bg-slate-50 rounded-2xl p-5 space-y-4">
              {/* Cabeçalho do relatório */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Relatório Financeiro</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{labelPeriodo()}</p>
                </div>
                <p className="text-xs text-slate-400">{format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}</p>
              </div>

              {/* Cards resumo */}
              <div className="grid grid-cols-1 gap-3">
                <div className={`rounded-2xl p-4 border ${dados.saldoCaixa >= 0 ? "bg-gradient-to-r from-emerald-500 to-emerald-600" : "bg-gradient-to-r from-red-500 to-red-600"} text-white`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Wallet size={16} />
                    <span className="text-xs font-semibold uppercase tracking-wide opacity-90">Saldo do período</span>
                  </div>
                  <p className="text-3xl font-bold">{formatarMoeda(dados.saldoCaixa)}</p>
                  <p className="text-xs opacity-75 mt-0.5">{dados.totalTransacoes} transações</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <ArrowUpCircle size={14} className="text-emerald-600" />
                      <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">Entradas</span>
                    </div>
                    <p className="text-xl font-bold text-emerald-700">{formatarMoeda(dados.totalEntradas)}</p>
                    <p className="text-xs text-slate-500">{dados.contadorEntradas} lançamentos</p>
                  </div>
                  <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <ArrowDownCircle size={14} className="text-red-500" />
                      <span className="text-xs font-semibold text-red-500 uppercase tracking-wide">Saídas</span>
                    </div>
                    <p className="text-xl font-bold text-red-600">{formatarMoeda(dados.totalSaidas)}</p>
                    <p className="text-xs text-slate-500">{dados.contadorSaidas} lançamentos</p>
                  </div>
                </div>
              </div>

              {/* Por categoria */}
              {dados.porCategoria.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Por Categoria</p>
                  <div className="space-y-2">
                    {dados.porCategoria.map((c, i) => (
                      <div key={i} className="flex items-center justify-between bg-white rounded-xl px-3 py-2.5 border border-slate-100">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: c.cor }} />
                          <span className="text-sm text-slate-700">{c.nome}</span>
                          <span className="text-xs text-slate-400">({c.count})</span>
                        </div>
                        <span className="text-sm font-semibold text-slate-800">{formatarMoeda(c.total)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Últimas transações */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={14} className="text-slate-500" />
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Transações do período</p>
                </div>
                <div className="space-y-1.5 max-h-64 overflow-y-auto">
                  {dados.transacoes.map((t) => (
                    <div key={t.id} className="flex items-center justify-between bg-white rounded-xl px-3 py-2 border border-slate-100">
                      <div className="min-w-0">
                        <p className="text-sm text-slate-700 font-medium truncate">{t.titulo}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-slate-400">
                            {format(new Date(t.data.includes("T") ? t.data : t.data + "T12:00:00"), "dd/MM/yyyy")}
                          </p>
                          {t.categoria && (
                            <span className="text-xs px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: t.categoria.cor + "22", color: t.categoria.cor }}>
                              {t.categoria.nome}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className={`text-sm font-bold flex-shrink-0 ${t.tipo === "ENTRADA" ? "text-emerald-600" : "text-red-500"}`}>
                        {t.tipo === "ENTRADA" ? "+" : "-"}{formatarMoeda(t.valor)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Botões de exportação */}
            <div className="flex gap-3 pb-2">
              <button
                onClick={exportarPNG}
                disabled={exportando !== null}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50 shadow-sm"
              >
                {exportando === "png" ? <Loader2 size={16} className="animate-spin" /> : <ImageDown size={16} className="text-blue-500" />}
                Salvar PNG
              </button>
              <button
                onClick={exportarPDF}
                disabled={exportando !== null}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition disabled:opacity-50 shadow-sm"
              >
                {exportando === "pdf" ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />}
                Salvar PDF
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
