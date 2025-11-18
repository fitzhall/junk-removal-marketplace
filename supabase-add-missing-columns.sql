-- Add missing columns to existing tables (safe version)
-- This script adds columns that may be missing from your existing tables

-- Company table - add missing columns if they don't exist
DO $$
BEGIN
    -- Add subdomain column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='Company' AND column_name='subdomain') THEN
        ALTER TABLE "Company" ADD COLUMN "subdomain" TEXT;
    END IF;

    -- Add customDomain column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='Company' AND column_name='customDomain') THEN
        ALTER TABLE "Company" ADD COLUMN "customDomain" TEXT;
    END IF;

    -- Add domainVerified column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='Company' AND column_name='domainVerified') THEN
        ALTER TABLE "Company" ADD COLUMN "domainVerified" BOOLEAN DEFAULT false;
    END IF;

    -- Add subscription columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='Company' AND column_name='subscriptionPlan') THEN
        ALTER TABLE "Company" ADD COLUMN "subscriptionPlan" "SubscriptionPlan" DEFAULT 'STARTER';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='Company' AND column_name='subscriptionStatus') THEN
        ALTER TABLE "Company" ADD COLUMN "subscriptionStatus" "SubscriptionStatus" DEFAULT 'TRIALING';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='Company' AND column_name='subscriptionId') THEN
        ALTER TABLE "Company" ADD COLUMN "subscriptionId" TEXT;
    END IF;

    -- Add pricing columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='Company' AND column_name='activationFee') THEN
        ALTER TABLE "Company" ADD COLUMN "activationFee" DOUBLE PRECISION DEFAULT 500;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='Company' AND column_name='monthlyFee') THEN
        ALTER TABLE "Company" ADD COLUMN "monthlyFee" DOUBLE PRECISION DEFAULT 297;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='Company' AND column_name='activationPaidAt') THEN
        ALTER TABLE "Company" ADD COLUMN "activationPaidAt" TIMESTAMP(3);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='Company' AND column_name='trialEndsAt') THEN
        ALTER TABLE "Company" ADD COLUMN "trialEndsAt" TIMESTAMP(3);
    END IF;

    -- Add feature flags
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='Company' AND column_name='hasBookingFeature') THEN
        ALTER TABLE "Company" ADD COLUMN "hasBookingFeature" BOOLEAN DEFAULT false;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='Company' AND column_name='hasAnalytics') THEN
        ALTER TABLE "Company" ADD COLUMN "hasAnalytics" BOOLEAN DEFAULT false;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='Company' AND column_name='maxQuotesPerMonth') THEN
        ALTER TABLE "Company" ADD COLUMN "maxQuotesPerMonth" INTEGER DEFAULT 1000;
    END IF;

    -- Add notification columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='Company' AND column_name='notificationEmail') THEN
        ALTER TABLE "Company" ADD COLUMN "notificationEmail" TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='Company' AND column_name='webhookUrl') THEN
        ALTER TABLE "Company" ADD COLUMN "webhookUrl" TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='Company' AND column_name='embedCode') THEN
        ALTER TABLE "Company" ADD COLUMN "embedCode" TEXT;
    END IF;

    -- Add updatedAt if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='Company' AND column_name='updatedAt') THEN
        ALTER TABLE "Company" ADD COLUMN "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;
    END IF;

    RAISE NOTICE 'Company table columns updated successfully';
END $$;

-- Provider table - add auto-bidding columns if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='Provider' AND column_name='autoBidEnabled') THEN
        ALTER TABLE "Provider" ADD COLUMN "autoBidEnabled" BOOLEAN DEFAULT false;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='Provider' AND column_name='bidStrategy') THEN
        ALTER TABLE "Provider" ADD COLUMN "bidStrategy" TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='Provider' AND column_name='bidPercentage') THEN
        ALTER TABLE "Provider" ADD COLUMN "bidPercentage" DOUBLE PRECISION;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='Provider' AND column_name='bidFixedAmount') THEN
        ALTER TABLE "Provider" ADD COLUMN "bidFixedAmount" DOUBLE PRECISION;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='Provider' AND column_name='maxJobsPerDay') THEN
        ALTER TABLE "Provider" ADD COLUMN "maxJobsPerDay" INTEGER DEFAULT 5;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='Provider' AND column_name='preferredJobTypes') THEN
        ALTER TABLE "Provider" ADD COLUMN "preferredJobTypes" JSONB;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='Provider' AND column_name='minJobValue') THEN
        ALTER TABLE "Provider" ADD COLUMN "minJobValue" DOUBLE PRECISION;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='Provider' AND column_name='maxJobValue') THEN
        ALTER TABLE "Provider" ADD COLUMN "maxJobValue" DOUBLE PRECISION;
    END IF;

    -- Add companyId if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='Provider' AND column_name='companyId') THEN
        ALTER TABLE "Provider" ADD COLUMN "companyId" TEXT;
    END IF;

    RAISE NOTICE 'Provider table columns updated successfully';
END $$;

-- Quote table - add missing columns
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='Quote' AND column_name='companyId') THEN
        ALTER TABLE "Quote" ADD COLUMN "companyId" TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='Quote' AND column_name='source') THEN
        ALTER TABLE "Quote" ADD COLUMN "source" TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='Quote' AND column_name='utmParams') THEN
        ALTER TABLE "Quote" ADD COLUMN "utmParams" JSONB;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='Quote' AND column_name='ipAddress') THEN
        ALTER TABLE "Quote" ADD COLUMN "ipAddress" TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='Quote' AND column_name='userAgent') THEN
        ALTER TABLE "Quote" ADD COLUMN "userAgent" TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='Quote' AND column_name='expiresAt') THEN
        ALTER TABLE "Quote" ADD COLUMN "expiresAt" TIMESTAMP(3) DEFAULT (NOW() + INTERVAL '7 days');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='Quote' AND column_name='updatedAt') THEN
        ALTER TABLE "Quote" ADD COLUMN "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;
    END IF;

    RAISE NOTICE 'Quote table columns updated successfully';
END $$;

-- Now create any indexes that are missing
DO $$
BEGIN
    -- Company indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename='Company' AND indexname='Company_subdomain_key') THEN
        CREATE UNIQUE INDEX "Company_subdomain_key" ON "Company"("subdomain") WHERE "subdomain" IS NOT NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename='Company' AND indexname='Company_customDomain_key') THEN
        CREATE UNIQUE INDEX "Company_customDomain_key" ON "Company"("customDomain") WHERE "customDomain" IS NOT NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename='Company' AND indexname='Company_subdomain_idx') THEN
        CREATE INDEX "Company_subdomain_idx" ON "Company"("subdomain");
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename='Company' AND indexname='Company_customDomain_idx') THEN
        CREATE INDEX "Company_customDomain_idx" ON "Company"("customDomain");
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename='Company' AND indexname='Company_subscriptionStatus_idx') THEN
        CREATE INDEX "Company_subscriptionStatus_idx" ON "Company"("subscriptionStatus");
    END IF;

    -- Provider indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename='Provider' AND indexname='Provider_autoBidEnabled_idx') THEN
        CREATE INDEX "Provider_autoBidEnabled_idx" ON "Provider"("autoBidEnabled");
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename='Provider' AND indexname='Provider_companyId_idx') THEN
        CREATE INDEX "Provider_companyId_idx" ON "Provider"("companyId");
    END IF;

    -- Quote indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename='Quote' AND indexname='Quote_companyId_idx') THEN
        CREATE INDEX "Quote_companyId_idx" ON "Quote"("companyId");
    END IF;

    RAISE NOTICE 'Indexes created successfully';
END $$;

-- Add foreign key constraints if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Provider_companyId_fkey') THEN
        ALTER TABLE "Provider" ADD CONSTRAINT "Provider_companyId_fkey"
        FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Quote_companyId_fkey') THEN
        ALTER TABLE "Quote" ADD CONSTRAINT "Quote_companyId_fkey"
        FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;

    RAISE NOTICE 'Foreign key constraints added successfully';
END $$;

-- Final success message
DO $$
BEGIN
    RAISE NOTICE '✅ All missing columns and constraints have been added successfully!';
END $$;