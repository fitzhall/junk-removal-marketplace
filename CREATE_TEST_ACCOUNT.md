# Creating a Test Provider Account

## Option 1: Use Supabase Dashboard (Easiest)

1. Go to your Supabase Dashboard:
   https://supabase.com/dashboard/project/oqifdixuxnabkpdqjjrh/auth/users

2. Click **"Add user"** → **"Create new user"**

3. Enter:
   - Email: `provider@test.com`
   - Password: `Test123!`
   - Check ✅ "Auto Confirm Email"

4. Click **"Create user"**

5. Run this SQL to create the provider profile:
```sql
-- Create provider for the user you just made
DO $$
DECLARE
    user_id UUID;
BEGIN
    SELECT id INTO user_id FROM auth.users WHERE email = 'provider@test.com';

    IF user_id IS NOT NULL THEN
        INSERT INTO providers (auth_user_id, business_name, status, service_areas)
        VALUES (
            user_id,
            'Test Junk Removal Co',
            'active',
            ARRAY['94105', '94107', '94108']
        );

        RAISE NOTICE 'Provider profile created for provider@test.com';
    END IF;
END $$;
```

## Option 2: Sign Up Through the App

1. Go to: http://localhost:3000/provider/login-supabase
2. Click **"New provider? Create an account"**
3. Enter:
   - Email: Your actual email
   - Password: Your choice
4. Check your email and click the confirmation link
5. Sign in!

## Option 3: Quick Test Without Email Confirmation

Run this in your Supabase SQL Editor to disable email confirmation temporarily:

```sql
-- Temporarily disable email confirmation (for testing only!)
UPDATE auth.config
SET enable_signup = true,
    enable_email_confirmation = false
WHERE id = 1;
```

Then sign up normally and you won't need to confirm email.

**Remember to re-enable it later:**
```sql
UPDATE auth.config
SET enable_email_confirmation = true
WHERE id = 1;
```

## Which option do you want to use?