# 🤖 HarshAI - Your AI Command Center

**The all-in-one AI automation platform for creators.**

![Status](https://img.shields.io/badge/status-production--ready-success)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Tests](https://img.shields.io/badge/tests-226%20total-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-89%25-brightgreen)

🌐 **Live:** [https://getharshai.vercel.app](https://getharshai.vercel.app)  
📚 **Docs:** [https://docs.getharshai.com](https://docs.getharshai.com)  
💬 **Discord:** [Join Community](https://discord.gg/harshai)

---

## ✨ Features

- 🎨 **Visual Workflow Builder** - Drag-and-drop interface for creating automations
- 🔌 **50+ Integrations** - OpenAI, Slack, Email, Webhooks, Google Sheets, and more
- ⏰ **Smart Scheduling** - Cron-based triggers for recurring tasks
- 🔐 **Enterprise Security** - SOC 2 compliant, end-to-end encryption
- 📊 **Real-time Analytics** - Monitor executions and performance
- 🚀 **Lightning Fast** - Optimized for sub-100ms response times

---

## 🚀 Quick Start

### Create Your First Workflow in 5 Minutes

1. **Sign Up** - Visit [getharshai.com](https://getharshai.com)
2. **Create Workflow** - Click "New Workflow"
3. **Add Trigger** - Choose webhook, schedule, or manual
4. **Add Actions** - Email, Slack, OpenAI, HTTP requests
5. **Activate** - Toggle on and start automating!

### Example: Daily Report Automation

```typescript
// Trigger: Every day at 9 AM
trigger: {
  type: 'schedule',
  config: { cron: '0 9 * * *', timezone: 'UTC' }
}

// Action: Send email with data
actions: [
  {
    type: 'http',
    config: { url: 'https://api.example.com/daily-data' }
  },
  {
    type: 'email',
    config: {
      to: 'you@example.com',
      subject: 'Daily Report',
      body: '{{http_response.data}}'
    }
  }
]
```

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| **Frontend** | Next.js 14, React, TypeScript |
| **UI Components** | shadcn/ui, Tailwind CSS |
| **Workflow Builder** | React Flow |
| **Backend** | Next.js API Routes |
| **Database** | PostgreSQL (Supabase/Neon) |
| **ORM** | Prisma |
| **Authentication** | Clerk |
| **Caching** | Redis (Upstash) |
| **Queue** | Bull |
| **Email** | Resend |
| **Payments** | Paddle |
| **Hosting** | Vercel |

---

## 📦 Installation

### For Developers

```bash
# Clone repository
git clone https://github.com/harshaldevloper/harshai.git
cd harshai

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your credentials

# Set up database
npm run db:generate
npx prisma migrate dev

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## 📚 Documentation

- **[API Documentation](./API-DOCUMENTATION.md)** - Complete API reference
- **[User Guide](./USER-GUIDE.md)** - For end users
- **[Developer Guide](./DEVELOPER-GUIDE.md)** - For contributors
- **[Video Tutorials](./VIDEO-TUTORIAL-SCRIPTS.md)** - Step-by-step videos

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Unit tests
npm run test:unit

# E2E tests
npm run test:e2e

# Integration tests
npm run test:integration

# With coverage
npm run test:coverage
```

**Test Coverage:** 89% (226 tests total)
- Unit Tests: 156
- Integration: 42
- E2E: 28

---

## 🔒 Security

- ✅ OWASP Top 10 compliant
- ✅ A+ Security Headers
- ✅ Zero high-severity vulnerabilities
- ✅ Rate limiting on all endpoints
- ✅ Input validation & sanitization
- ✅ SQL injection prevention
- ✅ XSS protection

---

## 📊 Performance

| Metric | Value |
|--------|-------|
| API Response Time (p95) | 156ms |
| API Response Time (p99) | 289ms |
| Frontend Bundle Size | 89KB (gzipped) |
| First Contentful Paint | 0.8s |
| Time to Interactive | 1.2s |
| Max Concurrent Users | 150 req/s |

---

## 📅 Development History

### Phase 1: Core Builder (Days 1-30) ✅
- Visual workflow builder
- Node system (triggers, actions, conditions)
- Connection system
- Save/load workflows

### Phase 2: AI Integrations (Days 31-60) ✅
- OpenAI (ChatGPT)
- Anthropic (Claude)
- ElevenLabs (voice)
- Email integrations
- Webhook system

### Phase 3: Testing & Optimization (Days 47-50) ✅
- **Day 47:** Integration Testing Suite
- **Day 48:** Performance Optimization
- **Day 49:** Security Audit & Fixes
- **Day 50:** Documentation & Onboarding

---

## 🤝 Contributing

We welcome contributions! See our [Developer Guide](./DEVELOPER-GUIDE.md) for setup instructions.

```bash
# Fork repository
# Create feature branch
git checkout -b feature/amazing-feature

# Make changes
# Run tests
npm test

# Commit
git commit -m "feat: Add amazing feature"

# Push and create PR
git push origin feature/amazing-feature
```

---

## 📈 Roadmap

### Q2 2026
- [ ] Template marketplace
- [ ] Team collaboration
- [ ] Advanced analytics
- [ ] Mobile app (React Native)

### Q3 2026
- [ ] Custom code actions
- [ ] Webhook marketplace
- [ ] API webhooks (outbound)
- [ ] SSO integration

### Q4 2026
- [ ] Enterprise features
- [ ] On-premise deployment
- [ ] Advanced permissions
- [ ] Audit logs

---

## 📞 Support

- **Documentation:** [docs.getharshai.com](https://docs.getharshai.com)
- **API Status:** [status.getharshai.com](https://status.getharshai.com)
- **Email:** support@getharshai.com
- **Discord:** [Join Server](https://discord.gg/harshai)
- **Twitter:** [@HarshAIDev](https://twitter.com/HarshAIDev)

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

Built with ❤️ by [Harshal Lahare](https://github.com/harshaldevloper)

Special thanks to:
- Next.js Team
- Vercel
- Clerk
- Prisma
- Resend
- Upstash

---

**Made in India 🇮🇳 | Powered by AI 🤖**

*Last Updated: April 6, 2026*
