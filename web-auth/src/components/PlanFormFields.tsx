import { getTodayInputValue, interestOptions, travelTypeOptions, type PlanFormState } from '../plan-shared'

type PlanFormFieldsProps = {
	form: PlanFormState
	onChange: <K extends keyof PlanFormState>(key: K, value: PlanFormState[K]) => void
}

export function PlanFormFields({ form, onChange }: PlanFormFieldsProps) {
	return (
		<div className="form-grid">
			<label className="field">
				Título
				<input value={form.title} onChange={(event) => onChange('title', event.target.value)} required />
			</label>

			<label className="field">
				Visibilidad
				<select value={form.visibility} onChange={(event) => onChange('visibility', event.target.value as PlanFormState['visibility'])}>
					<option value="PUBLIC">PUBLIC</option>
					<option value="PRIVATE">PRIVATE</option>
				</select>
			</label>

			<label className="field">
				Fecha
				<input type="date" min={getTodayInputValue()} value={form.date} onChange={(event) => onChange('date', event.target.value)} required />
			</label>

			<label className="field">
				Hora
				<input type="time" value={form.time} onChange={(event) => onChange('time', event.target.value)} required />
			</label>

			<label className="field">
				Duración en minutos
				<input type="number" min="1" value={form.durationMinutes} onChange={(event) => onChange('durationMinutes', event.target.value)} />
			</label>

			<label className="field field--wide">
				Descripción
				<textarea value={form.description} onChange={(event) => onChange('description', event.target.value)} rows={4} />
			</label>

			<label className="field">
				Máx. participantes
				<input type="number" min="1" value={form.maxSubscribers} onChange={(event) => onChange('maxSubscribers', event.target.value)} />
			</label>

			<label className="field">
				Edad mínima
				<input type="number" min="0" value={form.minAge} onChange={(event) => onChange('minAge', event.target.value)} />
			</label>

			<label className="field">
				Edad máxima
				<input type="number" min="0" value={form.maxAge} onChange={(event) => onChange('maxAge', event.target.value)} />
			</label>

			<label className="field">
				Interés
				<select value={form.interest} onChange={(event) => onChange('interest', event.target.value as PlanFormState['interest'])}>
					{interestOptions.map((option) => (
						<option key={option.value} value={option.value}>
							{option.label}
						</option>
					))}
				</select>
			</label>

			<label className="field">
				Tipo de viaje
				<select value={form.travelType} onChange={(event) => onChange('travelType', event.target.value as PlanFormState['travelType'])}>
					{travelTypeOptions.map((option) => (
						<option key={option.value} value={option.value}>
							{option.label}
						</option>
					))}
				</select>
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