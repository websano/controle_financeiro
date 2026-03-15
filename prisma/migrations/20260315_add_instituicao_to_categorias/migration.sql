-- AlterTable: add instituicaoId to categorias
ALTER TABLE "categorias" ADD COLUMN "instituicaoId" TEXT;

-- AddForeignKey
ALTER TABLE "categorias" ADD CONSTRAINT "categorias_instituicaoId_fkey" FOREIGN KEY ("instituicaoId") REFERENCES "instituicoes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- DropIndex
DROP INDEX IF EXISTS "categorias_nome_key";

-- CreateIndex (composite unique)
CREATE UNIQUE INDEX "categorias_nome_instituicaoid_key" ON "categorias"("nome", "instituicaoId");
