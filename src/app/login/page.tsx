"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Phone, Lock } from "lucide-react";

function formatarTelefone(valor: string): string {
  const numeros = valor.replace(/\D/g, "").slice(0, 11);
  if (numeros.length <= 2) return numeros.length ? `(${numeros}` : "";
  if (numeros.length <= 7) return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
  if (numeros.length <= 11) {
    const parte = numeros.slice(2);
    const meio = parte.length <= 8 ? 4 : 5;
    return `(${numeros.slice(0, 2)}) ${parte.slice(0, meio)}-${parte.slice(meio)}`;
  }
  return valor;
}

export default function LoginPage() {
  const router = useRouter();
  const [telefone, setTelefone] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  const handleTelefone = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTelefone(formatarTelefone(e.target.value));
    setErro(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);
    setErro(null);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telefone, senha }),
      });
      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        const data = await res.json();
        setErro(data.error ?? "Credenciais inválidas");
      }
    } catch {
      setErro("Erro de conexão. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-xl mb-4 overflow-hidden">
            <img src="/images/icon_logo.png" alt="Logo" width={48} height={48} className="object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-white">Finanças Libélula</h1>
          <p className="text-slate-400 text-sm mt-1">Controle Financeiro Pessoal</p>
        </div>

        {/* Card de login */}
        <div className="bg-white rounded-3xl p-7 shadow-2xl">
          <h2 className="text-xl font-bold text-slate-800 mb-1">Bem-vindo!</h2>
          <p className="text-slate-500 text-sm mb-6">Faça login para continuar</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Telefone */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Telefone
              </label>
              <div className="relative">
                <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  value={telefone}
                  onChange={handleTelefone}
                  placeholder="(00) 00000-0000"
                  inputMode="numeric"
                  autoComplete="tel"
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-slate-200 text-base outline-none transition
                    focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400"
                />
              </div>
            </div>

            {/* Senha */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Senha
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={mostrarSenha ? "text" : "password"}
                  value={senha}
                  onChange={(e) => { setSenha(e.target.value); setErro(null); }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-12 py-3.5 rounded-xl border border-slate-200 text-base outline-none transition
                    focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400"
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition p-1"
                  tabIndex={-1}
                  aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                >
                  {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Mensagem de erro */}
            {erro && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
                {erro}
              </div>
            )}

            {/* Botão */}
            <button
              type="submit"
              disabled={carregando || !telefone || !senha}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-base font-semibold
                transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {carregando ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-500 text-xs mt-6">
          Finanças Libélula © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
