'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import {
  X,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Clock,
  Home,
  DollarSign,
  User,
  Camera,
  Package,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Star,
  ChevronLeft,
  ChevronRight,
  Maximize2
} from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'

interface AnimatedLeadModalProps {
  lead: any
  isOpen: boolean
  onClose: () => void
  onAccept: () => void
  onDecline: () => void
}

export function AnimatedLeadModal({
  lead,
  isOpen,
  onClose,
  onAccept,
  onDecline
}: AnimatedLeadModalProps) {
  const [activePhotoIndex, setActivePhotoIndex] = useState(0)
  const [activeTab, setActiveTab] = useState<'details' | 'photos' | 'items'>('details')

  if (!lead) return null

  const tabs = [
    { id: 'details', label: 'Details', icon: User },
    { id: 'photos', label: `Photos (${lead.photos?.length || 0})`, icon: Camera },
    { id: 'items', label: `Items (${lead.items?.length || 0})`, icon: Package }
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2
                       bg-white rounded-2xl shadow-2xl z-50 overflow-hidden
                       md:max-w-4xl md:w-full md:max-h-[90vh] flex flex-col"
          >
            {/* Animated Header Background */}
            <div className="relative h-48 bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700">
              {/* Animated shapes */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360],
                }}
                transition={{ repeat: Infinity, duration: 20 }}
                className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl"
              />
              <motion.div
                animate={{
                  scale: [1, 1.3, 1],
                  rotate: [360, 180, 0],
                }}
                transition={{ repeat: Infinity, duration: 15 }}
                className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-white/10 blur-xl"
              />

              {/* Priority Badge */}
              <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="absolute top-4 left-4"
              >
                <span className={cn(
                  'inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold uppercase shadow-lg',
                  lead.priority === 'urgent' && 'bg-red-500 text-white animate-pulse',
                  lead.priority === 'high' && 'bg-orange-500 text-white',
                  lead.priority === 'medium' && 'bg-yellow-500 text-white',
                  lead.priority === 'low' && 'bg-gray-500 text-white'
                )}>
                  {lead.priority === 'urgent' && <AlertTriangle className="h-3 w-3" />}
                  {lead.priority}
                </span>
              </motion.div>

              {/* Close Button */}
              <motion.button
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors backdrop-blur-sm"
              >
                <X className="h-5 w-5 text-white" />
              </motion.button>

              {/* Lead Info */}
              <div className="absolute bottom-6 left-6 right-6">
                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-bold text-white mb-2"
                >
                  {lead.name || lead.customerName}
                </motion.h2>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center gap-4 text-white/90 text-sm"
                >
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {lead.location || lead.address}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </span>
                </motion.div>
              </div>

              {/* Value Display */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                className="absolute bottom-6 right-6 bg-white/20 backdrop-blur-md rounded-lg px-4 py-2"
              >
                <p className="text-xs text-white/80 uppercase tracking-wide">Estimated Value</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(lead.estimatedValue)}
                </p>
              </motion.div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              {tabs.map((tab, index) => {
                const Icon = tab.icon
                return (
                  <motion.button
                    key={tab.id}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-colors',
                      activeTab === tab.id
                        ? 'border-b-2 border-purple-600 text-purple-600'
                        : 'text-gray-600 hover:text-gray-900'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </motion.button>
                )
              })}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <AnimatePresence mode="wait">
                {/* Details Tab */}
                {activeTab === 'details' && (
                  <motion.div
                    key="details"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-6"
                  >
                    {/* Contact Info */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="card-modern p-4"
                      >
                        <h3 className="font-semibold text-gray-900 mb-3">Contact Information</h3>
                        <div className="space-y-2 text-sm">
                          {lead.phone || lead.customerPhone ? (
                            <a href={`tel:${lead.phone || lead.customerPhone}`}
                               className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors">
                              <Phone className="h-4 w-4" />
                              {lead.phone || lead.customerPhone}
                            </a>
                          ) : null}
                          {lead.email || lead.customerEmail ? (
                            <a href={`mailto:${lead.email || lead.customerEmail}`}
                               className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors">
                              <Mail className="h-4 w-4" />
                              {lead.email || lead.customerEmail}
                            </a>
                          ) : null}
                          <div className="flex items-center gap-2 text-gray-600">
                            <Home className="h-4 w-4" />
                            {lead.propertyType || 'Residential'}
                          </div>
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="card-modern p-4"
                      >
                        <h3 className="font-semibold text-gray-900 mb-3">Job Details</h3>
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {lead.preferredDate && new Date(lead.preferredDate).toLocaleDateString()}
                            {lead.preferredTime && ` at ${lead.preferredTime}`}
                          </div>
                          {lead.distance && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              Distance: {lead.distance}
                            </div>
                          )}
                          {lead.rating && (
                            <div className="flex items-center gap-2">
                              <Star className="h-4 w-4" />
                              Customer Rating: {lead.rating}/5
                            </div>
                          )}
                        </div>
                      </motion.div>
                    </div>

                    {/* Description */}
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="card-modern p-4"
                    >
                      <h3 className="font-semibold text-gray-900 mb-3">Description</h3>
                      <p className="text-gray-700 leading-relaxed">
                        {lead.service || lead.description}
                      </p>
                    </motion.div>
                  </motion.div>
                )}

                {/* Photos Tab */}
                {activeTab === 'photos' && lead.photos && lead.photos.length > 0 && (
                  <motion.div
                    key="photos"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    {/* Main Photo */}
                    <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden mb-4">
                      <motion.img
                        key={activePhotoIndex}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        src={lead.photos[activePhotoIndex]}
                        alt=""
                        className="w-full h-full object-cover"
                      />

                      {/* Navigation */}
                      {lead.photos.length > 1 && (
                        <>
                          <button
                            onClick={() => setActivePhotoIndex(prev =>
                              prev === 0 ? lead.photos.length - 1 : prev - 1
                            )}
                            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                          >
                            <ChevronLeft className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => setActivePhotoIndex(prev =>
                              prev === lead.photos.length - 1 ? 0 : prev + 1
                            )}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                          >
                            <ChevronRight className="h-5 w-5" />
                          </button>
                        </>
                      )}

                      <button className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 rounded-lg text-white transition-colors">
                        <Maximize2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Thumbnails */}
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                      {lead.photos.map((photo: string, index: number) => (
                        <motion.button
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => setActivePhotoIndex(index)}
                          className={cn(
                            'aspect-square rounded-lg overflow-hidden border-2 transition-all',
                            activePhotoIndex === index
                              ? 'border-purple-600 shadow-lg'
                              : 'border-transparent hover:border-gray-300'
                          )}
                        >
                          <img src={photo} alt="" className="w-full h-full object-cover" />
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Items Tab */}
                {activeTab === 'items' && lead.items && lead.items.length > 0 && (
                  <motion.div
                    key="items"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    {lead.items.map((item: any, index: number) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="card-modern p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900">{item.name}</h4>
                            <div className="flex gap-4 mt-2 text-sm text-gray-600">
                              <span>Qty: <strong>{item.quantity}</strong></span>
                              <span>Condition: <strong>{item.condition}</strong></span>
                            </div>
                            {item.notes && (
                              <p className="mt-2 text-sm text-gray-500">{item.notes}</p>
                            )}
                          </div>
                          <Package className="h-5 w-5 text-gray-400" />
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Action Footer */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="border-t border-gray-200 p-6 bg-gradient-to-r from-green-50 to-emerald-50"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Estimated Value</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {formatCurrency(lead.estimatedValue)}
                  </p>
                </div>

                {lead.status === 'new' ? (
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={onDecline}
                      className="px-6 py-3 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                    >
                      <XCircle className="h-5 w-5 inline mr-2" />
                      Pass on Lead
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={onAccept}
                      className="px-8 py-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium shadow-lg hover:shadow-xl transition-all"
                    >
                      <CheckCircle className="h-5 w-5 inline mr-2" />
                      Accept Lead
                    </motion.button>
                  </div>
                ) : (
                  <div className={cn(
                    'px-6 py-3 rounded-lg font-medium flex items-center gap-2',
                    lead.status === 'accepted' && 'bg-green-100 text-green-800',
                    lead.status === 'declined' && 'bg-red-100 text-red-800'
                  )}>
                    {lead.status === 'accepted' ? (
                      <>
                        <CheckCircle className="h-5 w-5" />
                        Lead Accepted
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5" />
                        Lead Declined
                      </>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}