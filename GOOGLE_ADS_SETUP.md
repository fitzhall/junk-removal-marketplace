# Google Ads Landing Page Setup Guide

## Overview
Your Google Ads landing page system is now ready! Here's everything you need to know to start generating leads from Google Ads.

## What's Been Built

### 1. **Landing Pages** (`/app/landing/[campaign]/page.tsx`)
- Dynamic campaign-specific landing pages
- URL structure: `yoursite.com/landing/[campaign-name]`
- Pre-configured campaigns:
  - `/landing/residential` - For home junk removal
  - `/landing/commercial` - For business services
  - `/landing/estate-cleanout` - For estate services
  - `/landing/construction` - For construction debris
  - `/landing/emergency` - For urgent removals
- Supports A/B testing with `?variant=A` or `?variant=B`
- Custom headlines via URL parameters

### 2. **Lead Capture Form** (`/components/QuickLeadForm.tsx`)
- Simplified 3-field form (Name, Phone, ZIP)
- Automatic UTM parameter tracking
- Google Click ID (gclid) capture
- Real-time validation
- Mobile-optimized design

### 3. **API Endpoint** (`/api/leads/quick-capture`)
- Processes form submissions
- Stores leads in database
- Tracks source as "google-ads"
- Preserves all campaign data
- Returns quote ID for tracking

### 4. **Thank You Page** (`/app/thank-you/page.tsx`)
- Confirms lead submission
- Shows quote ID and estimated price
- 20-minute countdown timer for urgency
- Clear next steps
- Call-to-action buttons

### 5. **Google Analytics Integration** (`/components/GoogleAnalytics.tsx`)
- Google Tag Manager setup
- Google Analytics 4 tracking
- Google Ads conversion tracking ready
- Enhanced conversion support

## Setup Instructions

### Step 1: Configure Google IDs
Edit `/components/GoogleAnalytics.tsx` and replace the placeholder IDs:

```tsx
gaId = 'G-XXXXXXXXXX'      // Your GA4 Measurement ID
gtagId = 'GTM-XXXXXXX'      // Your GTM Container ID
conversionId = 'AW-XXXXXXXXX' // Your Google Ads ID
```

### Step 2: Update Conversion Tracking
In `/components/QuickLeadForm.tsx`, line 106, update the conversion label:

```javascript
gtag('event', 'conversion', {
  send_to: 'AW-XXXXXXXXX/XXXXXXXXX', // Replace with your conversion ID/label
  value: data.estimatedPrice?.min || 275,
  currency: 'USD',
  transaction_id: data.quoteId
})
```

### Step 3: Create Google Ads Campaigns

#### Campaign Settings:
- **Campaign Type**: Search or Performance Max
- **Bidding**: Maximize Conversions or Target CPA
- **Budget**: Start with $50-100/day for testing

#### Ad Groups Setup:
1. **Residential** - Target homeowners
2. **Commercial** - Target businesses
3. **Emergency** - Target urgent needs
4. **Estate** - Target estate cleanouts

#### Landing Page URLs:
Use these URL patterns for your ads:

```
Base: https://yoursite.com/landing/residential
With tracking: https://yoursite.com/landing/residential?utm_source=google&utm_medium=cpc&utm_campaign={campaign}&utm_content={adgroup}&utm_term={keyword}&gclid={gclid}
```

### Step 4: URL Parameters for Tracking

The system automatically captures:
- `utm_source` - Traffic source
- `utm_medium` - Medium (cpc, display, etc.)
- `utm_campaign` - Campaign name
- `utm_content` - Ad group or ad variation
- `utm_term` - Keyword that triggered the ad
- `gclid` - Google Click ID for conversion tracking
- `campaignid` - Google Ads campaign ID
- `adgroupid` - Google Ads ad group ID
- `keyword` - The actual keyword
- `device` - Device type (mobile, desktop, tablet)

### Step 5: A/B Testing

Create two ad variations pointing to:
- **Version A**: `/landing/residential?variant=A`
- **Version B**: `/landing/residential?variant=B`

Version B includes:
- Green border highlight
- Limited time offer banner
- Optional email field
- Different psychological triggers

### Step 6: Custom Headlines

You can override default headlines via URL parameters:
```
/landing/residential?headline=Custom%20Headline&subheadline=Custom%20Subheadline
```

## Testing the Flow

1. **Test Form Submission**:
   ```bash
   curl -X POST http://localhost:3000/api/leads/quick-capture \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test User",
       "phone": "555-555-5555",
       "zipCode": "12345",
       "utm_source": "google",
       "utm_campaign": "test",
       "gclid": "test123"
     }'
   ```

2. **Test Landing Pages**:
   - http://localhost:3000/landing/residential
   - http://localhost:3000/landing/commercial
   - http://localhost:3000/landing/emergency

3. **Test Thank You Page**:
   - http://localhost:3000/thank-you?id=TEST123&price=275

## Quality Score Optimization

To maximize your Google Ads Quality Score:

1. **Page Speed**: The landing pages are optimized for Core Web Vitals
2. **Mobile-Friendly**: Fully responsive design
3. **Relevant Content**: Campaign-specific messaging
4. **Clear CTAs**: Prominent form and clear value proposition
5. **Trust Signals**: Reviews, licenses, guarantees displayed

## Conversion Tracking Setup in Google Ads

1. Go to Tools & Settings > Conversions
2. Click "+ New Conversion Action"
3. Choose "Website"
4. Set up tracking:
   - **Category**: Submit lead form
   - **Value**: Use different values (e.g., $275)
   - **Count**: Every conversion
   - **Window**: 30 days click, 1 day view

5. Get your conversion ID and label
6. Update the code as shown in Step 2

## Performance Monitoring

Track these metrics:
- **Conversion Rate**: Target 10-15% minimum
- **Cost Per Lead**: Monitor against your target CPA
- **Quality Score**: Aim for 7+ on all keywords
- **Bounce Rate**: Should be under 50%
- **Page Load Time**: Keep under 3 seconds

## Campaign URL Examples

Here are ready-to-use URLs for different campaigns:

### Residential Campaign:
```
https://yoursite.com/landing/residential?utm_source=google&utm_medium=cpc&utm_campaign=residential_search&gclid={gclid}
```

### Commercial Campaign:
```
https://yoursite.com/landing/commercial?utm_source=google&utm_medium=cpc&utm_campaign=commercial_search&gclid={gclid}
```

### Emergency Campaign (with urgency):
```
https://yoursite.com/landing/emergency?utm_source=google&utm_medium=cpc&utm_campaign=emergency_search&variant=B&gclid={gclid}
```

## Next Steps

1. ✅ Replace Google tracking IDs in the code
2. ✅ Set up Google Ads account and campaigns
3. ✅ Create conversion actions in Google Ads
4. ✅ Launch test campaigns with small budget
5. ✅ Monitor and optimize based on data

## Support

The system is built to be production-ready. Key features:
- Automatic lead distribution to providers
- UTM parameter preservation
- Mobile-optimized forms
- Fast page load times
- Conversion tracking ready
- A/B testing capability

For any issues, check:
1. Database connection (`/api/test-db`)
2. Form endpoint (`/api/leads/quick-capture`)
3. Google Analytics firing (use GA Debug extension)
4. Console for JavaScript errors