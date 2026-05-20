"use client";

import { AlertTriangle, X } from "lucide-react";

interface ModalConfirmacaoProps {
  titulo: string;
  mensagem: string;
  onConfirmar: () => void;
  onCancelar: () => void;
  carregando?: boolean;
}

export default function ModalConfirmacao({
  titulo,
  mensagem,
  onConfirmar,
  onCancelar,
  carregando = false,
}: ModalConfirmacaoProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancelar} />
      {/* Modal */}
      <div className="relative bg-[#054f54] border border-[#e5d3b9]/15 rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in fade-in zoom-in duration-200">
        <button
          onClick={onCancelar}
          className="absolute top-4 right-4 text-[#e5d3b9]/50 hover:text-white transition"
        >
          <X size={18} />
        </button>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-900/30 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={20} className="text-red-400" />
          </div>
          <h3 className="text-base font-semibold text-white">{titulo}</h3>
        </div>
        <p className="text-sm text-[#e5d3b9]/80 mb-6">{mensagem}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancelar}
            disabled={carregando}
            className="flex-1 py-4 rounded-xl border border-[#e5d3b9]/20 text-base font-medium text-[#e5d3b9] hover:bg-[#065c62] transition"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirmar}
            disabled={carregando}
            className="flex-1 py-4 rounded-xl bg-red-500 hover:bg-red-600 text-white text-base font-semibold transition disabled:opacity-60"
          >
            {carregando ? "Excluindo..." : "Excluir"}
          </button>
        </div>
      </div>
    </div>
  );
}
