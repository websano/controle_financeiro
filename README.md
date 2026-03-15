# Finanças Libélula — Controle Financeiro Pessoal

Aplicativo web completo para gestão financeira pessoal, com suporte a múltiplas instituições, dashboard interativo, categorias personalizadas, anexos e exportação de relatórios em PNG e PDF.

---

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) + TypeScript |
| Banco de dados | PostgreSQL via Prisma 7.4 |
| ORM Adapter | `@prisma/adapter-pg` |
| Estilização | Tailwind CSS v4 |
| Gráficos | Recharts 3 |
| Ícones | lucide-react |
| Datas | date-fns 4 (locale pt-BR) |
| Upload | Multer 2 |
| Exportação | html-to-image + jsPDF + html2canvas |

---

## Funcionalidades

### Autenticação
- Tela de login com gradiente escuro (`/login`)
- Máscara de telefone automática no formato `(00) 00000-0000`
- Campo de senha com botão mostrar/ocultar
- Autenticação via cookie `httpOnly` com validade de 7 dias
- Middleware de proteção em todas as rotas privadas
- Redirecionamento automático para seleção de instituição após login

### Múltiplas Instituições
- Suporte a várias instituições (empresas, contas, carteiras)
- Cada instituição tem nome, slug e cor personalizada
- Seleção de instituição persistida em cookie de sessão
- Dados de transações e categorias isolados por instituição
- Tela dedicada para selecionar ou trocar de instituição (`/selecionar-instituicao`)
- Botão "Trocar instituição" disponível na sidebar

### Dashboard (Página Principal)
- **Card hero** — Saldo em Caixa com gradiente verde (positivo) ou vermelho (negativo)
- **Grid 2 colunas** — Total de Entradas e Total de Saídas com contadores de lançamentos
- Gráfico de barras mensais dos últimos 6 meses (Recharts)
- Lista das últimas transações com atalhos de editar/excluir
- Botões rápidos para adicionar **Entrada** ou **Saída**
- Botão **Exportar Relatório** que abre o modal com filtros de período e categoria

### Transações
- Listagem paginada (20 itens por página) com busca por título/observação
- Filtros por: tipo (Entrada / Saída), período (data início e fim) e categorias
- Criar nova transação (`/transacoes/nova?tipo=ENTRADA` ou `?tipo=SAIDA`)
- Editar transação existente (`/transacoes/[id]/editar`)
- Excluir transação com modal de confirmação
- Máscara monetária no campo Valor (`R$ 0,00` em tempo real)
- Seleção de categoria com opção de criar nova categoria inline
- Campo de observação opcional
- Upload de anexos (imagens e PDFs) diretamente na transação

### Categorias
- Página de gerenciamento completo (`/categorias`)
- Criar, editar e excluir categorias
- Seletor de cor com 10 presets visuais
- Exibe contador de transações vinculadas por categoria
- Confirmação antes de excluir
- Categorias isoladas por instituição

### Upload de Anexos
- Suporte a JPG, PNG, GIF, WEBP e PDF (máx. 10 MB por arquivo)
- Área de drag-and-drop + botão de seleção de arquivo
- Pré-visualização dos arquivos antes de salvar
- Listagem dos anexos existentes com botão de remoção individual
- Arquivos removidos do servidor ao excluir a transação
- Arquivos servidos de `/public/uploads/`

### Exportação de Relatórios
- Modal com seletor de período (data início / data fim)
- Filtro por categorias específicas
- Pré-visualização completa do relatório na tela
- Relatório inclui: resumo financeiro, breakdown por categoria e listagem de transações
- **Exportar PNG** via `html-to-image`
- **Exportar PDF** via jsPDF com suporte a múltiplas páginas
- Identificação da instituição no relatório

### Interface / UX
- **Responsiva**: sidebar no desktop, barra de navegação inferior no mobile
- Sidebar desktop fixa com logo, navegação e instituição atual
- Drawer menu deslizante no mobile com animação
- Barra inferior mobile com 4 atalhos rápidos + menu
- Logo personalizado (`icon_logo.png`) no topo da sidebar e login
- Estado ativo correto nas abas de navegação
- Inputs otimizados para toque mobile
- Feedback visual de carregamento em todas as ações
- Modais de confirmação antes de ações destrutivas
- Localização completa em Português Brasileiro

---

## Estrutura do Banco de Dados

```
Instituicao  (id, nome, slug, cor, createdAt)
Categoria    (id, nome, cor, icone?, instituicaoId?, createdAt)
Transacao    (id, titulo, observacao?, data, valor, tipo: ENTRADA|SAIDA,
              categoriaId?, instituicaoId?, createdAt, updatedAt)
Anexo        (id, nomeOriginal, nomeArquivo, url, tipo, tamanho,
              transacaoId, createdAt)
```

---

## Rotas da API

| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/auth` | Login — define cookie `auth` |
| DELETE | `/api/auth` | Logout — limpa cookies |
| POST | `/api/auth/instituicao` | Selecionar instituição ativa |
| DELETE | `/api/auth/instituicao` | Remover seleção de instituição |
| GET | `/api/dashboard` | Saldo, gráfico mensal e últimas transações |
| GET | `/api/relatorio` | Dados filtrados por período/categoria para exportação |
| GET | `/api/transacoes` | Listar transações (paginação, busca, filtros) |
| POST | `/api/transacoes` | Criar transação |
| GET | `/api/transacoes/[id]` | Buscar transação por ID (com categoria e anexos) |
| PUT | `/api/transacoes/[id]` | Atualizar transação |
| DELETE | `/api/transacoes/[id]` | Excluir transação e arquivos físicos |
| GET | `/api/categorias` | Listar categorias com contagem de transações |
| POST | `/api/categorias` | Criar categoria |
| PUT | `/api/categorias/[id]` | Atualizar categoria |
| DELETE | `/api/categorias/[id]` | Excluir categoria |
| GET | `/api/instituicoes` | Listar instituições |
| POST | `/api/instituicoes` | Criar instituição |
| PUT | `/api/instituicoes/[id]` | Atualizar instituição |
| DELETE | `/api/instituicoes/[id]` | Excluir instituição |
| POST | `/api/upload` | Upload de arquivo anexo |
| DELETE | `/api/anexos/[id]` | Remover anexo e arquivo físico |

---

## Estrutura de Pastas

```
src/
├── app/
│   ├── page.tsx                          # Dashboard (Principal)
│   ├── layout.tsx                        # Layout raiz com AppShell
│   ├── login/
│   │   └── page.tsx                      # Tela de login
│   ├── selecionar-instituicao/
│   │   └── page.tsx                      # Seleção de instituição
│   ├── transacoes/
│   │   ├── page.tsx                      # Listagem de transações
│   │   ├── nova/page.tsx                 # Nova transação
│   │   └── [id]/editar/page.tsx          # Editar transação
│   ├── categorias/
│   │   └── page.tsx                      # Gerenciar categorias
│   └── api/
│       ├── auth/route.ts                 # Login / Logout
│       ├── auth/instituicao/route.ts     # Seleção de instituição
│       ├── dashboard/route.ts            # Dados do dashboard
│       ├── relatorio/route.ts            # Dados de relatório
│       ├── transacoes/route.ts           # CRUD transações
│       ├── transacoes/[id]/route.ts      # Transação por ID
│       ├── categorias/route.ts           # CRUD categorias
│       ├── categorias/[id]/route.ts      # Categoria por ID
│       ├── instituicoes/route.ts         # CRUD instituições
│       ├── instituicoes/[id]/route.ts    # Instituição por ID
│       ├── upload/route.ts               # Upload de arquivos
│       └── anexos/[id]/route.ts          # Remover anexo
├── components/
│   ├── AppShell.tsx                      # Controla exibição da Sidebar
│   ├── Sidebar.tsx                       # Navegação desktop + drawer mobile
│   ├── TransacaoForm.tsx                 # Formulário unificado criar/editar
│   ├── TransacaoCard.tsx                 # Card de transação na listagem
│   ├── CardResumo.tsx                    # Card de resumo financeiro
│   ├── GraficoMensal.tsx                 # Gráfico de barras mensal
│   ├── ExportModal.tsx                   # Modal de exportação com filtros
│   └── ModalConfirmacao.tsx              # Modal de confirmação genérico
├── lib/
│   └── prisma.ts                         # Instância do Prisma Client
└── middleware.ts                         # Proteção de rotas via cookie
prisma/
├── schema.prisma                         # Schema do banco de dados
└── migrations/                           # Histórico de migrações
public/
├── images/
│   └── icon_logo.png                     # Logo do sistema
└── uploads/                              # Arquivos anexados pelos usuários
```

---

## Como executar

### Pré-requisitos
- Node.js 18+
- PostgreSQL

### Desenvolvimento

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
# Crie um arquivo .env na raiz:
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

### Produção com PM2

```bash
npm run build
pm2 start ecosystem.config.js
pm2 save
```

---

## Acesso

> **Login padrão:**
> - Telefone: `(33) 98410-4224`
> - Senha: `admin123`

---

## Deploy atual

- **URL**: [https://financeiro.bazarlibelula.com.br](https://financeiro.bazarlibelula.com.br)
- **Servidor**: Contabo VPS — `157.173.118.181:3333`
- **Gerenciador de processos**: PM2 (`controle-financeiro`)
