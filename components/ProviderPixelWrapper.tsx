import { headers } from 'next/headers'
import { ProviderPixelTracking } from './ProviderPixelTracking'
import { createClient } from '@/lib/supabase/server'

export async function ProviderPixelWrapper() {
  const headersList = headers()
  const companyId = headersList.get('x-company-id')

  if (!companyId) {
    // Not on a provider domain, no pixels needed
    return null
  }

  try {
    const supabase = createClient()

    // Get provider associated with this company
    const { data: provider } = await supabase
      .from('providers')
      .select('fb_pixel_id, google_analytics_id, google_ads_id')
      .eq('company_id', companyId)
      .single()

    if (!provider) {
      return null
    }

    return (
      <ProviderPixelTracking
        fbPixelId={provider.fb_pixel_id}
        googleAnalyticsId={provider.google_analytics_id}
        googleAdsId={provider.google_ads_id}
        companyId={companyId}
      />
    )
  } catch (error) {
    console.error('Error fetching provider pixels:', error)
    return null
  }
}