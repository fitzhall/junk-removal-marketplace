'use client'

import { motion } from 'framer-motion'

export default function LoadingSkeleton() {
  return (
    <div className="bg-white rounded-3xl shadow-xl p-8">
      <div className="text-center mb-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {/* AI Analysis Header */}
          <div className="flex flex-col items-center gap-4">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full flex items-center justify-center"
            >
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </motion.div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">
                AI is Analyzing Your Photos
              </h2>
              <p className="text-gray-600">
                Identifying items and calculating prices...
              </p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="mt-8 space-y-4 max-w-md mx-auto">
            {[
              { label: 'Uploading images', delay: 0 },
              { label: 'Detecting objects', delay: 0.2 },
              { label: 'Identifying junk items', delay: 0.4 },
              { label: 'Calculating volumes', delay: 0.6 },
              { label: 'Generating quote', delay: 0.8 }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: step.delay }}
                className="flex items-center gap-3"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    backgroundColor: ['#e5e7eb', '#22c55e', '#22c55e']
                  }}
                  transition={{
                    duration: 1,
                    delay: step.delay + 1,
                    times: [0, 0.5, 1]
                  }}
                  className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center"
                >
                  <motion.svg
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: step.delay + 1.5 }}
                    className="w-4 h-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </motion.svg>
                </motion.div>
                <span className="text-gray-700">{step.label}</span>
              </motion.div>
            ))}
          </div>

          {/* Animated Progress Bar */}
          <div className="mt-8">
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{
                  duration: 5,
                  ease: "easeInOut"
                }}
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">This usually takes 5-10 seconds</p>
          </div>

          {/* Fun Facts */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="mt-8 p-4 bg-green-50 rounded-xl"
          >
            <p className="text-sm text-green-700">
              💡 <strong>Did you know?</strong> Our AI can identify over 100 different types of junk items!
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}