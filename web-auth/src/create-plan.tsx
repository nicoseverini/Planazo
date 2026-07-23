import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'

import { getBackendUrl } from './config'
import { PlanImagePicker } from './components/PlanImagePicker'
import { PlanFormFields } from './components/PlanFormFields'
import { Navbar } from './components/Navbar'
import {
	type PlanFormState,
	buildDateTime,
	defaultPlanFormState,
	geocodeAddress,
	isFutureDateTime,
	parseBudget,
	parseOptionalNumber,
	validateAgeRange,
	validateBudget,
	validateMaxSubscribers,
} from './plan-shared'

type CreatePlanResponse = {
	id: number
	title: string
}

export function CreatePlanPage() {
	const { t } = useTranslation()
	const [form, setForm] = useState<PlanFormState>({ ...defaultPlanFormState })
	const [images, setImages] = useState<string[]>([])
	const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
	const [message, setMessage] = useState('')
	const [hasAccessToken, setHasAccessToken] = useState(() => Boolean(sessionStorage.getItem('accessToken')))

	useEffect(() => {
		const token = sessionStorage.getItem('accessToken')
		if (!token) {
			window.location.replace('/')
			return
		}

		setHasAccessToken(true)
	}, [])

	function updateField<K extends keyof PlanFormState>(key: K, value: PlanFormState[K]) {
		setForm((current) => ({ ...current, [key]: value }))
	}

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault()

		const accessToken = sessionStorage.getItem('accessToken')
		if (!accessToken) {
			setStatus('error')
			setMessage(t('error_no_access_token'))
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
		if (!form.state.trim()) {
			setStatus('error')
			setMessage('State is required.')
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

		if (startDateTime && endDateTime) {
			const start = new Date(startDateTime).getTime();
			const end   = new Date(endDateTime).getTime();

			if (end <= start) {
				setStatus('error');
				setMessage('The end date and time must be after the start date and time.');
				return;
			}
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

		setStatus('loading')
		setMessage('')

		try {
			let latitude = form.latitude.trim() ? Number(form.latitude) : NaN
			let longitude = form.longitude.trim() ? Number(form.longitude) : NaN

			if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
				const coords = await geocodeAddress(form.address, form.city, form.state, form.country)
				latitude = coords.lat
				longitude = coords.lng
			}

			const backendUrl = getBackendUrl()
			const response = await fetch(`${backendUrl}/api/v1/plans`, {
				method: 'POST',
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
					state: form.state.trim(),
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
				throw new Error(errorText || 'Could not create the plan.')
			}

			const data = (await response.json()) as CreatePlanResponse
			setStatus('success')
			setMessage(`Plan created successfully: ${data.title}`)
			setForm({ ...defaultPlanFormState })
			setImages([])
		} catch (err) {
			setStatus('error')
			setMessage(err instanceof Error ? err.message : 'Unknown error')
		}
	}

	if (!hasAccessToken) {
		return null
	}

	return (
		<>
			<Navbar />
			<main className="auth-card auth-card--xwide">
				<div className="page-header">
				<div>
					<h1>Create Plan</h1>
					<p className="subtitle">Form for admins to create a new plan.</p>
				</div>
			</div>

			<form className="form-stack create-plan-form" onSubmit={handleSubmit}>
				<PlanFormFields form={form} onChange={updateField} />

				<PlanImagePicker images={images} onChange={setImages} />

				{status === 'error' && <div className="warning">{message}</div>}
				{status === 'success' && <div className="message">{message}</div>}

				<button className="button create-plan-submit" type="submit" disabled={status === 'loading'}>
					{status === 'loading' ? 'Creating...' : 'Create Plan'}
				</button>
			</form>
			</main>
		</>
	)
}