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
	turisticPlaceId: number | null
	turisticPlaceName: string | null
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
	// Ensure the date is interpreted as UTC by appending 'Z' if not present
	const utcDateString = dateString.endsWith('Z') ? dateString : dateString + 'Z'
	const date = new Date(utcDateString)
	return new Intl.DateTimeFormat('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
		timeZone: 'America/Argentina/Buenos_Aires',
		hour12: false,
	}).format(date)
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
						<p className="subtitle">Manage user reports for plans, turistic places, and users.</p>
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
										<a href={`/users/${report.reporterId}`} className="link">
											{report.reporterName || `User #${report.reporterId}`}
										</a>
									</div>

									{report.reportedUserId && (
										<div className="report-field">
											<span className="field-label">Reported User:</span>
											<a href={`/users/${report.reportedUserId}`} className="link">
												{report.reportedUserName || `User #${report.reportedUserId}`}
											</a>
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

									{report.turisticPlaceId && (
										<div className="report-field">
											<span className="field-label">Turistic Place:</span>
											<a href={`/turistic-places/${report.turisticPlaceId}`} className="link">
												{report.turisticPlaceName || `Place #${report.turisticPlaceId}`}
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
