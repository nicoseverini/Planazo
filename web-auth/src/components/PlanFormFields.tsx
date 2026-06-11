import { getTodayInputValue, interestOptions, travelTypeOptions, type PlanFormState } from '../plan-shared'

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
				Date
				<input type="date" min={getTodayInputValue()} value={form.date} onChange={(event) => onChange('date', event.target.value)} required />
			</label>

			<label className="field">
				Time
				<input type="time" value={form.time} onChange={(event) => onChange('time', event.target.value)} required />
			</label>

			<label className="field">
				Duration in minutes
				<input type="number" min="1" value={form.durationMinutes} onChange={(event) => onChange('durationMinutes', event.target.value)} />
			</label>

			<label className="field field--wide">
				Description
				<textarea value={form.description} onChange={(event) => onChange('description', event.target.value)} rows={4} />
			</label>

			<label className="field">
				Max. participants
				<input type="number" min="1" value={form.maxSubscribers} onChange={(event) => onChange('maxSubscribers', event.target.value)} />
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
				Travel Type
				<select value={form.travelType} onChange={(event) => onChange('travelType', event.target.value as PlanFormState['travelType'])}>
					{travelTypeOptions.map((option) => (
						<option key={option.value} value={option.value}>
							{option.label}
						</option>
					))}
				</select>
			</label>

			<label className="field field--wide">
				Location
				<input value={form.location} onChange={(event) => onChange('location', event.target.value)} required />
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