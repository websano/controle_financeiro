"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  ArrowUpCircle,
  ArrowDownCircle,
  ListOrdered,
  DollarSign,
  Tag,
} from "lucide-react";
import { Suspense } from "react";

const navItems = [
  { href: "/", label: "Principal", icon: LayoutDashboard },
  { href: "/transacoes", label: "Transações", icon: ListOrdered },
  { href: "/categorias", label: "Categorias", icon: Tag },
  { href: "/transacoes/nova?tipo=ENTRADA", label: "Entrada", icon: ArrowUpCircle },
  { href: "/transacoes/nova?tipo=SAIDA", label: "Saída", icon: ArrowDownCircle },
];

// Bottom nav mobile: 4 itens (sem Categorias)
const mobileNavItems = navItems.filter((i) => !i.href.startsWith("/categorias"));

function SidebarContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tipoAtual = searchParams.get("tipo");

  function isAtivo(href: string) {
    const [path, query] = href.split("?");
    if (path === "/") return pathname === "/";
    if (!pathname.startsWith(path)) return false;
    // Se o link tem query param de tipo, verificar se bate
    if (query) {
      const paramTipo = new URLSearchParams(query).get("tipo");
      // Na página nova, diferenciar por tipo
      if (pathname === "/transacoes/nova") {
        return tipoAtual === paramTipo || (!tipoAtual && paramTipo === "ENTRADA");
      }
    }
    return true;
  }

  return (
    <>
      {/* ===== BOTTOM NAV — somente mobile ===== */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 flex md:hidden shadow-[0_-2px_12px_rgba(0,0,0,0.06)]">
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
                      ? "text-emerald-600"
                      : isSaida
                      ? "text-red-500"
                      : "text-emerald-600"
                    : "text-slate-400"
                }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors
                  ${
                    ativo
                      ? isEntrada
                        ? "bg-emerald-100"
                        : isSaida
                        ? "bg-red-100"
                        : "bg-emerald-100"
                      : ""
                  }`}
              >
                <Icon size={21} />
              </div>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* ===== SIDEBAR — somente desktop ===== */}
      <aside className="hidden md:flex fixed top-0 left-0 h-full w-64 bg-slate-900 text-white z-40 flex-col shadow-2xl">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-700">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
            <DollarSign size={22} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">FinançasPro</h1>
            <p className="text-slate-400 text-xs">Controle Financeiro</p>
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
                      ? "bg-emerald-600 text-white shadow-md"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-700 text-slate-500 text-xs">
          © {new Date().getFullYear()} FinançasPro
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
