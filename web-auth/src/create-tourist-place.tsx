import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'

import { PlanImagePicker } from './components/PlanImagePicker'
import { getBackendUrl } from './config'
import { TouristPlaceFormFields } from './components/TouristPlaceFormFields'
import { Navbar } from './components/Navbar'
import {
	defaultTouristPlaceFormState,
	formatOpeningHoursForApi,
	parseTouristPlaceOptionalNumber,
	type TouristPlaceFormState,
} from './tourist-place-shared'
import { geocodeAddress, validateAgeRange } from './plan-shared'

type CreateTouristPlaceResponse = {
	id: number
	name: string
}

export function CreateTouristPlacePage() {
	const [form, setForm] = useState<TouristPlaceFormState>({ ...defaultTouristPlaceFormState })
	const [images, setImages] = useState<string[]>([])
	const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
	const [message, setMessage] = useState('')
	const [hasAccessToken, setHasAccessToken] = useState(() => Boolean(sessionStorage.getItem('accessToken')))

	useEffect(() => {
		const token = sessionStorage.getItem('accessToken')
		setHasAccessToken(!!token)
	}, [])

	function updateField<K extends keyof TouristPlaceFormState>(key: K, value: TouristPlaceFormState[K]) {
		setForm((current) => ({ ...current, [key]: value }))
	}

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault()

		const accessToken = sessionStorage.getItem('accessToken')

		if (!form.name.trim()) {
			setStatus('error')
			setMessage('Name is required.')
			return
		}

		if (form.interests.length === 0) {
			setStatus('error')
			setMessage('Please select at least one category.')
			return
		}

		if (!form.country.trim() || !form.city.trim() || !form.address.trim()) {
			setStatus('error')
			setMessage('Country, city, and address are required.')
			return
		}

		const cost = form.cost.trim() ? Number(form.cost) : 0
		if (cost !== undefined && (!Number.isFinite(cost) || cost < 0 || cost > 9999999)) {
			setStatus('error')
			setMessage('Cost must be a number between 0 and 9999999.')
			return
		}

		const ageError = validateAgeRange(form.minAge, form.maxAge)
		if (ageError) {
			setStatus('error')
			setMessage(ageError)
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
			const response = await fetch(`${backendUrl}/api/v1/tourist-places`, {
				method: 'POST',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
					Authorization: `Bearer ${accessToken}`,
					'ngrok-skip-browser-warning': 'true',
				},
				body: JSON.stringify({
					name: form.name.trim(),
					cost,
					minAge: parseTouristPlaceOptionalNumber(form.minAge),
					maxAge: parseTouristPlaceOptionalNumber(form.maxAge),
					interests: form.interests,
					country: form.country.trim(),
					state: form.state.trim(),
					city: form.city.trim(),
					address: form.address.trim(),
					latitude,
					longitude,
					images,
					description: form.description.trim() || null,
					openingHours: formatOpeningHoursForApi(form.openingHours),
				}),
			})

			if (!response.ok) {
				const errorText = await response.text()
				throw new Error(errorText || 'Failed to create tourist place.')
			}

			const data = (await response.json()) as CreateTouristPlaceResponse
			setStatus('success')
			setMessage(`Tourist place created successfully: ${data.name}`)
			setForm({ ...defaultTouristPlaceFormState })
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
					<h1>Create Tourist Place</h1>
					<p className="subtitle">Form for admins to create a new tourist place.</p>
				</div>
			</div>

			<form className="form-stack create-plan-form" onSubmit={handleSubmit}>
				<TouristPlaceFormFields form={form} onChange={updateField} />

				<PlanImagePicker images={images} onChange={setImages} />

				{status === 'error' && <div className="warning">{message}</div>}
				{status === 'success' && <div className="message">{message}</div>}

				<button className="button create-plan-submit" type="submit" disabled={status === 'loading'}>
					{status === 'loading' ? 'Creating...' : 'Create Tourist Place'}
				</button>
			</form>
			</main>
		</>
	)
}
