# Clerk Authentication Keys

**Get these from:** https://dashboard.clerk.com

## Step 1: Create Clerk Account
1. Go to https://dashboard.clerk.com
2. Sign up with: harshallahare45@gmail.com
3. Create new application: "HarshAI"

## Step 2: Get API Keys
1. Go to **API Keys** in Clerk dashboard
2. Copy **Publishable Key** (starts with `pk_test_`)
3. Copy **Secret Key** (starts with `sk_test_`)

## Step 3: Add to .env.local

Create file `.env.local` in project root:

```env
# Clerk Authentication
CLERK_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE

# URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Database (for later)
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Redis (for later)
REDIS_URL=redis://default:password@host:6379
```

## Step 4: Install Clerk

```bash
npm install @clerk/nextjs
```

## Step 5: Update layout.tsx

Add ClerkProvider to root layout (already done in app/layout.tsx)

## Step 6: Test

1. Run: `npm run dev`
2. Go to: http://localhost:3000
3. Click "Sign In"
4. Should see Clerk sign-in page
5. Sign up with test email
6. Should redirect to /dashboard

---

**Status:** ⏳ WAITING FOR CLERK KEYS
