'use client'

// Removed NextAuth SessionProvider since we're using Supabase auth now
export function Providers({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}