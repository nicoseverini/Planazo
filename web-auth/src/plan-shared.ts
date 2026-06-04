export type PlanVisibility = 'PUBLIC' | 'PRIVATE'
export type Interest = 'OTHER' | 'BEACH' | 'NIGHTLIFE' | 'MOUNTAINS' | 'NATURE' | 'SHOPPING' | 'CULTURE' | 'ADVENTURE' | 'HISTORY' | 'FOOD'
export type TravelType = 'SOLO' | 'COUPLE' | 'FRIENDS'

export type PlanFormState = {
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
}

export type SelectedImage = {
	name: string
	src: string
}

export const interestOptions: { label: string; value: Interest }[] = [
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

export const travelTypeOptions: { label: string; value: TravelType }[] = [
	{ label: 'Solo', value: 'SOLO' },
	{ label: 'Pareja', value: 'COUPLE' },
	{ label: 'Amigos', value: 'FRIENDS' },
]

export const defaultPlanFormState: PlanFormState = {
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
}

export function validateAgeRange(minAge: string, maxAge: string): string | null {
	const min = parseOptionalNumber(minAge)
	const max = parseOptionalNumber(maxAge)
	if (min != null && max != null && max !== 0 && min >= max) {
		return 'Minimum age must be less than maximum age'
	}
	return null
}

export function parseOptionalNumber(value: string) {
	const trimmed = value.trim()
	if (!trimmed) {
		return undefined
	}

	const parsed = Number(trimmed)
	return Number.isFinite(parsed) ? parsed : undefined
}

export function buildDateTime(date: string, time: string) {
	const normalizedDate = date.trim()
	const normalizedTime = time.trim()
	if (!normalizedDate || !normalizedTime) {
		return ''
	}

	return `${normalizedDate}T${normalizedTime}`
}

export function splitDateTime(dateTime: string) {
	const [date = '', time = ''] = dateTime.split('T')
	return {
		date,
		time: time.slice(0, 5),
	}
}

export function isFutureDateTime(dateTime: string) {
	const parsed = new Date(dateTime)
	return Number.isFinite(parsed.getTime()) && parsed.getTime() > Date.now()
}

export function getTodayInputValue() {
	const now = new Date()
	const year = now.getFullYear()
	const month = String(now.getMonth() + 1).padStart(2, '0')
	const day = String(now.getDate()).padStart(2, '0')
	return `${year}-${month}-${day}`
}

export function readFileAsDataUrl(file: File) {
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
