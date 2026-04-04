# Webhook Integration Examples

This guide shows how to connect external services to your HarshAI workflows using webhooks.

## How It Works

Each workflow can have a unique webhook URL:
```
https://ai-workflow-automator.vercel.app/api/webhooks/[workflowId]/[secretToken]
```

- **workflowId**: Your workflow's unique identifier
- **secretToken**: Auto-generated secret for security (prevents unauthorized triggers)

When an external service sends a POST request to this URL, your workflow executes automatically with the payload as input data.

---

## 1. Typeform → Workflow

Trigger a workflow when someone submits your Typeform.

### Setup:
1. In Typeform, go to **Connect** → **Webhooks**
2. Click **Add a webhook**
3. Enter your HarshAI webhook URL
4. Choose **POST** method
5. Test and activate

### Example Payload:
```json
{
  "form_id": "abc123",
  "form_name": "Contact Form",
  "submitted_at": "2026-04-04T12:00:00Z",
  "answers": [
    { "field": "email", "value": "user@example.com" },
    { "field": "name", "value": "John Doe" },
    { "field": "message", "value": "I need help with..." }
  ]
}
```

### Use Cases:
- Auto-respond to form submissions via email
- Add respondents to your CRM
- Create tasks in project management tools
- Send Slack notifications for new leads

---

## 2. Stripe → Workflow

Trigger workflows on payment events (successful payments, refunds, subscriptions, etc.).

### Setup:
1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter your HarshAI webhook URL
4. Select events to listen to:
   - `payment_intent.succeeded`
   - `customer.subscription.created`
   - `charge.refunded`
5. Copy the signing secret (optional, for verification)

### Example Payload (payment_intent.succeeded):
```json
{
  "id": "evt_123456",
  "type": "payment_intent.succeeded",
  "data": {
    "object": {
      "id": "pi_123456",
      "amount": 2999,
      "currency": "usd",
      "customer": "cus_123456",
      "metadata": {
        "order_id": "ORD-001"
      }
    }
  }
}
```

### Use Cases:
- Send order confirmation emails
- Grant access to premium content
- Add customers to email list
- Create invoices in accounting software
- Notify team of new sales in Slack

---

## 3. Google Forms → Workflow (via Zapier/Make)

Google Forms doesn't support webhooks directly, but you can use Zapier or Make as a bridge.

### Setup with Zapier:
1. Create a Zap with **Google Forms** trigger
2. Choose **New Form Response**
3. Connect your Google account and select form
4. Add action: **Webhooks by Zapier**
5. Choose **POST** and enter your HarshAI webhook URL
6. Map form fields to JSON payload
7. Test and turn on Zap

### Example Payload:
```json
{
  "timestamp": "2026-04-04T12:00:00Z",
  "responses": {
    "Email": "user@example.com",
    "Name": "Jane Smith",
    "Interest": "AI Automation",
    "Budget": "$1000-$5000"
  }
}
```

### Use Cases:
- Event registration automation
- Survey response analysis
- Lead qualification workflows
- Feedback collection and routing

---

## 4. GitHub → Workflow

Trigger workflows on GitHub events (new issues, pull requests, pushes, etc.).

### Setup:
1. In your GitHub repo, go to **Settings** → **Webhooks**
2. Click **Add webhook**
3. Payload URL: Your HarshAI webhook URL
4. Content type: **application/json**
5. Select events (or choose **Let me select individual events**)
6. Add webhook

### Example Payload (issue opened):
```json
{
  "action": "opened",
  "issue": {
    "number": 42,
    "title": "Bug: Login not working",
    "user": {
      "login": "octocat",
      "avatar_url": "https://..."
    },
    "body": "When I try to login, I get an error...",
    "labels": ["bug", "urgent"]
  },
  "repository": {
    "name": "my-repo",
    "full_name": "octocat/my-repo",
    "html_url": "https://github.com/octocat/my-repo"
  }
}
```

### Use Cases:
- Auto-assign issues based on labels
- Send notifications to Slack/Discord
- Create tasks in project management tools
- Auto-respond to issues with templates
- Trigger CI/CD workflows

---

## 5. Calendly → Workflow

Trigger workflows when someone books a meeting.

### Setup:
1. In Calendly, go to **Integrations** → **Webhooks**
2. Click **Add New Webhook**
3. Enter your HarshAI webhook URL
4. Select events:
   - **Invitee Created** (new booking)
   - **Invitee Rescheduled**
   - **Invitee Canceled**
5. Save webhook

### Example Payload (invitee.created):
```json
{
  "event": "invitee.created",
  "payload": {
    "email": "client@example.com",
    "name": "Alex Johnson",
    "start_time": "2026-04-10T14:00:00Z",
    "end_time": "2026-04-10T14:30:00Z",
    "event_type": {
      "name": "30 Minute Consultation",
      "duration": 30
    },
    "answers": {
      "What's your company?": "Acme Inc",
      "What do you want to discuss?": "AI automation strategy"
    }
  }
}
```

### Use Cases:
- Send calendar invites via email
- Add attendees to CRM
- Send pre-meeting questionnaires
- Create follow-up tasks
- Notify team of new bookings

---

## 6. Custom Webhook (Any Service)

You can trigger workflows from any service that supports webhooks or HTTP requests.

### Using cURL:
```bash
curl -X POST https://ai-workflow-automator.vercel.app/api/webhooks/[workflowId]/[secretToken] \
  -H "Content-Type: application/json" \
  -d '{"event": "custom", "data": {"key": "value"}}'
```

### Using Python:
```python
import requests

webhook_url = "https://ai-workflow-automator.vercel.app/api/webhooks/[workflowId]/[secretToken]"
payload = {
    "event": "custom_event",
    "data": {
        "user_id": "12345",
        "action": "purchased",
        "product": "Premium Plan"
    }
}

response = requests.post(webhook_url, json=payload)
print(response.json())
```

### Using JavaScript/Node.js:
```javascript
const webhookUrl = 'https://ai-workflow-automator.vercel.app/api/webhooks/[workflowId]/[secretToken]';

const payload = {
  event: 'custom_event',
  data: {
    userId: '12345',
    action: 'purchased',
    product: 'Premium Plan'
  }
};

fetch(webhookUrl, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
})
  .then(res => res.json())
  .then(data => console.log(data));
```

---

## Security Features

### Secret Token
- Each webhook URL includes a unique secret token
- Prevents unauthorized parties from triggering your workflows
- Regenerate anytime from the webhook settings

### Rate Limiting
- 100 requests per minute per workflow
- Prevents abuse and DoS attacks
- Returns 429 status when exceeded

### Payload Size Limit
- Maximum 1MB per request
- Prevents large payload attacks

### IP Logging
- All webhook requests log the sender's IP address
- Useful for debugging and security audits

---

## Best Practices

1. **Keep your webhook URL secret** - Don't share it publicly
2. **Regenerate secrets periodically** - Especially if you suspect a leak
3. **Monitor webhook logs** - Check for failed executions
4. **Validate payloads in your workflow** - Don't trust external data blindly
5. **Use descriptive event names** - Makes debugging easier
6. **Test before going live** - Use the webhook tester tool

---

## Troubleshooting

### Webhook not triggering?
- Check that webhook is **enabled** in settings
- Verify the URL is correct (including secret token)
- Check webhook logs for error messages
- Ensure your workflow is **active**

### Getting 401 Unauthorized?
- Secret token is incorrect or missing
- Regenerate the secret and update your integration

### Getting 429 Too Many Requests?
- You've exceeded the rate limit (100 req/min)
- Wait a minute or implement retry logic with backoff

### Getting 500 Internal Error?
- Check workflow logs for execution errors
- Verify your workflow nodes are configured correctly
- Check that all required credentials are set

---

## Support

Need help? Check the webhook logs in your dashboard or contact support.
