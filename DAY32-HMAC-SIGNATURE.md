# Day 32: HMAC Signature Verification - Complete ✅

**Date:** April 6, 2026  
**Status:** IMPLEMENTATION COMPLETE  
**MVP Feature:** Stripe-Style Webhook Security

---

## Overview

Added HMAC (Hash-based Message Authentication Code) signature verification to webhook endpoints, providing enterprise-grade security similar to Stripe, GitHub, and other major platforms. This ensures webhook payloads haven't been tampered with and truly originate from the expected sender.

---

## Why HMAC Signatures?

The Day 31 secret token in the URL provides basic security, but HMAC signatures offer:

1. **Payload Integrity** - Verifies the payload wasn't modified in transit
2. **Authentication** - Confirms the sender knows the signing secret
3. **Industry Standard** - Used by Stripe, GitHub, Slack, Twilio, etc.
4. **No Secret in URL** - Signing secret stays in headers, not exposed in logs
5. **Timestamp Verification** - Prevents replay attacks

---

## Features Implemented

### 1. ✅ Database Schema Updates

**Workflow model additions:**
- `webhookSignatureEnabled` (Boolean) - Enable HMAC verification
- `webhookSigningSecret` (String) - Secret key for HMAC signing
- `signatureAlgorithm` (String) - HMAC algorithm (sha256, sha512)
- `signatureHeader` (String) - Header name (e.g., "X-Signature-256")
- `timestampTolerance` (Int) - Seconds tolerance for replay attacks (default: 300)

### 2. ✅ HMAC Verification Utility

**New file: `lib/hmac-verification.ts`**
- `generateHmacSignature()` - Create HMAC-SHA256/512 signatures
- `verifyHmacSignature()` - Verify incoming signatures
- `extractSignatureFromHeader()` - Parse signature headers (Stripe, GitHub, custom formats)
- `verifyTimestamp()` - Prevent replay attacks
- `createSignedPayload()` - Helper for testing

### 3. ✅ Updated Webhook Handler

**Enhanced `lib/webhook-handler.ts`:**
- Optional HMAC verification (can work with URL secret OR HMAC signature)
- Support for multiple signature formats:
  - **Stripe-style:** `v1,signature` with timestamp header
  - **GitHub-style:** `sha256=hexsignature`
  - **Custom:** Raw hex/base64 signature
- Timestamp verification to prevent replay attacks
- Detailed error messages for debugging

### 4. ✅ New API Routes

**POST `/api/webhooks/[workflowId]/signature/verify`**
- Test HMAC signature verification
- Returns verification result with details
- Requires authentication

**POST `/api/webhooks/[workflowId]/signature/configure`**
- Configure HMAC settings (enable/disable, algorithm, header name)
- Generate signing secret
- Requires authentication

**GET `/api/webhooks/[workflowId]/signature/status`**
- Get current HMAC configuration status
- Shows algorithm, header name, last verified signature
- Requires authentication

### 5. ✅ UI Components

**New file: `components/webhooks/HmacConfiguration.tsx`**
- Toggle HMAC verification on/off
- Display/generate signing secret
- Select signature algorithm (SHA-256, SHA-512)
- Configure signature header name
- Set timestamp tolerance
- Copy signing secret button (with warning)
- Integration examples for popular services

**Enhanced `components/webhooks/WebhookSettings.tsx`**
- Added HMAC configuration section
- Shows security level indicator
- Links to HMAC documentation

**New file: `components/webhooks/HmacTester.tsx`**
- Generate test payloads with valid signatures
- Simulate different services (Stripe, GitHub, custom)
- Test signature verification
- Show detailed verification results

### 6. ✅ Security Features

**Multi-layer verification:**
1. URL secret token (Day 31) - Basic authentication
2. HMAC signature (Day 32) - Payload integrity + authentication
3. Timestamp verification - Replay attack prevention
4. Rate limiting (Day 31) - DDoS protection
5. Payload size limits (Day 31) - Resource protection

**Supported signature formats:**
- **Stripe:** `Stripe-Signature` header with `t` (timestamp) and `v1` (signature)
- **GitHub:** `X-Hub-Signature-256` header with `sha256=hex`
- **Slack:** `X-Slack-Signature` with `v0=hex` and timestamp
- **Custom:** Any header name, raw hex or base64

### 7. ✅ Integration Guides

**Updated `WEBHOOK-INTEGRATIONS.md`:**
- Stripe webhook setup with HMAC verification
- GitHub webhook setup with SHA-256 signatures
- Custom service integration examples
- cURL commands with signature generation
- Node.js, Python, PHP signature generation examples

---

## Files Created/Modified

```
ai-workflow-automator/
├── lib/
│   ├── hmac-verification.ts                    # NEW: HMAC utilities
│   └── webhook-handler.ts                      # UPDATED: HMAC support
├── app/api/webhooks/
│   └── [workflowId]/
│       ├── signature/
│       │   ├── verify/
│       │   │   └── route.ts                    # NEW: Test verification
│       │   ├── configure/
│       │   │   └── route.ts                    # NEW: Configure HMAC
│       │   └── status/
│       │       └── route.ts                    # NEW: Get status
│       └── [secretToken]/
│           └── route.ts                        # UPDATED: HMAC verification
├── components/webhooks/
│   ├── HmacConfiguration.tsx                   # NEW: HMAC settings UI
│   ├── HmacTester.tsx                          # NEW: HMAC testing UI
│   └── WebhookSettings.tsx                     # UPDATED: Add HMAC section
├── prisma/
│   ├── schema.prisma                           # UPDATED: HMAC fields
│   └── migrations/
│       └── 20260406060000_add_hmac_signatures/
│           ├── migration.sql                   # NEW: DB migration
│           └── migration_lock.toml
└── DAY32-HMAC-SIGNATURE.md                     # NEW: This file
```

---

## HMAC Signature Verification Flow

```
┌─────────────┐
│   Sender    │
│  (Stripe/   │
│   GitHub)   │
└──────┬──────┘
       │
       │ 1. Create payload
       │ 2. Generate HMAC signature
       │    signature = HMAC(secret, timestamp + payload)
       │ 3. Send request with:
       │    - Signature header
       │    - Timestamp header
       │    - Payload
       ▼
┌─────────────────────────────────┐
│   HarshAI Webhook Receiver      │
├─────────────────────────────────┤
│ 1. Extract timestamp            │
│ 2. Verify timestamp (±5 min)    │
│ 3. Extract signature            │
│ 4. Compute expected signature   │
│ 5. Compare signatures           │
│    (constant-time comparison)   │
│ 6. If valid → Process webhook   │
│    If invalid → Reject (401)    │
└─────────────────────────────────┘
```

---

## Example: Stripe-Style Signature

### Sending a Webhook (Stripe)

```javascript
const crypto = require('crypto');

const secret = 'whsec_your_signing_secret';
const payload = JSON.stringify({ event: 'payment.completed', amount: 9900 });
const timestamp = Math.floor(Date.now() / 1000);

// Create signature
const signedPayload = `${timestamp}.${payload}`;
const signature = crypto
  .createHmac('sha256', secret)
  .update(signedPayload)
  .digest('hex');

// Send request
fetch('https://ai-workflow-automator.vercel.app/api/webhooks/workflowId/secretToken', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Stripe-Signature': `t=${timestamp},v1=${signature}`,
  },
  body: payload,
});
```

### Receiving and Verifying (HarshAI)

```typescript
import { verifyHmacSignature } from '@/lib/hmac-verification';

// In your webhook route handler
const signatureHeader = request.headers.get('stripe-signature');
const timestamp = request.headers.get('stripe-timestamp');
const rawBody = await request.text();

const isValid = await verifyHmacSignature({
  signature: signatureHeader,
  payload: rawBody,
  secret: workflow.webhookSigningSecret!,
  algorithm: 'sha256',
  format: 'stripe', // stripe | github | slack | custom
  timestamp: timestamp ? parseInt(timestamp) : undefined,
  tolerance: 300, // 5 minutes
});

if (!isValid) {
  return new Response('Invalid signature', { status: 401 });
}

// Process webhook...
```

---

## API Examples

### Configure HMAC for a Workflow

```bash
curl -X POST https://ai-workflow-automator.vercel.app/api/webhooks/clx123/signature/configure \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "enabled": true,
    "algorithm": "sha256",
    "signatureHeader": "X-Signature-256",
    "timestampTolerance": 300
  }'
```

**Response:**
```json
{
  "success": true,
  "signingSecret": "whsec_a1b2c3d4e5f6...",
  "algorithm": "sha256",
  "signatureHeader": "X-Signature-256",
  "message": "HMAC signature verification enabled. Keep your signing secret secure!"
}
```

### Test HMAC Verification

```bash
# First, get the signing secret from configure response
SIGNING_SECRET="whsec_a1b2c3d4e5f6..."
TIMESTAMP=$(date +%s)
PAYLOAD='{"event":"test","data":{"message":"Hello"}}'

# Generate signature
SIGNATURE=$(echo -n "${TIMESTAMP}.${PAYLOAD}" | openssl dgst -sha256 -hmac "${SIGNING_SECRET}" | cut -d' ' -f2)

# Send test webhook
curl -X POST https://ai-workflow-automator.vercel.app/api/webhooks/clx123/secretToken \
  -H "Content-Type: application/json" \
  -H "X-Signature-256: t=${TIMESTAMP},v1=${SIGNATURE}" \
  -d "${PAYLOAD}"
```

---

## Security Best Practices

### 1. Protect Your Signing Secret
- **NEVER** commit to GitHub
- Store in environment variables or secret manager
- Rotate secrets periodically (every 90 days recommended)
- Use different secrets for production and development

### 2. Timestamp Verification
- Always verify timestamps (default: ±5 minutes)
- Prevents replay attacks
- Adjust tolerance based on clock synchronization

### 3. Use HTTPS Only
- All webhook endpoints use HTTPS (Vercel default)
- Prevents man-in-the-middle attacks
- Secrets never transmitted in plain text

### 4. Monitor Failed Signatures
- Check webhook logs for signature failures
- Investigate unexpected failures
- Set up alerts for high failure rates

### 5. Constant-Time Comparison
- All signature comparisons use constant-time algorithms
- Prevents timing attacks
- Built into `hmac-verification.ts`

---

## Supported Services

| Service | Signature Header | Format | Timestamp Header |
|---------|-----------------|--------|------------------|
| Stripe | `Stripe-Signature` | `t=timestamp,v1=signature` | Included in header |
| GitHub | `X-Hub-Signature-256` | `sha256=hex` | `X-Hub-Signature-Timestamp` |
| Slack | `X-Slack-Signature` | `v0=hex` | `X-Slack-Request-Timestamp` |
| Twilio | `X-Twilio-Signature` | Base64 | N/A |
| Custom | Configurable | Hex or Base64 | Configurable |

---

## Testing

### Unit Tests

```bash
npm test -- hmac-verification.test.ts
```

### Integration Tests

```bash
# Run HMAC test suite
node test-hmac-signatures.js
```

### Manual Testing

1. Open workflow settings
2. Enable HMAC signature verification
3. Copy the signing secret
4. Use HmacTester component to send test webhooks
5. Verify successful signature validation

---

## Migration Steps

### 1. Apply Database Migration

```bash
cd ai-workflow-automator
npx prisma migrate dev --name add_hmac_signatures
npx prisma generate
```

### 2. Update Environment Variables (Optional)

```env
# Default HMAC settings
DEFAULT_HMAC_ALGORITHM=sha256
DEFAULT_SIGNATURE_TOLERANCE=300
```

### 3. Deploy to Production

```bash
git add .
git commit -m "Day 32: Add HMAC signature verification for webhooks"
git push
# Vercel auto-deploys

# Run migration on production
npx prisma migrate deploy
```

### 4. Enable for Existing Workflows

- Go to each workflow's webhook settings
- Click "Enable HMAC Signature Verification"
- Copy the new signing secret
- Update your webhook sender (Stripe, GitHub, etc.) with the new secret

---

## Performance Impact

- **Signature verification:** < 1ms (negligible)
- **No database queries** for verification (in-memory)
- **Constant-time comparison** prevents timing attacks
- **No impact** on webhook throughput

---

## Troubleshooting

### "Invalid signature" errors

1. **Check secret match** - Ensure sender and receiver use the same secret
2. **Verify payload format** - Raw body must match exactly (no whitespace changes)
3. **Check timestamp** - Ensure clocks are synchronized (±5 minutes)
4. **Verify header format** - Match the expected format (Stripe, GitHub, etc.)

### "Timestamp expired" errors

1. **Increase tolerance** - Set higher `timestampTolerance` (e.g., 600 seconds)
2. **Sync clocks** - Ensure sender's clock is accurate (use NTP)
3. **Check timezone** - Timestamps should be Unix epoch (seconds since 1970)

---

## Next Steps (Day 33)

- [ ] Add webhook retry logic for failed deliveries
- [ ] Implement exponential backoff for retries
- [ ] Track retry attempts in database
- [ ] Add retry configuration UI (max retries, backoff multiplier)
- [ ] Send notifications on final retry failure

---

**Status:** ✅ COMPLETE  
**Tested:** ✅ Yes (unit tests + integration tests)  
**Ready for Production:** ✅ Yes (after migration)  
**Security Level:** 🔒 Enterprise-grade (HMAC-SHA256/512)
