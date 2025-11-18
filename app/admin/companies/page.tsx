'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Building2, CheckCircle, XCircle, Globe, TrendingUp, Users, DollarSign } from 'lucide-react'

interface Company {
  id: string
  businessName: string
  subdomain: string | null
  customDomain: string | null
  subscriptionPlan: 'STARTER' | 'PRO' | 'ENTERPRISE'
  subscriptionStatus: 'ACTIVE' | 'TRIALING' | 'PAST_DUE' | 'CANCELLED'
  isActive: boolean
  monthlyFee: number
  createdAt: string
  _count: {
    quotes: number
    providers: number
  }
}

export default function CompaniesAdminPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/admin/companies')
      if (response.ok) {
        const data = await response.json()
        setCompanies(data.companies || [])
      }
    } catch (error) {
      console.error('Error fetching companies:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case 'ENTERPRISE':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'PRO':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'STARTER':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800'
      case 'TRIALING':
        return 'bg-blue-100 text-blue-800'
      case 'PAST_DUE':
        return 'bg-red-100 text-red-800'
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Companies</h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage all companies on the platform
              </p>
            </div>
            <Link
              href="/admin"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
               Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : companies.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No companies yet</h3>
            <p className="text-gray-600">Companies will appear here when they sign up</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Domain
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    MRR
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {companies.map((company) => (
                  <tr key={company.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-purple-400 to-blue-500 rounded-lg flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-white" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {company.businessName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {company.isActive ? (
                              <span className="inline-flex items-center text-green-600">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center text-red-600">
                                <XCircle className="h-3 w-3 mr-1" />
                                Inactive
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {company.customDomain ? (
                          <span className="inline-flex items-center text-purple-600">
                            <Globe className="h-3 w-3 mr-1" />
                            {company.customDomain}
                          </span>
                        ) : company.subdomain ? (
                          <span className="text-gray-600">
                            {company.subdomain}.platform.com
                          </span>
                        ) : (
                          <span className="text-gray-400">No domain</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPlanBadgeColor(
                          company.subscriptionPlan
                        )}`}
                      >
                        {company.subscriptionPlan}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(
                          company.subscriptionStatus
                        )}`}
                      >
                        {company.subscriptionStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="inline-flex items-center">
                          <TrendingUp className="h-4 w-4 mr-1 text-gray-400" />
                          {company._count.quotes} quotes
                        </span>
                        <span className="inline-flex items-center">
                          <Users className="h-4 w-4 mr-1 text-gray-400" />
                          {company._count.providers} providers
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm font-medium text-gray-900">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        {company.monthlyFee.toFixed(0)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Summary Stats */}
        {companies.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="text-sm text-gray-600">Total Companies</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                {companies.length}
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="text-sm text-gray-600">Active Companies</div>
              <div className="text-2xl font-bold text-green-600 mt-1">
                {companies.filter((c) => c.isActive).length}
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="text-sm text-gray-600">Total MRR</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                ${companies.reduce((sum, c) => sum + c.monthlyFee, 0).toFixed(0)}
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="text-sm text-gray-600">Avg Revenue/Company</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                $
                {companies.length > 0
                  ? (companies.reduce((sum, c) => sum + c.monthlyFee, 0) / companies.length).toFixed(0)
                  : 0}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
