-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create custom types
CREATE TYPE user_role AS ENUM ('CUSTOMER', 'PROVIDER', 'ADMIN');
CREATE TYPE quote_status AS ENUM ('DRAFT', 'PENDING', 'SENT', 'ACCEPTED', 'EXPIRED');
CREATE TYPE job_status AS ENUM ('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE lead_status AS ENUM ('SENT', 'VIEWED', 'ACCEPTED', 'DECLINED', 'EXPIRED');
CREATE TYPE volume_size AS ENUM ('QUARTER', 'HALF', 'THREE_QUARTER', 'FULL', 'MULTIPLE');
CREATE TYPE provider_status AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED');

-- Create users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    name VARCHAR(255),
    role user_role DEFAULT 'CUSTOMER',
    email_verified TIMESTAMP,
    phone_verified TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create providers table
CREATE TABLE public.providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    business_name VARCHAR(255) NOT NULL,
    business_address TEXT,
    business_phone VARCHAR(20),
    license_number VARCHAR(100),
    insurance_info JSONB,
    rating DECIMAL(3,2) DEFAULT 0,
    total_jobs INTEGER DEFAULT 0,
    status provider_status DEFAULT 'PENDING',
    payment_terms JSONB,
    capabilities JSONB,
    operating_hours JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create service areas table
CREATE TABLE public.service_areas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID REFERENCES public.providers(id) ON DELETE CASCADE,
    zip_code VARCHAR(10),
    city VARCHAR(100),
    state VARCHAR(2),
    country VARCHAR(2) DEFAULT 'US',
    max_radius_miles INTEGER DEFAULT 25,
    is_primary BOOLEAN DEFAULT false,
    location GEOGRAPHY(POINT),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create quotes table
CREATE TABLE public.quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id),
    status quote_status DEFAULT 'DRAFT',
    customer_name VARCHAR(255),
    customer_email VARCHAR(255),
    customer_phone VARCHAR(20),
    pickup_address TEXT,
    pickup_zip VARCHAR(10),
    pickup_city VARCHAR(100),
    pickup_state VARCHAR(2),
    pickup_location GEOGRAPHY(POINT),
    photo_urls JSONB,
    ai_analysis JSONB,
    estimated_volume volume_size,
    base_price DECIMAL(10,2),
    additional_fees JSONB,
    total_price DECIMAL(10,2),
    price_range_min DECIMAL(10,2),
    price_range_max DECIMAL(10,2),
    preferred_date DATE,
    preferred_time_window VARCHAR(50),
    is_urgent BOOLEAN DEFAULT false,
    source VARCHAR(50),
    utm_params JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '7 days'),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create quote items table
CREATE TABLE public.quote_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quote_id UUID REFERENCES public.quotes(id) ON DELETE CASCADE,
    item_type VARCHAR(100),
    item_description TEXT,
    quantity INTEGER DEFAULT 1,
    ai_confidence DECIMAL(3,2),
    requires_special_handling BOOLEAN DEFAULT false,
    estimated_weight_lbs INTEGER,
    dimensions JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create jobs table
CREATE TABLE public.jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quote_id UUID UNIQUE REFERENCES public.quotes(id),
    provider_id UUID REFERENCES public.providers(id),
    status job_status DEFAULT 'PENDING',
    scheduled_date DATE,
    scheduled_time VARCHAR(50),
    actual_start_time TIMESTAMP,
    actual_end_time TIMESTAMP,
    final_price DECIMAL(10,2),
    provider_payout DECIMAL(10,2),
    platform_fee DECIMAL(10,2),
    completion_photos JSONB,
    customer_signature VARCHAR(255),
    notes TEXT,
    customer_rating INTEGER,
    customer_review TEXT,
    provider_rating INTEGER,
    provider_feedback TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create lead distribution table
CREATE TABLE public.lead_distribution (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quote_id UUID REFERENCES public.quotes(id),
    provider_id UUID REFERENCES public.providers(id),
    status lead_status DEFAULT 'SENT',
    sent_at TIMESTAMP DEFAULT NOW(),
    viewed_at TIMESTAMP,
    responded_at TIMESTAMP,
    response_reason TEXT,
    bid_amount DECIMAL(10,2),
    is_winner BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create pricing rules table
CREATE TABLE public.pricing_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255),
    description TEXT,
    zip_code VARCHAR(10),
    city VARCHAR(100),
    state VARCHAR(2),
    is_default BOOLEAN DEFAULT false,
    quarter_truck_price DECIMAL(10,2),
    half_truck_price DECIMAL(10,2),
    three_quarter_truck_price DECIMAL(10,2),
    full_truck_price DECIMAL(10,2),
    heavy_item_fee DECIMAL(10,2),
    stairs_fee DECIMAL(10,2),
    long_carry_fee DECIMAL(10,2),
    same_day_fee DECIMAL(10,2),
    weekend_fee DECIMAL(10,2),
    peak_time_multiplier DECIMAL(3,2) DEFAULT 1.0,
    holiday_multiplier DECIMAL(3,2) DEFAULT 1.5,
    priority INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create analytics events table
CREATE TABLE public.analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(100),
    user_id UUID REFERENCES public.users(id),
    session_id VARCHAR(255),
    event_data JSONB,
    page_url TEXT,
    referrer TEXT,
    ip_address INET,
    user_agent TEXT,
    device_type VARCHAR(50),
    browser VARCHAR(50),
    os VARCHAR(50),
    country VARCHAR(2),
    region VARCHAR(100),
    city VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_phone ON public.users(phone);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_providers_status ON public.providers(status);
CREATE INDEX idx_providers_rating ON public.providers(rating);
CREATE INDEX idx_service_areas_zip ON public.service_areas(zip_code);
CREATE INDEX idx_service_areas_location ON public.service_areas(city, state);
CREATE INDEX idx_service_areas_geo ON public.service_areas USING GIST(location);
CREATE INDEX idx_quotes_status ON public.quotes(status);
CREATE INDEX idx_quotes_user ON public.quotes(user_id);
CREATE INDEX idx_quotes_zip ON public.quotes(pickup_zip);
CREATE INDEX idx_quotes_created ON public.quotes(created_at DESC);
CREATE INDEX idx_quotes_geo ON public.quotes USING GIST(pickup_location);
CREATE INDEX idx_quote_items_quote ON public.quote_items(quote_id);
CREATE INDEX idx_jobs_status ON public.jobs(status);
CREATE INDEX idx_jobs_provider ON public.jobs(provider_id);
CREATE INDEX idx_jobs_scheduled ON public.jobs(scheduled_date);
CREATE INDEX idx_lead_dist_quote ON public.lead_distribution(quote_id);
CREATE INDEX idx_lead_dist_provider ON public.lead_distribution(provider_id);
CREATE INDEX idx_lead_dist_status ON public.lead_distribution(status);
CREATE INDEX idx_pricing_location ON public.pricing_rules(state, city, zip_code);
CREATE INDEX idx_pricing_active ON public.pricing_rules(is_active, priority DESC);
CREATE INDEX idx_analytics_type ON public.analytics_events(event_type);
CREATE INDEX idx_analytics_user ON public.analytics_events(user_id);
CREATE INDEX idx_analytics_session ON public.analytics_events(session_id);
CREATE INDEX idx_analytics_created ON public.analytics_events(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_distribution ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Create RLS policies for quotes
CREATE POLICY "Users can create quotes" ON public.quotes
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own quotes" ON public.quotes
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Providers can view assigned quotes" ON public.quotes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.lead_distribution ld
            JOIN public.providers p ON ld.provider_id = p.id
            WHERE ld.quote_id = quotes.id
            AND p.user_id = auth.uid()
        )
    );

-- Create RLS policies for providers
CREATE POLICY "Anyone can view active providers" ON public.providers
    FOR SELECT USING (status = 'ACTIVE');

CREATE POLICY "Providers can update own profile" ON public.providers
    FOR UPDATE USING (user_id = auth.uid());

-- Create RLS policies for jobs
CREATE POLICY "Users can view own jobs" ON public.jobs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.quotes q
            WHERE q.id = jobs.quote_id
            AND q.user_id = auth.uid()
        )
    );

CREATE POLICY "Providers can view assigned jobs" ON public.jobs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.providers p
            WHERE p.id = jobs.provider_id
            AND p.user_id = auth.uid()
        )
    );

-- Create storage bucket for photos
INSERT INTO storage.buckets (id, name, public) VALUES ('junk-photos', 'junk-photos', true);

-- Create storage policies
CREATE POLICY "Anyone can upload photos" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'junk-photos');

CREATE POLICY "Anyone can view photos" ON storage.objects
    FOR SELECT USING (bucket_id = 'junk-photos');

-- Create trigger for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_providers_updated_at BEFORE UPDATE ON public.providers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON public.quotes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON public.jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pricing_rules_updated_at BEFORE UPDATE ON public.pricing_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();