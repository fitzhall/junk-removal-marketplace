# Supabase Migration Guide

## 📋 Migration Checklist

### Phase 1: Database Migration (30 minutes)

#### 1. Export Neon Data
```bash
# Make the script executable
chmod +x ./scripts/export-neon-data.sh

# Run the export
./scripts/export-neon-data.sh
```

#### 2. Set up Supabase Project
1. Go to [https://supabase.com](https://supabase.com)
2. Create new project (if not done already)
3. Note your:
   - Project URL: `https://[PROJECT-REF].supabase.co`
   - Anon Key: Found in Settings > API
   - Service Role Key: Found in Settings > API
   - Database Password: Set during creation

#### 3. Import to Supabase
1. Go to Supabase Dashboard > SQL Editor
2. Run the migration script:
   ```sql
   -- Copy contents of scripts/migrate-to-supabase.sql
   ```
3. Import your Neon data:
   - Go to Supabase Dashboard > Database > Backups
   - Or use SQL Editor to run your exported SQL

#### 4. Update Environment Variables
```env
# Update .env.local

# Remove/Comment out Neon
# DATABASE_URL="postgresql://..."

# Add Supabase Database URL
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# Keep existing Supabase keys (you already have these)
NEXT_PUBLIC_SUPABASE_URL=https://oqifdixuxnabkpdqjjrh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

### Phase 2: Update Prisma Schema (10 minutes)

#### 1. Pull new schema from Supabase
```bash
# Pull the schema from Supabase
npx prisma db pull

# Generate Prisma client
npx prisma generate
```

#### 2. Update schema if needed
The User model might need adjustment to work with Supabase auth:

```prisma
// In schema.prisma, update User model
model User {
  id             String    @id @default(uuid()) @db.Uuid
  email          String    @unique
  // Remove hashedPassword - Supabase handles this
  phone          String?
  name           String?
  role           Role      @default(CUSTOMER)
  emailVerified  DateTime? @map("email_verified")
  phoneVerified  DateTime? @map("phone_verified")
  createdAt      DateTime  @default(now()) @map("created_at")
  updatedAt      DateTime  @updatedAt @map("updated_at")

  provider Provider?
  quotes   Quote[]

  @@map("profiles")
}
```

### Phase 3: Authentication Migration (1 hour)

#### 1. Update Middleware
Replace NextAuth middleware with Supabase Auth:

```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Protected routes
  if (request.nextUrl.pathname.startsWith('/provider')) {
    if (!user) {
      return NextResponse.redirect(new URL('/provider/login', request.url))
    }

    // Check if user is a provider
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'PROVIDER') {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
  }

  return response
}
```

#### 2. Create New Login Page
See `/app/provider/login/page.tsx` (will be created next)

#### 3. Update API Routes
Update all provider API routes to use Supabase auth.

### Phase 4: Test Everything (30 minutes)

#### 1. Test Provider Registration
- Register new provider
- Verify auth.users entry created
- Verify profiles entry created
- Verify Provider entry created

#### 2. Test Provider Login
- Login with provider credentials
- Verify redirected to dashboard
- Verify can see only own leads

#### 3. Test RLS Policies
- Try accessing another provider's leads
- Verify access denied
- Verify multi-tenant isolation works

### Phase 5: Enable Real-time (15 minutes)

#### 1. Enable Realtime in Dashboard
- Go to Database > Replication
- Enable realtime for `lead_distribution` table

#### 2. Add Real-time Subscription
```typescript
// In provider dashboard
useEffect(() => {
  const channel = supabase
    .channel('lead-changes')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'LeadDistribution',
        filter: `providerId=eq.${providerId}`
      },
      (payload) => {
        // New lead received!
        console.log('New lead:', payload.new)
        // Show notification
        // Refresh leads list
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [providerId])
```

## 🚀 Quick Start Commands

```bash
# 1. Export from Neon
./scripts/export-neon-data.sh

# 2. Update .env.local with Supabase credentials

# 3. Update Prisma
npx prisma db pull
npx prisma generate

# 4. Start development
npm run dev

# 5. Test login at
http://localhost:3002/provider/login
```

## ⚠️ Important Notes

1. **Backup First**: Always backup your Neon data before migration
2. **Test Locally**: Test everything locally before updating production
3. **RLS Policies**: Row Level Security is crucial for multi-tenant
4. **Auth Migration**: Existing passwords won't work - providers need to reset
5. **Environment Variables**: Keep both Neon and Supabase URLs during transition

## 🔧 Troubleshooting

### Issue: Cannot connect to Supabase
- Check DATABASE_URL format
- Verify password is correct
- Check if IP is whitelisted (if using connection pooling)

### Issue: RLS blocking access
- Check if policies are created
- Verify auth.uid() is working
- Check provider's auth_user_id is set

### Issue: Prisma schema conflicts
- Run `npx prisma db pull --force`
- Manually adjust schema if needed
- Regenerate client: `npx prisma generate`

## 📞 Next Steps After Migration

1. Remove NextAuth dependencies
2. Delete old auth files
3. Update all API routes
4. Add real-time features
5. Test thoroughly
6. Update production environment

---

**Ready to migrate?** Start with Step 1 and work through systematically!