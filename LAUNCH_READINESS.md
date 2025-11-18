# Launch Readiness Plan - Junk Removal Platform

## Current Status Assessment

### ✅ ALREADY BUILT
1. **Provider Dashboard** - Fully functional with lead management
2. **Supabase Integration** - Auth, database, and RLS policies working
3. **Quote Form** - Captures leads with AI photo pricing
4. **Provider Registration UI** - Form exists at `/provider/register`
5. **UTM Tracking** - Quote form captures campaign parameters
6. **Lead Distribution Tables** - Database structure for provider<->lead mapping
7. **Mobile-Optimized Views** - Responsive provider dashboard
8. **Simple Table-Based UI** - Clean, professional design

### ⚠️ PARTIALLY WORKING
1. **Provider Registration API** - Uses old Prisma setup, needs Supabase migration
2. **Payment Integration** - Stripe setup exists but not connected
3. **Company Domain Detection** - Headers support exists but middleware not configured

### ❌ MISSING / NOT WORKING
1. **Provider Attribution** - No way to link leads to specific provider campaigns
2. **Provider Auto-Approval** - Manual activation required in Supabase
3. **Email Notifications** - No email service configured
4. **Provider-Specific URLs** - No subdomain or slug routing

---

## Launch Phases

### 🚨 Phase 1: CRITICAL - Provider Campaign Attribution (2-3 hours)
**Goal:** Enable providers to run Facebook/Google campaigns and receive their leads

#### Tasks:
1. **Add Provider ID Parameter Support**
   - Modify QuickLeadForm to capture `provider` or `ref` parameter
   - Store provider_id with quote submission
   - Pass through to Supabase quotes table

2. **Update Quote Submission API**
   - Add provider_id field to quote creation
   - Auto-assign leads to provider if provider_id present
   - Create lead_distribution record automatically

3. **Provider Campaign URL Generator**
   - Add to provider dashboard: "Get Your Campaign URL"
   - Generate: `https://yoursite.com?ref=PROVIDER_ID`
   - Include UTM builder for tracking

4. **Test End-to-End Flow**
   - Provider gets unique URL
   - Customer submits quote via that URL
   - Lead appears in provider's dashboard

---

### 🔧 Phase 2: REQUIRED - Fix Provider Registration (1-2 hours)
**Goal:** Enable self-service provider signup

#### Tasks:
1. **Migrate Registration to Supabase**
   - Replace Prisma calls with Supabase client
   - Create provider record in Supabase
   - Set up proper auth user

2. **Auto-Activation Flow**
   - Skip payment for MVP launch
   - Auto-approve providers on registration
   - Send welcome email with login credentials

3. **Fix Login Flow**
   - Ensure `/provider/login` works with new providers
   - Test password reset flow
   - Verify RLS policies for new providers

---

### 💰 Phase 3: IMPORTANT - Billing & Subscription (2-3 hours)
**Goal:** Set up payment collection

#### Tasks:
1. **Stripe Integration**
   - Add STRIPE_SECRET_KEY to environment
   - Set up webhook endpoint for payment confirmation
   - Create subscription plans in Stripe

2. **Credit System**
   - Track lead credits per provider
   - Deduct credits when leads assigned
   - Block lead access when credits exhausted

3. **Billing Dashboard**
   - Show current balance
   - Display credit usage
   - Add "Buy More Credits" button

---

### 📧 Phase 4: NICE TO HAVE - Communications (1-2 hours)
**Goal:** Automated email notifications

#### Tasks:
1. **Email Service Setup**
   - Configure SendGrid/Resend/Postmark
   - Create email templates

2. **Notification Triggers**
   - New lead notification to provider
   - Welcome email on registration
   - Low credit warnings
   - Daily lead summary

---

### 🌐 Phase 5: OPTIONAL - White Label Domains (3-4 hours)
**Goal:** Custom domains per provider

#### Tasks:
1. **Subdomain Routing**
   - Set up wildcard DNS
   - Configure middleware for subdomain detection
   - Map subdomains to provider IDs

2. **Custom Domain Support**
   - CNAME setup instructions
   - SSL certificate handling
   - Domain verification process

---

## MVP Launch Checklist (Minimum for Going Live)

### Must Have (Phase 1 & 2 only):
- [ ] Provider can register account
- [ ] Provider can login to dashboard
- [ ] Provider gets unique campaign URL
- [ ] Leads from campaign URL route to provider
- [ ] Provider can view and manage their leads
- [ ] Basic lead status tracking works

### Database Checks:
- [ ] RLS policies allow provider data access
- [ ] Lead distribution creates correctly
- [ ] Provider ID passes through quote flow

### Testing:
- [ ] End-to-end campaign flow tested
- [ ] Multiple providers don't see each other's data
- [ ] Mobile dashboard works properly

---

## Quick Start Commands

```bash
# Check current environment
cat .env.local | grep -E "SUPABASE|STRIPE|EMAIL"

# Test provider registration
curl -X POST http://localhost:3000/api/provider/register \
  -H "Content-Type: application/json" \
  -d '{"businessName":"Test Provider","email":"test@test.com"}'

# Create test provider in Supabase
# Go to Supabase Dashboard > SQL Editor
```

```sql
-- Create test provider
INSERT INTO providers (
  auth_user_id,
  company_name,
  contact_email,
  contact_phone,
  is_active
) VALUES (
  'YOUR_AUTH_USER_ID',
  'Test Provider Co',
  'provider@test.com',
  '555-0100',
  true
);
```

---

## Estimated Timeline

- **MVP Launch Ready**: 4-5 hours (Phase 1 + 2)
- **Payment Ready**: +2-3 hours (Phase 3)
- **Full Featured**: +4-6 hours (Phase 4 + 5)

**RECOMMENDATION**: Complete Phase 1 & 2 immediately to enable provider onboarding and campaign attribution. This gets you to MVP launch state where providers can start running ads.