-- SUPABASE CLEAN SETUP - Fresh Start
-- This creates a clean, Supabase-native schema without conflicts

-- ============================================
-- STEP 1: CLEAN SLATE (Run this first)
-- ============================================

-- Drop all existing tables and types
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- ============================================
-- STEP 2: CREATE ENUMS
-- ============================================

CREATE TYPE user_role AS ENUM ('customer', 'provider', 'admin');
CREATE TYPE provider_status AS ENUM ('pending', 'active', 'suspended');
CREATE TYPE lead_status AS ENUM ('sent', 'viewed', 'accepted', 'declined', 'expired');
CREATE TYPE quote_status AS ENUM ('draft', 'pending', 'sent', 'accepted', 'completed');
CREATE TYPE job_status AS ENUM ('pending', 'scheduled', 'in_progress', 'completed', 'cancelled');

-- ============================================
-- STEP 3: CORE TABLES (Supabase conventions)
-- ============================================

-- Companies (for white-label)
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    logo_url TEXT,
    primary_color TEXT DEFAULT '#3B82F6',
    secondary_color TEXT DEFAULT '#1E40AF',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Providers (linked to Supabase Auth)
CREATE TABLE providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    business_name TEXT NOT NULL,
    business_phone TEXT,
    business_address TEXT,
    service_areas TEXT[], -- Array of zip codes
    status provider_status DEFAULT 'pending',
    rating DECIMAL(3,2) DEFAULT 0,
    total_jobs INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quotes (customer requests)
CREATE TABLE quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    status quote_status DEFAULT 'draft',

    -- Customer info
    customer_name TEXT,
    customer_email TEXT,
    customer_phone TEXT,

    -- Location
    pickup_address TEXT,
    pickup_city TEXT,
    pickup_state TEXT,
    pickup_zip TEXT,

    -- Details
    photos JSONB DEFAULT '[]',
    items JSONB DEFAULT '[]',
    ai_analysis JSONB,

    -- Pricing
    estimated_price DECIMAL(10,2),
    price_range_min DECIMAL(10,2),
    price_range_max DECIMAL(10,2),

    -- Scheduling
    preferred_date DATE,
    preferred_time TEXT,
    is_urgent BOOLEAN DEFAULT false,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days')
);

-- Lead Distribution
CREATE TABLE lead_distributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
    status lead_status DEFAULT 'sent',

    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    viewed_at TIMESTAMP WITH TIME ZONE,
    responded_at TIMESTAMP WITH TIME ZONE,

    bid_amount DECIMAL(10,2),
    response_message TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(quote_id, provider_id)
);

-- Jobs (accepted quotes)
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
    status job_status DEFAULT 'pending',

    scheduled_date DATE,
    scheduled_time TEXT,

    final_price DECIMAL(10,2),
    completion_photos JSONB,

    customer_rating INTEGER CHECK (customer_rating >= 1 AND customer_rating <= 5),
    customer_review TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- STEP 4: INDEXES
-- ============================================

CREATE INDEX idx_companies_slug ON companies(slug);
CREATE INDEX idx_companies_active ON companies(is_active);

CREATE INDEX idx_providers_auth_user ON providers(auth_user_id);
CREATE INDEX idx_providers_company ON providers(company_id);
CREATE INDEX idx_providers_status ON providers(status);

CREATE INDEX idx_quotes_company ON quotes(company_id);
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_quotes_zip ON quotes(pickup_zip);
CREATE INDEX idx_quotes_created ON quotes(created_at);

CREATE INDEX idx_lead_dist_quote ON lead_distributions(quote_id);
CREATE INDEX idx_lead_dist_provider ON lead_distributions(provider_id);
CREATE INDEX idx_lead_dist_status ON lead_distributions(status);

CREATE INDEX idx_jobs_provider ON jobs(provider_id);
CREATE INDEX idx_jobs_status ON jobs(status);

-- ============================================
-- STEP 5: ROW LEVEL SECURITY
-- ============================================

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Companies: Public read for active companies
CREATE POLICY "Public can view active companies" ON companies
    FOR SELECT USING (is_active = true);

CREATE POLICY "Service role full access companies" ON companies
    FOR ALL TO service_role USING (true);

-- Providers: Users can manage their own provider profile
CREATE POLICY "Users can view own provider profile" ON providers
    FOR SELECT USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can update own provider profile" ON providers
    FOR UPDATE USING (auth.uid() = auth_user_id);

CREATE POLICY "Service role full access providers" ON providers
    FOR ALL TO service_role USING (true);

-- Quotes: Providers can see quotes distributed to them
CREATE POLICY "Providers can view distributed quotes" ON quotes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM lead_distributions ld
            JOIN providers p ON p.id = ld.provider_id
            WHERE ld.quote_id = quotes.id
            AND p.auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Service role full access quotes" ON quotes
    FOR ALL TO service_role USING (true);

-- Lead Distributions: Providers can manage their own leads
CREATE POLICY "Providers can view own leads" ON lead_distributions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM providers p
            WHERE p.id = lead_distributions.provider_id
            AND p.auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Providers can update own leads" ON lead_distributions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM providers p
            WHERE p.id = lead_distributions.provider_id
            AND p.auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Service role full access leads" ON lead_distributions
    FOR ALL TO service_role USING (true);

-- Jobs: Providers can manage their own jobs
CREATE POLICY "Providers can view own jobs" ON jobs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM providers p
            WHERE p.id = jobs.provider_id
            AND p.auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Providers can update own jobs" ON jobs
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM providers p
            WHERE p.id = jobs.provider_id
            AND p.auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Service role full access jobs" ON jobs
    FOR ALL TO service_role USING (true);

-- ============================================
-- STEP 6: FUNCTIONS
-- ============================================

-- Function to automatically create provider profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    IF (NEW.raw_user_meta_data->>'role')::text = 'provider' THEN
        INSERT INTO providers (auth_user_id, business_name)
        VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'business_name', 'My Business'));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update triggers to all tables
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_providers_updated_at BEFORE UPDATE ON providers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- STEP 7: SAMPLE DATA
-- ============================================

-- Insert sample company
INSERT INTO companies (slug, name, email, phone) VALUES
('demo-junk-removal', 'Demo Junk Removal', 'demo@junkremoval.com', '555-0100');

-- Insert sample quotes
INSERT INTO quotes (company_id, status, customer_name, customer_email, customer_phone, pickup_address, pickup_city, pickup_state, pickup_zip, estimated_price, preferred_date)
SELECT
    (SELECT id FROM companies WHERE slug = 'demo-junk-removal'),
    'sent',
    'John Smith',
    'john@example.com',
    '555-0199',
    '123 Main St',
    'San Francisco',
    'CA',
    '94105',
    299.99,
    CURRENT_DATE + INTERVAL '3 days';

-- ============================================
-- SUCCESS!
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '✅ Clean Supabase setup complete!';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Test provider signup at /provider/login-supabase';
    RAISE NOTICE '2. Check the dashboard at /provider';
    RAISE NOTICE '3. Tables are clean and ready to use';
END $$;