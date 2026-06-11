export type PlanVisibility = 'PUBLIC' | 'PRIVATE'
export type Interest = 'OTHER' | 'BEACH' | 'NIGHTLIFE' | 'MOUNTAINS' | 'NATURE' | 'SHOPPING' | 'CULTURE' | 'ADVENTURE' | 'HISTORY' | 'FOOD' | 'SPORTS'
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
	interests: Interest[]
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
	{ label: 'Other', value: 'OTHER' },
	{ label: 'Beach', value: 'BEACH' },
	{ label: 'Nightlife', value: 'NIGHTLIFE' },
	{ label: 'Mountains', value: 'MOUNTAINS' },
	{ label: 'Nature', value: 'NATURE' },
	{ label: 'Shopping', value: 'SHOPPING' },
	{ label: 'Culture', value: 'CULTURE' },
	{ label: 'Adventure', value: 'ADVENTURE' },
	{ label: 'Sports', value: 'SPORTS' },
	{ label: 'History', value: 'HISTORY' },
	{ label: 'Gastronomy', value: 'FOOD' },
]

export const travelTypeOptions: { label: string; value: TravelType }[] = [
	{ label: 'Solo', value: 'SOLO' },
	{ label: 'Couple', value: 'COUPLE' },
	{ label: 'Friends', value: 'FRIENDS' },
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
	interests: ['OTHER'],
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

			reject(new Error('Unexpected result type when reading the image.'))
		}
		reader.onerror = () => reject(new Error('Could not read the selected image.'))
		reader.readAsDataURL(file)
	})
}
