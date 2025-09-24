'use client'

import { useState, useEffect } from 'react'
import { BeakerIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface TestModeProps {
  onSelectTestImages: (files: File[]) => void
}

// Sample junk images for testing (using placeholder service)
const TEST_IMAGES = [
  { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop', name: 'old-couch.jpg', description: 'Old couch' },
  { url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop', name: 'furniture.jpg', description: 'Furniture' },
  { url: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400&h=400&fit=crop', name: 'mixed-items.jpg', description: 'Mixed items' },
]

export default function TestMode({ onSelectTestImages }: TestModeProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // Only show in development or with ?debug=true
  const [showTestMode, setShowTestMode] = useState(false)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const debugMode = urlParams.get('debug') === 'true'
    const isDev = process.env.NODE_ENV === 'development'
    setShowTestMode(debugMode || isDev)
  }, [])

  if (!showTestMode) return null

  const loadTestImages = async () => {
    setLoading(true)
    try {
      // Convert URLs to File objects
      const files = await Promise.all(
        TEST_IMAGES.map(async (img) => {
          const response = await fetch(img.url)
          const blob = await response.blob()
          return new File([blob], img.name, { type: 'image/jpeg' })
        })
      )

      onSelectTestImages(files)
      setIsOpen(false)
    } catch (error) {
      console.error('Error loading test images:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating Test Mode Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-50 bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
        title="Test Mode"
      >
        <BeakerIcon className="w-5 h-5" />
        <span className="text-sm font-medium hidden sm:inline">Test Mode</span>
      </button>

      {/* Test Mode Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <BeakerIcon className="w-6 h-6 text-purple-600" />
                Test Mode
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <p className="text-gray-600 mb-6">
              Load sample images for testing the AI quote system without real photos.
            </p>

            <div className="space-y-3 mb-6">
              {TEST_IMAGES.map((img, index) => (
                <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 bg-gray-200 rounded flex-shrink-0" />
                  <span className="text-sm">{img.description}</span>
                </div>
              ))}
            </div>

            <button
              onClick={loadTestImages}
              disabled={loading}
              className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Loading Test Images...' : 'Load Test Images'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}