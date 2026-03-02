"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import TransacaoForm from "@/components/TransacaoForm";

interface Anexo {
  id: string;
  nomeOriginal: string;
  url: string;
  tipo: string;
  tamanho: number;
}

interface Transacao {
  id: string;
  titulo: string;
  observacao?: string | null;
  data: string;
  valor: number;
  tipo: "ENTRADA" | "SAIDA";
  categoriaId?: string | null;
  anexos: Anexo[];
}

export default function EditarTransacaoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [id, setId] = useState<string | null>(null);
  const [transacao, setTransacao] = useState<Transacao | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    params.then(({ id: paramId }) => setId(paramId));
  }, [params]);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/transacoes/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Transação não encontrada");
        return r.json();
      })
      .then((data) => {
        setTransacao(data);
        setCarregando(false);
      })
      .catch((e) => {
        setErro(e.message);
        setCarregando(false);
      });
  }, [id]);

  if (carregando) {
    return <div className="h-96 bg-slate-200 rounded-2xl animate-pulse" />;
  }

  if (erro || !transacao) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">{erro ?? "Transação não encontrada"}</p>
        <Link href="/transacoes" className="text-emerald-600 text-sm hover:underline mt-2 inline-block">
          Voltar para transações
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/transacoes"
          className="p-3 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Editar Transação</h1>
          <p className="text-slate-500 text-sm">{transacao.titulo}</p>
        </div>
      </div>

      {/* Formulário */}
      <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-slate-100">
        <TransacaoForm
          modo="editar"
          transacaoId={transacao.id}
          dadosIniciais={{
            titulo: transacao.titulo,
            observacao: transacao.observacao ?? "",
            data: format(new Date(transacao.data), "yyyy-MM-dd"),
            valor: String(transacao.valor),
            tipo: transacao.tipo,
            categoriaId: transacao.categoriaId ?? "",
            anexos: transacao.anexos,
          }}
        />
      </div>
    </div>
  );
}
