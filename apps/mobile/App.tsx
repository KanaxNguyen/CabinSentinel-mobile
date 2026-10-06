import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import { Api, ApiError, type EventItem, type Me, type Trip, type VehicleSummary } from './src/noir/api'
import { DEMO_EVENTS, DEMO_TIMES, DEMO_TRIPS, SCENARIOS, type Scenario } from './src/noir/demo'
import { Home, type IncidentActions } from './src/noir/Home'
import { fromStatus, unknownView, type CabinView } from './src/noir/model'
import { Account, History, Login, School } from './src/noir/Screens'
import { loadSession, saveSession, type Session } from './src/noir/session'
import { FONT, material, N } from './src/noir/theme'
import { Button } from './src/noir/ui'

type Tab = 'car' | 'school' | 'history' | 'account'
const TABS: { key: Tab; label: string; icon: React.ComponentProps<typeof Ionicons>['name'] }[] = [
  { key: 'car', label: 'Xe', icon: 'car-sport' },
  { key: 'school', label: 'Đưa đón', icon: 'people' },
  { key: 'history', label: 'Lịch sử', icon: 'time' },
  { key: 'account', label: 'Tài khoản', icon: 'person-circle' },
]
const POLL_MS = 5000

export default function App() {
  const [session, setSession] = useState<Session>(loadSession)
  const [tab, setTab] = useState<Tab>('car')
  const [scenario, setScenario] = useState<Scenario>('safe')
  const [demoViewed, setDemoViewed] = useState(false)
  const [demoStage, setDemoStage] = useState(0)

  const [view, setView] = useState<CabinView>()
  const [trips, setTrips] = useState<Trip[]>([])
  const [events, setEvents] = useState<EventItem[]>([])
  const [vehicles, setVehicles] = useState<VehicleSummary[]>([])
  const [me, setMe] = useState<Me>()
  const [error, setError] = useState<string>()
  const [serverStatus, setServerStatus] = useState<string>()

  const live = session.live
  const update = useCallback((patch: Partial<Session>) => setSession(s => { const n = { ...s, ...patch }; saveSession(n); return n }), [])
  const api = useMemo(() => new Api(session.server, session.token), [session.server, session.token])
  const signedIn = live && !!session.token && !!session.server
  const tabRef = useRef(tab); tabRef.current = tab

  const signOut = useCallback(() => { if (session.token) void api.logout(); update({ token: undefined, vehicle: undefined }); setView(undefined); setVehicles([]); setMe(undefined) }, [api, session.token, update])
  const fail = useCallback((e: unknown) => {
    if (e instanceof ApiError && e.status === 401) { signOut(); setError('Phiên đăng nhập đã hết hạn. Đăng nhập lại.'); return }
    setError(e instanceof Error ? e.message : 'Máy chủ không phản hồi')
  }, [signOut])

  // Live data. A failed or empty response never turns into a "safe" view.
  const refresh = useCallback(async () => {
    if (!signedIn) return
    try {
      let list = vehicles
      if (!list.length) { list = await api.vehicles(); setVehicles(list); setMe(await api.me()) }
      const id = session.vehicle && list.some(v => v.vehicle.id === session.vehicle) ? session.vehicle : list[0]?.vehicle.id
      if (!id) { setView(unknownView('Chưa có xe nào. Liên kết xe trên ứng dụng điện thoại.')); setError(undefined); return }
      if (id !== session.vehicle) update({ vehicle: id })
      setView(fromStatus(await api.status(id)))
      if (tabRef.current === 'school') setTrips(await api.trips(id))
      if (tabRef.current === 'history') setEvents((await api.history(id)).events)
      setError(undefined)
    } catch (e) {
      setView(unknownView(e instanceof Error ? e.message : 'Máy chủ không phản hồi'))
      fail(e)
    }
  }, [api, fail, session.vehicle, signedIn, update, vehicles])

  useEffect(() => {
    if (!signedIn) return
    void refresh()
    const t = setInterval(() => void refresh(), POLL_MS)
    return () => clearInterval(t)
  }, [signedIn, refresh, tab])

  useEffect(() => {
    if (!live || !session.server) { setServerStatus(undefined); return }
    let stop = false
    new Api(session.server).health().then(h => { if (!stop) setServerStatus(`Máy chủ phản hồi (${h.env ?? 'ok'}).`) }).catch(() => { if (!stop) setServerStatus('Không kết nối được máy chủ này.') })
    return () => { stop = true }
  }, [live, session.server])

  const demoView: CabinView = useMemo(() => {
    const v = SCENARIOS[scenario]
    return v.incident ? { ...v, incident: { ...v.incident, viewed: demoViewed } } : v
  }, [scenario, demoViewed])
  const shown = live ? (view ?? unknownView(signedIn ? 'Đang tải trạng thái xe…' : 'Chưa đăng nhập.')) : demoView

  const actions: IncidentActions = live
    ? {
        view: async () => { if (shown.incident) { try { await api.view(shown.incident.id); await refresh() } catch (e) { fail(e) } } },
        confirm: async checks => {
          if (!shown.incident) return { closed: false, message: 'Không có sự cố đang mở.' }
          try {
            const r = await api.confirm(shown.incident.id, shown.incident.revision, checks)
            await refresh()
            return r.result === 'resolved'
              ? { closed: true, message: 'Hệ thống không còn phát hiện người trong xe. Cả gia đình đã nhận thông báo.' }
              : { closed: false, message: r.reject?.message ?? 'Máy chủ chưa chấp nhận xác nhận.' }
          } catch (e) { return { closed: false, message: e instanceof Error ? e.message : 'Không gửi được xác nhận.' } }
        },
      }
    : {
        view: async () => setDemoViewed(true),
        confirm: async () => ({ closed: false, message: 'Camera mô phỏng vẫn thấy người trong xe, nên sự cố chưa được đóng. Chọn kịch bản "Bình thường" để mô phỏng người đã rời xe.' }),
      }

  const pickTrips = live ? trips : [DEMO_TRIPS[demoStage]!]
  const doTrip = (kind: 'pickup' | 'dropoff') => async (t: Trip) => {
    try { if (kind === 'pickup') await api.pickup(t.child.id, t.vehicle_id); else await api.dropoff(t.child.id, t.vehicle_id, false); await refresh() } catch (e) { fail(e) }
  }

  const body = () => {
    if (tab === 'account') {
      return <Account live={live} onMode={v => { update({ live: v }); setError(undefined) }} server={session.server} onServer={s => update({ server: s })} me={me} vehicles={vehicles} vehicleId={session.vehicle} onVehicle={id => update({ vehicle: id })} onLogout={signOut} serverStatus={serverStatus} />
    }
    if (live && !signedIn) {
      return (
        <View style={{ flex: 1 }}>
          <Login server={session.server} onServer={s => update({ server: s })} onDone={(token, name, phone) => { update({ token, name, phone }); setError(undefined) }} />
          <View style={s.backWrap} pointerEvents="box-none"><View style={{ width: '100%', maxWidth: 488 }}><Button label="Dùng dữ liệu mô phỏng" kind="tinted" tone="gray" onPress={() => update({ live: false })} /></View></View>
        </View>
      )
    }
    if (tab === 'school') return <School trips={pickTrips} simulated={!live} error={live ? error : undefined} onPickup={doTrip('pickup')} onDropoff={doTrip('dropoff')} onAdvance={() => setDemoStage(i => (i + 1) % DEMO_TRIPS.length)} />
    if (tab === 'history') return <History events={live ? events : DEMO_EVENTS} times={live ? undefined : DEMO_TIMES} simulated={!live} error={live ? error : undefined} />
    return <Home view={shown} simulated={!live || !!shown.sim} demo={!live} actions={actions} scenario={scenario} onScenario={k => { setScenario(k); setDemoViewed(false) }} notice={live ? error : undefined} />
  }

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar style="light" />
      <View style={{ flex: 1 }}>{body()}</View>
      <View style={s.barWrap} pointerEvents="box-none">
        <View style={[s.bar, material('thick')]}>
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
  backWrap: { position: 'absolute', left: 16, right: 16, bottom: 104, alignItems: 'center' },
  barWrap: { position: 'absolute', left: 0, right: 0, bottom: 14, alignItems: 'center' },
  bar: { flexDirection: 'row', gap: 4, padding: 6, borderRadius: 34, width: '92%', maxWidth: 480 },
  tab: { flex: 1, alignItems: 'center', gap: 2, paddingVertical: 8, borderRadius: 28 },
  tabOn: { backgroundColor: 'rgba(255,255,255,0.12)' },
  tabText: { fontFamily: FONT, color: N.ink2, fontSize: 10.5, fontWeight: '600' },
})
