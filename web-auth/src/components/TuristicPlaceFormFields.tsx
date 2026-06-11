import { turisticPlaceInterestOptions, type TuristicPlaceFormState } from '../turistic-place-shared'

type TuristicPlaceFormFieldsProps = {
	form: TuristicPlaceFormState
	onChange: <K extends keyof TuristicPlaceFormState>(key: K, value: TuristicPlaceFormState[K]) => void
}

export function TuristicPlaceFormFields({ form, onChange }: TuristicPlaceFormFieldsProps) {
	return (
		<div className="form-grid">
			<label className="field field--wide">
				Name
				<input value={form.name} onChange={(event) => onChange('name', event.target.value)} required />
			</label>

			<label className="field">
				Cost
				<input type="number" min="0" step="any" value={form.cost} onChange={(event) => onChange('cost', event.target.value)} required />
			</label>

			<label className="field">
				Interest
				<select value={form.interest} onChange={(event) => onChange('interest', event.target.value as TuristicPlaceFormState['interest'])}>
					{turisticPlaceInterestOptions.map((option) => (
						<option key={option.value} value={option.value}>
							{option.label}
						</option>
					))}
				</select>
			</label>

			<label className="field">
				Min Age
				<input type="number" min="0" value={form.minAge} onChange={(event) => onChange('minAge', event.target.value)} />
			</label>

			<label className="field">
				Max Age
				<input type="number" min="0" value={form.maxAge} onChange={(event) => onChange('maxAge', event.target.value)} />
			</label>

			<label className="field field--wide">
				Location
				<input value={form.location} onChange={(event) => onChange('location', event.target.value)} required />
			</label>

			<label className="field field--wide">
				Description
				<textarea rows={4} value={form.description} onChange={(event) => onChange('description', event.target.value)} />
			</label>

			<label className="field">
				Latitude
				<input type="number" step="any" value={form.latitude} onChange={(event) => onChange('latitude', event.target.value)} required />
			</label>

			<label className="field">
				Longitude
				<input type="number" step="any" value={form.longitude} onChange={(event) => onChange('longitude', event.target.value)} required />
			</label>
		</div>
	)
}