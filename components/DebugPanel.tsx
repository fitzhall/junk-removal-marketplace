'use client'

import { useState, useEffect } from 'react'
import { BugAntIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface DebugLog {
  timestamp: string
  type: 'info' | 'error' | 'warning' | 'success'
  message: string
  data?: any
}

export default function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [logs, setLogs] = useState<DebugLog[]>([])
  const [showDebug, setShowDebug] = useState(false)

  useEffect(() => {
    // Check if debug mode is enabled
    const urlParams = new URLSearchParams(window.location.search)
    const debugMode = urlParams.get('debug') === 'true'
    const isDev = process.env.NODE_ENV === 'development'
    setShowDebug(debugMode || isDev)

    if (debugMode || isDev) {
      // Override console methods to capture logs
      const originalLog = console.log
      const originalError = console.error
      const originalWarn = console.warn

      console.log = (...args) => {
        originalLog(...args)
        addLog('info', args.join(' '), args[1])
      }

      console.error = (...args) => {
        originalError(...args)
        addLog('error', args.join(' '), args[1])
      }

      console.warn = (...args) => {
        originalWarn(...args)
        addLog('warning', args.join(' '), args[1])
      }

      // Cleanup
      return () => {
        console.log = originalLog
        console.error = originalError
        console.warn = originalWarn
      }
    }
  }, [])

  const addLog = (type: DebugLog['type'], message: string, data?: any) => {
    setLogs(prev => [...prev, {
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
      data
    }].slice(-50)) // Keep last 50 logs
  }

  if (!showDebug) return null

  const getLogColor = (type: DebugLog['type']) => {
    switch (type) {
      case 'error': return 'text-red-600 bg-red-50'
      case 'warning': return 'text-yellow-600 bg-yellow-50'
      case 'success': return 'text-green-600 bg-green-50'
      default: return 'text-blue-600 bg-blue-50'
    }
  }

  return (
    <>
      {/* Debug Button - Bottom center on mobile */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-40 bg-orange-600 text-white p-2 sm:p-3 rounded-full shadow-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
        title="Debug Panel"
      >
        <BugAntIcon className="w-5 h-5" />
        {logs.filter(l => l.type === 'error').length > 0 && (
          <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
            {logs.filter(l => l.type === 'error').length}
          </span>
        )}
      </button>

      {/* Debug Panel - Full screen on mobile, modal on desktop */}
      {isOpen && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-4 sm:right-4 sm:left-4 sm:max-w-2xl sm:mx-auto z-50 bg-white sm:rounded-2xl shadow-xl flex flex-col max-h-full sm:max-h-[600px]">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <BugAntIcon className="w-5 h-5 text-orange-600" />
              Debug Panel
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-100 rounded-lg"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Logs */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {logs.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No logs yet...</p>
            ) : (
              logs.map((log, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg text-sm ${getLogColor(log.type)}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium">{log.type.toUpperCase()}</span>
                    <span className="text-xs opacity-75">{log.timestamp}</span>
                  </div>
                  <div className="break-all">{log.message}</div>
                  {log.data && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-xs">View Data</summary>
                      <pre className="mt-2 text-xs overflow-x-auto">
                        {JSON.stringify(log.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Actions */}
          <div className="p-4 border-t flex gap-2">
            <button
              onClick={() => setLogs([])}
              className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Clear Logs
            </button>
            <button
              onClick={() => {
                const logText = logs.map(l => `${l.timestamp} [${l.type}] ${l.message}`).join('\n')
                navigator.clipboard.writeText(logText)
                alert('Logs copied to clipboard!')
              }}
              className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-orange-700 transition-colors"
            >
              Copy Logs
            </button>
          </div>
        </div>
      )}
    </>
  )
}