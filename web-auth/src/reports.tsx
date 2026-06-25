import { useEffect, useState } from 'react'

import { getBackendUrl } from './config'
import { Navbar } from './components/Navbar'

type ReportResponse = {
	id: number
	reason: string
	description: string | null
	reporterId: number
	reporterName: string | null
	reportedUserId: number | null
	reportedUserName: string | null
	planId: number | null
	planTitle: string | null
	touristPlaceId: number | null
	touristPlaceName: string | null
	createdAt: string
	resolved: boolean
}

const formatReason = (reason: string): string => {
	return reason
		.split('_')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(' ')
}

const formatDate = (dateString: string): string => {
	const date = new Date(dateString)
	return date.toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	})
}

export function ReportsPage() {
	const [reports, setReports] = useState<ReportResponse[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [filter, setFilter] = useState<'all' | 'unresolved'>('all')

	useEffect(() => {
		async function loadReports() {
			try {
				const backendUrl = getBackendUrl()
				const endpoint = filter === 'unresolved' ? '/api/v1/reports/unresolved' : '/api/v1/reports'
				const response = await fetch(`${backendUrl}${endpoint}`, {
					headers: {
						Accept: 'application/json',
						Authorization: `Bearer ${sessionStorage.getItem('accessToken') || ''}`,
						'ngrok-skip-browser-warning': 'true',
					},
				})

				if (!response.ok) {
					const errorText = await response.text()
					throw new Error(errorText || 'Could not load reports.')
				}

				const data = (await response.json()) as ReportResponse[]
				setReports(data)
				setError('')
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Unknown error')
			} finally {
				setLoading(false)
			}
		}

		loadReports()
	}, [filter])

	async function handleResolveReport(reportId: number) {
		if (!confirm('Are you sure you want to mark this report as resolved?')) {
			return
		}

		try {
			const backendUrl = getBackendUrl()
			const response = await fetch(`${backendUrl}/api/v1/reports/${reportId}/resolve`, {
				method: 'POST',
				headers: {
					Accept: 'application/json',
					Authorization: `Bearer ${sessionStorage.getItem('accessToken') || ''}`,
					'ngrok-skip-browser-warning': 'true',
				},
			})

			if (!response.ok) {
				const errorText = await response.text()
				throw new Error(errorText || 'Could not resolve report.')
			}

			// Reload reports
			setReports(reports.filter((r) => r.id !== reportId || filter === 'all'))
			if (filter === 'all') {
				setReports((prev) => prev.map((r) => (r.id === reportId ? { ...r, resolved: true } : r)))
			}
		} catch (err) {
			alert(err instanceof Error ? err.message : 'Could not resolve report.')
		}
	}

	return (
		<>
			<Navbar />
			<main className="auth-card auth-card--xwide">
				<div className="page-header">
					<div>
						<h1>Reports</h1>
						<p className="subtitle">Manage user reports for plans, tourist places, and users.</p>
					</div>
					<div className="filter-buttons">
						<button
							className={`button ${filter === 'all' ? 'button--primary' : ''}`}
							onClick={() => setFilter('all')}
						>
							All Reports
						</button>
						<button
							className={`button ${filter === 'unresolved' ? 'button--primary' : ''}`}
							onClick={() => setFilter('unresolved')}
						>
							Unresolved
						</button>
					</div>
				</div>

				{loading && <div className="message">Loading reports...</div>}
				{error && <div className="warning">{error}</div>}

				{!loading && !error && reports.length === 0 && (
					<div className="message">No reports found.</div>
				)}

				{!loading && !error && reports.length > 0 && (
					<div className="reports-list">
						{reports.map((report) => (
							<div key={report.id} className={`report-card ${report.resolved ? 'report-card--resolved' : ''}`}>
								<div className="report-header">
									<div className="report-reason">
										<strong>{formatReason(report.reason)}</strong>
										{report.resolved && <span className="badge badge--success">Resolved</span>}
									</div>
									<div className="report-date">{formatDate(report.createdAt)}</div>
								</div>

								<div className="report-details">
									<div className="report-field">
										<span className="field-label">Reporter:</span>
										<span>{report.reporterName || `User #${report.reporterId}`}</span>
									</div>

									{report.reportedUserId && (
										<div className="report-field">
											<span className="field-label">Reported User:</span>
											<span>{report.reportedUserName || `User #${report.reportedUserId}`}</span>
										</div>
									)}

									{report.planId && (
										<div className="report-field">
											<span className="field-label">Plan:</span>
											<a href={`/plans/${report.planId}`} className="link">
												{report.planTitle || `Plan #${report.planId}`}
											</a>
										</div>
									)}

									{report.touristPlaceId && (
										<div className="report-field">
											<span className="field-label"> Tourist Place:</span>
											<a href={`/tourist-places/${report.touristPlaceId}`} className="link">
												{report.touristPlaceName || `Place #${report.touristPlaceId}`}
											</a>
										</div>
									)}

									{report.description && (
										<div className="report-field">
											<span className="field-label">Description:</span>
											<span className="field-description">{report.description}</span>
										</div>
									)}
								</div>

								{!report.resolved && (
									<div className="report-actions">
										<button
											className="button button--primary"
											onClick={() => handleResolveReport(report.id)}
										>
											Mark as Resolved
										</button>
									</div>
								)}
							</div>
						))}
					</div>
				)}
			</main>
		</>
	)
}
