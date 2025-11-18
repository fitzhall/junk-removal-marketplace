# Junk Removal White-Label Application - Architecture Analysis

## Executive Summary

This is a modern **Next.js 14 SaaS platform** built as a white-label junk removal marketplace. The application supports multiple tenant companies, individual service providers, and administrators with distinct portals and dashboards. It uses **multi-tenant architecture** with domain-based tenant resolution, Prisma ORM for database management, and modern React components for responsive UI.

---

## 1. TECHNOLOGY STACK

### Frontend Framework
- **Next.js 14.1.0** (App Router with dynamic imports)
- **React 18.2.0** (with Server Components)
- **TypeScript 5.3.3** (strict mode enabled)
- **Tailwind CSS 3.4.1** with custom theme extensions
- **Framer Motion 12.23.22** (animations and transitions)
- **Radix UI components** (dialog, dropdown, select, toast, etc.)
- **Lucide React 0.314.0** & **HeroIcons 2.2.0** (icons)

### Backend & Database
- **Next.js API Routes** (serverless functions at `/app/api`)
- **Prisma 5.8.1** (ORM with PostgreSQL)
- **PostgreSQL** (primary database via Supabase)
- **Stripe 14.25.0** (payment processing for subscriptions)

### Authentication & Sessions
- **NextAuth v5.0.0-beta.29** (session management)
- **Supabase Auth** (optional OAuth integration)
- **BcryptJS 3.0.3** (password hashing)
- **JWT tokens** for session management

### Third-Party Services
- **Google Cloud Vision API** (AI image analysis for item detection)
- **Cloudinary 2.7.0** (image hosting and optimization)
- **OpenAI 4.26.0** (alternative AI analysis)
- **Resend 6.1.2** (email notifications)
- **Supabase** (authentication and database)
- **Vercel Analytics 1.1.2**

### Development Tools
- **ESLint 8.56.0** with TypeScript support
- **Prettier 3.2.4** (code formatting)
- **Husky 8.0.3** (git hooks)
- **Jest 29.7.0** (testing framework)

---

## 2. ARCHITECTURE OVERVIEW

### 2.1 Multi-Tenant Architecture

```
┌─────────────────────────────────────────────────────┐
│          Middleware (middleware.ts)                 │
│  - Detects company by subdomain or custom domain   │
│  - Resolves company metadata                        │
│  - Injects x-company-* headers                      │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│         Next.js App Router (Routing)                │
├─────────────────────────────────────────────────────┤
│ /                     → Home/Landing Page           │
│ /admin/*              → Admin Portal                │
│ /provider/*           → Provider Portal             │
│ /quote/*              → Quote Generation            │
│ /api/*                → Backend API Routes          │
└─────────────────────────────────────────────────────┘
```

**Multi-Tenant Domain Support:**
- **Subdomains**: `acme.platform.com` → detects "acme" as company
- **Custom Domains**: `acmejunk.com` → resolved to company via database lookup
- **Headers**: Middleware injects company context via request headers

**Tenant Resolution Flow:**
1. Request arrives with hostname (e.g., "acme.platform.com")
2. Middleware extracts domain/subdomain
3. Calls `/api/company/resolve` with subdomain or custom domain
4. Returns company metadata (id, name, logo, colors, settings)
5. Injects company headers for downstream use
6. Application renders company-specific branding

### 2.2 Database Schema

```
Key Entities:
├── Company (multi-tenant owner)
│   ├── Quotes (lead generation records)
│   ├── Providers (service providers)
│   ├── Users (authentication)
│   └── Domain settings (subdomain, customDomain, branding)
│
├── User (authentication)
│   ├── Role: CUSTOMER | PROVIDER | ADMIN
│   ├── Provider relationship (1-to-1)
│   └── Quote relationship (1-to-many)
│
├── Provider (service providers)
│   ├── ServiceAreas (ZIP codes they serve)
│   ├── Jobs (completed/scheduled work)
│   ├── Bids (auto-assignment proposals)
│   ├── LeadDistributions (leads sent to them)
│   └── Auto-bid settings (percentage/fixed amount)
│
├── Quote (customer junk removal requests)
│   ├── Status: DRAFT|PENDING|SENT|ACCEPTED|BOOKED|EXPIRED
│   ├── QuoteItems (individual items detected)
│   ├── Photos (Cloudinary URLs)
│   ├── AI Analysis (Google Vision results)
│   └── LeadDistributions (sent to which providers)
│
├── LeadDistribution (lead → provider mapping)
│   ├── Status: SENT|VIEWED|ACCEPTED|DECLINED|EXPIRED
│   ├── Bid (if auto-assignment enabled)
│   └── Tracks provider responses
│
└── Bid (auto-assignment proposals)
    ├── Status: PENDING|ACCEPTED|REJECTED|WITHDRAWN|EXPIRED
    └── Provider-specific pricing proposals
```

---

## 3. CURRENT ADMIN VIEWS & DASHBOARDS

### 3.1 Admin Portal Structure

**Route**: `/admin/*`

#### Main Dashboard (`/admin`)
**Component**: `app/admin/page.tsx` (Modern Admin Dashboard)

**Features:**
- Real-time KPI cards:
  - Total Revenue (with period comparison)
  - Active Leads (with trend)
  - Active Providers (with trend)
  - Conversion Rate (with trend)
- Lead Flow Pipeline visualization:
  - Incoming → Distributed → Accepted → Completed
- Provider Tier breakdown:
  - Active providers (count)
  - Pending providers (count)
  - Suspended providers (count)
- Geographic Coverage map showing:
  - Top cities by lead volume
  - Revenue per location
  - Provider coverage status
- Recent Activity feed:
  - Lead creation events
  - Provider actions
  - System alerts
- Time range selector: Today | Week | Month
- Refresh functionality with loading states
- Mobile-responsive with dynamic import of `MobileAdminDashboard`

**Mobile Support:**
- Viewport detection (width < 768px)
- Separate `MobileAdminDashboard.tsx` component
- Tab-based navigation (Overview | Leads | Providers | Menu)
- Touch-friendly interaction patterns

#### Companies Management (`/admin/companies`)
**Component**: `app/admin/companies/page.tsx`

**Features:**
- Company listing with status indicators
- Subscription plan visualization:
  - STARTER | PRO | ENTERPRISE
- Subscription status tracking:
  - ACTIVE | TRIALING | PAST_DUE | CANCELLED
- Domain configuration:
  - Subdomain status
  - Custom domain verification
- Metrics displayed:
  - Monthly fee
  - Number of quotes
  - Number of providers
  - Creation date
- Color-coded badges for quick visual scanning

#### Leads Management (`/admin/leads`)
**Component**: `app/admin/leads/page.tsx`

**Features:**
- Comprehensive lead tracking:
  - Status filter: all | new | distributed | accepted | completed | expired | disputed
  - Search functionality
  - Pagination
- Lead information displayed:
  - Customer details (name, phone, email)
  - Service address
  - Estimated value
  - Distribution status (count of providers it went to)
  - Acceptance status (which provider accepted it)
  - Lead creation time
  - Urgency indicator
- Statistics panel:
  - New leads count
  - Distributed leads count
  - Acceptance rate
  - Conversion rate
  - Average response time
  - Today's revenue
  - Disputed leads count

#### Providers Management (`/admin/providers`)
**Component**: `app/admin/providers/page.tsx`

**Features:**
- Provider directory with advanced filtering:
  - Status filter: active | pending | suspended
  - Tier filter: Elite | Professional | Basic
  - Search by name/email
- Provider profile displayed:
  - Business name
  - Email & phone
  - Rating (5-star system)
  - Total jobs completed
  - Service area
  - Lead credits remaining
  - Acceptance rate percentage
  - Response time
  - Revenue generated
  - Platform revenue earned
  - Last active timestamp
  - License number
  - Active leads count
- Bulk actions (in design)
- Detail view modal (planned)

#### Finance Management (`/admin/finance`)
**Component**: `app/admin/finance/page.tsx`

**Features:**
- Revenue tracking and analytics
- Payment processing overview
- Commission calculations
- Subscription billing status
- Financial reports by time period

### 3.2 Admin API Endpoints

```
GET  /api/admin/stats          → Dashboard KPIs, lead flow, provider tiers
GET  /api/admin/companies      → List all companies with subscription info
GET  /api/admin/leads          → Lead listing with filters
GET  /api/admin/providers      → Provider directory with stats
GET  /api/admin/finance        → Financial data and revenue tracking
```

---

## 4. PROVIDER PORTAL & FUNCTIONALITY

### 4.1 Provider Portal Structure

**Route**: `/provider/*`

#### Main Dashboard (`/provider`)
**Component**: `app/provider/page.tsx` (Modern Provider Dashboard)

**Features:**
- Lead acquisition dashboard showing:
  - Total Leads received
  - Accepted Leads count
  - Revenue generated
  - Conversion Rate percentage
- Filter system:
  - Status-based: All | New | Contacted | Won | Lost
  - Count badges on filters
- Lead display:
  - Lead cards with swipeable interaction (mobile)
  - Customer name, location, description
  - Estimated value
  - Service date & time preference
  - Urgency indicator
  - Time received indicator
- Lead details modal with comprehensive information:
  - Customer Info (name, phone, email, address)
  - Job Details (property type, date, time, urgency)
  - Item breakdown (detected items with quantity/condition)
  - Photos gallery (scrollable thumbnails)
  - Estimated job value
- Action buttons for leads:
  - Mark Contacted (changes status from "new")
  - Won Job (confirms acceptance)
  - Lost Job (marks as declined)
- Refresh functionality with real-time updates
- Credits/subscription status display
- Settings quick access

**Mobile-Specific Features:**
- `MobileProviderDashboard.tsx` component
- Bottom tab navigation (Leads | Stats | Profile)
- Swipe-gesture lead interactions:
  - Swipe left: Decline/Lost
  - Swipe right: Accept/Won
  - Swipe threshold detection
- Pull-to-refresh functionality
- Touch-optimized card layout
- Responsive photo gallery

#### Provider Settings (`/provider/settings`)
**Component**: `app/provider/settings/page.tsx`

**Features:**
- Subscription Plan Management:
  - Plan selection (Basic | Professional | Elite)
  - Pricing display ($299 - $999)
  - Feature comparison
  - Lead credit allocation
  - Price per additional lead
- Service Area Configuration:
  - ZIP code selection (multi-select)
  - Service radius settings (10-25+ miles)
  - Geographic area management
- Lead Preferences:
  - Min/max job value filters
  - Job type selection (residential/commercial)
  - Schedule type preference (same-day/scheduled)
  - Urgency preferences
- Notification Settings:
  - Email notifications toggle
  - SMS notifications toggle
  - Push notifications toggle
- Auto-bid Settings:
  - Auto-bid enablement toggle
  - Bid percentage below estimate (configurable)
  - Target win rate setting
  - Max auto-bids per day

#### Provider Welcome/Onboarding (`/provider/welcome`)
**Component**: `app/provider/welcome/page.tsx`

**Features:**
- Success confirmation page post-registration
- Account activation steps (3-step process):
  1. Check email for credentials
  2. Complete profile setup
  3. Start receiving leads
- Call-to-action: "Go to Dashboard"
- Support contact information
- Loading state during webhook processing

#### Provider Registration (`/provider/register`)
**Component**: `app/provider/register/page.tsx`

**API**: `POST /api/provider/register`

**Features:**
- Multi-step registration form:
  - Business name
  - Contact email & phone
  - Service ZIP codes
  - Business address
  - First/last name
- Validation and error handling
- Stripe integration for activation fee payment:
  - $99 activation fee
  - Automatic Stripe session creation
  - Success/cancel redirects
- Test mode support (non-Stripe environments)
- Temporary password generation
- User and Provider creation in transaction

### 4.2 Provider API Endpoints

```
POST /api/provider/register                  → Register new provider, create Stripe session
GET  /api/provider/leads                     → List leads assigned to provider
POST /api/provider/leads/[id]/accept         → Accept/contact lead
POST /api/provider/leads/[id]/decline        → Decline/lose lead
POST /api/provider/leads/[id]/status         → Update lead status
GET  /api/provider/stats                     → Provider dashboard statistics
GET  /api/provider/settings                  → Retrieve provider settings
POST /api/provider/settings                  → Update provider settings
GET  /api/provider/leads/debug                → Debug endpoint for lead info
GET  /api/provider/leads/full-debug          → Extended debug endpoint
```

---

## 5. AUTHENTICATION & ROLE-BASED ACCESS

### 5.1 Authentication System

**Implementation:**
- NextAuth v5.0.0-beta.29 with Prisma adapter
- JWT-based sessions
- BcryptJS password hashing

**Session Structure:**
```typescript
interface Session {
  user: {
    id: string
    email: string
    name?: string | null
    role: Role  // CUSTOMER | PROVIDER | ADMIN
  }
}

interface JWT {
  id: string
  email: string
  role: Role
}

enum Role {
  CUSTOMER
  PROVIDER
  ADMIN
}
```

### 5.2 Role-Based Access Control (RBAC)

**Current Implementation Status:**
- Role enums defined in Prisma schema
- Roles attached to User model
- **No explicit route guards implemented** in current codebase
  - Admin pages (`/admin/*`) are publicly accessible (pages show demo data)
  - Provider pages (`/provider/*`) are publicly accessible
  - No middleware checking authentication before route access

**Required Enhancement:**
- Implement middleware-level authentication checks
- Route protection before page renders
- API endpoint authorization checks
- Redirect unauthenticated users to login

### 5.3 Current Provider Identification

**Challenge:**
- No active session mechanism in current implementation
- Provider identification uses hardcoded fallback:
  ```typescript
  const providers = await prisma.provider.findMany({ 
    orderBy: { createdAt: 'asc' }, 
    take: 1 
  })
  const providerId = providers[0]?.id
  ```
- **TODO comments** indicate authentication needed

---

## 6. MOBILE RESPONSIVENESS & MOBILE-SPECIFIC COMPONENTS

### 6.1 Responsive Design Strategy

**Framework:**
- Tailwind CSS with mobile-first breakpoints:
  - `sm`: 640px
  - `md`: 768px
  - `lg`: 1024px
  - `xl`: 1280px
  - `2xl`: 1536px

**Dynamic Component Loading:**
- Main dashboards use `dynamic()` import for mobile components:
  ```typescript
  const MobileAdminDashboard = dynamic(
    () => import('@/components/admin/MobileAdminDashboard'),
    { ssr: false }
  )
  ```
- Viewport detection in useEffect:
  ```typescript
  const checkMobile = () => {
    setIsMobile(window.innerWidth < 768)
  }
  ```

### 6.2 Mobile-Specific Components

#### MobileAdminDashboard
**Path**: `components/admin/MobileAdminDashboard.tsx`

**Features:**
- Tab-based navigation (Overview | Leads | Providers | Menu)
- Mobile-optimized KPI cards
- Stacked layout for all sections
- Touch-friendly button sizing
- Hamburger menu for secondary navigation
- Responsive typography (smaller on mobile)
- Optimized spacing and padding

#### MobileProviderDashboard
**Path**: `components/provider/MobileProviderDashboard.tsx`

**Features:**
- Bottom tab navigation (Leads | Stats | Profile)
- Swipe gestures for lead interaction
  - Threshold detection (100px swipe distance)
  - Left swipe → Decline action
  - Right swipe → Accept action
  - Card removal animation on swipe
- Lead stack UI (card-based)
- Vertical scrolling for lead list
- Touch-optimized action buttons
- Pull-to-refresh with spinner
- Simplified modals and expanded views

### 6.3 Responsive UI Components

**Tailwind Responsive Patterns:**
```typescript
// Grid responsive
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

// Flex responsive
<div className="flex flex-col md:flex-row items-center gap-4">

// Text sizing responsive
<h1 className="text-2xl md:text-3xl lg:text-4xl">

// Padding responsive
<div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">

// Display responsive
<div className="hidden sm:block">
```

### 6.4 Mobile-Specific UI Patterns

**Touch Interactions:**
- Large touch targets (minimum 44px)
- Swipe gestures with momentum detection
- Pull-to-refresh patterns
- Bottom sheet modals instead of center modals
- Single-column layouts on mobile

**Performance Optimizations:**
- Dynamic imports reduce bundle size
- SSR disabled for mobile dashboards
- Lazy component loading
- Framer Motion animations (GPU-accelerated)

---

## 7. ROUTING STRUCTURE

### 7.1 Application Routes

```
/ (Landing/Home)
├── Responsive landing page
├── Feature showcase
├── Testimonials
└── CTA: "Get Quote" button

/quote/[companySlug]
├── Quote generation form
├── Photo upload
├── Item detection
└── Pricing display

/thank-you
└── Post-quote confirmation page

/admin (Admin Portal)
├── /admin/
│   └── Dashboard (KPIs, metrics, activity)
├── /admin/companies
│   └── Company management (subscriptions, domains)
├── /admin/leads
│   └── Lead tracking (status, distribution, conversion)
├── /admin/providers
│   └── Provider directory (tier, performance, ratings)
└── /admin/finance
    └── Financial reporting (revenue, commissions)

/provider (Provider Portal)
├── /provider/
│   ├── Dashboard (lead cards, filters, actions)
│   ├── Lead detail modal (customer info, photos, items)
│   └── Statistics summary
├── /provider/settings
│   ├── Subscription plan selection
│   ├── Service area configuration
│   ├── Lead preferences
│   ├── Notification settings
│   └── Auto-bid settings
├── /provider/register
│   ├── Multi-step registration form
│   ├── Business information
│   ├── Service area selection
│   └── Stripe payment integration
└── /provider/welcome
    └── Onboarding confirmation

/api (Backend Routes)
├── /api/quotes/create → Create quote from photos
├── /api/bookings/create → Create booking
├── /api/leads/quick-capture → Quick lead capture
├── /api/provider/* → Provider endpoints
├── /api/admin/* → Admin endpoints
├── /api/company/* → Company resolution & management
├── /api/webhooks/stripe → Stripe webhook handler
└── /api/test* → Testing endpoints
```

### 7.2 API Route Organization

```
/app/api/
├── admin/
│   ├── stats/route.ts          → KPI calculations, real-time metrics
│   ├── companies/route.ts       → Company listing
│   ├── leads/route.ts           → Lead management
│   ├── providers/route.ts       → Provider management
│   └── finance/route.ts         → Financial data
│
├── provider/
│   ├── register/route.ts        → Provider registration
│   ├── leads/route.ts           → List provider's leads
│   ├── leads/[id]/accept/route.ts
│   ├── leads/[id]/decline/route.ts
│   ├── leads/[id]/status/route.ts
│   ├── leads/debug/route.ts
│   ├── leads/full-debug/route.ts
│   ├── stats/route.ts           → Provider statistics
│   └── settings/route.ts        → Provider preferences
│
├── quotes/
│   └── create/route.ts          → Quote creation (AI analysis)
│
├── bookings/
│   └── create/route.ts          → Booking confirmation
│
├── company/
│   ├── resolve/route.ts         → Multi-tenant resolution
│   ├── domains/route.ts         → Domain verification
│   └── subscription/route.ts    → Subscription management
│
├── leads/
│   └── quick-capture/route.ts   → Quick lead entry
│
├── webhooks/
│   └── stripe/route.ts          → Stripe event handling
│
└── test*/
    └── Testing endpoints
```

---

## 8. KEY FEATURES & FUNCTIONALITY

### 8.1 Lead Generation Flow

1. **Quote Creation** (`/quote/[companySlug]`)
   - Photo upload (multiple images)
   - Google Cloud Vision analysis
   - Item detection and pricing
   - Customer information collection

2. **AI Analysis** (`/lib/google-vision.ts`)
   - Image processing via Google Cloud Vision
   - Item type detection with confidence scores
   - Volume estimation
   - Special handling flags

3. **Lead Distribution** (`/lib/lead-distribution-new.ts`)
   - Automatic provider matching by:
     - Service area (ZIP code)
     - Job value range preferences
     - Provider availability
   - Round-robin or broadcast algorithm
   - Bid system activation (if auto-bid enabled)

4. **Provider Notification**
   - Lead delivery to matched providers
   - Status tracking (SENT → VIEWED → ACCEPTED/DECLINED)
   - Real-time updates to provider dashboard

### 8.2 Auto-Assignment Bidding System

**Auto-Bid Flow:**
1. Provider enables auto-bid in settings
2. Bid strategy configured:
   - Percentage-based: Bid X% below estimate
   - Fixed-amount: Bid fixed amount per job
3. Lead distributed to eligible providers
4. Automatic bid creation if job matches criteria
5. First accepted bid wins the lead
6. Provider notified of win

**Database Schema:**
```
Provider.autoBidEnabled (boolean)
Provider.bidStrategy ("PERCENTAGE_BELOW" | "FIXED_AMOUNT")
Provider.bidPercentage (e.g., 10 = 10% below)
Provider.bidFixedAmount (e.g., 500 = $500 per job)
Provider.minJobValue (don't bid below)
Provider.maxJobValue (don't bid above)
```

### 8.3 Subscription & Billing

**Company Subscription Plans:**
- STARTER: $297/month
- PRO: $497/month  
- ENTERPRISE: Custom pricing
- Activation Fee: $500 (one-time)

**Provider Subscription Plans:**
- Basic: $299/month (10 credits)
- Professional: $599/month (25 credits)
- Elite: $999/month (50 credits)

**Provider Activation:**
- $99 one-time activation fee
- Stripe payment integration
- Stripe webhook handling for success/failure

### 8.4 Email Notifications

**Service**: Resend API

**Notification Types:**
- Lead distribution notifications
- Provider registration confirmation
- Subscription updates
- Quote confirmations

---

## 9. CURRENT IMPLEMENTATION STATUS

### 9.1 Implemented Features

✅ Multi-tenant architecture with domain resolution
✅ Admin dashboard with real-time KPIs
✅ Provider dashboard with lead management
✅ Mobile-responsive UI components
✅ Lead generation and AI analysis
✅ Provider registration with payment
✅ Lead distribution system
✅ Auto-assignment bidding logic
✅ Provider settings management
✅ Company subscription management
✅ Database schema with Prisma ORM
✅ API endpoints for all major functions

### 9.2 Missing/Incomplete Features

❌ **Authentication middleware**
  - No route protection on `/admin/*` or `/provider/*`
  - No session validation before pages render
  - Hardcoded provider ID (TODO comment)

❌ **Authorization checks**
  - API endpoints don't validate user roles
  - No permission enforcement on admin functions
  - Missing API authentication headers

❌ **Login/Authentication UI**
  - No login page implemented
  - No session provider configuration visible
  - No password reset functionality

❌ **Full finance module**
  - Finance dashboard is skeleton
  - Commission calculations incomplete
  - Payment processing for providers (only company subscriptions)

❌ **Notification delivery**
  - Email templates not implemented
  - SMS integration (Twilio) not implemented
  - Real-time notifications (WebSocket) not implemented

❌ **Admin actions**
  - Bulk provider management
  - Lead dispute resolution
  - Subscription change workflows

---

## 10. STYLING & DESIGN SYSTEM

### 10.1 Tailwind CSS Configuration

**Key Extensions:**
- CSS variables for theme colors (HSL format)
- Custom gradient classes: `bg-gradient-primary`, `text-gradient`
- Animation plugins: `tailwindcss-animate`
- Glass morphism effects: `glass-effect`, `glass-border`
- Card classes: `card-modern`, `card-glass`

**Color Palette:**
- Primary: `from-purple-500 to-purple-600`
- Success: `green-600`, `green-100`
- Warning: `yellow-600`, `yellow-100`
- Danger: `red-600`, `red-100`
- Neutral: Gray scale (50-900)

### 10.2 Animation Library

**Framer Motion Usage:**
- Page transitions (initial/animate/exit)
- Card animations (staggered children)
- Modal animations (scale, opacity)
- Button hover effects
- List item animations (slide in)

**Example Patterns:**
```typescript
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>
```

### 10.3 Component Library

**UI Components Provided:**
- `StatCard` - KPI display with trend
- `LeadCard` - Lead information card
- `PipelineCard` - Lead flow visualization
- `enhanced-lead-card` - Interactive lead card
- `swipeable-lead-card` - Touch gesture support
- `animated-lead-modal` - Modal with animations
- `skeleton` - Loading placeholders
- `toast-provider` - Notification system
- `empty-states` - Empty state illustrations
- `loading-states` - Loading UI variants

---

## 11. ENVIRONMENT CONFIGURATION

### Required Environment Variables

```bash
# Database
DATABASE_URL          # PostgreSQL connection
DIRECT_URL           # Direct database connection for migrations

# Authentication
NEXTAUTH_URL         # Application URL
NEXTAUTH_SECRET      # JWT secret

# Multi-tenant
NEXT_PUBLIC_PLATFORM_DOMAIN    # Platform domain for subdomains

# AI/Vision
GOOGLE_CLOUD_PROJECT_ID       # Google Cloud project
GOOGLE_CLOUD_CLIENT_EMAIL     # Service account email
GOOGLE_CLOUD_PRIVATE_KEY      # Service account key
OPENAI_API_KEY               # OpenAI API key (alternative)

# Image Storage
CLOUDINARY_CLOUD_NAME         # Cloudinary account
CLOUDINARY_API_KEY           # Cloudinary API key
CLOUDINARY_API_SECRET        # Cloudinary API secret

# Payments
STRIPE_SECRET_KEY            # Stripe secret key
STRIPE_PUBLISHABLE_KEY       # Stripe public key
STRIPE_WEBHOOK_SECRET        # Stripe webhook secret

# Emails
RESEND_API_KEY              # Resend email service

# Optional Services
AWS_ACCESS_KEY_ID           # AWS S3 (alternative to Cloudinary)
TWILIO_ACCOUNT_SID          # SMS notifications
GOOGLE_MAPS_API_KEY         # Address validation
NEXT_PUBLIC_GA_ID           # Google Analytics
```

---

## 12. KNOWN ISSUES & TECHNICAL DEBT

1. **Authentication Gap**
   - No actual session validation on protected pages
   - Provider identification hardcoded to first provider
   - API endpoints unprotected

2. **Type Safety**
   - `any` types used in multiple places
   - Missing proper error typing
   - Some API responses not typed

3. **Error Handling**
   - Limited error boundaries
   - Generic error messages
   - No centralized error logging

4. **Performance**
   - Large dashboard renders without optimization
   - Image optimization can be improved
   - No query caching strategy

5. **Testing**
   - Jest configured but no test files present
   - No API integration tests
   - No component tests

---

## 13. DEPLOYMENT CONSIDERATIONS

**Current Setup:**
- Optimized for Vercel deployment
- Server Actions configured (10MB body limit)
- Image optimization for Cloudinary
- TypeScript and ESLint errors ignored in build

**Recommendations:**
- Enable strict TypeScript checks
- Implement comprehensive error handling
- Add authentication and authorization middleware
- Set up monitoring and error tracking (Sentry)
- Configure proper environment variables per environment
- Implement database connection pooling

---

## 14. RECOMMENDATIONS FOR ENHANCEMENT

### High Priority
1. Implement authentication middleware
2. Add role-based access control to API endpoints
3. Fix provider identification to use actual session
4. Create login page and authentication flow
5. Add error boundary components

### Medium Priority
1. Complete finance module with commission tracking
2. Implement real-time notifications (WebSocket)
3. Add email templates and delivery
4. Create comprehensive test suite
5. Optimize bundle size and performance

### Low Priority
1. Add advanced analytics dashboards
2. Implement dispute resolution workflow
3. Add bulk provider management
4. Create API documentation (OpenAPI/Swagger)
5. Build mobile native apps (React Native)

---

## 15. FILE STRUCTURE SUMMARY

```
/Users/fitzhall/projects/Junk Removal/
├── app/                           # Next.js app directory
│   ├── admin/                    # Admin portal
│   │   ├── page.tsx             # Main dashboard
│   │   ├── companies/page.tsx
│   │   ├── leads/page.tsx
│   │   ├── providers/page.tsx
│   │   └── finance/page.tsx
│   ├── provider/                 # Provider portal
│   │   ├── page.tsx             # Main dashboard
│   │   ├── settings/page.tsx
│   │   ├── register/page.tsx
│   │   └── welcome/page.tsx
│   ├── api/                      # API routes
│   │   ├── admin/*
│   │   ├── provider/*
│   │   ├── quotes/*
│   │   ├── company/*
│   │   └── webhooks/*
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page
│   └── globals.css              # Global styles
│
├── components/                   # React components
│   ├── admin/
│   │   └── MobileAdminDashboard.tsx
│   ├── provider/
│   │   ├── MobileProviderDashboard.tsx
│   │   ├── LeadCard.tsx
│   │   └── JobNotification.tsx
│   ├── ui/                      # UI components
│   │   ├── stat-card.tsx
│   │   ├── lead-card.tsx
│   │   ├── pipeline-card.tsx
│   │   └── ...
│   ├── MobileQuoteForm.tsx
│   ├── QuoteForm.tsx
│   └── Providers.tsx            # NextAuth provider
│
├── lib/                         # Utilities and services
│   ├── prisma.ts               # Prisma client
│   ├── google-vision.ts        # Vision API service
│   ├── lead-distribution-new.ts # Lead distribution logic
│   ├── lead-service.ts         # Lead operations
│   ├── pricing-engine.ts       # Pricing calculations
│   ├── cloudinary.ts           # Image storage
│   ├── email-service.ts        # Email notifications
│   └── config/                 # Configuration
│       └── pricing.ts
│
├── prisma/
│   └── schema.prisma          # Database schema
│
├── types/
│   └── next-auth.d.ts         # NextAuth type definitions
│
├── middleware.ts              # Multi-tenant middleware
├── tailwind.config.ts         # Tailwind configuration
├── tsconfig.json              # TypeScript configuration
├── next.config.js             # Next.js configuration
└── package.json               # Dependencies
```

---

## CONCLUSION

This is a **well-architected SaaS platform** with:
- Solid multi-tenant foundation using domain-based routing
- Modern React/Next.js tech stack with strong typing
- Responsive design supporting desktop, tablet, and mobile
- Complex business logic for lead distribution and auto-bidding
- Integration with multiple third-party services

**Main gaps** are in authentication/authorization enforcement and final polish on the finance and notification systems. The foundation is strong and ready for these enhancements.

---

**Document Generated**: November 18, 2025
**Analysis Depth**: Very Thorough
**Repository**: /Users/fitzhall/projects/Junk Removal
