# Junk Removal White-Label Platform - Implementation Plan

## Current State (November 2024)

### ✅ Completed Features

#### White-Label Infrastructure
- **Middleware Detection**: Successfully detects white-label domains (subdomains and custom domains)
- **Company ID Headers**: Middleware sets `x-company-id` header for downstream processing
- **Lead Auto-Assignment**: Quotes created via white-label domains auto-route to the correct provider
- **Provider Tracking**: Facebook Pixel and Google Analytics support for conversion tracking

#### Database Migration
- Migrated from Prisma/Neon to Supabase
- Authentication using Supabase Auth
- RLS policies for multi-tenant data isolation

### ⚠️ Critical Issues

#### Pricing System BROKEN
- **Current State**: All quotes return $150-350 regardless of input
- **Root Cause**: Vision API not configured/working, system falls back to hardcoded values
- **Impact**: "Just a polite brick" - accepts input but returns same output every time
- **User Feedback**: "Photos = Proof, Not Pricing" - photo count shouldn't drive pricing

#### Provider Settings
- Settings page uses mock data, not connected to real database
- No way to update pixel IDs or campaign URLs in production

## Phase 1: Smart Rules-Based Pricing Engine (IMMEDIATE)

### Objectives
- Replace broken $150-350 fallback with intelligent pricing
- Use intentional inputs instead of photo analysis
- Provide instant, accurate quotes that vary based on job characteristics

### Implementation Steps

#### 1.1 Update Quote Form UI
- Add new input fields:
  - **Job Size**: Small (few items), Medium (room), Large (multiple rooms), Huge (whole house)
  - **Item Types**: Multi-select for furniture, appliances, construction debris, yard waste, etc.
  - **Access Difficulty**: Easy (curbside), Standard (garage/driveway), Difficult (stairs/tight spaces)
  - **Urgency**: Same day (+30%), Next day (+15%), Within week (standard)
  - **Special Handling**: Hazardous materials, heavy items (piano/safe), demolition required

#### 1.2 Create Pricing Engine
- Base prices by job size:
  - Small: $75-150
  - Medium: $150-350
  - Large: $350-700
  - Huge: $700-1500

- Modifiers:
  - Heavy items: +$50-100 per item
  - Appliances: +$35-50 each
  - Construction debris: +20% (heavier)
  - Stairs/difficult access: +$50-150
  - Urgency multipliers as above

#### 1.3 Keep Photos for Validation
- Photos remain for provider review
- Used as proof/evidence, not pricing input
- Helps prevent disputes and sets expectations

## Phase 2: Provider Dashboard Enhancement

### Objectives
- Connect settings to real database
- Enable providers to manage their white-label presence
- Add lead management capabilities

### Implementation Steps

#### 2.1 Settings Integration
- Connect pixel IDs to database (fb_pixel_id, google_analytics_id, google_ads_id)
- Save campaign URLs to provider record
- Add domain verification status

#### 2.2 Lead Management
- Show incoming leads in real-time
- Add lead status tracking (new, contacted, scheduled, completed)
- Quote adjustment capability
- Customer communication tools

#### 2.3 Analytics Dashboard
- Conversion rates by source
- Average quote values
- Job completion rates
- Revenue tracking

## Phase 3: AI Enhancement Layer (Future)

### Objectives
- Use AI to validate and enhance rules-based quotes
- Detect edge cases and special circumstances
- Improve accuracy over time

### Implementation Steps

#### 3.1 Vision API Integration
- Properly configure Google Vision API
- Use for item detection and validation
- Flag discrepancies between form inputs and photos

#### 3.2 Machine Learning
- Track actual job costs vs quotes
- Train model on historical data
- Adjust pricing rules based on patterns

#### 3.3 Smart Suggestions
- Suggest additional services based on photos
- Identify recyclable/donatable items
- Recommend disposal methods

## Phase 4: Platform Scaling

### Features
- Multi-location support for providers
- Team management and dispatch
- Route optimization
- Customer portal
- Automated follow-ups
- Review management

## Technical Debt to Address

1. Remove all Prisma dependencies
2. Clean up unused API routes
3. Implement proper error handling
4. Add comprehensive logging
5. Set up monitoring and alerts
6. Create automated tests

## Success Metrics

- **Quote Accuracy**: Quotes within 15% of actual job cost
- **Conversion Rate**: >25% quote-to-job conversion
- **Provider Satisfaction**: Instant lead delivery, accurate pricing
- **Customer Experience**: Sub-60 second quote generation
- **Platform Reliability**: 99.9% uptime for white-label domains

## Current Blockers

1. Pricing engine returns same quote for all inputs
2. Provider settings not saving to database
3. No staging environment for testing
4. Missing documentation for providers

## Next Immediate Actions

1. ✅ Create this plan.md file
2. 🚧 Implement Phase 1.1 - Update quote form with intentional inputs
3. ⏳ Implement Phase 1.2 - Build rules-based pricing engine
4. ⏳ Implement Phase 1.3 - Update API to use new pricing logic
5. ⏳ Test end-to-end flow with varied inputs
6. ⏳ Connect provider settings to database

---

*Last Updated: November 2024*
*Status: Phase 1 Implementation Starting*