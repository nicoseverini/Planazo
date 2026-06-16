export type PlanVisibility = 'PUBLIC' | 'PRIVATE'
export type Interest = 'OTHER' | 'BEACH' | 'NIGHTLIFE' | 'MOUNTAINS' | 'NATURE' | 'SHOPPING' | 'CULTURE' | 'ADVENTURE' | 'HISTORY' | 'FOOD' | 'SPORTS'

export type PlanFormState = {
	title: string
	description: string
	startDate: string
	startTime: string
	endDate: string
	endTime: string
	visibility: PlanVisibility
	maxSubscribers: string
	minAge: string
	maxAge: string
	interests: Interest[]
	location: string
	latitude: string
	longitude: string
	budget: string
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
	{ label: 'Food', value: 'FOOD' },
]

export const defaultPlanFormState: PlanFormState = {
	title: '',
	description: '',
	startDate: '',
	startTime: '',
	endDate: '',
	endTime: '',
	visibility: 'PUBLIC',
	maxSubscribers: '',
	minAge: '18',
	maxAge: '90',
	interests: [],
	location: '',
	latitude: '-34.6037',
	longitude: '-58.3816',
	budget: '',
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

export function validateMaxSubscribers(maxSubscribers: string): string | null {
	const trimmed = maxSubscribers.trim()
	const parsed = Number.parseInt(trimmed, 10)
	if (!trimmed || Number.isNaN(parsed) || parsed <= 0 || parsed > 99_999) {
		return 'Max participants must be between 1 and 99,999.'
	}
	return null
}

export function validateBudget(budget: string): string | null {
	const trimmed = budget.trim()
	if (!trimmed) return null
	const parsed = Number(trimmed)
	if (!Number.isFinite(parsed)) return 'Budget must be a valid number.'
	if (parsed <= 0) return 'Budget must be greater than 0.'
	if (parsed > 9_999_999) return 'Budget cannot exceed 9,999,999.'
	return null
}

export function parseBudget(budget: string): number {
	const trimmed = budget.trim()
	if (!trimmed) return 0
	const parsed = Number(trimmed)
	return Number.isFinite(parsed) ? parsed : 0
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
