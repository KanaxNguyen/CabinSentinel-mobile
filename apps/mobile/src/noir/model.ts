import type { Incident, Seat, Trip, VehicleStatus } from './api'
import type { Level } from './theme'

export interface CabinView {
  level: Level
  title: string
  detail: string
  seatsText: string
  temp: number | null
  seats: Seat[]
  items: { name: string; seat: string }[]
  people: number | null      // null = no fresh data; never read as zero
  itemCount: number | null
  child: boolean
  updated: string
  fresh: boolean
  incident?: { id: string; revision: number; viewed: boolean }
  restricted?: boolean
  sim?: boolean             // the server is running a simulated scenario
}

const LEVELS: Level[] = ['safe', 'notice', 'warning', 'critical', 'paused']
export const asLevel = (x?: string | null): Level => (LEVELS as string[]).includes(x ?? '') ? (x as Level) : 'unknown'

export const clock = (t?: number | null) => t ? new Date(t * 1000).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'chưa có'

export const unknownView = (why: string): CabinView => ({
  level: 'unknown', title: 'Chưa có dữ liệu từ xe', detail: why, seatsText: 'Chưa có dữ liệu', temp: null, seats: [], items: [],
  people: null, itemCount: null, child: false, updated: 'chưa có', fresh: false,
})

// Same rules as the SwiftUI app's cabinCounts: stale, missing or restricted data never becomes a zero.
export function fromStatus(s: VehicleStatus): CabinView {
  if (s.restricted) return { ...unknownView('Bạn chỉ có quyền xem chuyến đưa đón của bé trên xe này.'), restricted: true, title: 'Chỉ xem đưa đón' }
  const v = s.verdict
  const fresh = !!v && v.current !== false && s.no_real_data !== true
  const seats = s.seats ?? []
  const cameraOk = (s.camera ?? 'ok') === 'ok'
  const counted = fresh && cameraOk && s.seats != null
  const who = seats.filter(x => x.occ)
  const inc = s.incident && s.incident.status === 'open' ? s.incident : undefined
  return {
    level: fresh ? asLevel(v!.level) : 'unknown',
    title: s.no_real_data ? 'Chưa có dữ liệu thật từ xe' : v?.title ?? 'Chưa có kết luận từ máy chủ',
    detail: !fresh ? 'Dữ liệu cũ hoặc thiếu, hãy kiểm tra xe trực tiếp' : v?.sub ?? '',
    seatsText: !counted ? 'Chưa có dữ liệu mới' : who.length ? who.map(x => x.label).join(', ') : 'Không thấy ai',
    temp: s.cabin_temp ?? null,
    seats,
    items: (s.items ?? []).map(i => ({ name: i.name, seat: i.seat })),
    people: counted ? who.length : null,
    itemCount: counted ? (s.items?.length ?? 0) : null,
    child: who.some(x => x.age === 'child'),
    updated: clock(s.last_seen),
    fresh,
    sim: s.source === 'sim',
    incident: inc ? { id: inc.id, revision: inc.revision, viewed: !!inc.viewed_at } : undefined,
  }
}

export const STAGE: Record<string, { label: string; text: (n: string) => string; warn?: boolean }> = {
  waiting: { label: 'CHƯA ĐÓN', text: n => `${n} chưa lên xe` },
  boarded: { label: 'ĐÃ LÊN XE', text: n => `${n} đã lên xe` },
  enroute: { label: 'ĐANG ĐI', text: n => `${n} đang trên đường` },
  arrived: { label: 'ĐÃ TỚI', text: n => `${n} đã tới nơi` },
  leftin: { label: 'CÒN TRÊN XE', text: n => `${n} có thể vẫn còn trên xe`, warn: true },
  late: { label: 'TRỄ GIỜ', text: n => `${n} chưa lên xe quá giờ đón`, warn: true },
}
export const stageOf = (t: Trip) => STAGE[t.stage] ?? { label: t.stage.toUpperCase(), text: (n: string) => n }

export type { Incident }
