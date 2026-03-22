"use client";

import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ArrowUpCircle,
  ArrowDownCircle,
  ListOrdered,
  Tag,
  RefreshCw,
  Menu,
  X,
  Building2,
  LogOut,
} from "lucide-react";
import { Suspense, useEffect, useState } from "react";

interface Instituicao {
  id: string;
  nome: string;
  cor: string;
}

const navItems = [
  { href: "/", label: "Principal", icon: LayoutDashboard },
  { href: "/transacoes", label: "Transações", icon: ListOrdered },
  { href: "/categorias", label: "Categorias", icon: Tag },
  { href: "/selecionar-instituicao", label: "Instituições", icon: Building2 },
  { href: "/transacoes/nova?tipo=ENTRADA", label: "Entrada", icon: ArrowUpCircle },
  { href: "/transacoes/nova?tipo=SAIDA", label: "Saída", icon: ArrowDownCircle },
];

const mobileNavItems = [
  { href: "/", label: "Principal", icon: LayoutDashboard },
  { href: "/transacoes", label: "Transações", icon: ListOrdered },
  { href: "/transacoes/nova?tipo=ENTRADA", label: "Entrada", icon: ArrowUpCircle },
  { href: "/transacoes/nova?tipo=SAIDA", label: "Saída", icon: ArrowDownCircle },
];

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? match[2] : null;
}

function SidebarContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const tipoAtual = searchParams.get("tipo");

  const [instituicaoAtual, setInstituicaoAtual] = useState<Instituicao | null>(null);
  const [drawerAberto, setDrawerAberto] = useState(false);

  useEffect(() => {
    fetch("/api/instituicoes")
      .then((r) => r.json())
      .then((data) => {
        if (!Array.isArray(data)) return;
        const id = getCookie("instituicao");
        const atual = data.find((i: Instituicao) => i.id === id) ?? null;
        setInstituicaoAtual(atual);
      })
      .catch(() => {});
  }, [pathname]);

  // Fecha o drawer ao navegar
  useEffect(() => {
    setDrawerAberto(false);
  }, [pathname]);

  const trocarInstituicao = async () => {
    await fetch("/api/auth/instituicao", { method: "DELETE" });
    router.push("/selecionar-instituicao");
  };

  const logout = async () => {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/login");
  };

  function isAtivo(href: string) {
    const [path, query] = href.split("?");
    if (path === "/") return pathname === "/";
    if (!pathname.startsWith(path)) return false;
    if (query) {
      const paramTipo = new URLSearchParams(query).get("tipo");
      if (pathname === "/transacoes/nova") {
        return tipoAtual === paramTipo || (!tipoAtual && paramTipo === "ENTRADA");
      }
    }
    return true;
  }

  return (
    <>
      {/* ===== BOTTOM NAV — somente mobile ===== */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#032e31] border-t border-[#e5d3b9]/15 flex md:hidden shadow-[0_-2px_12px_rgba(0,0,0,0.3)]">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const ativo = isAtivo(item.href);
          const isEntrada = item.href.includes("ENTRADA");
          const isSaida = item.href.includes("SAIDA");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 py-2 gap-0.5 text-[11px] font-medium transition-colors active:opacity-70
                ${
                  ativo
                    ? isEntrada
                      ? "text-emerald-400"
                      : isSaida
                      ? "text-red-400"
                      : "text-[#e5d3b9]"
                    : "text-[#e5d3b9]/40"
                }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors
                  ${
                    ativo
                      ? isEntrada
                        ? "bg-emerald-500/20"
                        : isSaida
                        ? "bg-red-500/20"
                        : "bg-[#065c62]"
                      : ""
                  }`}
              >
                <Icon size={21} />
              </div>
              <span>{item.label}</span>
            </Link>
          );
        })}

        {/* Botão Menu */}
        <button
          onClick={() => setDrawerAberto(true)}
          className="flex flex-col items-center justify-center flex-1 py-2 gap-0.5 text-[11px] font-medium text-[#e5d3b9]/40 active:opacity-70"
        >
          <div className="w-9 h-9 rounded-xl flex items-center justify-center">
            <Menu size={21} />
          </div>
          <span>Menu</span>
        </button>
      </nav>

      {/* ===== DRAWER MOBILE ===== */}
      {drawerAberto && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[60] bg-black/60 md:hidden"
            onClick={() => setDrawerAberto(false)}
          />
          {/* Painel */}
          <div className="fixed top-0 left-0 h-full w-72 bg-[#032e31] text-white z-[70] flex flex-col shadow-2xl md:hidden animate-in slide-in-from-left duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-5 border-b border-[#e5d3b9]/15">
              <div className="flex items-center gap-3">
                <img src="/images/logo_app.png" alt="Logo" width={36} height={36} className="object-contain flex-shrink-0" />
                <div>
                  <h1 className="font-bold text-base leading-tight text-white">Finanças Libélula</h1>
                  <p className="text-[#e5d3b9]/60 text-xs">Controle Financeiro</p>
                </div>
              </div>
              <button
                onClick={() => setDrawerAberto(false)}
                className="p-2 rounded-xl text-[#e5d3b9]/60 hover:text-white hover:bg-[#065c62] transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Navegação */}
            <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const ativo = isAtivo(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                      ${
                        ativo
                          ? "bg-[#065c62] text-[#e5d3b9] shadow-md"
                          : "text-[#e5d3b9]/70 hover:bg-[#054f54] hover:text-white"
                      }`}
                  >
                    <Icon size={18} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Instituição */}
            <div className="px-4 py-4 border-t border-[#e5d3b9]/15">
              {instituicaoAtual ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5 px-2">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: instituicaoAtual.cor }}
                    />
                    <p className="text-xs font-semibold text-white truncate leading-tight">
                      {instituicaoAtual.nome}
                    </p>
                  </div>
                  <button
                    onClick={trocarInstituicao}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-[#e5d3b9]/60 hover:text-white hover:bg-[#054f54] transition-colors"
                  >
                    <RefreshCw size={13} />
                    Trocar instituição
                  </button>
                </div>
              ) : (
                <div className="text-[#e5d3b9]/40 text-xs px-2">Carregando...</div>
              )}
              <button
                onClick={logout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-red-400/80 hover:text-red-300 hover:bg-red-900/20 transition-colors mt-2"
              >
                <LogOut size={13} />
                Sair
              </button>
              <p className="text-[#e5d3b9]/30 text-xs px-2 mt-2">© {new Date().getFullYear()} Finanças Libélula</p>
            </div>
          </div>
        </>
      )}

      {/* ===== SIDEBAR — somente desktop ===== */}
      <aside className="hidden md:flex fixed top-0 left-0 h-full w-64 bg-[#032e31] text-white z-40 flex-col shadow-2xl">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-[#e5d3b9]/15">
          <img src="/images/logo_app.png" alt="Logo" width={40} height={40} className="object-contain flex-shrink-0" />
          <div>
            <h1 className="font-bold text-lg leading-tight text-white">Finanças Libélula</h1>
            <p className="text-[#e5d3b9]/60 text-xs">Controle Financeiro</p>
          </div>
        </div>

        {/* Navegação */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const ativo = isAtivo(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                  ${
                    ativo
                      ? "bg-[#065c62] text-[#e5d3b9] shadow-md"
                      : "text-[#e5d3b9]/70 hover:bg-[#054f54] hover:text-white"
                  }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Instituição atual */}
        <div className="px-4 py-4 border-t border-[#e5d3b9]/15">
          {instituicaoAtual ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2.5 px-2">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: instituicaoAtual.cor }}
                />
                <p className="text-xs font-semibold text-white truncate leading-tight">
                  {instituicaoAtual.nome}
                </p>
              </div>
              <button
                onClick={trocarInstituicao}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-[#e5d3b9]/60 hover:text-white hover:bg-[#054f54] transition-colors"
              >
                <RefreshCw size={13} />
                Trocar instituição
              </button>
            </div>
          ) : (
            <div className="text-[#e5d3b9]/40 text-xs px-2">Carregando...</div>
          )}
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-red-400/80 hover:text-red-300 hover:bg-red-900/20 transition-colors mt-2"
          >
            <LogOut size={13} />
            Sair
          </button>
          <p className="text-[#e5d3b9]/30 text-xs px-2 mt-2">© {new Date().getFullYear()} Finanças Libélula</p>
        </div>
      </aside>
    </>
  );
}

export default function Sidebar() {
  return (
    <Suspense fallback={null}>
      <SidebarContent />
    </Suspense>
  );
}
