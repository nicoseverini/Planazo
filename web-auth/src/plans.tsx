import { useEffect, useState } from 'react'

import { getBackendUrl } from './config'

type PlanSummary = {
	id: number
	title: string
	creatorName: string
}

type PaginatedPlansResponse = {
	content: PlanSummary[]
	totalPages: number
	totalElements: number
	number: number
	size: number
	first: boolean
	last: boolean
}

export function PlansPage() {
	const [plans, setPlans] = useState<PlanSummary[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [page, setPage] = useState(0)
	const [totalPages, setTotalPages] = useState(0)
	const pageSize = 3

	useEffect(() => {
		let isMounted = true

		async function loadPlans() {
			try {
				const backendUrl = getBackendUrl()
				const response = await fetch(`${backendUrl}/api/v1/plans/paginated?page=${page}&size=${pageSize}`, {
					headers: {
						Accept: 'application/json',
						Authorization: `Bearer ${sessionStorage.getItem('accessToken') || ''}`,
						'ngrok-skip-browser-warning': 'true',
					},
				})

				if (!response.ok) {
					const errorText = await response.text()
					throw new Error(errorText || 'Could not load the plans.')
				}

				const data = (await response.json()) as PaginatedPlansResponse
				if (isMounted) {
					setPlans(data.content)
					setTotalPages(data.totalPages)
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

		void loadPlans()

		return () => {
			isMounted = false
		}
	}, [page])

	return (
		<main className="auth-card auth-card--xwide">
			<div className="page-header">
				<div>
					<h1>Plans</h1>
					<p className="subtitle">These are the names of the available plans.</p>
				</div>
				<a className="button button--secondary" href="/create-plan">
					Create plan
				</a>
				<a className="button button--goto" href="/turistic-places">
					Go to Tourist Places
				</a>
			</div>

			{loading && <div className="message">Loading plans...</div>}
			{error && <div className="warning">{error}</div>}

			{!loading && !error && (
				<ul className="plans-list">
					{plans.length > 0 ? (
						plans.map((plan) => (
							<li key={plan.id} className="plan-item">
								<div className="plan-title">
									<a href={`/plans/${plan.id}`}>{plan.title}</a>
								</div>
								<div className="plan-creator">{plan.creatorName}</div>
							</li>
						))
					) : (
						<li className="plan-item">
							<div className="plan-title">No available plans.</div>
						</li>
					)}
				</ul>
			)}

			{!loading && !error && totalPages > 1 && (
				<div className="plans-actions">
					<button className="button button--secondary" type="button" onClick={() => setPage((current) => Math.max(0, current - 1))} disabled={page === 0}>
						Previous
					</button>
					<div className="token-label">
						Page {page + 1} of {totalPages}
					</div>
					<button
						className="button button--secondary"
						type="button"
						onClick={() => setPage((current) => current + 1)}
						disabled={page + 1 >= totalPages}
					>
						Next
					</button>
				</div>
			)}

		</main>
	)
}