-- Check which tables already exist in your Supabase database
-- Run this first to see what's already there

-- List all existing tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check if specific tables exist with row counts
WITH table_list AS (
    SELECT unnest(ARRAY[
        'Company', 'User', 'Provider', 'Quote', 'QuoteItem',
        'Booking', 'Bid', 'Job', 'LeadDistribution', 'ServiceArea',
        'PricingRule', 'AnalyticsEvent'
    ]) AS table_name
)
SELECT
    tl.table_name,
    CASE
        WHEN t.table_name IS NOT NULL THEN '✅ Exists'
        ELSE '❌ Missing'
    END AS status,
    COALESCE(
        (SELECT COUNT(*)
         FROM information_schema.tables ist
         WHERE ist.table_name = tl.table_name
         AND ist.table_schema = 'public'), 0
    ) AS exists_check
FROM table_list tl
LEFT JOIN information_schema.tables t
    ON tl.table_name = t.table_name
    AND t.table_schema = 'public'
ORDER BY tl.table_name;

-- Check columns in Company table (if it exists)
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'Company'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check which custom types exist
SELECT typname AS type_name
FROM pg_type
WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
AND typtype = 'e'
ORDER BY typname;