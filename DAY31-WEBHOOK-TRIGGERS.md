# Day 31: Webhook Trigger System - Complete ✅

**Date:** April 4, 2026  
**Status:** IMPLEMENTATION COMPLETE  
**MVP Feature:** External Workflow Triggers

---

## Overview

Built a complete webhook trigger system that allows external services (Typeform, Stripe, GitHub, Calendly, etc.) to trigger HarshAI workflows automatically via HTTP POST requests.

---

## Features Implemented

### 1. ✅ Webhook URL Generation
- Each workflow gets a unique webhook URL
- Format: `https://ai-workflow-automator.vercel.app/api/webhooks/[workflowId]/[secretToken]`
- Secret token auto-generated for security (32-byte hex)
- Prevents unauthorized triggers

### 2. ✅ Database Schema (Prisma)
**Workflow model additions:**
- `webhookEnabled` (Boolean) - Enable/disable webhook
- `webhookSecret` (String, unique) - Secret token for security

**New WebhookLog model:**
- `id` - Unique identifier
- `workflowId` - Foreign key to Workflow
- `payload` (Json) - Incoming webhook data
- `receivedAt` (DateTime) - When webhook was received
- `status` (String) - received | processing | completed | failed
- `response` (Json) - Workflow execution output
- `ipAddress` (String) - Sender's IP for debugging
- `userAgent` (String) - Sender's user agent
- `error` (String) - Error message if failed

### 3. ✅ API Routes

**POST `/api/webhooks/[workflowId]/[secretToken]`**
- Webhook receiver endpoint
- Verifies secret token
- Parses payload (JSON, form-data, x-www-form-urlencoded)
- Logs webhook receipt
- Triggers workflow execution
- Returns success/error response

**GET `/api/webhooks/[workflowId]`**
- Get webhook info (URL, enabled status, logs count)
- Requires authentication (Clerk)
- Verifies workflow ownership

**PATCH `/api/webhooks/[workflowId]`**
- Toggle webhook enabled/disabled
- Auto-generates secret when enabling
- Requires authentication

**POST `/api/webhooks/[workflowId]/regenerate`**
- Regenerate secret token
- Invalidates old webhook URL
- Returns new URL
- Requires authentication

**GET `/api/webhooks/[workflowId]/logs`**
- Get webhook execution logs
- Supports pagination (limit, offset)
- Filter by status
- Requires authentication

### 4. ✅ Webhook Receiver Logic
- **Secret token verification** - Constant-time comparison
- **Payload parsing** - JSON, form-data, x-www-form-urlencoded, multipart
- **Rate limiting** - 100 requests/minute per workflow (in-memory store)
- **Payload size limit** - 1MB max
- **IP/User agent logging** - For debugging and security
- **Workflow execution** - Passes payload as input data
- **Error handling** - Comprehensive error messages

### 5. ✅ UI Components

**WebhookSettings.tsx**
- Enable/disable webhook toggle
- Display webhook URL (masked by default)
- Copy-to-clipboard button
- Show/hide secret toggle
- Regenerate secret button
- Integration examples (Typeform, Stripe, GitHub, etc.)
- Logs count display

**WebhookLogs.tsx**
- Table of received webhooks
- Status badges (completed, failed, processing, received)
- Payload preview (truncated)
- Expandable rows with full details
- Filter by status
- Pagination support
- IP address and user agent display

**WebhookTester.tsx**
- JSON payload editor with syntax validation
- Quick preset payloads:
  - Typeform Submission
  - Stripe Payment
  - GitHub Issue
  - Calendly Booking
- Send test webhook button
- Display test results (success/error)
- Execution time and output display

### 6. ✅ Security Features
- **Secret token verification** - Required in URL, constant-time comparison
- **Rate limiting** - 100 requests/minute per workflow
- **Payload size limit** - 1MB maximum
- **IP logging** - All requests logged with IP address
- **User agent logging** - Track client applications
- **Authentication** - Management endpoints require Clerk auth
- **Ownership verification** - Users can only manage their own webhooks

### 7. ✅ Integration Examples (Documentation)
Complete guide in `WEBHOOK-INTEGRATIONS.md`:
- Typeform → Workflow (form submissions)
- Stripe → Workflow (payment completed)
- Google Forms → Workflow (via Zapier/Make)
- GitHub → Workflow (new issues/PRs)
- Calendly → Workflow (meeting booked)
- Custom HTTP requests (cURL, Python, Node.js examples)

---

## Files Created

```
ai-workflow-automator/
├── lib/
│   └── webhook-handler.ts                    # Core webhook logic
├── app/api/webhooks/
│   └── [workflowId]/
│       ├── [secretToken]/
│       │   └── route.ts                      # Webhook receiver
│       ├── regenerate/
│       │   └── route.ts                      # Regenerate secret
│       ├── logs/
│       │   └── route.ts                      # Get logs
│       └── route.ts                          # Get info / Toggle
├── components/webhooks/
│   ├── WebhookSettings.tsx                   # Settings UI
│   ├── WebhookLogs.tsx                       # Logs table UI
│   └── WebhookTester.tsx                     # Testing UI
├── prisma/
│   ├── schema.prisma                         # Updated with webhook fields
│   └── migrations/
│       └── 20260404080000_add_webhooks/
│           ├── migration.sql                 # Database migration
│           └── migration_lock.toml
├── WEBHOOK-INTEGRATIONS.md                   # Integration guide
└── test-webhooks.js                          # Test script
```

---

## Example Webhook URL

```
https://ai-workflow-automator.vercel.app/api/webhooks/clx123456789/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0
```

**Format:**
- Base URL: `https://ai-workflow-automator.vercel.app`
- Path: `/api/webhooks/[workflowId]/[secretToken]`
- Method: `POST`
- Content-Type: `application/json`

---

## Testing

### cURL Test Command
```bash
curl -X POST https://ai-workflow-automator.vercel.app/api/webhooks/[workflowId]/[secretToken] \
  -H "Content-Type: application/json" \
  -d '{"event": "test", "data": {"message": "Hello from webhook tester"}}'
```

### Expected Response
```json
{
  "success": true,
  "executionId": "clx...",
  "output": {...},
  "executionTime": 123
}
```

### Run Test Script
```bash
node test-webhooks.js
```

---

## Deployment Steps

1. **Apply database migration:**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

2. **Add webhook components to workflow settings page:**
   ```tsx
   import { WebhookSettings, WebhookLogs, WebhookTester } from '@/components/webhooks';
   
   // In your workflow settings page:
   <WebhookSettings workflowId={workflow.id} workflowName={workflow.name} />
   <WebhookTester workflowId={workflow.id} webhookUrl={webhookUrl} />
   <WebhookLogs workflowId={workflow.id} />
   ```

3. **Test locally:**
   ```bash
   npm run dev
   # Open workflow settings and enable webhook
   # Use WebhookTester to send test payload
   ```

4. **Deploy to Vercel:**
   ```bash
   git add .
   git commit -m "Day 31: Add webhook trigger system"
   git push
   # Vercel auto-deploys
   ```

5. **Run migration on production:**
   ```bash
   npx prisma migrate deploy
   ```

---

## Use Cases

### 1. Typeform → Email Notification
- User submits contact form on Typeform
- Webhook triggers workflow
- Workflow sends personalized email via Resend
- Adds lead to Google Sheets CRM

### 2. Stripe → Customer Onboarding
- Customer completes payment
- Stripe sends webhook
- Workflow creates account, sends welcome email, grants access

### 3. GitHub → Slack Notification
- New issue opened in repo
- GitHub sends webhook
- Workflow posts to Slack with issue details

### 4. Calendly → Follow-up Sequence
- Meeting booked via Calendly
- Webhook triggers workflow
- Workflow sends calendar invite, pre-meeting questionnaire, reminder

---

## Security Best Practices

1. **Keep webhook URLs secret** - Don't commit to GitHub
2. **Regenerate secrets periodically** - Especially after team changes
3. **Monitor logs** - Watch for failed executions or suspicious activity
4. **Validate payloads** - Don't trust external data blindly
5. **Use HTTPS only** - All Vercel deployments use HTTPS by default

---

## Performance

- **Rate limiting:** 100 requests/minute per workflow
- **Payload limit:** 1MB per request
- **Logging:** Async, non-blocking
- **Execution:** Workflow runs in background, returns immediately

---

## Next Steps (Day 32+)

- [ ] Add webhook signature verification (HMAC) for services like Stripe
- [ ] Add retry logic for failed webhook deliveries
- [ ] Add webhook analytics (success rate, avg execution time)
- [ ] Support webhook filters (only trigger on specific events)
- [ ] Add scheduled cleanup of old webhook logs (30+ days)

---

**Status:** ✅ COMPLETE  
**Tested:** ✅ Yes (test script passes)  
**Ready for Production:** ✅ Yes (after migration)
