import { getTodayInputValue, interestOptions, type PlanFormState } from '../plan-shared'

type PlanFormFieldsProps = {
	form: PlanFormState
	onChange: <K extends keyof PlanFormState>(key: K, value: PlanFormState[K]) => void
}

export function PlanFormFields({ form, onChange }: PlanFormFieldsProps) {
	return (
		<div className="form-grid">
			<label className="field">
				Title
				<input value={form.title} onChange=
				{(event) => onChange('title', event.target.value)} required />
			</label>

			<label className="field">
				Visibility
				<select value={form.visibility} onChange={(event) => onChange('visibility', event.target.value as PlanFormState['visibility'])}>
					<option value="PUBLIC">PUBLIC</option>
					<option value="PRIVATE">PRIVATE</option>
				</select>
			</label>

			<label className="field">
				Start Date
				<input type="date" min={getTodayInputValue()} value={form.startDate} onChange={(event) => {
					const val = event.target.value
					onChange('startDate', val)
					// Auto-copy to end date
					if (!form.endDate) onChange('endDate', val)
				}} required />
			</label>

			<label className="field">
				Start Time
				<input type="time" value={form.startTime} onChange={(event) => {
					const val = event.target.value
					onChange('startTime', val)
					// Auto-set end time to 1 hour later
					if (!form.endTime && val) {
						const [h, m] = val.split(':')
						const nextHour = ((Number(h) + 1) % 24).toString().padStart(2, '0')
						onChange('endTime', `${nextHour}:${m}`)
					}
				}} required />
			</label>

			<label className="field">
				End Date
				<input type="date" min={getTodayInputValue()} value={form.endDate} onChange={(event) => onChange('endDate', event.target.value)} required />
			</label>

			<label className="field">
				End Time
				<input type="time" value={form.endTime} onChange={(event) => onChange('endTime', event.target.value)} required />
			</label>

			<label className="field field--wide">
				Description
				<textarea value={form.description} onChange={(event) => onChange('description', event.target.value)} rows={4} />
			</label>

			<label className="field">
				Max. participants
				<input type="number" min="1" max="99999" placeholder="e.g. 10" value={form.maxSubscribers} onChange={(event) => onChange('maxSubscribers', event.target.value)} required />
			</label>

			<label className="field">
				Budget (optional)
				<input type="number" min="0" max="9999999" step="any" placeholder="0" value={form.budget} onChange={(event) => onChange('budget', event.target.value)} />
			</label>

			<label className="field">
				Min. age
				<input type="number" min="0" value={form.minAge} onChange={(event) => onChange('minAge', event.target.value)} />
			</label>

			<label className="field">
				Max. age
				<input type="number" min="0" value={form.maxAge} onChange={(event) => onChange('maxAge', event.target.value)} />
			</label>

            <div className="field field--wide">
                <span className="field-label">Interests</span>
                <div className="checkbox-group">
                    {interestOptions.map((option) => {
                        const isChecked = form.interests?.includes(option.value as any) || false;

                        const handleCheckboxChange = () => {
                            let updatedInterests: any[];

                            if (isChecked) {
                                updatedInterests = form.interests.filter((item: any) => item !== option.value);
                            } else {
                                updatedInterests = [...(form.interests || []), option.value];
                            }

                            onChange('interests', updatedInterests as any);
                        };

                        return (
                            <label key={option.value} className="checkbox-item">
                                <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={handleCheckboxChange}
                                />
                                <span className="checkbox-label">{option.label}</span>
                            </label>
                        );
                    })}
                </div>
            </div>

			<label className="field">
				Country
				<input value={form.country} onChange={(event) => onChange('country', event.target.value)} required placeholder="e.g. Argentina" />
			</label>

			<label className="field">
				City
				<input value={form.city} onChange={(event) => onChange('city', event.target.value)} required placeholder="e.g. Buenos Aires" />
			</label>

			<label className="field field--wide">
				Address
				<input value={form.address} onChange={(event) => onChange('address', event.target.value)} required placeholder="e.g. Av. Paseo Colón 850" />
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
