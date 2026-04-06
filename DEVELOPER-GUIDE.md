# 👨‍💻 Developer Setup Guide

**Version:** 1.0.0
**Last Updated:** 2026-04-06

---

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** v20 or higher
- **npm** or **yarn**
- **PostgreSQL** v14 or higher (or use Supabase/Neon)
- **Git** for version control
- **Code Editor** (VS Code recommended)

---

## 🚀 Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/harshaldevloper/harshai.git
cd harshai
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/harshai"

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Email (Resend)
RESEND_API_KEY=re_...

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Application
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Set Up Database

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npx prisma migrate dev

# (Optional) Seed database
npm run db:seed
```

### 5. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## 🏗️ Project Structure

```
harshai/
├── app/                    # Next.js 14 App Router
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Dashboard pages
│   ├── api/               # API routes
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── workflow/         # Workflow builder
│   └── dashboard/        # Dashboard components
├── lib/                  # Utilities and helpers
│   ├── db/              # Database client
│   ├── cache/           # Caching layer
│   ├── security/        # Security utilities
│   └── validators/      # Zod schemas
├── prisma/              # Database schema
│   ├── schema.prisma    # Prisma schema
│   └── migrations/      # Database migrations
├── tests/               # Test files
│   ├── e2e/            # Playwright E2E tests
│   ├── integration/     # Integration tests
│   └── security/        # Security tests
├── public/             # Static assets
└── package.json        # Dependencies
```

---

## 🔧 Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linter
npm run lint

# Run tests
npm test              # All tests
npm run test:unit     # Unit tests only
npm run test:e2e      # E2E tests only
npm run test:integration  # Integration tests

# Database commands
npm run db:generate   # Generate Prisma client
npm run db:push       # Push schema to database
npm run db:studio     # Open Prisma Studio
npm run db:seed       # Seed database
```

---

## 🗄️ Database Setup

### Option 1: Local PostgreSQL

```bash
# Install PostgreSQL (macOS)
brew install postgresql
brew services start postgresql

# Create database
createdb harshai

# Update .env.local
DATABASE_URL="postgresql://user@localhost:5432/harshai"
```

### Option 2: Supabase (Recommended)

1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Get connection string from Settings > Database
4. Update `DATABASE_URL` in `.env.local`

### Option 3: Neon (Serverless)

1. Create account at [neon.tech](https://neon.tech)
2. Create new project
3. Get connection string
4. Update `DATABASE_URL` in `.env.local`

---

## 🔐 Authentication Setup

HarshAI uses Clerk for authentication.

### 1. Create Clerk Account

1. Visit [clerk.com](https://clerk.com)
2. Create free account
3. Create new application

### 2. Get API Keys

1. Go to API Keys in Clerk dashboard
2. Copy Publishable Key
3. Copy Secret Key
4. Add to `.env.local`

### 3. Configure OAuth (Optional)

For Google/GitHub login:
1. Enable providers in Clerk dashboard
2. Configure OAuth credentials
3. Add redirect URLs

---

## 📧 Email Setup

HarshAI uses Resend for transactional emails.

### 1. Create Resend Account

1. Visit [resend.com](https://resend.com)
2. Create free account
3. Get API key from dashboard

### 2. Add to Environment

```env
RESEND_API_KEY=re_...
```

### 3. Verify Domain (Production)

1. Add DNS records in Resend
2. Verify domain ownership
3. Update from address

---

## 🧪 Testing

### Run All Tests

```bash
npm test
```

### Run Specific Test Files

```bash
npx vitest run tests/integration/database.spec.ts
npx playwright test tests/e2e/auth-flow.spec.ts
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

### Test in CI

```bash
npm run test:ci
```

---

## 📦 Building for Production

### 1. Build Application

```bash
npm run build
```

### 2. Check Build Output

```
✓ Compiled successfully
✓ Linting warnings
✓ Type checking
✓ Collecting page data
✓ Finalizing page optimization

Page                              Size
/app                             45.2 kB
/app/dashboard                  128.4 kB
/app/workflows/[id]             156.7 kB
```

### 3. Start Production Server

```bash
npm run start
```

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel
```

### Environment Variables on Vercel

Add all variables from `.env.local` to Vercel project settings.

### Database on Vercel

Use Supabase or Neon for managed PostgreSQL.

---

## 🐛 Debugging

### Enable Debug Logging

```env
# .env.local
DEBUG=true
LOG_LEVEL=debug
```

### View Database Queries

```env
# .env.local
DATABASE_URL="postgresql://...?log_queries=true"
```

### React DevTools

Install React DevTools extension for Chrome/Firefox.

### Network Tab

Use browser DevTools Network tab to inspect API calls.

---

## 📝 Code Style

### ESLint Configuration

HarshAI uses Next.js ESLint configuration.

```bash
npm run lint
```

### Prettier (Optional)

```bash
npm install -D prettier eslint-config-prettier
```

### Commit Messages

Follow conventional commits:
- `feat: Add new feature`
- `fix: Fix bug`
- `docs: Update documentation`
- `test: Add tests`
- `chore: Update dependencies`

---

## 🔒 Security

### Environment Variables

Never commit `.env.local` to Git. Use `.env.example` as template.

### API Keys

Rotate API keys regularly. Use different keys for development and production.

### Dependencies

Regularly update dependencies:
```bash
npm outdated
npm update
npm audit fix
```

---

## 🤝 Contributing

### 1. Fork Repository

### 2. Create Branch

```bash
git checkout -b feature/your-feature
```

### 3. Make Changes

### 4. Run Tests

```bash
npm test
```

### 5. Commit Changes

```bash
git commit -m "feat: Add your feature"
```

### 6. Push and Create PR

```bash
git push origin feature/your-feature
```

---

## 📞 Support

- **Documentation:** https://docs.getharshai.com
- **GitHub Issues:** https://github.com/harshaldevloper/harshai/issues
- **Discord:** https://discord.gg/harshai
- **Email:** support@getharshai.com

---

**Happy Coding! 🚀**
