import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'

import { getBackendUrl } from './config'
import { PlanImagePicker } from './components/PlanImagePicker'
import { PlanFormFields } from './components/PlanFormFields'
import {
	type Interest,
	type PlanFormState,
	type PlanVisibility,
	type TravelType,
	buildDateTime,
	defaultPlanFormState,
	isFutureDateTime,
	parseOptionalNumber,
	splitDateTime,
	validateAgeRange,
} from './plan-shared'

type PlanDetailResponse = {
	title: string
	description: string
	dateTime: string
	durationMinutes: number | null
	visibility: PlanVisibility
	maxSubscribers: number | null
	minAge: number | null
	maxAge: number | null
	interest: Interest
	travelType: TravelType
	location: string
	latitude: number | null
	longitude: number | null
	images: string[]
}

function toFormState(plan: PlanDetailResponse): PlanFormState {
	const { date, time } = splitDateTime(plan.dateTime)

	return {
		title: plan.title,
		description: plan.description ?? '',
		date,
		time,
		visibility: plan.visibility,
		durationMinutes: plan.durationMinutes?.toString() ?? '',
		maxSubscribers: plan.maxSubscribers?.toString() ?? '',
		minAge: plan.minAge?.toString() ?? '',
		maxAge: plan.maxAge?.toString() ?? '',
		interest: plan.interest,
		travelType: plan.travelType,
		location: plan.location,
		latitude: plan.latitude?.toString() ?? '',
		longitude: plan.longitude?.toString() ?? '',
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
					throw new Error('No se encontró el plan que querés editar.')
				}

				if (!response.ok) {
					const errorText = await response.text()
					throw new Error(errorText || 'No se pudo cargar el plan.')
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
					setMessage(err instanceof Error ? err.message : 'Error desconocido')
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

		setStatus('saving')
		setMessage('')

		try {
			const backendUrl = getBackendUrl()
			const response = await fetch(`${backendUrl}/api/v1/plans/${planId}`, {
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
				throw new Error(errorText || 'No se pudo guardar el plan.')
			}

			window.location.assign(`/plans/${planId}`)
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

	if (loadingPlan) {
		return (
			<main className="auth-card auth-card--xwide">
				<div className="message">Cargando plan...</div>
			</main>
		)
	}

	return (
		<main className="auth-card auth-card--xwide">
			<div className="page-header">
				<div>
					<h1>Edit Plan</h1>
					<p className="subtitle">Editá los datos del plan y administrá sus imágenes.</p>
				</div>
				<a className="button button--secondary" href={`/plans/${planId}`}>
					Volver al detalle
				</a>
			</div>

			<form className="form-stack create-plan-form" onSubmit={handleSubmit}>
				<PlanFormFields form={form} onChange={updateField} />

				<PlanImagePicker images={images} onChange={setImages} hint="Las imágenes nuevas se agregarán al guardar." />

				{status === 'error' && <div className="warning">{message}</div>}

				<button className="button create-plan-submit" type="submit" disabled={status === 'saving'}>
					{status === 'saving' ? 'Guardando...' : 'Guardar cambios'}
				</button>
			</form>
		</main>
	)
}