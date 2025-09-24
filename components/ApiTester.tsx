'use client'

import { useState } from 'react'
import { WrenchScrewdriverIcon } from '@heroicons/react/24/outline'

export default function ApiTester() {
  const [result, setResult] = useState<string>('')
  const [_loading, setLoading] = useState(false)

  const testApi = async () => {
    setLoading(true)
    setResult('Testing...')

    try {
      // Test GET endpoint
      const getResponse = await fetch('/api/test')
      const getRawText = await getResponse.text()
      console.log('GET Raw response:', getRawText)

      let getData
      try {
        getData = JSON.parse(getRawText)
      } catch {
        setResult(`GET endpoint returned non-JSON: ${getRawText.substring(0, 200)}`)
        return
      }

      // Test POST endpoint
      const postResponse = await fetch('/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: 'data' })
      })
      const postRawText = await postResponse.text()
      console.log('POST Raw response:', postRawText)

      let postData
      try {
        postData = JSON.parse(postRawText)
      } catch {
        setResult(`POST endpoint returned non-JSON: ${postRawText.substring(0, 200)}`)
        return
      }

      setResult(`API Working!
GET: ${JSON.stringify(getData, null, 2)}
POST: ${JSON.stringify(postData, null, 2)}`)

    } catch (error: any) {
      setResult(`API Test Failed: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={testApi}
        className="fixed bottom-4 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:bottom-20 md:left-4 z-40 bg-yellow-600 text-white p-2 rounded-full shadow-lg hover:bg-yellow-700 transition-colors"
        title="Test API"
      >
        <WrenchScrewdriverIcon className="w-5 h-5" />
      </button>

      {result && (
        <div className="fixed inset-x-4 bottom-20 md:bottom-40 md:left-4 md:right-auto md:max-w-md z-50 bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 shadow-xl">
          <h3 className="font-bold mb-2">API Test Result:</h3>
          <pre className="text-xs whitespace-pre-wrap overflow-auto max-h-60">
            {result}
          </pre>
          <button
            onClick={() => setResult('')}
            className="mt-2 text-sm text-yellow-700 underline"
          >
            Close
          </button>
        </div>
      )}
    </>
  )
}