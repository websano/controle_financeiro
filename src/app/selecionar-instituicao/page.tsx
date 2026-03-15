"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";

interface Instituicao {
  id: string;
  nome: string;
  slug: string;
  cor: string;
}

export default function SelecionarInstituicaoPage() {
  const router = useRouter();
  const [instituicoes, setInstituicoes] = useState<Instituicao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [selecionando, setSelecionando] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/instituicoes")
      .then((r) => r.json())
      .then((data) => setInstituicoes(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setCarregando(false));
  }, []);

  const selecionar = async (id: string) => {
    setSelecionando(id);
    try {
      const res = await fetch("/api/auth/instituicao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instituicaoId: id }),
      });
      if (res.ok) router.push("/");
    } finally {
      setSelecionando(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col items-center justify-center p-6">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-10">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg overflow-hidden">
          <img src="/images/icon_logo.png" alt="Logo" width={36} height={36} className="object-contain" />
        </div>
        <div>
          <h1 className="font-bold text-2xl text-slate-800 leading-tight">Finanças Libélula</h1>
          <p className="text-slate-500 text-sm">Controle Financeiro</p>
        </div>
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold text-slate-800">Selecione a instituição</h2>
          <p className="text-slate-500 text-sm mt-1">
            Os registros financeiros serão vinculados à instituição escolhida
          </p>
        </div>

        {carregando ? (
          <div className="flex justify-center py-12">
            <Loader2 size={28} className="animate-spin text-slate-400" />
          </div>
        ) : (
          <div className="space-y-4">
            {instituicoes.map((inst) => {
              const eSelecionando = selecionando === inst.id;
              return (
                <button
                  key={inst.id}
                  onClick={() => selecionar(inst.id)}
                  disabled={selecionando !== null}
                  className="w-full bg-white rounded-2xl border-2 p-6 text-left transition-all hover:shadow-md active:scale-[0.99] disabled:opacity-60 group"
                  style={{ borderColor: eSelecionando ? inst.cor : "transparent",
                    boxShadow: eSelecionando ? `0 0 0 3px ${inst.cor}22` : undefined }}
                >
                  <div className="flex items-center gap-4">
                    {/* Ícone */}
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 text-white text-2xl font-bold shadow-sm transition-transform group-hover:scale-105"
                      style={{ backgroundColor: inst.cor }}
                    >
                      {inst.nome.charAt(0)}
                    </div>

                    {/* Nome */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 text-base leading-tight">
                        {inst.nome}
                      </p>
                      <div
                        className="inline-block mt-1.5 w-8 h-1 rounded-full"
                        style={{ backgroundColor: inst.cor }}
                      />
                    </div>

                    {/* Status */}
                    {eSelecionando ? (
                      <Loader2 size={22} className="animate-spin flex-shrink-0" style={{ color: inst.cor }} />
                    ) : (
                      <CheckCircle2
                        size={22}
                        className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ color: inst.cor }}
                      />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <p className="mt-10 text-xs text-slate-400">
        Você pode trocar de instituição a qualquer momento pelo menu lateral
      </p>
    </div>
  );
}
