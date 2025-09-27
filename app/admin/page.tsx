'use client'

import { useState } from 'react'
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

  // Mock KPI data
  const kpis: KPICard[] = [
    {
      title: 'Total Revenue',
      value: '$12,847',
      change: 12.5,
      trend: 'up',
      icon: CurrencyDollarIcon,
      color: 'green'
    },
    {
      title: 'Active Leads',
      value: 47,
      change: 8.3,
      trend: 'up',
      icon: TruckIcon,
      color: 'blue'
    },
    {
      title: 'Active Providers',
      value: 156,
      change: -2.1,
      trend: 'down',
      icon: UsersIcon,
      color: 'purple'
    },
    {
      title: 'Conversion Rate',
      value: '68%',
      change: 5.2,
      trend: 'up',
      icon: ChartBarIcon,
      color: 'yellow'
    }
  ]

  // Mock lead flow data
  const leadFlow = {
    incoming: 124,
    distributed: 118,
    accepted: 89,
    completed: 72
  }

  // Mock provider tiers
  const providerTiers = {
    elite: 12,
    professional: 48,
    basic: 96
  }

  // Mock recent activity
  const recentActivity = [
    { type: 'lead', message: 'New $450 lead in San Francisco', time: '2 min ago', urgent: true },
    { type: 'provider', message: 'Provider #234 upgraded to Professional', time: '15 min ago', urgent: false },
    { type: 'alert', message: 'Low coverage in Oakland area', time: '1 hour ago', urgent: true },
    { type: 'payment', message: 'Payment failed for Provider #156', time: '2 hours ago', urgent: true },
    { type: 'lead', message: '5 leads distributed in San Jose', time: '3 hours ago', urgent: false }
  ]

  // Mock geographic data
  const topAreas = [
    { city: 'San Francisco', leads: 45, providers: 23, coverage: 'good' },
    { city: 'Oakland', leads: 32, providers: 8, coverage: 'low' },
    { city: 'San Jose', leads: 28, providers: 15, coverage: 'good' },
    { city: 'Berkeley', leads: 18, providers: 12, coverage: 'excellent' },
    { city: 'Palo Alto', leads: 12, providers: 3, coverage: 'critical' }
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
                <p className="text-3xl font-bold text-blue-600">{leadFlow.incoming}</p>
                <p className="text-sm text-gray-600 mt-1">Incoming</p>
              </div>
              <ChevronRight className="w-6 h-6 text-gray-400" />
              <div className="flex-1 text-center">
                <p className="text-3xl font-bold text-purple-600">{leadFlow.distributed}</p>
                <p className="text-sm text-gray-600 mt-1">Distributed</p>
              </div>
              <ChevronRight className="w-6 h-6 text-gray-400" />
              <div className="flex-1 text-center">
                <p className="text-3xl font-bold text-green-600">{leadFlow.accepted}</p>
                <p className="text-sm text-gray-600 mt-1">Accepted</p>
              </div>
              <ChevronRight className="w-6 h-6 text-gray-400" />
              <div className="flex-1 text-center">
                <p className="text-3xl font-bold text-gray-900">{leadFlow.completed}</p>
                <p className="text-sm text-gray-600 mt-1">Completed</p>
              </div>
            </div>

            {/* Conversion metrics */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div>
                <p className="text-sm text-gray-600">Distribution Rate</p>
                <p className="text-lg font-semibold">{Math.round((leadFlow.distributed / leadFlow.incoming) * 100)}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Acceptance Rate</p>
                <p className="text-lg font-semibold">{Math.round((leadFlow.accepted / leadFlow.distributed) * 100)}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Completion Rate</p>
                <p className="text-lg font-semibold">{Math.round((leadFlow.completed / leadFlow.accepted) * 100)}%</p>
              </div>
            </div>
          </div>

          {/* Provider Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Provider Tiers</h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Elite</span>
                  <span className="text-sm text-gray-600">{providerTiers.elite} providers</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ width: `${(providerTiers.elite / (providerTiers.elite + providerTiers.professional + providerTiers.basic)) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Professional</span>
                  <span className="text-sm text-gray-600">{providerTiers.professional} providers</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${(providerTiers.professional / (providerTiers.elite + providerTiers.professional + providerTiers.basic)) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Basic</span>
                  <span className="text-sm text-gray-600">{providerTiers.basic} providers</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gray-600 h-2 rounded-full"
                    style={{ width: `${(providerTiers.basic / (providerTiers.elite + providerTiers.professional + providerTiers.basic)) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-900 font-medium">Monthly Recurring Revenue</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">
                ${(providerTiers.elite * 999 + providerTiers.professional * 599 + providerTiers.basic * 299).toLocaleString()}
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
              {topAreas.map((area) => (
                <div key={area.city} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{area.city}</p>
                    <p className="text-sm text-gray-600">{area.leads} leads • {area.providers} providers</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCoverageColor(area.coverage)}`}>
                    {area.coverage}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Recent Activity</h2>
              <ClockIcon className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
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
              ))}
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