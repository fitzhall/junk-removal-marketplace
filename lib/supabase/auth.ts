import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function getSession() {
  const supabase = await createServerClient()

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    return session
  } catch (error) {
    console.error('Error fetching session:', error)
    return null
  }
}

export async function getUserDetails() {
  const supabase = await createServerClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return null

    // Get additional user details from User table
    const { data: userDetails } = await supabase
      .from('User')
      .select('*')
      .eq('id', user.id)
      .single()

    return { ...user, ...userDetails }
  } catch (error) {
    console.error('Error fetching user details:', error)
    return null
  }
}

export async function getProvider() {
  const supabase = await createServerClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return null

    // Get provider details
    const { data: provider } = await supabase
      .from('Provider')
      .select('*')
      .eq('userId', user.id)
      .single()

    return provider
  } catch (error) {
    console.error('Error fetching provider:', error)
    return null
  }
}

export async function requireAuth() {
  const session = await getSession()

  if (!session) {
    redirect('/provider/login-supabase')
  }

  return session
}

export async function requireProvider() {
  const session = await requireAuth()
  const provider = await getProvider()

  if (!provider) {
    redirect('/provider/register')
  }

  return { session, provider }
}