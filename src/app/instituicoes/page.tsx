"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Building2, Check, X } from "lucide-react";
import ModalConfirmacao from "@/components/ModalConfirmacao";

interface Instituicao {
  id: string;
  nome: string;
  slug: string;
  cor: string;
  _count: { transacoes: number };
}

const CORES_PRESET = [
  "#10b981", "#f59e0b", "#3b82f6", "#8b5cf6", "#ec4899",
  "#ef4444", "#06b6d4", "#84cc16", "#f97316", "#6366f1",
];

export default function InstituicoesPage() {
  const [instituicoes, setInstituicoes] = useState<Instituicao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [novoNome, setNovoNome] = useState("");
  const [novaCor, setNovaCor] = useState(CORES_PRESET[0]);
  const [salvando, setSalvando] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editNome, setEditNome] = useState("");
  const [editCor, setEditCor] = useState("");
  const [confirmandoId, setConfirmandoId] = useState<string | null>(null);
  const [deletando, setDeletando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = async () => {
    setCarregando(true);
    try {
      const res = await fetch("/api/instituicoes");
      const data = await res.json();
      setInstituicoes(Array.isArray(data) ? data : []);
    } catch {
      setInstituicoes([]);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  const criar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoNome.trim()) return;
    setSalvando(true);
    setErro(null);
    try {
      const res = await fetch("/api/instituicoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: novoNome.trim(), cor: novaCor }),
      });
      if (!res.ok) {
        const d = await res.json();
        setErro(d.error ?? "Erro ao criar");
      } else {
        setNovoNome("");
        setNovaCor(CORES_PRESET[0]);
        carregar();
      }
    } finally {
      setSalvando(false);
    }
  };

  const salvarEdicao = async (id: string) => {
    if (!editNome.trim()) return;
    await fetch(`/api/instituicoes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome: editNome.trim(), cor: editCor }),
    });
    setEditandoId(null);
    carregar();
  };

  const deletar = async (id: string) => {
    setDeletando(true);
    await fetch(`/api/instituicoes/${id}`, { method: "DELETE" });
    setDeletando(false);
    setConfirmandoId(null);
    carregar();
  };

  const confirmandoInst = instituicoes.find((i) => i.id === confirmandoId);

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Instituições</h1>
        <p className="text-[#e5d3b9]/70 text-sm mt-0.5">Gerencie as instituições do sistema</p>
      </div>

      {/* Formulário de criação */}
      <div className="bg-[#054f54] rounded-2xl p-5 shadow-sm border border-[#e5d3b9]/10">
        <h2 className="text-sm font-semibold text-[#e5d3b9] mb-4 flex items-center gap-2">
          <Plus size={15} className="text-emerald-400" /> Nova instituição
        </h2>
        <form onSubmit={criar} className="space-y-4">
          <div>
            <label className="text-xs text-[#e5d3b9]/70 mb-1 block">Nome</label>
            <input
              type="text"
              value={novoNome}
              onChange={(e) => { setNovoNome(e.target.value); setErro(null); }}
              placeholder="Ex: Balas de Coco, Minha Loja..."
              className="w-full px-4 py-3 rounded-xl border border-[#e5d3b9]/15 bg-[#065c62] text-white placeholder:text-[#e5d3b9]/30 text-base outline-none focus:ring-2 focus:ring-[#e5d3b9]/20 focus:border-[#e5d3b9]/40"
            />
          </div>
          <div>
            <label className="text-xs text-[#e5d3b9]/70 mb-2 block">Cor</label>
            <div className="flex flex-wrap gap-2">
              {CORES_PRESET.map((cor) => (
                <button
                  key={cor}
                  type="button"
                  onClick={() => setNovaCor(cor)}
                  className="w-9 h-9 rounded-xl border-2 transition flex items-center justify-center"
                  style={{ backgroundColor: cor, borderColor: novaCor === cor ? "#e5d3b9" : "transparent" }}
                >
                  {novaCor === cor && <Check size={14} className="text-white" strokeWidth={3} />}
                </button>
              ))}
            </div>
          </div>
          {erro && <p className="text-red-400 text-xs">{erro}</p>}
          <button
            type="submit"
            disabled={salvando || !novoNome.trim()}
            className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold transition disabled:opacity-50"
          >
            {salvando ? "Salvando..." : "Criar instituição"}
          </button>
        </form>
      </div>

      {/* Lista */}
      <div className="bg-[#054f54] rounded-2xl shadow-sm border border-[#e5d3b9]/10 overflow-hidden">
        <div className="px-5 py-4 border-b border-[#e5d3b9]/10 flex items-center gap-2">
          <Building2 size={15} className="text-[#e5d3b9]/60" />
          <h2 className="text-sm font-semibold text-[#e5d3b9]">Instituições cadastradas</h2>
          <span className="ml-auto text-xs text-[#e5d3b9]/60 bg-[#065c62] px-2 py-0.5 rounded-full">
            {instituicoes.length}
          </span>
        </div>

        {carregando ? (
          <div className="divide-y divide-[#e5d3b9]/10">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="px-5 py-4 flex items-center gap-3 animate-pulse">
                <div className="w-10 h-10 rounded-xl bg-[#065c62]" />
                <div className="flex-1 h-4 bg-[#065c62] rounded-lg" />
              </div>
            ))}
          </div>
        ) : instituicoes.length === 0 ? (
          <div className="py-12 text-center text-[#e5d3b9]/50 text-sm">
            Nenhuma instituição cadastrada ainda
          </div>
        ) : (
          <div className="divide-y divide-[#e5d3b9]/10">
            {instituicoes.map((inst) => (
              <div key={inst.id} className="px-5 py-3.5 flex items-center gap-3">
                {editandoId === inst.id ? (
                  <>
                    <div className="flex flex-wrap gap-1.5">
                      {CORES_PRESET.map((cor) => (
                        <button
                          key={cor}
                          type="button"
                          onClick={() => setEditCor(cor)}
                          className="w-7 h-7 rounded-lg border-2 transition flex items-center justify-center"
                          style={{ backgroundColor: cor, borderColor: editCor === cor ? "#e5d3b9" : "transparent" }}
                        >
                          {editCor === cor && <Check size={11} className="text-white" strokeWidth={3} />}
                        </button>
                      ))}
                    </div>
                    <input
                      value={editNome}
                      onChange={(e) => setEditNome(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl border border-[#e5d3b9]/15 bg-[#065c62] text-white text-sm outline-none focus:ring-2 focus:ring-[#e5d3b9]/20"
                      autoFocus
                    />
                    <button
                      onClick={() => salvarEdicao(inst.id)}
                      className="p-2 text-emerald-400 hover:bg-[#065c62] rounded-lg transition"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={() => setEditandoId(null)}
                      className="p-2 text-[#e5d3b9]/50 hover:bg-[#065c62] rounded-lg transition"
                    >
                      <X size={16} />
                    </button>
                  </>
                ) : (
                  <>
                    <div
                      className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-white font-bold text-lg shadow-sm"
                      style={{ backgroundColor: inst.cor }}
                    >
                      {inst.nome.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">{inst.nome}</p>
                      <p className="text-xs text-[#e5d3b9]/50">{inst._count.transacoes} transações</p>
                    </div>
                    <button
                      onClick={() => { setEditandoId(inst.id); setEditNome(inst.nome); setEditCor(inst.cor); }}
                      className="p-2 text-[#e5d3b9]/40 hover:text-white hover:bg-[#065c62] rounded-lg transition"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => setConfirmandoId(inst.id)}
                      className="p-2 text-[#e5d3b9]/40 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition"
                    >
                      <Trash2 size={15} />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {confirmandoId && (
        <ModalConfirmacao
          titulo="Excluir instituição"
          mensagem={
            confirmandoInst && confirmandoInst._count.transacoes > 0
              ? `Esta instituição possui ${confirmandoInst._count.transacoes} transações vinculadas. Excluí-la removerá o vínculo de todas elas.`
              : "Deseja realmente excluir esta instituição?"
          }
          onConfirmar={() => deletar(confirmandoId)}
          onCancelar={() => setConfirmandoId(null)}
          carregando={deletando}
        />
      )}
    </div>
  );
}
