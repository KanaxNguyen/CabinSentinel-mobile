import { useState } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { HISTORY, TRIP } from './demo'
import { LEVEL, N } from './theme'
import { Group, PrimaryButton, Row, SimTag, TintButton } from './ui'

const page = { padding: 16, paddingBottom: 130, gap: 18, maxWidth: 520, width: '100%', alignSelf: 'center' } as const

export function School() {
  const [i, setI] = useState(0)
  const st = TRIP[i]!
  const warn = st.key === 'leftin'
  const color = warn ? N.red : N.accent
  return (
    <ScrollView contentContainerStyle={page}>
      <Text style={s.h1}>Đưa đón</Text>
      <SimTag />
      <Group style={{ paddingVertical: 16, gap: 10 }}>
        <View style={s.who}>
          <View style={s.avatar}><Text style={s.avatarText}>A</Text></View>
          <View>
            <Text style={s.name}>An · Lớp 2A</Text>
            <Text style={s.meta}>Ghế sau trái · đón 06:45, về 16:30</Text>
          </View>
        </View>
        <View style={s.rule} />
        <Ionicons name={warn ? 'alert-circle' : 'hourglass'} size={38} color={color} />
        <Text style={[s.kicker, { color }]}>{st.label}</Text>
        <Text style={s.big}>{st.text}</Text>
        <Text style={s.meta}>{st.note}</Text>
        {warn && <Text style={s.warn}>Bé có thể vẫn còn trên xe. Hãy kiểm tra xe ngay.</Text>}
        <PrimaryButton label={i < TRIP.length - 1 ? 'Mô phỏng: chuyển sang bước tiếp theo' : 'Làm lại từ đầu'} onPress={() => setI((i + 1) % TRIP.length)} />
      </Group>
      <Group>
        <Row icon="people" label="Các bé" onPress={() => undefined} accent />
        <Row icon="pin" label="Điểm đến" value="Trường Tiểu học" accent />
        <Row icon="map" label="Theo dõi xe trên bản đồ" onPress={() => undefined} last />
      </Group>
      <Text style={s.foot}>Điểm đến dùng để tính xe đã tới trường chưa. Chuyến đưa đón chỉ là thông tin bổ sung, không thay thế thiết bị cảnh báo bắt buộc của xe trường, và không mở khóa xe.</Text>
    </ScrollView>
  )
}

export function History() {
  return (
    <ScrollView contentContainerStyle={page}>
      <Text style={s.h1}>Lịch sử</Text>
      <SimTag />
      <Group>
        {HISTORY.map((h, k) => (
          <View key={h.id} style={[s.item, k < HISTORY.length - 1 && s.itemLine]}>
            <Ionicons name={LEVEL[h.level].icon} size={22} color={LEVEL[h.level].color} />
            <View style={{ flex: 1 }}>
              <Text style={s.name}>{h.title}</Text>
              <Text style={s.meta}>{h.status}</Text>
            </View>
            <Text style={s.meta}>{h.when}</Text>
          </View>
        ))}
      </Group>
    </ScrollView>
  )
}

export function Account({ live, onLive, apiConfigured, liveNote }: { live: boolean; onLive: (v: boolean) => void; apiConfigured: boolean; liveNote: string }) {
  return (
    <ScrollView contentContainerStyle={page}>
      <Text style={s.h1}>Tài khoản</Text>
      <Group style={{ paddingVertical: 14, gap: 10 }}>
        <Text style={s.name}>Nguồn dữ liệu</Text>
        <Text style={s.meta}>{live ? liveNote : 'Đang dùng dữ liệu mô phỏng để xem thử giao diện. Mọi trạng thái đều gắn nhãn "Mô phỏng".'}</Text>
        <TintButton label={live ? 'Chuyển sang dữ liệu mô phỏng' : apiConfigured ? 'Thử máy chủ thật' : 'Chưa cấu hình máy chủ'} onPress={() => onLive(!live)} />
      </Group>
      <Group>
        <Row icon="notifications" label="Thông báo" value="Bản web: không hỗ trợ" />
        <Row icon="shield-checkmark" label="Nguyên tắc an toàn" last />
      </Group>
      <Text style={s.meta}>CabinSentinel chỉ giám sát, không điều khiển hay mở khóa xe và không cam kết an toàn tuyệt đối. "Đã xem" không đóng sự cố; chỉ xác nhận đã kiểm tra xe và camera không còn thấy người mới đóng. Dữ liệu cũ hoặc thiếu không bao giờ được hiển thị là an toàn.</Text>
    </ScrollView>
  )
}

const s = StyleSheet.create({
  h1: { color: N.ink, fontSize: 34, fontWeight: '800' },
  who: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: N.surface2, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: N.accent, fontSize: 20, fontWeight: '700' },
  name: { color: N.ink, fontSize: 17, fontWeight: '600' },
  meta: { color: N.ink2, fontSize: 15, lineHeight: 21 },
  rule: { height: StyleSheet.hairlineWidth, backgroundColor: N.line },
  kicker: { fontSize: 13, fontWeight: '800', letterSpacing: 2 },
  big: { color: N.ink, fontSize: 28, fontWeight: '800' },
  warn: { color: N.red, fontSize: 15, fontWeight: '700' },
  foot: { color: N.ink2, fontSize: 12 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  itemLine: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: N.line },
})
