# 🚀 Vercel Deployment Quick Start

## Why is the Rider Dashboard Not Working?

Your rider dashboard isn't working on Vercel because:

1. **Missing Environment Variables** - Vercel doesn't have the required environment variables configured
2. **Backend Not Deployed** - The Supabase Edge Functions need to be deployed separately
3. **Offline Mode Active** - The app is running in offline/demo mode instead of production mode
4. **Missing Routing Configuration** - The `vercel.json` file was missing (now created)

## ✅ Step-by-Step Fix

### Step 1: Add Environment Variables to Vercel

1. Go to your Vercel project dashboard: https://vercel.com/dashboard
2. Click on your JetDash project
3. Go to **Settings** → **Environment Variables**
4. Add these variables (for ALL environments: Production, Preview, Development):

```
Variable Name: VITE_SUPABASE_URL
Value: https://ohrfailvvemfbwzoibfs.supabase.co

Variable Name: VITE_SUPABASE_ANON_KEY  
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ocmZhaWx2dmVtZmJ3em9pYmZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3NTAwOTcsImV4cCI6MjA3NDMyNjA5N30.XRpCRzpf59Kl31t3CrPcgNaP90P1XskysqPkq2lDjcU

Variable Name: VITE_APP_ENV
Value: production

Variable Name: VITE_PAYSTACK_PUBLIC_KEY
Value: pk_test_YOUR_PAYSTACK_KEY (get from Paystack dashboard)

Variable Name: VITE_FLUTTERWAVE_PUBLIC_KEY  
Value: FLWPUBK_TEST-YOUR_FLUTTERWAVE_KEY (get from Flutterwave dashboard)
```

5. Click **Save** for each variable

### Step 2: Deploy Supabase Backend

The backend server must be deployed to Supabase Edge Functions:

```bash
# 1. Install Supabase CLI (if not already installed)
npm install -g supabase

# 2. Login to Supabase
supabase login

# 3. Link to your project
supabase link --project-ref ohrfailvvemfbwzoibfs

# 4. Deploy the Edge Function
cd supabase/functions/server
supabase functions deploy make-server-aaf007a1
```

**Important**: The Edge Function must be named `make-server-aaf007a1` to match the API calls in the app.

### Step 3: Redeploy on Vercel

After adding environment variables:

1. Go to **Deployments** tab in Vercel
2. Click on the latest deployment
3. Click **... (menu)** → **Redeploy**
4. Select **Use existing Build Cache** = NO
5. Click **Redeploy**

OR simply push to your Git repository:
```bash
git add .
git commit -m "Add Vercel configuration and deployment setup"
git push
```

Vercel will automatically redeploy with the new environment variables.

### Step 4: Test Your Deployment

After redeployment, visit: `https://your-app.vercel.app/deployment-check`

This will show you the status of:
- ✅ Environment variables
- ✅ Supabase connection  
- ✅ Edge function deployment
- ✅ API endpoints
- ✅ Browser compatibility

## 🔍 Testing the Rider Dashboard

1. Go to your deployed app
2. Click **Login**
3. Select **Rider** user type
4. Use any test credentials:
   - Email: `rider@jetdash.ng`
   - Password: `test123`
5. You should now see the rider dashboard with:
   - Available deliveries
   - Earnings stats
   - Online/offline toggle
   - Real-time updates

## 🐛 Troubleshooting

### Issue: Still seeing blank rider dashboard

**Check 1: Environment Variables**
```bash
# View your Vercel environment variables
vercel env ls
```

Make sure all VITE_* variables are there.

**Check 2: Browser Console**
1. Open browser DevTools (F12)
2. Check Console tab for errors
3. Check Network tab - look for failed API calls
4. Look for messages like "using offline mode"

**Check 3: Edge Function Deployment**
Test if the backend is running:
```bash
curl https://ohrfailvvemfbwzoibfs.supabase.co/functions/v1/make-server-aaf007a1/health
```

Should return: `{"status":"healthy","timestamp":"..."}`

If it returns 404, the Edge Function isn't deployed.

### Issue: CORS errors

If you see CORS errors in console:
1. Make sure the Edge Function is deployed correctly
2. Check that CORS is enabled in `/supabase/functions/server/index.tsx`
3. Verify the Supabase URL in environment variables is correct

### Issue: 404 errors on page refresh

This should be fixed by the `vercel.json` file. If still happening:
1. Check that `vercel.json` exists in your root directory
2. Redeploy from scratch
3. Clear your browser cache

## 🎯 Quick Test Commands

Test backend health:
```bash
curl https://ohrfailvvemfbwzoibfs.supabase.co/functions/v1/make-server-aaf007a1/health
```

Test auth endpoint:
```bash
curl -X POST https://ohrfailvvemfbwzoibfs.supabase.co/functions/v1/make-server-aaf007a1/auth/test \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

## 📝 Environment Variables Quick Reference

| Variable | Where to Get It | Required |
|----------|----------------|----------|
| VITE_SUPABASE_URL | Supabase Project Settings → API | ✅ Yes |
| VITE_SUPABASE_ANON_KEY | Supabase Project Settings → API | ✅ Yes |
| VITE_APP_ENV | Set to "production" | ✅ Yes |
| VITE_PAYSTACK_PUBLIC_KEY | Paystack Dashboard → Settings → API Keys | ⚠️ For payments |
| VITE_FLUTTERWAVE_PUBLIC_KEY | Flutterwave Dashboard → Settings → API | ⚠️ For payments |

## 🔐 Security Checklist

- [ ] Never commit API keys to Git
- [ ] Use test keys for development/staging
- [ ] Use live keys only in production
- [ ] Keep service role key secret (backend only)
- [ ] Enable RLS on all Supabase tables

## 📞 Still Having Issues?

1. **Check the deployment checker**: Visit `/deployment-check` on your deployed app
2. **Review console logs**: Press F12 in browser and check Console tab
3. **Verify environment**: Make sure all env vars are set correctly
4. **Test locally first**: Run `npm run dev` locally to verify it works
5. **Check Supabase logs**: Go to Supabase Dashboard → Logs → Edge Functions

## 🎉 Success Checklist

Once everything works, you should see:
- ✅ Landing page loads instantly
- ✅ Login redirects to correct dashboard (Customer/Rider/SME)
- ✅ Rider dashboard shows available deliveries
- ✅ Real-time updates work (deliveries appear automatically)
- ✅ Payment processing works
- ✅ No errors in browser console
- ✅ All API calls succeed (check Network tab)

---

Need more help? Check `DEPLOYMENT.md` for detailed information.
