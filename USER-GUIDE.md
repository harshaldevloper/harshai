# 👥 HarshAI User Guide

**Version:** 1.0.0
**Last Updated:** 2026-04-06

---

## 🎯 What is HarshAI?

HarshAI is an AI-powered workflow automation platform that helps you connect your favorite apps and automate repetitive tasks without writing code.

### Key Features
- 🎨 Visual workflow builder
- 🔌 50+ app integrations (OpenAI, Slack, Email, Webhooks)
- ⏰ Scheduled automations
- 📊 Real-time execution monitoring
- 🔐 Enterprise-grade security

---

## 🚀 Getting Started

### 1. Create Your Account

1. Visit [https://getharshai.com](https://getharshai.com)
2. Click **Sign Up**
3. Enter your email and create a password
4. Verify your email address

### 2. Create Your First Workflow

#### Step 1: Navigate to Dashboard
After logging in, you'll see your dashboard. Click **Create Workflow**.

#### Step 2: Choose a Trigger
Every workflow starts with a trigger:
- **Webhook**: Triggered by HTTP requests
- **Schedule**: Run at specific times (cron)
- **Manual**: Run on-demand

Example: Choose **Webhook** trigger.

#### Step 3: Add Actions
Actions are what your workflow does:
- **Send Email**: Email notifications
- **HTTP Request**: Call external APIs
- **Slack Message**: Send Slack notifications
- **OpenAI**: Generate AI content

Example: Add **Email** action.

#### Step 4: Configure Action
Fill in the action details:
- **To**: recipient@example.com
- **Subject**: Workflow Triggered!
- **Body**: Your workflow has been executed successfully.

#### Step 5: Save & Activate
1. Click **Save Workflow**
2. Toggle status to **Active**
3. Copy your webhook URL
4. Test by sending a POST request

---

## 📖 Common Use Cases

### 1. Daily Report Automation

**Goal:** Send yourself a daily summary email every morning.

**Steps:**
1. Create workflow with **Schedule** trigger
2. Set cron: `0 9 * * *` (9 AM daily)
3. Add **HTTP** action to fetch data
4. Add **Email** action to send report
5. Activate workflow

### 2. Lead Notification System

**Goal:** Get Slack notifications when someone fills your contact form.

**Steps:**
1. Create workflow with **Webhook** trigger
2. Copy webhook URL to your form
3. Add **Slack** action
4. Configure Slack channel and message
5. Test with form submission

### 3. AI Content Generator

**Goal:** Generate blog post ideas using OpenAI.

**Steps:**
1. Create workflow with **Webhook** trigger
2. Add **OpenAI** action with prompt
3. Add **Email** or **Slack** action with results
4. Send topic ideas to webhook
5. Receive AI-generated content

### 4. E-commerce Order Processor

**Goal:** Process new orders automatically.

**Steps:**
1. Create workflow with **Webhook** trigger
2. Connect to your e-commerce platform
3. Add **Email** action for confirmation
4. Add **Slack** action for team notification
5. Add **Google Sheets** action to log order

---

## 🎨 Workflow Builder Guide

### Understanding Nodes

**Trigger Node (Green)**
- Starting point of your workflow
- Only one trigger per workflow
- Configured with specific settings

**Action Nodes (Blue)**
- Tasks your workflow performs
- Can have multiple actions
- Execute in order

**Condition Nodes (Yellow)**
- Branch your workflow logic
- If/then/else decisions
- Route based on data

### Connecting Nodes

1. Click the **handle** on the right of a node
2. Drag to the **handle** on the left of another node
3. Release to create connection
4. Data flows from left to right

### Using Variables

Reference data from previous steps:
- `{{webhook.email}}` - Email from webhook
- `{{http_response.data}}` - HTTP response data
- `{{openai_response.choices[0].text}}` - AI response

---

## ⚙️ Settings & Configuration

### Profile Settings
- **Name**: Your display name
- **Email**: Account email
- **Avatar**: Profile picture
- **Timezone**: For scheduled workflows

### Notification Settings
- **Email Notifications**: Get workflow alerts
- **Marketing Emails**: Product updates
- **Execution Alerts**: Failed workflow notifications

### Security Settings
- **Password**: Change password
- **Two-Factor Auth**: Enable 2FA
- **API Keys**: Manage API access
- **Sessions**: View active sessions

---

## 📊 Monitoring & Analytics

### Dashboard Overview
- **Total Workflows**: Number of workflows
- **Active Workflows**: Currently running
- **Executions Today**: Runs in last 24h
- **Success Rate**: Percentage of successful runs

### Execution History
View details for each execution:
- Status (running, completed, failed)
- Start and end times
- Duration
- Input/output data
- Error messages (if failed)

### Usage Statistics
Track your plan usage:
- Workflows created / limit
- Executions run / limit
- Reset date

---

## 🔧 Troubleshooting

### Workflow Not Triggering

**Check:**
1. Is workflow status **Active**?
2. Is trigger configured correctly?
3. For webhooks: Are you sending to correct URL?
4. For schedules: Is cron expression valid?

### Action Not Executing

**Check:**
1. Is action connected to trigger?
2. Are action credentials valid?
3. Check execution logs for errors
4. Verify input data format

### High Error Rate

**Solutions:**
1. Review error messages in execution logs
2. Check API rate limits
3. Verify webhook payloads
4. Test with sample data first

### Slow Performance

**Solutions:**
1. Reduce number of actions
2. Optimize API calls
3. Use caching where possible
4. Check internet connection

---

## 💡 Best Practices

### 1. Naming Conventions
- Use descriptive workflow names
- Include purpose in name: "Daily Report Email" not "Workflow 1"
- Tag workflows for organization

### 2. Error Handling
- Add email notifications for failures
- Test workflows before activating
- Monitor execution logs regularly

### 3. Security
- Keep API keys secret
- Use webhook secrets
- Enable two-factor authentication
- Review active sessions

### 4. Performance
- Limit actions to necessary steps
- Use filters to reduce executions
- Archive unused workflows
- Clean up old executions

---

## 📞 Getting Help

### Documentation
- [API Docs](https://docs.getharshai.com/api)
- [Integration Guides](https://docs.getharshai.com/integrations)
- [Video Tutorials](https://docs.getharshai.com/tutorials)

### Support Channels
- **Email:** support@getharshai.com
- **Discord:** https://discord.gg/harshai
- **Twitter:** @HarshAIDev
- **Status:** https://status.getharshai.com

### Community
- Join our Discord community
- Share workflow templates
- Get help from other users
- Vote on feature requests

---

## 🎓 Learning Resources

### Beginner Tutorials
1. Your First Workflow (5 min)
2. Understanding Triggers (10 min)
3. Working with Actions (15 min)
4. Using Variables (10 min)

### Advanced Topics
1. Conditional Logic (20 min)
2. Error Handling (15 min)
3. API Integrations (30 min)
4. Custom Code Actions (25 min)

### Video Tutorials
- Getting Started (10 min)
- Building Complex Workflows (25 min)
- Integration Deep Dive (40 min)
- Best Practices (15 min)

---

**Happy Automating! 🚀**
