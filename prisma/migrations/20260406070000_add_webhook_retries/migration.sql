-- AlterTable
ALTER TABLE "Workflow" 
ADD COLUMN "webhookRetryEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "webhookMaxRetries" INTEGER NOT NULL DEFAULT 6,
ADD COLUMN "webhookRetryStrategy" TEXT NOT NULL DEFAULT 'exponential',
ADD COLUMN "webhookRetryBaseDelay" INTEGER NOT NULL DEFAULT 60;

-- AlterTable
ALTER TABLE "WebhookLog" 
ADD COLUMN "retryCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "maxRetries" INTEGER NOT NULL DEFAULT 6,
ADD COLUMN "nextRetryAt" TIMESTAMP(3),
ADD COLUMN "retryStrategy" TEXT DEFAULT 'exponential';

-- CreateTable
CREATE TABLE "WebhookDelivery" (
    "id" TEXT NOT NULL,
    "webhookLogId" TEXT NOT NULL,
    "attemptNumber" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL,
    "httpStatus" INTEGER,
    "responseTime" INTEGER,
    "requestBody" JSONB,
    "responseBody" JSONB,
    "errorMessage" TEXT,
    "deliveredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WebhookDelivery_webhookLogId_idx" ON "WebhookDelivery"("webhookLogId");

-- CreateIndex
CREATE INDEX "WebhookDelivery_status_idx" ON "WebhookDelivery"("status");

-- CreateIndex
CREATE INDEX "WebhookDelivery_createdAt_idx" ON "WebhookDelivery"("createdAt");

-- CreateIndex
CREATE INDEX "WebhookLog_nextRetryAt_idx" ON "WebhookLog"("nextRetryAt");

-- AddForeignKey
ALTER TABLE "WebhookDelivery" 
ADD CONSTRAINT "WebhookDelivery_webhookLogId_fkey" 
FOREIGN KEY ("webhookLogId") 
REFERENCES "WebhookLog"("id") 
ON DELETE CASCADE 
ON UPDATE CASCADE;
