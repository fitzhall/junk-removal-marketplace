'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function DebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function debug() {
      const supabase = createClient()

      // Step 1: Check user
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      let provider = null
      let leads = null
      let distributions = null
      let quotes = null

      if (user) {
        // Step 2: Check provider
        const { data: providerData, error: providerError } = await supabase
          .from('providers')
          .select('*')
          .eq('auth_user_id', user.id)
          .single()

        provider = { data: providerData, error: providerError }

        if (providerData) {
          // Step 3: Check lead_distributions
          const { data: distData, error: distError } = await supabase
            .from('lead_distributions')
            .select('*')
            .eq('provider_id', providerData.id)

          distributions = { data: distData, error: distError }

          // Step 4: Check lead_distributions with quotes join
          const { data: leadData, error: leadError } = await supabase
            .from('lead_distributions')
            .select(`
              *,
              quotes (*)
            `)
            .eq('provider_id', providerData.id)

          leads = { data: leadData, error: leadError }
        }

        // Step 5: Check quotes directly
        const { data: quotesData, error: quotesError } = await supabase
          .from('quotes')
          .select('*')
          .limit(5)

        quotes = { data: quotesData, error: quotesError }
      }

      setDebugInfo({
        user: { data: user, error: userError },
        provider,
        distributions,
        leads,
        quotes
      })
      setLoading(false)
    }

    debug()
  }, [])

  if (loading) return <div className="p-8">Loading debug info...</div>

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Provider Dashboard Debug</h1>

      <div className="space-y-6">
        <div className="border rounded-lg p-4">
          <h2 className="font-bold text-lg mb-2">1. User Authentication</h2>
          {debugInfo.user?.data ? (
            <div className="text-green-600">
              ✅ Logged in as: {debugInfo.user.data.email} (ID: {debugInfo.user.data.id})
            </div>
          ) : (
            <div className="text-red-600">
              ❌ Not authenticated: {JSON.stringify(debugInfo.user?.error)}
            </div>
          )}
        </div>

        <div className="border rounded-lg p-4">
          <h2 className="font-bold text-lg mb-2">2. Provider Record</h2>
          {debugInfo.provider?.data ? (
            <div className="text-green-600">
              ✅ Provider found: {debugInfo.provider.data.business_name} (ID: {debugInfo.provider.data.id})
            </div>
          ) : (
            <div className="text-red-600">
              ❌ No provider: {JSON.stringify(debugInfo.provider?.error)}
            </div>
          )}
        </div>

        <div className="border rounded-lg p-4">
          <h2 className="font-bold text-lg mb-2">3. Lead Distributions (Direct)</h2>
          {debugInfo.distributions?.data ? (
            <div className="text-green-600">
              ✅ Found {debugInfo.distributions.data.length} distributions
              <pre className="mt-2 text-xs bg-gray-100 p-2 rounded">
                {JSON.stringify(debugInfo.distributions.data, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="text-red-600">
              ❌ No distributions: {JSON.stringify(debugInfo.distributions?.error)}
            </div>
          )}
        </div>

        <div className="border rounded-lg p-4">
          <h2 className="font-bold text-lg mb-2">4. Lead Distributions (With Quotes Join)</h2>
          {debugInfo.leads?.data && debugInfo.leads.data.length > 0 ? (
            <div className="text-green-600">
              ✅ Found {debugInfo.leads.data.length} leads with quotes
              <pre className="mt-2 text-xs bg-gray-100 p-2 rounded">
                {JSON.stringify(debugInfo.leads.data, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="text-red-600">
              ❌ No leads: {JSON.stringify(debugInfo.leads?.error)}
            </div>
          )}
        </div>

        <div className="border rounded-lg p-4">
          <h2 className="font-bold text-lg mb-2">5. Quotes Table (Direct Test)</h2>
          {debugInfo.quotes?.data ? (
            <div className="text-green-600">
              ✅ Can read quotes table - found {debugInfo.quotes.data.length} quotes
              <pre className="mt-2 text-xs bg-gray-100 p-2 rounded">
                {JSON.stringify(debugInfo.quotes.data, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="text-red-600">
              ❌ Cannot read quotes: {JSON.stringify(debugInfo.quotes?.error)}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-bold mb-2">Next Steps:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Check which step above is failing</li>
          <li>If user is not authenticated, log in again</li>
          <li>If provider is missing, we need to create it</li>
          <li>If distributions exist but quotes join fails, it's an RLS issue on quotes table</li>
        </ul>
      </div>
    </div>
  )
}