'use client'

import { useState } from 'react'
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
  type: 'subscription' | 'lead' | 'refund' | 'adjustment'
  description: string
  provider: string
  amount: number
  status: 'completed' | 'pending' | 'failed'
  method: string
}

interface Invoice {
  id: string
  providerId: string
  providerName: string
  period: string
  amount: number
  status: 'paid' | 'pending' | 'overdue'
  dueDate: string
}

export default function AdminFinancePage() {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'year'>('month')
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'invoices' | 'reports'>('overview')

  // Mock financial data
  const financialMetrics = {
    mrr: 89244, // Monthly Recurring Revenue
    arr: 1070928, // Annual Recurring Revenue
    leadRevenue: 23450,
    totalRevenue: 112694,
    growth: 12.5,
    churn: 2.3,
    ltv: 4500, // Lifetime Value
    cac: 150, // Customer Acquisition Cost
    outstandingBalance: 4580,
    refundsThisMonth: 1250
  }

  // Mock revenue breakdown
  const revenueByTier = {
    elite: { count: 12, revenue: 11988 },
    professional: { count: 48, revenue: 28752 },
    basic: { count: 96, revenue: 28704 }
  }

  // Mock transactions
  const recentTransactions: Transaction[] = [
    {
      id: 'TXN-001',
      date: '2024-01-27T10:30:00',
      type: 'subscription',
      description: 'Monthly subscription - Elite',
      provider: 'JunkPro Services',
      amount: 999,
      status: 'completed',
      method: 'Stripe'
    },
    {
      id: 'TXN-002',
      date: '2024-01-27T09:15:00',
      type: 'lead',
      description: '5 additional leads purchased',
      provider: 'QuickHaul',
      amount: 100,
      status: 'completed',
      method: 'Credit balance'
    },
    {
      id: 'TXN-003',
      date: '2024-01-27T08:00:00',
      type: 'refund',
      description: 'Lead refund - customer canceled',
      provider: 'EcoJunk Removal',
      amount: -25,
      status: 'completed',
      method: 'Credit added'
    },
    {
      id: 'TXN-004',
      date: '2024-01-26T16:45:00',
      type: 'subscription',
      description: 'Payment failed - Card declined',
      provider: 'Fresh Start Hauling',
      amount: 299,
      status: 'failed',
      method: 'Stripe'
    }
  ]

  // Mock invoices
  const pendingInvoices: Invoice[] = [
    {
      id: 'INV-001',
      providerId: 'PRV-002',
      providerName: 'QuickHaul',
      period: 'January 2024',
      amount: 750,
      status: 'pending',
      dueDate: '2024-02-01'
    },
    {
      id: 'INV-002',
      providerId: 'PRV-003',
      providerName: 'EcoJunk Removal',
      period: 'January 2024',
      amount: 450,
      status: 'overdue',
      dueDate: '2024-01-25'
    }
  ]

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'subscription': return <CreditCardIcon className="w-4 h-4" />
      case 'lead': return <BanknotesIcon className="w-4 h-4" />
      case 'refund': return <ReceiptRefundIcon className="w-4 h-4" />
      default: return <CurrencyDollarIcon className="w-4 h-4" />
    }
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
                onChange={(e) => setTimeRange(e.target.value as 'today' | 'week' | 'month' | 'year')}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
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
              <span className="flex items-center text-sm text-green-600">
                <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                {financialMetrics.growth}%
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
              <span className="flex items-center text-sm text-green-600">
                <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                8.3%
              </span>
            </div>
            <p className="text-sm text-gray-600">Lead Revenue</p>
            <p className="text-3xl font-bold text-gray-900">${financialMetrics.leadRevenue.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-2">Pay-per-lead income</p>
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
                {financialMetrics.churn}%
              </span>
            </div>
            <p className="text-sm text-gray-600">Churn Rate</p>
            <p className="text-3xl font-bold text-gray-900">{financialMetrics.churn}%</p>
            <p className="text-xs text-gray-500 mt-2">Monthly churn</p>
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
            <p className="text-sm text-gray-600">Outstanding</p>
            <p className="text-3xl font-bold text-gray-900">${financialMetrics.outstandingBalance.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-2">3 overdue accounts</p>
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
                        <span className="text-purple-900 font-bold">${revenueByTier.elite.revenue.toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-purple-600">{revenueByTier.elite.count} providers × $999</p>
                      <div className="mt-2 bg-purple-200 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: '100%' }} />
                      </div>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-blue-700 font-medium">Professional</span>
                        <span className="text-blue-900 font-bold">${revenueByTier.professional.revenue.toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-blue-600">{revenueByTier.professional.count} providers × $599</p>
                      <div className="mt-2 bg-blue-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }} />
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-700 font-medium">Basic</span>
                        <span className="text-gray-900 font-bold">${revenueByTier.basic.revenue.toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-gray-600">{revenueByTier.basic.count} providers × $299</p>
                      <div className="mt-2 bg-gray-200 rounded-full h-2">
                        <div className="bg-gray-600 h-2 rounded-full" style={{ width: '70%' }} />
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
                      <p className="text-2xl font-bold text-gray-900">{(financialMetrics.ltv / financialMetrics.cac).toFixed(1)}x</p>
                      <p className="text-sm text-gray-600">LTV/CAC Ratio</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900">94%</p>
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
                  {recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-white rounded-lg">
                          {getTransactionIcon(transaction.type)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{transaction.description}</p>
                          <p className="text-sm text-gray-600">{transaction.provider}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(transaction.date).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-semibold ${transaction.amount < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                          {transaction.amount < 0 ? '-' : '+'}${Math.abs(transaction.amount)}
                        </p>
                        <p className={`text-sm ${getStatusColor(transaction.status)}`}>
                          {transaction.status}
                        </p>
                        <p className="text-xs text-gray-500">{transaction.method}</p>
                      </div>
                    </div>
                  ))}
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
                  {pendingInvoices.map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">
                          {invoice.providerName} - {invoice.period}
                        </p>
                        <p className="text-sm text-gray-600">Invoice #{invoice.id}</p>
                        <p className="text-xs text-gray-500">Due: {invoice.dueDate}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">${invoice.amount}</p>
                        <p className={`text-sm font-medium ${getStatusColor(invoice.status)}`}>
                          {invoice.status}
                        </p>
                        <button className="text-blue-600 hover:text-blue-800 text-xs font-medium mt-1">
                          Send Reminder
                        </button>
                      </div>
                    </div>
                  ))}
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