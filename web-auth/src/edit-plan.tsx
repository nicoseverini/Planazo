import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'

import { getBackendUrl } from './config'
import { PlanImagePicker } from './components/PlanImagePicker'
import { PlanFormFields } from './components/PlanFormFields'
import {
	type Interest,
	type PlanFormState,
	type PlanVisibility,
	buildDateTime,
	defaultPlanFormState,
	geocodeAddress,
	isFutureDateTime,
	parseBudget,
	parseOptionalNumber,
	splitDateTime,
	validateAgeRange,
	validateBudget,
	validateMaxSubscribers,
} from './plan-shared'

type PlanDetailResponse = {
	title: string
	description: string
	startDateTime: string
	endDateTime: string
	durationMinutes: number | null
	visibility: PlanVisibility
	maxSubscribers: number | null
	minAge: number | null
	maxAge: number | null
	interests: Interest[]
	location: string
	country: string | null
	city: string | null
	address: string | null
	latitude: number | null
	longitude: number | null
	images: string[]
	budget: number | null
	timezone: string
}

function toFormState(plan: PlanDetailResponse): PlanFormState {
	const tz = plan.timezone || 'UTC'
	const { date: startDate, time: startTime } = splitDateTime(plan.startDateTime, tz)
	const { date: endDate, time: endTime } = splitDateTime(plan.endDateTime ?? '', tz)

	return {
		title: plan.title,
		description: plan.description ?? '',
		startDate,
		startTime,
		endDate,
		endTime,
		visibility: plan.visibility,
		maxSubscribers: plan.maxSubscribers?.toString() ?? '',
		minAge: plan.minAge?.toString() ?? '',
		maxAge: plan.maxAge?.toString() ?? '',
		interests: plan.interests,
		country: plan.country ?? '',
		city: plan.city ?? '',
		address: plan.address ?? plan.location ?? '',
		latitude: plan.latitude?.toString() ?? '',
		longitude: plan.longitude?.toString() ?? '',
		budget: plan.budget ? plan.budget.toString() : '',
		timezone: tz,
	}
}

export function EditPlanPage({ planId }: { planId: number }) {
	const [form, setForm] = useState<PlanFormState>({ ...defaultPlanFormState })
	const [images, setImages] = useState<string[]>([])
	const [status, setStatus] = useState<'idle' | 'saving' | 'error'>('idle')
	const [message, setMessage] = useState('')
	const [loadingPlan, setLoadingPlan] = useState(true)
	const [hasAccessToken, setHasAccessToken] = useState(() => Boolean(sessionStorage.getItem('accessToken')))

	useEffect(() => {
		const token = sessionStorage.getItem('accessToken')
		if (!token) {
			window.location.replace('/')
			return
		}

		setHasAccessToken(true)
	}, [])

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
					throw new Error('The plan you are trying to edit was not found.')
				}

				if (!response.ok) {
					const errorText = await response.text()
					throw new Error(errorText || 'Failed to load the plan.')
				}

				const data = (await response.json()) as PlanDetailResponse
				if (isMounted) {
					setForm(toFormState(data))
					setImages([...data.images])
					setStatus('idle')
					setMessage('')
				}
			} catch (err) {
				if (isMounted) {
					setStatus('error')
					setMessage(err instanceof Error ? err.message : 'Unknown error')
				}
			} finally {
				if (isMounted) {
					setLoadingPlan(false)
				}
			}
		}

		void loadPlan()

		return () => {
			isMounted = false
		}
	}, [planId])

	function updateField<K extends keyof PlanFormState>(key: K, value: PlanFormState[K]) {
		setForm((current) => ({ ...current, [key]: value }))
	}

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault()

		const accessToken = sessionStorage.getItem('accessToken')
		if (!accessToken) {
			setStatus('error')
			setMessage('No active session. Please log in as an admin first.')
			return
		}

		const startDateTime = buildDateTime(form.startDate, form.startTime, form.timezone)
		const endDateTime = buildDateTime(form.endDate, form.endTime, form.timezone)

		if (!form.title.trim() || !startDateTime || !endDateTime) {
			setStatus('error')
			setMessage('Title, start date/time, and end date/time are required.')
			return
		}
		if (!form.country.trim()) {
			setStatus('error')
			setMessage('Country is required.')
			return
		}
		if (!form.city.trim()) {
			setStatus('error')
			setMessage('City is required.')
			return
		}
		if (!form.address.trim()) {
			setStatus('error')
			setMessage('Address is required.')
			return
		}

		if (!isFutureDateTime(startDateTime)) {
			setStatus('error')
			setMessage('The start date and time must be in the future.')
			return
		}

		if (endDateTime <= startDateTime) {
			setStatus('error')
			setMessage('End date/time must be after start date/time.')
			return
		}

		if (form.interests.length === 0) {
			setStatus('error')
			setMessage('Please select at least one interest.')
			return
		}

		const ageError = validateAgeRange(form.minAge, form.maxAge)
		if (ageError) {
			setStatus('error')
			setMessage(ageError)
			return
		}

		const maxSubscribersError = validateMaxSubscribers(form.maxSubscribers)
		if (maxSubscribersError) {
			setStatus('error')
			setMessage(maxSubscribersError)
			return
		}

		const budgetError = validateBudget(form.budget)
		if (budgetError) {
			setStatus('error')
			setMessage(budgetError)
			return
		}

		setStatus('saving')
		setMessage('')

		try {
			let latitude = form.latitude.trim() ? Number(form.latitude) : NaN
			let longitude = form.longitude.trim() ? Number(form.longitude) : NaN

			if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
				const coords = await geocodeAddress(form.address, form.city, form.country)
				if (!coords) {
					setStatus('error')
					setMessage('Could not find coordinates for this address. Please be more specific (e.g. add street number, city, and country).')
					return
				}
				latitude = coords.lat
				longitude = coords.lng
			}

			const backendUrl = getBackendUrl()
			const response = await fetch(`${backendUrl}/api/v1/plans/admin/${planId}`, {
				method: 'PATCH',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
					Authorization: `Bearer ${accessToken}`,
					'ngrok-skip-browser-warning': 'true',
				},
				body: JSON.stringify({
					title: form.title.trim(),
					description: form.description.trim() || null,
					startDateTime,
					endDateTime,
					timezone: form.timezone,
					visibility: form.visibility,
					maxSubscribers: Number.parseInt(form.maxSubscribers, 10),
					minAge: parseOptionalNumber(form.minAge),
					maxAge: parseOptionalNumber(form.maxAge),
					interests: form.interests,
					country: form.country.trim(),
					city: form.city.trim(),
					address: form.address.trim(),
					latitude,
					longitude,
					images,
					budget: parseBudget(form.budget),
				}),
			})

			if (!response.ok) {
				const errorText = await response.text()
				throw new Error(errorText || 'Failed to save the plan.')
			}

			window.location.assign(`/plans/${planId}`)
		} catch (err) {
			setStatus('error')
			setMessage(err instanceof Error ? err.message : 'Unknown error')
		} finally {
			setStatus((current) => (current === 'saving' ? 'idle' : current))
		}
	}

	if (!hasAccessToken) {
		return null
	}

	if (loadingPlan) {
		return (
			<main className="auth-card auth-card--xwide">
				<div className="message">Loading plan...</div>
			</main>
		)
	}

	return (
		<main className="auth-card auth-card--xwide">
			<div className="page-header">
				<div>
					<h1>Edit Plan</h1>
					<p className="subtitle">Edit the plan details and manage its images.</p>
				</div>
				<a className="button button--secondary" href={`/plans/${planId}`}>
					Back to Details
				</a>
			</div>

			<form className="form-stack create-plan-form" onSubmit={handleSubmit}>
				<PlanFormFields form={form} onChange={updateField} />

				<PlanImagePicker images={images} onChange={setImages} hint="New images will be added when saving." />

				{status === 'error' && <div className="warning">{message}</div>}

				<button className="button create-plan-submit" type="submit" disabled={status === 'saving'}>
					{status === 'saving' ? 'Saving...' : 'Save Changes'}
				</button>
			</form>
		</main>
	)
}
