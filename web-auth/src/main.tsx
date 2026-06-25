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
import { TouristPlacesPage } from './tourist-places'
import { CreateTouristPlacePage } from './create-tourist-place'
import { TouristPlaceDetailPage } from './tourist-place-detail'
import { EditTouristPlacePage } from './edit-tourist-place'
import { ReportsPage } from './reports'

function resolveRoute(pathname: string) {
  const normalizedPath = pathname.replace(/\/+$/, '') || '/'

  if (normalizedPath === '/' || normalizedPath === '/login' || normalizedPath === '/signup') {
    return <LoginPage />
  }

  if (normalizedPath === '/plans') {
    return <PlansPage />
  }

  if (normalizedPath === '/tourist-places') {
    return <TouristPlacesPage />
  }

  const planDetailMatch = normalizedPath.match(/^\/plans\/(\d+)$/)
  if (planDetailMatch) {
    return <PlanDetailPage planId={Number(planDetailMatch[1])} />
  }

  const planEditMatch = normalizedPath.match(/^\/plans\/(\d+)\/edit$/)
  if (planEditMatch) {
    return <EditPlanPage planId={Number(planEditMatch[1])} />
  }

  const placeDetailMatch = normalizedPath.match(/^\/tourist-places\/(\d+)$/)
  if (placeDetailMatch) {
    return <TouristPlaceDetailPage placeId={Number(placeDetailMatch[1])} />
  }

  const placeEditMatch = normalizedPath.match(/^\/tourist-places\/(\d+)\/edit$/)
  if (placeEditMatch) {
    return <EditTouristPlacePage placeId={Number(placeEditMatch[1])} />
  }

  if (normalizedPath === '/create-plan') {
    return <CreatePlanPage />
  }

  if (normalizedPath === '/create-tourist-place') {
    return <CreateTouristPlacePage />
  }

  if (normalizedPath === '/verify-email') {
    return <VerifyEmailPage />
  }

  if (normalizedPath === '/reset-password') {
    return <ResetPasswordPage />
  }

  if (normalizedPath === '/reports') {
    return <ReportsPage />
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
          <a href="/tourist-places">/tourist-places</a>
        </li>
        <li>
          <a href="/create-plan">/create-plan</a>
        </li>
        <li>
          <a href="/create-tourist-place">/create-tourist-place</a>
        </li>
        <li>
          <a href="/verify-email?token=tu-token">/verify-email?token=tu-token</a>
        </li>
        <li>
          <a href="/reset-password?token=tu-token">/reset-password?token=tu-token</a>
        </li>
        <li>
          <a href="/reports">/reports</a>
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
