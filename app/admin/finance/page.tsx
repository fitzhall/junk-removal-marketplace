'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CreditCardIcon,
  BanknotesIcon,
  ReceiptRefundIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  CalendarIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline'

interface Transaction {
  id: string
  date: string
  customer: string
  provider: string
  amount: number
  commission: number
  status: 'completed' | 'pending' | 'failed'
  type: 'job_completion' | 'subscription' | 'refund'
  method: string
}

interface Invoice {
  id: string
  dueDate: string
  customer: string
  provider: string
  amount: number
  status: 'pending' | 'overdue'
  description: string
}

interface FinanceMetrics {
  mrr: number
  arr: number
  totalRevenue: number
  revenueGrowth: number
  churnRate: number
  ltv: number
  cac: number
  collectionRate: number
}

interface RevenueByTier {
  elite: number
  professional: number
  basic: number
}

export default function AdminFinancePage() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month')
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'invoices' | 'reports'>('overview')
  const [loading, setLoading] = useState(true)
  const [financialMetrics, setFinancialMetrics] = useState<FinanceMetrics>({
    mrr: 0,
    arr: 0,
    totalRevenue: 0,
    revenueGrowth: 0,
    churnRate: 0,
    ltv: 0,
    cac: 0,
    collectionRate: 0
  })
  const [revenueByTier, setRevenueByTier] = useState<RevenueByTier>({
    elite: 0,
    professional: 0,
    basic: 0
  })
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])

  useEffect(() => {
    fetchFinanceData()
  }, [timeRange])

  const fetchFinanceData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/finance?timeRange=${timeRange}`)
      if (response.ok) {
        const data = await response.json()
        setFinancialMetrics(data.metrics || {
          mrr: 0,
          arr: 0,
          totalRevenue: 0,
          revenueGrowth: 0,
          churnRate: 0,
          ltv: 0,
          cac: 0,
          collectionRate: 0
        })
        setRevenueByTier(data.revenueByTier || {
          elite: 0,
          professional: 0,
          basic: 0
        })
        setTransactions(data.transactions || [])
        setInvoices(data.invoices || [])
      }
    } catch (error) {
      console.error('Error fetching finance data:', error)
    } finally {
      setLoading(false)
    }
  }


  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'job_completion': return <BanknotesIcon className="w-4 h-4" />
      case 'subscription': return <CreditCardIcon className="w-4 h-4" />
      case 'refund': return <ReceiptRefundIcon className="w-4 h-4" />
      default: return <CurrencyDollarIcon className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading finance data...</div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600'
      case 'paid': return 'text-green-600'
      case 'pending': return 'text-yellow-600'
      case 'failed': return 'text-red-600'
      case 'overdue': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Financial Overview</h1>
              <nav className="ml-10 flex space-x-4">
                <a href="/admin" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                  Overview
                </a>
                <a href="/admin/leads" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                  Leads
                </a>
                <a href="/admin/providers" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                  Providers
                </a>
                <a href="/admin/finance" className="text-gray-900 px-3 py-2 text-sm font-medium border-b-2 border-blue-500">
                  Finance
                </a>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as 'week' | 'month' | 'quarter' | 'year')}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2">
                <ArrowDownTrayIcon className="w-4 h-4" />
                Export Report
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <CurrencyDollarIcon className="w-8 h-8 text-green-600" />
              <span className={`flex items-center text-sm ${financialMetrics.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {financialMetrics.revenueGrowth >= 0 ? (
                  <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                ) : (
                  <ArrowTrendingDownIcon className="w-4 h-4 mr-1" />
                )}
                {Math.abs(financialMetrics.revenueGrowth).toFixed(1)}%
              </span>
            </div>
            <p className="text-sm text-gray-600">Monthly Recurring Revenue</p>
            <p className="text-3xl font-bold text-gray-900">${financialMetrics.mrr.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-2">ARR: ${financialMetrics.arr.toLocaleString()}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <BanknotesIcon className="w-8 h-8 text-blue-600" />
              <span className="text-sm text-gray-600">
                LTV:CAC
              </span>
            </div>
            <p className="text-sm text-gray-600">Customer LTV</p>
            <p className="text-3xl font-bold text-gray-900">${financialMetrics.ltv.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-2">CAC: ${financialMetrics.cac.toLocaleString()}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <ChartBarIcon className="w-8 h-8 text-purple-600" />
              <span className="flex items-center text-sm text-red-600">
                <ArrowTrendingDownIcon className="w-4 h-4 mr-1" />
                {financialMetrics.churnRate.toFixed(1)}%
              </span>
            </div>
            <p className="text-sm text-gray-600">Churn Rate</p>
            <p className="text-3xl font-bold text-gray-900">{financialMetrics.churnRate.toFixed(1)}%</p>
            <p className="text-xs text-gray-500 mt-2">Provider churn</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <ExclamationTriangleIcon className="w-8 h-8 text-yellow-600" />
            </div>
            <p className="text-sm text-gray-600">Collection Rate</p>
            <p className="text-3xl font-bold text-gray-900">{financialMetrics.collectionRate.toFixed(1)}%</p>
            <p className="text-xs text-gray-500 mt-2">{invoices.filter(i => i.status === 'overdue').length} overdue invoices</p>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b">
            <div className="flex">
              {(['overview', 'transactions', 'invoices', 'reports'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 text-sm font-medium capitalize border-b-2 ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Revenue by Tier */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Revenue by Subscription Tier</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-purple-700 font-medium">Elite</span>
                        <span className="text-purple-900 font-bold">${revenueByTier.elite.toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-purple-600">Top tier providers</p>
                      <div className="mt-2 bg-purple-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full"
                          style={{
                            width: `${(revenueByTier.elite / (revenueByTier.elite + revenueByTier.professional + revenueByTier.basic)) * 100}%`
                          }}
                        />
                      </div>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-blue-700 font-medium">Professional</span>
                        <span className="text-blue-900 font-bold">${revenueByTier.professional.toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-blue-600">Mid tier providers</p>
                      <div className="mt-2 bg-blue-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${(revenueByTier.professional / (revenueByTier.elite + revenueByTier.professional + revenueByTier.basic)) * 100}%`
                          }}
                        />
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-700 font-medium">Basic</span>
                        <span className="text-gray-900 font-bold">${revenueByTier.basic.toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-gray-600">Entry tier providers</p>
                      <div className="mt-2 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gray-600 h-2 rounded-full"
                          style={{
                            width: `${(revenueByTier.basic / (revenueByTier.elite + revenueByTier.professional + revenueByTier.basic)) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Key Ratios */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Key Financial Ratios</h3>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900">${financialMetrics.ltv}</p>
                      <p className="text-sm text-gray-600">Customer LTV</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900">${financialMetrics.cac}</p>
                      <p className="text-sm text-gray-600">CAC</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900">
                        {financialMetrics.cac > 0 ? (financialMetrics.ltv / financialMetrics.cac).toFixed(1) : 'N/A'}x
                      </p>
                      <p className="text-sm text-gray-600">LTV/CAC Ratio</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900">{financialMetrics.collectionRate.toFixed(0)}%</p>
                      <p className="text-sm text-gray-600">Collection Rate</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Transactions Tab */}
            {activeTab === 'transactions' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Recent Transactions</h3>
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    View All →
                  </button>
                </div>
                <div className="space-y-3">
                  {transactions.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-8">No transactions found</p>
                  ) : (
                    transactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-white rounded-lg">
                            {getTransactionIcon(transaction.type)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{transaction.customer}</p>
                            <p className="text-sm text-gray-600">{transaction.provider}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(transaction.date).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-900">
                            ${transaction.amount.toLocaleString()}
                          </p>
                          <p className="text-sm text-green-600">
                            Commission: ${transaction.commission.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">{transaction.method}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Invoices Tab */}
            {activeTab === 'invoices' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Pending Invoices</h3>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">
                    Generate Invoices
                  </button>
                </div>
                <div className="space-y-3">
                  {invoices.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-8">No pending invoices</p>
                  ) : (
                    invoices.map((invoice) => (
                      <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">
                            {invoice.customer}
                          </p>
                          <p className="text-sm text-gray-600">{invoice.provider}</p>
                          <p className="text-xs text-gray-500">{invoice.description}</p>
                          <p className="text-xs text-gray-500">Due: {new Date(invoice.dueDate).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-900">${invoice.amount.toLocaleString()}</p>
                          <p className={`text-sm font-medium ${getStatusColor(invoice.status)}`}>
                            {invoice.status}
                          </p>
                          <button className="text-blue-600 hover:text-blue-800 text-xs font-medium mt-1">
                            Send Reminder
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Reports Tab */}
            {activeTab === 'reports' && (
              <div className="grid grid-cols-2 gap-4">
                <button className="p-6 border rounded-lg hover:bg-gray-50 text-left">
                  <DocumentTextIcon className="w-8 h-8 text-blue-600 mb-3" />
                  <h4 className="font-medium text-gray-900">Monthly Financial Report</h4>
                  <p className="text-sm text-gray-600 mt-1">Complete P&L, revenue breakdown, and metrics</p>
                </button>
                <button className="p-6 border rounded-lg hover:bg-gray-50 text-left">
                  <ChartBarIcon className="w-8 h-8 text-green-600 mb-3" />
                  <h4 className="font-medium text-gray-900">Provider Revenue Report</h4>
                  <p className="text-sm text-gray-600 mt-1">Revenue by provider, tier, and region</p>
                </button>
                <button className="p-6 border rounded-lg hover:bg-gray-50 text-left">
                  <ReceiptRefundIcon className="w-8 h-8 text-red-600 mb-3" />
                  <h4 className="font-medium text-gray-900">Refunds & Disputes Report</h4>
                  <p className="text-sm text-gray-600 mt-1">Track refunds, disputes, and resolutions</p>
                </button>
                <button className="p-6 border rounded-lg hover:bg-gray-50 text-left">
                  <CalendarIcon className="w-8 h-8 text-purple-600 mb-3" />
                  <h4 className="font-medium text-gray-900">Annual Financial Summary</h4>
                  <p className="text-sm text-gray-600 mt-1">Year-over-year growth and projections</p>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}