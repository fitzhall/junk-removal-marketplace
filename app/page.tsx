'use client'

import { motion } from 'framer-motion'
import { TruckIcon, CameraIcon, CurrencyDollarIcon, CheckCircleIcon, StarIcon } from '@heroicons/react/24/outline'
import QuoteForm from '@/components/QuoteForm'
import { useState } from 'react'

const features = [
  {
    icon: CameraIcon,
    title: 'Snap a Photo',
    description: 'Take pictures of your junk items'
  },
  {
    icon: CurrencyDollarIcon,
    title: 'Get Instant Quote',
    description: 'AI analyzes and prices instantly'
  },
  {
    icon: TruckIcon,
    title: 'Schedule Pickup',
    description: 'Book removal at your convenience'
  }
]

const benefits = [
  'No waiting for callbacks',
  'Transparent upfront pricing',
  'Licensed & insured pros',
  'Same-day service available',
  'Eco-friendly disposal',
  'Satisfaction guaranteed'
]

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Homeowner',
    content: 'Amazing service! Got a quote in seconds and had my old furniture removed the same day.',
    rating: 5
  },
  {
    name: 'Mike Chen',
    role: 'Property Manager',
    content: 'This is a game-changer for property cleanouts. So much faster than calling around.',
    rating: 5
  },
  {
    name: 'Emily Davis',
    role: 'Business Owner',
    content: 'Professional, quick, and fairly priced. Exactly what we needed for our office renovation.',
    rating: 5
  }
]

export default function Home() {
  const [showForm, setShowForm] = useState(false)

  if (showForm) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
        <div className="container mx-auto px-4 py-8">
          <button
            onClick={() => setShowForm(false)}
            className="mb-8 text-gray-600 hover:text-gray-900 flex items-center gap-2"
          >
            ← Back to Home
          </button>
          <QuoteForm />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-20 left-20 w-72 h-72 blob" />
        <div className="absolute bottom-20 right-20 w-96 h-96 blob animation-delay-2000" />
      </div>

      {/* Hero Section */}
      <section className="relative pt-12 sm:pt-20 pb-20 sm:pb-32 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              AI-Powered Instant Pricing
            </motion.div>

            <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent px-2">
              Junk Removal in
              <span className="text-gradient block sm:inline"> 60 Seconds</span>
            </h1>

            <p className="text-base sm:text-xl md:text-2xl text-gray-600 mb-8 sm:mb-10 leading-relaxed px-2">
              Skip the phone calls. Upload a photo, get an instant quote,
              <br className="hidden md:block" />
              and book your pickup—all in one minute.
            </p>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block w-full sm:w-auto px-4 sm:px-0"
            >
              <button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white text-base sm:text-lg px-6 sm:px-10 py-4 sm:py-5 rounded-xl sm:rounded-2xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-2 sm:gap-3 justify-center w-full sm:w-auto glow"
              >
                <CameraIcon className="w-5 sm:w-6 h-5 sm:h-6" />
                Get Your Free Quote
                <span className="text-xl sm:text-2xl">→</span>
              </button>
            </motion.div>

            <p className="mt-4 sm:mt-6 text-xs sm:text-sm text-gray-500 px-4 sm:px-0">
              ⚡ 2,847 quotes today • 4.9★ from 500+ reviews
            </p>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-white/70 backdrop-blur-sm">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">Three simple steps to a clutter-free space</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative"
              >
                {index < features.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-full w-full">
                    <svg className="w-full h-2" viewBox="0 0 100 10">
                      <path
                        d="M 0 5 L 90 5"
                        stroke="#e5e7eb"
                        strokeWidth="2"
                        strokeDasharray="5,5"
                      />
                      <path
                        d="M 85 2 L 95 5 L 85 8"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                )}

                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow card-hover">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mb-6">
                    <feature.icon className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-3">
                    {index + 1}. {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-8">
                Why Choose Our
                <span className="text-gradient"> Smart Platform?</span>
              </h2>

              <div className="grid gap-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircleIcon className="w-6 h-6 text-green-600 flex-shrink-0" />
                    <span className="text-lg text-gray-700">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 shadow-xl">
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl p-6 text-center">
                    <p className="text-4xl font-bold text-green-600">60s</p>
                    <p className="text-gray-600 mt-2">Avg. Quote Time</p>
                  </div>
                  <div className="bg-white rounded-xl p-6 text-center">
                    <p className="text-4xl font-bold text-green-600">4.9★</p>
                    <p className="text-gray-600 mt-2">Customer Rating</p>
                  </div>
                  <div className="bg-white rounded-xl p-6 text-center">
                    <p className="text-4xl font-bold text-green-600">$50+</p>
                    <p className="text-gray-600 mt-2">Saved on Average</p>
                  </div>
                  <div className="bg-white rounded-xl p-6 text-center">
                    <p className="text-4xl font-bold text-green-600">24/7</p>
                    <p className="text-gray-600 mt-2">Quote Available</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Loved by Thousands
            </h2>
            <p className="text-xl text-gray-600">See what our customers are saying</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">&ldquo;{testimonial.content}&rdquo;</p>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="container mx-auto max-w-4xl"
        >
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl p-12 text-center text-white shadow-2xl">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Clear Your Space?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands who&apos;ve simplified junk removal with AI
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block"
            >
              <button
                onClick={() => setShowForm(true)}
                className="bg-white text-green-600 text-lg px-10 py-5 rounded-2xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                Start Your Free Quote →
              </button>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto text-center">
          <p className="mb-4">© 2025 Junk Removal AI. All rights reserved.</p>
          <div className="flex justify-center gap-6 text-sm">
            <a href="#" className="hover:text-green-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-green-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-green-400 transition-colors">Contact</a>
            <a href="/provider" className="hover:text-green-400 transition-colors">Provider Portal</a>
            <a href="/admin" className="hover:text-green-400 transition-colors">Admin</a>
          </div>
        </div>
      </footer>
    </main>
  )
}