"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import { Suspense } from "react";

const ROTAS_SEM_SHELL = ["/login"];

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
      <main className="flex-1 min-w-0 md:ml-64">
        <div className="p-4 pb-24 md:p-6 md:pb-6 lg:p-8 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
