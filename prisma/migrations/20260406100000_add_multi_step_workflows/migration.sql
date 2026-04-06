-- AlterTable
-- Add columns to Execution table for tracking multi-step workflow execution
ALTER TABLE "Execution" 
ADD COLUMN "branchPath" TEXT[],
ADD COLUMN "loopIterations" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "parallelBranches" JSONB;

-- Note: Node type enhancements (if, switch, fork, merge, loop_for, loop_while)
-- are stored in the existing Workflow.nodes JSON field and don't require schema changes
