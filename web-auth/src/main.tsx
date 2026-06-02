import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { VerifyEmailPage } from './verify-email'
import { ResetPasswordPage } from './reset-password'
import { LoginPage } from './login'
import { PlansPage } from './plans.tsx'
import { CreatePlanPage } from './create-plan'
import { PlanDetailPage } from './plan-detail'
import { EditPlanPage } from './edit-plan'

function resolveRoute(pathname: string) {
  const normalizedPath = pathname.replace(/\/+$/, '') || '/'

  if (normalizedPath === '/' || normalizedPath === '/login' || normalizedPath === '/signup') {
    return <LoginPage />
  }

  if (normalizedPath === '/plans') {
    return <PlansPage />
  }

  const planDetailMatch = normalizedPath.match(/^\/plans\/(\d+)$/)
  if (planDetailMatch) {
    return <PlanDetailPage planId={Number(planDetailMatch[1])} />
  }

  const planEditMatch = normalizedPath.match(/^\/plans\/(\d+)\/edit$/)
  if (planEditMatch) {
    return <EditPlanPage planId={Number(planEditMatch[1])} />
  }

  if (normalizedPath === '/create-plan') {
    return <CreatePlanPage />
  }

  if (normalizedPath === '/verify-email') {
    return <VerifyEmailPage />
  }

  if (normalizedPath === '/reset-password') {
    return <ResetPasswordPage />
  }

  return (
    <main className="auth-card">
      <h1>web-auth</h1>
      <ul className="route-list">
        <li>
          <a href="/login">/login</a>
        </li>
        <li>
          <a href="/plans">/plans</a>
        </li>
        <li>
          <a href="/create-plan">/create-plan</a>
        </li>
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
