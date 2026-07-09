import { useState } from 'react'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    // Hook this up to a real backend endpoint when ready.
    setSent(true)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-2">Contact Us</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-10">
        Questions about an order or a product? Send us a message and we'll get back to you within 24 hours.
      </p>

      <div className="grid md:grid-cols-2 gap-10">
        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-5">
            <p className="font-semibold">📍 Address</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">123 Market Street, Phnom Penh, Cambodia</p>
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-5">
            <p className="font-semibold">📞 Phone</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">+1 (555) 123-4567</p>
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-5">
            <p className="font-semibold">✉️ Email</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">support@shoply.com</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {sent && (
            <div className="text-sm text-green-700 bg-green-50 dark:bg-green-900/30 dark:text-green-400 p-3 rounded-lg">
              Thanks! Your message has been sent.
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Message</label>
            <textarea
              required
              rows={5}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <button type="submit" className="px-6 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium">
            Send Message
          </button>
        </form>
      </div>
    </div>
  )
}
