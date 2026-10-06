import { useCallback, useEffect, useState } from 'react'
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import { CabinSentinelClient } from '@cabinsentinel/api-client'
import type { V1CabinState } from '@cabinsentinel/contracts'
import { SCENARIOS, type CabinView, type Scenario } from './src/noir/demo'
import { Home } from './src/noir/Home'
import { Account, History, School } from './src/noir/Screens'
import { N, type Level } from './src/noir/theme'

const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL
const vehicleId = process.env.EXPO_PUBLIC_VEHICLE_ID || 'CAR_1'
const client = apiBaseUrl ? new CabinSentinelClient({ baseUrl: apiBaseUrl, credentials: 'omit' }) : undefined

const LEVELS: Record<string, Level> = { safe: 'safe', notice: 'notice', warning: 'warning', critical: 'critical' }

// Live state never invents anything: a missing or stale value stays unknown, and unknown is never shown as safe.
function fromLive(state: V1CabinState | undefined, failure: string | undefined): CabinView {
  if (!state) return { level: 'unknown', title: 'Chưa có dữ liệu từ xe', detail: failure ?? 'Chưa có trạng thái đã xác minh. Hãy kiểm tra xe trực tiếp.', seat: 'Chưa có dữ liệu', temp: null, children: null, items: null, updated: 'chưa có', fresh: false }
  const level = LEVELS[(state.risk_level ?? '').toLowerCase()] ?? 'unknown'
  const objects = state.detected_objects ?? []
  const when = state.evaluated_at ?? state.freshness?.as_of
  return {
    level: state.decision_current === true ? level : 'unknown',
    title: state.reason || 'Không có lý do từ máy chủ',
    detail: state.decision_current === true ? 'Trạng thái từ máy chủ' : 'Đây là trạng thái cũ, hãy kiểm tra xe trực tiếp',
    seat: state.occupancy_state || 'Chưa có dữ liệu',
    temp: state.temperature ?? null,
    children: null,
    items: objects.length ? objects.length : null,
    updated: when ? new Date(when).toLocaleTimeString('vi-VN') : 'chưa có',
    fresh: state.decision_current === true,
  }
}

type Tab = 'car' | 'school' | 'history' | 'account'
const TABS: { key: Tab; label: string; icon: React.ComponentProps<typeof Ionicons>['name'] }[] = [
  { key: 'car', label: 'Xe', icon: 'car-sport' },
  { key: 'school', label: 'Đưa đón', icon: 'people' },
  { key: 'history', label: 'Lịch sử', icon: 'time' },
  { key: 'account', label: 'Tài khoản', icon: 'person-circle' },
]

export default function App() {
  const [tab, setTab] = useState<Tab>('car')
  const [scenario, setScenario] = useState<Scenario>('safe')
  const [live, setLive] = useState(false)
  const [state, setState] = useState<V1CabinState>()
  const [failure, setFailure] = useState<string>()

  const refresh = useCallback(async () => {
    if (!client) { setFailure('Chưa cấu hình địa chỉ máy chủ.'); return }
    try { setState(await client.v1State(vehicleId)); setFailure(undefined) } catch (e) { setState(undefined); setFailure(e instanceof Error ? e.message : 'Máy chủ không phản hồi') }
  }, [])
  useEffect(() => { if (live) void refresh() }, [live, refresh])

  const view = live ? fromLive(state, failure) : SCENARIOS[scenario]
  const liveNote = state ? 'Đang hiển thị trạng thái thật từ máy chủ.' : `Máy chủ thật: ${failure ?? 'đang tải'}. Không có dữ liệu thì không hiển thị là an toàn.`

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar style="light" />
      <View style={{ flex: 1 }}>
        {tab === 'car' && <Home view={view} simulated={!live} scenario={scenario} onScenario={setScenario} />}
        {tab === 'school' && <School />}
        {tab === 'history' && <History />}
        {tab === 'account' && <Account live={live} onLive={setLive} apiConfigured={!!client} liveNote={liveNote} />}
      </View>
      <View style={s.barWrap} pointerEvents="box-none">
        <View style={s.bar}>
          {TABS.map(t => {
            const on = tab === t.key
            return (
              <Pressable key={t.key} accessibilityRole="tab" accessibilityState={{ selected: on }} onPress={() => setTab(t.key)} style={[s.tab, on && s.tabOn]}>
                <Ionicons name={t.icon} size={22} color={on ? N.accent : N.ink2} />
                <Text style={[s.tabText, on && { color: N.accent }]}>{t.label}</Text>
              </Pressable>
            )
          })}
        </View>
      </View>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: N.canvas },
  barWrap: { position: 'absolute', left: 0, right: 0, bottom: 14, alignItems: 'center' },
  bar: { flexDirection: 'row', gap: 4, padding: 6, borderRadius: 34, backgroundColor: 'rgba(40,40,44,0.92)', borderWidth: 1, borderColor: N.line, width: '92%', maxWidth: 480 },
  tab: { flex: 1, alignItems: 'center', gap: 2, paddingVertical: 8, borderRadius: 28 },
  tabOn: { backgroundColor: 'rgba(255,255,255,0.10)' },
  tabText: { color: N.ink2, fontSize: 11, fontWeight: '600' },
})
