import type { Trip, EventItem } from './api'
import type { CabinView } from './model'

// Everything here is SIMULATED. The UI labels it "Mô phỏng" wherever it is shown.
export type Scenario = 'safe' | 'warning' | 'critical'

const rear = { key: 'rear_left', label: 'Ghế sau trái', occ: true, conf: 0.93, kind: 'person', age: 'child' }
const base: CabinView = { level: 'safe', title: '', detail: '', seatsText: '', temp: 20, seats: [], items: [], people: 0, itemCount: 0, child: false, updated: 'vừa xong', fresh: true }

export const SCENARIOS: Record<Scenario, CabinView> = {
  safe: { ...base, title: 'Không thấy ai trong xe', detail: 'Xe đã khóa, cập nhật vừa xong', seatsText: 'Không thấy ai' },
  warning: { ...base, level: 'warning', title: 'Có người ở ghế sau', detail: 'Xe đã đỗ, camera thấy người ở ghế sau trái', seatsText: 'Ghế sau trái', temp: 31, seats: [rear], items: [{ name: 'Cặp sách', seat: 'rear_left' }], people: 1, itemCount: 1, child: true, incident: { id: 'demo', revision: 1, viewed: false } },
  critical: { ...base, level: 'critical', title: 'Người còn trong xe, nhiệt độ cao', detail: 'Đã báo cả gia đình. Hãy kiểm tra xe ngay.', seatsText: 'Ghế sau trái', temp: 38, seats: [rear], items: [{ name: 'Cặp sách', seat: 'rear_left' }], people: 1, itemCount: 1, child: true, incident: { id: 'demo', revision: 1, viewed: false } },
}

const log = (time: string, title: string, detail: string): Trip['log'][number] => ({ time, title, detail, source: 'Mô phỏng' })
const kid = { id: 'demo', name: 'An', cls: '2A' }
export const DEMO_TRIPS: Trip[] = ['waiting', 'boarded', 'enroute', 'arrived', 'leftin'].map((stage, i) => ({
  vehicle_id: 'demo', child: kid, stage, pickup: '06:45', dropoff: '16:30', seat_label: 'Ghế sau trái', progress: [0, 10, 55, 100, 100][i]!, school: 'Trường Tiểu học',
  log: [log('06:45', 'Chờ đón', 'Dự kiến đón lúc 06:45'), ...(i > 0 ? [log('06:47', 'An đã lên xe', 'Camera trong xe thấy người ở ghế sau trái')] : []), ...(i === 4 ? [log('07:30', 'Xe đã đỗ, camera vẫn thấy người', 'Đã báo cả gia đình')] : [])],
}))

export const DEMO_EVENTS: EventItem[] = [
  { at: 0, kind: 'resolved', title: 'Đã kiểm tra xe', detail: 'Sự cố đã đóng sau khi camera không còn thấy người', incident_id: null },
  { at: 0, kind: 'ack', title: 'Đã xem', detail: 'Sự cố vẫn mở cho tới khi có người xác nhận đã kiểm tra xe', incident_id: null },
  { at: 0, kind: 'alert', title: 'Có người ở ghế sau', detail: 'Xe đã đỗ, camera thấy người', incident_id: null },
]
export const DEMO_TIMES = ['07:22', '07:14', '07:12']
