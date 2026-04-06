-- AlterTable
ALTER TABLE "Workflow" 
ADD COLUMN "webhookSignatureEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "webhookSigningSecret" TEXT,
ADD COLUMN "signatureAlgorithm" TEXT DEFAULT 'sha256',
ADD COLUMN "signatureHeader" TEXT DEFAULT 'X-Signature-256',
ADD COLUMN "timestampTolerance" INTEGER NOT NULL DEFAULT 300;
