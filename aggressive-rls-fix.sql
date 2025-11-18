-- AGGRESSIVE FIX: Reset and fix ALL RLS policies
-- This will completely reset RLS and create working policies

-- Step 1: Drop ALL existing policies on these tables
DO $$
DECLARE
    pol RECORD;
BEGIN
    -- Drop all policies on providers
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'providers'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON providers';
    END LOOP;

    -- Drop all policies on quotes
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'quotes'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON quotes';
    END LOOP;

    -- Drop all policies on lead_distributions
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'lead_distributions'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON lead_distributions';
    END LOOP;

    -- Drop all policies on jobs
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'jobs'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON jobs';
    END LOOP;

    RAISE NOTICE 'All existing policies dropped';
END $$;

-- Step 2: Temporarily disable RLS to ensure we can create new policies
ALTER TABLE providers DISABLE ROW LEVEL SECURITY;
ALTER TABLE quotes DISABLE ROW LEVEL SECURITY;
ALTER TABLE lead_distributions DISABLE ROW LEVEL SECURITY;
ALTER TABLE jobs DISABLE ROW LEVEL SECURITY;

-- Step 3: Re-enable RLS
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Step 4: Create VERY simple policies that will definitely work

-- Providers: Users can see their own provider record
CREATE POLICY "providers_select" ON providers
    FOR SELECT
    USING (auth_user_id = auth.uid());

CREATE POLICY "providers_insert" ON providers
    FOR INSERT
    WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "providers_update" ON providers
    FOR UPDATE
    USING (auth_user_id = auth.uid());

-- Lead distributions: Users can see leads for their provider
CREATE POLICY "lead_distributions_select" ON lead_distributions
    FOR SELECT
    USING (
        provider_id IN (
            SELECT id FROM providers WHERE auth_user_id = auth.uid()
        )
    );

CREATE POLICY "lead_distributions_update" ON lead_distributions
    FOR UPDATE
    USING (
        provider_id IN (
            SELECT id FROM providers WHERE auth_user_id = auth.uid()
        )
    );

-- Quotes: Users can see quotes that were distributed to them
CREATE POLICY "quotes_select" ON quotes
    FOR SELECT
    USING (
        id IN (
            SELECT quote_id FROM lead_distributions
            WHERE provider_id IN (
                SELECT id FROM providers WHERE auth_user_id = auth.uid()
            )
        )
    );

-- Jobs: Users can see their own jobs
CREATE POLICY "jobs_select" ON jobs
    FOR SELECT
    USING (
        provider_id IN (
            SELECT id FROM providers WHERE auth_user_id = auth.uid()
        )
    );

-- Step 5: Grant necessary permissions (in case they're missing)
GRANT ALL ON providers TO authenticated;
GRANT ALL ON quotes TO authenticated;
GRANT ALL ON lead_distributions TO authenticated;
GRANT ALL ON jobs TO authenticated;

-- Step 6: Verify everything is set up correctly
DO $$
DECLARE
    user_id UUID;
    prov_id UUID;
    lead_count INT;
BEGIN
    -- Get the user
    SELECT id INTO user_id FROM auth.users WHERE email = 'provider1@test.com';
    RAISE NOTICE 'User ID: %', user_id;

    -- Get the provider
    SELECT id INTO prov_id FROM providers WHERE auth_user_id = user_id;
    RAISE NOTICE 'Provider ID: %', prov_id;

    -- Count leads
    SELECT COUNT(*) INTO lead_count
    FROM lead_distributions
    WHERE provider_id = prov_id;
    RAISE NOTICE 'Lead count: %', lead_count;

    -- Show the actual data
    RAISE NOTICE '';
    RAISE NOTICE 'Your data exists in the database:';
    RAISE NOTICE '- User: provider1@test.com';
    RAISE NOTICE '- Provider: %', prov_id;
    RAISE NOTICE '- Leads: %', lead_count;
END $$;

-- Step 7: Show current RLS status
SELECT
    tablename,
    CASE WHEN rowsecurity THEN '✅ RLS Enabled' ELSE '❌ RLS Disabled' END as rls_status,
    (SELECT COUNT(*) FROM pg_policies WHERE pg_policies.tablename = pg_tables.tablename) as policy_count
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('providers', 'quotes', 'lead_distributions', 'jobs');

-- Final message
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔧 AGGRESSIVE FIX COMPLETE!';
    RAISE NOTICE '';
    RAISE NOTICE '✅ All old policies removed';
    RAISE NOTICE '✅ RLS reset and re-enabled';
    RAISE NOTICE '✅ New simple policies created';
    RAISE NOTICE '✅ Permissions granted to authenticated users';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Now go to http://localhost:3000/provider/debug';
    RAISE NOTICE '   You should see ALL green checkmarks!';
END $$;