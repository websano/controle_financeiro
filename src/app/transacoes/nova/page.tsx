"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import TransacaoForm from "@/components/TransacaoForm";

function NovaTransacaoContent() {
  const searchParams = useSearchParams();
  const tipo = (searchParams.get("tipo") as "ENTRADA" | "SAIDA") ?? "ENTRADA";

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/transacoes"
          className="p-3 rounded-xl border border-[#e5d3b9]/20 text-[#e5d3b9]/60 hover:bg-[#054f54] hover:text-white transition"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">
            Nova {tipo === "ENTRADA" ? "Entrada" : "Saída"}
          </h1>
          <p className="text-[#e5d3b9]/70 text-sm">
            {tipo === "ENTRADA"
              ? "Registrar uma nova receita ou entrada financeira"
              : "Registrar uma nova despesa ou saída financeira"}
          </p>
        </div>
      </div>

      {/* Formulário */}
      <div className="bg-[#054f54] rounded-2xl p-4 md:p-6 shadow-sm border border-[#e5d3b9]/10">
        <TransacaoForm key={tipo} modo="criar" dadosIniciais={{ tipo }} />
      </div>
    </div>
  );
}

export default function NovaTransacaoPage() {
  return (
    <Suspense fallback={<div className="h-96 bg-[#054f54] rounded-2xl animate-pulse" />}>
      <NovaTransacaoContent />
    </Suspense>
  );
}
