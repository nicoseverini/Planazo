import { useEffect, useState } from 'react'

import { getBackendUrl } from './config'

type PlanSummary = {
	id: number
	title: string
	creatorName: string
}

type PaginatedPlansResponse = {
	content: PlanSummary[]
	totalPages: number
	totalElements: number
	number: number
	size: number
	first: boolean
	last: boolean
}

export function PlansPage() {
	const [plans, setPlans] = useState<PlanSummary[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [page, setPage] = useState(0)
	const [totalPages, setTotalPages] = useState(0)
	const pageSize = 3

	useEffect(() => {
		let isMounted = true

		async function loadPlans() {
			try {
				const backendUrl = getBackendUrl()
				const response = await fetch(`${backendUrl}/api/v1/plans/paginated?page=${page}&size=${pageSize}`, {
					headers: {
						Accept: 'application/json',
						Authorization: `Bearer ${sessionStorage.getItem('accessToken') || ''}`,
						'ngrok-skip-browser-warning': 'true',
					},
				})

				if (!response.ok) {
					const errorText = await response.text()
					throw new Error(errorText || 'No se pudieron cargar los planes.')
				}

				const data = (await response.json()) as PaginatedPlansResponse
				if (isMounted) {
					setPlans(data.content)
					setTotalPages(data.totalPages)
					setError('')
				}
			} catch (err) {
				if (isMounted) {
					setError(err instanceof Error ? err.message : 'Error desconocido')
				}
			} finally {
				if (isMounted) {
					setLoading(false)
				}
			}
		}

		void loadPlans()

		return () => {
			isMounted = false
		}
	}, [page])

	return (
		<main className="auth-card auth-card--xwide">
			<div className="page-header">
				<div>
					<h1>Plans</h1>
					<p className="subtitle">Estos son los nombres de los planes disponibles.</p>
				</div>
				<a className="button button--secondary" href="/create-plan">
					Crear plan
				</a>
			</div>

			{loading && <div className="message">Cargando planes...</div>}
			{error && <div className="warning">{error}</div>}

			{!loading && !error && (
				<ul className="plans-list">
					{plans.length > 0 ? (
						plans.map((plan) => (
							<li key={plan.id} className="plan-item">
								<div className="plan-title">
									<a href={`/plans/${plan.id}`}>{plan.title}</a>
								</div>
								<div className="plan-creator">{plan.creatorName}</div>
								<div className="plan-item-actions">
									<a className="button button--secondary" href={`/plans/${plan.id}`}>
										Ver detalles
									</a>
								</div>
							</li>
						))
					) : (
						<li className="plan-item">
							<div className="plan-title">No hay planes disponibles.</div>
						</li>
					)}
				</ul>
			)}

			{!loading && !error && totalPages > 1 && (
				<div className="plans-actions">
					<button className="button button--secondary" type="button" onClick={() => setPage((current) => Math.max(0, current - 1))} disabled={page === 0}>
						Anterior
					</button>
					<div className="token-label">
						Página {page + 1} de {totalPages}
					</div>
					<button
						className="button button--secondary"
						type="button"
						onClick={() => setPage((current) => current + 1)}
						disabled={page + 1 >= totalPages}
					>
						Siguiente
					</button>
				</div>
			)}

		</main>
	)
}