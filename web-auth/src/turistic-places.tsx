import { useEffect, useState } from 'react'

import { getBackendUrl } from './config'
import { toTitleCase } from './plan-utils'
import type { TuristicPlaceSummaryResponse } from './turistic-place-shared'

export function TuristicPlacesPage() {
	const [places, setPlaces] = useState<TuristicPlaceSummaryResponse[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [page] = useState(0)

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

	return (
		<main className="auth-card auth-card--xwide">
			<div className="page-header">
				<div>
					<h1>Turistic Places</h1>
					<p className="subtitle">These are the available turistic places.</p>
				</div>
				{hasAdminAccess && (
					<a className="button button--secondary" href="/create-turistic-place">
						Create turistic place
					</a>
				)}
				<a className="button button--goto" href="/plans">
						Go to Plans
				</a>
			</div>

			{loading && <div className="message">Loading turistic places...</div>}
			{error && <div className="warning">{error}</div>}

			{!loading && !error && (
				<ul className="plans-list">
					{places.length > 0 ? (
						places.map((place) => (
							<li key={place.id} className="plan-item">
								<div className="plan-title">
									<a href={`/turistic-places/${place.id}`}>{place.name}</a>
								</div>
								<div className="plan-creator">
									{(place.interests ?? []).map((i) => toTitleCase(i)).join(', ') || '—'}
									{' · '}
									{[place.address, place.city, place.country].filter(Boolean).join(', ') || place.location || '—'}
								</div>
								{place.cost != null && <div className="plan-meta">Cost: ${place.cost}</div>}
								<div className="plan-item-actions">
									<a className="button button--secondary" href={`/turistic-places/${place.id}`}>
										View details
									</a>
								</div>
							</li>
						))
					) : (
						<li className="plan-item">
							<div className="plan-title">No available turistic places.</div>
						</li>
					)}
				</ul>
			)}
		</main>
	)
}