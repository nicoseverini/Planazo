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
					throw new Error(errorText || 'No se pudieron cargar los lugares turísticos.')
				}

				const data = (await response.json()) as TuristicPlaceSummaryResponse[]
				if (isMounted) {
					setPlaces(data)
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
					<p className="subtitle">Estos son los lugares turísticos disponibles.</p>
				</div>
				{hasAdminAccess && (
					<a className="button button--secondary" href="/create-turistic-place">
						Crear lugar turístico
					</a>
				)}
				<a className="button button--goto" href="/plans">
						Ir a Planes
				</a>
			</div>

			{loading && <div className="message">Cargando lugares turísticos...</div>}
			{error && <div className="warning">{error}</div>}

			{!loading && !error && (
				<ul className="plans-list">
					{places.length > 0 ? (
						places.map((place) => (
							<li key={place.id} className="plan-item">
								<div className="plan-title">
									<a href={`/turistic-places/${place.id}`}>{place.name}</a>
								</div>
								<div className="plan-creator">{toTitleCase(place.interest)} · {place.location}</div>
								<div className="plan-meta">Costo: {place.cost}</div>
								<div className="plan-item-actions">
									<a className="button button--secondary" href={`/turistic-places/${place.id}`}>
										Ver detalles
									</a>
								</div>
							</li>
						))
					) : (
						<li className="plan-item">
							<div className="plan-title">No hay lugares turísticos disponibles.</div>
						</li>
					)}
				</ul>
			)}
		</main>
	)
}