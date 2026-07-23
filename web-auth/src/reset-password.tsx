import { useState } from 'react'
import type { FormEvent } from 'react'
import { getBackendUrl } from './config'

type ResetStatus = 'idle' | 'loading' | 'success' | 'error' | 'invalid-token'

function validatePassword(password: string): string {
    if (password.length < 8) {
        return 'Password must be at least 8 characters.'
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
        return 'Password must include at least one uppercase letter, one lowercase letter, and one number.'
    }
    return ''
}

export function ResetPasswordPage() {
    const token = new URLSearchParams(window.location.search).get('token')

    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [status, setStatus] = useState<ResetStatus>(token ? 'idle' : 'invalid-token')
    const [message, setMessage] = useState(
        token ? '' : 'The reset link is invalid or missing. Please request a new one.'
    )
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()

        const passwordError = validatePassword(password)
        if (passwordError) {
            setStatus('error')
            setMessage(passwordError)
            return
        }

        if (password !== confirmPassword) {
            setStatus('error')
            setMessage('Passwords do not match.')
            return
        }

        setIsSubmitting(true)
        setStatus('loading')
        setMessage('')

        try {
            const response = await fetch(`${getBackendUrl()}/api/v1/auth/change-password`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token, newPassword: password }),
            })

            if (response.ok) {
                setStatus('success')
                setMessage('Your password has been changed successfully. You can now log in to the app with your new password.')
                setPassword('')
                setConfirmPassword('')
            } else {
                const errorText = await response.text()
                setStatus('error')
                setMessage(errorText || 'The link is invalid or has expired. Please request a new one.')
            }
        } catch (err) {
            setStatus('error')
            setMessage(`Could not connect to the server: ${err instanceof Error ? err.message : 'Unknown error'}`)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <main className="auth-card">
            <h1>Reset Password</h1>
            <p className="subtitle">Enter a new password for your account.</p>

            {status === 'invalid-token' && (
                <div className="warning">{message}</div>
            )}

            {status === 'success' && (
                <div className="message">{message}</div>
            )}

            {token && status !== 'success' && status !== 'invalid-token' && (
                <form onSubmit={handleSubmit} className="form-stack">
                    <label className="field">
                        New password
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="new-password"
                                required
                                disabled={isSubmitting}
                                style={{ paddingRight: '2.5rem', width: '100%', boxSizing: 'border-box' }}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword((v) => !v)}
                              style={{
                                  position: 'absolute',
                                  right: '0.6rem',
                                  top: '50%',
                                  transform: 'translateY(-50%)',
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  color: '#6b7280',
                                  padding: 0,
                                  display: 'flex',
                                  alignItems: 'center'
                              }}
                              aria-label={showPassword ? 'Hide password' : 'Show password'}
                          >
                              {showPassword ? (
                                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                                      <circle cx="12" cy="12" r="3" />
                                  </svg>
                              ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                                      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                                      <line x1="2" y1="2" x2="22" y2="22" />
                                  </svg>
                              )}
                          </button>
                        </div>
                    </label>

                    <label className="field">
                        Confirm new password
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                autoComplete="new-password"
                                required
                                disabled={isSubmitting}
                                style={{ paddingRight: '2.5rem', width: '100%', boxSizing: 'border-box' }}
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword((v) => !v)}
                              style={{
                                  position: 'absolute',
                                  right: '0.6rem',
                                  top: '50%',
                                  transform: 'translateY(-50%)',
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  color: '#6b7280',
                                  padding: 0,
                                  display: 'flex', 
                                  alignItems: 'center'
                              }}
                              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                          >
                              {showConfirmPassword ? (
                                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                                      <circle cx="12" cy="12" r="3" />
                                  </svg>
                              ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                                      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                                      <line x1="2" y1="2" x2="22" y2="22" />
                                  </svg>
                              )}
                          </button>
                        </div>
                    </label>

                    {status === 'error' && <div className="warning">{message}</div>}

                    <button className="button" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : 'Save new password'}
                    </button>
                </form>
            )}
        </main>
    )
}