'use client'

import { createContext, useContext, ReactNode } from 'react'

export interface CompanyContextValue {
  companyId?: string
  companySlug?: string
  companySubdomain?: string
  companyCustomDomain?: string
  companyName?: string
  companyLogo?: string
  companyPrimaryColor?: string
  isCompanySite: boolean
}

const CompanyContext = createContext<CompanyContextValue>({
  isCompanySite: false,
})

export function useCompany() {
  return useContext(CompanyContext)
}

interface CompanyProviderProps {
  children: ReactNode
  value: CompanyContextValue
}

export function CompanyProvider({ children, value }: CompanyProviderProps) {
  return (
    <CompanyContext.Provider value={value}>
      {children}
    </CompanyContext.Provider>
  )
}
