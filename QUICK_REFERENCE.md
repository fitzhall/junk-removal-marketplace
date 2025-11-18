# Junk Removal Application - Quick Reference Guide

## Key Stats
- **Type**: SaaS White-Label Marketplace (Next.js 14)
- **Pages**: 15+ routes across 3 portals (Landing, Admin, Provider)
- **APIs**: 20+ endpoints with Prisma ORM + PostgreSQL
- **Mobile**: Fully responsive with dedicated mobile components
- **Tech Stack**: React 18, TypeScript, Tailwind CSS, Framer Motion

---

## Routing Quick Map

### Public Routes
- `/` - Landing page
- `/quote/[companySlug]` - Quote generation form
- `/thank-you` - Post-quote confirmation

### Admin Portal (`/admin/`)
- `/admin` - Dashboard (KPIs, metrics, activity)
- `/admin/companies` - Company subscriptions & domains
- `/admin/leads` - Lead tracking & distribution
- `/admin/providers` - Provider directory & performance
- `/admin/finance` - Revenue & commission tracking

### Provider Portal (`/provider/`)
- `/provider` - Dashboard (leads, filters, actions)
- `/provider/settings` - Plans, service areas, preferences
- `/provider/register` - Registration + Stripe payment
- `/provider/welcome` - Onboarding confirmation

### API Endpoints
- `GET /api/admin/stats` - Dashboard metrics
- `GET /api/provider/leads` - Provider's assigned leads
- `POST /api/provider/register` - New provider registration
- `POST /api/quotes/create` - Create quote from photos
- `GET /api/company/resolve` - Multi-tenant resolution
- See ARCHITECTURE_ANALYSIS.md for complete list

---

## Technology Stack Highlights

### Frontend
```
Next.js 14.1.0    → App Router, Server Components, API Routes
React 18.2.0      → UI Components
TypeScript 5.3.3  → Type Safety
Tailwind CSS 3.4  → Styling (mobile-first)
Framer Motion     → Animations
Radix UI          → Accessible components
```

### Backend
```
Prisma 5.8.1      → ORM, PostgreSQL
NextAuth v5       → Authentication (roles: CUSTOMER, PROVIDER, ADMIN)
PostgreSQL        → Database (via Supabase)
Stripe 14.25.0    → Payment processing
```

### Third-Party Services
```
Google Cloud Vision → AI image analysis for item detection
Cloudinary         → Image hosting & optimization
OpenAI             → Alternative AI service
Resend             → Email notifications
```

---

## Database Schema (Key Tables)

```
User (auth)
├── role: CUSTOMER | PROVIDER | ADMIN
├── Provider (1-to-1 relationship)
└── Quote (1-to-many relationship)

Provider
├── User (1-to-1)
├── Company (1-to-1)
├── ServiceAreas (ZIP codes served)
├── Jobs (completed/scheduled work)
├── LeadDistribution (leads sent)
└── Auto-bid settings

Company (multi-tenant)
├── Quotes
├── Providers
├── Subscription settings
└── Domain config (subdomain/custom domain)

Quote (lead/request)
├── Status: DRAFT|PENDING|SENT|ACCEPTED|BOOKED|EXPIRED
├── QuoteItems (detected items)
├── LeadDistribution (sent to providers)
└── Photos (Cloudinary URLs)

LeadDistribution
├── Status: SENT|VIEWED|ACCEPTED|DECLINED|EXPIRED
└── Bid (auto-assignment proposal)
```

---

## Admin Dashboards At A Glance

### Main Dashboard (`/admin`)
- **KPIs**: Revenue, Active Leads, Active Providers, Conversion Rate
- **Pipeline**: Incoming → Distributed → Accepted → Completed
- **Coverage**: Geographic locations with lead volume
- **Activity**: Recent actions feed
- **Mobile**: Separate optimized component with tabs

### Companies (`/admin/companies`)
- List all tenant companies
- Subscription plans: STARTER | PRO | ENTERPRISE
- Domain configuration (subdomain/custom)
- Quote & provider counts

### Leads (`/admin/leads`)
- Filter by status: new, distributed, accepted, completed, expired
- Customer details, address, value, urgency
- Distribution count & acceptance status
- Search & pagination

### Providers (`/admin/providers`)
- Filter by: status (active/pending/suspended), tier (Elite/Pro/Basic)
- Business info, rating, jobs, revenue
- Service area, response time, acceptance rate
- Credits, last active, license number

### Finance (`/admin/finance`)
- Revenue tracking [skeleton - needs completion]
- Commission calculations
- Subscription billing

---

## Provider Dashboard At A Glance

### Main Dashboard (`/provider`)
- **Stats**: Total Leads, Accepted, Revenue, Conversion Rate
- **Filters**: All | New | Contacted | Won | Lost
- **Lead Cards**: Name, location, value, date, urgency
- **Actions**: Mark Contacted, Won Job, Lost Job
- **Modal**: Full lead details with photos & items
- **Mobile**: Swipe gestures (left=decline, right=accept)

### Settings (`/provider/settings`)
- **Plans**: Basic ($299) | Professional ($599) | Elite ($999)
- **Service Areas**: ZIP codes, radius configuration
- **Preferences**: Job value range, types, schedule
- **Notifications**: Email, SMS, Push toggles
- **Auto-Bid**: Enable, bid strategy, target win rate

### Registration (`/provider/register`)
- Business name, email, phone
- Service ZIP codes
- Stripe payment ($99 activation fee)
- Temporary password generation
- Multi-step form with validation

---

## Mobile Responsiveness Features

### Responsive Breakpoints
- `sm`: 640px (small tablets)
- `md`: 768px (tablets - trigger for mobile components)
- `lg`: 1024px (laptops)
- `xl`: 1280px (large screens)

### Mobile Components
- `MobileAdminDashboard` - Tab nav (Overview | Leads | Providers | Menu)
- `MobileProviderDashboard` - Tab nav (Leads | Stats | Profile) + swipes

### Touch Interactions
- Swipe detection (100px threshold)
- Pull-to-refresh patterns
- Large touch targets (44px minimum)
- Bottom sheet modals
- Single-column layouts

### Dynamic Loading
```typescript
const MobileAdminDashboard = dynamic(
  () => import('@/components/admin/MobileAdminDashboard'),
  { ssr: false }
)
```

---

## Multi-Tenant Architecture

### How It Works
1. **Request arrives** with hostname (e.g., "acme.platform.com")
2. **Middleware detects** subdomain or custom domain
3. **Calls `/api/company/resolve`** to get company metadata
4. **Injects headers**: x-company-id, x-company-slug, etc.
5. **Application renders** company-specific branding

### Domain Types Supported
- **Subdomains**: `acme.platform.com` → extracted as "acme"
- **Custom Domains**: `acmejunk.com` → resolved via database lookup

### Company Metadata Injected
- `x-company-id` - Company UUID
- `x-company-name` - Business name
- `x-company-logo` - Logo URL
- `x-company-primary-color` - Brand color

---

## Authentication Status & Issues

### Current Setup
- NextAuth v5.0.0-beta.29 with Prisma adapter
- JWT sessions + BcryptJS password hashing
- Roles defined: CUSTOMER | PROVIDER | ADMIN

### Missing/Broken (⚠️ IMPORTANT)
- ❌ **NO route protection** on `/admin/*` and `/provider/*`
  - These pages are publicly accessible showing demo data
- ❌ **NO session validation** in pages or API
- ❌ **Provider ID hardcoded** (always uses first provider)
  - Line in `/api/provider/leads`: `take: 1` fetches first provider
  - Should use `req.user.id` from session
- ❌ **NO login page** implemented
- ❌ **API endpoints unprotected** (no auth checks)

### Required Fixes (Priority)
1. Create login page at `/auth/login`
2. Add NextAuth callbacks for session/JWT
3. Implement middleware route protection
4. Add API authentication headers checks
5. Use actual session data instead of hardcoded IDs

---

## Key Features Summary

### Lead Generation
1. Customer uploads photos on `/quote/[companySlug]`
2. Google Cloud Vision analyzes images
3. System calculates price + identifies items
4. Lead auto-distributed to matching providers

### Lead Distribution
- Match providers by: ZIP code, job value range, availability
- Send status: SENT → VIEWED → ACCEPTED/DECLINED
- Broadcast to multiple or round-robin algorithm

### Auto-Assignment Bidding
- Providers can enable auto-bid in settings
- Bid strategies: percentage below estimate OR fixed amount
- Filter by: min/max job value, preferred job types
- First accepted bid wins

### Subscription Tiers
**Companies**:
- STARTER: $297/month
- PRO: $497/month
- ENTERPRISE: Custom + $500 activation

**Providers**:
- Basic: $299/month (10 credits)
- Professional: $599/month (25 credits)
- Elite: $999/month (50 credits)
- $99 activation fee via Stripe

---

## File Structure at a Glance

```
app/
├── admin/              → Admin portal pages
├── provider/           → Provider portal pages
├── api/
│   ├── admin/          → Admin API endpoints
│   ├── provider/       → Provider API endpoints
│   ├── quotes/         → Quote creation
│   ├── company/        → Company resolution
│   └── webhooks/       → Stripe webhooks
├── page.tsx            → Landing page
└── layout.tsx          → Root layout

components/
├── admin/              → Admin-specific components
├── provider/           → Provider-specific components
├── ui/                 → Reusable UI components
└── MobileQuoteForm.tsx → Quote form (responsive)

lib/
├── prisma.ts           → Database client
├── google-vision.ts    → Vision API service
├── lead-distribution-new.ts → Lead matching logic
├── email-service.ts    → Email notifications
├── pricing-engine.ts   → Price calculations
└── config/pricing.ts   → Pricing data

prisma/
└── schema.prisma       → Database schema

middleware.ts          → Multi-tenant routing
tailwind.config.ts     → CSS configuration
```

---

## Common Tasks & Where to Find Them

| Task | File |
|------|------|
| Add admin page | `app/admin/[page]/page.tsx` |
| Add API endpoint | `app/api/[route]/route.ts` |
| Create UI component | `components/ui/[name].tsx` |
| Update database schema | `prisma/schema.prisma` + migrate |
| Change styling/theme | `tailwind.config.ts` + `app/globals.css` |
| Modify lead distribution | `lib/lead-distribution-new.ts` |
| Update email template | `lib/email-service.ts` |
| Fix auth issues | `types/next-auth.d.ts` + `components/Providers.tsx` |
| Add mobile responsiveness | Use `md:` Tailwind breakpoint + dynamic import |

---

## Environment Variables Needed

```bash
# Database
DATABASE_URL="postgresql://user:pass@host:5432/db"
DIRECT_URL="postgresql://user:pass@host:5432/db"

# Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Multi-tenant
NEXT_PUBLIC_PLATFORM_DOMAIN=localhost:3002

# Vision API
GOOGLE_CLOUD_PROJECT_ID=your-project
GOOGLE_CLOUD_CLIENT_EMAIL=service@project.iam.gserviceaccount.com
GOOGLE_CLOUD_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----..."

# Storage
CLOUDINARY_CLOUD_NAME=your-account
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret

# Payments
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
RESEND_API_KEY=re_...
```

---

## Performance Notes

### What's Optimized
- ✅ Dynamic imports reduce initial bundle
- ✅ Framer Motion with GPU acceleration
- ✅ Image optimization via Cloudinary
- ✅ Tailwind CSS with PurgeCSS

### What Needs Optimization
- ⚠️ Large dashboard renders (pagination needed)
- ⚠️ No query caching strategy
- ⚠️ API responses could use pagination
- ⚠️ Real-time updates use polling (not WebSocket)

---

## Testing Checklist

When testing locally:
1. Start dev server: `npm run dev`
2. Check landing page: `http://localhost:3000`
3. Try admin dashboard: `http://localhost:3000/admin`
4. Try provider dashboard: `http://localhost:3000/provider`
5. Test mobile: Use browser DevTools (768px width)
6. Check API: `http://localhost:3000/api/admin/stats`

Note: Auth is not enforced, so all pages are accessible. This is a **security issue for production**.

---

## Common Debugging

### Provider dashboard shows no leads?
- Check: Provider ID is hardcoded to first provider
- File: `app/api/provider/leads/route.ts` line 8-9
- Fix: Use session user ID instead

### Admin stats are zeros?
- Check: Database has Quote/Job/LeadDistribution records
- Run: Inspect /api/admin/stats response
- Database might be empty (test data needed)

### Images not loading?
- Check: Cloudinary credentials in .env
- File: `lib/cloudinary.ts`
- Verify: Photos are uploaded to Cloudinary

### Multi-tenant not working?
- Check: Middleware is running
- Verify: Domain matches NEXT_PUBLIC_PLATFORM_DOMAIN
- Debug: Check x-company-* headers in middleware

---

**Last Updated**: November 18, 2025
**Document Type**: Quick Reference
**For detailed info, see**: ARCHITECTURE_ANALYSIS.md
