-- Enable Row Level Security and Set Permissions
-- Run this in Supabase SQL Editor to fix permission issues

-- Disable RLS temporarily for setup (we'll re-enable with policies)
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Provider" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Company" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Quote" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "QuoteItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Booking" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Bid" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Job" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "LeadDistribution" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ServiceArea" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PricingRule" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AnalyticsEvent" ENABLE ROW LEVEL SECURITY;

-- Create policies for service role (full access)
-- This allows your backend with service role key to access everything

-- User table policies
CREATE POLICY "Service role can do everything with User"
ON "User"
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Users can read own record"
ON "User"
FOR SELECT
TO authenticated
USING (auth.uid()::text = id);

-- Provider table policies
CREATE POLICY "Service role can do everything with Provider"
ON "Provider"
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Providers can read own record"
ON "Provider"
FOR SELECT
TO authenticated
USING (userId = auth.uid()::text);

CREATE POLICY "Providers can update own record"
ON "Provider"
FOR UPDATE
TO authenticated
USING (userId = auth.uid()::text)
WITH CHECK (userId = auth.uid()::text);

-- Company table policies
CREATE POLICY "Service role can do everything with Company"
ON "Company"
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Anyone can read companies"
ON "Company"
FOR SELECT
TO anon, authenticated
USING (isActive = true);

-- Quote table policies
CREATE POLICY "Service role can do everything with Quote"
ON "Quote"
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Providers can read quotes distributed to them"
ON "Quote"
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM "LeadDistribution" ld
        JOIN "Provider" p ON p.id = ld."providerId"
        WHERE ld."quoteId" = "Quote".id
        AND p."userId" = auth.uid()::text
    )
);

-- QuoteItem table policies
CREATE POLICY "Service role can do everything with QuoteItem"
ON "QuoteItem"
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Providers can read quote items for their quotes"
ON "QuoteItem"
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM "Quote" q
        JOIN "LeadDistribution" ld ON ld."quoteId" = q.id
        JOIN "Provider" p ON p.id = ld."providerId"
        WHERE q.id = "QuoteItem"."quoteId"
        AND p."userId" = auth.uid()::text
    )
);

-- LeadDistribution table policies
CREATE POLICY "Service role can do everything with LeadDistribution"
ON "LeadDistribution"
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Providers can read own leads"
ON "LeadDistribution"
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM "Provider" p
        WHERE p.id = "LeadDistribution"."providerId"
        AND p."userId" = auth.uid()::text
    )
);

CREATE POLICY "Providers can update own leads"
ON "LeadDistribution"
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM "Provider" p
        WHERE p.id = "LeadDistribution"."providerId"
        AND p."userId" = auth.uid()::text
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM "Provider" p
        WHERE p.id = "LeadDistribution"."providerId"
        AND p."userId" = auth.uid()::text
    )
);

-- Bid table policies
CREATE POLICY "Service role can do everything with Bid"
ON "Bid"
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Providers can manage own bids"
ON "Bid"
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM "Provider" p
        WHERE p.id = "Bid"."providerId"
        AND p."userId" = auth.uid()::text
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM "Provider" p
        WHERE p.id = "Bid"."providerId"
        AND p."userId" = auth.uid()::text
    )
);

-- Job table policies
CREATE POLICY "Service role can do everything with Job"
ON "Job"
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Providers can read own jobs"
ON "Job"
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM "Provider" p
        WHERE p.id = "Job"."providerId"
        AND p."userId" = auth.uid()::text
    )
);

-- ServiceArea table policies
CREATE POLICY "Service role can do everything with ServiceArea"
ON "ServiceArea"
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Providers can manage own service areas"
ON "ServiceArea"
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM "Provider" p
        WHERE p.id = "ServiceArea"."providerId"
        AND p."userId" = auth.uid()::text
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM "Provider" p
        WHERE p.id = "ServiceArea"."providerId"
        AND p."userId" = auth.uid()::text
    )
);

-- Booking table policies
CREATE POLICY "Service role can do everything with Booking"
ON "Booking"
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- PricingRule table policies
CREATE POLICY "Service role can do everything with PricingRule"
ON "PricingRule"
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Anyone can read active pricing rules"
ON "PricingRule"
FOR SELECT
TO anon, authenticated
USING (isActive = true);

-- AnalyticsEvent table policies
CREATE POLICY "Service role can do everything with AnalyticsEvent"
ON "AnalyticsEvent"
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Row Level Security enabled and policies created!';
    RAISE NOTICE 'Your tables are now properly secured.';
END $$;