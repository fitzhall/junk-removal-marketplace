-- Fix RLS Policies and Verify Data for provider1@test.com
-- Run this in Supabase SQL Editor

-- First, let's check what data exists for provider1@test.com
DO $$
DECLARE
    user_id UUID;
    prov_id UUID;
    lead_count INT;
BEGIN
    -- Get the user ID
    SELECT id INTO user_id FROM auth.users WHERE email = 'provider1@test.com';

    IF user_id IS NULL THEN
        RAISE NOTICE '❌ No user found with email provider1@test.com';
    ELSE
        RAISE NOTICE '✅ Found user: %', user_id;

        -- Check for provider record
        SELECT id INTO prov_id FROM providers WHERE auth_user_id = user_id;

        IF prov_id IS NULL THEN
            RAISE NOTICE '❌ No provider record found for this user';
            RAISE NOTICE '   Creating provider record now...';

            -- Create the provider record
            INSERT INTO providers (auth_user_id, business_name, status, service_areas)
            VALUES (user_id, 'Your Junk Removal Business', 'active', ARRAY['94105', '94107', '94108'])
            RETURNING id INTO prov_id;

            RAISE NOTICE '   ✅ Provider record created: %', prov_id;
        ELSE
            RAISE NOTICE '✅ Found provider: %', prov_id;
        END IF;

        -- Check for leads
        SELECT COUNT(*) INTO lead_count
        FROM lead_distributions
        WHERE provider_id = prov_id;

        RAISE NOTICE '📊 Number of leads for this provider: %', lead_count;
    END IF;
END $$;

-- Now fix the RLS policies
-- Drop existing policies that might be broken
DROP POLICY IF EXISTS "Users can view own provider profile" ON providers;
DROP POLICY IF EXISTS "Providers can view distributed quotes" ON quotes;
DROP POLICY IF EXISTS "Providers can view own leads" ON lead_distributions;
DROP POLICY IF EXISTS "Providers can update own leads" ON lead_distributions;

-- Create new, working policies
CREATE POLICY "Users can view own provider profile" ON providers
    FOR SELECT
    USING (auth_user_id = auth.uid() OR auth.role() = 'service_role');

CREATE POLICY "Users can insert own provider profile" ON providers
    FOR INSERT
    WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "Providers can view their quotes" ON quotes
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM lead_distributions ld
            JOIN providers p ON p.id = ld.provider_id
            WHERE ld.quote_id = quotes.id
            AND p.auth_user_id = auth.uid()
        ) OR auth.role() = 'service_role'
    );

CREATE POLICY "Providers can view own leads" ON lead_distributions
    FOR SELECT
    USING (
        provider_id IN (
            SELECT id FROM providers WHERE auth_user_id = auth.uid()
        ) OR auth.role() = 'service_role'
    );

CREATE POLICY "Providers can update own leads" ON lead_distributions
    FOR UPDATE
    USING (
        provider_id IN (
            SELECT id FROM providers WHERE auth_user_id = auth.uid()
        )
    );

-- Also ensure jobs table has proper policies
DROP POLICY IF EXISTS "Providers can view own jobs" ON jobs;
CREATE POLICY "Providers can view own jobs" ON jobs
    FOR SELECT
    USING (
        provider_id IN (
            SELECT id FROM providers WHERE auth_user_id = auth.uid()
        ) OR auth.role() = 'service_role'
    );

-- Final status message
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ RLS policies fixed!';
    RAISE NOTICE '';
    RAISE NOTICE 'Now refresh your dashboard - it should work!';
END $$;