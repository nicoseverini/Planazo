import { type Interest, interestOptions, parseOptionalNumber } from './plan-shared'

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
	}
}

export function parseTouristPlaceOptionalNumber(value: string) {
	return parseOptionalNumber(value)
}
