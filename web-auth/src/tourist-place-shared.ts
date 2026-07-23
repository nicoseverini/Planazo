import { type Interest, interestOptions, parseOptionalNumber } from './plan-shared'

export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY'

export type OpeningHours = {
	dayOfWeek: DayOfWeek
	openTime: string
	closeTime: string
}

export const dayOfWeekOptions: { label: string; value: DayOfWeek }[] = [
	{ label: 'Monday', value: 'MONDAY' },
	{ label: 'Tuesday', value: 'TUESDAY' },
	{ label: 'Wednesday', value: 'WEDNESDAY' },
	{ label: 'Thursday', value: 'THURSDAY' },
	{ label: 'Friday', value: 'FRIDAY' },
	{ label: 'Saturday', value: 'SATURDAY' },
	{ label: 'Sunday', value: 'SUNDAY' },
]

export type TouristPlaceFormState = {
	name: string
	cost: string
	minAge: string
	maxAge: string
	interests: Interest[]
	country: string
	state: string
	city: string
	address: string
	latitude: string
	longitude: string
	description: string
	openingHours: OpeningHours[]
}

export type TouristPlaceSummaryResponse = {
	id: number
	name: string
	cost: number | null
	interests: Interest[]
	country: string | null
	state: string | null
	city: string | null
	address: string | null
	location: string | null
	latitude: number | null
	longitude: number | null
	minAge: number | null
	maxAge: number | null
	images: string[]
	creatorId: number | null
	creatorName: string | null
	openingHours: OpeningHours[]
}

export type TouristPlaceDetailResponse = TouristPlaceSummaryResponse & {
	description: string | null
}

export const touristPlaceInterestOptions = interestOptions

export const defaultTouristPlaceFormState: TouristPlaceFormState = {
	name: '',
	cost: '',
	minAge: '',
	maxAge: '',
	interests: [],
	country: '',
	state: '',
	city: '',
	address: '',
	latitude: '',
	longitude: '',
	description: '',
	openingHours: [],
}

export function toTouristPlaceFormState(place: TouristPlaceDetailResponse): TouristPlaceFormState {
	return {
		name: place.name,
		cost: place.cost != null ? place.cost.toString() : '',
		minAge: place.minAge?.toString() ?? '',
		maxAge: place.maxAge?.toString() ?? '',
		interests: place.interests ?? [],
		country: place.country ?? '',
		state: place.state ?? '',
		city: place.city ?? '',
		address: place.address ?? place.location ?? '',
		latitude: place.latitude?.toString() ?? '',
		longitude: place.longitude?.toString() ?? '',
		description: place.description ?? '',
		openingHours: place.openingHours ?? [],
	}
}

export function parseTouristPlaceOptionalNumber(value: string) {
	return parseOptionalNumber(value)
}

export function formatOpeningHoursForApi(openingHours: OpeningHours[]): OpeningHours[] {
	return openingHours.map(oh => ({
		...oh,
		openTime: oh.openTime.length === 5 ? `${oh.openTime}:00` : oh.openTime,
		closeTime: oh.closeTime.length === 5 ? `${oh.closeTime}:00` : oh.closeTime,
	}))
}
