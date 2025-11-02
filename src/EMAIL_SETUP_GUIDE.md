# Email Authentication Setup Guide for JetDash

## Current Issue
Email authentication is not sending emails to users' inboxes because Supabase's email service needs to be configured.

## Quick Overview
There are **3 options** to fix email authentication:

1. ✅ **Option 1: Configure Custom SMTP** (Recommended for production)
2. ⚡ **Option 2: Use Supabase's Rate-Limited Email** (Quick test, limited emails)
3. 🔧 **Option 3: Disable Email Verification Temporarily** (Development only)

---

## Option 1: Configure Custom SMTP (Recommended)

This is the **best option for production** as it gives you reliable email delivery with no rate limits.

### Step 1: Get SMTP Credentials

Choose one of these email service providers:

#### **A) SendGrid (Recommended - Free 100 emails/day)**
1. Go to https://sendgrid.com and create a free account
2. Navigate to Settings → API Keys
3. Create a new API key with "Mail Send" permissions
4. Save your API key securely
5. Your SMTP settings:
   - Host: `smtp.sendgrid.net`
   - Port: `587`
   - Username: `apikey`
   - Password: `<Your API Key>`

#### **B) Mailgun (Free 100 emails/day)**
1. Go to https://www.mailgun.com and sign up
2. Add and verify your domain (or use their sandbox domain for testing)
3. Go to Settings → API Keys
4. Your SMTP settings:
   - Host: `smtp.mailgun.org`
   - Port: `587`
   - Username: Check your Mailgun dashboard
   - Password: Your Mailgun password

#### **C) AWS SES (Best for high volume)**
1. Go to AWS SES console
2. Verify your sending email/domain
3. Create SMTP credentials
4. Your SMTP settings:
   - Host: `email-smtp.<region>.amazonaws.com`
   - Port: `587`
   - Username: Your SMTP username
   - Password: Your SMTP password

#### **D) Gmail SMTP (Testing only - NOT for production)**
⚠️ **Warning**: Gmail has strict sending limits (500 emails/day)
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Your SMTP settings:
   - Host: `smtp.gmail.com`
   - Port: `587`
   - Username: `your-email@gmail.com`
   - Password: `<Your App Password>`

### Step 2: Configure Supabase SMTP

1. **Log into Supabase Dashboard**: https://app.supabase.com
2. **Select your JetDash project**
3. **Go to**: Project Settings → Authentication → Email
4. **Enable Custom SMTP**:
   - Toggle ON "Enable Custom SMTP"
5. **Enter your SMTP details**:
   ```
   Sender email: noreply@yourdomain.com (or your verified email)
   Sender name: JetDash
   Host: <your SMTP host>
   Port: 587
   Username: <your SMTP username>
   Password: <your SMTP password>
   ```
6. **Click "Save"**

### Step 3: Test Email Sending

1. Go to the signup page in your app
2. Create a new account with your real email address
3. Check your inbox (and spam folder) for the verification email
4. It should arrive within seconds

### Step 4: Customize Email Templates (Optional)

1. In Supabase Dashboard, go to: Authentication → Email Templates
2. You can customize:
   - **Confirm signup**: Email sent when users sign up
   - **Magic Link**: Passwordless login email
   - **Change Email Address**: Email change confirmation
   - **Reset Password**: Password reset email

Example customization:
```html
<h2>Welcome to JetDash!</h2>
<p>Thank you for signing up for JetDash delivery services.</p>
<p>Click the link below to confirm your email address:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm Email</a></p>
<p>This link expires in 24 hours.</p>
```

---

## Option 2: Use Supabase's Built-in Email (Quick Test)

⚠️ **Rate Limited**: Only 3-4 emails per hour for testing

### Steps:
1. Go to Supabase Dashboard → Authentication → Email
2. Make sure "Enable Email Confirmations" is toggled ON
3. Emails will be sent from Supabase's test SMTP server
4. Check spam folder as these emails often go there

**Limitations**:
- Very low rate limit (3-4 emails/hour)
- Often marked as spam
- Not suitable for production
- Good for initial testing only

---

## Option 3: Disable Email Verification (Development Only)

⚠️ **NOT RECOMMENDED FOR PRODUCTION** - This is insecure!

### Current Implementation
Your app currently uses this method (line 189 in `/supabase/functions/server/index.tsx`):
```typescript
email_confirm: true  // This bypasses email verification
```

### Why You Should Change This
- Users can sign up with fake emails
- No way to recover accounts
- Potential for abuse
- Not secure for production

### To Keep This (Only for Development):
Just leave the code as-is, but remember to enable proper email verification before launching!

---

## Troubleshooting

### Problem: Emails Not Arriving

**Check 1: Spam Folder**
- Always check spam/junk folder first
- Gmail often marks new domains as spam

**Check 2: SMTP Configuration**
```bash
# Test your SMTP settings using this command:
curl -v --mail-from "noreply@yourdomain.com" \
  --mail-rcpt "test@example.com" \
  --upload-file email.txt \
  --url "smtp://smtp.example.com:587" \
  --user "username:password"
```

**Check 3: Supabase Logs**
1. Go to Supabase Dashboard
2. Navigate to Logs → Edge Functions
3. Look for email-related errors

**Check 4: Domain Verification**
- Make sure your sending domain is verified with your email provider
- Some providers require SPF and DKIM records

### Problem: "Invalid SMTP credentials"

1. Double-check username and password
2. Make sure there are no extra spaces
3. For SendGrid, username must be exactly `apikey`
4. Regenerate your SMTP password/API key if needed

### Problem: Emails Going to Spam

**Solutions**:
1. **Set up SPF record** for your domain:
   ```
   Type: TXT
   Name: @
   Value: v=spf1 include:sendgrid.net ~all
   ```

2. **Set up DKIM** (ask your email provider for details)

3. **Warm up your domain**:
   - Send a few emails per day initially
   - Gradually increase volume
   - This helps build sender reputation

4. **Use a verified domain**:
   - Don't use @gmail.com or free email addresses as sender
   - Use your own domain (e.g., noreply@jetdash.ng)

---

## Recommended Setup for JetDash

### For Testing/Development:
✅ **Option 3** (disabled verification) OR **Option 2** (Supabase test emails)

### For Production Launch:
✅ **Option 1** with **SendGrid** or **Mailgun**
- Reliable delivery
- Free tier is sufficient initially
- Good deliverability
- Easy to set up

### Email Templates to Customize:
1. **Welcome Email**: Sent after signup
2. **Password Reset**: For account recovery
3. **Delivery Notifications**: When deliveries are created/completed

---

## After Configuration

Once you've configured your email service:

1. **Update Server Code** (if using real email verification):
   - Remove `email_confirm: true` from `/supabase/functions/server/index.tsx`
   - Let Supabase handle email verification naturally

2. **Update Frontend** (optional):
   - Can keep the current flow, but the verification will happen via email link
   - Or update to show "Check your email" message without code input

3. **Test Thoroughly**:
   - Sign up with multiple test accounts
   - Try different email providers (Gmail, Outlook, Yahoo)
   - Check delivery times
   - Verify links work correctly

---

## Need Help?

### Supabase Documentation:
- Email Auth: https://supabase.com/docs/guides/auth/auth-smtp
- Email Templates: https://supabase.com/docs/guides/auth/auth-email-templates

### Email Provider Support:
- SendGrid: https://docs.sendgrid.com/
- Mailgun: https://documentation.mailgun.com/
- AWS SES: https://docs.aws.amazon.com/ses/

### Common Issues:
- Rate limiting: Wait a few minutes between test emails
- Spam blocking: Use a verified domain
- SMTP errors: Check credentials carefully

---

## Quick Start Checklist

- [ ] Choose email provider (SendGrid recommended)
- [ ] Get SMTP credentials
- [ ] Configure Supabase SMTP settings
- [ ] Test with real email address
- [ ] Check inbox and spam folder
- [ ] Customize email templates (optional)
- [ ] Update server code to use real verification
- [ ] Test complete signup flow
- [ ] Deploy and monitor

---

**Ready to implement?** Start with SendGrid (Option 1A) - it's free, reliable, and takes about 10 minutes to set up!
