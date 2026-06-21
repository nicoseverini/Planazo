import { type Interest, interestOptions, parseOptionalNumber } from './plan-shared'

export type TuristicPlaceFormState = {
	name: string
	cost: string
	minAge: string
	maxAge: string
	interests: Interest[]
	country: string
	city: string
	address: string
	latitude: string
	longitude: string
	description: string
}

export type TuristicPlaceSummaryResponse = {
	id: number
	name: string
	cost: number | null
	interests: Interest[]
	country: string | null
	city: string | null
	address: string | null
	location: string | null
	latitude: number | null
	longitude: number | null
	minAge: number | null
	maxAge: number | null
	images: string[]
	creatorId: number | null
}

export type TuristicPlaceDetailResponse = TuristicPlaceSummaryResponse & {
	description: string | null
}

export const turisticPlaceInterestOptions = interestOptions

export const defaultTuristicPlaceFormState: TuristicPlaceFormState = {
	name: '',
	cost: '',
	minAge: '',
	maxAge: '',
	interests: [],
	country: '',
	city: '',
	address: '',
	latitude: '',
	longitude: '',
	description: '',
}

export function toTuristicPlaceFormState(place: TuristicPlaceDetailResponse): TuristicPlaceFormState {
	return {
		name: place.name,
		cost: place.cost != null ? place.cost.toString() : '',
		minAge: place.minAge?.toString() ?? '',
		maxAge: place.maxAge?.toString() ?? '',
		interests: place.interests ?? [],
		country: place.country ?? '',
		city: place.city ?? '',
		address: place.address ?? place.location ?? '',
		latitude: place.latitude?.toString() ?? '',
		longitude: place.longitude?.toString() ?? '',
		description: place.description ?? '',
	}
}

export function parseTuristicPlaceOptionalNumber(value: string) {
	return parseOptionalNumber(value)
}
