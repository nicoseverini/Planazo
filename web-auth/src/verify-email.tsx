import { useState, useEffect } from 'react'
import { getBackendUrl } from './config'

type VerifyStatus = 'loading' | 'success' | 'error' | 'invalid-token'

const processedTokens = new Set<string>()

export function VerifyEmailPage() {
  const token = new URLSearchParams(window.location.search).get('token')
  const [status, setStatus] = useState<VerifyStatus>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('invalid-token')
      setMessage('Falta el parámetro token en la URL.')
      return
    }

    const tokenValue = token

    if (processedTokens.has(tokenValue)) {
      return
    }

    processedTokens.add(tokenValue)

    async function verify() {
      try {
        const backendUrl = getBackendUrl()
        const response = await fetch(`${backendUrl}/api/v1/auth/verify_user?token=${encodeURIComponent(tokenValue)}`, {
          method: 'PATCH',
          headers: {
            Accept: 'application/json',
          },
        })

        if (response.ok) {
          setStatus('success')
          setMessage('¡Tu email ha sido verificado correctamente! Podés cerrar esta página.')
        } else {
          const errorText = await response.text()
          setStatus('error')
          setMessage(errorText || 'El token es inválido o ha expirado.')
          processedTokens.delete(tokenValue)
        }
      } catch (err) {
        setStatus('error')
        setMessage(`Error al conectar con el servidor: ${err instanceof Error ? err.message : 'Error desconocido'}`)
        processedTokens.delete(tokenValue)
      }
    }

    verify()
  }, [token])

  return (
    <main className="auth-card">
      <h1>Verificar Email</h1>

      {status === 'loading' && (
        <>
          <div className="message">Verificando tu email...</div>
        </>
      )}

      {status === 'success' && (
        <div className="message">{message}</div>
      )}

      {status === 'error' && (
        <div className="warning">{message}</div>
      )}

      {status === 'invalid-token' && (
        <div className="warning">{message}</div>
      )}
    </main>
  )
}
