-- SIMPLE TEST LEAD CREATION FOR provider1@test.com
-- This will definitely create test leads

DO $$
DECLARE
    user_id UUID;
    prov_id UUID;
    company_id UUID;
    quote_id1 UUID;
    quote_id2 UUID;
    quote_id3 UUID;
BEGIN
    -- Get the user ID
    SELECT id INTO user_id FROM auth.users WHERE email = 'provider1@test.com';

    IF user_id IS NULL THEN
        RAISE EXCEPTION 'User provider1@test.com not found!';
    END IF;

    -- Get or create provider
    SELECT id INTO prov_id FROM providers WHERE auth_user_id = user_id;

    IF prov_id IS NULL THEN
        INSERT INTO providers (auth_user_id, business_name, status, service_areas)
        VALUES (user_id, 'Test Junk Removal', 'active', ARRAY['94105'])
        RETURNING id INTO prov_id;
        RAISE NOTICE 'Created provider: %', prov_id;
    ELSE
        RAISE NOTICE 'Using existing provider: %', prov_id;
    END IF;

    -- Get company ID
    SELECT id INTO company_id FROM companies WHERE slug = 'demo-junk-removal';
    IF company_id IS NULL THEN
        -- Create a default company if it doesn't exist
        INSERT INTO companies (name, slug)
        VALUES ('Demo Junk Removal', 'demo-junk-removal')
        RETURNING id INTO company_id;
    END IF;

    -- Generate new quote IDs
    quote_id1 := gen_random_uuid();
    quote_id2 := gen_random_uuid();
    quote_id3 := gen_random_uuid();

    -- Delete any old test quotes (cleanup)
    DELETE FROM quotes WHERE customer_email IN ('sarah@example.com', 'mike@example.com', 'emily@example.com');

    -- Create fresh quotes
    INSERT INTO quotes (
        id, company_id, status, customer_name, customer_email,
        customer_phone, pickup_address, pickup_city, pickup_state,
        pickup_zip, estimated_price, preferred_date, items, created_at
    ) VALUES
    (
        quote_id1,
        company_id,
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
        '[{"name": "Old Sofa", "quantity": 1}, {"name": "Broken TV", "quantity": 1}]'::jsonb,
        NOW()
    ),
    (
        quote_id2,
        company_id,
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
        '[{"name": "Mattress", "quantity": 2}]'::jsonb,
        NOW() - INTERVAL '2 hours'
    ),
    (
        quote_id3,
        company_id,
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
        '[{"name": "Construction Debris", "quantity": 1}]'::jsonb,
        NOW() - INTERVAL '5 hours'
    );

    RAISE NOTICE 'Created 3 quotes';

    -- Create lead distributions
    INSERT INTO lead_distributions (quote_id, provider_id, status, sent_at, created_at)
    VALUES
        (quote_id1, prov_id, 'sent', NOW(), NOW()),
        (quote_id2, prov_id, 'sent', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours'),
        (quote_id3, prov_id, 'sent', NOW() - INTERVAL '5 hours', NOW() - INTERVAL '5 hours');

    RAISE NOTICE 'Created 3 lead distributions';

    -- Verify the data was created
    PERFORM COUNT(*) FROM lead_distributions ld WHERE ld.provider_id = prov_id;

    RAISE NOTICE '';
    RAISE NOTICE '✅ SUCCESS! Created 3 test leads!';
    RAISE NOTICE '';
    RAISE NOTICE 'Lead 1: Sarah Johnson - $450';
    RAISE NOTICE 'Lead 2: Mike Wilson - $275';
    RAISE NOTICE 'Lead 3: Emily Chen - $625';
    RAISE NOTICE '';
    RAISE NOTICE 'NOW GO TO: http://localhost:3000/provider';
    RAISE NOTICE 'AND REFRESH THE PAGE (Ctrl+R or Cmd+R)';

END $$;

-- Let's also verify the data exists
SELECT
    ld.id as distribution_id,
    q.customer_name,
    q.estimated_price,
    ld.status,
    ld.created_at
FROM lead_distributions ld
JOIN quotes q ON q.id = ld.quote_id
JOIN providers p ON p.id = ld.provider_id
JOIN auth.users u ON u.id = p.auth_user_id
WHERE u.email = 'provider1@test.com'
ORDER BY ld.created_at DESC;