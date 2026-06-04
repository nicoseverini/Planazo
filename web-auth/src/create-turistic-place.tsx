import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'

import { PlanImagePicker } from './components/PlanImagePicker'
import { getBackendUrl } from './config'
import { TuristicPlaceFormFields } from './components/TuristicPlaceFormFields'
import {
	defaultTuristicPlaceFormState,
	parseTuristicPlaceOptionalNumber,
	type TuristicPlaceFormState,
} from './turistic-place-shared'
import { validateAgeRange } from './plan-shared'

type CreateTuristicPlaceResponse = {
	id: number
	name: string
}

export function CreateTuristicPlacePage() {
	const [form, setForm] = useState<TuristicPlaceFormState>({ ...defaultTuristicPlaceFormState })
	const [images, setImages] = useState<string[]>([])
	const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
	const [message, setMessage] = useState('')
	const [hasAccessToken, setHasAccessToken] = useState(() => Boolean(sessionStorage.getItem('accessToken')))

	useEffect(() => {
		const token = sessionStorage.getItem('accessToken')
		setHasAccessToken(!!token)
	}, [])

	function updateField<K extends keyof TuristicPlaceFormState>(key: K, value: TuristicPlaceFormState[K]) {
		setForm((current) => ({ ...current, [key]: value }))
	}

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault()

		const accessToken = sessionStorage.getItem('accessToken')

		if (!form.name.trim() || !form.location.trim()) {
			setStatus('error')
			setMessage('Nombre y ubicación son obligatorios.')
			return
		}

		const cost = Number(form.cost)
		const latitude = Number(form.latitude)
		const longitude = Number(form.longitude)

		if (!Number.isFinite(cost) || cost < 0) {
			setStatus('error')
			setMessage('El costo debe ser un número válido.')
			return
		}

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
			const response = await fetch(`${backendUrl}/api/v1/turistic-places`, {
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
					minAge: parseTuristicPlaceOptionalNumber(form.minAge),
					maxAge: parseTuristicPlaceOptionalNumber(form.maxAge),
					interest: form.interest,
					location: form.location.trim(),
					latitude,
					longitude,
					images,
					description: form.description.trim() || null,
				}),
			})

			if (!response.ok) {
				const errorText = await response.text()
				throw new Error(errorText || 'No se pudo crear el lugar turístico.')
			}

			const data = (await response.json()) as CreateTuristicPlaceResponse
			setStatus('success')
			setMessage(`Lugar turístico creado correctamente: ${data.name}`)
			setForm({ ...defaultTuristicPlaceFormState })
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
					<h1>Create Turistic Place</h1>
					<p className="subtitle">Formulario para que el admin cree un lugar turístico.</p>
				</div>
				<a className="button button--secondary" href="/turistic-places">
					Volver a turistic places
				</a>
			</div>

			<form className="form-stack create-plan-form" onSubmit={handleSubmit}>
				<TuristicPlaceFormFields form={form} onChange={updateField} />

				<PlanImagePicker images={images} onChange={setImages} />

				{status === 'error' && <div className="warning">{message}</div>}
				{status === 'success' && <div className="message">{message}</div>}

				<button className="button create-plan-submit" type="submit" disabled={status === 'loading'}>
					{status === 'loading' ? 'Creando...' : 'Crear lugar turístico'}
				</button>
			</form>
		</main>
	)
}