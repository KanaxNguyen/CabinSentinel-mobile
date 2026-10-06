import { useState } from 'react'
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LEVEL, N } from './theme'
import type { CabinView } from './demo'
import { Badge, Circle, Group, PrimaryButton, Row, SimTag, TintButton } from './ui'

const CHECKS = [{ k: 'seat', label: 'Đã kiểm tra ghế sau' }, { k: 'foot', label: 'Đã kiểm tra khu vực chân và cốp' }, { k: 'clear', label: 'Không còn ai hoặc thú trong xe' }]

export function Home({ view, simulated, onScenario, scenario }: { view: CabinView; simulated: boolean; scenario: string; onScenario: (k: 'safe' | 'warning' | 'critical') => void }) {
  const L = LEVEL[view.level]
  const [glance, setGlance] = useState(false)
  const [flow, setFlow] = useState<null | 'review' | 'check' | 'done'>(null)
  const [checks, setChecks] = useState<string[]>([])
  const [seen, setSeen] = useState(false)
  const [resolved, setResolved] = useState(false)
  const needs = view.level === 'warning' || view.level === 'critical'
  const open = needs && !resolved
  const toggle = (k: string) => setChecks(c => (c.includes(k) ? c.filter(x => x !== k) : [...c, k]))
  const allChecked = checks.length === 3
  // Confirmation only closes an incident when the camera no longer sees a person; the demo state still does, so it stays open.
  const personStillSeen = view.children != null && view.children > 0

  return (
    <ScrollView contentContainerStyle={s.page}>
      <View style={s.top}>
        <Text style={s.brand}>CABIN NOIR</Text>
        <Pressable accessibilityLabel="Trẻ em và đồ vật trong xe" onPress={() => setGlance(true)} style={s.bubble}>
          <View style={s.chip}><Ionicons name="happy" size={18} color={N.ink} /><View style={s.badgePos}><Badge n={view.children} /></View></View>
          <View style={s.chip}><Ionicons name="bag-handle" size={18} color={N.ink} /><View style={s.badgePos}><Badge n={view.items} /></View></View>
        </Pressable>
      </View>

      <View style={s.hero}>
        <View style={[s.glow, { backgroundColor: L.color }, { filter: 'blur(70px)' } as object]} />
        <View style={s.carWrap}>
          <Ionicons name="car-sport" size={150} color="rgba(255,255,255,0.88)" />
        </View>
        <Ionicons name={L.icon} size={64} color={L.color} />
        <Text style={[s.kicker, { color: L.color }]}>{L.label.toUpperCase()}</Text>
        <Text style={s.title}>{view.title}</Text>
        <Text style={s.sub}>Cập nhật {view.updated}</Text>
        <Text style={s.sub}>{view.fresh ? view.detail : 'Dữ liệu cũ, hãy kiểm tra xe trực tiếp'}</Text>
        {simulated && <View style={{ marginTop: 10 }}><SimTag /></View>}
      </View>

      {open && (
        <View style={s.alert}>
          <Text style={[s.alertTitle, { color: L.color }]}>{view.level === 'critical' ? 'Cần xử lý ngay' : 'Cần kiểm tra xe'}</Text>
          <Text style={s.alertText}>{seen ? 'Đã xem. Sự cố vẫn mở cho tới khi bạn xác nhận đã kiểm tra xe.' : 'Camera trong xe thấy người khi xe đã đỗ.'}</Text>
          <PrimaryButton label="Xử lý ngay" color={L.color} textColor="#fff" onPress={() => { setFlow('review'); setSeen(true) }} />
          <TintButton label="Đã xem" color={N.ink} onPress={() => setSeen(true)} />
        </View>
      )}
      {resolved && needs && <View style={s.okBox}><Text style={s.okText}>Đã ghi nhận xác nhận kiểm tra xe. Sự cố được đóng khi camera không còn thấy người.</Text></View>}

      <View style={s.actions}>
        <Circle icon="body" label="Ghế" onPress={() => setGlance(true)} />
        <Circle icon="map" label="Bản đồ" />
        <Circle icon="hardware-chip" label="Thiết bị" />
        <Circle icon="ellipsis-horizontal" label="Thêm" />
      </View>

      <Group>
        <Row icon="thermometer" label="Nhiệt độ cabin" value={view.temp == null ? 'Chưa có' : `${view.temp}°C`} />
        <Row icon="body" label="Ghế sau" value={view.seat} />
        <Row label="Chi tiết cảm biến" accent last onPress={() => setGlance(true)} />
      </Group>

      <Text style={s.foot}>CabinSentinel chỉ giám sát và cảnh báo, không mở khóa hay điều khiển xe, và không thể đảm bảo an toàn tuyệt đối.</Text>

      <Group style={{ paddingVertical: 12 }}>
        <Text style={s.demoHead}>KỊCH BẢN MÔ PHỎNG</Text>
        <View style={{ flexDirection: 'row', gap: 8, paddingBottom: 6 }}>
          {([['safe', 'Bình thường'], ['warning', 'Cảnh báo'], ['critical', 'Nghiêm trọng']] as const).map(([k, label]) => (
            <Pressable key={k} onPress={() => { onScenario(k); setResolved(false); setSeen(false); setChecks([]) }} style={[s.pill, scenario === k && { backgroundColor: N.accent }]}>
              <Text style={[s.pillText, scenario === k && { color: N.onAccent }]}>{label}</Text>
            </Pressable>
          ))}
        </View>
      </Group>

      <Modal visible={glance} transparent animationType="slide" onRequestClose={() => setGlance(false)}>
        <Pressable style={s.scrim} onPress={() => setGlance(false)}>
          <Pressable style={s.sheet} onPress={() => undefined}>
            <Text style={s.sheetTitle}>Trong xe</Text>
            {simulated && <SimTag />}
            <Group style={{ marginTop: 12 }}>
              <Row icon="happy" label="Có thể là trẻ em" value={view.children == null ? 'Chưa có dữ liệu' : String(view.children)} />
              <Row icon="bag-handle" label="Đồ vật" value={view.items == null ? 'Chưa có dữ liệu' : String(view.items)} last />
            </Group>
            <Text style={s.note}>Nhãn "có thể là trẻ em" chỉ là gợi ý và không làm giảm hay ẩn bất kỳ cảnh báo nào. Dữ liệu cũ hoặc thiếu không được hiểu là an toàn.</Text>
            <PrimaryButton label="Đóng" onPress={() => setGlance(false)} />
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={flow !== null} transparent animationType="slide" onRequestClose={() => setFlow(null)}>
        <Pressable style={s.scrim} onPress={() => setFlow(null)}>
          <Pressable style={s.sheet} onPress={() => undefined}>
            {flow === 'review' && (
              <>
                <Text style={s.sheetTitle}>Xử lý sự cố</Text>
                <Text style={s.note}>1. Đi tới xe ngay. 2. Kiểm tra ghế sau và khu vực chân. 3. Nếu có người cần giúp, gọi cấp cứu 115.</Text>
                <PrimaryButton label="Tôi đã tới xe, xác nhận kiểm tra" onPress={() => setFlow('check')} />
                <TintButton label="Gọi 115" color={N.red} />
              </>
            )}
            {flow === 'check' && (
              <>
                <Text style={s.sheetTitle}>Xác nhận đã kiểm tra xe</Text>
                {CHECKS.map(({ k, label }) => (
                  <Pressable key={k} onPress={() => toggle(k)} style={s.check}>
                    <Ionicons name={checks.includes(k) ? 'checkmark-circle' : 'ellipse-outline'} size={24} color={checks.includes(k) ? N.accent : N.ink2} />
                    <Text style={s.checkText}>{label}</Text>
                  </Pressable>
                ))}
                <PrimaryButton label="Xác nhận" disabled={!allChecked} onPress={() => { setResolved(!personStillSeen); setFlow('done') }} />
              </>
            )}
            {flow === 'done' && (
              <>
                <Text style={s.sheetTitle}>Đã ghi nhận</Text>
                <Text style={s.note}>{personStillSeen ? 'Camera trong xe vẫn còn thấy người, nên sự cố chưa được đóng và cảnh báo tiếp tục.' : 'Camera không còn thấy người. Sự cố đã được đóng.'}</Text>
                {personStillSeen && <TintButton label="Mô phỏng: người đã ra khỏi xe" onPress={() => { onScenario('safe'); setResolved(true); setSeen(false); setChecks([]); setFlow(null) }} />}
                <PrimaryButton label="Xong" onPress={() => setFlow(null)} />
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  )
}

const s = StyleSheet.create({
  page: { padding: 16, paddingBottom: 130, gap: 18, maxWidth: 520, width: '100%', alignSelf: 'center' },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brand: { color: N.ink, fontSize: 13, fontWeight: '800', letterSpacing: 3 },
  bubble: { flexDirection: 'row', gap: 6, padding: 6, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.10)', borderWidth: 1, borderColor: N.line },
  chip: { width: 42, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  badgePos: { position: 'absolute', top: -6, right: -2 },
  hero: { alignItems: 'center', gap: 6, paddingTop: 8, overflow: 'visible' },
  glow: { position: 'absolute', top: 120, width: 260, height: 160, borderRadius: 130, opacity: 0.22 },
  carWrap: { marginBottom: 12, opacity: 0.95 },
  kicker: { fontSize: 13, fontWeight: '800', letterSpacing: 2.4, marginTop: 4 },
  title: { color: N.ink, fontSize: 28, fontWeight: '700', textAlign: 'center' },
  sub: { color: N.ink2, fontSize: 15, textAlign: 'center' },
  alert: { backgroundColor: N.surface, borderRadius: N.radius, padding: 16, gap: 10 },
  alertTitle: { fontSize: 20, fontWeight: '800' },
  alertText: { color: N.ink2, fontSize: 15 },
  okBox: { backgroundColor: N.surface, borderRadius: N.radius, padding: 16 },
  okText: { color: N.ink2, fontSize: 15 },
  actions: { flexDirection: 'row', justifyContent: 'space-around' },
  foot: { color: N.ink2, fontSize: 12, textAlign: 'center' },
  demoHead: { color: N.ink2, fontSize: 11, fontWeight: '700', letterSpacing: 1.4, marginBottom: 8 },
  pill: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 18, backgroundColor: N.surface2 },
  pillText: { color: N.ink, fontSize: 14, fontWeight: '600' },
  scrim: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#161618', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, gap: 12, maxWidth: 560, width: '100%', alignSelf: 'center', paddingBottom: 32 },
  sheetTitle: { color: N.ink, fontSize: 22, fontWeight: '700' },
  note: { color: N.ink2, fontSize: 14, lineHeight: 20 },
  check: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  checkText: { color: N.ink, fontSize: 17 },
})
