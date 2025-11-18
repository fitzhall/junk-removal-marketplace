import { headers } from 'next/headers'
import type { CompanyContextValue } from './context/company-context'

/**
 * Server-side helper to get company info from request headers
 * Use this in Server Components, Server Actions, and Route Handlers
 */
export async function getCompanyFromHeaders(): Promise<CompanyContextValue> {
  const headersList = await headers()

  const companyId = headersList.get('x-company-id')
  const companySlug = headersList.get('x-company-slug')
  const companySubdomain = headersList.get('x-company-subdomain')
  const companyCustomDomain = headersList.get('x-company-custom-domain')
  const companyName = headersList.get('x-company-name')
  const companyLogo = headersList.get('x-company-logo')
  const companyPrimaryColor = headersList.get('x-company-primary-color')

  return {
    companyId: companyId || undefined,
    companySlug: companySlug || undefined,
    companySubdomain: companySubdomain || undefined,
    companyCustomDomain: companyCustomDomain || undefined,
    companyName: companyName || undefined,
    companyLogo: companyLogo || undefined,
    companyPrimaryColor: companyPrimaryColor || undefined,
    isCompanySite: !!companyId,
  }
}
