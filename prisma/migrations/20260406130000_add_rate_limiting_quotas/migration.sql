-- CreateTable
CREATE TABLE "UsageLog" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "executionId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duration" INTEGER NOT NULL DEFAULT 0,
    "success" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "UsageLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RateLimitLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "allowed" BOOLEAN NOT NULL,
    "limit" INTEGER NOT NULL,
    "remaining" INTEGER NOT NULL,
    "resetAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RateLimitLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UsageLog_subscriptionId_idx" ON "UsageLog"("subscriptionId");

-- CreateIndex
CREATE INDEX "UsageLog_timestamp_idx" ON "UsageLog"("timestamp");

-- CreateIndex
CREATE INDEX "UsageLog_workflowId_idx" ON "UsageLog"("workflowId");

-- CreateIndex
CREATE INDEX "RateLimitLog_userId_timestamp_idx" ON "RateLimitLog"("userId", "timestamp");

-- CreateIndex
CREATE INDEX "RateLimitLog_workflowId_timestamp_idx" ON "RateLimitLog"("workflowId", "timestamp");

-- AddForeignKey
ALTER TABLE "UsageLog" ADD CONSTRAINT "UsageLog_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add rate limit columns to Subscription
ALTER TABLE "Subscription" 
ADD COLUMN "rateLimitPerMinute" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN "rateLimitPerHour" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN "rateLimitPerDay" INTEGER NOT NULL DEFAULT 1000,
ADD COLUMN "concurrentLimit" INTEGER NOT NULL DEFAULT 5;
