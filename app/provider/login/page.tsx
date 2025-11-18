'use client'

import { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mail, Lock, Briefcase, AlertCircle, Loader2, Phone } from 'lucide-react'

// Separate component that uses useSearchParams
function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const callbackUrl = searchParams.get('callbackUrl') || '/provider/dashboard'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl
      })

      if (result?.error) {
        setError(result.error === 'CredentialsSignin'
          ? 'Invalid email or password'
          : result.error)
      } else if (result?.ok) {
        router.push(callbackUrl)
        router.refresh()
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Card header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 sm:p-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Welcome Back</h2>
          <p className="text-blue-100 mt-2">Sign in to access your dashboard</p>
        </div>

        {/* Login form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3"
            >
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </motion.div>
          )}

          {/* Email field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="provider@example.com"
                autoComplete="email"
                autoFocus
              />
            </div>
          </div>

          {/* Password field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
          </div>

          {/* Remember me & Forgot password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-600">Remember me</span>
            </label>
            <a href="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Forgot password?
            </a>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>

          {/* Demo credentials notice */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-900 font-medium mb-2">Demo Account</p>
            <p className="text-xs text-blue-700">
              For testing, use your registered provider email and password.
            </p>
          </div>
        </form>

        {/* Footer links */}
        <div className="bg-gray-50 px-6 py-4 sm:px-8 sm:py-6">
          <div className="flex flex-col sm:flex-row gap-4 text-center sm:text-left">
            <a
              href="/provider/register"
              className="text-sm text-gray-600 hover:text-blue-600 font-medium"
            >
              New provider? Register here
            </a>
            <a
              href="tel:1-800-JUNK-PRO"
              className="text-sm text-gray-600 hover:text-blue-600 font-medium flex items-center justify-center sm:justify-start gap-2"
            >
              <Phone className="h-4 w-4" />
              Need help? Call support
            </a>
          </div>
        </div>
      </div>

      {/* Mobile-friendly footer text */}
      <p className="text-center text-xs sm:text-sm text-gray-600 mt-6">
        Protected by enterprise-grade security
      </p>
    </motion.div>
  )
}

// Loading component for Suspense fallback
function LoginFormLoading() {
  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 sm:p-8">
          <div className="h-8 w-48 bg-white/20 rounded animate-pulse"></div>
          <div className="h-4 w-32 bg-white/20 rounded mt-2 animate-pulse"></div>
        </div>
        <div className="p-6 sm:p-8 space-y-6">
          <div className="h-20 bg-gray-100 rounded-lg animate-pulse"></div>
          <div className="h-20 bg-gray-100 rounded-lg animate-pulse"></div>
          <div className="h-12 bg-gray-100 rounded-lg animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}

// Main page component with Suspense boundary
export default function ProviderLoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Mobile-optimized header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Briefcase className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Provider Portal</h1>
              <p className="text-xs sm:text-sm text-gray-600">Manage your junk removal leads</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main content with Suspense boundary */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <Suspense fallback={<LoginFormLoading />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}