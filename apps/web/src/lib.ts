export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

export type User = {
  id: number
  discordId: string
  username: string
  avatar: string | null
  bullyPoints: number
  role: 'MEMBER' | 'MODERATOR' | 'ADMIN'
}

export async function getMe(): Promise<User | null> {
  const response = await fetch(`${API_URL}/api/auth/me`, { credentials: 'include' })
  if (response.status === 401) return null
  if (!response.ok) throw new Error('Falha ao carregar usuário')
  return response.json()
}
