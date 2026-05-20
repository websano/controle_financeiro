-- CreateEnum
CREATE TYPE "TipoTransacao" AS ENUM ('ENTRADA', 'SAIDA');

-- CreateTable
CREATE TABLE "transacoes" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "observacao" TEXT,
    "data" TIMESTAMP(3) NOT NULL,
    "valor" DECIMAL(15,2) NOT NULL,
    "tipo" "TipoTransacao" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "anexos" (
    "id" TEXT NOT NULL,
    "nomeOriginal" TEXT NOT NULL,
    "nomeArquivo" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "tamanho" INTEGER NOT NULL,
    "transacaoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "anexos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "anexos" ADD CONSTRAINT "anexos_transacaoId_fkey" FOREIGN KEY ("transacaoId") REFERENCES "transacoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
