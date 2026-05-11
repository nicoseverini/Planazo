import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { VerifyEmailPage } from './verify-email'
import { ResetPasswordPage } from './reset-password'

function resolveRoute(pathname: string) {
  const normalizedPath = pathname.replace(/\/+$/, '') || '/'

  if (normalizedPath === '/verify-email') {
    return <VerifyEmailPage />
  }

  if (normalizedPath === '/reset-password') {
    return <ResetPasswordPage />
  }

  return (
    <main className="auth-card">
      <h1>web-auth</h1>
      <p>Usa una de estas rutas para flujos de autenticacion:</p>
      <ul className="route-list">
        <li>
          <a href="/verify-email?token=tu-token">/verify-email?token=tu-token</a>
        </li>
        <li>
          <a href="/reset-password?token=tu-token">/reset-password?token=tu-token</a>
        </li>
      </ul>
    </main>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {resolveRoute(window.location.pathname)}
  </StrictMode>,
)
