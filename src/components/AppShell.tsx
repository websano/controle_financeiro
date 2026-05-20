"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import { Suspense, useEffect, useState } from "react";
import { Building2 } from "lucide-react";

const ROTAS_SEM_SHELL = ["/login", "/selecionar-instituicao"];

interface Instituicao {
  id: string;
  nome: string;
  cor: string;
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? match[2] : null;
}

function InstituicaoHeader() {
  const [instituicao, setInstituicao] = useState<Instituicao | null>(null);

  useEffect(() => {
    fetch("/api/instituicoes")
      .then((r) => r.json())
      .then((data) => {
        if (!Array.isArray(data)) return;
        const id = getCookie("instituicao");
        const atual = data.find((i: Instituicao) => i.id === id) ?? null;
        setInstituicao(atual);
      })
      .catch(() => {});
  }, []);

  if (!instituicao) return null;

  return (
    <div
      className="flex items-center gap-2 px-4 py-2 text-white text-xs font-semibold tracking-wide"
      style={{ backgroundColor: instituicao.cor }}
    >
      <Building2 size={13} className="opacity-80 flex-shrink-0" />
      <span className="truncate">{instituicao.nome}</span>
    </div>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const semShell = ROTAS_SEM_SHELL.some((r) => pathname.startsWith(r));

  if (semShell) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      <Suspense fallback={null}>
        <Sidebar />
      </Suspense>
      <main className="flex-1 min-w-0 md:ml-64 flex flex-col">
        {/* Banner da instituição */}
        <Suspense fallback={null}>
          <InstituicaoHeader />
        </Suspense>
        <div className="flex-1 p-4 pb-24 md:p-6 md:pb-6 lg:p-8 max-w-6xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
