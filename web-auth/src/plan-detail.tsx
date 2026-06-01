import { useEffect, useMemo, useState } from 'react'

import { getBackendUrl } from './config'
import { formatDateTime, getVisibilityLabel, toTitleCase } from './plan-utils'

type PlanDetailResponse = {
	id: number
	title: string
	description: string
	dateTime: string
	durationMinutes: number | null
	visibility: 'PUBLIC' | 'PRIVATE'
	maxSubscribers: number | null
	minAge: number | null
	maxAge: number | null
	interest: string
	travelType: string
	location: string
	latitude: number | null
	longitude: number | null
	images: string[]
	creatorId: number
	creatorName: string
	subscriberCount: number
	isFull: boolean
}

type PlanDetailPageProps = {
	planId: number
}

export function PlanDetailPage({ planId }: PlanDetailPageProps) {
	const [plan, setPlan] = useState<PlanDetailResponse | null>(null)
	const [loading, setLoading] = useState(true)
	const [deleting, setDeleting] = useState(false)
	const [error, setError] = useState('')

	useEffect(() => {
		let isMounted = true

		async function loadPlan() {
			try {
				const backendUrl = getBackendUrl()
				const response = await fetch(`${backendUrl}/api/v1/plans/${planId}`, {
					headers: {
						Accept: 'application/json',
						Authorization: `Bearer ${sessionStorage.getItem('accessToken') || ''}`,
						'ngrok-skip-browser-warning': 'true',
					},
				})

				if (response.status === 404) {
					throw new Error('No se encontró el plan solicitado.')
				}

				if (!response.ok) {
					const errorText = await response.text()
					throw new Error(errorText || 'No se pudo cargar el detalle del plan.')
				}

				const data = (await response.json()) as PlanDetailResponse
				if (isMounted) {
					setPlan(data)
					setError('')
				}
			} catch (err) {
				if (isMounted) {
					setError(err instanceof Error ? err.message : 'Error desconocido')
				}
			} finally {
				if (isMounted) {
					setLoading(false)
				}
			}
		}

		void loadPlan()

		return () => {
			isMounted = false
		}
	}, [planId])

	const imageCountLabel = useMemo(() => {
		const count = plan?.images.length || 0
		return count === 1 ? '1 imagen' : `${count} imágenes`
	}, [plan?.images.length])

	async function handleDeletePlan() {
		const confirmed = window.confirm('¿Seguro que querés eliminar este plan? Esta acción no se puede deshacer.')
		if (!confirmed) {
			return
		}

		try {
			setDeleting(true)
			setError('')

			const backendUrl = getBackendUrl()
			const response = await fetch(`${backendUrl}/api/v1/plans/admin/${planId}`, {
				method: 'DELETE',
				headers: {
					Accept: 'application/json',
					Authorization: `Bearer ${sessionStorage.getItem('accessToken') || ''}`,
					'ngrok-skip-browser-warning': 'true',
				},
			})

			if (!response.ok) {
				const errorText = await response.text()
				throw new Error(errorText || 'No se pudo eliminar el plan.')
			}

			window.location.assign('/plans')
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Error desconocido')
		} finally {
			setDeleting(false)
		}
	}

	return (
		<main className="auth-card auth-card--xwide plan-detail-page">
			<div className="page-header">
				<div>
					<h1>Detalle del plan</h1>
					<p className="subtitle">Revisá todos los datos cargados para este plan.</p>
				</div>
				<div className="plan-detail-actions">
					<a className="button button--secondary" href="/plans">
						Volver a plans
					</a>
					<a className="button" href={`/plans/${planId}/edit`}>
						Editar plan
					</a>
					<button className="button button--danger" type="button" onClick={handleDeletePlan} disabled={deleting}>
						{deleting ? 'Eliminando...' : 'Eliminar plan'}
					</button>
				</div>
			</div>

			{loading && <div className="message">Cargando detalle del plan...</div>}
			{error && <div className="warning">{error}</div>}

			{!loading && !error && plan && (
				<div className="plan-detail-content">
					<section className="plan-detail-hero">
						<div className="plan-detail-heading">
							<div className="plan-badges">
								<span className="plan-badge">{getVisibilityLabel(plan.visibility)}</span>
								<span className="plan-badge plan-badge--muted">{plan.isFull ? 'Completo' : 'Cupo disponible'}</span>
							</div>
							<h2>{plan.title}</h2>
							<p className="plan-description">{plan.description || 'Sin descripción cargada.'}</p>
						</div>
						<div className="plan-detail-summary">
							<div>
								<span className="summary-label">Fecha</span>
								<strong>{formatDateTime(plan.dateTime)}</strong>
							</div>
							<div>
								<span className="summary-label">Ubicación</span>
								<strong>{plan.location}</strong>
							</div>
							<div>
								<span className="summary-label">Participantes</span>
								<strong>
									{plan.subscriberCount}
									{plan.maxSubscribers ? ` / ${plan.maxSubscribers}` : ''}
								</strong>
							</div>
							<div>
								<span className="summary-label">Autor</span>
								<strong>{plan.creatorName}</strong>
							</div>
						</div>
					</section>

					<section className="detail-card">
						<h3>Información general</h3>
						<dl className="detail-list">
							<div>
								<dt>ID</dt>
								<dd>{plan.id}</dd>
							</div>
							<div>
								<dt>Descripción</dt>
								<dd>{plan.description || 'Sin descripción.'}</dd>
							</div>
							<div>
								<dt>Duración</dt>
								<dd>{plan.durationMinutes ? `${plan.durationMinutes} minutos` : 'No definida'}</dd>
							</div>
							<div>
								<dt>Interés</dt>
								<dd>{toTitleCase(plan.interest)}</dd>
							</div>
							<div>
								<dt>Tipo de viaje</dt>
								<dd>{toTitleCase(plan.travelType)}</dd>
							</div>
							<div>
								<dt>Visibilidad</dt>
								<dd>{getVisibilityLabel(plan.visibility)}</dd>
							</div>
							<div>
								<dt>Edad mínima</dt>
								<dd>{plan.minAge ?? 'No definida'}</dd>
							</div>
							<div>
								<dt>Edad máxima</dt>
								<dd>{plan.maxAge ?? 'No definida'}</dd>
							</div>
							<div>
								<dt>Creador</dt>
								<dd>{plan.creatorName}</dd>
							</div>
							<div>
								<dt>Capacidad</dt>
								<dd>
									{plan.subscriberCount}
									{plan.maxSubscribers ? ` / ${plan.maxSubscribers}` : ''}
								</dd>
							</div>
							<div>
								<dt>Coordenadas</dt>
								<dd>
									{plan.latitude !== null && plan.longitude !== null
										? `${plan.latitude}, ${plan.longitude}`
										: 'No disponibles'}
								</dd>
							</div>
						</dl>
					</section>

					<section className="detail-card">
						<h3>Imágenes</h3>
						<p className="hint">{imageCountLabel}</p>
						{plan.images.length > 0 ? (
							<div className="plan-image-grid">
								{plan.images.map((image, index) => (
									<figure key={`${plan.id}-${index}`} className="plan-image-card">
										<img src={image} alt={`${plan.title} - imagen ${index + 1}`} />
									</figure>
								))}
							</div>
						) : (
							<div className="message">Este plan no tiene imágenes cargadas.</div>
						)}
					</section>

					<section className="detail-card detail-card--compact">
						<h3>Metadatos</h3>
						<div className="token-block">
							<div className="token-label">Creator ID: {plan.creatorId}</div>
							<div className="token-label">Estado: {plan.isFull ? 'Lleno' : 'Abierto'}</div>
						</div>
					</section>
				</div>
			)}
		</main>
	)
}