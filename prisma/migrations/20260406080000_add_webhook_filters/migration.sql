-- CreateTable
CREATE TABLE "WebhookFilter" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "filterType" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "operator" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebhookFilter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WebhookFilter_workflowId_idx" ON "WebhookFilter"("workflowId");

-- CreateIndex
CREATE INDEX "WebhookFilter_enabled_idx" ON "WebhookFilter"("enabled");

-- AddForeignKey
ALTER TABLE "WebhookFilter" 
ADD CONSTRAINT "WebhookFilter_workflowId_fkey" 
FOREIGN KEY ("workflowId") 
REFERENCES "Workflow"("id") 
ON DELETE CASCADE 
ON UPDATE CASCADE;
