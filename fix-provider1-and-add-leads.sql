-- Fix: Create Provider Profile and Add Test Leads for provider1@test.com
-- This creates the provider record first, then adds leads

DO $$
DECLARE
    user_id UUID;
    provider_id UUID;
    quote_id1 UUID;
    quote_id2 UUID;
    quote_id3 UUID;
BEGIN
    -- Get the user ID for provider1@test.com
    SELECT id INTO user_id FROM auth.users WHERE email = 'provider1@test.com';

    IF user_id IS NULL THEN
        RAISE EXCEPTION 'User provider1@test.com not found. Make sure you created the account!';
    END IF;

    -- Create provider record if it doesn't exist
    SELECT id INTO provider_id FROM providers WHERE auth_user_id = user_id;

    IF provider_id IS NULL THEN
        INSERT INTO providers (
            auth_user_id,
            business_name,
            status,
            service_areas
        ) VALUES (
            user_id,
            'Your Junk Removal Business',
            'active',
            ARRAY['94105', '94107', '94108', '94109']
        )
        RETURNING id INTO provider_id;

        RAISE NOTICE 'Created provider profile for provider1@test.com';
    ELSE
        RAISE NOTICE 'Provider profile already exists';
    END IF;

    -- Now create test quotes
    quote_id1 := gen_random_uuid();
    quote_id2 := gen_random_uuid();
    quote_id3 := gen_random_uuid();

    INSERT INTO quotes (
        id, company_id, status, customer_name, customer_email,
        customer_phone, pickup_address, pickup_city, pickup_state,
        pickup_zip, estimated_price, preferred_date, items
    ) VALUES
    (
        quote_id1,
        (SELECT id FROM companies WHERE slug = 'demo-junk-removal'),
        'sent',
        'Sarah Johnson',
        'sarah@example.com',
        '555-0101',
        '123 Market Street',
        'San Francisco',
        'CA',
        '94105',
        450.00,
        CURRENT_DATE + INTERVAL '2 days',
        '[{"name": "Old Sofa", "quantity": 1}, {"name": "Broken TV", "quantity": 1}, {"name": "Boxes", "quantity": 5}]'::jsonb
    ),
    (
        quote_id2,
        (SELECT id FROM companies WHERE slug = 'demo-junk-removal'),
        'sent',
        'Mike Wilson',
        'mike@example.com',
        '555-0202',
        '456 Oak Avenue',
        'San Francisco',
        'CA',
        '94107',
        275.00,
        CURRENT_DATE + INTERVAL '3 days',
        '[{"name": "Mattress", "quantity": 2}, {"name": "Dresser", "quantity": 1}]'::jsonb
    ),
    (
        quote_id3,
        (SELECT id FROM companies WHERE slug = 'demo-junk-removal'),
        'sent',
        'Emily Chen',
        'emily@example.com',
        '555-0303',
        '789 Pine Street',
        'San Francisco',
        'CA',
        '94108',
        625.00,
        CURRENT_DATE + INTERVAL '1 day',
        '[{"name": "Construction Debris", "quantity": 1}, {"name": "Old Appliances", "quantity": 3}]'::jsonb
    );

    -- Distribute these quotes to your provider
    INSERT INTO lead_distributions (quote_id, provider_id, status, sent_at)
    VALUES
        (quote_id1, provider_id, 'sent', NOW()),
        (quote_id2, provider_id, 'sent', NOW() - INTERVAL '2 hours'),
        (quote_id3, provider_id, 'sent', NOW() - INTERVAL '5 hours');

    RAISE NOTICE '';
    RAISE NOTICE '✅ SUCCESS! Provider profile created and 3 test leads added!';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Your Test Leads:';
    RAISE NOTICE '  1. Sarah Johnson - $450 - Old Sofa, TV, Boxes';
    RAISE NOTICE '  2. Mike Wilson - $275 - Mattresses, Dresser';
    RAISE NOTICE '  3. Emily Chen - $625 - Construction Debris (URGENT)';
    RAISE NOTICE '';
    RAISE NOTICE '🔄 Now refresh your dashboard: http://localhost:3000/provider';
END $$;