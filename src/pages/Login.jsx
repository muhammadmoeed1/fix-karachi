import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, ShieldCheck } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'

export default function Login() {
  const { login } = useApp()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = (e) => {
    e.preventDefault()
    setError('')
    try { login(form); navigate('/feed') } catch (err) { setError(err.message) }
  }

  const quick = (email, password) => { setForm({ email, password }) }

  return (
    <div className="fade-up mx-auto max-w-md">
      <div className="card p-8">
        <h1 className="text-2xl font-extrabold">Welcome back</h1>
        <p className="mt-1 text-sm muted">Sign in to report and verify civic issues.</p>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <button onClick={() => quick('ali@test.com', '123456')} className="btn btn-outline !py-2 !text-xs">
            <User size={14} /> Demo citizen
          </button>
          <button onClick={() => quick('admin@fixkarachi.pk', 'admin123')} className="btn btn-outline !py-2 !text-xs">
            <ShieldCheck size={14} /> Demo admin
          </button>
        </div>

        <form onSubmit={submit} className="mt-5 space-y-4">
          <Field label="Email" name="email" type="email" value={form.email} onChange={handle} />
          <Field label="Password" name="password" type="password" value={form.password} onChange={handle} />
          {error && <p className="text-sm font-semibold text-rose-500">{error}</p>}
          <button className="btn btn-primary w-full !py-3">Sign in</button>
        </form>

        <p className="mt-4 text-center text-sm muted">
          New here? <Link to="/signup" className="font-bold" style={{ color: 'var(--primary)' }}>Create an account</Link>
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
