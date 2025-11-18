-- Add Test Leads to provider1@test.com
-- Run this AFTER fixing RLS policies

DO $$
DECLARE
    user_id UUID;
    prov_id UUID;
    quote_id1 UUID;
    quote_id2 UUID;
    quote_id3 UUID;
BEGIN
    -- Get the provider ID for provider1@test.com
    SELECT id INTO user_id FROM auth.users WHERE email = 'provider1@test.com';
    SELECT id INTO prov_id FROM providers WHERE auth_user_id = user_id;

    IF prov_id IS NULL THEN
        RAISE EXCEPTION 'No provider found for provider1@test.com. Run the RLS fix SQL first!';
    END IF;

    RAISE NOTICE 'Found provider: %', prov_id;

    -- Create test quotes
    quote_id1 := gen_random_uuid();
    quote_id2 := gen_random_uuid();
    quote_id3 := gen_random_uuid();

    -- Insert quotes
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
        '[{"name": "Old Sofa", "quantity": 1}, {"name": "Broken TV", "quantity": 1}]'::jsonb
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
        '[{"name": "Mattress", "quantity": 2}]'::jsonb
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
        '[{"name": "Construction Debris", "quantity": 1}]'::jsonb
    );

    -- Distribute these quotes to the provider
    INSERT INTO lead_distributions (quote_id, provider_id, status, sent_at)
    VALUES
        (quote_id1, prov_id, 'sent', NOW()),
        (quote_id2, prov_id, 'sent', NOW() - INTERVAL '2 hours'),
        (quote_id3, prov_id, 'sent', NOW() - INTERVAL '5 hours');

    RAISE NOTICE '';
    RAISE NOTICE '✅ SUCCESS! Added 3 test leads!';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Your Test Leads:';
    RAISE NOTICE '  1. Sarah Johnson - $450';
    RAISE NOTICE '  2. Mike Wilson - $275';
    RAISE NOTICE '  3. Emily Chen - $625 (URGENT)';
    RAISE NOTICE '';
    RAISE NOTICE '🔄 NOW REFRESH YOUR DASHBOARD!';
END $$;