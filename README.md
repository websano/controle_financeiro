# FinançasPro — Controle Financeiro Pessoal

Aplicativo web completo para gestão financeira pessoal, com autenticação, dashboard interativo, categorias, exportação de relatórios e suporte a anexos.

---

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16.1.6 (App Router, Turbopack) + TypeScript |
| Banco de dados | PostgreSQL via Prisma 7.4.2 |
| ORM Adapter | `@prisma/adapter-pg` |
| Estilização | Tailwind CSS v4 |
| Gráficos | Recharts 3 |
| Ícones | lucide-react |
| Datas | date-fns 4 (locale pt-BR) |
| Upload | Multer 2 |
| Exportação | html-to-image + jsPDF |

---

## Funcionalidades

### Autenticação
- Tela de login com gradiente (`/login`)
- Máscara de telefone automática no formato `(00) 00000-0000`
- Campo de senha com botão mostrar/ocultar
- Autenticação via cookie `httpOnly` com validade de 7 dias
- Middleware de proteção em todas as rotas (exceto `/login` e `/api/auth`)
- Credenciais: telefone `(33) 98410-4224` / senha `admin123`

### Dashboard (Página Principal)
- **Card hero** — Saldo em Caixa com gradiente verde (positivo) ou vermelho (negativo)
- **Grid 2 colunas** — Total de Entradas e Total de Saídas lado a lado
- Gráfico de barras mensal dos últimos 6 meses (Recharts)
- Lista das 5 transações mais recentes com atalhos de editar/excluir
- Botão **Exportar Relatório** que abre o modal de exportação com filtro de período

### Transações
- Listagem paginada com busca por título/observação
- Filtro por tipo (Entrada / Saída) e por período (data início e data fim)
- Criar nova transação (`/transacoes/nova?tipo=ENTRADA` ou `?tipo=SAIDA`)
- Editar transação existente (`/transacoes/[id]/editar`)
- Excluir transação com modal de confirmação
- **Campo Categoria** em criar e editar (select populado da API)
- **Máscara monetária** no campo Valor (`R$ 0,00` em tempo real)
- Campos com validação obrigatória (Título, Valor, Data)

### Categorias
- Página de gerenciamento completo (`/categorias`)
- Criar, editar inline e excluir categorias
- Seletor de cor com 10 presets
- Exibe contador de transações por categoria
- Confirmação antes de excluir

### Upload de Anexos
- Suporte a JPG, PNG, GIF, WEBP e PDF (máx. 10 MB por arquivo)
- Área de drag-and-drop + botão de seleção
- Pré-visualização dos arquivos antes de salvar
- Listagem dos anexos existentes com botão de remoção
- Arquivos servidos de `/public/uploads/`

### Exportação de Relatórios
- Modal com seletor de período (data início / data fim)
- Pré-visualização do relatório: saldo, entradas, saídas, por categoria e lista de transações
- **Exportar PNG** via `html-to-image` (compatível com Tailwind CSS v4 / oklch)
- **Exportar PDF** via jsPDF com suporte a múltiplas páginas

### Interface / UX
- **Responsiva**: sidebar no desktop, barra de navegação inferior no mobile
- Barra inferior com 4 atalhos: Principal, Entradas, Saídas, Transações
- Estado ativo correto nas abas de Entrada vs. Saída (via `useSearchParams`)
- Inputs grandes (`py-3`, `text-base`) otimizados para toque mobile
- Formulário remontado ao mudar de tipo (Entrada ↔ Saída)
- Sidebar oculta automaticamente na tela de login (`AppShell`)

---

## Estrutura do Banco

```
categorias  (id, nome, cor, icone?, createdAt)
transacoes  (id, titulo, observacao?, data, valor, tipo: ENTRADA|SAIDA, categoriaId?, createdAt, updatedAt)
anexos      (id, nomeOriginal, nomeArquivo, url, tipo, tamanho, transacaoId, createdAt)
```

---

## Rotas da API

| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/auth` | Login (define cookie `auth`) |
| DELETE | `/api/auth` | Logout (limpa cookie) |
| GET | `/api/dashboard` | Resumo, gráfico mensal e últimas transações |
| GET | `/api/relatorio` | Dados filtrados por período para exportação |
| GET | `/api/transacoes` | Listar transações (paginação, busca, filtros) |
| POST | `/api/transacoes` | Criar transação |
| GET | `/api/transacoes/[id]` | Buscar transação por ID (inclui categoria e anexos) |
| PUT | `/api/transacoes/[id]` | Atualizar transação |
| DELETE | `/api/transacoes/[id]` | Excluir transação e seus arquivos físicos |
| GET | `/api/categorias` | Listar categorias com contagem de transações |
| POST | `/api/categorias` | Criar categoria |
| PUT | `/api/categorias/[id]` | Atualizar categoria |
| DELETE | `/api/categorias/[id]` | Excluir categoria |
| POST | `/api/upload` | Upload de arquivo (retorna URL) |
| DELETE | `/api/anexos/[id]` | Remover anexo e arquivo físico |

---

## Como executar

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variável de ambiente
# Crie um arquivo .env na raiz com:
DATABASE_URL="postgresql://usuario:senha@host:5432/controle_financeiro"

# 3. Aplicar migrações no banco
npx prisma migrate dev

# 4. Iniciar em desenvolvimento
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

### Build de produção

```bash
npm run build
npm start
```

---

## Estrutura de Pastas

```
src/
├── app/
│   ├── page.tsx                     # Dashboard (Principal)
│   ├── layout.tsx                   # Layout raiz com AppShell
│   ├── login/
│   │   └── page.tsx                 # Tela de login
│   ├── transacoes/
│   │   ├── page.tsx                 # Listagem de transações
│   │   ├── nova/page.tsx            # Nova transação
│   │   └── [id]/editar/page.tsx     # Editar transação
│   ├── categorias/
│   │   └── page.tsx                 # Gerenciar categorias
│   └── api/
│       ├── auth/route.ts
│       ├── dashboard/route.ts
│       ├── relatorio/route.ts
│       ├── transacoes/route.ts
│       ├── transacoes/[id]/route.ts
│       ├── categorias/route.ts
│       ├── categorias/[id]/route.ts
│       ├── upload/route.ts
│       └── anexos/[id]/route.ts
├── components/
│   ├── AppShell.tsx                 # Controla exibição da Sidebar
│   ├── Sidebar.tsx                  # Navegação desktop + mobile
│   ├── TransacaoForm.tsx            # Formulário unificado criar/editar
│   ├── TransacaoCard.tsx            # Card de transação na listagem
│   ├── CardResumo.tsx               # Card de resumo financeiro
│   ├── GraficoMensal.tsx            # Gráfico de barras mensal
│   ├── ExportModal.tsx              # Modal de exportação com período
│   └── ModalConfirmacao.tsx         # Modal de confirmação genérico
├── lib/
│   └── prisma.ts                    # Instância do Prisma Client
├── middleware.ts                    # Proteção de rotas via cookie
prisma/
├── schema.prisma                    # Schema do banco de dados
└── migrations/                      # Histórico de migrações
```


```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
