# 📚 HarshAI API Documentation

**Version:** 1.0.0
**Base URL:** `https://api.getharshai.com`
**Authentication:** Bearer Token (JWT)

---

## 🚀 Quick Start

```bash
# Get your API token from Settings > API Keys
export HARSHAI_TOKEN="your_api_token"

# Test authentication
curl -H "Authorization: Bearer $HARSHAI_TOKEN" \
  https://api.getharshai.com/api/user/profile
```

---

## 🔐 Authentication

All API requests require a Bearer token in the Authorization header:

```
Authorization: Bearer <your_token>
```

### Obtaining a Token

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your_password"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 86400,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

---

## 📡 Endpoints

### Workflows

#### List Workflows
```http
GET /api/workflows
```

**Query Parameters:**
- `page` (integer): Page number (default: 1)
- `pageSize` (integer): Items per page (default: 20, max: 100)
- `status` (string): Filter by status (draft, active, paused, archived)
- `search` (string): Search in name and description

**Response:**
```json
{
  "workflows": [
    {
      "id": "uuid",
      "name": "My Workflow",
      "description": "Workflow description",
      "status": "active",
      "createdAt": "2026-04-06T10:00:00Z",
      "updatedAt": "2026-04-06T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

#### Create Workflow
```http
POST /api/workflows
Content-Type: application/json

{
  "name": "New Workflow",
  "description": "Workflow description",
  "trigger": {
    "type": "webhook",
    "config": {
      "method": "POST",
      "path": "/webhook/my-webhook"
    }
  },
  "actions": [
    {
      "type": "email",
      "config": {
        "to": "user@example.com",
        "subject": "Workflow Triggered",
        "body": "Your workflow has been executed."
      }
    }
  ]
}
```

**Response:**
```json
{
  "workflow": {
    "id": "uuid",
    "name": "New Workflow",
    "status": "draft",
    "createdAt": "2026-04-06T10:00:00Z"
  }
}
```

#### Get Workflow
```http
GET /api/workflows/:id
```

**Response:**
```json
{
  "workflow": {
    "id": "uuid",
    "name": "My Workflow",
    "description": "Description",
    "trigger": {
      "type": "webhook",
      "config": {}
    },
    "actions": [],
    "status": "active",
    "createdAt": "2026-04-06T10:00:00Z",
    "updatedAt": "2026-04-06T10:00:00Z"
  }
}
```

#### Update Workflow
```http
PUT /api/workflows/:id
Content-Type: application/json

{
  "name": "Updated Name",
  "description": "Updated description",
  "status": "active"
}
```

#### Delete Workflow
```http
DELETE /api/workflows/:id
```

**Response:**
```json
{
  "success": true,
  "message": "Workflow deleted successfully"
}
```

#### Execute Workflow
```http
POST /api/workflows/:id/execute
Content-Type: application/json

{
  "inputData": {
    "key": "value"
  }
}
```

**Response:**
```json
{
  "execution": {
    "id": "uuid",
    "status": "running",
    "startedAt": "2026-04-06T10:00:00Z"
  }
}
```

---

### Executions

#### List Executions
```http
GET /api/executions
```

**Query Parameters:**
- `workflowId` (string): Filter by workflow
- `status` (string): Filter by status (running, completed, failed)
- `startDate` (string): ISO 8601 date
- `endDate` (string): ISO 8601 date

#### Get Execution
```http
GET /api/executions/:id
```

**Response:**
```json
{
  "execution": {
    "id": "uuid",
    "workflowId": "uuid",
    "status": "completed",
    "startedAt": "2026-04-06T10:00:00Z",
    "completedAt": "2026-04-06T10:00:05Z",
    "duration": 5000,
    "inputData": {},
    "outputData": {},
    "error": null
  }
}
```

#### Cancel Execution
```http
POST /api/executions/:id/cancel
```

---

### User

#### Get Profile
```http
GET /api/user/profile
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name",
    "plan": "pro",
    "createdAt": "2026-04-06T10:00:00Z"
  }
}
```

#### Get Usage
```http
GET /api/user/usage
```

**Response:**
```json
{
  "usage": {
    "workflowsCount": 15,
    "workflowsLimit": 50,
    "executionsCount": 450,
    "executionsLimit": 1000,
    "resetDate": "2026-05-06T00:00:00Z"
  }
}
```

#### Update Settings
```http
PUT /api/user/settings
Content-Type: application/json

{
  "emailNotifications": true,
  "marketingEmails": false,
  "timezone": "America/New_York",
  "theme": "dark"
}
```

---

### Webhooks

#### List Webhooks
```http
GET /api/webhooks
```

#### Create Webhook
```http
POST /api/webhooks
Content-Type: application/json

{
  "workflowId": "uuid",
  "url": "https://your-server.com/webhook",
  "events": ["execution.completed", "execution.failed"]
}
```

#### Test Webhook
```http
POST /api/webhooks/test
Content-Type: application/json

{
  "url": "https://your-server.com/webhook",
  "payload": {
    "test": "data"
  }
}
```

---

## ❌ Error Responses

### 400 Bad Request
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "name",
      "message": "Name is required"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "error": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "error": "You do not have permission to access this resource"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 429 Too Many Requests
```json
{
  "error": "Too many requests, please try again later.",
  "retryAfter": 60
}
```

### 500 Internal Server Error
```json
{
  "error": "An unexpected error occurred",
  "requestId": "req_abc123"
}
```

---

## 🔒 Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| Authentication | 10 req | 1 minute |
| Workflow Creation | 20 req | 1 minute |
| General API | 100 req | 1 minute |
| Webhooks | 50 req | 1 minute |
| File Uploads | 5 req | 1 minute |

Rate limit headers are included in all responses:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: Unix timestamp when limit resets

---

## 📝 SDK Examples

### JavaScript/Node.js
```javascript
const HarshAI = require('harshai-sdk');

const client = new HarshAI({
  apiKey: 'your_api_key',
});

// List workflows
const workflows = await client.workflows.list();

// Create workflow
const workflow = await client.workflows.create({
  name: 'My Workflow',
  trigger: { type: 'webhook', config: {} },
  actions: [],
});

// Execute workflow
const execution = await client.workflows.execute(workflow.id);
```

### Python
```python
from harshai import HarshAI

client = HarshAI(api_key='your_api_key')

# List workflows
workflows = client.workflows.list()

# Create workflow
workflow = client.workflows.create(
    name='My Workflow',
    trigger={'type': 'webhook', 'config': {}},
    actions=[]
)

# Execute workflow
execution = client.workflows.execute(workflow.id)
```

### cURL
```bash
# List workflows
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.getharshai.com/api/workflows

# Create workflow
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"My Workflow","trigger":{"type":"webhook","config":{}},"actions":[]}' \
  https://api.getharshai.com/api/workflows
```

---

## 📞 Support

- **Documentation:** https://docs.getharshai.com
- **API Status:** https://status.getharshai.com
- **Support Email:** support@getharshai.com
- **Discord:** https://discord.gg/harshai

---

**Last Updated:** 2026-04-06
**API Version:** 1.0.0
