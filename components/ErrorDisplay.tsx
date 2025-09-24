'use client'

import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

interface ErrorDisplayProps {
  error: string | null
  onClose: () => void
}

export default function ErrorDisplay({ error, onClose }: ErrorDisplayProps) {
  if (!error) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4 sm:inset-auto sm:bottom-4 sm:right-4 sm:left-auto sm:max-w-md">
      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 shadow-xl">
        <div className="flex items-start gap-3">
          <ExclamationTriangleIcon className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-red-900 mb-1">Error Occurred</h3>
            <div className="text-sm text-red-700 space-y-2">
              <p>{error}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-red-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-red-600" />
          </button>
        </div>

        <div className="mt-4 p-3 bg-white rounded-lg">
          <p className="text-xs text-gray-600 mb-2 font-medium">Common Solutions:</p>
          <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
            <li>Try using smaller image files (under 5MB each)</li>
            <li>Make sure you have a stable internet connection</li>
            <li>Try refreshing the page and starting over</li>
            <li>If using mobile, try switching to WiFi</li>
          </ul>
        </div>

        <button
          onClick={() => {
            // Copy error to clipboard for debugging
            if (navigator.clipboard) {
              navigator.clipboard.writeText(error)
              alert('Error copied to clipboard!')
            }
          }}
          className="mt-3 w-full bg-red-100 text-red-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
        >
          Copy Error Details
        </button>
      </div>
    </div>
  )
}