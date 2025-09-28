'use client'

import { Toaster, toast as hotToast } from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  DollarSign,
  Briefcase,
  TrendingUp,
  Star
} from 'lucide-react'

// Custom toast provider with premium styling
export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={12}
      toastOptions={{
        duration: 4000,
        style: {
          background: 'white',
          color: '#1f2937',
          padding: '16px',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(0, 0, 0, 0.05)',
        },
        success: {
          iconTheme: {
            primary: '#10b981',
            secondary: 'white',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: 'white',
          },
        },
      }}
    />
  )
}

// Custom toast functions with animations
export const toast = {
  success: (message: string, options?: any) => {
    hotToast.custom(
      (t) => (
        <AnimatePresence>
          {t.visible && (
            <motion.div
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.8 }}
              className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-xl border border-green-100"
            >
              <div className="flex-shrink-0">
                <div className="h-10 w-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{message}</p>
              </div>
              <button
                onClick={() => hotToast.dismiss(t.id)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      ),
      options
    )
  },

  error: (message: string, options?: any) => {
    hotToast.custom(
      (t) => (
        <AnimatePresence>
          {t.visible && (
            <motion.div
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.8 }}
              className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-xl border border-red-100"
            >
              <div className="flex-shrink-0">
                <div className="h-10 w-10 bg-gradient-to-br from-red-400 to-rose-500 rounded-lg flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{message}</p>
              </div>
              <button
                onClick={() => hotToast.dismiss(t.id)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      ),
      options
    )
  },

  leadAccepted: (value: number) => {
    hotToast.custom(
      (t) => (
        <AnimatePresence>
          {t.visible && (
            <motion.div
              initial={{ opacity: 0, y: -50, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.8 }}
              transition={{ type: 'spring', damping: 15 }}
              className="flex items-center gap-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 shadow-xl border border-green-200"
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 0.5 }}
                className="flex-shrink-0"
              >
                <div className="h-12 w-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                  <Briefcase className="h-6 w-6 text-white" />
                </div>
              </motion.div>
              <div className="flex-1">
                <p className="text-base font-bold text-gray-900">Lead Accepted!</p>
                <p className="text-sm text-gray-600">
                  Estimated value: <span className="font-semibold text-green-600">${value}</span>
                </p>
              </div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <CheckCircle className="h-8 w-8 text-green-500" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      ),
      { duration: 5000 }
    )
  },

  newLead: (location: string, value: number) => {
    hotToast.custom(
      (t) => (
        <AnimatePresence>
          {t.visible && (
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className="flex items-center gap-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 shadow-xl border border-purple-200"
            >
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="flex-shrink-0"
              >
                <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </motion.div>
              <div className="flex-1">
                <p className="text-base font-bold text-gray-900">New Lead Available!</p>
                <p className="text-sm text-gray-600">
                  {location} • <span className="font-semibold text-purple-600">${value}</span>
                </p>
              </div>
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                <ChevronRight className="h-5 w-5 text-purple-500" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      ),
      { duration: 6000 }
    )
  },

  milestone: (message: string, icon?: 'revenue' | 'leads' | 'rating') => {
    const icons = {
      revenue: DollarSign,
      leads: Briefcase,
      rating: Star,
    }
    const Icon = icons[icon || 'leads']

    hotToast.custom(
      (t) => (
        <AnimatePresence>
          {t.visible && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ type: 'spring', damping: 12 }}
              className="flex items-center gap-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl p-4 shadow-xl border border-yellow-200"
            >
              <motion.div
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.2, 1],
                }}
                transition={{ duration: 1 }}
                className="flex-shrink-0"
              >
                <div className="h-12 w-12 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg">
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </motion.div>
              <div className="flex-1">
                <p className="text-base font-bold text-gray-900">🎉 Milestone Achieved!</p>
                <p className="text-sm text-gray-600">{message}</p>
              </div>
              <motion.div
                initial={{ rotate: -45 }}
                animate={{ rotate: 0 }}
                transition={{ type: 'spring' }}
              >
                <Star className="h-8 w-8 text-yellow-500 fill-yellow-500" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      ),
      { duration: 7000 }
    )
  },

  info: (message: string, options?: any) => {
    hotToast.custom(
      (t) => (
        <AnimatePresence>
          {t.visible && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-xl border border-blue-100"
            >
              <div className="flex-shrink-0">
                <div className="h-10 w-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center">
                  <Info className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{message}</p>
              </div>
              <button
                onClick={() => hotToast.dismiss(t.id)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      ),
      options
    )
  },
}

// Import for ChevronRight
import { ChevronRight } from 'lucide-react'