'use client'

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PipelineStage {
  label: string
  value: number
  color: string
}

interface PipelineCardProps {
  stages: PipelineStage[]
  title?: string
  className?: string
}

export function PipelineCard({ stages, title, className }: PipelineCardProps) {
  const maxValue = Math.max(...stages.map(s => s.value), 1)

  return (
    <div className={cn("card-modern p-6", className)}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-6">{title}</h3>
      )}

      <div className="flex items-center justify-between gap-2">
        {stages.map((stage, index) => (
          <div key={stage.label} className="flex items-center flex-1">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="flex-1"
            >
              <div className="text-center">
                <div
                  className={cn(
                    "text-3xl font-bold mb-2",
                    stage.color
                  )}
                >
                  {stage.value}
                </div>
                <div className="text-xs text-gray-600 font-medium uppercase tracking-wide">
                  {stage.label}
                </div>

                {/* Progress bar */}
                <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(stage.value / maxValue) * 100}%` }}
                    transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                    className={cn(
                      "h-full rounded-full",
                      index === 0 && "bg-blue-500",
                      index === 1 && "bg-purple-500",
                      index === 2 && "bg-green-500",
                      index === 3 && "bg-emerald-600"
                    )}
                  />
                </div>
              </div>
            </motion.div>

            {index < stages.length - 1 && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.2 }}
                className="mx-2"
              >
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </motion.div>
            )}
          </div>
        ))}
      </div>

      {/* Conversion rates */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Distribution Rate</p>
          <p className="text-sm font-semibold text-gray-900">
            {stages[1] && stages[0] ? `${Math.round((stages[1].value / stages[0].value) * 100)}%` : '0%'}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Acceptance Rate</p>
          <p className="text-sm font-semibold text-gray-900">
            {stages[2] && stages[1] && stages[1].value > 0 ? `${Math.round((stages[2].value / stages[1].value) * 100)}%` : '0%'}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Completion Rate</p>
          <p className="text-sm font-semibold text-gray-900">
            {stages[3] && stages[2] && stages[2].value > 0 ? `${Math.round((stages[3].value / stages[2].value) * 100)}%` : '0%'}
          </p>
        </div>
      </div>
    </div>
  )
}