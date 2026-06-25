import { useState } from 'react'

type DeleteReason = 'INAPPROPRIATE_CONTENT' | 'FALSE_DATA' | 'SPAM' | 'HARASSMENT' | 'COPYRIGHT_INFRINGEMENT' | 'VIOLATES_TERMS' | 'OTHER'

const DELETION_REASONS: { value: DeleteReason; label: string }[] = [
	{ value: 'INAPPROPRIATE_CONTENT', label: 'Inappropriate content' },
	{ value: 'FALSE_DATA', label: 'False data' },
	{ value: 'SPAM', label: 'Spam' },
	{ value: 'HARASSMENT', label: 'Harassment' },
	{ value: 'COPYRIGHT_INFRINGEMENT', label: 'Copyright infringement' },
	{ value: 'VIOLATES_TERMS', label: 'Violates terms of service' },
	{ value: 'OTHER', label: 'Other' },
]

type DeleteConfirmationModalProps = {
	isOpen: boolean
	onClose: () => void
	onConfirm: (reason?: string) => void
	title: string
	message: string
	isLoading?: boolean
}

export function DeleteConfirmationModal({
	isOpen,
	onClose,
	onConfirm,
	title,
	message,
	isLoading = false,
}: DeleteConfirmationModalProps) {
	const [sendEmail, setSendEmail] = useState(false)
	const [selectedReason, setSelectedReason] = useState<DeleteReason | null>(null)
	const [customReason, setCustomReason] = useState('')

	if (!isOpen) return null

	const handleConfirm = () => {
		if (sendEmail && selectedReason) {
			const reasonText = selectedReason === 'OTHER' ? customReason.trim() : selectedReason
			onConfirm(reasonText)
		} else {
			onConfirm()
		}
	}

	return (
		<div className="modal-overlay" onClick={onClose}>
			<div className="modal" onClick={(e) => e.stopPropagation()}>
				<div className="modal-header">
					<h2>{title}</h2>
					<button className="modal-close" onClick={onClose} disabled={isLoading}>
						×
					</button>
				</div>
				<div className="modal-body">
					<p>{message}</p>
					<div className="form-group">
						<label className="checkbox-label">
							<input
								type="checkbox"
								checked={sendEmail}
								onChange={(e) => setSendEmail(e.target.checked)}
								disabled={isLoading}
							/>
							Send email to owner
						</label>
					</div>
					{sendEmail && (
						<>
							<div className="form-group">
								<label>Reason for deletion:</label>
								<div className="reason-options">
									{DELETION_REASONS.map((reason) => (
										<label key={reason.value} className="radio-label">
											<input
												type="radio"
												name="deletion-reason"
												value={reason.value}
												checked={selectedReason === reason.value}
												onChange={() => setSelectedReason(reason.value)}
												disabled={isLoading}
											/>
											<span>{reason.label}</span>
										</label>
									))}
								</div>
							</div>
							{selectedReason === 'OTHER' && (
								<div className="form-group">
									<label htmlFor="custom-reason">Please specify the reason:</label>
									<textarea
										id="custom-reason"
										value={customReason}
										onChange={(e) => setCustomReason(e.target.value)}
										disabled={isLoading}
										rows={3}
										maxLength={500}
										placeholder="Please provide a reason for this deletion..."
									/>
									<small className="hint">{customReason.length}/500 characters</small>
								</div>
							)}
						</>
					)}
				</div>
				<div className="modal-footer">
					<button className="button button--secondary" onClick={onClose} disabled={isLoading}>
						Cancel
					</button>
					<button
						className="button button--danger"
						onClick={handleConfirm}
						disabled={isLoading || (sendEmail && !selectedReason)}
					>
						{isLoading ? 'Deleting...' : 'Delete'}
					</button>
				</div>
			</div>
		</div>
	)
}
