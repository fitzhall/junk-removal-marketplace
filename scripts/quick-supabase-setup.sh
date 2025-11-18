#!/bin/bash

echo "🚀 Quick Supabase Setup Script"
echo "=============================="
echo ""
echo "This script will:"
echo "1. Push your Prisma schema to Supabase"
echo "2. Generate Prisma client"
echo "3. Test the connection"
echo ""

# Check if .env.local has been updated
if grep -q "db.oqifdixuxnabkpdqjjrh.supabase.co" .env.local; then
    echo "✅ Supabase DATABASE_URL detected in .env.local"
else
    echo "❌ ERROR: Supabase DATABASE_URL not found in .env.local"
    echo "Please update your DATABASE_URL first!"
    exit 1
fi

echo "📦 Step 1: Pushing schema to Supabase..."
npx prisma db push --skip-generate

echo ""
echo "📦 Step 2: Generating Prisma Client..."
npx prisma generate

echo ""
echo "📦 Step 3: Testing connection..."
npx prisma db execute --stdin <<EOF
SELECT COUNT(*) as table_count
FROM information_schema.tables
WHERE table_schema = 'public';
EOF

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Go to Supabase SQL Editor"
echo "2. Run the migration script (migrate-to-supabase-v2.sql)"
echo "3. Test login at: http://localhost:3002/provider/login-supabase"