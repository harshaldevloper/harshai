# Day 28: Background Scheduler Setup Guide

## Overview

This feature enables workflows to run automatically on a schedule (hourly, daily, weekly, monthly) without manual triggers. The scheduler uses Vercel Cron Jobs to execute workflows at specified intervals.

## Features

- ✅ **Cron-based Scheduling**: Set workflows to run at specific intervals using cron expressions
- ✅ **Visual Cron Picker**: User-friendly UI to select common schedules or create custom expressions
- ✅ **Schedule Management**: Enable/disable schedules, update cron expressions, view next/last run times
- ✅ **Execution History**: Track all scheduled executions with status and results
- ✅ **Automatic Retry Prevention**: Failed workflows are automatically disabled to prevent continuous failures
- ✅ **Vercel Cron Integration**: Deployed cron jobs run every minute to check for due workflows

## Database Schema Changes

### New Fields on Workflow Model
- `triggerType` - Type of trigger: "manual", "webhook", or "cron"
- `cronExpression` - Cron expression string (e.g., "0 9 * * *")
- `scheduleEnabled` - Boolean to enable/disable the schedule
- `lastExecutedAt` - DateTime of last execution
- `nextExecutedAt` - DateTime of next scheduled execution

### New Models
- `Schedule` - Stores schedule configuration for each workflow
  - `cronExpression` - The cron expression
  - `isEnabled` - Whether the schedule is active
  - `lastRun` - Last execution time
  - `nextRun` - Next scheduled execution time
  - `scheduledExecutions` - Relation to execution history

- `ScheduledExecution` - Tracks individual scheduled runs
  - `status` - pending, running, completed, failed
  - `result` - Execution result data
  - `error` - Error message if failed
  - `startedAt` / `completedAt` - Timing information

## Setup Instructions

### 1. Install Dependencies

```bash
cd ai-workflow-automator
npm install
```

### 2. Update Database Schema

Apply the Prisma schema changes:

```bash
# Generate Prisma client
npm run db:generate

# Push schema changes to database (development)
npm run db:push

# OR create and apply migration (production)
npx prisma migrate dev --name add_scheduler
```

### 3. Configure Environment Variables

Add the following to your `.env.local` file:

```bash
# Optional: Security for cron endpoint
CRON_SECRET=your-secret-key-here

# Database (already required)
DATABASE_URL="postgresql://..."
```

### 4. Deploy to Vercel

```bash
# Install Vercel CLI if not already installed
npm install -g vercel

# Deploy
vercel --prod
```

Vercel will automatically configure the cron job based on the `vercel.json` configuration.

### 5. Verify Cron Job

After deployment, verify the cron job is configured:

1. Go to your project on [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to **Settings** → **Cron Jobs**
3. You should see `/api/cron/execute` scheduled to run every minute (`* * * * *`)

## API Endpoints

### POST /api/workflows/[id]/schedule
Set a schedule for a workflow.

**Request Body:**
```json
{
  "cronExpression": "0 9 * * *",
  "triggerType": "cron"
}
```

**Response:**
```json
{
  "success": true,
  "workflow": { ... },
  "nextRun": "2026-04-05T09:00:00.000Z"
}
```

### GET /api/workflows/[id]/schedule
Get schedule information for a workflow.

**Response:**
```json
{
  "workflow": {
    "id": "...",
    "name": "...",
    "triggerType": "cron",
    "cronExpression": "0 9 * * *",
    "scheduleEnabled": true,
    "nextExecutedAt": "2026-04-05T09:00:00.000Z",
    "lastExecutedAt": "2026-04-04T09:00:00.000Z"
  },
  "schedule": {
    "id": "...",
    "cronExpression": "0 9 * * *",
    "isEnabled": true,
    "lastRun": "2026-04-04T09:00:00.000Z",
    "nextRun": "2026-04-05T09:00:00.000Z",
    "scheduledExecutions": [...]
  }
}
```

### PUT /api/workflows/[id]/schedule
Update or pause a schedule.

**Request Body:**
```json
{
  "isEnabled": false,
  "cronExpression": "0 9 * * *"
}
```

**Response:**
```json
{
  "success": true,
  "schedule": { ... },
  "workflow": { ... }
}
```

### DELETE /api/workflows/[id]/schedule
Remove a schedule from a workflow.

**Response:**
```json
{
  "success": true,
  "workflow": { ... }
}
```

### POST /api/cron/execute
Execute all due scheduled workflows (called by Vercel Cron).

**Headers:**
```
Authorization: Bearer your-cron-secret
```

**Response:**
```json
{
  "success": true,
  "executedAt": "2026-04-04T12:00:00.000Z",
  "workflowsExecuted": 3,
  "results": [
    {
      "workflowId": "...",
      "workflowName": "...",
      "status": "success",
      "executionId": "..."
    }
  ]
}
```

### GET /api/cron/execute
Get cron execution status and statistics.

**Response:**
```json
{
  "status": "ok",
  "currentTime": "2026-04-04T12:00:00.000Z",
  "activeSchedules": 5,
  "dueWorkflows": 2,
  "recentExecutions": [...]
}
```

## Cron Expression Presets

| Preset | Expression | Description |
|--------|-----------|-------------|
| Every Minute | `* * * * *` | Run every minute |
| Every Hour | `0 * * * *` | Run at the start of every hour |
| Every 6 Hours | `0 */6 * * *` | Run every 6 hours |
| Daily at 9 AM | `0 9 * * *` | Run every day at 9:00 AM |
| Daily at Midnight | `0 0 * * *` | Run every day at 12:00 AM |
| Weekly (Monday 9 AM) | `0 9 * * 1` | Run every Monday at 9:00 AM |
| Weekly (Sunday) | `0 0 * * 0` | Run every Sunday at midnight |
| Monthly (1st at 9 AM) | `0 9 1 * *` | Run on the 1st of every month at 9:00 AM |

## Cron Expression Format

```
┌───────────── minute (0 - 59)
│ ┌───────────── hour (0 - 23)
│ │ ┌───────────── day of month (1 - 31)
│ │ │ ┌───────────── month (1 - 12)
│ │ │ │ ┌───────────── day of week (0 - 7) (Sunday = 0 or 7)
│ │ │ │ │
* * * * *
```

### Special Characters
- `*` = Any value (every)
- `,` = Value list separator (e.g., `1,3,5`)
- `-` = Range of values (e.g., `1-5`)
- `/` = Step values (e.g., `*/6` = every 6 units)

## UI Components

### CronPicker Component
```tsx
import CronPicker from '@/components/CronPicker';

<CronPicker
  value={cronExpression}
  onChange={(cron) => setCronExpression(cron)}
  disabled={isLoading}
/>
```

### ScheduleModal Component
```tsx
import ScheduleModal from '@/components/ScheduleModal';

<ScheduleModal
  workflowId={workflowId}
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  currentSchedule={workflow.schedule}
  onSave={() => refreshWorkflowData()}
/>
```

## Testing

### 1. Create a Test Workflow

1. Navigate to the Workflow Builder
2. Create a simple workflow (e.g., "Test Daily Workflow")
3. Save the workflow

### 2. Set a Schedule

1. Click on the workflow to open it
2. Click "Schedule" or the clock icon
3. Select a preset (e.g., "Every Minute" for testing)
4. Click "Save Schedule"

### 3. Verify Execution

1. Wait for the scheduled time
2. Check the Execution History tab
3. You should see a new execution with status "completed"
4. Verify the "Last Run" time updates

### 4. Test Pause/Resume

1. Open the Schedule Modal
2. Toggle "Enable Scheduled Execution" off
3. Click "Disable Schedule"
4. Verify the workflow doesn't execute at the next scheduled time
5. Re-enable and verify execution resumes

### 5. Test Custom Cron Expression

1. Open the Schedule Modal
2. Enter a custom expression (e.g., `30 14 * * *` for 2:30 PM daily)
3. Verify the breakdown shows correct interpretation
4. Save and verify the next run time

## Troubleshooting

### Cron Job Not Running

1. Check Vercel Cron Jobs in dashboard
2. Verify `vercel.json` has correct configuration
3. Check deployment logs for cron setup errors

### Workflow Not Executing

1. Check `scheduleEnabled` is true
2. Verify `nextExecutedAt` is in the past
3. Check execution logs in `/api/cron/execute`
4. Verify database connection is working

### Failed Executions

1. Check the `error` field in ScheduledExecution
2. Review workflow configuration
3. Verify API keys and integrations are valid
4. Failed workflows are automatically disabled after errors

## Security Notes

- **CRON_SECRET**: Use this to protect your cron endpoint from unauthorized access
- Set this in Vercel Environment Variables
- The cron endpoint checks for `Authorization: Bearer <secret>` header

## Performance Considerations

- Cron job runs every minute - efficient for most use cases
- Workflows are only executed when `nextExecutedAt <= now`
- Failed workflows are automatically disabled to prevent resource waste
- Execution history is limited to recent runs for performance

## Future Enhancements

- [ ] Email notifications for failed executions
- [ ] Slack/Discord webhooks for execution alerts
- [ ] Execution retry logic with exponential backoff
- [ ] Timezone support for cron expressions
- [ ] Execution quotas and rate limiting per user
- [ ] Advanced cron expression validation
- [ ] Execution analytics and reporting

## Files Created/Modified

### Created
- `app/api/cron/execute/route.ts` - Cron execution endpoint
- `components/CronPicker.tsx` - Visual cron expression builder
- `components/ScheduleModal.tsx` - Schedule management modal

### Modified
- `prisma/schema.prisma` - Added ScheduledExecution model
- `app/api/workflows/[id]/schedule/route.ts` - Added PUT endpoint
- `vercel.json` - Added cron job configuration

## Support

For issues or questions:
1. Check the execution logs in Vercel Dashboard
2. Review the database records in Prisma Studio
3. Test the API endpoints directly with curl/Postman
4. Contact the development team

---

**Last Updated:** April 4, 2026  
**Day:** 28  
**Feature:** Background Scheduler (Cron-based Workflow Execution)
