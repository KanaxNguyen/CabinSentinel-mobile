import { useRef, type ReactNode } from 'react'
import { Animated, Modal, Pressable, StyleSheet, Text, TextInput, View, type TextInputProps, type ViewStyle } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { FONT, material, N } from './theme'

type IconName = React.ComponentProps<typeof Ionicons>['name']

export const T = {
  largeTitle: { fontFamily: FONT, color: N.ink, fontSize: 34, fontWeight: '700', letterSpacing: 0.36 } as const,
  title2: { fontFamily: FONT, color: N.ink, fontSize: 22, fontWeight: '700' } as const,
  headline: { fontFamily: FONT, color: N.ink, fontSize: 17, fontWeight: '600' } as const,
  body: { fontFamily: FONT, color: N.ink, fontSize: 17 } as const,
  callout: { fontFamily: FONT, color: N.ink2, fontSize: 16 } as const,
  subhead: { fontFamily: FONT, color: N.ink2, fontSize: 15 } as const,
  footnote: { fontFamily: FONT, color: N.ink2, fontSize: 13 } as const,
  caption: { fontFamily: FONT, color: N.ink2, fontSize: 12 } as const,
}

// Spring press feedback like UIKit's highlight: slight scale and fade.
export function Press({ children, onPress, style, disabled, label }: { children: ReactNode; onPress?: () => void; style?: ViewStyle | ViewStyle[]; disabled?: boolean; label?: string }) {
  const v = useRef(new Animated.Value(1)).current
  const to = (x: number) => Animated.spring(v, { toValue: x, useNativeDriver: false, speed: 40, bounciness: 0 }).start()
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} disabled={disabled} onPress={onPress} onPressIn={() => to(0.97)} onPressOut={() => to(1)}>
      <Animated.View style={[style as ViewStyle, { transform: [{ scale: v }], opacity: v.interpolate({ inputRange: [0.97, 1], outputRange: [0.8, 1] }) }]}>{children}</Animated.View>
    </Pressable>
  )
}

export function Section({ header, footer, children }: { header?: string; footer?: string; children: ReactNode }) {
  return (
    <View style={{ gap: 7 }}>
      {header && <Text style={s.sectionHeader}>{header.toUpperCase()}</Text>}
      <View style={s.group}>{children}</View>
      {footer && <Text style={s.sectionFooter}>{footer}</Text>}
    </View>
  )
}

export function Row({ icon, tint, label, value, onPress, accent, last, chevron = true }: { icon?: IconName; tint?: string; label: string; value?: string; onPress?: () => void; accent?: boolean; last?: boolean; chevron?: boolean }) {
  const body = (
    <View style={[s.row, !last && s.rowLine]}>
      {icon && <Ionicons name={icon} size={20} color={tint ?? (accent ? N.accent : N.ink2)} style={{ width: 28 }} />}
      <Text style={[T.body, { flex: 1 }, accent && { color: N.accent }]}>{label}</Text>
      {value != null && <Text style={[T.body, { color: N.ink2, maxWidth: '55%', textAlign: 'right' }]}>{value}</Text>}
      {onPress && chevron && <Ionicons name="chevron-forward" size={15} color={N.ink3} />}
    </View>
  )
  return onPress ? <Press onPress={onPress} label={label}>{body}</Press> : body
}

export function Button({ label, onPress, disabled, tone = 'accent', kind = 'filled', busy }: { label: string; onPress?: () => void; disabled?: boolean; tone?: 'accent' | 'red' | 'gray'; kind?: 'filled' | 'tinted'; busy?: boolean }) {
  const color = tone === 'red' ? N.red : tone === 'gray' ? N.ink : N.accent
  const filled = kind === 'filled'
  return (
    <Press onPress={onPress} disabled={disabled || busy} style={[s.button, { backgroundColor: disabled ? N.grouped2 : filled ? color : color + '26' }]}>
      <Text style={[T.headline, { color: disabled ? N.ink3 : filled ? (tone === 'accent' ? N.onAccent : '#fff') : color }]}>{busy ? 'Đang xử lý…' : label}</Text>
    </Press>
  )
}

export function Circle({ icon, label, onPress }: { icon: IconName; label: string; onPress?: () => void }) {
  return (
    <Press onPress={onPress} label={label} style={{ alignItems: 'center', gap: 6, width: 76 }}>
      <View style={[s.circle, material('regular')]}><Ionicons name={icon} size={23} color={N.ink} /></View>
      <Text style={T.caption}>{label}</Text>
    </Press>
  )
}

export function Segmented<K extends string>({ value, options, onChange }: { value: K; options: { key: K; label: string }[]; onChange: (k: K) => void }) {
  return (
    <View style={s.seg}>
      {options.map(o => (
        <Pressable key={o.key} accessibilityRole="button" accessibilityState={{ selected: o.key === value }} onPress={() => onChange(o.key)} style={[s.segItem, o.key === value && s.segOn]}>
          <Text style={[T.footnote, { color: N.ink, fontWeight: o.key === value ? '600' : '400', fontSize: 14 }]}>{o.label}</Text>
        </Pressable>
      ))}
    </View>
  )
}

export function Field(props: TextInputProps & { label: string }) {
  const { label, ...rest } = props
  return (
    <View style={{ gap: 6 }}>
      <Text style={T.footnote}>{label}</Text>
      <TextInput placeholderTextColor={N.ink3} autoCapitalize="none" autoCorrect={false} {...rest} style={[s.field, { fontFamily: FONT }]} />
    </View>
  )
}

export function Sheet({ visible, onClose, children }: { visible: boolean; onClose: () => void; children: ReactNode }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={s.scrim} onPress={onClose}>
        <Pressable style={[s.sheet, material('thick')]} onPress={() => undefined}>
          <View style={s.grabber} />
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  )
}

export function SimTag({ text = 'Mô phỏng' }: { text?: string }) {
  return <View style={s.sim}><Text style={s.simText}>{text.toUpperCase()}</Text></View>
}

export function Badge({ n, tone }: { n: number | null; tone: 'people' | 'items' }) {
  if (n === 0) return null
  const missing = n == null
  return (
    <View style={[s.badge, { backgroundColor: missing ? '#737378' : tone === 'people' ? N.red : N.accent }]}>
      <Text style={[s.badgeText, { color: !missing && tone === 'items' ? '#000' : '#fff' }]}>{missing ? '–' : n}</Text>
    </View>
  )
}

export function Empty({ icon, title, text }: { icon: IconName; title: string; text: string }) {
  return (
    <View style={{ alignItems: 'center', gap: 8, paddingVertical: 36, paddingHorizontal: 16 }}>
      <Ionicons name={icon} size={44} color={N.ink3} />
      <Text style={T.title2}>{title}</Text>
      <Text style={[T.subhead, { textAlign: 'center' }]}>{text}</Text>
    </View>
  )
}

export const s = StyleSheet.create({
  group: { backgroundColor: N.grouped, borderRadius: N.radius, paddingHorizontal: 16, overflow: 'hidden' },
  sectionHeader: { fontFamily: FONT, color: N.ink2, fontSize: 13, letterSpacing: 0.3, paddingHorizontal: 16 },
  sectionFooter: { fontFamily: FONT, color: N.ink2, fontSize: 13, paddingHorizontal: 16, lineHeight: 18 },
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 52, gap: 6 },
  rowLine: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: N.line },
  button: { minHeight: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  circle: { width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center' },
  seg: { flexDirection: 'row', backgroundColor: N.fill, borderRadius: 10, padding: 2 },
  segItem: { flex: 1, alignItems: 'center', paddingVertical: 7, borderRadius: 8 },
  segOn: { backgroundColor: '#636366' },
  field: { color: N.ink, fontSize: 17, backgroundColor: N.grouped2, borderRadius: 12, paddingHorizontal: 14, minHeight: 48 },
  scrim: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, paddingTop: 10, gap: 14, maxWidth: 560, width: '100%', alignSelf: 'center', paddingBottom: 32 },
  grabber: { alignSelf: 'center', width: 36, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.3)', marginBottom: 6 },
  sim: { alignSelf: 'flex-start', borderWidth: 1, borderColor: N.accent, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  simText: { color: N.accent, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  badge: { minWidth: 17, height: 17, borderRadius: 9, paddingHorizontal: 4, alignItems: 'center', justifyContent: 'center' },
  badgeText: { fontSize: 10.5, fontWeight: '700' },
})
