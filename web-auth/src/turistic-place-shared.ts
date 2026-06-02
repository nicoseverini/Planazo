import { type Interest, interestOptions, parseOptionalNumber } from './plan-shared'

export type TuristicPlaceFormState = {
	name: string
	cost: string
	minAge: string
	maxAge: string
	interest: Interest
	location: string
	latitude: string
	longitude: string
}

export type TuristicPlaceSummaryResponse = {
	id: number
	name: string
	cost: number
	location: string
	latitude: number | null
	longitude: number | null
	minAge: number | null
	maxAge: number | null
	interest: Interest
	images: string[]
}

export type TuristicPlaceDetailResponse = TuristicPlaceSummaryResponse & {
	images: string[]
}

export const turisticPlaceInterestOptions = interestOptions

export const defaultTuristicPlaceFormState: TuristicPlaceFormState = {
	name: '',
	cost: '',
	minAge: '0',
	maxAge: '99',
	interest: 'ADVENTURE',
	location: '',
	latitude: '-34.6037',
	longitude: '-58.3816',
}

export function toTuristicPlaceFormState(place: TuristicPlaceDetailResponse): TuristicPlaceFormState {
	return {
		name: place.name,
		cost: place.cost.toString(),
		minAge: place.minAge?.toString() ?? '',
		maxAge: place.maxAge?.toString() ?? '',
		interest: place.interest,
		location: place.location,
		latitude: place.latitude?.toString() ?? '',
		longitude: place.longitude?.toString() ?? '',
	}
}

export function parseTuristicPlaceOptionalNumber(value: string) {
	return parseOptionalNumber(value)
}