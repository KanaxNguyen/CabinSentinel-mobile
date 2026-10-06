// Saved on this browser only. The token is a bearer session token issued by the server after OTP sign-in.
export interface Session { server: string; token?: string; vehicle?: string; live: boolean; name?: string; phone?: string }

const KEY = 'cabinnoir.session.v1'
const defaults: Session = { server: process.env.EXPO_PUBLIC_API_BASE_URL ?? '', live: false }

export function loadSession(): Session {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(KEY) : null
    return raw ? { ...defaults, ...(JSON.parse(raw) as Partial<Session>) } : defaults
  } catch { return defaults }
}

export function saveSession(s: Session) {
  try { if (typeof localStorage !== 'undefined') localStorage.setItem(KEY, JSON.stringify(s)) } catch { /* private mode: keep in memory only */ }
}
