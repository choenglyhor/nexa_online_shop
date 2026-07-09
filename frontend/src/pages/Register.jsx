import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const navigate     = useNavigate()
  const [form,    setForm]    = useState({ first_name: '', last_name: '', username: '', email: '', password: '' })
  const [errors,  setErrors]  = useState({})
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))
    if (errors[e.target.name]) setErrors((p) => ({ ...p, [e.target.name]: undefined }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setSuccess(false)
    setLoading(true)
    try {
      await register(form)
      setSuccess(true)
      setTimeout(() => navigate('/'), 1500)
    } catch (err) {
      setErrors(err.response?.data || { detail: 'Registration failed.' })
    } finally {
      setLoading(false)
    }
  }

  const fieldError = (name) => errors[name]?.[0]

  const inputClass = (name) =>
    `w-full px-3.5 py-2.5 rounded-lg border bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition ${
      fieldError(name) ? 'border-red-400 dark:border-red-600' : 'border-gray-300 dark:border-gray-700'
    }`

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Create your account</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Join NexaShop and start shopping today</p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm p-8">

          {/* Success */}
          {success && (
            <div role="status" className="mb-5 flex items-start gap-2.5 rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 px-4 py-3 text-sm text-green-700 dark:text-green-400">
              <svg className="mt-0.5 h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
              </svg>
              <span>Account created successfully! Redirecting…</span>
            </div>
          )}

          {/* General error */}
          {errors.detail && (
            <div role="alert" className="mb-5 flex items-start gap-2.5 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
              <svg className="mt-0.5 h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.75-9.75a.75.75 0 011.5 0v3.5a.75.75 0 01-1.5 0v-3.5zm.75 6a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
              </svg>
              <span>{errors.detail}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">First name</label>
                <input id="first_name" name="first_name" type="text" autoComplete="given-name"
                  value={form.first_name} onChange={handleChange} placeholder="First"
                  className={inputClass('first_name')} />
                {fieldError('first_name') && <p className="mt-1 text-xs text-red-500">{fieldError('first_name')}</p>}
              </div>
              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Last name</label>
                <input id="last_name" name="last_name" type="text" autoComplete="family-name"
                  value={form.last_name} onChange={handleChange} placeholder="Last"
                  className={inputClass('last_name')} />
                {fieldError('last_name') && <p className="mt-1 text-xs text-red-500">{fieldError('last_name')}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Username</label>
              <input id="username" name="username" type="text" autoComplete="username" required
                value={form.username} onChange={handleChange} placeholder="Enter your username"
                className={inputClass('username')} />
              {fieldError('username') && <p className="mt-1 text-xs text-red-500">{fieldError('username')}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
              <input id="email" name="email" type="email" autoComplete="email" required
                value={form.email} onChange={handleChange} placeholder="Enter your email"
                className={inputClass('email')} />
              {fieldError('email') && <p className="mt-1 text-xs text-red-500">{fieldError('email')}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
              <input id="password" name="password" type="password" autoComplete="new-password" required minLength={6}
                value={form.password} onChange={handleChange} placeholder="Create a password (min. 6 chars)"
                className={inputClass('password')} />
              {fieldError('password') && <p className="mt-1 text-xs text-red-500">{fieldError('password')}</p>}
            </div>

            <button type="submit" disabled={loading || success}
              className="w-full py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 active:bg-brand-800 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Creating account…
                </span>
              ) : 'Register'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-sm text-center text-gray-500 dark:text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-600 dark:text-brand-400 font-medium hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  )
}
