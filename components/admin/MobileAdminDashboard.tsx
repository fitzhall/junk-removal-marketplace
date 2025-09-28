'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChartBarIcon,
  UsersIcon,
  CurrencyDollarIcon,
  TruckIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
  HomeIcon,
  DocumentTextIcon,
  CogIcon,
  ArrowPathIcon,
  BellIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightIcon,
  BanknotesIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'

interface MobileAdminDashboardProps {
  stats: any
  onRefresh: () => Promise<void>
}

export default function MobileAdminDashboard({ stats, onRefresh }: MobileAdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'leads' | 'providers' | 'menu'>('overview')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today')
  const [showMenu, setShowMenu] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await onRefresh()
    setTimeout(() => setIsRefreshing(false), 500)
  }

  const kpiData = [
    {
      title: 'Revenue',
      value: `$${(stats.kpis?.totalRevenue || 0).toLocaleString()}`,
      change: stats.kpis?.totalRevenueChange || 0,
      icon: CurrencyDollarIcon,
      color: 'green',
      trend: (stats.kpis?.totalRevenueChange || 0) >= 0 ? 'up' : 'down'
    },
    {
      title: 'Active Leads',
      value: stats.kpis?.activeLeads || 0,
      change: stats.kpis?.activeLeadsChange || 0,
      icon: TruckIcon,
      color: 'blue',
      trend: (stats.kpis?.activeLeadsChange || 0) >= 0 ? 'up' : 'down'
    },
    {
      title: 'Providers',
      value: stats.kpis?.activeProviders || 0,
      change: stats.kpis?.activeProvidersChange || 0,
      icon: UserGroupIcon,
      color: 'purple',
      trend: (stats.kpis?.activeProvidersChange || 0) >= 0 ? 'up' : 'down'
    },
    {
      title: 'Conversion',
      value: `${stats.kpis?.conversionRate || 0}%`,
      change: stats.kpis?.conversionRateChange || 0,
      icon: ChartBarIcon,
      color: 'yellow',
      trend: (stats.kpis?.conversionRateChange || 0) >= 0 ? 'up' : 'down'
    }
  ]

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'green': return 'bg-green-100 text-green-600'
      case 'blue': return 'bg-blue-100 text-blue-600'
      case 'purple': return 'bg-purple-100 text-purple-600'
      case 'yellow': return 'bg-yellow-100 text-yellow-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Mobile Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-gray-900">
              Admin {activeTab === 'overview' ? 'Dashboard' : activeTab === 'leads' ? 'Leads' : activeTab === 'providers' ? 'Providers' : 'Menu'}
            </h1>
            <div className="flex items-center gap-3">
              <button className="relative">
                <BellIcon className="w-6 h-6 text-gray-600" />
                {stats.notifications?.unread > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {stats.notifications?.unread}
                  </span>
                )}
              </button>
              <button
                onClick={handleRefresh}
                className={`p-2 ${isRefreshing ? 'animate-spin' : ''}`}
              >
                <ArrowPathIcon className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2"
              >
                {showMenu ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Time Range Selector - Only on overview */}
          {activeTab === 'overview' && (
            <div className="flex gap-2 mt-3">
              {(['today', 'week', 'month'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`flex-1 py-1 px-3 rounded-lg text-sm font-medium capitalize ${
                    timeRange === range
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Pull to Refresh Indicator */}
      {isRefreshing && (
        <div className="text-center py-2">
          <div className="inline-flex items-center gap-2 text-blue-600">
            <ArrowPathIcon className="w-4 h-4 animate-spin" />
            <span className="text-sm">Refreshing...</span>
          </div>
        </div>
      )}

      {/* Content Area */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="p-4"
          >
            {/* KPI Cards - 2x2 Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {kpiData.map((kpi, index) => (
                <motion.div
                  key={kpi.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-sm p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className={`p-2 rounded-lg ${getColorClasses(kpi.color)}`}>
                      <kpi.icon className="w-5 h-5" />
                    </div>
                    {kpi.trend === 'up' ? (
                      <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
                    ) : (
                      <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                  <p className="text-xs text-gray-600">{kpi.title}</p>
                  <p className={`text-xs mt-1 ${kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {kpi.trend === 'up' ? '+' : ''}{kpi.change}%
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Lead Flow */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Lead Flow</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Incoming</span>
                  </div>
                  <span className="font-semibold">{stats.leadFlow?.incoming || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Distributed</span>
                  </div>
                  <span className="font-semibold">{stats.leadFlow?.distributed || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Accepted</span>
                  </div>
                  <span className="font-semibold">{stats.leadFlow?.accepted || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Completed</span>
                  </div>
                  <span className="font-semibold">{stats.leadFlow?.completed || 0}</span>
                </div>
              </div>

              {/* Mini Progress Bar */}
              <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden flex">
                <div className="bg-blue-500" style={{ width: '25%' }}></div>
                <div className="bg-yellow-500" style={{ width: '25%' }}></div>
                <div className="bg-green-500" style={{ width: '25%' }}></div>
                <div className="bg-purple-500" style={{ width: '25%' }}></div>
              </div>
            </div>

            {/* Provider Tiers */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Provider Tiers</h3>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{stats.providerTiers?.elite || 0}</div>
                  <p className="text-xs text-gray-600">Elite</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.providerTiers?.professional || 0}</div>
                  <p className="text-xs text-gray-600">Professional</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">{stats.providerTiers?.basic || 0}</div>
                  <p className="text-xs text-gray-600">Basic</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-2">
                <button className="bg-blue-50 text-blue-600 py-3 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2">
                  <DocumentTextIcon className="w-4 h-4" />
                  View Reports
                </button>
                <button className="bg-green-50 text-green-600 py-3 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2">
                  <UsersIcon className="w-4 h-4" />
                  Add Provider
                </button>
                <button className="bg-purple-50 text-purple-600 py-3 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2">
                  <BanknotesIcon className="w-4 h-4" />
                  Process Payouts
                </button>
                <button className="bg-yellow-50 text-yellow-600 py-3 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2">
                  <MapPinIcon className="w-4 h-4" />
                  Coverage Map
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'leads' && (
          <motion.div
            key="leads"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="p-4"
          >
            {/* Recent Leads List */}
            <div className="space-y-3">
              {stats.recentActivity?.slice(0, 10).map((activity: any, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-lg shadow-sm p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">{activity.customerName || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">{activity.timestamp}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      activity.status === 'new' ? 'bg-blue-100 text-blue-800' :
                      activity.status === 'accepted' ? 'bg-green-100 text-green-800' :
                      activity.status === 'completed' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {activity.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{activity.location}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-green-600">${activity.value}</span>
                    <button className="text-blue-600 text-sm font-medium flex items-center gap-1">
                      View
                      <ArrowRightIcon className="w-3 h-3" />
                    </button>
                  </div>
                </motion.div>
              )) || (
                <div className="text-center py-8 text-gray-500">
                  No recent leads
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'providers' && (
          <motion.div
            key="providers"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="p-4"
          >
            {/* Top Providers */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
              <h3 className="font-semibold text-gray-900 mb-3">Top Performers</h3>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold">{i}</span>
                      </div>
                      <div>
                        <p className="font-medium">Provider {i}</p>
                        <p className="text-xs text-gray-500">98% acceptance rate</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">$12,450</p>
                      <p className="text-xs text-gray-500">This month</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Provider Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-lg shadow-sm p-4">
                <p className="text-2xl font-bold text-gray-900">{stats.kpis?.activeProviders || 0}</p>
                <p className="text-xs text-gray-600">Active Providers</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4">
                <p className="text-2xl font-bold text-gray-900">94%</p>
                <p className="text-xs text-gray-600">Avg Rating</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4">
                <p className="text-2xl font-bold text-gray-900">2.4h</p>
                <p className="text-xs text-gray-600">Avg Response</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4">
                <p className="text-2xl font-bold text-gray-900">87%</p>
                <p className="text-xs text-gray-600">Completion Rate</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slide-out Menu */}
      <AnimatePresence>
        {showMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40"
              onClick={() => setShowMenu(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 20 }}
              className="fixed right-0 top-0 bottom-0 w-80 bg-white z-50 shadow-xl"
            >
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold">Admin Menu</h2>
                  <button onClick={() => setShowMenu(false)}>
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <nav className="p-4 space-y-2">
                <a href="/admin/leads" className="block py-3 px-4 rounded-lg hover:bg-gray-50 flex items-center gap-3">
                  <TruckIcon className="w-5 h-5 text-gray-600" />
                  <span>Manage Leads</span>
                </a>
                <a href="/admin/providers" className="block py-3 px-4 rounded-lg hover:bg-gray-50 flex items-center gap-3">
                  <UserGroupIcon className="w-5 h-5 text-gray-600" />
                  <span>Manage Providers</span>
                </a>
                <a href="/admin/finance" className="block py-3 px-4 rounded-lg hover:bg-gray-50 flex items-center gap-3">
                  <BanknotesIcon className="w-5 h-5 text-gray-600" />
                  <span>Finance & Billing</span>
                </a>
                <a href="/admin/settings" className="block py-3 px-4 rounded-lg hover:bg-gray-50 flex items-center gap-3">
                  <CogIcon className="w-5 h-5 text-gray-600" />
                  <span>Settings</span>
                </a>
              </nav>

              <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
                <button className="w-full bg-red-50 text-red-600 py-2 rounded-lg font-medium">
                  Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="flex justify-around">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-3 flex flex-col items-center gap-1 ${
              activeTab === 'overview' ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            <HomeIcon className="w-6 h-6" />
            <span className="text-xs">Overview</span>
          </button>
          <button
            onClick={() => setActiveTab('leads')}
            className={`flex-1 py-3 flex flex-col items-center gap-1 ${
              activeTab === 'leads' ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            <TruckIcon className="w-6 h-6" />
            <span className="text-xs">Leads</span>
          </button>
          <button
            onClick={() => setActiveTab('providers')}
            className={`flex-1 py-3 flex flex-col items-center gap-1 ${
              activeTab === 'providers' ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            <UserGroupIcon className="w-6 h-6" />
            <span className="text-xs">Providers</span>
          </button>
        </div>
      </nav>
    </div>
  )
}