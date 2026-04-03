# 🔑 API Keys Setup Guide

**For:** HarshAI Workflow Automation  
**Last Updated:** 2026-04-03 (Day 18 - Pinterest Added)

---

## 📋 REQUIRED API KEYS

### 1. OpenAI (ChatGPT Actions)

**Required For:** AI text generation, content creation, analysis

**How to Get:**
1. Go to https://platform.openai.com/api-keys
2. Sign in or create account
3. Click "Create new secret key"
4. Copy the key (starts with `sk-...`)

**Environment Variable:**
```bash
OPENAI_API_KEY=sk-...
```

**Pricing:** Free tier available ($5 credit for 3 months)

---

### 2. Gmail (Email Actions)

**Required For:** Sending automated emails

**How to Get:**
1. Go to https://console.cloud.google.com/
2. Create new project or select existing
3. Enable Gmail API
4. Create OAuth2 credentials
5. Get Client ID and Client Secret
6. Use OAuth2 flow to get access token

**Environment Variables:**
```bash
GMAIL_CLIENT_ID=...
GMAIL_CLIENT_SECRET=...
GMAIL_ACCESS_TOKEN=...
# OR use refresh token for long-term access
GMAIL_REFRESH_TOKEN=...
```

**Pricing:** Free (100 quota units/day)

---

### 3. Twitter/X (Tweet Actions)

**Required For:** Posting tweets, threads

**How to Get:**
1. Go to https://developer.twitter.com/
2. Apply for developer account
3. Create new app
4. Generate Bearer Token (for API v2)

**Environment Variable:**
```bash
TWITTER_BEARER_TOKEN=...
```

**Pricing:** Free tier (1,500 tweets/month)

---

### 4. Notion (Page/Database Actions)

**Required For:** Creating pages, updating databases

**How to Get:**
1. Go to https://www.notion.so/my-integrations
2. Click "New integration"
3. Give it a name, select workspace
4. Copy "Internal Integration Token"
5. Share database/page with integration

**Environment Variables:**
```bash
NOTION_API_KEY=secret_...
NOTION_DATABASE_ID=...  # Optional: default database
```

**Pricing:** Free

---

### 5. Slack (Channel Messages)

**Required For:** Sending messages to Slack channels

**How to Get:**
1. Go to https://api.slack.com/apps
2. Click "Create New App"
3. Choose "From scratch"
4. Add "chat:write" scope under OAuth & Permissions
5. Install to workspace
6. Copy "Bot User OAuth Token"

**Environment Variables:**
```bash
SLACK_BOT_TOKEN=xoxb-...
SLACK_CHANNEL_ID=C...  # Optional: default channel
```

**Pricing:** Free

---

### 6. Pinterest (Pin Creation) ✅ NEW

**Required For:** Creating pins, boards, saving products

**How to Get:**
1. Go to https://developers.pinterest.com/
2. Create developer account
3. Create new app
4. Get App ID and App Secret
5. Generate Access Token (Sandbox for testing)

**Environment Variables:**
```bash
PINTEREST_ACCESS_TOKEN=pina_...
PINTEREST_APP_ID=1556085
```

**Note:** Use SANDBOX token for development (Read + Write access)

**Pricing:** Free

---

## 🔐 SECURITY BEST PRACTICES

### DO:
- ✅ Store keys in `.env.local` (never commit to Git)
- ✅ Use Vercel Environment Variables for production
- ✅ Rotate keys periodically
- ✅ Use minimum required permissions

### DON'T:
- ❌ Never commit `.env` files to Git
- ❌ Never share API keys publicly
- ❌ Never hardcode keys in source code
- ❌ Never use production keys in development

---

## 📝 SETUP STEPS

### 1. Create `.env.local` File

```bash
cd ai-workflow-automator
cp .env.example .env.local
```

### 2. Add Your Keys

Edit `.env.local`:
```bash
# OpenAI
OPENAI_API_KEY=sk-...

# Gmail (OAuth2)
GMAIL_CLIENT_ID=...
GMAIL_CLIENT_SECRET=...
GMAIL_ACCESS_TOKEN=...

# Twitter
TWITTER_BEARER_TOKEN=...

# Notion
NOTION_API_KEY=secret_...
NOTION_DATABASE_ID=...

# Slack
SLACK_BOT_TOKEN=xoxb-...
SLACK_CHANNEL_ID=C...
```

### 3. Deploy to Vercel

Add environment variables in Vercel dashboard:
1. Go to project settings
2. Navigate to "Environment Variables"
3. Add each key
4. Redeploy

---

## 🧪 TESTING

### Test OpenAI Integration
```bash
curl -X POST http://localhost:3000/api/execute \
  -H "Content-Type: application/json" \
  -d '{
    "workflowId": "youtube-to-blog",
    "data": {"videoId": "test123"}
  }'
```

### Test Without API Keys
All actions have **mock fallback** - they return mock responses if API keys are not set. This allows testing without configuring all integrations.

---

## 🆘 TROUBLESHOOTING

### "API key not set" Warning
- Check `.env.local` file exists
- Verify key is correctly formatted
- Restart development server

### "Invalid API key" Error
- Regenerate the key
- Check for extra spaces in `.env.local`
- Verify key has correct permissions

### Rate Limit Errors
- Wait and retry (most APIs have rate limits)
- Consider upgrading API plan
- Implement retry logic in workflow

---

## 📚 RESOURCES

- [OpenAI API Docs](https://platform.openai.com/docs)
- [Gmail API Docs](https://developers.google.com/gmail/api)
- [Twitter API v2 Docs](https://developer.twitter.com/en/docs/twitter-api)
- [Notion API Docs](https://developers.notion.com)
- [Slack API Docs](https://api.slack.com)

---

**Questions?** Check the [HarshAI Documentation](https://harshai.vercel.app/docs) or open an issue on GitHub.
