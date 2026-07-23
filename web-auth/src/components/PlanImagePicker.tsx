import { useRef } from 'react'
import type { ChangeEvent } from 'react'

import { readFileAsDataUrl } from '../plan-shared'

type PlanImagePickerProps = {
	images: string[]
	onChange: (images: string[]) => void
	label?: string
	hint?: string
}

export function PlanImagePicker({ images, onChange, label = 'Images', hint }: PlanImagePickerProps) {
	const fileInputRef = useRef<HTMLInputElement>(null)

	async function handleImageSelection(event: ChangeEvent<HTMLInputElement>) {
		const files = Array.from(event.target.files ?? [])
		if (!files.length) {
			return
		}

		try {
			const selectedImages = await Promise.all(files.map(async (file) => readFileAsDataUrl(file)))
			onChange([...images, ...selectedImages])
			event.target.value = ''
		} catch {
			event.target.value = ''
		}
	}

	function openImagePicker() {
		fileInputRef.current?.click()
	}

	function removeImage(index: number) {
		onChange(images.filter((_, currentIndex) => currentIndex !== index))
	}

	return (
		<label className="field field--wide">
			{label}
			<div className="image-picker">
				<input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageSelection} hidden />
				<button type="button" className="button button--secondary image-picker-button" onClick={openImagePicker}>
					Add Images
				</button>
				{images.length > 0 && (
					<div className="image-preview-grid">
						{images.map((image, index) => (
							<figure key={`${image}-${index}`} className="image-preview-card">
								<img src={image} alt={`${label} ${index + 1}`} />
								<figcaption className="image-preview-meta">
									<span className="token-label">Image {index + 1}</span>
									<button type="button" className="image-remove-button" onClick={() => removeImage(index)}>
										Remove
									</button>
								</figcaption>
							</figure>
						))}
					</div>
				)}
				{hint && <div className="hint">{hint}</div>}
			</div>
		</label>
	)
}