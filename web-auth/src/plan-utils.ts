import type { PlanVisibility } from './plan-shared'

export function formatDateTime(value: string) {
	const parsedDate = new Date(value)
	if (Number.isNaN(parsedDate.getTime())) {
		return value
	}

	return new Intl.DateTimeFormat('es-ES', {
		dateStyle: 'full',
		timeStyle: 'short',
	}).format(parsedDate)
}

export function toTitleCase(value: string) {
	return value
		.toLowerCase()
		.replace(/_/g, ' ')
		.replace(/^./, (character) => character.toUpperCase())
}

export function getVisibilityLabel(value: PlanVisibility) {
	return value === 'PUBLIC' ? 'Public' : 'Private'
}
