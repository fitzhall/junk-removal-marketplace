-- ============================================
-- Supabase Migration Script v2
-- This script assumes you're starting fresh in Supabase
-- ============================================

-- ============================================
-- STEP 1: Enable necessary extensions
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- STEP 2: First, let's check what exists and create tables
-- ============================================

-- Since you're migrating from Neon, we need to import your schema first
-- Option A: Run your Neon export first, then continue with this script
-- Option B: Use the schema creation below

-- ============================================
-- STEP 3: Create profiles table that links to Supabase auth
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
-- STEP 4: Create trigger to auto-create profile on signup
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
  )
  ON CONFLICT (id) DO UPDATE
  SET
    name = EXCLUDED.name,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- STEP 5: Check if tables exist before adding RLS
-- ============================================

-- Only enable RLS if tables exist
DO $$
BEGIN
  -- Enable RLS on profiles
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
    ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

    -- Create policies for profiles
    DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
    CREATE POLICY "Users can view own profile" ON profiles
      FOR SELECT USING (auth.uid() = id);

    DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
    CREATE POLICY "Users can update own profile" ON profiles
      FOR UPDATE USING (auth.uid() = id);
  END IF;

  -- Enable RLS on Provider if it exists
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Provider') THEN
    -- First add the auth_user_id column if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns
                   WHERE table_schema = 'public'
                   AND table_name = 'Provider'
                   AND column_name = 'auth_user_id') THEN
      ALTER TABLE "Provider" ADD COLUMN auth_user_id UUID;
    END IF;

    ALTER TABLE "Provider" ENABLE ROW LEVEL SECURITY;

    -- Create policies
    DROP POLICY IF EXISTS "Providers can view own record" ON "Provider";
    CREATE POLICY "Providers can view own record" ON "Provider"
      FOR SELECT USING (
        auth_user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.role = 'ADMIN'
        )
      );

    DROP POLICY IF EXISTS "Providers can update own record" ON "Provider";
    CREATE POLICY "Providers can update own record" ON "Provider"
      FOR UPDATE USING (auth_user_id = auth.uid());
  END IF;

  -- Enable RLS on LeadDistribution if it exists
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'LeadDistribution') THEN
    ALTER TABLE "LeadDistribution" ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Providers see own leads" ON "LeadDistribution";
    CREATE POLICY "Providers see own leads" ON "LeadDistribution"
      FOR SELECT USING (
        "providerId" IN (
          SELECT id FROM "Provider"
          WHERE auth_user_id = auth.uid()
        )
      );

    DROP POLICY IF EXISTS "Providers can update own leads" ON "LeadDistribution";
    CREATE POLICY "Providers can update own leads" ON "LeadDistribution"
      FOR UPDATE USING (
        "providerId" IN (
          SELECT id FROM "Provider"
          WHERE auth_user_id = auth.uid()
        )
      );
  END IF;

  -- Enable RLS on Company if it exists (and has companyId column)
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Company') THEN
    ALTER TABLE "Company" ENABLE ROW LEVEL SECURITY;

    -- Check if Provider table has companyId or company_id
    IF EXISTS (SELECT FROM information_schema.columns
               WHERE table_schema = 'public'
               AND table_name = 'Provider'
               AND (column_name = 'companyId' OR column_name = 'company_id')) THEN

      DROP POLICY IF EXISTS "Company members can view company" ON "Company";
      CREATE POLICY "Company members can view company" ON "Company"
        FOR SELECT USING (
          id IN (
            SELECT COALESCE("companyId", "company_id")
            FROM "Provider"
            WHERE auth_user_id = auth.uid()
          ) OR
          EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'ADMIN'
          )
        );
    END IF;
  END IF;

  -- Enable RLS on Job if it exists
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Job') THEN
    ALTER TABLE "Job" ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Providers see own jobs" ON "Job";
    CREATE POLICY "Providers see own jobs" ON "Job"
      FOR SELECT USING (
        "providerId" IN (
          SELECT id FROM "Provider"
          WHERE auth_user_id = auth.uid()
        )
      );
  END IF;

  -- Enable RLS on Quote if it exists
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Quote') THEN
    ALTER TABLE "Quote" ENABLE ROW LEVEL SECURITY;

    -- Add appropriate policies for Quote
    DROP POLICY IF EXISTS "Public can create quotes" ON "Quote";
    CREATE POLICY "Public can create quotes" ON "Quote"
      FOR INSERT WITH CHECK (true);

    DROP POLICY IF EXISTS "Users can view own quotes" ON "Quote";
    CREATE POLICY "Users can view own quotes" ON "Quote"
      FOR SELECT USING (
        -- Customers can see their quotes
        "userId" = auth.uid() OR
        -- Providers can see quotes distributed to them
        id IN (
          SELECT "quoteId" FROM "LeadDistribution"
          WHERE "providerId" IN (
            SELECT id FROM "Provider"
            WHERE auth_user_id = auth.uid()
          )
        ) OR
        -- Admins can see all
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.role = 'ADMIN'
        )
      );
  END IF;
END $$;

-- ============================================
-- STEP 6: Create helper functions
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
    COALESCE(p."companyId", p."company_id"),
    p.status::TEXT
  FROM "Provider" p
  WHERE p.auth_user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get provider's leads
CREATE OR REPLACE FUNCTION get_provider_leads(
  limit_count INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  quote_id UUID,
  status TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  customer_name TEXT,
  estimated_value DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ld.id,
    ld."quoteId",
    ld.status::TEXT,
    ld."sentAt",
    q."customerName",
    COALESCE(q."totalPrice", q."priceRangeMax")
  FROM "LeadDistribution" ld
  JOIN "Provider" p ON p.id = ld."providerId"
  LEFT JOIN "Quote" q ON q.id = ld."quoteId"
  WHERE p.auth_user_id = auth.uid()
  ORDER BY ld."sentAt" DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- STEP 7: Create indexes for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Only create indexes if tables exist
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Provider') THEN
    CREATE INDEX IF NOT EXISTS idx_provider_auth_user_id ON "Provider"(auth_user_id);
  END IF;
END $$;

-- ============================================
-- STEP 8: Enable real-time (only if table exists)
-- ============================================
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'LeadDistribution') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE "LeadDistribution";
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- Publication might already include the table
    NULL;
END $$;

-- ============================================
-- MIGRATION COMPLETE!
-- ============================================
-- Next steps:
-- 1. If you haven't imported your Neon data yet, do it now
-- 2. Update your .env.local with Supabase DATABASE_URL
-- 3. Run: npx prisma db pull
-- 4. Test authentication at /provider/login-supabase
-- ============================================