-- Add new UserRole enum values
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'DIREKTUR_BISNIS';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'GENERAL_MANAGER';

-- Create ClusterType enum
DO $$ BEGIN
  CREATE TYPE "ClusterType" AS ENUM ('GRAHA', 'GRIYA', 'SGM');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create Project table
CREATE TABLE IF NOT EXISTS "Project" (
  "id"          TEXT NOT NULL,
  "name"        TEXT NOT NULL,
  "cluster"     TEXT NOT NULL,
  "clusterType" "ClusterType" NOT NULL,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Project_name_key" ON "Project"("name");

-- Create UserProject table
CREATE TABLE IF NOT EXISTS "UserProject" (
  "id"        TEXT NOT NULL,
  "userId"    TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UserProject_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "UserProject_userId_projectId_key" ON "UserProject"("userId", "projectId");

-- Add foreign keys for UserProject
ALTER TABLE "UserProject" ADD CONSTRAINT "UserProject_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UserProject" ADD CONSTRAINT "UserProject_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add projectId to Strategy (nullable)
ALTER TABLE "Strategy" ADD COLUMN IF NOT EXISTS "projectId" TEXT;

ALTER TABLE "Strategy" ADD CONSTRAINT "Strategy_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
