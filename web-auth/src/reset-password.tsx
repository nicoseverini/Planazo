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
        setMessage('¡Tu contraseña ha sido cambiada exitosamente! Ya podés iniciar sesión en la app con tu nueva contraseña.')
        setPassword('')
        setConfirmPassword('')
      } else {
        const errorText = await response.text()
        setStatus('error')
        setMessage(errorText || 'El token es inválido o ha expirado.')
      }
    } catch (err) {
      setStatus('error')
      setMessage(`Error al conectar con el servidor: ${err instanceof Error ? err.message : 'Error desconocido'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-card">
      <h1>Restablecer Contraseña</h1>
      <p className="subtitle">Ingresa una nueva contraseña para tu cuenta.</p>

      {!token && <div className="warning">Falta el parámetro token en la URL.</div>}

      {token && status !== 'success' && (
        <form onSubmit={handleSubmit}>
          <label className="field">
            Nueva contraseña
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
            Confirmar contraseña
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
            {isSubmitting ? 'Guardando...' : 'Guardar nueva contraseña'}
          </button>
        </form>
      )}

      {status === 'success' && <div className="message">{message}</div>}
      {status === 'error' && <div className="warning">{message}</div>}
      {status === 'invalid-token' && <div className="warning">{message}</div>}
    </main>
  )
}
