import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function requireProviderAuth() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'PROVIDER') {
    return NextResponse.json(
      { error: 'Unauthorized. Provider authentication required.' },
      { status: 401 }
    )
  }

  const providerId = (session.user as any).providerId

  if (!providerId) {
    return NextResponse.json(
      { error: 'Provider account not found' },
      { status: 404 }
    )
  }

  return { session, providerId }
}