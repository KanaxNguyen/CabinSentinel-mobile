// Tokens mirror the SwiftUI app (Noir: accent F4C20D, canvas 050506, flat grouped surfaces, radius 22).
export const N = {
  accent: '#F4C20D',
  onAccent: '#1a1400',
  canvas: '#050506',
  surface: '#1c1c1e',
  surface2: '#2c2c2e',
  line: 'rgba(255,255,255,0.10)',
  ink: '#ffffff',
  ink2: 'rgba(235,235,245,0.62)',
  green: '#30D158',
  blue: '#409CFF',
  orange: '#FF9F0A',
  red: '#FF453A',
  radius: 22,
}

export type Level = 'safe' | 'notice' | 'warning' | 'critical' | 'unknown'

export const LEVEL: Record<Level, { label: string; color: string; icon: 'shield-checkmark' | 'information-circle' | 'warning' | 'alert-circle' | 'help-circle' }> = {
  safe: { label: 'Bình thường', color: N.green, icon: 'shield-checkmark' },
  notice: { label: 'Cần xem xét', color: N.blue, icon: 'information-circle' },
  warning: { label: 'Cảnh báo', color: N.orange, icon: 'warning' },
  critical: { label: 'Nghiêm trọng', color: N.red, icon: 'alert-circle' },
  unknown: { label: 'Chưa xác định', color: N.ink2, icon: 'help-circle' },
}
