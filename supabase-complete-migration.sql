-- Complete Supabase Migration Script
-- This handles both new tables and updates to existing tables

-- STEP 1: Run the check script first to see what exists
-- Then run this complete migration

-- First, run the safe table creation (creates missing tables)
-- This is the content from supabase-tables-safe.sql
-- (Already run if tables exist)

-- STEP 2: Add missing columns to existing tables
-- Run the add-missing-columns.sql content here

-- STEP 3: Insert test data for development
-- Only run this section if you want test data

-- Create a test company (if it doesn't exist)
INSERT INTO "Company" (
    "id",
    "slug",
    "businessName",
    "contactEmail",
    "primaryColor",
    "secondaryColor",
    "createdAt",
    "updatedAt"
) VALUES (
    'test-company-001',
    'test-junk-removal',
    'Test Junk Removal Co',
    'test@junkremoval.com',
    '#3B82F6',
    '#1E40AF',
    NOW(),
    NOW()
) ON CONFLICT ("id") DO NOTHING;

-- Create a test user/provider (if it doesn't exist)
INSERT INTO "User" (
    "id",
    "email",
    "name",
    "role",
    "createdAt",
    "updatedAt"
) VALUES (
    'test-user-001',
    'provider@test.com',
    'Test Provider',
    'PROVIDER',
    NOW(),
    NOW()
) ON CONFLICT ("id") DO NOTHING;

-- Create a test provider
INSERT INTO "Provider" (
    "id",
    "userId",
    "companyId",
    "businessName",
    "businessAddress",
    "businessPhone",
    "status",
    "createdAt",
    "updatedAt"
) VALUES (
    'test-provider-001',
    'test-user-001',
    'test-company-001',
    'Test Junk Removal Services',
    '123 Main St, Test City, TC 12345',
    '555-0100',
    'ACTIVE',
    NOW(),
    NOW()
) ON CONFLICT ("id") DO NOTHING;

-- Create a test service area
INSERT INTO "ServiceArea" (
    "id",
    "providerId",
    "zipCode",
    "city",
    "state",
    "country",
    "maxRadiusMiles",
    "isPrimary",
    "createdAt"
) VALUES (
    'test-area-001',
    'test-provider-001',
    '12345',
    'Test City',
    'TC',
    'US',
    25,
    true,
    NOW()
) ON CONFLICT ("id") DO NOTHING;

-- Create a test quote
INSERT INTO "Quote" (
    "id",
    "companyId",
    "status",
    "customerName",
    "customerEmail",
    "customerPhone",
    "pickupAddress",
    "pickupCity",
    "pickupState",
    "pickupZip",
    "totalPrice",
    "preferredDate",
    "createdAt",
    "updatedAt"
) VALUES (
    'test-quote-001',
    'test-company-001',
    'SENT',
    'John Doe',
    'john@example.com',
    '555-0199',
    '456 Oak St',
    'Test City',
    'TC',
    '12345',
    250.00,
    NOW() + INTERVAL '2 days',
    NOW(),
    NOW()
) ON CONFLICT ("id") DO NOTHING;

-- Create a test lead distribution
INSERT INTO "LeadDistribution" (
    "id",
    "quoteId",
    "providerId",
    "status",
    "sentAt",
    "createdAt"
) VALUES (
    'test-lead-001',
    'test-quote-001',
    'test-provider-001',
    'SENT',
    NOW(),
    NOW()
) ON CONFLICT ("id") DO NOTHING;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Migration completed successfully!';
    RAISE NOTICE 'Test data has been created.';
    RAISE NOTICE 'You can now test the provider login at /provider/login-supabase';
END $$;