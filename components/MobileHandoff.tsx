'use client'

import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { DevicePhoneMobileIcon, XMarkIcon } from '@heroicons/react/24/outline'

export default function MobileHandoff() {
  const [showQR, setShowQR] = useState(false)
  const [currentUrl, setCurrentUrl] = useState('')
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Get current URL
    setCurrentUrl(window.location.href)

    // Check if mobile
    const checkMobile = () => {
      const mobile = window.innerWidth < 768 ||
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      setIsMobile(mobile)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Only show on desktop
  if (isMobile) return null

  return (
    <>
      {/* Floating Mobile Button */}
      <button
        onClick={() => setShowQR(true)}
        className="fixed bottom-4 right-4 z-40 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        title="Open on Mobile"
      >
        <DevicePhoneMobileIcon className="w-5 h-5" />
        <span className="text-sm font-medium hidden sm:inline">Open on Mobile</span>
      </button>

      {/* QR Code Modal */}
      {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <DevicePhoneMobileIcon className="w-6 h-6 text-blue-600" />
                Open on Mobile
              </h3>
              <button
                onClick={() => setShowQR(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <p className="text-gray-600 mb-6">
              Scan this QR code with your phone to open the app and take real photos of your junk.
            </p>

            <div className="bg-gray-50 p-8 rounded-xl flex justify-center">
              <QRCodeSVG
                value={currentUrl}
                size={200}
                level="M"
                includeMargin={false}
              />
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700 font-medium mb-2">📱 How it works:</p>
              <ol className="text-sm text-blue-600 space-y-1 list-decimal list-inside">
                <li>Open your phone&apos;s camera app</li>
                <li>Point at the QR code above</li>
                <li>Tap the link that appears</li>
                <li>Take photos directly from your phone</li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </>
  )
}