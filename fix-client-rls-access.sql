-- Fix Client-Side RLS Access for provider1@test.com
-- This ensures the dashboard can read the data

-- First, check if RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('providers', 'quotes', 'lead_distributions', 'jobs');

-- Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Users can view own provider profile" ON providers;
DROP POLICY IF EXISTS "Users can insert own provider profile" ON providers;
DROP POLICY IF EXISTS "Users can update own provider profile" ON providers;
DROP POLICY IF EXISTS "Providers can view distributed quotes" ON quotes;
DROP POLICY IF EXISTS "Providers can view own leads" ON lead_distributions;
DROP POLICY IF EXISTS "Providers can update own leads" ON lead_distributions;
DROP POLICY IF EXISTS "Providers can view own jobs" ON jobs;

-- Create simpler, working policies for providers table
CREATE POLICY "Enable read access for users to own provider" ON providers
    FOR SELECT
    USING (auth.uid() = auth_user_id);

CREATE POLICY "Enable insert for users" ON providers
    FOR INSERT
    WITH CHECK (auth.uid() = auth_user_id);

CREATE POLICY "Enable update for users to own provider" ON providers
    FOR UPDATE
    USING (auth.uid() = auth_user_id);

-- Create policies for lead_distributions
CREATE POLICY "Enable read for providers" ON lead_distributions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM providers
            WHERE providers.id = lead_distributions.provider_id
            AND providers.auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Enable update for providers" ON lead_distributions
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM providers
            WHERE providers.id = lead_distributions.provider_id
            AND providers.auth_user_id = auth.uid()
        )
    );

-- Create policies for quotes - allow providers to see quotes distributed to them
CREATE POLICY "Enable read for distributed quotes" ON quotes
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM lead_distributions ld
            JOIN providers p ON p.id = ld.provider_id
            WHERE ld.quote_id = quotes.id
            AND p.auth_user_id = auth.uid()
        )
    );

-- Create policies for jobs
CREATE POLICY "Enable read for provider jobs" ON jobs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM providers
            WHERE providers.id = jobs.provider_id
            AND providers.auth_user_id = auth.uid()
        )
    );

-- Verify the user and provider exist
DO $$
DECLARE
    user_id UUID;
    prov_id UUID;
    lead_count INT;
BEGIN
    SELECT id INTO user_id FROM auth.users WHERE email = 'provider1@test.com';

    IF user_id IS NULL THEN
        RAISE NOTICE '❌ User not found';
    ELSE
        RAISE NOTICE '✅ User ID: %', user_id;

        SELECT id INTO prov_id FROM providers WHERE auth_user_id = user_id;

        IF prov_id IS NULL THEN
            RAISE NOTICE '❌ Provider not found';
        ELSE
            RAISE NOTICE '✅ Provider ID: %', prov_id;

            SELECT COUNT(*) INTO lead_count
            FROM lead_distributions
            WHERE provider_id = prov_id;

            RAISE NOTICE '✅ Lead count: %', lead_count;
        END IF;
    END IF;
END $$;

-- Verify the data exists (running as superuser)
SELECT 'Checking data exists in tables:' as info;

SELECT
    'Providers' as table_name,
    COUNT(*) as count
FROM providers
WHERE auth_user_id = '349e3684-8ff7-42cf-8ebd-3a3d8941d74b'::uuid

UNION ALL

SELECT
    'Lead Distributions' as table_name,
    COUNT(*) as count
FROM lead_distributions ld
JOIN providers p ON p.id = ld.provider_id
WHERE p.auth_user_id = '349e3684-8ff7-42cf-8ebd-3a3d8941d74b'::uuid

UNION ALL

SELECT
    'Quotes' as table_name,
    COUNT(*) as count
FROM quotes q
JOIN lead_distributions ld ON ld.quote_id = q.id
JOIN providers p ON p.id = ld.provider_id
WHERE p.auth_user_id = '349e3684-8ff7-42cf-8ebd-3a3d8941d74b'::uuid;

-- Final message
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ RLS policies have been fixed for client access!';
    RAISE NOTICE 'Now go back to http://localhost:3000/provider/debug';
    RAISE NOTICE 'You should see green checkmarks for all steps';
END $$;