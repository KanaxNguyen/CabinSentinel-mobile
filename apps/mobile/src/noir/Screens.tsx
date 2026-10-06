import { useState } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Api, ApiError, type EventItem, type Me, type Trip, type VehicleSummary } from './api'
import { clock, stageOf } from './model'
import { N } from './theme'
import { Button, Empty, Field, Row, Section, Segmented, SimTag, T } from './ui'

const page = { padding: 16, paddingBottom: 130, gap: 22, maxWidth: 520, width: '100%', alignSelf: 'center' } as const
type IconName = React.ComponentProps<typeof Ionicons>['name']

export function School({ trips, simulated, error, onPickup, onDropoff, onAdvance }: {
  trips: Trip[]; simulated: boolean; error?: string; onPickup: (t: Trip) => Promise<void>; onDropoff: (t: Trip) => Promise<void>; onAdvance: () => void
}) {
  const [busy, setBusy] = useState(false)
  const run = async (f: () => Promise<void>) => { setBusy(true); try { await f() } finally { setBusy(false) } }
  return (
    <ScrollView contentContainerStyle={page}>
      <Text style={T.largeTitle}>Đưa đón</Text>
      {simulated && <SimTag />}
      {error && <Text style={[T.subhead, { color: N.red }]}>{error}</Text>}
      {trips.length === 0 && <Empty icon="people" title="Chưa có chuyến đưa đón" text="Thêm bé và lịch đón trên ứng dụng để theo dõi chuyến đi ở đây." />}
      {trips.map(t => {
        const st = stageOf(t)
        const color = st.warn ? N.red : N.accent
        return (
          <View key={t.child.id} style={{ gap: 14 }}>
            <Section>
              <View style={s.who}>
                <View style={s.avatar}><Text style={[T.title2, { color: N.accent }]}>{t.child.name.slice(0, 1)}</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={T.headline}>{t.child.name}{t.child.cls ? ` · Lớp ${t.child.cls}` : ''}</Text>
                  <Text style={T.subhead}>{t.seat_label} · đón {t.pickup}, về {t.dropoff}</Text>
                </View>
              </View>
              <View style={{ paddingVertical: 14, gap: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: N.line }}>
                <Ionicons name={st.warn ? 'alert-circle' : t.stage === 'arrived' ? 'checkmark-circle' : 'hourglass'} size={34} color={color} />
                <Text style={[T.footnote, { color, letterSpacing: 2, fontWeight: '700' }]}>{st.label}</Text>
                <Text style={[T.title2, { fontSize: 26 }]}>{st.text(t.child.name)}</Text>
                {st.warn && <Text style={[T.subhead, { color: N.red }]}>Hãy kiểm tra xe ngay. Bé có thể vẫn còn trên xe.</Text>}
              </View>
            </Section>
            {t.log.length > 0 && (
              <Section header="Nhật ký chuyến">
                {t.log.map((l, i) => <Row key={i} label={l.title} value={l.time} chevron={false} last={i === t.log.length - 1} />)}
              </Section>
            )}
            {simulated
              ? <Button label="Mô phỏng: chuyển sang bước tiếp theo" onPress={onAdvance} />
              : t.stage === 'waiting' || t.stage === 'late'
                ? <Button label={`Ghi nhận ${t.child.name} đã lên xe`} busy={busy} onPress={() => void run(() => onPickup(t))} />
                : t.stage !== 'arrived' ? <Button label={`Ghi nhận ${t.child.name} đã xuống xe`} kind="tinted" busy={busy} onPress={() => void run(() => onDropoff(t))} /> : null}
          </View>
        )
      })}
      <Text style={T.footnote}>Chuyến đưa đón chỉ là thông tin bổ sung, không thay thế thiết bị cảnh báo bắt buộc của xe trường, và không mở khóa xe.</Text>
    </ScrollView>
  )
}

const KIND_ICON: Record<string, { icon: IconName; color: string }> = {
  alert: { icon: 'warning', color: N.orange }, critical: { icon: 'alert-circle', color: N.red }, ack: { icon: 'eye', color: N.blue },
  resolved: { icon: 'checkmark-circle', color: N.green }, reject: { icon: 'close-circle', color: N.red },
}

export function History({ events, simulated, times, error }: { events: EventItem[]; simulated: boolean; times?: string[]; error?: string }) {
  return (
    <ScrollView contentContainerStyle={page}>
      <Text style={T.largeTitle}>Lịch sử</Text>
      {simulated && <SimTag />}
      {error && <Text style={[T.subhead, { color: N.red }]}>{error}</Text>}
      {events.length === 0
        ? <Empty icon="time" title="Chưa có sự kiện" text="Cảnh báo và xác nhận trong 7 ngày gần nhất sẽ hiện ở đây." />
        : (
          <Section>
            {events.map((e, i) => {
              const k = KIND_ICON[e.kind] ?? { icon: 'information-circle' as IconName, color: N.ink2 }
              return (
                <View key={i} style={[s.item, i < events.length - 1 && s.itemLine]}>
                  <Ionicons name={k.icon} size={22} color={k.color} />
                  <View style={{ flex: 1 }}>
                    <Text style={T.headline}>{e.title}</Text>
                    <Text style={T.subhead}>{e.detail}</Text>
                  </View>
                  <Text style={T.footnote}>{times?.[i] ?? clock(e.at)}</Text>
                </View>
              )
            })}
          </Section>
        )}
    </ScrollView>
  )
}

export function Account({ live, onMode, server, onServer, me, vehicles, vehicleId, onVehicle, onLogout, serverStatus }: {
  live: boolean; onMode: (live: boolean) => void; server: string; onServer: (s: string) => void; me?: Me
  vehicles: VehicleSummary[]; vehicleId?: string; onVehicle: (id: string) => void; onLogout: () => void; serverStatus?: string
}) {
  const [draft, setDraft] = useState(server)
  return (
    <ScrollView contentContainerStyle={page}>
      <Text style={T.largeTitle}>Tài khoản</Text>
      <Section header="Nguồn dữ liệu" footer={live ? 'Dữ liệu thật từ máy chủ CabinSentinel. Không có dữ liệu thì không bao giờ hiển thị là an toàn.' : 'Dữ liệu mô phỏng để xem thử giao diện. Mọi trạng thái đều gắn nhãn "Mô phỏng".'}>
        <View style={{ paddingVertical: 12 }}>
          <Segmented value={live ? 'live' : 'demo'} onChange={k => onMode(k === 'live')} options={[{ key: 'demo', label: 'Mô phỏng' }, { key: 'live', label: 'Máy chủ thật' }]} />
        </View>
      </Section>
      {live && (
        <>
          <Section header="Máy chủ" footer={serverStatus}>
            <View style={{ paddingVertical: 12, gap: 12 }}>
              <Field label="Địa chỉ máy chủ" value={draft} onChangeText={setDraft} placeholder="https://…" keyboardType="url" />
              <Button label="Lưu địa chỉ" kind="tinted" onPress={() => onServer(draft.trim())} />
            </View>
          </Section>
          {me && (
            <Section header="Tài khoản">
              <Row icon="person-circle" label={me.name || 'Chưa đặt tên'} value={me.phone} chevron={false} />
              <Row icon="log-out" label="Đăng xuất" tint={N.red} last onPress={onLogout} />
            </Section>
          )}
          {vehicles.length > 0 && (
            <Section header="Xe">
              {vehicles.map((v, i) => <Row key={v.vehicle.id} icon={v.vehicle.id === vehicleId ? 'checkmark-circle' : 'car-sport'} tint={v.vehicle.id === vehicleId ? N.accent : undefined} label={v.vehicle.name} value={v.vehicle.plate} last={i === vehicles.length - 1} onPress={() => onVehicle(v.vehicle.id)} />)}
            </Section>
          )}
        </>
      )}
      <Section header="Nguyên tắc an toàn">
        <Row icon="shield-checkmark" label="Chỉ giám sát, không điều khiển xe" chevron={false} />
        <Row icon="eye" label='"Đã xem" không đóng sự cố' chevron={false} />
        <Row icon="checkmark-circle" label="Chỉ đóng khi camera không còn thấy người" chevron={false} last />
      </Section>
      <Text style={T.footnote}>CabinSentinel không thể đảm bảo an toàn tuyệt đối. Bản web không hỗ trợ thông báo đẩy; hãy dùng ứng dụng trên điện thoại để nhận cảnh báo.</Text>
    </ScrollView>
  )
}

export function Login({ server, onServer, onDone }: { server: string; onServer: (s: string) => void; onDone: (token: string, name: string, phone: string) => void }) {
  const [draft, setDraft] = useState(server)
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [sent, setSent] = useState<{ dev?: string | null }>()
  const [err, setErr] = useState<string>()
  const [busy, setBusy] = useState(false)
  const api = () => new Api(draft.trim())
  const run = async (f: () => Promise<void>) => { setBusy(true); setErr(undefined); try { await f() } catch (e) { setErr(e instanceof ApiError ? e.message : 'Có lỗi xảy ra. Thử lại sau.') } finally { setBusy(false) } }
  return (
    <ScrollView contentContainerStyle={page}>
      <Text style={T.largeTitle}>Đăng nhập</Text>
      <Text style={T.subhead}>Đăng nhập bằng số điện thoại để xem xe của bạn. Mã xác nhận được gửi tới bạn.</Text>
      <Section header="Máy chủ">
        <View style={{ paddingVertical: 12 }}><Field label="Địa chỉ máy chủ" value={draft} onChangeText={t => { setDraft(t); onServer(t.trim()) }} placeholder="https://…" keyboardType="url" /></View>
      </Section>
      <Section header="Số điện thoại">
        <View style={{ paddingVertical: 12, gap: 12 }}>
          <Field label="Số điện thoại" value={phone} onChangeText={setPhone} placeholder="09xx xxx xxx" keyboardType="phone-pad" />
          {sent && <Field label="Mã xác nhận" value={code} onChangeText={setCode} placeholder="6 chữ số" keyboardType="number-pad" />}
          {sent && <Field label="Tên (nếu là lần đầu)" value={name} onChangeText={setName} placeholder="Tên của bạn" autoCapitalize="words" />}
          {sent?.dev ? <Text style={T.footnote}>Máy chủ thử nghiệm gửi kèm mã: {sent.dev}</Text> : null}
          {err && <Text style={[T.subhead, { color: N.red }]}>{err}</Text>}
          {!sent
            ? <Button label="Gửi mã" busy={busy} disabled={!draft.trim() || phone.trim().length < 9} onPress={() => void run(async () => { const r = await api().sendOtp(phone.trim()); setSent({ dev: r.dev_code }) })} />
            : <Button label="Đăng nhập" busy={busy} disabled={code.trim().length < 4} onPress={() => void run(async () => { const r = await api().verify(phone.trim(), code.trim(), name.trim()); onDone(r.token, r.user.name, r.user.phone) })} />}
        </View>
      </Section>
    </ScrollView>
  )
}

const s = StyleSheet.create({
  who: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: N.grouped2, alignItems: 'center', justifyContent: 'center' },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  itemLine: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: N.line },
})
