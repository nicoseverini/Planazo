import { useState } from 'react'
import type { FormEvent } from 'react'

import { getBackendUrl } from './config'

type LoginStatus = 'idle' | 'loading' | 'success' | 'error'

type LoginResponse = {
	accessToken: string
	refreshToken: string | null
}

type JwtPayload = {
	role?: string
	sub?: string
}

function decodeJwt(token: string): JwtPayload {
	try {
		const payload = token.split('.')[1]
		if (!payload) {
			return {}
		}

		const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
		const jsonPayload = atob(normalized)
			.split('')
			.map((character) => `%${character.charCodeAt(0).toString(16).padStart(2, '0')}`)
			.join('')

		return JSON.parse(decodeURIComponent(jsonPayload)) as JwtPayload
	} catch {
		return {}
	}
}

function buildMessage(role: string | undefined) {
	if (role === 'ADMIN') {
		return 'Session started with admin privileges.'
	}

	if (role) {
		return `Session started with role ${role}.`
	}

	return 'Session started correctly.'
}

export function LoginPage() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [status, setStatus] = useState<LoginStatus>('idle')
	const [message, setMessage] = useState('')

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault()

		setStatus('loading')
		setMessage('')

		try {
			const backendUrl = getBackendUrl()
			const response = await fetch(`${backendUrl}/api/v1/auth/token-admin`, {
				method: 'POST',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
          //"ngrok-skip-browser-warning": "true"
				},
				body: JSON.stringify({
					email: email.trim(),
					password,
				}),
			})

			if (!response.ok) {
				const errorText = await response.text()
				setStatus('error')
				setMessage(errorText || 'Failed to login.')
				return
			}

			const data = (await response.json()) as LoginResponse
			const decoded = decodeJwt(data.accessToken)

			sessionStorage.setItem('accessToken', data.accessToken)
			if (data.refreshToken) {
				sessionStorage.setItem('refreshToken', data.refreshToken)
			}

			setStatus('success')
			setMessage(buildMessage(decoded.role))
			window.location.assign('/plans')
		} catch (err) {
			setStatus('error')
			setMessage(`Error connecting to the server: ${err instanceof Error ? err.message : 'Unknown error'}`)
		}
	}

	return (
		<main className="auth-card auth-card--wide">
			<h1>Log In</h1>
			<p className="subtitle">Log in with the admin account.</p>

			<form onSubmit={handleSubmit} className="form-stack">
				<label className="field">
					Email
					<input
						type="email"
						value={email}
						onChange={(event) => setEmail(event.target.value)}
						autoComplete="email"
						required
						disabled={status === 'loading'}
					/>
				</label>

				<label className="field">
					Password
					<input
						type="password"
						value={password}
						onChange={(event) => setPassword(event.target.value)}
						autoComplete="current-password"
						required
						disabled={status === 'loading'}
					/>
				</label>

				<button className="button" type="submit" disabled={status === 'loading'}>
					{status === 'loading' ? 'Logging in...' : 'Log In'}
				</button>
			</form>

			{status === 'error' && <div className="warning">{message}</div>}
		</main>
	)
}
