-- Run this AFTER creating user in Supabase Dashboard
DO $$
DECLARE
    user_id UUID;
    provider_id UUID;
BEGIN
    -- Get the user you created
    SELECT id INTO user_id FROM auth.users WHERE email = 'provider@test.com';

    IF user_id IS NOT NULL THEN
        -- Create provider profile
        INSERT INTO providers (auth_user_id, business_name, status, service_areas)
        VALUES (
            user_id,
            'Test Junk Removal Co',
            'active',
            ARRAY['94105', '94107', '94108']
        )
        RETURNING id INTO provider_id;

        -- Create test quotes
        INSERT INTO quotes (company_id, status, customer_name, customer_email, customer_phone, pickup_address, pickup_city, pickup_state, pickup_zip, estimated_price, preferred_date)
        VALUES
        (
            (SELECT id FROM companies WHERE slug = 'demo-junk-removal'),
            'sent',
            'Jane Doe',
            'jane@example.com',
            '555-0123',
            '456 Oak St',
            'San Francisco',
            'CA',
            '94105',
            350.00,
            CURRENT_DATE + 2
        ),
        (
            (SELECT id FROM companies WHERE slug = 'demo-junk-removal'),
            'sent',
            'Bob Smith',
            'bob@example.com',
            '555-0456',
            '789 Pine Ave',
            'San Francisco',
            'CA',
            '94107',
            225.00,
            CURRENT_DATE + 4
        );

        -- Distribute to provider
        INSERT INTO lead_distributions (quote_id, provider_id, status)
        SELECT id, provider_id, 'sent'
        FROM quotes
        WHERE customer_name IN ('Jane Doe', 'Bob Smith');

        RAISE NOTICE '✅ Provider profile created with test leads!';
    ELSE
        RAISE NOTICE '❌ User not found. Create user first in Supabase Dashboard.';
    END IF;
END $$;