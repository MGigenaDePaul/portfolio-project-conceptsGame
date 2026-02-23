import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import '../pages/Login.css'
import './Register.css'

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState(null)
    const [submitting, setSubmitting] = useState(false)

    const { register } = useUser();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)

        if (!username.trim() || !email.trim() || !password) {
            setError('Please fill in all fields.');
            return
        }

        if (username.trim().length < 2) {
            setError('Username must be at least 2 characters')
            return
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters')
            return
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return
        }

        setSubmitting(true)
        try {
            await register(username.trim(), email.trim(), password)
            navigate('/')
        } catch (err) {
            setError(err.message || 'Registration failed. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-logo">
          🔮 Concepts
        </Link>
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Start combining elements</p>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              placeholder="coolplayer42"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              autoFocus
              maxLength={50}
              disabled={submitting}
            />
          </div>

          <div className="auth-field">
            <label htmlFor="reg-email">Email</label>
            <input
              id="reg-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              disabled={submitting}
            />
          </div>

          <div className="auth-field">
            <label htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              type="password"
              placeholder="Min 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              disabled={submitting}
            />
          </div>

          <div className="auth-field">
            <label htmlFor="confirm-password">Confirm Password</label>
            <input
              id="confirm-password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              disabled={submitting}
            />
          </div>

          <button
            type="submit"
            className="auth-submit register-submit"
            disabled={submitting}
          >
            {submitting ? (
              <span className="auth-spinner" />
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{' '}
          <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}

export default Register