# 🔑 API Credential Setup Guides

**Quick access guides for obtaining API keys**

---

## 🤖 OpenAI (ChatGPT)

**What you need:** OpenAI API Key

**Steps:**
1. Go to https://platform.openai.com/api-keys
2. Sign in or create account
3. Click "Create new secret key"
4. Give it a name (e.g., "HarshAI Workflow")
5. Copy the key (starts with `sk-...`)
6. **Important:** Save it immediately - you can't see it again!

**Paste in Settings:** `OPENAI_API_KEY`

**Pricing:** Free tier available ($5 credit for 3 months)

---

## 📌 Pinterest

**What you need:** Pinterest Access Token (Sandbox)

**Steps:**
1. Go to https://developers.pinterest.com/
2. Click "Get Started" or sign in
3. Create new app
4. Get your App ID and App Secret
5. Generate Access Token (choose Sandbox for testing)
6. Copy the token (starts with `pina_...`)

**Paste in Settings:** `PINTEREST_ACCESS_TOKEN`

**Also need:** App ID (for X-API-Source header)

**Pricing:** Free for Sandbox

---

## 📧 Gmail

**What you need:** Gmail Access Token (OAuth2)

**Steps:**
1. Go to https://console.cloud.google.com/
2. Create new project
3. Enable Gmail API
4. Create OAuth2 credentials
5. Get Client ID and Client Secret
6. Use OAuth2 flow to get access token
   - Or use refresh token for long-term access

**Paste in Settings:** `GMAIL_ACCESS_TOKEN` (or `GMAIL_REFRESH_TOKEN`)

**Pricing:** Free (100 quota units/day)

---

## 🐦 Twitter/X

**What you need:** Twitter Bearer Token (API v2)

**Steps:**
1. Go to https://developer.twitter.com/
2. Apply for developer account (free tier available)
3. Create new app
4. Go to "Keys and Tokens"
5. Generate Bearer Token
6. Copy the token

**Paste in Settings:** `TWITTER_BEARER_TOKEN`

**Pricing:** Free tier (1,500 tweets/month)

---

## 📓 Notion

**What you need:** Notion API Key (Internal Integration)

**Steps:**
1. Go to https://www.notion.so/my-integrations
2. Click "New integration"
3. Give it a name (e.g., "HarshAI")
4. Select your workspace
5. Click "Submit"
6. Copy "Internal Integration Token" (starts with `secret_...`)
7. **Important:** Share your database/page with the integration!
   - Go to your database/page
   - Click "..." → "Connections"
   - Add your integration

**Paste in Settings:** `NOTION_API_KEY`

**Pricing:** Free

---

## 💬 Slack

**What you need:** Slack Bot Token

**Steps:**
1. Go to https://api.slack.com/apps
2. Click "Create New App"
3. Choose "From scratch"
4. Give it a name and select workspace
5. Go to "OAuth & Permissions"
6. Add scopes under "Bot Token Scopes":
   - `chat:write` (send messages)
   - `channels:read` (list channels)
7. Click "Install to Workspace"
8. Copy "Bot User OAuth Token" (starts with `xoxb-...`)

**Paste in Settings:** `SLACK_BOT_TOKEN`

**Pricing:** Free

---

## 🔐 Security Tips

- ✅ Store keys in environment variables (never in code)
- ✅ Use Vercel Environment Variables for production
- ✅ Rotate keys periodically
- ✅ Use minimum required permissions
- ❌ Never commit `.env` files to Git
- ❌ Never share API keys publicly

---

## 🆘 Troubleshooting

**"Invalid API key" error:**
- Check for extra spaces in the key
- Verify key has correct permissions
- Try regenerating the key

**"Rate limit exceeded" error:**
- Wait and retry (most APIs have rate limits)
- Consider upgrading API plan
- Implement retry logic

**"Token expired" error:**
- Some tokens expire (especially OAuth2)
- Use refresh tokens for long-term access
- Re-authenticate if needed

---

**Need help?** Check the official documentation for each service or contact support.
