// Client for the CabinSentinel backend used by the SwiftUI app (same routes, same JSON, snake_case on the wire).
export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string) { super(message) }
}

export interface Vehicle { id: string; model: string; plate: string; name: string; color: string }
export interface VehicleSummary { vehicle: Vehicle; role: string; level?: string | null; title?: string | null; incident_id?: string | null }
export interface Verdict { level: string; title: string; sub: string; current: boolean; seat?: string | null }
export interface Seat { key: string; label: string; occ: boolean; conf: number; kind?: string | null; age?: string | null }
export interface CabinItem { name: string; seat: string; conf: number }
export interface EventItem { at: number; kind: string; title: string; detail: string; incident_id?: string | null }
export interface Incident {
  id: string; vehicle_id: string; level: string; status: string; revision: number; created_at: number
  viewed_at?: number | null; viewed_by?: string | null; resolved_at?: number | null; resolved_by?: string | null
  reason: string; seat_label?: string | null; elapsed: number; events?: EventItem[] | null
  result?: string | null; reject?: { code: string; title: string; message: string } | null
}
export interface VehicleStatus {
  vehicle: Vehicle; role: string; restricted: boolean; verdict?: Verdict | null
  seats?: Seat[] | null; items?: CabinItem[] | null; cabin_temp?: number | null; camera?: string | null
  last_seen?: number | null; incident?: Incident | null; no_real_data?: boolean | null; source?: string | null
}
export interface TripLog { time: string; title: string; detail: string; source: string }
export interface Trip {
  vehicle_id: string; child: { id: string; name: string; cls: string }; stage: string; log: TripLog[]
  pickup: string; dropoff: string; seat_label: string; progress: number; school?: string | null
}
export interface Me { id: string; phone: string; name: string }
export interface History { incidents: Incident[]; events: EventItem[] }

export class Api {
  constructor(public base: string, public token?: string) {}

  async send<T>(method: string, path: string, body?: unknown, query?: Record<string, string>): Promise<T> {
    const url = new URL(path, this.base.replace(/\/?$/, '/'))
    if (query) for (const [k, v] of Object.entries(query)) url.searchParams.set(k, v)
    const headers: Record<string, string> = { Accept: 'application/json' }
    if (this.token) headers.Authorization = `Bearer ${this.token}`
    if (body !== undefined) headers['Content-Type'] = 'application/json'
    let res: Response
    try {
      res = await fetch(url.toString().replace(/([^:])\/\//g, '$1/'), { method, headers, body: body === undefined ? undefined : JSON.stringify(body), credentials: 'omit' })
    } catch {
      throw new ApiError(0, 'network', 'Không kết nối được máy chủ CabinSentinel. Trạng thái xe chưa được đánh dấu an toàn.')
    }
    if (!res.ok) {
      const data = await res.json().catch(() => undefined) as { detail?: { code?: string; message?: string } } | undefined
      throw new ApiError(res.status, data?.detail?.code ?? `http_${res.status}`, data?.detail?.message ?? (res.status === 422 ? 'Thông tin chưa hợp lệ. Kiểm tra lại.' : `Máy chủ đang bận (lỗi ${res.status}). Thử lại sau.`))
    }
    return await res.json() as T
  }

  health() { return this.send<{ status: string; env?: string }>('GET', '/health') }
  sendOtp(phone: string) { return this.send<{ sent: boolean; expires_in: number; dev_code?: string | null }>('POST', '/v1/auth/otp', { phone }) }
  verify(phone: string, code: string, name: string) { return this.send<{ token: string; user: Me }>('POST', '/v1/auth/verify', { phone, code, name }) }
  logout() { return this.send<unknown>('POST', '/v1/auth/logout').catch(() => undefined) }
  me() { return this.send<Me>('GET', '/v1/me') }
  vehicles() { return this.send<VehicleSummary[]>('GET', '/v1/vehicles') }
  status(id: string) { return this.send<VehicleStatus>('GET', `/v1/vehicles/${encodeURIComponent(id)}/status`) }
  history(id: string, days = 7, level = 'all') { return this.send<History>('GET', `/v1/vehicles/${encodeURIComponent(id)}/history`, undefined, { days: String(days), level }) }
  trips(id: string) { return this.send<Trip[]>('GET', `/v1/vehicles/${encodeURIComponent(id)}/trips`) }
  view(incident: string) { return this.send<Incident>('POST', `/v1/incidents/${encodeURIComponent(incident)}/view`) }
  confirm(incident: string, revision: number, checks: string[]) { return this.send<Incident>('POST', `/v1/incidents/${encodeURIComponent(incident)}/confirm`, { revision, checks }) }
  pickup(child: string, vehicle: string) { return this.send<Trip>('POST', `/v1/trips/${encodeURIComponent(child)}/pickup`, { vehicle_id: vehicle, cabin_checked: false }) }
  dropoff(child: string, vehicle: string, cabinChecked: boolean) { return this.send<Trip>('POST', `/v1/trips/${encodeURIComponent(child)}/dropoff`, { vehicle_id: vehicle, cabin_checked: cabinChecked }) }
}

// Required by the backend for closing an incident (REQUIRED_CHECKS).
export const CHECKS = [
  { k: 'seats', label: 'Đã kiểm tra các ghế' },
  { k: 'floor', label: 'Đã kiểm tra sàn xe, khu vực để chân' },
  { k: 'trunk', label: 'Đã kiểm tra cốp xe' },
]
