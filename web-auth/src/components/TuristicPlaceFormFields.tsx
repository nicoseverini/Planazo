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
				Cost (optional)
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
					{turisticPlaceInterestOptions.map((option) => {
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
				<input value={form.country} onChange={(event) => onChange('country', event.target.value)} required placeholder="e.g. Argentina" />
			</label>

			<label className="field">
				City *
				<input value={form.city} onChange={(event) => onChange('city', event.target.value)} required placeholder="e.g. Buenos Aires" />
			</label>

			<label className="field field--wide">
				Address *
				<input value={form.address} onChange={(event) => onChange('address', event.target.value)} required placeholder="e.g. Av. Corrientes 1234" />
			</label>

			<label className="field field--wide">
				Description
				<textarea rows={4} value={form.description} onChange={(event) => onChange('description', event.target.value)} />
			</label>

		</div>
	)
}
