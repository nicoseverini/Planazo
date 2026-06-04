import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'

import { PlanImagePicker } from './components/PlanImagePicker'
import { getBackendUrl } from './config'
import { TuristicPlaceFormFields } from './components/TuristicPlaceFormFields'
import {
	defaultTuristicPlaceFormState,
	parseTuristicPlaceOptionalNumber,
	toTuristicPlaceFormState,
	type TuristicPlaceDetailResponse,
	type TuristicPlaceFormState,
} from './turistic-place-shared'
import { validateAgeRange } from './plan-shared'

export function EditTuristicPlacePage({ placeId }: { placeId: number }) {
	const [form, setForm] = useState<TuristicPlaceFormState>({ ...defaultTuristicPlaceFormState })
	const [images, setImages] = useState<string[]>([])
	const [status, setStatus] = useState<'idle' | 'saving' | 'error'>('idle')
	const [message, setMessage] = useState('')
	const [loadingPlace, setLoadingPlace] = useState(true)
	const [hasAccessToken, setHasAccessToken] = useState(() => Boolean(sessionStorage.getItem('accessToken')))

	useEffect(() => {
		const token = sessionStorage.getItem('accessToken')
		setHasAccessToken(!!token)
	}, [])

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
					throw new Error('No se encontró el lugar turístico que querés editar.')
				}

				if (!response.ok) {
					const errorText = await response.text()
					throw new Error(errorText || 'No se pudo cargar el lugar turístico.')
				}

				const data = (await response.json()) as TuristicPlaceDetailResponse
				if (isMounted) {
					setForm(toTuristicPlaceFormState(data))
					setImages([...data.images])
					setStatus('idle')
					setMessage('')
				}
			} catch (err) {
				if (isMounted) {
					setStatus('error')
					setMessage(err instanceof Error ? err.message : 'Error desconocido')
				}
			} finally {
				if (isMounted) {
					setLoadingPlace(false)
				}
			}
		}

		void loadPlace()

		return () => {
			isMounted = false
		}
	}, [placeId])

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

		setStatus('saving')
		setMessage('')

		try {
			const backendUrl = getBackendUrl()
			const response = await fetch(`${backendUrl}/api/v1/turistic-places/${placeId}`, {
				method: 'PATCH',
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
				throw new Error(errorText || 'No se pudo guardar el lugar turístico.')
			}

			window.location.assign(`/turistic-places/${placeId}`)
		} catch (err) {
			setStatus('error')
			setMessage(err instanceof Error ? err.message : 'Error desconocido')
		} finally {
			setStatus((current) => (current === 'saving' ? 'idle' : current))
		}
	}

	if (!hasAccessToken) {
		return null
	}

	if (loadingPlace) {
		return (
			<main className="auth-card auth-card--xwide">
				<div className="message">Cargando lugar turístico...</div>
			</main>
		)
	}

	return (
		<main className="auth-card auth-card--xwide">
			<div className="page-header">
				<div>
					<h1>Edit Turistic Place</h1>
					<p className="subtitle">Editá los datos del lugar turístico y administrá sus imágenes.</p>
				</div>
				<a className="button button--secondary" href={`/turistic-places/${placeId}`}>
					Volver al detalle
				</a>
			</div>

			<form className="form-stack create-plan-form" onSubmit={handleSubmit}>
				<TuristicPlaceFormFields form={form} onChange={updateField} />

				<PlanImagePicker images={images} onChange={setImages} hint="Las imágenes nuevas se agregarán al guardar." />

				{status === 'error' && <div className="warning">{message}</div>}

				<button className="button create-plan-submit" type="submit" disabled={status === 'saving'}>
					{status === 'saving' ? 'Guardando...' : 'Guardar cambios'}
				</button>
			</form>
		</main>
	)
}