-- AlterTable
ALTER TABLE "Project" ADD COLUMN "siproperProyekId" INTEGER;
ALTER TABLE "Project" ADD COLUMN "unitBisnis" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Project_siproperProyekId_key" ON "Project"("siproperProyekId");
