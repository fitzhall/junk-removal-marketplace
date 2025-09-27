# Environment Variables Setup Guide

## Required Environment Variables for V1

Copy `.env.example` to `.env.local` and configure the following:

### 🔴 Critical (Required for Basic Functionality)

#### Database (Supabase/PostgreSQL)
```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_ID].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_ID].supabase.co:5432/postgres"
```
- Get these from your Supabase project settings > Database

#### Supabase
```env
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR_ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[YOUR_SERVICE_ROLE_KEY]
```
- Find in Supabase project settings > API

### 🟡 Important (Needed for Full Features)

#### Google Vision API (For AI Photo Analysis)
Option 1: Service Account File
```env
GOOGLE_CLOUD_CREDENTIALS=/path/to/service-account-key.json
```

Option 2: Individual Credentials (Better for Vercel)
```env
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_CLIENT_EMAIL=service-account@project.iam.gserviceaccount.com
GOOGLE_CLOUD_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
```

#### Cloudinary (For Image Storage)
```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```
- Sign up at cloudinary.com
- Find credentials in Dashboard

#### NextAuth (For Authentication)
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
```
- Generate secret: `openssl rand -base64 32`

### 🟢 Optional (Can Add Later)

#### Email (SendGrid)
```env
SENDGRID_API_KEY=SG.xxx
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
```

#### SMS (Twilio)
```env
TWILIO_ACCOUNT_SID=xxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_PHONE_NUMBER=+1234567890
```

#### Payment (Stripe)
```env
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

## Quick Start

1. **Database Setup**
   ```bash
   # After configuring DATABASE_URL
   npm run db:push     # Push schema to database
   npm run db:generate # Generate Prisma client
   ```

2. **Test Configuration**
   ```bash
   npm run dev
   # Visit http://localhost:3000
   # Upload a photo to test the quote system
   ```

3. **Verify Services**
   - ✅ Database: Check if quotes save (look for console logs)
   - ✅ Cloudinary: Check if image URLs are returned
   - ✅ Vision API: Check if AI analysis works (or falls back to mock)

## Troubleshooting

### Database Connection Issues
- Ensure DATABASE_URL is properly formatted
- Check if your IP is whitelisted in Supabase
- Try using connection pooler URL if direct connection fails

### Cloudinary Upload Fails
- Verify API credentials are correct
- Check upload preset settings
- Ensure you have available storage quota

### Google Vision API Not Working
- Falls back to mock data automatically
- Check service account permissions
- Ensure billing is enabled on Google Cloud project

## Production Deployment (Vercel)

1. Add all environment variables to Vercel project settings
2. Use individual Google Cloud credentials (not file path)
3. Ensure DATABASE_URL uses connection pooler
4. Set NEXTAUTH_URL to your production domain

## Security Notes

- Never commit `.env.local` to git
- Rotate API keys regularly
- Use different keys for development and production
- Enable API key restrictions where possible