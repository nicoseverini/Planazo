import { useEffect, useMemo, useState } from 'react'

import { getBackendUrl } from './config'
import { toTitleCase } from './plan-utils'
import type { TuristicPlaceDetailResponse } from './turistic-place-shared'

type TuristicPlaceDetailPageProps = {
	placeId: number
}

export function TuristicPlaceDetailPage({ placeId }: TuristicPlaceDetailPageProps) {
	const [place, setPlace] = useState<TuristicPlaceDetailResponse | null>(null)
	const [loading, setLoading] = useState(true)
	const [deleting, setDeleting] = useState(false)
	const [error, setError] = useState('')

	useEffect(() => {
		let isMounted = true

		async function loadPlace() {
			try {
				const backendUrl = getBackendUrl()
				const response = await fetch(`${backendUrl}/api/v1/turistic-places/${placeId}`, {
					headers: {
						Accept: 'application/json',
						Authorization: `Bearer ${sessionStorage.getItem('accessToken') || ''}`,
						'ngrok-skip-browser-warning': 'true',
					},
				})

				if (response.status === 404) {
					throw new Error('No se encontró el lugar turístico solicitado.')
				}

				if (!response.ok) {
					const errorText = await response.text()
					throw new Error(errorText || 'No se pudo cargar el detalle del lugar turístico.')
				}

				const data = (await response.json()) as TuristicPlaceDetailResponse
				if (isMounted) {
					setPlace(data)
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

		void loadPlace()

		return () => {
			isMounted = false
		}
	}, [placeId])

	const imageCountLabel = useMemo(() => {
		const count = place?.images.length || 0
		return count === 1 ? '1 imagen' : `${count} imágenes`
	}, [place?.images.length])

	async function handleDeletePlace() {
		const confirmed = window.confirm('¿Seguro que querés eliminar este lugar turístico? Esta acción no se puede deshacer.')
		if (!confirmed) {
			return
		}

		try {
			setDeleting(true)
			setError('')

			const backendUrl = getBackendUrl()
			const response = await fetch(`${backendUrl}/api/v1/turistic-places/${placeId}`, {
				method: 'DELETE',
				headers: {
					Accept: 'application/json',
					Authorization: `Bearer ${sessionStorage.getItem('accessToken') || ''}`,
					'ngrok-skip-browser-warning': 'true',
				},
			})

			if (!response.ok) {
				const errorText = await response.text()
				throw new Error(errorText || 'No se pudo eliminar el lugar turístico.')
			}

			window.location.assign('/turistic-places')
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Error desconocido')
		} finally {
			setDeleting(false)
		}
	}

	const hasAdminAccess = !!sessionStorage.getItem('accessToken')

	return (
		<main className="auth-card auth-card--xwide plan-detail-page">
			<div className="page-header">
				<div>
					<h1>Detalle del lugar turístico</h1>
					<p className="subtitle">Revisá todos los datos cargados para este lugar turístico.</p>
				</div>
				<div className="plan-detail-actions">
					<a className="button button--secondary" href="/turistic-places">
						Volver a turistic places
					</a>
					{hasAdminAccess && (
						<>
							<a className="button" href={`/turistic-places/${placeId}/edit`}>
								Editar lugar
							</a>
							<button className="button button--danger" type="button" onClick={handleDeletePlace} disabled={deleting}>
								{deleting ? 'Eliminando...' : 'Eliminar lugar'}
							</button>
						</>
					)}
				</div>
			</div>

			{loading && <div className="message">Cargando detalle del lugar turístico...</div>}
			{error && <div className="warning">{error}</div>}

			{!loading && !error && place && (
				<div className="plan-detail-content">
					<section className="plan-detail-hero">
						<div className="plan-detail-heading">
							<div className="plan-badges">
								<span className="plan-badge">{toTitleCase(place.interest)}</span>
								<span className="plan-badge plan-badge--muted">{place.location}</span>
							</div>
							<h2>{place.name}</h2>
							<p className="plan-description">Lugar turístico con coordenadas, rango etario e imágenes asociadas.</p>
						</div>
						<div className="plan-detail-summary">
							<div>
								<span className="summary-label">Costo</span>
								<strong>{place.cost}</strong>
							</div>
							<div>
								<span className="summary-label">Ubicación</span>
								<strong>{place.location}</strong>
							</div>
						</div>
					</section>

					<section className="detail-card">
						<h3>Información general</h3>
						<dl className="detail-list">
							<div>
								<dt>ID</dt>
								<dd>{place.id}</dd>
							</div>
							<div>
								<dt>Interés</dt>
								<dd>{toTitleCase(place.interest)}</dd>
							</div>
							<div>
								<dt>Edad mínima</dt>
								<dd>{place.minAge ?? 'No definida'}</dd>
							</div>
							<div>
								<dt>Edad máxima</dt>
								<dd>{place.maxAge ?? 'No definida'}</dd>
							</div>
							<div>
								<dt>Coordenadas</dt>
								<dd>
									{place.latitude !== null && place.longitude !== null ? `${place.latitude}, ${place.longitude}` : 'No disponibles'}
								</dd>
							</div>
							<div>
								<dt>Costo</dt>
								<dd>{place.cost}</dd>
							</div>
						</dl>
					</section>

					<section className="detail-card">
						<h3>Imágenes</h3>
						<p className="hint">{imageCountLabel}</p>
						{place.images.length > 0 ? (
							<div className="plan-image-grid">
								{place.images.map((image, index) => (
									<figure key={`${place.id}-${index}`} className="plan-image-card">
										<img src={image} alt={`${place.name} - imagen ${index + 1}`} />
									</figure>
								))}
							</div>
						) : (
							<div className="message">Este lugar turístico no tiene imágenes cargadas.</div>
						)}
					</section>
				</div>
			)}
		</main>
	)
}