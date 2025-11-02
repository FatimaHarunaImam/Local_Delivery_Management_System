# JetDash Deployment Guide for Vercel

## 🚀 Quick Deployment Steps

### 1. Configure Environment Variables in Vercel

Go to your Vercel project settings and add these environment variables:

#### Required Variables:
```
VITE_SUPABASE_URL=https://ohrfailvvemfbwzoibfs.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ocmZhaWx2dmVtZmJ3em9pYmZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3NTAwOTcsImV4cCI6MjA3NDMyNjA5N30.XRpCRzpf59Kl31t3CrPcgNaP90P1XskysqPkq2lDjcU
VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_key_here
VITE_FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-your_flutterwave_key_here
VITE_APP_ENV=production
```

### 2. Deploy Supabase Edge Functions

The backend server needs to be deployed to Supabase:

```bash
# Install Supabase CLI if you haven't already
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref ohrfailvvemfbwzoibfs

# Deploy the edge functions
supabase functions deploy make-server-aaf007a1 --project-ref ohrfailvvemfbwzoibfs
```

### 3. Configure Supabase Database

Make sure your Supabase project has the `kv_store_aaf007a1` table created:

```sql
CREATE TABLE IF NOT EXISTS kv_store_aaf007a1 (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE kv_store_aaf007a1 ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable all access for authenticated users" ON kv_store_aaf007a1
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all access for service role" ON kv_store_aaf007a1
  FOR ALL USING (auth.role() = 'service_role');
```

### 4. Update Vercel Deployment

1. Push changes to your Git repository
2. Vercel will automatically redeploy
3. Or manually redeploy from Vercel dashboard

### 5. Test the Deployment

After deployment, test these features:
- ✅ Landing page loads
- ✅ Login/Signup works
- ✅ Rider dashboard displays
- ✅ Real-time updates work
- ✅ API calls to Supabase backend succeed

## 🔧 Troubleshooting

### Issue: Rider Dashboard Not Working

**Symptoms:**
- Blank page after login
- "Loading" state never ends
- API errors in console

**Solutions:**

1. **Check Environment Variables:**
   ```bash
   # In Vercel dashboard, verify all env vars are set
   # Make sure there are no typos or extra spaces
   ```

2. **Check Supabase Connection:**
   - Verify the Supabase project is active
   - Check that Edge Function is deployed
   - Test the API endpoint manually:
   ```bash
   curl https://ohrfailvvemfbwzoibfs.supabase.co/functions/v1/make-server-aaf007a1/health
   ```

3. **Check Browser Console:**
   - Look for CORS errors
   - Look for 404 or 500 errors
   - Check network tab for failed requests

4. **Enable Debug Mode:**
   - Set `VITE_APP_ENV=development` temporarily
   - Check console logs for detailed error messages

### Issue: CORS Errors

If you see CORS errors, make sure:
1. The Edge Function has CORS enabled (already configured in `/supabase/functions/server/index.tsx`)
2. The Supabase URL is correct in environment variables

### Issue: Routes Not Working (404 on refresh)

This is fixed by the `vercel.json` file that rewrites all routes to `/index.html` for client-side routing.

## 📊 Production Checklist

Before going live:

- [ ] All environment variables are set in Vercel
- [ ] Supabase Edge Functions are deployed
- [ ] Database tables and RLS policies are configured
- [ ] Payment gateway keys (Paystack/Flutterwave) are set to LIVE keys (not test)
- [ ] Test all user flows: Customer, Rider, SME
- [ ] Test payment processing end-to-end
- [ ] Verify real-time updates are working
- [ ] Test on mobile devices
- [ ] Set up custom domain (optional)
- [ ] Configure monitoring/error tracking

## 🔐 Security Notes

1. **Never commit secrets to Git:**
   - Use Vercel environment variables
   - Use Supabase secrets for backend

2. **Use HTTPS only:**
   - Vercel provides this automatically
   - Ensure all API calls use HTTPS

3. **Enable RLS on all tables:**
   - Restrict access based on user roles
   - Use service role key only in backend

## 📞 Support

If you continue to have issues:
1. Check the browser console for errors
2. Check the Supabase logs for Edge Function errors
3. Verify all environment variables are correct
4. Try redeploying from scratch

## 🎯 Quick Test Commands

```bash
# Test Supabase connection
curl https://ohrfailvvemfbwzoibfs.supabase.co/functions/v1/make-server-aaf007a1/health

# Test authentication endpoint
curl -X POST https://ohrfailvvemfbwzoibfs.supabase.co/functions/v1/make-server-aaf007a1/auth/test \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"
```
