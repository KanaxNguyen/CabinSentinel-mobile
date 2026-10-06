import type { Level } from './theme'

// Everything in this file is SIMULATED. The UI labels it "Mô phỏng" wherever it is shown.
export type Scenario = 'safe' | 'warning' | 'critical'

export interface CabinView {
  level: Level
  title: string
  detail: string
  seat: string
  temp: number | null
  children: number | null
  items: number | null
  updated: string
  fresh: boolean
}

export const SCENARIOS: Record<Scenario, CabinView> = {
  safe: { level: 'safe', title: 'Không thấy ai trong xe', detail: 'Xe đã khóa, cập nhật vừa xong', seat: 'Không thấy ai', temp: 20, children: 0, items: 0, updated: 'vừa xong', fresh: true },
  warning: { level: 'warning', title: 'Có người ở ghế sau', detail: 'Xe đã đỗ, camera thấy người ở ghế sau trái', seat: 'Ghế sau trái: có người', temp: 31, children: 1, items: 1, updated: 'vừa xong', fresh: true },
  critical: { level: 'critical', title: 'Người còn trong xe, nhiệt độ cao', detail: 'Đã báo cả gia đình. Hãy kiểm tra xe ngay.', seat: 'Ghế sau trái: có người', temp: 38, children: 1, items: 1, updated: 'vừa xong', fresh: true },
}

export interface TripStage { key: string; label: string; text: string; note?: string }
export const TRIP: TripStage[] = [
  { key: 'waiting', label: 'CHƯA ĐÓN', text: 'An chưa lên xe', note: 'Dự kiến đón lúc 06:45. Bạn sẽ được báo ngay khi bé lên xe.' },
  { key: 'boarded', label: 'ĐÃ LÊN XE', text: 'An đã lên xe', note: 'Camera trong xe ghi nhận có người ở ghế sau trái lúc 06:47.' },
  { key: 'enroute', label: 'ĐANG ĐI', text: 'Xe đang tới trường', note: 'Dự kiến tới lúc 07:10.' },
  { key: 'arrived', label: 'ĐÃ TỚI', text: 'Xe đã tới trường', note: 'Camera không còn thấy người trong xe.' },
  { key: 'leftin', label: 'CÒN TRÊN XE', text: 'An có thể vẫn còn trên xe', note: 'Xe đã đỗ, camera vẫn thấy người. Đã báo cả gia đình.' },
]

export const HISTORY = [
  { id: 'h1', when: '07:22', level: 'critical' as Level, title: 'Người còn trong xe, nhiệt độ cao', status: 'Đã xử lý sau khi xác nhận kiểm tra xe' },
  { id: 'h2', when: '07:14', level: 'warning' as Level, title: 'Có người ở ghế sau', status: 'Đã xem, chưa xử lý' },
  { id: 'h3', when: '06:47', level: 'notice' as Level, title: 'An đã lên xe', status: 'Đưa đón' },
  { id: 'h4', when: '06:40', level: 'safe' as Level, title: 'Không thấy ai trong xe', status: 'Bình thường' },
]
