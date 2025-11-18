#!/bin/bash

# Export data from Neon database
# Make sure you have pg_dump installed

echo "🚀 Starting Neon to Supabase Migration"
echo "======================================="

# Neon connection string from .env.local
NEON_DB="postgresql://neondb_owner:npg_f7HLlk3NRQGU@ep-odd-dust-ahqde1y5-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require"

# Create backup directory
mkdir -p ./backups
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "📦 Step 1: Exporting schema from Neon..."
pg_dump "$NEON_DB" --schema-only --no-owner --no-privileges > "./backups/neon_schema_${TIMESTAMP}.sql"

echo "📦 Step 2: Exporting data from Neon..."
pg_dump "$NEON_DB" --data-only --no-owner --no-privileges > "./backups/neon_data_${TIMESTAMP}.sql"

echo "📦 Step 3: Creating combined export..."
pg_dump "$NEON_DB" --no-owner --no-privileges > "./backups/neon_complete_${TIMESTAMP}.sql"

echo ""
echo "✅ Export complete! Files saved in ./backups/"
echo ""
echo "📋 Next steps:"
echo "1. Go to your Supabase project dashboard"
echo "2. Navigate to SQL Editor"
echo "3. First run: scripts/migrate-to-supabase.sql"
echo "4. Then import: backups/neon_complete_${TIMESTAMP}.sql"
echo "5. Update your .env.local with Supabase DATABASE_URL"
echo ""
echo "Your Supabase DATABASE_URL format:"
echo "postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"