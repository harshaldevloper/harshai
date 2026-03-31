# 🚀 Deploy HarshAI to Vercel

## Quick Deploy (2 minutes)

### Option 1: Vercel Dashboard (Recommended)

1. **Go to** https://vercel.com/new
2. **Import Git Repository:**
   - Click "Import Git Repository"
   - Select your GitHub account
   - Find `harshai` or `ai-workflow-automator` repo
   - Click "Import"

3. **Configure Project:**
   - **Project Name:** `getharshai`
   - **Framework Preset:** Next.js
   - **Root Directory:** `./` (default)
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (default)

4. **Deploy:**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your site will be live at: `https://getharshai.vercel.app`

### Option 2: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
cd /mnt/data/openclaw/workspace/.openclaw/workspace/ai-workflow-automator
vercel --prod
```

### Option 3: Manual Upload

1. Build the project:
```bash
npm install
npm run build
```

2. Upload `.next` folder to Vercel dashboard

---

## Custom Domain (Optional)

After deployment:

1. Go to Vercel Dashboard → Project Settings → Domains
2. Add custom domain (e.g., `getharshai.com`, `harshai.app`)
3. Follow DNS configuration instructions
4. Wait for SSL certificate (5-10 minutes)

---

## Environment Variables

Set these in Vercel Dashboard → Settings → Environment Variables:

```
CLERK_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
PADDLE_API_KEY=pdl_live_xxx
```

---

## Post-Deploy Checklist

- [ ] Site loads at `https://getharshai.vercel.app`
- [ ] All styles render correctly
- [ ] Mobile responsive
- [ ] No console errors
- [ ] Analytics configured (optional)

---

**Live URL:** https://getharshai.vercel.app
