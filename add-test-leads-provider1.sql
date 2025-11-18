-- Add Test Leads for provider1@test.com
-- Run this to add test leads to your dashboard

DO $$
DECLARE
    user_id UUID;
    provider_id UUID;
    quote_id1 UUID;
    quote_id2 UUID;
    quote_id3 UUID;
BEGIN
    -- Get your provider ID (using YOUR email)
    SELECT id INTO user_id FROM auth.users WHERE email = 'provider1@test.com';

    IF user_id IS NULL THEN
        RAISE EXCEPTION 'User not found. Make sure you are logged in with provider1@test.com';
    END IF;

    SELECT id INTO provider_id FROM providers WHERE auth_user_id = user_id;

    IF provider_id IS NULL THEN
        RAISE EXCEPTION 'Provider not found. Make sure you logged in at least once!';
    END IF;

    -- Create test quotes
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

    RAISE NOTICE '✅ Success! Added 3 test leads for provider1@test.com';
    RAISE NOTICE '';
    RAISE NOTICE 'Lead 1: Sarah Johnson - $450 - 2 days from now';
    RAISE NOTICE 'Lead 2: Mike Wilson - $275 - 3 days from now';
    RAISE NOTICE 'Lead 3: Emily Chen - $625 - Tomorrow (URGENT)';
    RAISE NOTICE '';
    RAISE NOTICE 'Refresh your dashboard at http://localhost:3000/provider to see them!';
END $$;