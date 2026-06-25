import { useEffect, useState } from 'react'

import { getBackendUrl } from './config'
import { Navbar } from './components/Navbar'
import { DeleteConfirmationModal } from './components/DeleteConfirmationModal'

type UserProfile = {
	id: number
	email: string
	name: string
	lastname: string
	photo: string | null
	gender: string | null
	birthDate: string | null
	interests: string[]
	travelType: string | null
	languages: string[]
	preferredLanguage: string | null
}

type PlanSummary = {
	id: number
	title: string
	startDateTime: string
	endDateTime: string | null
	location: string
	visibility: string
	subscriberCount: number
	isFull: boolean
}

type TouristPlaceSummary = {
	id: number
	name: string
	city: string
	country: string
	averageRating: number | null
	reviewCount: number
}

type Review = {
	id: number
	rating: number
	comment: string | null
	targetType: string
	targetId: number
	createdAt: string
	author: {
		id: number
		name: string
		lastname: string
		photo: string | null
	}
}

type UserProfilePageProps = {
	userId: number
}

export function UserProfilePage({ userId }: UserProfilePageProps) {
	const [user, setUser] = useState<UserProfile | null>(null)
	const [plans, setPlans] = useState<PlanSummary[]>([])
	const [places, setPlaces] = useState<TouristPlaceSummary[]>([])
	const [reviews, setReviews] = useState<Review[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [deleting, setDeleting] = useState(false)
	const [showDeleteModal, setShowDeleteModal] = useState(false)

	useEffect(() => {
		async function loadUserData() {
			try {
				const backendUrl = getBackendUrl()
				const token = sessionStorage.getItem('accessToken') || ''

				// Load user profile
				const profileResponse = await fetch(`${backendUrl}/api/v1/users/profile/${userId}`, {
					headers: {
						Accept: 'application/json',
						Authorization: `Bearer ${token}`,
						'ngrok-skip-browser-warning': 'true',
					},
				})

				if (!profileResponse.ok) {
					throw new Error('User not found')
				}

				const profileData = (await profileResponse.json()) as UserProfile
				setUser(profileData)

				// Load user's plans
				const plansResponse = await fetch(`${backendUrl}/api/v1/plans/user/${userId}/created`, {
					headers: {
						Accept: 'application/json',
						Authorization: `Bearer ${token}`,
						'ngrok-skip-browser-warning': 'true',
					},
				})

				if (plansResponse.ok) {
					const plansData = (await plansResponse.json()) as PlanSummary[]
					setPlans(plansData)
				}

				// Load user's tourist places
				const placesResponse = await fetch(`${backendUrl}/api/v1/tourist-places/user/${userId}`, {
					headers: {
						Accept: 'application/json',
						Authorization: `Bearer ${token}`,
						'ngrok-skip-browser-warning': 'true',
					},
				})

				if (placesResponse.ok) {
					const placesData = (await placesResponse.json()) as TouristPlaceSummary[]
					setPlaces(placesData)
				}

				// Load user's reviews
				const reviewsResponse = await fetch(`${backendUrl}/api/v1/reviews/user/${userId}`, {
					headers: {
						Accept: 'application/json',
						Authorization: `Bearer ${token}`,
						'ngrok-skip-browser-warning': 'true',
					},
				})

				if (reviewsResponse.ok) {
					const reviewsData = (await reviewsResponse.json()) as Review[]
					setReviews(reviewsData)
				}

				setError('')
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Unknown error')
			} finally {
				setLoading(false)
			}
		}

		loadUserData()
	}, [userId])

	async function handleDeleteUser(reason?: string) {
		try {
			setDeleting(true)
			setError('')
			setShowDeleteModal(false)

			const backendUrl = getBackendUrl()
			const body = reason ? JSON.stringify({ reason }) : undefined
			const response = await fetch(`${backendUrl}/api/v1/users/admin/delete/${userId}`, {
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
				throw new Error(errorText || 'Could not delete the user.')
			}

			window.location.assign('/reports')
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Unknown error')
		} finally {
			setDeleting(false)
		}
	}

	if (loading) {
		return (
			<>
				<Navbar />
				<main className="auth-card">
					<div className="message">Loading user profile...</div>
				</main>
			</>
		)
	}

	if (error || !user) {
		return (
			<>
				<Navbar />
				<main className="auth-card">
					<div className="warning">{error || 'User not found'}</div>
				</main>
			</>
		)
	}

	return (
		<>
			<Navbar />
			<main className="auth-card auth-card--xwide">
				<div className="page-header">
					<div>
						<h1>User Profile</h1>
						<p className="subtitle">View user details and activity</p>
					</div>
					<button
						className="button button--danger"
						type="button"
						onClick={() => setShowDeleteModal(true)}
						disabled={deleting}
					>
						{deleting ? 'Deleting...' : 'Delete User'}
					</button>
				</div>

				{error && <div className="warning">{error}</div>}

				<div className="user-profile">
					<section className="user-info">
						<div className="user-header">
							{user.photo ? (
								<img src={user.photo} alt="" className="user-avatar" />
							) : (
								<div className="user-avatar user-avatar--placeholder">
									{user.name[0]}{user.lastname[0]}
								</div>
							)}
							<div className="user-details">
								<h2 className="user-name">{user.name} {user.lastname}</h2>
								<p className="user-email">{user.email}</p>
								<div className="user-badges">
									{user.gender && <span className="badge badge--info">{user.gender}</span>}
									{user.travelType && <span className="badge badge--primary">{user.travelType}</span>}
								</div>
							</div>
						</div>

						<div className="user-stats">
							{user.birthDate && (
								<div className="stat-item">
									<span className="stat-label">Birth Date</span>
									<span className="stat-value">{new Date(user.birthDate).toLocaleDateString()}</span>
								</div>
							)}
							<div className="stat-item">
								<span className="stat-label">Languages</span>
								<span className="stat-value">{user.languages.length > 0 ? user.languages.join(', ') : 'Not specified'}</span>
							</div>
						</div>

						{user.interests.length > 0 && (
							<div className="user-interests">
								<h3>Interests</h3>
								<div className="interests-tags">
									{user.interests.map((interest, index) => (
										<span key={index} className="interest-tag">{interest}</span>
									))}
								</div>
							</div>
						)}
					</section>

					<section className="user-plans">
						<h2>Plans Created</h2>
						{plans.length === 0 ? (
							<div className="message">No plans created by this user.</div>
						) : (
							<div className="plans-list">
								{plans.map((plan) => (
									<div key={plan.id} className="plan-card">
										<a href={`/plans/${plan.id}`} className="link">
											<strong>{plan.title}</strong>
										</a>
										<div className="plan-meta">
											<span>Subscribers: {plan.subscriberCount}</span>
											<span>{plan.visibility}</span>
										</div>
									</div>
								))}
							</div>
						)}
					</section>

					<section className="user-places">
						<h2>Tourist Places Created</h2>
						{places.length === 0 ? (
							<div className="message">No tourist places created by this user.</div>
						) : (
							<div className="places-list">
								{places.map((place) => (
									<div key={place.id} className="place-card">
										<a href={`/tourist-places/${place.id}`} className="link">
											<strong>{place.name}</strong>
										</a>
										<div className="place-meta">
											<span>{place.city}, {place.country}</span>
											{place.averageRating && <span>Rating: {place.averageRating.toFixed(1)}</span>}
										</div>
									</div>
								))}
							</div>
						)}
					</section>

					<section className="user-reviews">
						<h2>Reviews Given</h2>
						{reviews.length === 0 ? (
							<div className="message">No reviews by this user.</div>
						) : (
							<div className="reviews-list">
								{reviews.map((review) => (
									<div key={review.id} className="review-card">
										<div className="review-rating">Rating: {review.rating}/5</div>
										{review.comment && <div className="review-comment">{review.comment}</div>}
										<div className="review-target">
											Target: {review.targetType} #{review.targetId}
										</div>
									</div>
								))}
							</div>
						)}
					</section>
				</div>

				<DeleteConfirmationModal
					isOpen={showDeleteModal}
					onClose={() => setShowDeleteModal(false)}
					onConfirm={handleDeleteUser}
					title="Delete User"
					message={`Are you sure you want to delete user "${user.name} ${user.lastname}"? This action cannot be undone.`}
					isLoading={deleting}
				/>
			</main>
		</>
	)
}
