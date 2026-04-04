-- AlterTable
ALTER TABLE "Workflow" ADD COLUMN "webhookEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "webhookSecret" TEXT;

-- CreateTable
CREATE TABLE "WebhookLog" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,
    "response" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "error" TEXT,

    CONSTRAINT "WebhookLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Workflow_webhookSecret_key" ON "Workflow"("webhookSecret");

-- CreateIndex
CREATE INDEX "WebhookLog_workflowId_idx" ON "WebhookLog"("workflowId");

-- CreateIndex
CREATE INDEX "WebhookLog_receivedAt_idx" ON "WebhookLog"("receivedAt");

-- CreateIndex
CREATE INDEX "WebhookLog_status_idx" ON "WebhookLog"("status");

-- AddForeignKey
ALTER TABLE "WebhookLog" ADD CONSTRAINT "WebhookLog_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;
