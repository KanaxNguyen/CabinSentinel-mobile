import type { ReactNode } from 'react'
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { N } from './theme'

type IconName = React.ComponentProps<typeof Ionicons>['name']

export function Group({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[s.group, style]}>{children}</View>
}

export function Row({ icon, label, value, onPress, accent, last }: { icon?: IconName; label: string; value?: string; onPress?: () => void; accent?: boolean; last?: boolean }) {
  const body = (
    <View style={[s.row, !last && s.rowLine]}>
      {icon && <Ionicons name={icon} size={20} color={accent ? N.accent : N.ink2} style={{ width: 26 }} />}
      <Text style={[s.rowLabel, accent && { color: N.accent }]}>{label}</Text>
      {value != null && <Text style={s.rowValue}>{value}</Text>}
      {onPress && <Ionicons name="chevron-forward" size={16} color={N.ink2} />}
    </View>
  )
  return onPress ? <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => pressed && { opacity: 0.7 }}>{body}</Pressable> : body
}

export function PrimaryButton({ label, onPress, disabled, color = N.accent, textColor = N.onAccent }: { label: string; onPress?: () => void; disabled?: boolean; color?: string; textColor?: string }) {
  return (
    <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={({ pressed }) => [s.primary, { backgroundColor: disabled ? N.surface2 : color }, pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] }]}>
      <Text style={[s.primaryText, { color: disabled ? N.ink2 : textColor }]}>{label}</Text>
    </Pressable>
  )
}

export function TintButton({ label, onPress, color = N.accent }: { label: string; onPress?: () => void; color?: string }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [s.tint, { backgroundColor: color + '22' }, pressed && { opacity: 0.75 }]}>
      <Text style={[s.tintText, { color }]}>{label}</Text>
    </Pressable>
  )
}

export function Circle({ icon, label, onPress }: { icon: IconName; label: string; onPress?: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [{ alignItems: 'center', gap: 6, width: 76 }, pressed && { opacity: 0.7 }]}>
      <View style={s.circle}><Ionicons name={icon} size={24} color={N.ink} /></View>
      <Text style={s.circleLabel}>{label}</Text>
    </Pressable>
  )
}

export function SimTag({ text = 'Mô phỏng' }: { text?: string }) {
  return <View style={s.sim}><Text style={s.simText}>{text.toUpperCase()}</Text></View>
}

export function Badge({ n }: { n: number | null }) {
  const missing = n == null
  return (
    <View style={[s.badge, { backgroundColor: missing ? '#737378' : n! > 0 ? N.red : N.accent }]}>
      <Text style={s.badgeText}>{missing ? '–' : n}</Text>
    </View>
  )
}

export const s = StyleSheet.create({
  group: { backgroundColor: N.surface, borderRadius: N.radius, paddingHorizontal: 16, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 52, gap: 6 },
  rowLine: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: N.line },
  rowLabel: { flex: 1, color: N.ink, fontSize: 17 },
  rowValue: { color: N.ink2, fontSize: 17 },
  primary: { minHeight: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  primaryText: { fontSize: 17, fontWeight: '600' },
  tint: { minHeight: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  tintText: { fontSize: 17, fontWeight: '600' },
  circle: { width: 58, height: 58, borderRadius: 29, backgroundColor: 'rgba(255,255,255,0.09)', alignItems: 'center', justifyContent: 'center' },
  circleLabel: { color: N.ink2, fontSize: 12 },
  sim: { alignSelf: 'flex-start', borderWidth: 1, borderColor: N.accent, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  simText: { color: N.accent, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  badge: { minWidth: 18, height: 18, borderRadius: 9, paddingHorizontal: 4, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '800' },
})
