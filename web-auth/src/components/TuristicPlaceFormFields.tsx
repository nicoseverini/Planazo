import { turisticPlaceInterestOptions, type TuristicPlaceFormState } from '../turistic-place-shared'

type TuristicPlaceFormFieldsProps = {
	form: TuristicPlaceFormState
	onChange: <K extends keyof TuristicPlaceFormState>(key: K, value: TuristicPlaceFormState[K]) => void
}

export function TuristicPlaceFormFields({ form, onChange }: TuristicPlaceFormFieldsProps) {
	return (
		<div className="form-grid">
			<label className="field field--wide">
				Nombre
				<input value={form.name} onChange={(event) => onChange('name', event.target.value)} required />
			</label>

			<label className="field">
				Costo
				<input type="number" min="0" step="any" value={form.cost} onChange={(event) => onChange('cost', event.target.value)} required />
			</label>

			<label className="field">
				Interés
				<select value={form.interest} onChange={(event) => onChange('interest', event.target.value as TuristicPlaceFormState['interest'])}>
					{turisticPlaceInterestOptions.map((option) => (
						<option key={option.value} value={option.value}>
							{option.label}
						</option>
					))}
				</select>
			</label>

			<label className="field">
				Edad mínima
				<input type="number" min="0" value={form.minAge} onChange={(event) => onChange('minAge', event.target.value)} />
			</label>

			<label className="field">
				Edad máxima
				<input type="number" min="0" value={form.maxAge} onChange={(event) => onChange('maxAge', event.target.value)} />
			</label>

			<label className="field field--wide">
				Ubicación
				<input value={form.location} onChange={(event) => onChange('location', event.target.value)} required />
			</label>

			<label className="field">
				Latitud
				<input type="number" step="any" value={form.latitude} onChange={(event) => onChange('latitude', event.target.value)} required />
			</label>

			<label className="field">
				Longitud
				<input type="number" step="any" value={form.longitude} onChange={(event) => onChange('longitude', event.target.value)} required />
			</label>
		</div>
	)
}