# 🚀 JetDash Deployment - Fixing Rider Dashboard on Vercel

## Problem Summary

Your rider dashboard is not working after deploying to Vercel because:

1. **Environment variables are not set** in Vercel
2. **Supabase Edge Functions are not deployed**
3. **App is running in offline/demo mode** instead of production mode
4. **Routing configuration was missing** (now fixed with vercel.json)

## ✅ Complete Solution (Step-by-Step)

### Step 1: Configure Vercel Environment Variables

1. Go to https://vercel.com/dashboard
2. Select your JetDash project
3. Go to **Settings** → **Environment Variables**
4. Add these variables for **ALL environments** (Production, Preview, Development):

```env
VITE_SUPABASE_URL=https://ohrfailvvemfbwzoibfs.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ocmZhaWx2dmVtZmJ3em9pYmZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3NTAwOTcsImV4cCI6MjA3NDMyNjA5N30.XRpCRzpf59Kl31t3CrPcgNaP90P1XskysqPkq2lDjcU
VITE_APP_ENV=production
VITE_PAYSTACK_PUBLIC_KEY=pk_test_YOUR_PAYSTACK_KEY
VITE_FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-YOUR_FLUTTERWAVE_KEY
```

**Important**: Click "Save" after each variable!

### Step 2: Deploy Supabase Backend

Your backend server needs to be deployed to Supabase Edge Functions:

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref ohrfailvvemfbwzoibfs

# Navigate to the functions directory
cd supabase/functions

# Deploy the Edge Function
supabase functions deploy make-server-aaf007a1 --project-ref ohrfailvvemfbwzoibfs
```

### Step 3: Redeploy on Vercel

After adding environment variables:

**Option A: Automatic (recommended)**
```bash
git add .
git commit -m "Fix deployment configuration"
git push
```

**Option B: Manual**
1. Go to Vercel dashboard → **Deployments**
2. Find latest deployment
3. Click **...** menu → **Redeploy**
4. Uncheck "Use existing Build Cache"
5. Click **Redeploy**

### Step 4: Verify Deployment

Visit your deployed app and add `?screen=deployment-check` to the URL:
```
https://your-app.vercel.app/?screen=deployment-check
```

This will show you:
- ✅ Environment Variables Status
- ✅ Supabase Connection Status
- ✅ Edge Function Status
- ✅ API Endpoints Status
- ✅ Browser Compatibility

Alternatively, click "System Check" link in the footer of the landing page.

## 🧪 Testing the Rider Dashboard

After deployment:

1. Go to your deployed app
2. Click **Login**
3. Select **Rider** user type
4. Enter any test credentials:
   - Email: `rider@jetdash.ng`
   - Password: `password123`
5. You should see the rider dashboard with:
   - Available deliveries list
   - Earnings statistics
   - Online/Offline toggle
   - Real-time updates

## 🔍 Troubleshooting Common Issues

### Issue #1: Rider Dashboard is Blank

**Symptoms:**
- White/blank screen after login
- "Loading..." message never ends
- Console shows API errors

**Solutions:**

1. **Check Environment Variables:**
   ```bash
   # In your local terminal with Vercel CLI
   vercel env ls
   ```
   Make sure all `VITE_*` variables are there.

2. **Check Browser Console:**
   - Press F12 to open DevTools
   - Check Console tab for error messages
   - Check Network tab for failed API calls
   - Look for messages about "offline mode"

3. **Force Online Mode:**
   - Open browser console (F12)
   - Run: `localStorage.removeItem('jetdash_force_offline')`
   - Refresh the page

### Issue #2: "Offline Mode" / "Using Mock Data"

**Symptom:** Banner showing "Running in offline mode"

**Cause:** App cannot connect to Supabase backend

**Solutions:**

1. **Verify Edge Function is deployed:**
   ```bash
   curl https://ohrfailvvemfbwzoibfs.supabase.co/functions/v1/make-server-aaf007a1/health
   ```
   Should return: `{"status":"healthy"}`
   
   If 404: Edge Function not deployed - go back to Step 2

2. **Check environment variables are set correctly:**
   - Go to Vercel dashboard → Settings → Environment Variables
   - Verify all variables are present
   - Make sure there are no typos or extra spaces

3. **Check Supabase project is active:**
   - Go to https://supabase.com/dashboard
   - Verify project `ohrfailvvemfbwzoibfs` is active and not paused

### Issue #3: CORS Errors

**Symptom:** Console shows CORS policy errors

**Solutions:**

1. Check that Edge Function is deployed correctly
2. Verify the CORS configuration in `/supabase/functions/server/index.tsx`
3. Make sure the Supabase URL in environment variables matches your project

### Issue #4: 404 on Page Refresh

**Symptom:** Refreshing any non-root URL shows 404

**Solution:** This should be fixed by the `vercel.json` file. If still happening:
1. Verify `vercel.json` exists in root directory
2. Redeploy with build cache disabled
3. Clear browser cache and try again

### Issue #5: Payment Not Working

**Symptom:** Payment screen shows errors

**Solutions:**

1. **Add payment gateway keys:**
   - Get Paystack key from: https://dashboard.paystack.com/#/settings/developer
   - Get Flutterwave key from: https://dashboard.flutterwave.com/settings/apis
   - Add to Vercel environment variables

2. **Use Test Keys for Development:**
   - Paystack test key starts with `pk_test_`
   - Flutterwave test key starts with `FLWPUBK_TEST-`

## 📋 Pre-Deployment Checklist

Before considering deployment complete:

- [ ] All environment variables set in Vercel
- [ ] Supabase Edge Function deployed successfully
- [ ] Deployment Check page shows all green ✅
- [ ] Can login as Customer
- [ ] Can login as Rider
- [ ] Can login as SME
- [ ] Rider dashboard shows available deliveries
- [ ] Real-time updates working
- [ ] No errors in browser console
- [ ] All API calls succeed (check Network tab)
- [ ] Page routes work on refresh (no 404s)

## 🎯 Quick Test Commands

Test backend health:
```bash
curl https://ohrfailvvemfbwzoibfs.supabase.co/functions/v1/make-server-aaf007a1/health
```

Expected response:
```json
{"status":"healthy","timestamp":"2024-..."}
```

Test authentication endpoint:
```bash
curl -X POST https://ohrfailvvemfbwzoibfs.supabase.co/functions/v1/make-server-aaf007a1/auth/test \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

## 📁 New Files Added

This fix added the following files:

1. **`/vercel.json`** - Vercel configuration for SPA routing
2. **`/DEPLOYMENT.md`** - Detailed deployment documentation
3. **`/VERCEL_SETUP.md`** - Quick start guide for Vercel
4. **`/README_DEPLOYMENT.md`** - This file
5. **`/components/DeploymentCheck.tsx`** - System status checker
6. **`/components/OfflineModeToggle.tsx`** - Demo mode toggle

## 🔗 Useful Links

- **Supabase Dashboard:** https://supabase.com/dashboard/project/ohrfailvvemfbwzoibfs
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Paystack Dashboard:** https://dashboard.paystack.com
- **Flutterwave Dashboard:** https://dashboard.flutterwave.com

## 🆘 Still Having Issues?

1. **Run the deployment checker:**
   - Visit: `https://your-app.vercel.app/?screen=deployment-check`
   
2. **Check browser console:**
   - Press F12
   - Look at Console tab for errors
   - Look at Network tab for failed requests

3. **Check Supabase logs:**
   - Go to Supabase Dashboard
   - Click on your project
   - Go to "Logs" → "Edge Functions"
   - Look for errors or failed requests

4. **Test locally first:**
   ```bash
   npm install
   npm run dev
   ```
   Make sure it works locally before deploying

5. **Review the documentation:**
   - Read `DEPLOYMENT.md` for detailed information
   - Read `VERCEL_SETUP.md` for step-by-step Vercel setup

## 🎉 Success Indicators

You'll know everything is working when:

✅ Landing page loads instantly
✅ Can login as Customer, Rider, and SME
✅ Rider dashboard shows mock/real deliveries
✅ Real-time updates appear (new deliveries)
✅ No errors in browser console
✅ All API calls show 200 status (Network tab)
✅ "System Check" link shows all green
✅ Page navigation works smoothly
✅ Refresh doesn't break the app

---

**Need More Help?**
- Check `DEPLOYMENT.md` for comprehensive deployment guide
- Check `VERCEL_SETUP.md` for Vercel-specific instructions
- Review the code comments in modified files
- Test locally with `npm run dev` first

**Good Luck! 🚀**
