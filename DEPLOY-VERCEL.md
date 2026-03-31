# 🚀 Deploy HarshAI to Vercel

**Last Updated:** 2026-03-31
**Status:** ✅ Ready to deploy

---

## ✅ PRE-DEPLOY CHECKLIST

- [x] Clerk API keys added to `.env.local`
- [x] Authentication pages created (sign-in, sign-up, dashboard)
- [x] Middleware configured
- [x] API routes ready (workflows CRUD)
- [x] Database schema ready (needs Supabase)

---

## 📦 STEP 1: ADD ENV VARS TO VERCEL

**Since .env.local is not committed (for security), add these to Vercel:**

### **Go to Vercel Dashboard:**
1. https://vercel.com/dashboard
2. Select project: **`getharshai`**
3. Go to **Settings** → **Environment Variables**

### **Add These Variables:**

| Name | Value | Environment |
|------|-------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_test_dHJ1ZS10YWhyLTU0LmNsZXJrLmFjY291bnRzLmRldiQ` | Production, Preview, Development |
| `CLERK_SECRET_KEY` | `sk_test_dCPiciRHKpAAkxNhAESDX95fzoZw4F9OkvZ19lUhpXx` | Production, Preview, Development |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` | All |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` | All |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | `/dashboard` | All |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | `/dashboard` | All |

**Click "Save"** after adding all variables.

---

## 🔄 STEP 2: REDEPLOY

After adding environment variables:

1. Go to **Deployments** tab
2. Click **"Redeploy"** on the latest deployment
3. Or push a new commit to trigger auto-deploy

**Vercel will rebuild with Clerk authentication!**

---

## 🧪 STEP 3: TEST

Once deployed:

1. Go to: `https://getharshai.vercel.app`
2. Click **"Sign In"** or **"Get Started"**
3. Should see Clerk sign-in page
4. Sign up with test email
5. Should redirect to: `/dashboard`
6. Should see welcome message!

---

## 🗄️ STEP 4: DATABASE (OPTIONAL FOR NOW)

Database can be added later:

1. Create Supabase account: https://supabase.com
2. Create project: "HarshAI"
3. Copy connection string
4. Add to Vercel: `DATABASE_URL`
5. Run migrations: `npx prisma migrate deploy`

**For now, the app works without database (auth only)!**

---

## 🎯 CURRENT STATUS

| Feature | Status |
|---------|--------|
| Landing Page | ✅ Live |
| Authentication | ✅ Ready (needs Vercel env vars) |
| Dashboard | ✅ Ready (protected route) |
| API Routes | ✅ Ready (workflows CRUD) |
| Database | ⏳ Pending (Supabase setup) |

---

## 🔗 LINKS

- **Live URL:** https://getharshai.vercel.app
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Clerk Dashboard:** https://dashboard.clerk.com

---

**Ready to deploy! Add env vars to Vercel and redeploy!** 🚀
