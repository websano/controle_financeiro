"use client";

import { useState, useRef, useEffect } from "react";
import { X, FileDown, ImageDown, Loader2, Calendar, Tag } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Categoria {
  id: string;
  nome: string;
  cor: string;
}

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
  instituicao: { nome: string; cor: string } | null;
}

function fmt(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function fmtData(d: string) {
  return format(new Date(d.includes("T") ? d : d + "T12:00:00"), "dd/MM/yy");
}

interface ExportModalProps {
  onFechar: () => void;
}

export default function ExportModal({ onFechar }: ExportModalProps) {
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriasSelecionadas, setCategoriasSelecionadas] = useState<Set<string>>(new Set());
  const [dados, setDados] = useState<RelatorioData | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [exportando, setExportando] = useState<"png" | "pdf" | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const relatorioRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/categorias")
      .then((r) => r.json())
      .then((data) => setCategorias(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const toggleCategoria = (id: string) => {
    setCategoriasSelecionadas((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setDados(null);
  };

  const buscarRelatorio = async () => {
    setCarregando(true);
    setErro(null);
    try {
      const params = new URLSearchParams();
      if (dataInicio) params.set("dataInicio", dataInicio);
      if (dataFim) params.set("dataFim", dataFim);
      if (categoriasSelecionadas.size > 0) params.set("categorias", [...categoriasSelecionadas].join(","));
      const res = await fetch(`/api/relatorio?${params}`);
      if (!res.ok) throw new Error();
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
    return toPng(el, { pixelRatio: 2, backgroundColor: "#ffffff" });
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
    const f = (d: string) => format(new Date(d + "T12:00:00"), "dd/MM/yyyy");
    if (dataInicio && dataFim) return `${f(dataInicio)} até ${f(dataFim)}`;
    if (dataInicio) return `A partir de ${f(dataInicio)}`;
    return `Até ${f(dataFim!)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onFechar} />
      <div className="relative bg-white w-full sm:max-w-2xl max-h-[95vh] rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden">

        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-800">Exportar Relatório</h2>
          <button onClick={onFechar} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition">
            <X size={16} />
          </button>
        </div>

        {/* Filtros */}
        <div className="px-5 py-3 border-b border-slate-100 space-y-3">
          {/* Período */}
          <div>
            <div className="flex items-center gap-2 mb-2 text-xs font-medium text-slate-600">
              <Calendar size={12} /> Período
            </div>
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="text-[10px] text-slate-400 mb-0.5 block">Início</label>
                <input type="date" value={dataInicio}
                  onChange={(e) => { setDataInicio(e.target.value); setDados(null); }}
                  className="w-full px-2.5 py-2 rounded-lg border border-slate-200 text-xs outline-none focus:ring-1 focus:ring-emerald-300" />
              </div>
              <div className="flex-1">
                <label className="text-[10px] text-slate-400 mb-0.5 block">Fim</label>
                <input type="date" value={dataFim}
                  onChange={(e) => { setDataFim(e.target.value); setDados(null); }}
                  className="w-full px-2.5 py-2 rounded-lg border border-slate-200 text-xs outline-none focus:ring-1 focus:ring-emerald-300" />
              </div>
              <button onClick={buscarRelatorio} disabled={carregando}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold transition disabled:opacity-60 flex items-center gap-1.5 flex-shrink-0">
                {carregando ? <Loader2 size={12} className="animate-spin" /> : null}
                {carregando ? "Gerando..." : "Gerar"}
              </button>
            </div>
          </div>

          {/* Categorias */}
          {categorias.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2 text-xs font-medium text-slate-600">
                <Tag size={12} /> Categorias
                {categoriasSelecionadas.size > 0 && (
                  <button
                    onClick={() => { setCategoriasSelecionadas(new Set()); setDados(null); }}
                    className="ml-auto text-[10px] text-slate-400 hover:text-red-500 transition"
                  >
                    Limpar
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {categorias.map((c) => {
                  const ativa = categoriasSelecionadas.has(c.id);
                  return (
                    <button
                      key={c.id}
                      onClick={() => toggleCategoria(c.id)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition"
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
            </div>
          )}

          {erro && <p className="text-red-500 text-xs">{erro}</p>}
        </div>

        {/* Pré-visualização */}
        {dados && (
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">

            {/* Relatório capturável */}
            <div ref={relatorioRef} className="bg-white rounded-xl border border-slate-200 overflow-hidden">

              {/* Cabeçalho do relatório */}
              <div
                className="px-4 py-3 text-white"
                style={{ backgroundColor: dados.instituicao?.cor ?? "#1e293b" }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    {dados.instituicao && (
                      <p className="text-xs font-semibold uppercase tracking-widest opacity-80 mb-0.5">
                        {dados.instituicao.nome}
                      </p>
                    )}
                    <p className="font-bold text-base leading-tight">Relatório Financeiro</p>
                    <p className="text-white/70 text-xs mt-0.5">{labelPeriodo()}</p>
                  </div>
                  <p className="text-white/60 text-[11px] flex-shrink-0">
                    {format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                  </p>
                </div>
              </div>

              {/* Resumo em linha */}
              <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100">
                <div className="px-3 py-2.5 text-center">
                  <p className="text-[10px] uppercase tracking-wide text-emerald-600 font-semibold mb-1">Entradas</p>
                  <p className="font-bold text-emerald-700 text-sm leading-none">{fmt(dados.totalEntradas)}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{dados.contadorEntradas} lançamentos</p>
                </div>
                <div className="px-3 py-2.5 text-center">
                  <p className="text-[10px] uppercase tracking-wide text-red-500 font-semibold mb-1">Saídas</p>
                  <p className="font-bold text-red-600 text-sm leading-none">{fmt(dados.totalSaidas)}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{dados.contadorSaidas} lançamentos</p>
                </div>
                <div className={`px-3 py-2.5 text-center ${dados.saldoCaixa >= 0 ? "bg-emerald-50" : "bg-red-50"}`}>
                  <p className="text-[10px] uppercase tracking-wide text-slate-600 font-semibold mb-1">Saldo</p>
                  <p className={`font-bold text-sm leading-none ${dados.saldoCaixa >= 0 ? "text-emerald-700" : "text-red-600"}`}>
                    {fmt(dados.saldoCaixa)}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">{dados.totalTransacoes} transações</p>
                </div>
              </div>

              {/* Por categoria */}
              {dados.porCategoria.length > 0 && (
                <div className="border-b border-slate-100 px-3 py-2.5">
                  <p className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold mb-2">Por Categoria</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    {dados.porCategoria.map((c, i) => (
                      <div key={i} className="flex items-center justify-between py-0.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: c.cor }} />
                          <span className="text-slate-700 truncate text-xs">{c.nome}</span>
                          <span className="text-slate-400 text-[10px] flex-shrink-0">({c.count})</span>
                        </div>
                        <span className="font-semibold text-slate-800 text-xs flex-shrink-0 ml-2">{fmt(c.total)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tabela de transações */}
              <div className="px-3 py-2.5">
                <p className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold mb-2">
                  Transações do período ({dados.transacoes.length})
                </p>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left text-[10px] text-slate-400 font-semibold pb-1.5 w-14">Data</th>
                      <th className="text-left text-[10px] text-slate-400 font-semibold pb-1.5">Descrição</th>
                      <th className="text-left text-[10px] text-slate-400 font-semibold pb-1.5">Categoria</th>
                      <th className="text-right text-[10px] text-slate-400 font-semibold pb-1.5 w-24">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dados.transacoes.map((t, i) => (
                      <tr key={t.id} className={i % 2 === 0 ? "bg-slate-50/60" : ""}>
                        <td className="py-1 pr-2 text-[11px] text-slate-400 whitespace-nowrap">{fmtData(t.data)}</td>
                        <td className="py-1 pr-2 text-[11px] text-slate-700 max-w-0">
                          <span className="block truncate">{t.titulo}</span>
                        </td>
                        <td className="py-1 pr-2">
                          {t.categoria ? (
                            <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ backgroundColor: t.categoria.cor + "22", color: t.categoria.cor }}>
                              {t.categoria.nome}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-300">—</span>
                          )}
                        </td>
                        <td className={`py-1 text-right text-[11px] font-semibold whitespace-nowrap ${t.tipo === "ENTRADA" ? "text-emerald-600" : "text-red-500"}`}>
                          {t.tipo === "ENTRADA" ? "+" : "-"}{fmt(t.valor)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>

            {/* Botões de exportação */}
            <div className="flex gap-2 pb-1">
              <button onClick={exportarPNG} disabled={exportando !== null}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50">
                {exportando === "png" ? <Loader2 size={13} className="animate-spin" /> : <ImageDown size={13} className="text-blue-500" />}
                Salvar PNG
              </button>
              <button onClick={exportarPDF} disabled={exportando !== null}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-semibold transition disabled:opacity-50">
                {exportando === "pdf" ? <Loader2 size={13} className="animate-spin" /> : <FileDown size={13} />}
                Salvar PDF
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
