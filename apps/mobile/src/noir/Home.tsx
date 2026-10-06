import { useState } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { CHECKS } from './api'
import type { CabinView } from './model'
import { LEVEL, material, N } from './theme'
import { Badge, Button, Circle, Press, Row, Section, Segmented, Sheet, SimTag, T } from './ui'
import type { Scenario } from './demo'

export interface IncidentActions {
  // "closed" is only true when the server says the incident is resolved.
  view: () => Promise<void>
  confirm: (checks: string[]) => Promise<{ closed: boolean; message: string }>
}

export function Home({ view, simulated, demo, actions, scenario, onScenario, notice }: {
  view: CabinView; simulated: boolean; demo: boolean; actions: IncidentActions; scenario: Scenario; onScenario: (k: Scenario) => void; notice?: string
}) {
  const L = LEVEL[view.level]
  const [glance, setGlance] = useState(false)
  const [flow, setFlow] = useState<null | 'review' | 'check' | 'done'>(null)
  const [checks, setChecks] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<{ closed: boolean; message: string }>()
  const inc = view.incident
  const toggle = (k: string) => setChecks(c => (c.includes(k) ? c.filter(x => x !== k) : [...c, k]))

  const start = async () => { setFlow('review'); setBusy(true); try { await actions.view() } finally { setBusy(false) } }
  const submit = async () => { setBusy(true); try { setResult(await actions.confirm(checks)); setFlow('done') } finally { setBusy(false) } }
  const close = () => { setFlow(null); setChecks([]); setResult(undefined) }

  return (
    <ScrollView contentContainerStyle={s.page}>
      <View style={s.top}>
        <Text style={s.brand}>CABIN NOIR</Text>
        <Press label="Trẻ em và đồ vật trong xe" onPress={() => setGlance(true)} style={[s.bubble, material('regular')]}>
          <View style={s.chip}><Ionicons name="happy" size={19} color={view.people == null ? N.ink2 : N.ink} /><View style={s.badgePos}><Badge n={view.people} tone="people" /></View></View>
          <View style={s.chip}><Ionicons name="bag-handle" size={19} color={view.itemCount == null ? N.ink2 : N.ink} /><View style={s.badgePos}><Badge n={view.itemCount} tone="items" /></View></View>
        </Press>
      </View>

      <View style={s.hero}>
        <View style={[s.glow, { backgroundColor: L.color }, { filter: 'blur(80px)' } as object]} />
        <Ionicons name="car-sport" size={132} color="rgba(255,255,255,0.9)" />
        <Ionicons name={L.icon} size={60} color={L.color} style={{ marginTop: 18 }} />
        <Text style={[s.kicker, { color: L.color }]}>{L.label.toUpperCase()}</Text>
        <Text style={s.title}>{view.title}</Text>
        <Text style={T.callout}>Cập nhật {view.updated}</Text>
        <Text style={[T.subhead, { textAlign: 'center' }]}>{view.detail}</Text>
        {simulated && <View style={{ marginTop: 10 }}><SimTag /></View>}
      </View>

      {notice && <View style={[s.notice, material('thin')]}><Text style={T.subhead}>{notice}</Text></View>}

      {inc && (
        <View style={[s.alert, material('regular')]}>
          <Text style={[T.title2, { color: L.color }]}>{view.level === 'critical' ? 'Cần xử lý ngay' : 'Cần kiểm tra xe'}</Text>
          <Text style={T.subhead}>{inc.viewed ? 'Đã xem. Sự cố vẫn mở cho tới khi bạn xác nhận đã kiểm tra xe.' : 'Camera trong xe thấy người khi xe đã đỗ.'}</Text>
          <Button label="Xử lý ngay" tone={view.level === 'critical' ? 'red' : 'accent'} onPress={() => void start()} />
          <Button label="Đã xem" kind="tinted" tone="gray" onPress={() => void actions.view()} />
        </View>
      )}

      <View style={s.actions}>
        <Circle icon="body" label="Ghế" onPress={() => setGlance(true)} />
        <Circle icon="map" label="Bản đồ" />
        <Circle icon="hardware-chip" label="Thiết bị" />
        <Circle icon="ellipsis-horizontal" label="Thêm" />
      </View>

      <Section footer="CabinSentinel chỉ giám sát và cảnh báo, không mở khóa hay điều khiển xe, và không thể đảm bảo an toàn tuyệt đối.">
        <Row icon="thermometer" label="Nhiệt độ cabin" value={view.temp == null ? 'Chưa có' : `${view.temp}°C`} />
        <Row icon="body" label="Ghế sau" value={view.seatsText} />
        <Row label="Chi tiết cảm biến" accent last onPress={() => setGlance(true)} />
      </Section>

      {demo && (
        <Section header="Kịch bản mô phỏng">
          <View style={{ paddingVertical: 12 }}>
            <Segmented value={scenario} onChange={onScenario} options={[{ key: 'safe', label: 'Bình thường' }, { key: 'warning', label: 'Cảnh báo' }, { key: 'critical', label: 'Nghiêm trọng' }]} />
          </View>
        </Section>
      )}

      <Sheet visible={glance} onClose={() => setGlance(false)}>
        <Text style={T.title2}>Trong xe</Text>
        {simulated && <SimTag />}
        <Section>
          {view.people == null ? <Row label="Người và thú cưng" value="Chưa có dữ liệu mới" last /> : view.seats.filter(x => x.occ).length === 0
            ? <Row icon="happy" label="Người và thú cưng" value="Không thấy ai" last />
            : view.seats.filter(x => x.occ).map((x, i, a) => <Row key={x.key} icon={x.kind === 'pet' ? 'paw' : 'happy'} label={x.kind === 'pet' ? 'Thú cưng' : x.age === 'child' ? 'Người, có thể là trẻ em' : 'Người'} value={x.label} last={i === a.length - 1} />)}
        </Section>
        <Section>
          {view.itemCount == null ? <Row label="Đồ vật" value="Chưa có dữ liệu mới" last /> : view.items.length === 0
            ? <Row icon="bag-handle" label="Đồ vật" value="Không thấy" last />
            : view.items.map((x, i, a) => <Row key={x.name + i} icon="bag-handle" label={x.name} value={x.seat} last={i === a.length - 1} />)}
        </Section>
        <Text style={T.footnote}>Nhãn "có thể là trẻ em" chỉ là gợi ý và không làm giảm hay ẩn bất kỳ cảnh báo nào. Dữ liệu cũ hoặc thiếu không được hiểu là an toàn.</Text>
        <Button label="Đóng" onPress={() => setGlance(false)} />
      </Sheet>

      <Sheet visible={flow !== null} onClose={close}>
        {flow === 'review' && (
          <>
            <Text style={T.title2}>Xử lý sự cố</Text>
            <Text style={T.subhead}>1. Đi tới xe ngay. 2. Kiểm tra ghế sau, sàn xe và cốp. 3. Nếu có người cần giúp, gọi cấp cứu 115.</Text>
            <Button label="Tôi đang ở cạnh xe, xác nhận kiểm tra" busy={busy} onPress={() => setFlow('check')} />
            <Button label="Gọi 115" kind="tinted" tone="red" />
          </>
        )}
        {flow === 'check' && (
          <>
            <Text style={T.title2}>Xác nhận đã kiểm tra xe</Text>
            <Text style={T.subhead}>Chỉ xác nhận khi bạn hoặc người thân đang đứng cạnh xe và đã nhìn tận mắt. Hệ thống sẽ kiểm tra lại dữ liệu mới nhất trước khi đóng sự cố.</Text>
            <Section>
              {CHECKS.map(({ k, label }, i) => (
                <Press key={k} onPress={() => toggle(k)} label={label}>
                  <View style={[s.check, i < CHECKS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: N.line }]}>
                    <Ionicons name={checks.includes(k) ? 'checkmark-circle' : 'ellipse-outline'} size={24} color={checks.includes(k) ? N.accent : N.ink3} />
                    <Text style={T.body}>{label}</Text>
                  </View>
                </Press>
              ))}
            </Section>
            <Button label="Gửi xác nhận" disabled={checks.length < CHECKS.length} busy={busy} onPress={() => void submit()} />
          </>
        )}
        {flow === 'done' && (
          <>
            <Ionicons name={result?.closed ? 'checkmark-circle' : 'alert-circle'} size={44} color={result?.closed ? N.green : N.orange} />
            <Text style={T.title2}>{result?.closed ? 'Đã đóng sự cố' : 'Chưa đóng được sự cố'}</Text>
            <Text style={T.subhead}>{result?.message}</Text>
            <Button label="Xong" onPress={close} />
          </>
        )}
      </Sheet>
    </ScrollView>
  )
}

const s = StyleSheet.create({
  page: { padding: 16, paddingBottom: 130, gap: 22, maxWidth: 520, width: '100%', alignSelf: 'center' },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brand: { color: N.ink, fontSize: 13, fontWeight: '700', letterSpacing: 3 },
  bubble: { flexDirection: 'row', gap: 4, paddingHorizontal: 8, height: 40, borderRadius: 20, alignItems: 'center' },
  chip: { width: 38, height: 34, alignItems: 'center', justifyContent: 'center' },
  badgePos: { position: 'absolute', top: -2, right: -2 },
  hero: { alignItems: 'center', gap: 6, paddingTop: 8 },
  glow: { position: 'absolute', top: 70, width: 280, height: 170, borderRadius: 140, opacity: 0.28 },
  kicker: { fontSize: 13, fontWeight: '700', letterSpacing: 2.4, marginTop: 4 },
  title: { color: N.ink, fontSize: 28, fontWeight: '700', textAlign: 'center', letterSpacing: 0.36 },
  notice: { borderRadius: 16, padding: 14 },
  alert: { borderRadius: N.radius, padding: 16, gap: 10 },
  actions: { flexDirection: 'row', justifyContent: 'space-around' },
  check: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 52 },
})
