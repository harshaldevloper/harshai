# 🎬 Video Tutorial Scripts

**HarshAI Tutorial Series**
**Version:** 1.0.0

---

## Video 1: Getting Started with HarshAI (10 minutes)

### Intro (0:00-0:30)
**[Screen: HarshAI landing page]**

**Narrator:** "Welcome to HarshAI - your AI command center for workflow automation. In this tutorial, I'll show you how to create your first automated workflow in under 10 minutes."

### Account Setup (0:30-2:00)
**[Screen: Sign up page]**

**Narrator:** "First, let's create your account. Visit getharshai.com and click Sign Up. Enter your email, create a strong password, and verify your email address."

**[Screen: Email verification]**

**Narrator:** "Check your inbox for the verification email. Click the link, and you're in!"

### Dashboard Overview (2:00-3:30)
**[Screen: Dashboard]**

**Narrator:** "Welcome to your dashboard! Here you can see all your workflows, recent executions, and usage statistics. Let's create our first workflow."

### Creating First Workflow (3:30-7:00)
**[Screen: Workflow builder]**

**Narrator:** "Click 'Create Workflow'. Every workflow starts with a trigger. We'll use a webhook trigger - perfect for connecting external apps."

**[Screen: Configure webhook]**

**Narrator:** "Name it 'Welcome Email', set the webhook path to '/welcome', and save. Now let's add an action."

**[Screen: Add email action]**

**Narrator:** "Click 'Add Action', choose 'Email'. Fill in the recipient, subject 'Welcome!', and a friendly message. Save the action."

### Testing (7:00-8:30)
**[Screen: Test workflow]**

**Narrator:** "Activate the workflow and copy the webhook URL. Let's test it with a simple POST request."

**[Screen: Terminal with curl command]**

**Narrator:** "Send a POST request... and check your email! You should see the welcome message."

### Outro (8:30-10:00)
**[Screen: Dashboard with new workflow]**

**Narrator:** "Congratulations! You've created your first automated workflow. In the next video, we'll explore advanced triggers and actions. Subscribe for more tutorials!"

---

## Video 2: Building Complex Workflows (25 minutes)

### Intro (0:00-1:00)
**[Screen: Complex workflow diagram]**

**Narrator:** "Welcome back! Today we're building a multi-step workflow with conditions and multiple actions."

### Use Case: Lead Processing (1:00-3:00)
**[Screen: Workflow requirements]**

**Narrator:** "We'll create a lead processing system that: receives form submissions, qualifies leads with AI, sends different emails based on score, and notifies the sales team on Slack."

### Step 1: Webhook Trigger (3:00-5:00)
**[Screen: Webhook configuration]**

**Narrator:** "Start with a webhook trigger. Configure it to accept POST requests with lead data: name, email, company, and message."

### Step 2: OpenAI Qualification (5:00-10:00)
**[Screen: OpenAI action]**

**Narrator:** "Add an OpenAI action to score the lead. Our prompt: 'Score this lead from 1-10 based on: company size, budget mentions, and urgency.' Pass the lead data as context."

### Step 3: Condition Node (10:00-15:00)
**[Screen: Condition configuration]**

**Narrator:** "Now add a condition: if score is greater than 7, route to high-priority path. Otherwise, route to standard path. This is where the magic happens!"

### Step 4: Email Actions (15:00-18:00)
**[Screen: Email actions]**

**Narrator:** "Add two email actions: one for high-priority leads with personal introduction, another for standard leads with automated response. Use variables to personalize each email."

### Step 5: Slack Notification (18:00-21:00)
**[Screen: Slack action]**

**Narrator:** "For high-priority leads, add a Slack notification to the sales channel. Include lead details and AI score. The team will love this!"

### Testing End-to-End (21:00-24:00)
**[Screen: Test with real data]**

**Narrator:** "Let's test with a real lead. Send a webhook with sample data... Watch it flow through the workflow... Perfect! High-score lead got the VIP treatment."

### Outro (24:00-25:00)
**[Screen: Workflow analytics]**

**Narrator:** "You've just built a production-ready lead processing system! Next time, we'll integrate with external APIs. See you then!"

---

## Video 3: API Integrations Deep Dive (40 minutes)

### Intro (0:00-2:00)
**[Screen: API integration examples]**

**Narrator:** "Today's advanced tutorial: integrating external APIs. We'll connect to Stripe, Google Sheets, and Twitter."

### Understanding HTTP Actions (2:00-8:00)
**[Screen: HTTP action configuration]**

**Narrator:** "The HTTP action is your gateway to any API. Configure method, URL, headers, and body. Let's start with a simple GET request."

### Integration 1: Stripe Payments (8:00-18:00)
**[Screen: Stripe API docs]**

**Narrator:** "First, Stripe! We'll create a workflow that sends a receipt email after successful payment."

**[Screen: Workflow building]**

**Narrator:** "Webhook trigger for Stripe events... Verify signature... Extract customer data... Send personalized receipt. Done!"

### Integration 2: Google Sheets (18:00-28:00)
**[Screen: Google Cloud Console]**

**Narrator:** "Next, Google Sheets. We'll log every workflow execution to a spreadsheet for reporting."

**[Screen: OAuth setup]**

**Narrator:** "Set up Google Cloud project, enable Sheets API, create credentials, and connect via OAuth. Now append rows automatically!"

### Integration 3: Twitter Posts (28:00-35:00)
**[Screen: Twitter API setup]**

**Narrator:** "Finally, Twitter! Automatically tweet when workflows reach milestones."

**[Screen: Twitter workflow]**

**Narrator:** "Condition: if execution count > 100... Post to Twitter with stats. Your followers will see your automation wins!"

### Error Handling (35:00-38:00)
**[Screen: Error handling]**

**Narrator:** "Always add error handling. If API fails, retry 3 times, then send alert email. Production-ready workflows handle failures gracefully."

### Outro (38:00-40:00)
**[Screen: All integrations working]**

**Narrator:** "You're now an API integration master! The possibilities are endless. Join our Discord to share your creations!"

---

## Video 4: Best Practices & Tips (15 minutes)

### Intro (0:00-1:00)
**[Screen: Best practices checklist]**

**Narrator:** "Final video! Let's cover best practices to make your workflows production-ready."

### Naming Conventions (1:00-3:00)
**[Screen: Good vs bad naming]**

**Narrator:** "Name matters! 'Daily Report Email' is better than 'Workflow 1'. Tag workflows: 'marketing', 'sales', 'internal'."

### Error Handling (3:00-6:00)
**[Screen: Error handling setup]**

**Narrator:** "Always add error notifications. Email yourself on failures. Set up retry logic for transient errors."

### Security (6:00-9:00)
**[Screen: Security settings]**

**Narrator:** "Protect your workflows: use webhook secrets, rotate API keys, enable 2FA, review active sessions regularly."

### Performance (9:00-12:00)
**[Screen: Performance monitoring]**

**Narrator:** "Optimize for speed: minimize actions, use caching, filter early, archive old workflows. Monitor execution times."

### Testing (12:00-14:00)
**[Screen: Testing workflow]**

**Narrator:** "Test before activating! Use sample data, check all paths, verify integrations, monitor first few executions."

### Outro (14:00-15:00)
**[Screen: HarshAI logo]**

**Narrator:** "You're now a HarshAI expert! Go build something amazing. Subscribe for updates and new features. Happy automating!"

---

## Production Notes

### Equipment
- Screen recording: OBS Studio (1080p, 60fps)
- Microphone: Blue Yeti or similar
- Editing: DaVinci Resolve or Premiere Pro

### Style Guide
- Clear, friendly narration
- Show, don't just tell
- Use zoom-ins for details
- Add text overlays for key points
- Background music: Upbeat, non-distracting

### Publishing
- YouTube: Main platform
- TikTok/Shorts: Cut highlights
- Website: Embed with transcripts
- Social: Promote with clips

---

**Total Runtime:** 90 minutes
**Target Audience:** Beginners to Intermediate
**Difficulty:** Progressive (easy → advanced)
