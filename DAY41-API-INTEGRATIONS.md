# Day 41: API Integrations Library - Complete ✅

**Date:** April 6, 2026  
**Status:** IMPLEMENTATION COMPLETE  
**MVP Feature:** Pre-built API Connectors

---

## Overview

Implemented a comprehensive API integrations library with pre-built connectors for popular services (Gmail, Slack, Notion, Twitter, GitHub), OAuth 2.0 flow handling, API call nodes with authentication management, and response parsing & mapping utilities.

---

## Features Implemented

### 1. ✅ Pre-built Connectors

**Supported Services:**
- **Gmail:** Send emails, read inbox, search messages, manage labels
- **Slack:** Send messages, post to channels, upload files, user lookup
- **Notion:** Create pages, update databases, query pages, append blocks
- **Twitter/X:** Post tweets, reply, retweet, get timeline, search
- **GitHub:** Create issues, PRs, read repos, manage workflows, webhooks

**Connector Architecture:**
- Unified interface (`IIntegration`)
- Service-specific implementations
- Token refresh handling
- Rate limit awareness
- Error handling with retry logic

### 2. ✅ OAuth 2.0 Flow

**OAuth Flow Support:**
- Authorization code grant
- Client credentials grant
- Refresh token handling
- Token storage & encryption
- Automatic token refresh

**OAuth Configuration:**
- Per-service client ID/secret
- Redirect URI management
- Scope configuration
- State parameter validation
- PKCE support (optional)

**OAuth UI:**
- Connect/disconnect buttons
- Connection status indicators
- Token expiry warnings
- Re-authentication prompts

### 3. ✅ API Call Nodes

**Node Configuration:**
- HTTP method selection (GET, POST, PUT, PATCH, DELETE)
- URL builder with path parameters
- Headers configuration
- Query parameters
- Request body (JSON, form-data, raw)
- Authentication selection

**Authentication Types:**
- OAuth 2.0 (connected accounts)
- API Key (header/query)
- Bearer Token
- Basic Auth
- No Auth (public APIs)

**Response Handling:**
- Status code validation
- Response body parsing (JSON, XML, text)
- Header extraction
- Error response handling
- Timeout configuration

### 4. ✅ Response Parsing & Mapping

**Parsers:**
- JSON parser with path extraction
- XML parser with XPath support
- HTML parser (Cheerio)
- CSV parser
- Plain text extractor

**Mapping:**
- Field mapping (source → destination)
- Array transformation
- Nested object flattening
- Data type conversion
- Default value handling

**Template Variables:**
- `{{response.data.field}}`
- `{{response.headers.x-custom}}`
- `{{response.status}}`
- `{{response.timestamp}}`

---

## Database Schema

### Enhanced Integration Model

```prisma
model Integration {
  id              String   @id @default(cuid())
  name            String   @unique
  logo            String?
  apiEndpoint     String
  authType        String   // api_key, oauth2, none
  isActive        Boolean  @default(true)
  // Day 41: OAuth
  oauthClientId   String?
  oauthClientSecret String? @db.Text
  oauthAuthUrl    String?
  oauthTokenUrl   String?
  oauthScopes     String[]
  oauthRedirectUri String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  connections     IntegrationConnection[]
}
```

### IntegrationConnection Model (New)

```prisma
model IntegrationConnection {
  id              String   @id @default(cuid())
  integrationId   String
  integration     Integration @relation(fields: [integrationId], references: [id], onDelete: Cascade)
  userId          String
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  accountName     String   // User-friendly name (e.g., "john@gmail.com")
  accountId       String   // Service account ID
  accessToken     String   @db.Text
  refreshToken    String?  @db.Text
  tokenExpiry     DateTime?
  scopes          String[]
  status          String   @default("active") // active, expired, revoked, error
  lastUsedAt      DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  metadata        Json?    // Service-specific data

  @@unique([userId, integrationId, accountId])
  @@index([userId])
  @@index([status])
}
```

### ApiCall Node Configuration

```typescript
interface ApiCallNode {
  id: string;
  type: 'api-call';
  data: {
    name: string;
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    url: string;
    authType: 'oauth' | 'api-key' | 'bearer' | 'basic' | 'none';
    connectionId?: string; // For OAuth
    apiKey?: string;
    apiKeyLocation?: 'header' | 'query';
    apiKeyName?: string;
    headers?: Record<string, string>;
    queryParams?: Record<string, string>;
    body?: {
      type: 'json' | 'form-data' | 'raw';
      content: string;
    };
    timeout?: number; // ms
    retryCount?: number;
    parseResponse: boolean;
    outputMapping?: Record<string, string>;
  };
}
```

---

## Library Files

### `lib/integrations/base.ts` (New)

```typescript
export interface IIntegration {
  name: string;
  connect(userId: string, code: string): Promise<IntegrationConnection>;
  disconnect(connectionId: string): Promise<void>;
  refresh(connection: IntegrationConnection): Promise<void>;
  test(connection: IntegrationConnection): Promise<boolean>;
}

export abstract class BaseIntegration implements IIntegration {
  abstract name: string;
  abstract connect(userId: string, code: string): Promise<IntegrationConnection>;
  abstract disconnect(connectionId: string): Promise<void>;
  abstract refresh(connection: IntegrationConnection): Promise<void>;
  abstract test(connection: IntegrationConnection): Promise<boolean>;
  
  protected async encrypt(text: string): Promise<string> { ... }
  protected async decrypt(text: string): Promise<string> { ... }
  protected async makeRequest(config: RequestConfig): Promise<Response> { ... }
}
```

### `lib/integrations/gmail.ts` (New)

- `sendEmail()` - Send email
- `readInbox()` - Get recent emails
- `searchMessages()` - Search with query
- `getAttachment()` - Download attachment
- `createLabel()` - Create/manage labels

### `lib/integrations/slack.ts` (New)

- `sendMessage()` - Post message to channel/DM
- `uploadFile()` - Upload file to channel
- `getChannels()` - List channels
- `getUserInfo()` - Get user details
- `postToWebhook()` - Send to incoming webhook

### `lib/integrations/notion.ts` (New)

- `createPage()` - Create new page
- `updatePage()` - Update page properties
- `queryDatabase()` - Query database with filters
- `appendBlocks()` - Add content blocks
- `getDatabase()` - Get database schema

### `lib/integrations/twitter.ts` (New)

- `postTweet()` - Create tweet
- `replyToTweet()` - Reply to tweet
- `retweet()` - Retweet
- `getTimeline()` - Get user timeline
- `searchTweets()` - Search tweets

### `lib/integrations/github.ts` (New)

- `createIssue()` - Create issue
- `createPullRequest()` - Create PR
- `getRepo()` - Get repo info
- `listIssues()` - List issues
- `createWebhook()` - Add webhook

### `lib/integrations/registry.ts` (New)

- `getIntegration(name)` - Get integration by name
- `listIntegrations()` - List all available
- `registerIntegration()` - Register custom integration

### `lib/api-client.ts` (New)

- `makeApiCall()` - Generic API call executor
- `parseResponse()` - Response parser
- `mapFields()` - Field mapping utility
- `buildUrl()` - URL builder with params
- `validateResponse()` - Response validator

---

## API Endpoints

### Integrations

**GET `/api/integrations`** - List all available integrations

**GET `/api/integrations/[name]`** - Get integration details

**POST `/api/integrations/[name]/connect`** - Start OAuth flow
```json
{
  "redirectUri": "https://app.harshai.com/callback"
}
```

**GET `/api/integrations/[name]/callback`** - OAuth callback handler

**DELETE `/api/integrations/[name]/disconnect`** - Disconnect integration

### Connections

**GET `/api/users/me/connections`** - List user's connections

**GET `/api/users/me/connections/[id]`** - Get connection details

**PATCH `/api/users/me/connections/[id]/refresh`** - Refresh token

**DELETE `/api/users/me/connections/[id]`** - Remove connection

### API Calls

**POST `/api/nodes/api-call/execute`** - Execute API call node
```json
{
  "nodeId": "node_123",
  "workflowId": "wf_456",
  "executionId": "exec_789",
  "inputData": { ... }
}
```

---

## UI Components

### `components/integrations/IntegrationCard.tsx`

- Service logo & name
- Connection status
- Connect/Disconnect button
- Last used timestamp
- Account info

### `components/integrations/ConnectionModal.tsx`

- OAuth redirect
- Connection status
- Scope display
- Error handling
- Success callback

### `components/nodes/ApiCallNode.tsx`

- Method selector
- URL input with variable support
- Auth configuration
- Headers editor
- Body editor (JSON/form/raw)
- Response preview
- Field mapping UI

### `components/nodes/ResponseMapper.tsx`

- Source field picker (from response)
- Destination field input
- Type conversion options
- Default value setting
- Test mapping button

---

## Files Created

```
ai-workflow-automator/
├── lib/
│   └── integrations/
│       ├── base.ts
│       ├── registry.ts
│       ├── gmail.ts
│       ├── slack.ts
│       ├── notion.ts
│       ├── twitter.ts
│       └── github.ts
├── lib/
│   └── api-client.ts
├── app/api/
│   ├── integrations/route.ts
│   ├── integrations/[name]/route.ts
│   ├── integrations/[name]/connect/route.ts
│   ├── integrations/[name]/callback/route.ts
│   ├── integrations/[name]/disconnect/route.ts
│   ├── users/me/connections/route.ts
│   ├── users/me/connections/[id]/route.ts
│   └── nodes/api-call/execute/route.ts
├── components/
│   └── integrations/
│       ├── IntegrationCard.tsx
│       ├── ConnectionModal.tsx
│       ├── IntegrationPicker.tsx
│       └── OAuthCallback.tsx
├── components/nodes/
│   ├── ApiCallNode.tsx
│   └── ResponseMapper.tsx
├── prisma/
│   ├── schema.prisma (updated)
│   └── migrations/20260406140000_add_api_integrations/
└── DAY41-API-INTEGRATIONS.md
```

---

## Example Usage

### Connect to Gmail

```typescript
import { GmailIntegration } from '@/lib/integrations/gmail';

const gmail = new GmailIntegration();

// Start OAuth flow
const authUrl = gmail.getAuthUrl('user-123', 'https://app.com/callback');
// Redirect user to authUrl

// Handle callback
const connection = await gmail.connect('user-123', authCode);

// Send email
await gmail.sendEmail(connection, {
  to: 'recipient@example.com',
  subject: 'Hello',
  body: 'This is a test email',
});
```

### API Call Node Execution

```typescript
import { makeApiCall } from '@/lib/api-client';

const result = await makeApiCall({
  method: 'POST',
  url: 'https://api.example.com/users',
  auth: {
    type: 'bearer',
    token: 'abc123',
  },
  headers: {
    'Content-Type': 'application/json',
  },
  body: {
    type: 'json',
    content: JSON.stringify({ name: 'John' }),
  },
  parseResponse: true,
  outputMapping: {
    userId: 'response.data.id',
    userName: 'response.data.name',
  },
});

// result.output = { userId: '123', userName: 'John' }
```

### Response Mapping

```typescript
import { mapFields } from '@/lib/api-client';

const response = {
  data: {
    user: {
      id: '123',
      profile: {
        name: 'John Doe',
        email: 'john@example.com',
      },
    },
  },
};

const mapping = {
  id: 'data.user.id',
  fullName: 'data.user.profile.name',
  contactEmail: 'data.user.profile.email',
};

const mapped = mapFields(response, mapping);
// { id: '123', fullName: 'John Doe', contactEmail: 'john@example.com' }
```

---

## OAuth Configuration

### Environment Variables

```env
# Gmail
GMAIL_CLIENT_ID=...
GMAIL_CLIENT_SECRET=...
GMAIL_REDIRECT_URI=https://app.harshai.com/api/integrations/gmail/callback

# Slack
SLACK_CLIENT_ID=...
SLACK_CLIENT_SECRET=...
SLACK_REDIRECT_URI=https://app.harshai.com/api/integrations/slack/callback

# Notion
NOTION_CLIENT_ID=...
NOTION_CLIENT_SECRET=...
NOTION_REDIRECT_URI=https://app.harshai.com/api/integrations/notion/callback

# Twitter
TWITTER_CLIENT_ID=...
TWITTER_CLIENT_SECRET=...
TWITTER_REDIRECT_URI=https://app.harshai.com/api/integrations/twitter/callback

# GitHub
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GITHUB_REDIRECT_URI=https://app.harshai.com/api/integrations/github/callback
```

---

## Security Considerations

- **Token Encryption:** All tokens encrypted at rest (AES-256)
- **HTTPS Only:** OAuth callbacks require HTTPS
- **State Validation:** CSRF protection with state parameter
- **Scope Minimization:** Request only necessary scopes
- **Token Rotation:** Automatic refresh before expiry
- **Secure Storage:** Tokens in encrypted DB fields

---

## Benefits

- **Speed:** Pre-built connectors save development time
- **Reliability:** Tested integrations with error handling
- **Security:** OAuth flows implemented correctly
- **Flexibility:** Custom API calls for any REST service
- **Maintainability:** Centralized integration management

---

## Days 36-41 Summary

✅ **Day 36:** Template Marketplace  
✅ **Day 37:** Multi-Step Workflows  
✅ **Day 38:** Error Handling & Logging  
✅ **Day 39:** Workflow Versioning  
✅ **Day 40:** Rate Limiting & Quotas  
✅ **Day 41:** API Integrations Library  

**Integration Phase: IN PROGRESS** 🚀

---

**Status:** ✅ COMPLETE  
**Next:** Day 42 - AI Node Integrations
