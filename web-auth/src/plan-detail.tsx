import { useEffect, useMemo, useState } from 'react'

import { getBackendUrl } from './config'
import { formatDateTime, getVisibilityLabel, toTitleCase } from './plan-utils'
import { Navbar } from './components/Navbar'
import { DeleteConfirmationModal } from './components/DeleteConfirmationModal'

type PlanDetailResponse = {
	id: number
	title: string
	description: string
	startDateTime: string
	endDateTime: string
	durationMinutes: number | null
	visibility: 'PUBLIC' | 'PRIVATE'
	maxSubscribers: number | null
	minAge: number | null
	maxAge: number | null
	interests: string[]
	location: string
	latitude: number | null
	longitude: number | null
	images: string[]
	creatorId: number
	creatorName: string
	subscriberCount: number
	isFull: boolean
	budget: number | null
	timezone: string
}

type PlanDetailPageProps = {
	planId: number
}

export function PlanDetailPage({ planId }: PlanDetailPageProps) {
	const [plan, setPlan] = useState<PlanDetailResponse | null>(null)
	const [loading, setLoading] = useState(true)
	const [deleting, setDeleting] = useState(false)
	const [error, setError] = useState('')
	const [showDeleteModal, setShowDeleteModal] = useState(false)

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
					throw new Error('Plan not found.')
				}

				if (!response.ok) {
					const errorText = await response.text()
					throw new Error(errorText || 'Could not load plan details.')
				}

				const data = (await response.json()) as PlanDetailResponse
				if (isMounted) {
					setPlan(data)
					setError('')
				}
			} catch (err) {
				if (isMounted) {
					setError(err instanceof Error ? err.message : 'Unknown error')
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
		return count === 1 ? '1 image' : `${count} images`
	}, [plan?.images.length])

	async function handleDeletePlan(reason?: string) {
		try {
			setDeleting(true)
			setError('')
			setShowDeleteModal(false)

			const backendUrl = getBackendUrl()
			const body = reason ? JSON.stringify({ reason }) : undefined
			const response = await fetch(`${backendUrl}/api/v1/plans/admin/${planId}`, {
				method: 'DELETE',
				headers: {
					Accept: 'application/json',
					Authorization: `Bearer ${sessionStorage.getItem('accessToken') || ''}`,
					'ngrok-skip-browser-warning': 'true',
					...(body && { 'Content-Type': 'application/json' }),
				},
				body,
			})

			if (!response.ok) {
				const errorText = await response.text()
				throw new Error(errorText || 'Could not delete the plan.')
			}

			window.location.assign('/plans')
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Unknown error')
		} finally {
			setDeleting(false)
		}
	}

	return (
		<>
			<Navbar />
			<main className="auth-card auth-card--xwide plan-detail-page">
				<div className="page-header">
				<div>
					<h1>Plan Detail</h1>
					<p className="subtitle">Review all the details loaded for this plan.</p>
				</div>
				<div className="plan-detail-actions">
					<a className="button" href={`/plans/${planId}/edit`}>
						Edit Plan
					</a>
					<button className="button button--danger" type="button" onClick={() => setShowDeleteModal(true)} disabled={deleting}>
						{deleting ? 'Deleting...' : 'Delete Plan'}
					</button>
				</div>
			</div>

			{loading && <div className="message">Loading plan details...</div>}
			{error && <div className="warning">{error}</div>}

			{!loading && !error && plan && (
				<div className="plan-detail-content">
					<section className="plan-detail-hero">
						<div className="plan-detail-heading">
							<div className="plan-badges">
								<span className="plan-badge">{getVisibilityLabel(plan.visibility)}</span>
								<span className="plan-badge plan-badge--muted">{plan.isFull ? 'Full' : 'Open'}</span>
							</div>
							<h2>{plan.title}</h2>
							<p className="plan-description">{plan.description || 'No description available.'}</p>
						</div>
						<div className="plan-detail-summary">
							<div>
								<span className="summary-label">Date</span>
								<strong>{formatDateTime(plan.startDateTime, plan.timezone)}{plan.endDateTime ? ` – ${formatDateTime(plan.endDateTime, plan.timezone)}` : ''}</strong>
							</div>
							<div>
								<span className="summary-label">Location</span>
								<strong>{plan.location}</strong>
							</div>
							<div>
								<span className="summary-label">Participants</span>
								<strong>
									{plan.subscriberCount}
									{plan.maxSubscribers ? ` / ${plan.maxSubscribers}` : ''}
								</strong>
							</div>
							<div>
								<span className="summary-label">Creator</span>
								<strong>{plan.creatorName}</strong>
							</div>
						</div>
					</section>

					<section className="detail-card">
						<h3>General Information</h3>
						<dl className="detail-list">
							<div>
								<dt>ID</dt>
								<dd>{plan.id}</dd>
							</div>
							<div>
								<dt>Description</dt>
								<dd>{plan.description || 'No description available.'}</dd>
							</div>
							<div>
								<dt>Duration</dt>
								<dd>{plan.durationMinutes ? `${plan.durationMinutes} minutes` : 'Not defined'}</dd>
							</div>
							<div>
								<dt>Interests</dt>
								<dd>{plan.interests?.map((i) => toTitleCase(i)).join(', ') || 'No interests defined'}</dd>
							</div>
							<div>
								<dt>Visibility</dt>
								<dd>{getVisibilityLabel(plan.visibility)}</dd>
							</div>
							<div>
								<dt>Minimum Age</dt>
								<dd>{plan.minAge ?? 'Not defined'}</dd>
							</div>
							<div>
								<dt>Maximum Age</dt>
								<dd>{plan.maxAge ?? 'Not defined'}</dd>
							</div>
							<div>
								<dt>Creator</dt>
								<dd>{plan.creatorName}</dd>
							</div>
							<div>
								<dt>Capacity</dt>
								<dd>
									{plan.subscriberCount}
									{plan.maxSubscribers ? ` / ${plan.maxSubscribers}` : ''}
								</dd>
							</div>
							<div>
								<dt>Coordinates</dt>
								<dd>
									{plan.latitude !== null && plan.longitude !== null
										? `${plan.latitude}, ${plan.longitude}`
										: 'No coordinates provided'}
								</dd>
							</div>
							<div>
								<dt>Budget</dt>
								<dd>{plan.budget ? `$${plan.budget.toLocaleString()}` : 'Not specified'}</dd>
							</div>
						</dl>
					</section>

					<section className="detail-card">
						<h3>Images</h3>
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
							<div className="message">This plan has no images loaded.</div>
						)}
					</section>
				</div>
			)}

			<DeleteConfirmationModal
				isOpen={showDeleteModal}
				onClose={() => setShowDeleteModal(false)}
				onConfirm={handleDeletePlan}
				title="Delete Plan"
				message="Are you sure you want to delete this plan? This action cannot be undone."
				isLoading={deleting}
			/>
			</main>
		</>
	)
}