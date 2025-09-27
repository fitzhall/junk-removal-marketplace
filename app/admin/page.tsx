'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
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
  MapPinIcon
} from '@heroicons/react/24/outline'

interface KPICard {
  title: string
  value: string | number
  change: number
  trend: 'up' | 'down'
  icon: any
  color: string
}

export default function AdminDashboard() {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>({
    kpis: {
      totalRevenue: 0,
      activeLeads: 0,
      activeProviders: 0,
      conversionRate: 0
    },
    leadFlow: {
      incoming: 0,
      distributed: 0,
      accepted: 0,
      completed: 0
    },
    providerTiers: {
      elite: 0,
      professional: 0,
      basic: 0
    },
    topAreas: [],
    recentActivity: []
  })

  useEffect(() => {
    fetchStats()
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

  // Convert stats to KPI cards
  const kpis: KPICard[] = [
    {
      title: 'Total Revenue',
      value: `$${stats.kpis.totalRevenue.toLocaleString()}`,
      change: 12.5, // TODO: Calculate actual change
      trend: 'up',
      icon: CurrencyDollarIcon,
      color: 'green'
    },
    {
      title: 'Active Leads',
      value: stats.kpis.activeLeads,
      change: 8.3, // TODO: Calculate actual change
      trend: 'up',
      icon: TruckIcon,
      color: 'blue'
    },
    {
      title: 'Active Providers',
      value: stats.kpis.activeProviders,
      change: -2.1, // TODO: Calculate actual change
      trend: 'down',
      icon: UsersIcon,
      color: 'purple'
    },
    {
      title: 'Conversion Rate',
      value: `${stats.kpis.conversionRate}%`,
      change: 5.2, // TODO: Calculate actual change
      trend: 'up',
      icon: ChartBarIcon,
      color: 'yellow'
    }
  ]

  const getCoverageColor = (coverage: string) => {
    switch (coverage) {
      case 'excellent': return 'text-green-600 bg-green-100'
      case 'good': return 'text-blue-600 bg-blue-100'
      case 'low': return 'text-yellow-600 bg-yellow-100'
      case 'critical': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <nav className="ml-10 flex space-x-4">
                <a href="/admin" className="text-gray-900 px-3 py-2 text-sm font-medium border-b-2 border-blue-500">
                  Overview
                </a>
                <a href="/admin/leads" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                  Leads
                </a>
                <a href="/admin/providers" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                  Providers
                </a>
                <a href="/admin/finance" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                  Finance
                </a>
                <a href="/admin/settings" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                  Settings
                </a>
              </nav>
            </div>

            {/* Time Range Selector */}
            <div className="flex items-center gap-4">
              <div className="flex bg-gray-100 rounded-lg p-1">
                {(['today', 'week', 'month'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-4 py-1 rounded-md text-sm font-medium capitalize ${
                      timeRange === range
                        ? 'bg-white text-gray-900 shadow'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
              <span className="text-sm text-gray-500">
                Admin User
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {kpis.map((kpi, index) => (
            <motion.div
              key={kpi.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow p-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">{kpi.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {kpi.trend === 'up' ? (
                      <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
                    ) : (
                      <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />
                    )}
                    <span className={`text-sm font-medium ${
                      kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {kpi.change}%
                    </span>
                    <span className="text-xs text-gray-500">vs last {timeRange}</span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg bg-${kpi.color}-100`}>
                  <kpi.icon className={`w-6 h-6 text-${kpi.color}-600`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lead Flow Pipeline */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Lead Flow Pipeline</h2>
            <div className="flex items-center justify-between mb-6">
              <div className="flex-1 text-center">
                <p className="text-3xl font-bold text-blue-600">{stats.leadFlow.incoming}</p>
                <p className="text-sm text-gray-600 mt-1">Incoming</p>
              </div>
              <ChevronRight className="w-6 h-6 text-gray-400" />
              <div className="flex-1 text-center">
                <p className="text-3xl font-bold text-purple-600">{stats.leadFlow.distributed}</p>
                <p className="text-sm text-gray-600 mt-1">Distributed</p>
              </div>
              <ChevronRight className="w-6 h-6 text-gray-400" />
              <div className="flex-1 text-center">
                <p className="text-3xl font-bold text-green-600">{stats.leadFlow.accepted}</p>
                <p className="text-sm text-gray-600 mt-1">Accepted</p>
              </div>
              <ChevronRight className="w-6 h-6 text-gray-400" />
              <div className="flex-1 text-center">
                <p className="text-3xl font-bold text-gray-900">{stats.leadFlow.completed}</p>
                <p className="text-sm text-gray-600 mt-1">Completed</p>
              </div>
            </div>

            {/* Conversion metrics */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div>
                <p className="text-sm text-gray-600">Distribution Rate</p>
                <p className="text-lg font-semibold">
                  {stats.leadFlow.incoming > 0
                    ? Math.round((stats.leadFlow.distributed / stats.leadFlow.incoming) * 100)
                    : 0}%
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Acceptance Rate</p>
                <p className="text-lg font-semibold">
                  {stats.leadFlow.distributed > 0
                    ? Math.round((stats.leadFlow.accepted / stats.leadFlow.distributed) * 100)
                    : 0}%
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Completion Rate</p>
                <p className="text-lg font-semibold">
                  {stats.leadFlow.accepted > 0
                    ? Math.round((stats.leadFlow.completed / stats.leadFlow.accepted) * 100)
                    : 0}%
                </p>
              </div>
            </div>
          </div>

          {/* Provider Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Provider Tiers</h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Active</span>
                  <span className="text-sm text-gray-600">{stats.providerTiers.elite} providers</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{
                      width: `${
                        (stats.providerTiers.elite + stats.providerTiers.professional + stats.providerTiers.basic) > 0
                          ? (stats.providerTiers.elite / (stats.providerTiers.elite + stats.providerTiers.professional + stats.providerTiers.basic)) * 100
                          : 0
                      }%`
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Pending</span>
                  <span className="text-sm text-gray-600">{stats.providerTiers.professional} providers</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${
                        (stats.providerTiers.elite + stats.providerTiers.professional + stats.providerTiers.basic) > 0
                          ? (stats.providerTiers.professional / (stats.providerTiers.elite + stats.providerTiers.professional + stats.providerTiers.basic)) * 100
                          : 0
                      }%`
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Suspended</span>
                  <span className="text-sm text-gray-600">{stats.providerTiers.basic} providers</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gray-600 h-2 rounded-full"
                    style={{
                      width: `${
                        (stats.providerTiers.elite + stats.providerTiers.professional + stats.providerTiers.basic) > 0
                          ? (stats.providerTiers.basic / (stats.providerTiers.elite + stats.providerTiers.professional + stats.providerTiers.basic)) * 100
                          : 0
                      }%`
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-900 font-medium">Total Providers</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">
                {stats.providerTiers.elite + stats.providerTiers.professional + stats.providerTiers.basic}
              </p>
            </div>
          </div>
        </div>

        {/* Geographic Coverage & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Geographic Coverage */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Geographic Coverage</h2>
              <MapPinIcon className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {stats.topAreas.length === 0 ? (
                <p className="text-gray-500 text-sm">No location data available</p>
              ) : (
                stats.topAreas.map((area: any, index: number) => (
                  <div key={`${area.city}-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{area.city}</p>
                      <p className="text-sm text-gray-600">{area.leads} leads • {area.providers} providers</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCoverageColor(area.coverage)}`}>
                      {area.coverage}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Recent Activity</h2>
              <ClockIcon className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {stats.recentActivity.length === 0 ? (
                <p className="text-gray-500 text-sm">No recent activity</p>
              ) : (
                stats.recentActivity.map((activity: any, index: number) => (
                  <div key={index} className="flex items-start gap-3">
                    {activity.urgent ? (
                      <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mt-0.5" />
                    ) : (
                      <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <button className="w-full mt-4 text-center text-sm text-blue-600 hover:text-blue-800 font-medium">
              View All Activity →
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 bg-blue-50 rounded-lg text-blue-700 hover:bg-blue-100 font-medium">
              Distribute Orphaned Leads
            </button>
            <button className="p-4 bg-green-50 rounded-lg text-green-700 hover:bg-green-100 font-medium">
              Approve Providers
            </button>
            <button className="p-4 bg-purple-50 rounded-lg text-purple-700 hover:bg-purple-100 font-medium">
              Process Refunds
            </button>
            <button className="p-4 bg-yellow-50 rounded-lg text-yellow-700 hover:bg-yellow-100 font-medium">
              Send Broadcast
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ChevronRight({ className }: { className: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  )
}