-- Create Test Provider Account
-- Run this in Supabase SQL Editor after the clean setup

-- ============================================
-- OPTION 1: Create Test Provider (Instant Login)
-- ============================================

-- Create auth user with a known password
-- Email: provider@test.com
-- Password: Test123!

-- First, check if user exists and create if not
DO $$
DECLARE
    existing_user_id UUID;
    new_user_id UUID;
BEGIN
    -- Check if user already exists
    SELECT id INTO existing_user_id FROM auth.users WHERE email = 'provider@test.com';

    IF existing_user_id IS NULL THEN
        -- Create the auth user
        new_user_id := gen_random_uuid();
        INSERT INTO auth.users (
            id,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_user_meta_data,
            created_at,
            updated_at,
            confirmation_token,
            aud,
            role
        ) VALUES (
            new_user_id,
            'provider@test.com',
            crypt('Test123!', gen_salt('bf')),
            NOW(),
            '{"role": "provider", "business_name": "Test Junk Removal Co"}'::jsonb,
            NOW(),
            NOW(),
            encode(gen_random_bytes(32), 'hex'),
            'authenticated',
            'authenticated'
        );
        RAISE NOTICE 'Created new test user: provider@test.com';
    ELSE
        RAISE NOTICE 'Test user already exists: provider@test.com';
    END IF;
END $$;

-- The trigger should automatically create the provider record
-- But let's make sure it exists
DO $$
DECLARE
    user_id UUID;
BEGIN
    -- Get the user ID we just created
    SELECT id INTO user_id FROM auth.users WHERE email = 'provider@test.com';

    -- Create provider if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM providers WHERE auth_user_id = user_id) THEN
        INSERT INTO providers (auth_user_id, business_name, status, service_areas)
        VALUES (
            user_id,
            'Test Junk Removal Co',
            'active',
            ARRAY['94105', '94107', '94108']
        );
    END IF;

    -- Get the provider ID
    DECLARE
        provider_id UUID;
    BEGIN
        SELECT id INTO provider_id FROM providers WHERE auth_user_id = user_id;

        -- Create some test leads for this provider
        -- First create a test quote
        INSERT INTO quotes (
            id,
            company_id,
            status,
            customer_name,
            customer_email,
            customer_phone,
            pickup_address,
            pickup_city,
            pickup_state,
            pickup_zip,
            estimated_price,
            preferred_date,
            items
        ) VALUES (
            gen_random_uuid(),
            (SELECT id FROM companies WHERE slug = 'demo-junk-removal'),
            'sent',
            'Jane Doe',
            'jane@example.com',
            '555-0123',
            '456 Oak Street',
            'San Francisco',
            'CA',
            '94105',
            350.00,
            CURRENT_DATE + INTERVAL '2 days',
            '[{"name": "Old Couch", "quantity": 1}, {"name": "Mattress", "quantity": 2}]'::jsonb
        ), (
            gen_random_uuid(),
            (SELECT id FROM companies WHERE slug = 'demo-junk-removal'),
            'sent',
            'Bob Johnson',
            'bob@example.com',
            '555-0456',
            '789 Pine Ave',
            'San Francisco',
            'CA',
            '94107',
            225.00,
            CURRENT_DATE + INTERVAL '4 days',
            '[{"name": "Refrigerator", "quantity": 1}, {"name": "Boxes", "quantity": 10}]'::jsonb
        );

        -- Distribute these quotes to our test provider
        INSERT INTO lead_distributions (quote_id, provider_id, status)
        SELECT q.id, provider_id, 'sent'
        FROM quotes q
        WHERE q.customer_name IN ('Jane Doe', 'Bob Johnson');
    END;
END $$;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '✅ Test provider created!';
    RAISE NOTICE '';
    RAISE NOTICE '📧 Email: provider@test.com';
    RAISE NOTICE '🔑 Password: Test123!';
    RAISE NOTICE '';
    RAISE NOTICE 'You can now login at /provider/login-supabase';
    RAISE NOTICE 'The dashboard will have 2 test leads ready for you!';
END $$;

-- ============================================
-- OPTION 2: If you prefer to sign up normally
-- ============================================
-- 1. Go to /provider/login-supabase
-- 2. Click "Create an account"
-- 3. Enter your email and password
-- 4. Check your email for confirmation link
-- 5. Click the link to activate your account
-- 6. Sign in with your credentials