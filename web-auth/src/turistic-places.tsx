import { useEffect, useState } from 'react'

import { getBackendUrl } from './config'
import { toTitleCase } from './plan-utils'
import type { TuristicPlaceSummaryResponse } from './turistic-place-shared'
import { Navbar } from './components/Navbar'

export function TuristicPlacesPage() {
	const [places, setPlaces] = useState<TuristicPlaceSummaryResponse[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [page, setPage] = useState(0)
	const [searchQuery, setSearchQuery] = useState('')
	const pageSize = 3

	useEffect(() => {
		let isMounted = true

		async function loadPlaces() {
			try {
				const backendUrl = getBackendUrl()
				const response = await fetch(`${backendUrl}/api/v1/turistic-places`, {
					headers: {
						Accept: 'application/json',
						'ngrok-skip-browser-warning': 'true',
					},
				})

				if (!response.ok) {
					const errorText = await response.text()
					throw new Error(errorText || 'Could not load turistic places.')
				}

				const data = (await response.json()) as TuristicPlaceSummaryResponse[]
				if (isMounted) {
					setPlaces(data)
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

		void loadPlaces()

		return () => {
			isMounted = false
		}
	}, [page])

	const hasAdminAccess = !!sessionStorage.getItem('accessToken')

	const filteredPlaces = searchQuery
		? places.filter((place) =>
				place.name.toLowerCase().includes(searchQuery.toLowerCase())
			)
		: places

	const totalPages = Math.ceil(filteredPlaces.length / pageSize)
	const paginatedPlaces = filteredPlaces.slice(page * pageSize, (page + 1) * pageSize)

	return (
		<>
			<Navbar />
			<main className="auth-card auth-card--xwide">
				<div className="page-header">
				<div>
					<h1>Turistic Places</h1>
				</div>
				{hasAdminAccess && (
					<a className="button button--secondary" href="/create-turistic-place">
						Create turistic place
					</a>
				)}
			</div>

			<div className="search-bar">
				<input
					type="text"
					placeholder="Search turistic places by name..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="search-input"
				/>
			</div>

			{loading && <div className="message">Loading turistic places...</div>}
			{error && <div className="warning">{error}</div>}

			{!loading && !error && (
				<ul className="plans-list">
					{paginatedPlaces.length > 0 ? (
						paginatedPlaces.map((place) => (
							<li key={place.id} className="plan-item">
								<a href={`/turistic-places/${place.id}`} className="plan-card-link">
								<div className="plan-header">
									<div className="plan-title">
										{place.name}
									</div>
									<div className="plan-meta-inline">
										{place.cost != null && (
											<span className="plan-budget" title={`Cost: $${place.cost}`}>
												<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
													<line x1="12" y1="1" x2="12" y2="23"></line>
													<path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
												</svg>
												{place.cost}
											</span>
										)}
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
									{place.creatorName}
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
									{place.country}, {place.city}, {place.address}
								</div>
								<div className="plan-badges">
									{(place.interests ?? []).map((interest) => (
										<span key={interest} className={`badge badge--interest badge--interest--${interest.toLowerCase()}`}>
											{toTitleCase(interest)}
										</span>
									))}
								</div>
								</a>
							</li>
						))
					) : (
						<li className="plan-item">
							<div className="plan-title">No available turistic places.</div>
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