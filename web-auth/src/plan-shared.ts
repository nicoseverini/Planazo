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
	country: string
	city: string
	address: string
	latitude: string
	longitude: string
	budget: string
	timezone: string
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
	country: '',
	city: '',
	address: '',
	latitude: '',
	longitude: '',
	budget: '',
	timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
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

export function buildDateTime(date: string, time: string, timezone?: string) {
	const normalizedDate = date.trim()
	const normalizedTime = time.trim()
	if (!normalizedDate || !normalizedTime) {
		return ''
	}

	const tz = timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC'

	// DST-safe UTC offset computation using Intl.DateTimeFormat.formatToParts
	const refDate = new Date(`${normalizedDate}T${normalizedTime}:00Z`)
	const parts = new Intl.DateTimeFormat('en-CA', {
		timeZone: tz,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		hour12: false,
	}).formatToParts(refDate)
	const p: Record<string, string> = {}
	for (const part of parts) p[part.type] = part.value
	const localHour = p.hour === '24' ? 0 : parseInt(p.hour, 10)
	const localAsUtcMs = Date.UTC(
		parseInt(p.year, 10), parseInt(p.month, 10) - 1, parseInt(p.day, 10),
		localHour, parseInt(p.minute, 10), parseInt(p.second, 10),
	)
	const diffMinutes = Math.round((localAsUtcMs - refDate.getTime()) / 60000)
	const sign = diffMinutes >= 0 ? '+' : '-'
	const absDiff = Math.abs(diffMinutes)
	const h = String(Math.floor(absDiff / 60)).padStart(2, '0')
	const m = String(absDiff % 60).padStart(2, '0')

	return `${normalizedDate}T${normalizedTime}:00${sign}${h}:${m}`
}

export function splitDateTime(dateTime: string, timezone?: string) {
	if (!dateTime) return { date: '', time: '' }

	const tz = timezone ?? 'UTC'
	const parsed = new Date(dateTime)

	if (!Number.isFinite(parsed.getTime())) {
		const [d = '', t = ''] = dateTime.split('T')
		return { date: d, time: t.slice(0, 5) }
	}

	// Extract local date/time parts in the given timezone
	const parts = new Intl.DateTimeFormat('en-CA', {
		timeZone: tz,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		hour12: false,
	}).formatToParts(parsed)

	const p: Record<string, string> = {}
	for (const part of parts) {
		p[part.type] = part.value
	}

	const localDate = `${p.year}-${p.month}-${p.day}`
	const hour = p.hour === '24' ? '00' : p.hour
	const localTime = `${hour}:${p.minute}`

	return { date: localDate, time: localTime }
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

export async function geocodeAddress(
	address: string,
	city: string,
	country: string,
): Promise<{ lat: number; lng: number } | null> {
	const query = [address, city, country].filter(Boolean).join(', ')
	if (!query) return null
	try {
		const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`
		const response = await fetch(url, { headers: { 'Accept-Language': 'en' } })
		const data = (await response.json()) as Array<{ lat: string; lon: string }>
		if (Array.isArray(data) && data.length > 0) {
			return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
		}
	} catch {
		// network or parse error
	}
	return null
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
