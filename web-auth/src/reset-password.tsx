import { useState } from 'react'
import type { FormEvent } from 'react'
import { getBackendUrl } from './config'

type ResetStatus = 'idle' | 'loading' | 'success' | 'error' | 'invalid-token'

function validatePassword(password: string) {
  if (password.length < 8) {
    return 'La contraseña debe tener al menos 8 caracteres.'
  }

  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    return 'La contraseña debe incluir al menos una mayúscula, una minúscula y un número.'
  }

  return ''
}

export function ResetPasswordPage() {
  const token = new URLSearchParams(window.location.search).get('token')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [status, setStatus] = useState<ResetStatus>('idle')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!token) {
      setStatus('invalid-token')
      setMessage('No se puede enviar: falta token.')
      return
    }

    const passwordError = validatePassword(password)
    if (passwordError) {
      setStatus('error')
      setMessage(passwordError)
      return
    }

    if (password !== confirmPassword) {
      setStatus('error')
      setMessage('Las contraseñas no coinciden.')
      return
    }

    setIsSubmitting(true)
    setStatus('loading')
    setMessage('')

    try {
      const backendUrl = getBackendUrl()
      const response = await fetch(`${backendUrl}/api/v1/auth/change-password`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword: password,
        }),
      })

      if (response.ok) {
        setStatus('success')
        setMessage('Your password has been changed successfully! You can now log in to the app with your new password.')
        setPassword('')
        setConfirmPassword('')
      } else {
        setStatus('error')
        setMessage('The token is invalid or has expired.')
      }
    } catch (err) {
      setStatus('error')
      setMessage(`Error connecting to the server: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-card">
      <h1>Reset Password</h1>
      <p className="subtitle">Enter a new password for your account.</p>

      {!token && <div className="warning">The token parameter is missing from the URL.</div>}

      {token && status !== 'success' && (
        <form onSubmit={handleSubmit}>
          <label className="field">
            New Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              minLength={8}
              required
              disabled={isSubmitting}
            />
          </label>

          <label className="field">
            Confirm New Password
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              required
              disabled={isSubmitting}
            />
          </label>

          <button className="button" type="submit" disabled={!token || isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save New Password'}
          </button>
        </form>
      )}

      {status === 'success' && <div className="message">{message}</div>}
      {status === 'error' && <div className="warning">{message}</div>}
      {status === 'invalid-token' && <div className="warning">{message}</div>}
    </main>
  )
}
