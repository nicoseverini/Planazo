import { useEffect, useState } from 'react'

import { getBackendUrl } from './config'
import { Navbar } from './components/Navbar'

type PlanSummary = {
	id: number
	title: string
	creatorName: string
	subscriberCount: number
	maxSubscribers: number | null
	budget: number | null
	visibility: 'PUBLIC' | 'PRIVATE'
	interests: string[]
	country: string,
	city: string,
	address: string,
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
	const [searchQuery, setSearchQuery] = useState('')
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

	const filteredPlans = searchQuery
		? plans.filter((plan) =>
				plan.title.toLowerCase().includes(searchQuery.toLowerCase())
			)
		: plans

	return (
		<>
			<Navbar />
			<main className="auth-card auth-card--xwide">
				<div className="page-header">
				<div>
					<h1>Plans</h1>
				</div>
				<a className="button button--secondary" href="/create-plan">
					Create plan
				</a>
			</div>

			<div className="search-bar">
				<input
					type="text"
					placeholder="Search plans by name..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="search-input"
				/>
			</div>
			{loading && <div className="message">Loading plans...</div>}
			{error && <div className="warning">{error}</div>}

			{!loading && !error && (
				<ul className="plans-list">
					{filteredPlans.length > 0 ? (
						filteredPlans.map((plan) => (
							<li key={plan.id} className="plan-item">
								 <a href={`/plans/${plan.id}`} className="plan-card-link"> 
								<div className="plan-header">
									<div className="plan-title">
										{plan.title}
									</div>
									<div className="plan-meta-inline">
										<span className="plan-subscribers" title={`${plan.subscriberCount}/${plan.maxSubscribers ?? '∞'} subscribers`}>
											<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
												<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
												<circle cx="12" cy="7" r="4"></circle>
											</svg>
											{plan.subscriberCount}/{plan.maxSubscribers ?? '∞'}
										</span>
										{plan.budget != null && (
											<span className="plan-budget" title={`Cost per Person: $${plan.budget}`}>
												<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
													<line x1="12" y1="1" x2="12" y2="23"></line>
													<path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
												</svg>
												{plan.budget}
											</span>
										)}
										<span className={`badge badge--visibility badge--${plan.visibility.toLowerCase()}`} title={plan.visibility}>
											<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
												<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
												<circle cx="12" cy="12" r="3"></circle>
											</svg>
										</span>
									</div>
								</div>
								<div className="plan-creator">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="20"
										height="20"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="1.5"
										strokeLinecap="round"
										strokeLinejoin="round"
										className="lucide lucide-circle-user-round-icon lucide-circle-user-round"
										>
										<path d="M17.925 20.056a6 6 0 0 0-11.851.001" />
										<circle cx="12" cy="11" r="4" />
										<circle cx="12" cy="12" r="10" />
									</svg>
									{plan.creatorName}
								</div>
								<div className="plan-location location-icon">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="20"
										height="20"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="1.5"
										strokeLinecap="round"
										strokeLinejoin="round"
										className="lucide lucide-map-pin-icon lucide-map-pin"
										>
										<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
										<circle cx="12" cy="10" r="3" />
									</svg>
									{plan.country}, {plan.city}, {plan.address}
								</div>
								<div className="plan-badges">
									{(plan.interests ?? []).map((interest) => (
										<span key={interest} className={`badge badge--interest badge--interest--${interest.toLowerCase()}`}>
											{interest}
										</span>
									))}
								</div>
								</a>
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
		</>
	)
}