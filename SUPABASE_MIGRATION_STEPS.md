# Supabase Migration - Correct Order of Operations

## ⚠️ IMPORTANT: Follow these steps IN ORDER

### Step 1: Export from Neon (2 minutes)
```bash
cd /Users/fitzhall/projects/Junk\ Removal
./scripts/export-neon-data.sh
```

This creates:
- `backups/neon_schema_*.sql` - Your table structure
- `backups/neon_data_*.sql` - Your data
- `backups/neon_complete_*.sql` - Everything combined

### Step 2: Import Schema to Supabase FIRST (5 minutes)

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Click on **SQL Editor**
3. Click **New Query**
4. **IMPORTANT**: First import ONLY the schema:
   - Copy contents of `backups/neon_schema_*.sql`
   - Paste into SQL Editor
   - Click **Run**

5. You might see some errors about:
   - `role "neondb_owner" does not exist` - IGNORE THIS
   - Extensions already exist - IGNORE THIS
   - These are normal

### Step 3: Run Migration Script (2 minutes)

Now that your tables exist, run the migration script:

1. Still in SQL Editor, click **New Query**
2. Copy contents of `/scripts/migrate-to-supabase-v2.sql`
3. Paste and click **Run**

This will:
- Add `auth_user_id` column to Provider table
- Create profiles table for auth
- Set up Row Level Security
- Create helper functions

### Step 4: Import Your Data (2 minutes)

1. In SQL Editor, click **New Query**
2. Copy contents of `backups/neon_data_*.sql`
3. Paste and click **Run**

### Step 5: Update Environment Variables

```env
# In .env.local, update:

# Comment out Neon
# DATABASE_URL="postgresql://neondb_owner:..."

# Add Supabase (get password from your Supabase dashboard)
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.oqifdixuxnabkpdqjjrh.supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.oqifdixuxnabkpdqjjrh.supabase.co:5432/postgres"
```

To get your database password:
1. Go to Supabase Dashboard
2. Settings → Database
3. Copy the connection string (it has your password)

### Step 6: Update Prisma Schema (1 minute)

```bash
# Pull the new schema
npx prisma db pull

# Generate client
npx prisma generate
```

### Step 7: Create Test Provider Account

1. Visit: `http://localhost:3002/provider/login-supabase`
2. Click "New provider? Create an account"
3. Sign up with email/password
4. Check your email for verification

### Step 8: Link Existing Providers (if any)

If you have existing providers in your database, you need to create auth accounts for them:

```sql
-- In Supabase SQL Editor
-- For each existing provider, create an auth user:

-- Example: Create auth user for existing provider
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'provider@example.com', -- Their email
  crypt('temporaryPassword123', gen_salt('bf')), -- They'll need to reset
  NOW(),
  '{"role": "PROVIDER"}'::jsonb,
  NOW(),
  NOW()
);

-- Then update the Provider record with the new auth user ID
UPDATE "Provider"
SET auth_user_id = (
  SELECT id FROM auth.users WHERE email = 'provider@example.com'
)
WHERE "businessEmail" = 'provider@example.com';
```

## 🎯 Quick Test

After migration, test these:

1. **Login**: Go to `/provider/login-supabase`
2. **Dashboard**: Should redirect to `/provider/dashboard`
3. **Leads**: Should only see their own leads
4. **API**: Should require authentication

## ⚠️ Common Issues & Fixes

### Issue: "column does not exist" error
**Fix**: You need to import your Neon schema first (Step 2)

### Issue: "permission denied for schema public"
**Fix**: You're using the wrong connection. Use the connection string from Supabase Dashboard.

### Issue: Can't login after migration
**Fix**: Existing providers need new auth accounts (Step 8)

### Issue: RLS blocking everything
**Fix**: Make sure `auth_user_id` is set on Provider records

## 🚀 Migration Checklist

- [ ] Exported Neon data
- [ ] Imported schema to Supabase
- [ ] Ran migration script
- [ ] Imported data
- [ ] Updated .env.local
- [ ] Updated Prisma schema
- [ ] Created test account
- [ ] Tested login
- [ ] Verified leads display

---

**Need help?** The most common issue is running scripts in the wrong order. Make sure you:
1. Import schema FIRST
2. Run migration script SECOND
3. Import data LAST