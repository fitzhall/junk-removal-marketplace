'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  HomeIcon,
  TruckIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CheckIcon
} from '@heroicons/react/24/outline'

export interface JobDetails {
  jobSize: 'small' | 'medium' | 'large' | 'huge' | ''
  itemTypes: string[]
  accessDifficulty: 'easy' | 'standard' | 'difficult' | ''
  urgency: 'same_day' | 'next_day' | 'within_week' | ''
  specialHandling: string[]
  additionalNotes?: string
}

interface JobDetailsFormProps {
  onDetailsSubmit: (details: JobDetails) => void
  initialDetails?: JobDetails
}

const JOB_SIZES = [
  {
    value: 'small',
    label: 'Small',
    description: 'Few items (1-5)',
    priceRange: '$75-150',
    icon: '📦'
  },
  {
    value: 'medium',
    label: 'Medium',
    description: 'Single room',
    priceRange: '$150-350',
    icon: '🏠'
  },
  {
    value: 'large',
    label: 'Large',
    description: 'Multiple rooms',
    priceRange: '$350-700',
    icon: '🏘️'
  },
  {
    value: 'huge',
    label: 'Huge',
    description: 'Whole house',
    priceRange: '$700-1500',
    icon: '🏢'
  }
]

const ITEM_TYPES = [
  { value: 'furniture', label: 'Furniture', icon: '🛋️' },
  { value: 'appliances', label: 'Appliances', icon: '🔌' },
  { value: 'electronics', label: 'Electronics', icon: '💻' },
  { value: 'mattress', label: 'Mattress/Box Spring', icon: '🛏️' },
  { value: 'construction', label: 'Construction Debris', icon: '🔨' },
  { value: 'yard_waste', label: 'Yard Waste', icon: '🌿' },
  { value: 'boxes', label: 'Boxes/Misc', icon: '📦' },
  { value: 'other', label: 'Other', icon: '❓' }
]

const ACCESS_LEVELS = [
  {
    value: 'easy',
    label: 'Easy Access',
    description: 'Curbside or driveway',
    modifier: 'No extra charge',
    icon: '✅'
  },
  {
    value: 'standard',
    label: 'Standard Access',
    description: 'Garage or ground floor',
    modifier: 'Standard pricing',
    icon: '🚪'
  },
  {
    value: 'difficult',
    label: 'Difficult Access',
    description: 'Stairs, tight spaces, or long carry',
    modifier: '+$50-150',
    icon: '⚠️'
  }
]

const URGENCY_OPTIONS = [
  {
    value: 'same_day',
    label: 'Same Day',
    modifier: '+30%',
    icon: '🚨'
  },
  {
    value: 'next_day',
    label: 'Next Day',
    modifier: '+15%',
    icon: '⏰'
  },
  {
    value: 'within_week',
    label: 'Within a Week',
    modifier: 'Standard pricing',
    icon: '📅'
  }
]

const SPECIAL_HANDLING = [
  { value: 'hazardous', label: 'Hazardous Materials', icon: '☢️' },
  { value: 'heavy_items', label: 'Extra Heavy Items (Piano/Safe)', icon: '🎹' },
  { value: 'demolition', label: 'Demolition Required', icon: '🔨' },
  { value: 'hoarding', label: 'Hoarding Situation', icon: '🏚️' },
  { value: 'biohazard', label: 'Biohazard Cleanup', icon: '☣️' }
]

export default function JobDetailsForm({ onDetailsSubmit, initialDetails }: JobDetailsFormProps) {
  const [details, setDetails] = useState<JobDetails>(
    initialDetails || {
      jobSize: '',
      itemTypes: [],
      accessDifficulty: '',
      urgency: '',
      specialHandling: [],
      additionalNotes: ''
    }
  )

  const [errors, setErrors] = useState<{
    jobSize?: string
    itemTypes?: string
    accessDifficulty?: string
    urgency?: string
  }>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    const newErrors: typeof errors = {}
    if (!details.jobSize) newErrors.jobSize = 'Please select a job size'
    if (details.itemTypes.length === 0) newErrors.itemTypes = 'Please select at least one item type'
    if (!details.accessDifficulty) newErrors.accessDifficulty = 'Please select access difficulty'
    if (!details.urgency) newErrors.urgency = 'Please select urgency'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onDetailsSubmit(details)
  }

  const toggleItemType = (type: string) => {
    setDetails(prev => ({
      ...prev,
      itemTypes: prev.itemTypes.includes(type)
        ? prev.itemTypes.filter(t => t !== type)
        : [...prev.itemTypes, type]
    }))
    if (errors.itemTypes) setErrors(prev => ({ ...prev, itemTypes: undefined }))
  }

  const toggleSpecialHandling = (type: string) => {
    setDetails(prev => ({
      ...prev,
      specialHandling: prev.specialHandling.includes(type)
        ? prev.specialHandling.filter(t => t !== type)
        : [...prev.specialHandling, type]
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Job Size */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <HomeIcon className="w-5 h-5 text-gray-600" />
          How much junk do you have?
        </h3>
        {errors.jobSize && (
          <p className="text-red-500 text-sm mb-2">{errors.jobSize}</p>
        )}
        <div className="grid md:grid-cols-2 gap-4">
          {JOB_SIZES.map((size) => (
            <motion.button
              key={size.value}
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setDetails(prev => ({ ...prev, jobSize: size.value as any }))
                if (errors.jobSize) setErrors(prev => ({ ...prev, jobSize: undefined }))
              }}
              className={`relative p-4 rounded-xl border-2 transition-all ${
                details.jobSize === size.value
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{size.icon}</span>
                <div className="flex-1 text-left">
                  <p className="font-semibold">{size.label}</p>
                  <p className="text-sm text-gray-600">{size.description}</p>
                  <p className="text-sm font-medium text-green-600 mt-1">{size.priceRange}</p>
                </div>
                {details.jobSize === size.value && (
                  <CheckIcon className="w-5 h-5 text-green-600 absolute top-3 right-3" />
                )}
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Item Types */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TruckIcon className="w-5 h-5 text-gray-600" />
          What types of items? (Select all that apply)
        </h3>
        {errors.itemTypes && (
          <p className="text-red-500 text-sm mb-2">{errors.itemTypes}</p>
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {ITEM_TYPES.map((type) => (
            <motion.button
              key={type.value}
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleItemType(type.value)}
              className={`p-3 rounded-lg border-2 transition-all ${
                details.itemTypes.includes(type.value)
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-xl">{type.icon}</span>
                <span className="text-sm font-medium">{type.label}</span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Access Difficulty */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <HomeIcon className="w-5 h-5 text-gray-600" />
          Access Difficulty
        </h3>
        {errors.accessDifficulty && (
          <p className="text-red-500 text-sm mb-2">{errors.accessDifficulty}</p>
        )}
        <div className="space-y-3">
          {ACCESS_LEVELS.map((level) => (
            <motion.button
              key={level.value}
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setDetails(prev => ({ ...prev, accessDifficulty: level.value as any }))
                if (errors.accessDifficulty) setErrors(prev => ({ ...prev, accessDifficulty: undefined }))
              }}
              className={`w-full p-4 rounded-xl border-2 transition-all ${
                details.accessDifficulty === level.value
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{level.icon}</span>
                  <div className="text-left">
                    <p className="font-semibold">{level.label}</p>
                    <p className="text-sm text-gray-600">{level.description}</p>
                  </div>
                </div>
                <span className={`text-sm font-medium ${
                  level.modifier.includes('+') ? 'text-orange-600' : 'text-gray-600'
                }`}>
                  {level.modifier}
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Urgency */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <ClockIcon className="w-5 h-5 text-gray-600" />
          When do you need pickup?
        </h3>
        {errors.urgency && (
          <p className="text-red-500 text-sm mb-2">{errors.urgency}</p>
        )}
        <div className="grid md:grid-cols-3 gap-4">
          {URGENCY_OPTIONS.map((option) => (
            <motion.button
              key={option.value}
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setDetails(prev => ({ ...prev, urgency: option.value as any }))
                if (errors.urgency) setErrors(prev => ({ ...prev, urgency: undefined }))
              }}
              className={`p-4 rounded-xl border-2 transition-all ${
                details.urgency === option.value
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <span className="text-2xl">{option.icon}</span>
                <p className="font-semibold">{option.label}</p>
                <p className={`text-sm font-medium ${
                  option.modifier.includes('+') ? 'text-orange-600' : 'text-gray-600'
                }`}>
                  {option.modifier}
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Special Handling */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <ExclamationTriangleIcon className="w-5 h-5 text-gray-600" />
          Special Requirements (Optional)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {SPECIAL_HANDLING.map((type) => (
            <motion.button
              key={type.value}
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleSpecialHandling(type.value)}
              className={`p-3 rounded-lg border-2 transition-all ${
                details.specialHandling.includes(type.value)
                  ? 'border-yellow-500 bg-yellow-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{type.icon}</span>
                <span className="text-sm font-medium">{type.label}</span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Additional Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Additional Notes (Optional)
        </label>
        <textarea
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
          rows={3}
          placeholder="Any special instructions or details we should know..."
          value={details.additionalNotes}
          onChange={(e) => setDetails(prev => ({ ...prev, additionalNotes: e.target.value }))}
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-300"
      >
        Continue to Location
      </button>
    </form>
  )
}