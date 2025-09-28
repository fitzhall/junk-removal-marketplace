'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Truck,
  Activity,
  BarChart3,
  MapPin,
  Clock,
  AlertTriangle,
  RefreshCw,
  Calendar,
  Filter,
  ChevronRight,
  Briefcase
} from 'lucide-react'
import { StatCard } from '@/components/ui/stat-card'
import { PipelineCard } from '@/components/ui/pipeline-card'
import { cn, formatCurrency } from '@/lib/utils'

// Dynamically import mobile dashboard
const MobileAdminDashboard = dynamic(
  () => import('@/components/admin/MobileAdminDashboard'),
  { ssr: false }
)

export default function ModernAdminDashboard() {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today')
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [stats, setStats] = useState<any>({
    kpis: {
      totalRevenue: 275,
      totalRevenueChange: -67.6,
      activeLeads: 1,
      activeLeadsChange: -50,
      activeProviders: 2,
      activeProvidersChange: 0,
      conversionRate: 0,
      conversionRateChange: 0
    },
    leadFlow: {
      incoming: 1,
      distributed: 0,
      accepted: 0,
      completed: 0
    },
    providerTiers: {
      active: 2,
      pending: 0,
      suspended: 0
    },
    topAreas: [],
    recentActivity: [
      { type: 'lead', message: 'New $275 lead in Unknown', time: '31 min ago' },
      { type: 'lead', message: 'New $500 lead in Oakland', time: '20 hours ago' },
      { type: 'lead', message: 'New $350 lead in San Francisco', time: '20 hours ago' }
    ]
  })

  useEffect(() => {
    fetchStats()

    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [timeRange])

  const fetchStats = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/stats?timeRange=${timeRange}`)
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    fetchStats()
  }

  // Time range tabs
  const timeRangeTabs = [
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'Week' },
    { id: 'month', label: 'Month' }
  ]

  // Navigation tabs
  const navTabs = [
    { id: 'overview', label: 'Overview', href: '/admin', active: true },
    { id: 'leads', label: 'Leads', href: '/admin/leads' },
    { id: 'providers', label: 'Providers', href: '/admin/providers' },
    { id: 'finance', label: 'Finance', href: '/admin/finance' },
    { id: 'settings', label: 'Settings', href: '/admin/settings' }
  ]

  if (isMobile) {
    return (
      <MobileAdminDashboard
        stats={stats}
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        onRefresh={handleRefresh}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      {/* Modern Header */}
      <header className="sticky top-0 z-40 glass-effect glass-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gradient">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">Monitor and manage your platform</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Time Range Selector */}
              <div className="flex bg-white rounded-lg border border-gray-200 p-1">
                {timeRangeTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setTimeRange(tab.id as any)}
                    className={cn(
                      "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                      timeRange === tab.id
                        ? "bg-gradient-primary text-white"
                        : "text-gray-600 hover:text-gray-900"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <button
                onClick={handleRefresh}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="Refresh"
              >
                <RefreshCw className={cn("h-5 w-5 text-gray-600", loading && "animate-spin")} />
              </button>

              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">Admin User</p>
                <p className="text-xs text-gray-500">Full Access</p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex gap-1 border-t border-gray-200 -mb-px">
            {navTabs.map((tab) => (
              <Link
                key={tab.id}
                href={tab.href}
                className={cn(
                  "px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                  tab.active
                    ? "border-purple-600 text-purple-600"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                )}
              >
                {tab.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center items-center py-20"
            >
              <div className="h-12 w-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* KPI Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                  title="Total Revenue"
                  value={formatCurrency(stats.kpis.totalRevenue)}
                  icon={DollarSign}
                  variant="success"
                  change={{
                    value: stats.kpis.totalRevenueChange,
                    label: `vs last ${timeRange}`
                  }}
                />
                <StatCard
                  title="Active Leads"
                  value={stats.kpis.activeLeads}
                  icon={Briefcase}
                  variant="primary"
                  change={{
                    value: stats.kpis.activeLeadsChange,
                    label: `vs last ${timeRange}`
                  }}
                />
                <StatCard
                  title="Active Providers"
                  value={stats.kpis.activeProviders}
                  icon={Users}
                  variant="default"
                  change={{
                    value: stats.kpis.activeProvidersChange,
                    label: `vs last ${timeRange}`
                  }}
                />
                <StatCard
                  title="Conversion Rate"
                  value={`${stats.kpis.conversionRate}%`}
                  icon={TrendingUp}
                  variant={stats.kpis.conversionRate > 20 ? "success" : "warning"}
                  change={{
                    value: stats.kpis.conversionRateChange,
                    label: `vs last ${timeRange}`
                  }}
                />
              </div>

              {/* Lead Flow Pipeline and Provider Tiers */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Lead Flow Pipeline - Takes 2 columns */}
                <div className="lg:col-span-2">
                  <PipelineCard
                    title="Lead Flow Pipeline"
                    stages={[
                      { label: 'Incoming', value: stats.leadFlow.incoming || 0, color: 'text-blue-600' },
                      { label: 'Distributed', value: stats.leadFlow.distributed || 0, color: 'text-purple-600' },
                      { label: 'Accepted', value: stats.leadFlow.accepted || 0, color: 'text-green-600' },
                      { label: 'Completed', value: stats.leadFlow.completed || 0, color: 'text-emerald-600' }
                    ]}
                  />
                </div>

                {/* Provider Tiers */}
                <div className="card-modern p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Provider Tiers</h3>

                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Active</span>
                        <span className="text-sm font-bold text-gray-900">{stats.providerTiers.active} providers</span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: '100%' }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                          className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Pending</span>
                        <span className="text-sm font-bold text-gray-900">{stats.providerTiers.pending} providers</span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gray-200 rounded-full" style={{ width: '0%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Suspended</span>
                        <span className="text-sm font-bold text-gray-900">{stats.providerTiers.suspended} providers</span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gray-200 rounded-full" style={{ width: '0%' }} />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gradient">{stats.providerTiers.active}</p>
                      <p className="text-sm text-gray-600 mt-1">Total Providers</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Geographic Coverage and Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Geographic Coverage */}
                <div className="card-modern p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Geographic Coverage</h3>
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>

                  {stats.topAreas && stats.topAreas.length > 0 ? (
                    <div className="space-y-3">
                      {stats.topAreas.map((area: any, index: number) => (
                        <motion.div
                          key={area.name}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "h-2 w-2 rounded-full",
                              index === 0 && "bg-purple-500",
                              index === 1 && "bg-blue-500",
                              index === 2 && "bg-green-500",
                              index > 2 && "bg-gray-400"
                            )} />
                            <span className="text-sm font-medium text-gray-900">{area.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">{area.leads} leads</span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-sm font-semibold text-green-600">{formatCurrency(area.revenue)}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <MapPin className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>No location data available</p>
                    </div>
                  )}
                </div>

                {/* Recent Activity */}
                <div className="card-modern p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                    <Clock className="h-5 w-5 text-gray-400" />
                  </div>

                  <div className="space-y-3">
                    {stats.recentActivity.map((activity: any, index: number) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className={cn(
                          "mt-1 h-2 w-2 rounded-full flex-shrink-0",
                          activity.type === 'lead' && "bg-blue-500",
                          activity.type === 'provider' && "bg-purple-500",
                          activity.type === 'payment' && "bg-green-500",
                          activity.type === 'alert' && "bg-red-500"
                        )} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900">{activity.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                        </div>
                        {activity.type === 'alert' && (
                          <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
                        )}
                      </motion.div>
                    ))}
                  </div>

                  <button className="mt-4 w-full text-center text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors">
                    View All Activity →
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}