-- Migration Script: Neon to Supabase
-- Run this in your Supabase SQL Editor after creating a new project

-- ============================================
-- STEP 1: Enable necessary extensions
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- STEP 2: Create auth schema tables (if not exists)
-- ============================================
-- Supabase auth.users table is already created, but we need to map our User model

-- ============================================
-- STEP 3: Create custom user profiles table that links to Supabase auth
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'CUSTOMER' CHECK (role IN ('CUSTOMER', 'PROVIDER', 'ADMIN')),
  email_verified TIMESTAMP WITH TIME ZONE,
  phone_verified TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- STEP 4: Update Provider table to reference auth.users
-- ============================================
-- First, add a temporary column for migration
ALTER TABLE "Provider" ADD COLUMN IF NOT EXISTS auth_user_id UUID;

-- ============================================
-- STEP 5: Create trigger to auto-create profile on signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'CUSTOMER'),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- STEP 6: Enable Row Level Security (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Provider" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Company" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Quote" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "LeadDistribution" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Job" ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 7: Create RLS Policies for Multi-Tenant Isolation
-- ============================================

-- Profiles: Users can only see their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Providers: Can only see their own provider record
CREATE POLICY "Providers can view own record" ON "Provider"
  FOR SELECT USING (
    auth_user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'ADMIN'
    )
  );

CREATE POLICY "Providers can update own record" ON "Provider"
  FOR UPDATE USING (auth_user_id = auth.uid());

-- LeadDistribution: Providers can only see their own leads
CREATE POLICY "Providers see own leads" ON "LeadDistribution"
  FOR SELECT USING (
    "providerId" IN (
      SELECT id FROM "Provider"
      WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Providers can update own leads" ON "LeadDistribution"
  FOR UPDATE USING (
    "providerId" IN (
      SELECT id FROM "Provider"
      WHERE auth_user_id = auth.uid()
    )
  );

-- Company: Multi-tenant isolation
CREATE POLICY "Company members can view company" ON "Company"
  FOR SELECT USING (
    id IN (
      SELECT "companyId" FROM "Provider"
      WHERE auth_user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'ADMIN'
    )
  );

-- Jobs: Providers can only see their own jobs
CREATE POLICY "Providers see own jobs" ON "Job"
  FOR SELECT USING (
    "providerId" IN (
      SELECT id FROM "Provider"
      WHERE auth_user_id = auth.uid()
    )
  );

-- ============================================
-- STEP 8: Create functions for common queries
-- ============================================

-- Function to get current user's provider record
CREATE OR REPLACE FUNCTION get_current_provider()
RETURNS TABLE (
  id UUID,
  business_name TEXT,
  company_id UUID,
  status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p."businessName",
    p."companyId",
    p.status::TEXT
  FROM "Provider" p
  WHERE p.auth_user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get provider's leads
CREATE OR REPLACE FUNCTION get_provider_leads()
RETURNS TABLE (
  id UUID,
  quote_id UUID,
  status TEXT,
  sent_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ld.id,
    ld."quoteId",
    ld.status::TEXT,
    ld."sentAt"
  FROM "LeadDistribution" ld
  JOIN "Provider" p ON p.id = ld."providerId"
  WHERE p.auth_user_id = auth.uid()
  ORDER BY ld."sentAt" DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- STEP 9: Create indexes for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_provider_auth_user_id ON "Provider"(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- ============================================
-- STEP 10: Set up real-time subscriptions
-- ============================================
-- Enable real-time for lead notifications
ALTER PUBLICATION supabase_realtime ADD TABLE "LeadDistribution";

-- ============================================
-- Migration Notes:
-- ============================================
-- 1. After running this script, update your .env to use Supabase DATABASE_URL
-- 2. Run: npx prisma db pull to update your schema
-- 3. Update your application code to use Supabase Auth
-- 4. Test all provider functionality
-- ============================================