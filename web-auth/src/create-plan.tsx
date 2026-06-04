import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'

import { getBackendUrl } from './config'
import { PlanImagePicker } from './components/PlanImagePicker'
import { PlanFormFields } from './components/PlanFormFields'
import {
	type PlanFormState,
	buildDateTime,
	defaultPlanFormState,
	isFutureDateTime,
	parseOptionalNumber,
	validateAgeRange,
} from './plan-shared'

type CreatePlanResponse = {
	id: number
	title: string
}

export function CreatePlanPage() {
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
			setMessage('No hay sesión activa. Iniciá sesión como admin primero.')
			return
		}

		const dateTime = buildDateTime(form.date, form.time)
		if (!form.title.trim() || !dateTime || !form.location.trim()) {
			setStatus('error')
			setMessage('Título, fecha y ubicación son obligatorios.')
			return
		}

		if (!isFutureDateTime(dateTime)) {
			setStatus('error')
			setMessage('La fecha y la hora deben ser futuras.')
			return
		}

		const latitude = Number(form.latitude)
		const longitude = Number(form.longitude)
		if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
			setStatus('error')
			setMessage('Las coordenadas deben ser números válidos.')
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
					dateTime,
					durationMinutes: Number.parseInt(form.durationMinutes, 10) || 60,
					visibility: form.visibility,
					maxSubscribers: Number.parseInt(form.maxSubscribers, 10) || 10,
					minAge: parseOptionalNumber(form.minAge),
					maxAge: parseOptionalNumber(form.maxAge),
					interest: form.interest,
					travelType: form.travelType,
					location: form.location.trim(),
					latitude,
					longitude,
					images,
				}),
			})

			if (!response.ok) {
				const errorText = await response.text()
				throw new Error(errorText || 'No se pudo crear el plan.')
			}

			const data = (await response.json()) as CreatePlanResponse
			setStatus('success')
			setMessage(`Plan creado correctamente: ${data.title}`)
			setForm({ ...defaultPlanFormState })
			setImages([])
		} catch (err) {
			setStatus('error')
			setMessage(err instanceof Error ? err.message : 'Error desconocido')
		}
	}

	if (!hasAccessToken) {
		return null
	}

	return (
		<main className="auth-card auth-card--xwide">
			<div className="page-header">
				<div>
					<h1>Create Plan</h1>
					<p className="subtitle">Formulario para que el admin cree un plan.</p>
				</div>
				<a className="button button--secondary" href="/plans">
					Volver a plans
				</a>
			</div>

			<form className="form-stack create-plan-form" onSubmit={handleSubmit}>
				<PlanFormFields form={form} onChange={updateField} />

				<PlanImagePicker images={images} onChange={setImages} />

				{status === 'error' && <div className="warning">{message}</div>}
				{status === 'success' && <div className="message">{message}</div>}

				<button className="button create-plan-submit" type="submit" disabled={status === 'loading'}>
					{status === 'loading' ? 'Creando...' : 'Crear plan'}
				</button>
			</form>
		</main>
	)
}