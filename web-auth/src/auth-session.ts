type JwtPayload = {
	role?: string
}

function decodeBase64Url(value: string) {
	const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
	const padding = '='.repeat((4 - (normalized.length % 4)) % 4)
	return atob(normalized + padding)
}

export function getAccessTokenRole(token: string | null) {
	if (!token) {
		return null
	}

	try {
		const payloadPart = token.split('.')[1]
		if (!payloadPart) {
			return null
		}

		const payload = JSON.parse(decodeBase64Url(payloadPart)) as JwtPayload
		return payload.role ?? null
	} catch {
		return null
	}
}
