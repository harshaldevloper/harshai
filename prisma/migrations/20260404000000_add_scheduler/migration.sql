-- Migration: Add Scheduler Support
-- Day 28: Background Scheduler (Cron-based Workflow Execution)
-- Date: April 4, 2026

-- Add ScheduledExecution table
CREATE TABLE "ScheduledExecution" (
    "id" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "result" JSONB,
    "error" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "ScheduledExecution_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraint
ALTER TABLE "ScheduledExecution"
ADD CONSTRAINT "ScheduledExecution_scheduleId_fkey"
FOREIGN KEY ("scheduleId")
REFERENCES "Schedule"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

-- Create index for performance
CREATE INDEX "ScheduledExecution_scheduleId_idx" ON "ScheduledExecution"("scheduleId");
CREATE INDEX "ScheduledExecution_status_idx" ON "ScheduledExecution"("status");
CREATE INDEX "ScheduledExecution_startedAt_idx" ON "ScheduledExecution"("startedAt");

-- Comment: This migration adds the ScheduledExecution model to track individual
-- scheduled workflow runs. The Schedule and Workflow tables already have the
-- necessary fields from previous migrations (Day 26).
