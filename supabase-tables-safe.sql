-- Safe Supabase Table Creation (handles existing types/tables)

-- Drop existing types if needed (BE CAREFUL - only if no data)
-- DROP TYPE IF EXISTS "Role" CASCADE;

-- Create ENUMs only if they don't exist
DO $$ BEGIN
    CREATE TYPE "Role" AS ENUM ('CUSTOMER', 'PROVIDER', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "QuoteStatus" AS ENUM ('DRAFT', 'PENDING', 'SENT', 'ACCEPTED', 'BOOKED', 'EXPIRED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "JobStatus" AS ENUM ('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "LeadStatus" AS ENUM ('SENT', 'VIEWED', 'ACCEPTED', 'DECLINED', 'EXPIRED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "BidStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN', 'EXPIRED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "VolumeSize" AS ENUM ('QUARTER', 'HALF', 'THREE_QUARTER', 'FULL', 'MULTIPLE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "ProviderStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'PAST_DUE', 'CANCELLED', 'TRIALING');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "SubscriptionPlan" AS ENUM ('STARTER', 'PRO', 'ENTERPRISE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create tables only if they don't exist
CREATE TABLE IF NOT EXISTS "Company" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT,
    "logoUrl" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#3B82F6',
    "secondaryColor" TEXT NOT NULL DEFAULT '#1E40AF',
    "subdomain" TEXT,
    "customDomain" TEXT,
    "domainVerified" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "subscriptionPlan" "SubscriptionPlan" NOT NULL DEFAULT 'STARTER',
    "subscriptionStatus" "SubscriptionStatus" NOT NULL DEFAULT 'TRIALING',
    "subscriptionId" TEXT,
    "activationFee" DOUBLE PRECISION NOT NULL DEFAULT 500,
    "monthlyFee" DOUBLE PRECISION NOT NULL DEFAULT 297,
    "activationPaidAt" TIMESTAMP(3),
    "trialEndsAt" TIMESTAMP(3),
    "hasBookingFeature" BOOLEAN NOT NULL DEFAULT false,
    "hasAnalytics" BOOLEAN NOT NULL DEFAULT false,
    "maxQuotesPerMonth" INTEGER NOT NULL DEFAULT 1000,
    "notificationEmail" TEXT,
    "webhookUrl" TEXT,
    "embedCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "hashedPassword" TEXT,
    "phone" TEXT,
    "name" TEXT,
    "role" "Role" NOT NULL DEFAULT 'CUSTOMER',
    "emailVerified" TIMESTAMP(3),
    "phoneVerified" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Provider" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyId" TEXT,
    "businessName" TEXT NOT NULL,
    "businessAddress" TEXT,
    "businessPhone" TEXT,
    "licenseNumber" TEXT,
    "insuranceInfo" JSONB,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalJobs" INTEGER NOT NULL DEFAULT 0,
    "status" "ProviderStatus" NOT NULL DEFAULT 'PENDING',
    "paymentTerms" JSONB,
    "capabilities" JSONB,
    "operatingHours" JSONB,
    "autoBidEnabled" BOOLEAN NOT NULL DEFAULT false,
    "bidStrategy" TEXT,
    "bidPercentage" DOUBLE PRECISION,
    "bidFixedAmount" DOUBLE PRECISION,
    "maxJobsPerDay" INTEGER NOT NULL DEFAULT 5,
    "preferredJobTypes" JSONB,
    "minJobValue" DOUBLE PRECISION,
    "maxJobValue" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Provider_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ServiceArea" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'US',
    "maxRadiusMiles" INTEGER NOT NULL DEFAULT 25,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ServiceArea_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Quote" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "companyId" TEXT,
    "status" "QuoteStatus" NOT NULL DEFAULT 'DRAFT',
    "customerName" TEXT,
    "customerEmail" TEXT,
    "customerPhone" TEXT,
    "pickupAddress" TEXT,
    "pickupZip" TEXT,
    "pickupCity" TEXT,
    "pickupState" TEXT,
    "photoUrls" JSONB,
    "aiAnalysis" JSONB,
    "estimatedVolume" "VolumeSize",
    "basePrice" DOUBLE PRECISION,
    "additionalFees" JSONB,
    "totalPrice" DOUBLE PRECISION,
    "priceRangeMin" DOUBLE PRECISION,
    "priceRangeMax" DOUBLE PRECISION,
    "preferredDate" TIMESTAMP(3),
    "preferredTimeWindow" TEXT,
    "isUrgent" BOOLEAN NOT NULL DEFAULT false,
    "source" TEXT,
    "utmParams" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "QuoteItem" (
    "id" TEXT NOT NULL,
    "quoteId" TEXT NOT NULL,
    "itemType" TEXT NOT NULL,
    "itemDescription" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "aiConfidence" DOUBLE PRECISION,
    "requiresSpecialHandling" BOOLEAN NOT NULL DEFAULT false,
    "estimatedWeightLbs" INTEGER,
    "dimensions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "QuoteItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Booking" (
    "id" TEXT NOT NULL,
    "quoteId" TEXT NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "timeSlot" TEXT NOT NULL,
    "isUrgent" BOOLEAN NOT NULL DEFAULT false,
    "estimatedPrice" DOUBLE PRECISION NOT NULL,
    "customerName" TEXT,
    "customerEmail" TEXT,
    "customerPhone" TEXT,
    "pickupAddress" TEXT,
    "pickupZip" TEXT,
    "pickupCity" TEXT,
    "pickupState" TEXT,
    "confirmationCode" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Bid" (
    "id" TEXT NOT NULL,
    "quoteId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "status" "BidStatus" NOT NULL DEFAULT 'PENDING',
    "bidAmount" DOUBLE PRECISION NOT NULL,
    "estimatedDuration" TEXT,
    "proposedDate" TIMESTAMP(3),
    "message" TEXT,
    "notes" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL DEFAULT (NOW() + INTERVAL '48 hours'),
    "acceptedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Bid_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Job" (
    "id" TEXT NOT NULL,
    "quoteId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'PENDING',
    "scheduledDate" TIMESTAMP(3),
    "scheduledTime" TEXT,
    "actualStartTime" TIMESTAMP(3),
    "actualEndTime" TIMESTAMP(3),
    "finalPrice" DOUBLE PRECISION,
    "providerPayout" DOUBLE PRECISION,
    "platformFee" DOUBLE PRECISION,
    "completionPhotos" JSONB,
    "customerSignature" TEXT,
    "notes" TEXT,
    "customerRating" INTEGER,
    "customerReview" TEXT,
    "providerRating" INTEGER,
    "providerFeedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "LeadDistribution" (
    "id" TEXT NOT NULL,
    "quoteId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "status" "LeadStatus" NOT NULL DEFAULT 'SENT',
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "viewedAt" TIMESTAMP(3),
    "respondedAt" TIMESTAMP(3),
    "responseReason" TEXT,
    "bidAmount" DOUBLE PRECISION,
    "isWinner" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LeadDistribution_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "PricingRule" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "zipCode" TEXT,
    "city" TEXT,
    "state" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "quarterTruckPrice" DOUBLE PRECISION,
    "halfTruckPrice" DOUBLE PRECISION,
    "threeQuarterTruckPrice" DOUBLE PRECISION,
    "fullTruckPrice" DOUBLE PRECISION,
    "heavyItemFee" DOUBLE PRECISION,
    "stairsFee" DOUBLE PRECISION,
    "longCarryFee" DOUBLE PRECISION,
    "sameDayFee" DOUBLE PRECISION,
    "weekendFee" DOUBLE PRECISION,
    "peakTimeMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "holidayMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.5,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PricingRule_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "AnalyticsEvent" (
    "id" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT,
    "eventData" JSONB,
    "pageUrl" TEXT,
    "referrer" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "deviceType" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "country" TEXT,
    "region" TEXT,
    "city" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- Create indexes only if they don't exist
CREATE UNIQUE INDEX IF NOT EXISTS "Company_slug_key" ON "Company"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "Company_subdomain_key" ON "Company"("subdomain");
CREATE UNIQUE INDEX IF NOT EXISTS "Company_customDomain_key" ON "Company"("customDomain");
CREATE INDEX IF NOT EXISTS "Company_slug_idx" ON "Company"("slug");
CREATE INDEX IF NOT EXISTS "Company_subdomain_idx" ON "Company"("subdomain");
CREATE INDEX IF NOT EXISTS "Company_customDomain_idx" ON "Company"("customDomain");
CREATE INDEX IF NOT EXISTS "Company_subscriptionStatus_idx" ON "Company"("subscriptionStatus");
CREATE INDEX IF NOT EXISTS "Company_isActive_idx" ON "Company"("isActive");

CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");
CREATE INDEX IF NOT EXISTS "User_phone_idx" ON "User"("phone");
CREATE INDEX IF NOT EXISTS "User_role_idx" ON "User"("role");

CREATE UNIQUE INDEX IF NOT EXISTS "Provider_userId_key" ON "Provider"("userId");
CREATE INDEX IF NOT EXISTS "Provider_status_idx" ON "Provider"("status");
CREATE INDEX IF NOT EXISTS "Provider_rating_idx" ON "Provider"("rating");
CREATE INDEX IF NOT EXISTS "Provider_autoBidEnabled_idx" ON "Provider"("autoBidEnabled");
CREATE INDEX IF NOT EXISTS "Provider_companyId_idx" ON "Provider"("companyId");

CREATE INDEX IF NOT EXISTS "ServiceArea_zipCode_idx" ON "ServiceArea"("zipCode");
CREATE INDEX IF NOT EXISTS "ServiceArea_city_state_idx" ON "ServiceArea"("city", "state");

CREATE INDEX IF NOT EXISTS "Quote_status_idx" ON "Quote"("status");
CREATE INDEX IF NOT EXISTS "Quote_userId_idx" ON "Quote"("userId");
CREATE INDEX IF NOT EXISTS "Quote_companyId_idx" ON "Quote"("companyId");
CREATE INDEX IF NOT EXISTS "Quote_pickupZip_idx" ON "Quote"("pickupZip");
CREATE INDEX IF NOT EXISTS "Quote_createdAt_idx" ON "Quote"("createdAt");

CREATE INDEX IF NOT EXISTS "QuoteItem_quoteId_idx" ON "QuoteItem"("quoteId");

CREATE INDEX IF NOT EXISTS "Booking_quoteId_idx" ON "Booking"("quoteId");
CREATE INDEX IF NOT EXISTS "Booking_status_idx" ON "Booking"("status");
CREATE INDEX IF NOT EXISTS "Booking_scheduledDate_idx" ON "Booking"("scheduledDate");
CREATE INDEX IF NOT EXISTS "Booking_customerEmail_idx" ON "Booking"("customerEmail");

CREATE INDEX IF NOT EXISTS "Bid_quoteId_idx" ON "Bid"("quoteId");
CREATE INDEX IF NOT EXISTS "Bid_providerId_idx" ON "Bid"("providerId");
CREATE INDEX IF NOT EXISTS "Bid_status_idx" ON "Bid"("status");
CREATE INDEX IF NOT EXISTS "Bid_createdAt_idx" ON "Bid"("createdAt");

CREATE UNIQUE INDEX IF NOT EXISTS "Job_quoteId_key" ON "Job"("quoteId");
CREATE INDEX IF NOT EXISTS "Job_status_idx" ON "Job"("status");
CREATE INDEX IF NOT EXISTS "Job_providerId_idx" ON "Job"("providerId");
CREATE INDEX IF NOT EXISTS "Job_scheduledDate_idx" ON "Job"("scheduledDate");

CREATE INDEX IF NOT EXISTS "LeadDistribution_quoteId_idx" ON "LeadDistribution"("quoteId");
CREATE INDEX IF NOT EXISTS "LeadDistribution_providerId_idx" ON "LeadDistribution"("providerId");
CREATE INDEX IF NOT EXISTS "LeadDistribution_status_idx" ON "LeadDistribution"("status");

CREATE INDEX IF NOT EXISTS "PricingRule_state_city_zipCode_idx" ON "PricingRule"("state", "city", "zipCode");
CREATE INDEX IF NOT EXISTS "PricingRule_isActive_priority_idx" ON "PricingRule"("isActive", "priority");

CREATE INDEX IF NOT EXISTS "AnalyticsEvent_eventType_idx" ON "AnalyticsEvent"("eventType");
CREATE INDEX IF NOT EXISTS "AnalyticsEvent_userId_idx" ON "AnalyticsEvent"("userId");
CREATE INDEX IF NOT EXISTS "AnalyticsEvent_sessionId_idx" ON "AnalyticsEvent"("sessionId");
CREATE INDEX IF NOT EXISTS "AnalyticsEvent_createdAt_idx" ON "AnalyticsEvent"("createdAt");

-- Add foreign keys only if tables exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Provider_userId_fkey') THEN
        ALTER TABLE "Provider" ADD CONSTRAINT "Provider_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Provider_companyId_fkey') THEN
        ALTER TABLE "Provider" ADD CONSTRAINT "Provider_companyId_fkey"
        FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ServiceArea_providerId_fkey') THEN
        ALTER TABLE "ServiceArea" ADD CONSTRAINT "ServiceArea_providerId_fkey"
        FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Quote_userId_fkey') THEN
        ALTER TABLE "Quote" ADD CONSTRAINT "Quote_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Quote_companyId_fkey') THEN
        ALTER TABLE "Quote" ADD CONSTRAINT "Quote_companyId_fkey"
        FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'QuoteItem_quoteId_fkey') THEN
        ALTER TABLE "QuoteItem" ADD CONSTRAINT "QuoteItem_quoteId_fkey"
        FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Booking_quoteId_fkey') THEN
        ALTER TABLE "Booking" ADD CONSTRAINT "Booking_quoteId_fkey"
        FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Bid_quoteId_fkey') THEN
        ALTER TABLE "Bid" ADD CONSTRAINT "Bid_quoteId_fkey"
        FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Bid_providerId_fkey') THEN
        ALTER TABLE "Bid" ADD CONSTRAINT "Bid_providerId_fkey"
        FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Job_quoteId_fkey') THEN
        ALTER TABLE "Job" ADD CONSTRAINT "Job_quoteId_fkey"
        FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Job_providerId_fkey') THEN
        ALTER TABLE "Job" ADD CONSTRAINT "Job_providerId_fkey"
        FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'LeadDistribution_quoteId_fkey') THEN
        ALTER TABLE "LeadDistribution" ADD CONSTRAINT "LeadDistribution_quoteId_fkey"
        FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'LeadDistribution_providerId_fkey') THEN
        ALTER TABLE "LeadDistribution" ADD CONSTRAINT "LeadDistribution_providerId_fkey"
        FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'AnalyticsEvent_userId_fkey') THEN
        ALTER TABLE "AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Tables created/verified successfully!';
END $$;