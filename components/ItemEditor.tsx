'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PlusIcon, MinusIcon, TrashIcon, PlusCircleIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface Item {
  type: string
  quantity: number
  confidence?: number
  requiresSpecialHandling?: boolean
  category?: string
}

interface ItemEditorProps {
  items: Item[]
  onUpdate: (items: Item[]) => void
  onConfirm: () => void
}

const COMMON_ITEMS = [
  { type: 'Couch', category: 'furniture' },
  { type: 'Mattress', category: 'furniture' },
  { type: 'Chair', category: 'furniture' },
  { type: 'Table', category: 'furniture' },
  { type: 'Dresser', category: 'furniture' },
  { type: 'TV', category: 'electronics' },
  { type: 'Refrigerator', category: 'appliance', requiresSpecialHandling: true },
  { type: 'Washer', category: 'appliance', requiresSpecialHandling: true },
  { type: 'Dryer', category: 'appliance', requiresSpecialHandling: true },
  { type: 'Boxes', category: 'general' },
  { type: 'Bags', category: 'general' },
  { type: 'Misc Items', category: 'general' }
]

export default function ItemEditor({ items: initialItems, onUpdate, onConfirm }: ItemEditorProps) {
  const [items, setItems] = useState<Item[]>(initialItems)
  const [isAddingItem, setIsAddingItem] = useState(false)
  const [newItemType, setNewItemType] = useState('')
  const [showCommonItems, setShowCommonItems] = useState(false)

  useEffect(() => {
    onUpdate(items)
  }, [items, onUpdate])

  const updateQuantity = (index: number, delta: number) => {
    const newItems = [...items]
    newItems[index].quantity = Math.max(1, newItems[index].quantity + delta)
    setItems(newItems)
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const addItem = (type: string, category?: string, requiresSpecialHandling?: boolean) => {
    const existingIndex = items.findIndex(item =>
      item.type.toLowerCase() === type.toLowerCase()
    )

    if (existingIndex >= 0) {
      // If item exists, increment quantity
      const newItems = [...items]
      newItems[existingIndex].quantity += 1
      setItems(newItems)
    } else {
      // Add new item
      setItems([...items, {
        type,
        quantity: 1,
        confidence: 100, // Manual additions have 100% confidence
        category,
        requiresSpecialHandling
      }])
    }

    setNewItemType('')
    setIsAddingItem(false)
    setShowCommonItems(false)
  }

  const getCategoryColor = (category?: string) => {
    switch(category) {
      case 'furniture': return 'bg-blue-100 text-blue-700'
      case 'appliance': return 'bg-purple-100 text-purple-700'
      case 'electronics': return 'bg-indigo-100 text-indigo-700'
      case 'general': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl p-4 sm:p-8">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-2">Review & Edit Items</h2>
        <p className="text-sm sm:text-base text-gray-600">Adjust quantities or add items we might have missed</p>
      </div>

      {/* Detected Items List */}
      <div className="space-y-3 mb-6">
        <AnimatePresence>
          {items.map((item, index) => (
            <motion.div
              key={`${item.type}-${index}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20, height: 0 }}
              className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 flex-1">
                <span className="font-medium text-base sm:text-lg">{item.type}</span>
                <div className="flex items-center gap-2">
                  {item.category && (
                    <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(item.category)}`}>
                      {item.category}
                    </span>
                  )}
                  {item.requiresSpecialHandling && (
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                      Special
                    </span>
                  )}
                  {item.confidence !== undefined && item.confidence < 100 && (
                    <span className="text-xs text-gray-500">
                      AI: {item.confidence}%
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                {/* Quantity Controls */}
                <div className="flex items-center bg-white rounded-lg border">
                  <button
                    onClick={() => updateQuantity(index, -1)}
                    className="p-1.5 sm:p-2 hover:bg-gray-100 transition-colors rounded-l-lg"
                    disabled={item.quantity <= 1}
                  >
                    <MinusIcon className="w-3 sm:w-4 h-3 sm:h-4 text-gray-600" />
                  </button>
                  <span className="px-2 sm:px-4 py-1 sm:py-2 font-medium min-w-[40px] sm:min-w-[50px] text-center text-sm sm:text-base">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(index, 1)}
                    className="p-1.5 sm:p-2 hover:bg-gray-100 transition-colors rounded-r-lg"
                  >
                    <PlusIcon className="w-3 sm:w-4 h-3 sm:h-4 text-gray-600" />
                  </button>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeItem(index)}
                  className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <TrashIcon className="w-4 sm:w-5 h-4 sm:h-5" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {items.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No items detected. Add items manually below.
          </div>
        )}
      </div>

      {/* Add Item Section */}
      <div className="border-t pt-6">
        {!isAddingItem ? (
          <div className="flex gap-3">
            <button
              onClick={() => setIsAddingItem(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
            >
              <PlusCircleIcon className="w-5 h-5" />
              Add Custom Item
            </button>
            <button
              onClick={() => setShowCommonItems(!showCommonItems)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <PlusCircleIcon className="w-5 h-5" />
              Add Common Items
            </button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2"
          >
            <input
              type="text"
              placeholder="Enter item name..."
              value={newItemType}
              onChange={(e) => setNewItemType(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && newItemType.trim()) {
                  addItem(newItemType.trim())
                }
              }}
              className="flex-1 px-4 py-2 border rounded-lg focus:border-green-500 focus:outline-none"
              autoFocus
            />
            <button
              onClick={() => newItemType.trim() && addItem(newItemType.trim())}
              disabled={!newItemType.trim()}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <CheckIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                setIsAddingItem(false)
                setNewItemType('')
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </motion.div>
        )}

        {/* Common Items Grid */}
        <AnimatePresence>
          {showCommonItems && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2"
            >
              {COMMON_ITEMS.map((commonItem) => (
                <button
                  key={commonItem.type}
                  onClick={() => addItem(
                    commonItem.type,
                    commonItem.category,
                    commonItem.requiresSpecialHandling
                  )}
                  className="p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium">{commonItem.type}</span>
                  {commonItem.requiresSpecialHandling && (
                    <span className="ml-2 text-xs text-yellow-600">(Special)</span>
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Confirm Button */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={onConfirm}
          className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
        >
          Confirm Items & Get Final Quote
        </button>
      </div>
    </div>
  )
}