import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'

import { getBackendUrl } from './config'

type PlanVisibility = 'PUBLIC' | 'PRIVATE'
type Interest = 'OTHER' | 'BEACH' | 'NIGHTLIFE' | 'MOUNTAINS' | 'NATURE' | 'SHOPPING' | 'CULTURE' | 'ADVENTURE' | 'HISTORY' | 'FOOD'
type TravelType = 'SOLO' | 'COUPLE' | 'FRIENDS'

type CreatePlanResponse = {
	id: number
	title: string
}

type SelectedImage = {
	name: string
	src: string
}

type FormState = {
	title: string
	description: string
	date: string
	time: string
	visibility: PlanVisibility
	durationMinutes: string
	maxSubscribers: string
	minAge: string
	maxAge: string
	interest: Interest
	travelType: TravelType
	location: string
	latitude: string
	longitude: string
	images: string
}

const interestOptions: { label: string; value: Interest }[] = [
	{ label: 'Otro', value: 'OTHER' },
    { label: 'Playa', value: 'BEACH' },
    { label: 'Vida nocturna', value: 'NIGHTLIFE' },
    { label: 'Montañas', value: 'MOUNTAINS' },
    { label: 'Naturaleza', value: 'NATURE' },
    { label: 'Compras', value: 'SHOPPING' },
    { label: 'Cultura', value: 'CULTURE' },
    { label: 'Aventura', value: 'ADVENTURE' },
    { label: 'Historia', value: 'HISTORY' },
    { label: 'Gastronomía', value: 'FOOD' },
]

const travelTypeOptions: { label: string; value: TravelType }[] = [
	{ label: 'Solo', value: 'SOLO' },
	{ label: 'Pareja', value: 'COUPLE' },
	{ label: 'Amigos', value: 'FRIENDS' },
]

const defaultState: FormState = {
	title: '',
	description: '',
	date: '',
	time: '',
	visibility: 'PUBLIC',
	durationMinutes: '60',
	maxSubscribers: '10',
	minAge: '18',
	maxAge: '90',
	interest: 'ADVENTURE',
	travelType: 'FRIENDS',
	location: '',
	latitude: '-34.6037',
	longitude: '-58.3816',
	images: '',
}

function parseOptionalNumber(value: string) {
	const trimmed = value.trim()
	if (!trimmed) {
		return undefined
	}

	const parsed = Number(trimmed)
	return Number.isFinite(parsed) ? parsed : undefined
}

function parseImages(value: string) {
	return value
		.split(/[,\n]/)
		.map((item) => item.trim())
		.filter(Boolean)
}

function buildDateTime(date: string, time: string) {
	const normalizedDate = date.trim()
	const normalizedTime = time.trim()
	if (!normalizedDate || !normalizedTime) {
		return ''
	}

	return `${normalizedDate}T${normalizedTime}`
}

function isFutureDateTime(dateTime: string) {
	const parsed = new Date(dateTime)
	return Number.isFinite(parsed.getTime()) && parsed.getTime() > Date.now()
}

function getTodayInputValue() {
	const now = new Date()
	const year = now.getFullYear()
	const month = String(now.getMonth() + 1).padStart(2, '0')
	const day = String(now.getDate()).padStart(2, '0')
	return `${year}-${month}-${day}`
}


export function CreatePlanPage() {
	const [form, setForm] = useState<FormState>(defaultState)
	const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([])
	const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
	const [message, setMessage] = useState('')
	const fileInputRef = useRef<HTMLInputElement>(null)
	const [hasAccessToken, setHasAccessToken] = useState(() => Boolean(sessionStorage.getItem('accessToken')))

	useEffect(() => {
		const token = sessionStorage.getItem('accessToken')
		if (!token) {
			window.location.replace('/')
			return
		}

		setHasAccessToken(true)
	}, [])

	function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
		setForm((current) => ({ ...current, [key]: value }))
	}

	function readFileAsDataUrl(file: File) {
		return new Promise<string>((resolve, reject) => {
			const reader = new FileReader()
			reader.onload = () => {
				if (typeof reader.result === 'string') {
					resolve(reader.result)
					return
				}

				reject(new Error('No se pudo leer la imagen seleccionada.'))
			}
			reader.onerror = () => reject(new Error('No se pudo leer la imagen seleccionada.'))
			reader.readAsDataURL(file)
		})
	}

	async function handleImageSelection(event: ChangeEvent<HTMLInputElement>) {
		const files = Array.from(event.target.files ?? [])
		if (!files.length) {
			return
		}

		try {
			const images = await Promise.all(
				files.map(async (file) => ({
					name: file.name,
					src: await readFileAsDataUrl(file),
				})),
			)
			setSelectedImages((current) => [...current, ...images])
			event.target.value = ''
		} catch (err) {
			setStatus('error')
			setMessage(err instanceof Error ? err.message : 'No se pudo cargar la imagen.')
		}
	}

	function removeSelectedImage(index: number) {
		setSelectedImages((current) => current.filter((_, currentIndex) => currentIndex !== index))
	}

	function openImagePicker() {
		fileInputRef.current?.click()
	}

	if (!hasAccessToken) {
		return null
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
					images: [...parseImages(form.images), ...selectedImages.map((image) => image.src)],
				}),
			})

			if (!response.ok) {
				const errorText = await response.text()
				throw new Error(errorText || 'No se pudo crear el plan.')
			}

			const data = (await response.json()) as CreatePlanResponse
			setStatus('success')
			setMessage(`Plan creado correctamente: ${data.title}`)
			setForm(defaultState)
			setSelectedImages([])
		} catch (err) {
			setStatus('error')
			setMessage(err instanceof Error ? err.message : 'Error desconocido')
		}
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
				<div className="form-grid">
					<label className="field">
						Título
						<input value={form.title} onChange={(event) => updateField('title', event.target.value)} required />
					</label>

					<label className="field">
						Visibilidad
						<select value={form.visibility} onChange={(event) => updateField('visibility', event.target.value as PlanVisibility)}>
							<option value="PUBLIC">PUBLIC</option>
							<option value="PRIVATE">PRIVATE</option>
						</select>
					</label>

					<label className="field">
						Fecha
						<input type="date" min={getTodayInputValue()} value={form.date} onChange={(event) => updateField('date', event.target.value)} required />
					</label>

					<label className="field">
						Hora
						<input type="time" value={form.time} onChange={(event) => updateField('time', event.target.value)} required />
					</label>

					<label className="field">
						Duración en minutos
						<input type="number" min="1" value={form.durationMinutes} onChange={(event) => updateField('durationMinutes', event.target.value)} />
					</label>

					<label className="field field--wide">
						Descripción
						<textarea value={form.description} onChange={(event) => updateField('description', event.target.value)} rows={4} />
					</label>

					<label className="field">
						Máx. participantes
						<input type="number" min="1" value={form.maxSubscribers} onChange={(event) => updateField('maxSubscribers', event.target.value)} />
					</label>

					<label className="field">
						Edad mínima
						<input type="number" min="0" value={form.minAge} onChange={(event) => updateField('minAge', event.target.value)} />
					</label>

					<label className="field">
						Edad máxima
						<input type="number" min="0" value={form.maxAge} onChange={(event) => updateField('maxAge', event.target.value)} />
					</label>

					<label className="field">
						Interés
						<select value={form.interest} onChange={(event) => updateField('interest', event.target.value as Interest)}>
							{interestOptions.map((option) => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</select>
					</label>

					<label className="field">
						Tipo de viaje
						<select value={form.travelType} onChange={(event) => updateField('travelType', event.target.value as TravelType)}>
							{travelTypeOptions.map((option) => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</select>
					</label>

					<label className="field field--wide">
						Ubicación
						<input value={form.location} onChange={(event) => updateField('location', event.target.value)} required />
					</label>

					<label className="field">
						Latitud
						<input type="number" step="any" value={form.latitude} onChange={(event) => updateField('latitude', event.target.value)} required />
					</label>

					<label className="field">
						Longitud
						<input type="number" step="any" value={form.longitude} onChange={(event) => updateField('longitude', event.target.value)} required />
					</label>

					<label className="field field--wide">
						Imágenes
						<div className="image-picker">
							<input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageSelection} hidden />
							<button type="button" className="button button--secondary image-picker-button" onClick={openImagePicker}>
								Agregar imagen
							</button>
							{form.images.trim() && (
								<textarea
									value={form.images}
									onChange={(event) => updateField('images', event.target.value)}
									rows={3}
									placeholder="También podés pegar URLs separadas por coma o salto de línea"
								/>
							)}
						</div>
						{selectedImages.length > 0 && (
							<div className="image-preview-row">
								{selectedImages.map((image, index) => (
									<div key={`${image.name}-${index}`} className="image-preview-card">
										<img src={image.src} alt="Imagen seleccionada" />
										<div className="image-preview-meta">
											<button type="button" className="image-remove-button" onClick={() => removeSelectedImage(index)}>
												Quitar
											</button>
										</div>
									</div>
								))}
							</div>
						)}
					</label>
				</div>

				{status === 'error' && <div className="warning">{message}</div>}
				{status === 'success' && <div className="message">{message}</div>}

				<button className="button create-plan-submit" type="submit" disabled={status === 'loading'}>
					{status === 'loading' ? 'Creando...' : 'Crear plan'}
				</button>
			</form>
		</main>
	)
}