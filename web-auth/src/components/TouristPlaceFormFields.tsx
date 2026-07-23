import { touristPlaceInterestOptions, type TouristPlaceFormState } from '../tourist-place-shared'
import { Autocomplete } from './Autocomplete'
import { countries, citiesByCountry } from '../location-data'
import { OpeningHoursFormFields } from './OpeningHoursFormFields'

type TouristPlaceFormFieldsProps = {
	form: TouristPlaceFormState
	onChange: <K extends keyof TouristPlaceFormState>(key: K, value: TouristPlaceFormState[K]) => void
}

export function TouristPlaceFormFields({ form, onChange }: TouristPlaceFormFieldsProps) {
	return (
		<div className="form-grid">
			<label className="field field--wide">
				Name *
				<input value={form.name} onChange={(event) => onChange('name', event.target.value)} required />
			</label>

			<label className="field">
				Cost (leave empty for free)
				<input type="number" min="0" step="any" value={form.cost} onChange={(event) => onChange('cost', event.target.value)} />
			</label>

			<label className="field">
				Min Age
				<input type="number" min="0" value={form.minAge} onChange={(event) => onChange('minAge', event.target.value)} />
			</label>

			<label className="field">
				Max Age
				<input type="number" min="0" value={form.maxAge} onChange={(event) => onChange('maxAge', event.target.value)} />
			</label>

			<div className="field field--wide">
				<span className="field-label">Categories *</span>
				<div className="checkbox-group">
					{touristPlaceInterestOptions.map((option) => {
						const isChecked = form.interests.includes(option.value)
						return (
							<label key={option.value} className="checkbox-item">
								<input
									type="checkbox"
									checked={isChecked}
									onChange={() => {
										const updated = isChecked
											? form.interests.filter((i) => i !== option.value)
											: [...form.interests, option.value]
										onChange('interests', updated)
									}}
								/>
								<span className="checkbox-label">{option.label}</span>
							</label>
						)
					})}
				</div>
			</div>

			<label className="field">
				Country *
				<Autocomplete
					value={form.country}
					onChange={(value) => onChange('country', value)}
					placeholder="e.g. Argentina"
					suggestions={countries}
					required
				/>
			</label>

			<label className="field">
				State *
				<Autocomplete
					value={form.state}
					onChange={(value) => onChange('state', value)}
					placeholder="e.g. Buenos Aires"
					suggestions={citiesByCountry[form.country] || []}
					required
				/>
			</label>

			<label className="field">
				City *
				<input value={form.city} onChange={(event) => onChange('city', event.target.value)} placeholder="e.g. Palermo" required />
			</label>

			<label className="field field--wide">
				Address *
				<input value={form.address} onChange={(event) => onChange('address', event.target.value)} required placeholder="e.g. Av. Corrientes 1234" />
			</label>

			<label className="field field--wide">
				Description
				<textarea rows={4} value={form.description} onChange={(event) => onChange('description', event.target.value)} />
			</label>

			<OpeningHoursFormFields 
				openingHours={form.openingHours} 
				onChange={(value) => onChange('openingHours', value)} 
			/>

		</div>
	)
}
