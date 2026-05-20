"use client";

import { useState, useEffect } from "react";
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

const STORAGE_KEY = "fl_credenciais";

export default function LoginPage() {
  const router = useRouter();
  const [telefone, setTelefone] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [lembrarMe, setLembrarMe] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  // Carrega credenciais salvas ao montar
  useEffect(() => {
    try {
      const salvo = localStorage.getItem(STORAGE_KEY);
      if (salvo) {
        const { telefone: tel, senha: sen } = JSON.parse(salvo);
        if (tel) setTelefone(tel);
        if (sen) setSenha(sen);
        setLembrarMe(true);
      }
    } catch {
      // ignora erros de parse
    }
  }, []);

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
        if (lembrarMe) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ telefone, senha }));
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
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
    <div className="min-h-screen bg-[#043f43] flex items-start justify-center pt-10 pb-6 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <img src="/images/logo_app.png" alt="Logo" width={80} height={80} className="object-contain mb-3" />
          <h1 className="text-2xl font-bold text-white">Finanças Libélula</h1>
          <p className="text-[#e5d3b9]/70 text-sm mt-1">Controle Financeiro Pessoal</p>
        </div>

        {/* Card de login */}
        <div className="bg-[#054f54] rounded-3xl p-5 shadow-2xl border border-[#e5d3b9]/10">
          <h2 className="text-lg font-bold text-white mb-0.5">Bem-vindo!</h2>
          <p className="text-[#e5d3b9]/70 text-sm mb-4">Faça login para continuar</p>

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Telefone */}
            <div>
              <label className="block text-sm font-medium text-[#e5d3b9] mb-1.5">
                Telefone
              </label>
              <div className="relative">
                <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#e5d3b9]/50" />
                <input
                  type="tel"
                  value={telefone}
                  onChange={handleTelefone}
                  placeholder="(00) 00000-0000"
                  inputMode="numeric"
                  autoComplete="username"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#e5d3b9]/20 bg-[#065c62] text-white placeholder:text-[#e5d3b9]/30 text-base outline-none transition
                    focus:ring-2 focus:ring-[#e5d3b9]/30 focus:border-[#e5d3b9]/50"
                />
              </div>
            </div>

            {/* Senha */}
            <div>
              <label className="block text-sm font-medium text-[#e5d3b9] mb-1.5">
                Senha
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#e5d3b9]/50" />
                <input
                  type={mostrarSenha ? "text" : "password"}
                  value={senha}
                  onChange={(e) => { setSenha(e.target.value); setErro(null); }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-12 py-3 rounded-xl border border-[#e5d3b9]/20 bg-[#065c62] text-white placeholder:text-[#e5d3b9]/30 text-base outline-none transition
                    focus:ring-2 focus:ring-[#e5d3b9]/30 focus:border-[#e5d3b9]/50"
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#e5d3b9]/50 hover:text-[#e5d3b9] transition p-1"
                  tabIndex={-1}
                  aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                >
                  {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Lembrar-me */}
            <label className="flex items-center gap-2.5 cursor-pointer select-none pt-0.5">
              <div
                onClick={() => setLembrarMe(!lembrarMe)}
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  lembrarMe
                    ? "bg-emerald-500 border-emerald-500"
                    : "bg-transparent border-[#e5d3b9]/30"
                }`}
              >
                {lembrarMe && (
                  <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                    <path d="M1 4L4 7.5L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span
                onClick={() => setLembrarMe(!lembrarMe)}
                className="text-sm text-[#e5d3b9]/70"
              >
                Lembrar minhas credenciais
              </span>
            </label>

            {/* Mensagem de erro */}
            {erro && (
              <div className="bg-red-900/30 border border-red-500/40 rounded-xl px-4 py-3 text-sm text-red-300">
                {erro}
              </div>
            )}

            {/* Botão */}
            <button
              type="submit"
              disabled={carregando || !telefone || !senha}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-base font-semibold
                transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1"
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

        <p className="text-center text-[#e5d3b9]/30 text-xs mt-4">
          Finanças Libélula © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
