import { dayOfWeekOptions, type DayOfWeek, type OpeningHours } from '../tourist-place-shared'

type OpeningHoursFormFieldsProps = {
	openingHours: OpeningHours[]
	onChange: (openingHours: OpeningHours[]) => void
}

export function OpeningHoursFormFields({ openingHours, onChange }: OpeningHoursFormFieldsProps) {
	function addOpeningHours() {
		onChange([...openingHours, { dayOfWeek: 'MONDAY', openTime: '09:00', closeTime: '18:00' }])
	}

	function removeOpeningHours(index: number) {
		onChange(openingHours.filter((_, i) => i !== index))
	}

	function updateOpeningHours(index: number, field: keyof OpeningHours, value: string) {
		onChange(
			openingHours.map((oh, i) =>
				i === index ? { ...oh, [field]: value } : oh
			)
		)
	}

	function isDaySelected(day: DayOfWeek): boolean {
		return openingHours.some((oh) => oh.dayOfWeek === day)
	}

	return (
		<div className="field field--wide">
			<span className="field-label">Opening Hours</span>
			<p className="hint">Select the days and times when this place is open. Days not listed are considered closed.</p>
			
			{openingHours.length === 0 ? (
				<div className="message">No opening hours set. This place is considered closed all days.</div>
			) : (
				<div className="opening-hours-list">
					{openingHours.map((oh, index) => (
						<div key={index} className="opening-hours-item">
							<select
								value={oh.dayOfWeek}
								onChange={(e) => updateOpeningHours(index, 'dayOfWeek', e.target.value)}
								className="opening-hours-day"
							>
								{dayOfWeekOptions.map((option) => (
									<option key={option.value} value={option.value} disabled={isDaySelected(option.value) && option.value !== oh.dayOfWeek}>
										{option.label}
									</option>
								))}
							</select>
							
							<input
								type="time"
								value={oh.openTime}
								onChange={(e) => updateOpeningHours(index, 'openTime', e.target.value)}
								className="opening-hours-time"
							/>
							
							<span className="opening-hours-separator">to</span>
							
							<input
								type="time"
								value={oh.closeTime}
								onChange={(e) => updateOpeningHours(index, 'closeTime', e.target.value)}
								className="opening-hours-time"
							/>
							
							<button
								type="button"
								onClick={() => removeOpeningHours(index)}
								className="button button--danger button--small"
							>
								Remove
							</button>
						</div>
					))}
				</div>
			)}
			
			<button
				type="button"
				onClick={addOpeningHours}
				className="button button--secondary"
				disabled={openingHours.length >= 7}
			>
				{openingHours.length >= 7 ? 'All days added' : 'Add Opening Hours'}
			</button>
		</div>
	)
}
