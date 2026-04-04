# 📧 Email Notification System - Setup Guide

**Day 29 MVP Task - Email Notifications for Workflow Execution Alerts**

This guide walks you through setting up email notifications for the HarshAI workflow automation platform.

---

## 🎯 Overview

The notification system sends email alerts when workflows:
- ✨ **Start** - When a workflow begins execution
- ✅ **Complete** - When a workflow finishes successfully
- ❌ **Fail** - When a workflow encounters an error

Users can customize their notification preferences per workflow or globally.

---

## 📦 What's Included

### Database Schema (Prisma)
- `NotificationPreference` - User notification settings (email, SMS, notification types)
- `Notification` - Log of all sent notifications with delivery status

### API Routes
- `POST /api/notifications/preferences` - Set user preferences
- `GET /api/notifications/preferences` - Get user preferences
- `POST /api/notifications/send` - Trigger email send (internal)
- `POST /api/webhooks/email-delivery` - Handle email service webhooks

### Email Templates (React Email)
- `emails/workflow-started.tsx` - "🚀 Your workflow is now running"
- `emails/workflow-completed.tsx` - "✅ Workflow completed successfully"
- `emails/workflow-failed.tsx` - "❌ Workflow failed" + troubleshooting tips

### UI Components
- `components/NotificationSettings.tsx` - User preferences modal with toggles

### Integration
- `lib/email-service.ts` - Resend.com integration
- Updated `lib/execution-engine.ts` - Triggers notifications on workflow events
- Updated `app/api/cron/execute/route.ts` - Sends notifications for scheduled executions

---

## 🚀 Setup Instructions

### Step 1: Install Dependencies

```bash
cd ai-workflow-automator
npm install resend @react-email/components
```

### Step 2: Get Resend API Key

1. Go to [Resend.com](https://resend.com)
2. Sign up for a free account (3,000 emails/month free tier)
3. Navigate to **API Keys** in the dashboard
4. Create a new API key
5. Copy the key (starts with `re_`)

### Step 3: Configure Environment Variables

Add the following to your `.env.local` file:

```bash
# Email Notifications (Day 29)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
NOTIFICATION_FROM_EMAIL=notifications@yourdomain.com
RESEND_WEBHOOK_SECRET=your-webhook-secret-optional
API_SECRET=your-api-secret-for-internal-calls
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

**Important:** 
- `NOTIFICATION_FROM_EMAIL` must be a verified domain in Resend
- In Resend dashboard, add and verify your domain (e.g., `yourdomain.com`)
- You can use `onboarding@resend.dev` for testing initially

### Step 4: Update Vercel Environment Variables

In your Vercel project dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add the following variables:
   - `RESEND_API_KEY` (set as Production, Preview, Development)
   - `NOTIFICATION_FROM_EMAIL` (e.g., `notifications@harshai.app`)
   - `RESEND_WEBHOOK_SECRET` (optional, for webhook verification)
   - `API_SECRET` (for internal API authentication)
   - `NEXT_PUBLIC_APP_URL` (your production URL)

3. Click **Save**

### Step 5: Run Database Migration

```bash
# Generate Prisma client with new models
npx prisma generate

# Create migration for Notification models
npx prisma migrate dev --name add_notification_system

# (Optional) Deploy to production
npx prisma migrate deploy
```

This will create the `NotificationPreference` and `Notification` tables in your database.

### Step 6: Configure Resend Webhooks (Optional)

To track email delivery status:

1. In Resend dashboard, go to **Webhooks**
2. Create a new webhook
3. Set the endpoint to: `https://your-app.vercel.app/api/webhooks/email-delivery`
4. Select events: `email.sent`, `email.delivered`, `email.bounced`, `email.complained`
5. Save the webhook secret to `RESEND_WEBHOOK_SECRET` env var

### Step 7: Test the System

#### Test 1: Send a Test Notification

```bash
curl -X POST http://localhost:3000/api/notifications/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-api-secret" \
  -d '{
    "executionId": "test-123",
    "workflowId": "workflow-123",
    "workflowName": "Test Workflow",
    "userId": "user-123",
    "type": "success",
    "executionTime": 1500,
    "stepsExecuted": 5
  }'
```

#### Test 2: Create a Test Workflow

1. Go to your app's workflow builder
2. Create a simple workflow
3. Open the workflow settings
4. Click **Notification Settings**
5. Enable email notifications
6. Set your email address
7. Enable "Notify on Success" and "Notify on Failure"
8. Save preferences
9. Run the workflow manually
10. Check your email inbox

#### Test 3: Test Failure Notification

1. Create a workflow with an invalid API key or configuration
2. Enable "Notify on Failure" in notification settings
3. Run the workflow
4. Verify you receive a failure email with error details

---

## 🎨 Email Template Preview

### Workflow Started
```
Subject: 🚀 Your workflow 'Content Generator' is now running

Hi Harshal,

Your workflow "Content Generator" has started running.

Workflow ID: wf_abc123
Started at: 4/4/2026, 12:15 PM IST

We'll send you another email when the workflow completes.

— The HarshAI Team
```

### Workflow Completed
```
Subject: ✅ 'Content Generator' completed successfully

Hi Harshal,

Great news! Your workflow "Content Generator" has completed successfully.

Execution Summary:
- Execution Time: 2.34s
- Steps Executed: 5
- Workflow ID: wf_abc123
- Completed at: 4/4/2026, 12:15 PM IST

— The HarshAI Team
```

### Workflow Failed
```
Subject: ❌ 'Content Generator' failed

Hi Harshal,

Unfortunately, your workflow "Content Generator" encountered an error.

Error Details:
API key invalid. Please check your credentials.

Workflow ID: wf_abc123
Failed at: 4/4/2026, 12:15 PM IST

💡 Troubleshooting Tips:
- Check your API keys and credentials in the workflow settings
- Verify that all connections are properly configured
- Review the error message above for specific details
- Try running the workflow manually from the dashboard
- Contact support if the issue persists

— The HarshAI Team
```

---

## 🔧 Customization

### Change Email Provider

To use SendGrid instead of Resend:

1. Install SendGrid: `npm install @sendgrid/mail`
2. Update `lib/email-service.ts` to use SendGrid
3. Replace `RESEND_API_KEY` with `SENDGRID_API_KEY` in environment variables

### Customize Email Templates

Edit the React Email components in `/emails/`:
- `workflow-started.tsx`
- `workflow-completed.tsx`
- `workflow-failed.tsx`

You can preview templates locally:
```bash
npm install -g react-email
email dev
```

### Add SMS Notifications

1. Integrate Twilio or another SMS provider
2. Add `smsEnabled` and phone number fields to preferences
3. Create SMS templates in `lib/sms-service.ts`
4. Update `/api/notifications/send` to trigger SMS

---

## 📊 Monitoring

### Check Notification Logs

```sql
-- View recent notifications
SELECT * FROM "Notification" 
ORDER BY "sentAt" DESC 
LIMIT 10;

-- Check failed notifications
SELECT * FROM "Notification" 
WHERE status = 'failed' 
ORDER BY "sentAt" DESC;
```

### View Delivery Status

```bash
curl https://your-app.vercel.app/api/webhooks/email-delivery
```

---

## 🐛 Troubleshooting

### Emails Not Sending

1. Check Resend dashboard for delivery logs
2. Verify `RESEND_API_KEY` is correct
3. Ensure domain is verified in Resend
4. Check server logs for error messages

### Preferences Not Saving

1. Verify Clerk authentication is working
2. Check database connection (`DATABASE_URL`)
3. Ensure Prisma client is generated: `npx prisma generate`

### Webhooks Not Working

1. Verify webhook endpoint is publicly accessible
2. Check Resend webhook logs
3. Ensure `RESEND_WEBHOOK_SECRET` matches

---

## 📈 Usage Limits

**Resend Free Tier:**
- 3,000 emails/month
- 100 emails/day
- Unlimited domains
- Basic analytics

**Upgrade if needed:**
- Pro: $20/month (50K emails/month)
- Business: Custom pricing

---

## 📁 File Summary

```
ai-workflow-automator/
├── prisma/
│   └── schema.prisma                    # Added Notification models
├── lib/
│   └── email-service.ts                 # Resend integration
├── app/
│   ├── api/
│   │   ├── notifications/
│   │   │   ├── preferences/
│   │   │   │   └── route.ts             # Get/Set preferences
│   │   │   └── send/
│   │   │       └── route.ts             # Send notifications
│   │   └── webhooks/
│   │       └── email-delivery/
│   │           └── route.ts             # Webhook handler
│   └── cron/
│       └── execute/
│           └── route.ts                 # Updated with notifications
├── components/
│   └── NotificationSettings.tsx         # UI preferences modal
├── emails/
│   ├── workflow-started.tsx             # Email template
│   ├── workflow-completed.tsx           # Email template
│   └── workflow-failed.tsx              # Email template
├── lib/
│   └── execution-engine.ts              # Updated with notifications
├── vercel.json                          # Updated with env vars
└── NOTIFICATIONS-SETUP.md               # This file
```

---

## ✅ Checklist

- [ ] Install `resend` and `@react-email/components`
- [ ] Get Resend API key
- [ ] Add environment variables to `.env.local`
- [ ] Add environment variables to Vercel
- [ ] Run `npx prisma generate`
- [ ] Run `npx prisma migrate dev --name add_notification_system`
- [ ] Verify domain in Resend dashboard
- [ ] Test email sending
- [ ] Configure webhooks (optional)
- [ ] Test with a real workflow

---

## 🎉 You're Done!

Your email notification system is now ready. Users will receive beautiful, informative emails whenever their workflows start, complete, or fail.

**Next Steps:**
- Monitor email delivery in Resend dashboard
- Gather user feedback on email content
- Consider adding weekly/monthly digest emails
- Add click tracking and analytics

---

**Questions?** Check the [Resend Documentation](https://resend.com/docs) or reach out to support.
