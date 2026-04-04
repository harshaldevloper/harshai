# 🚀 HarshAI MVP - Day 26: Scheduled Workflows (Cron)

**Date:** 2026-04-04 (Day 26 of 90)
**Status:** STARTING

**GitHub:** https://github.com/harshaldevloper/harshai
**Target Commit:** Day 26 - Scheduled Workflows (Cron Triggers)

---

## ✅ DAY 26 OBJECTIVES

### 1. Cron Trigger System
- Add `cron` trigger type to workflow schema
- Support cron expressions (e.g., `0 * * * *` = hourly)
- Store schedules in database

### 2. Background Job Scheduler
- Create background worker to check due schedules
- Execute workflows when cron time matches
- Track last execution time

### 3. Schedule Management UI
- Add schedule settings to workflow editor
- Show next execution time
- Enable/disable schedules

### 4. Common Presets
- Hourly: `0 * * * *`
- Daily: `0 0 * * *`
- Weekly: `0 0 * * 0`
- Monthly: `0 0 1 * *`

---

## 📋 TASKS

### Database Schema
- [ ] Add `Schedule` model to Prisma schema
- [ ] Add `cronExpression` field to Workflow
- [ ] Add `lastExecutedAt` field to Workflow
- [ ] Add `scheduleEnabled` boolean flag
- [ ] Run `prisma db push` to update schema

### Scheduler Service
- [ ] Create `lib/scheduler.ts` service
- [ ] Implement cron expression parser (or use library)
- [ ] Create background job to check every minute
- [ ] Execute workflows when due

### API Endpoints
- [ ] `POST /api/workflows/[id]/schedule` - Set schedule
- [ ] `DELETE /api/workflows/[id]/schedule` - Remove schedule
- [ ] `GET /api/workflows/[id]/schedule` - Get schedule info

### UI Components
- [ ] Add schedule section to workflow settings
- [ ] Cron expression input field
- [ ] Preset buttons (Hourly, Daily, Weekly, Monthly)
- [ ] Show "Next execution: [time]"
- [ ] Enable/disable toggle

### Testing
- [ ] Test schedule creation
- [ ] Test workflow executes at scheduled time
- [ ] Test disable/enable works
- [ ] Verify database updates

---

## 🎯 SUCCESS CRITERIA

- [ ] Can set cron schedule on workflow
- [ ] Background job checks schedules every minute
- [ ] Workflow executes automatically at scheduled time
- [ ] UI shows next execution time
- [ ] Can disable schedule without deleting

---

## 🔧 TECHNICAL NOTES

### Cron Expression Format
```
* * * * *
│ │ │ │ │
│ │ │ │ └─ Day of week (0-7, Sunday=0)
│ │ │ └─── Month (1-12)
│ │ └───── Day of month (1-31)
│ └─────── Hour (0-23)
└───────── Minute (0-59)
```

### Example Schedules
- Every minute: `* * * * *`
- Every hour: `0 * * * *`
- Daily 9 AM: `0 9 * * *`
- Weekly Sunday midnight: `0 0 * * 0`
- Monthly 1st 6 AM: `0 6 1 * *`

### Libraries to Consider
- `cron-parser` - Parse cron expressions
- `node-cron` - Full cron implementation
- Custom simple parser (for basic patterns)

---

**Estimated Time:** 4-5 hours
**Started:** 8:00 AM IST
**Backup:** /backups/day-10-2026-04-04/
