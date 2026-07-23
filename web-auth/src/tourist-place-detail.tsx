import { useEffect, useMemo, useState } from 'react'

import { getBackendUrl } from './config'
import { toTitleCase } from './plan-utils'
import type { TouristPlaceDetailResponse } from './tourist-place-shared'
import { Navbar } from './components/Navbar'
import { DeleteConfirmationModal } from './components/DeleteConfirmationModal'

function formatAgeRestriction(minAge: number | null, maxAge: number | null): string {
	const hasMin = minAge != null
	const hasMax = maxAge != null && maxAge !== 0
	if (hasMin && hasMax) return `Allowed age range: ${minAge}–${maxAge} years.`
	if (hasMin) return `Only visitors aged ${minAge} or older are allowed.`
	if (hasMax) return `Visitors must be ${maxAge} years old or younger.`
	return 'No age restrictions.'
}

function formatLocation(place: TouristPlaceDetailResponse): string {
	const structured = [place.address, place.city, place.state, place.country].filter(Boolean).join(', ')
	return structured || place.location || 'Not available'
}

type TouristPlaceDetailPageProps = {
	placeId: number
}

export function TouristPlaceDetailPage({ placeId }: TouristPlaceDetailPageProps) {
	const [place, setPlace] = useState<TouristPlaceDetailResponse | null>(null)
	const [loading, setLoading] = useState(true)
	const [deleting, setDeleting] = useState(false)
	const [error, setError] = useState('')
	const [showDeleteModal, setShowDeleteModal] = useState(false)

	useEffect(() => {
		let isMounted = true

		async function loadPlace() {
			try {
				const backendUrl = getBackendUrl()
				const response = await fetch(`${backendUrl}/api/v1/tourist-places/${placeId}`, {
					headers: {
						Accept: 'application/json',
						Authorization: `Bearer ${sessionStorage.getItem('accessToken') || ''}`,
						'ngrok-skip-browser-warning': 'true',
					},
				})

				if (response.status === 404) {
					throw new Error('The tourist place was not found.')
				}

				if (!response.ok) {
					const errorText = await response.text()
					throw new Error(errorText || 'The tourist place could not be loaded.')
				}

				const data = (await response.json()) as TouristPlaceDetailResponse
				if (isMounted) {
					setPlace(data)
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

		void loadPlace()

		return () => {
			isMounted = false
		}
	}, [placeId])

	const imageCountLabel = useMemo(() => {
		const count = place?.images.length || 0
		return count === 1 ? '1 image' : `${count} images`
	}, [place?.images.length])

	async function handleDeletePlace(reason?: string) {
		try {
			setDeleting(true)
			setError('')
			setShowDeleteModal(false)

			const backendUrl = getBackendUrl()
			const body = reason ? JSON.stringify({ reason }) : undefined
			const response = await fetch(`${backendUrl}/api/v1/tourist-places/admin/${placeId}`, {
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
				throw new Error(errorText || 'The tourist place could not be deleted.')
			}

			window.location.assign('/tourist-places')
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Unknown error')
		} finally {
			setDeleting(false)
		}
	}

	const hasAdminAccess = !!sessionStorage.getItem('accessToken')

	return (
		<>
			<Navbar />
			<main className="auth-card auth-card--xwide plan-detail-page">
				<div className="page-header">
				<div>
					<h1>Detail of Tourist Place</h1>
					<p className="subtitle">Review all the loaded data for this tourist place.</p>
				</div>
				<div className="plan-detail-actions">
					{hasAdminAccess && (
						<>
							<a className="button" href={`/tourist-places/${placeId}/edit`}>
								Edit Place
							</a>
							<button className="button button--danger" type="button" onClick={() => setShowDeleteModal(true)} disabled={deleting}>
								{deleting ? 'Deleting...' : 'Delete Place'}
							</button>
						</>
					)}
				</div>
			</div>

			{loading && <div className="message">Loading tourist place details...</div>}
			{error && <div className="warning">{error}</div>}

			{!loading && !error && place && (
				<div className="plan-detail-content">
					<section className="plan-detail-hero">
						<div className="plan-detail-heading">
							<div className="plan-badges">
								{(place.interests ?? []).map((interest) => (
									<span key={interest} className="plan-badge">{toTitleCase(interest)}</span>
								))}
								<span className="plan-badge plan-badge--muted">{formatLocation(place)}</span>
							</div>
							<h2>{place.name}</h2>
							{place.description && <p className="plan-description">{place.description}</p>}
						</div>
						<div className="plan-detail-summary">
							{place.cost != null && (
								<div>
									<span className="summary-label">Cost</span>
									<strong>${place.cost}</strong>
								</div>
							)}
							<div>
								<span className="summary-label">Location</span>
								<strong>{formatLocation(place)}</strong>
							</div>
						</div>
					</section>

					<section className="detail-card">
						<h3>General Information</h3>
						<dl className="detail-list">
							<div>
								<dt>Categories</dt>
								<dd>
									{(place.interests ?? []).length > 0
										? (place.interests ?? []).map((i) => toTitleCase(i)).join(', ')
										: '—'}
								</dd>
							</div>
							<div>
								<dt>Age restrictions</dt>
								<dd>{formatAgeRestriction(place.minAge, place.maxAge)}</dd>
							</div>
							<div>
								<dt>Coordinates</dt>
								<dd>
									{place.latitude !== null && place.longitude !== null
										? `${place.latitude}, ${place.longitude}`
										: 'Not available'}
								</dd>
							</div>
							{place.cost != null && (
								<div>
									<dt>Cost</dt>
									<dd>${place.cost}</dd>
								</div>
							)}
						</dl>
					</section>

					<section className="detail-card">
						<h3>Images</h3>
						<p className="hint">{imageCountLabel}</p>
						{place.images.length > 0 ? (
							<div className="plan-image-grid">
								{place.images.map((image, index) => (
									<figure key={`${place.id}-${index}`} className="plan-image-card">
										<img src={image} alt={`${place.name} - image ${index + 1}`} />
									</figure>
								))}
							</div>
						) : (
							<div className="message">This tourist place has no images loaded.</div>
						)}
					</section>
				</div>
			)}

			<DeleteConfirmationModal
				isOpen={showDeleteModal}
				onClose={() => setShowDeleteModal(false)}
				onConfirm={handleDeletePlace}
				title="Delete Tourist Place"
				message="Are you sure you want to delete this tourist place? This action cannot be undone."
				isLoading={deleting}
			/>
			</main>
		</>
	)
}
