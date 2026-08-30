import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'

export default function Signup() {
  const { signup } = useApp()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = (e) => {
    e.preventDefault()
    setError('')
    try { signup(form); navigate('/feed') } catch (err) { setError(err.message) }
  }

  return (
    <div className="fade-up mx-auto max-w-md">
      <div className="card p-8">
        <h1 className="text-2xl font-extrabold">Create your account</h1>
        <p className="mt-1 text-sm muted">Register in under a minute and start reporting.</p>

        <form onSubmit={submit} className="mt-5 space-y-4">
          <Field label="Full name" name="name" value={form.name} onChange={handle} />
          <Field label="Email" name="email" type="email" value={form.email} onChange={handle} />
          <Field label="Password" name="password" type="password" value={form.password} onChange={handle} />
          {error && <p className="text-sm font-semibold text-rose-500">{error}</p>}
          <button className="btn btn-primary w-full !py-3">Sign up</button>
        </form>

        <p className="mt-4 text-center text-sm muted">
          Already have an account? <Link to="/login" className="font-bold" style={{ color: 'var(--primary)' }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}

function Field({ label, ...props }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold">{label}</span>
      <input {...props} required className="input" />
    </label>
  )
}
