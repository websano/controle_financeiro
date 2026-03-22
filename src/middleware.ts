import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rotas totalmente públicas (sem auth)
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  const auth = request.cookies.get("auth");
  if (!auth?.value) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Rotas que precisam de auth mas não de instituição selecionada
  if (
    pathname.startsWith("/selecionar-instituicao") ||
    pathname.startsWith("/api/instituicoes")
  ) {
    return NextResponse.next();
  }

  const instituicao = request.cookies.get("instituicao");
  if (!instituicao?.value) {
    return NextResponse.redirect(new URL("/selecionar-instituicao", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images/|uploads/|public/).*)"],
};
