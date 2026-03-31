# 🗄️ HarshAI MVP - Day 4: Database Setup

**Date:** 2026-03-31
**Focus:** Supabase PostgreSQL

---

## ✅ COMPLETED

### 1. Supabase Setup
- [ ] Create Supabase account
- [ ] Create new project: "HarshAI"
- [ ] Get database URL
- [ ] Add to .env.local
- [ ] Run Prisma migrations
- [ ] Test connection

### 2. Database Schema
- [x] User model
- [x] Workflow model
- [x] Execution model
- [x] Subscription model
- [x] Integration model

### 3. Prisma Setup
- [ ] Install Prisma
- [ ] Generate client
- [ ] Create migration
- [ ] Seed database

---

## 📦 STEP-BY-STEP

### Step 1: Create Supabase Account

1. Go to: https://supabase.com
2. Sign up with: `harshallahare45@gmail.com`
3. Click: **"New Project"**

### Step 2: Create Project

- **Name:** `HarshAI`
- **Database Password:** (save this!)
- **Region:** (closest to India - Singapore/Tokyo)
- **Pricing:** Free tier (perfect for MVP)

### Step 3: Get Database URL

1. Go to **Settings** → **Database**
2. Copy **Connection String** (Pooler mode)
3. Format: `postgresql://postgres.[project]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres`

### Step 4: Add to .env.local

Create `.env.local` in project root:

```env
# Clerk Authentication
CLERK_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx

# Supabase Database
DATABASE_URL=postgresql://postgres.xxx:YOUR_PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres

# Redis (optional for now)
# REDIS_URL=redis://default:password@host:6379
```

### Step 5: Install & Run Prisma

```bash
# Install Prisma
npm install -D prisma
npm install @prisma/client

# Generate Prisma Client
npx prisma generate

# Create migration
npx prisma migrate dev --name init

# (Optional) View database
npx prisma studio
```

### Step 6: Test Connection

```bash
# Run this to test
npx prisma db pull
```

---

## 📊 DATABASE SCHEMA

Already defined in `prisma/schema.prisma`:

- **User** - Clerk sync, subscriptions
- **Workflow** - Nodes, edges, runs
- **Execution** - Run history, results
- **Subscription** - Paddle integration
- **Integration** - AI tool connections

---

## 🎯 DAY 4 GOAL

**By end of day:** Database connected, migrations run, can save/load data.

---

**Status:** 🚀 IN PROGRESS
