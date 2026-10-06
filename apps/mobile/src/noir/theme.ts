import { Platform } from 'react-native'

// Apple system palette (dark) and materials, matching the SwiftUI app (accent F4C20D, grouped surfaces, radius 22).
export const N = {
  accent: '#F4C20D',
  onAccent: '#1a1400',
  canvas: '#000000',
  grouped: '#1C1C1E',
  grouped2: '#2C2C2E',
  fill: 'rgba(120,120,128,0.24)',
  line: 'rgba(84,84,88,0.65)',
  ink: '#FFFFFF',
  ink2: 'rgba(235,235,245,0.60)',
  ink3: 'rgba(235,235,245,0.30)',
  green: '#30D158',
  blue: '#0A84FF',
  orange: '#FF9F0A',
  red: '#FF453A',
  radius: 22,
}

export const FONT = Platform.select({
  web: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", system-ui, "Helvetica Neue", Arial, sans-serif',
  default: undefined,
})

// iOS "regular" and "thick" materials: translucent fill + blur + saturation boost + hairline edge.
export const material = (kind: 'thin' | 'regular' | 'thick' = 'regular'): object => {
  const alpha = kind === 'thin' ? 0.42 : kind === 'regular' ? 0.62 : 0.82
  const blur = kind === 'thin' ? 18 : kind === 'regular' ? 30 : 44
  return {
    backgroundColor: `rgba(38,38,42,${alpha})`,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backdropFilter: `blur(${blur}px) saturate(180%)`,
    WebkitBackdropFilter: `blur(${blur}px) saturate(180%)`,
  }
}

export type Level = 'safe' | 'notice' | 'warning' | 'critical' | 'paused' | 'unknown'

export const LEVEL: Record<Level, { label: string; color: string; icon: 'shield-checkmark' | 'information-circle' | 'warning' | 'alert-circle' | 'pause-circle' | 'help-circle' }> = {
  safe: { label: 'Bình thường', color: N.green, icon: 'shield-checkmark' },
  notice: { label: 'Cần xem xét', color: N.blue, icon: 'information-circle' },
  warning: { label: 'Cảnh báo', color: N.orange, icon: 'warning' },
  critical: { label: 'Nghiêm trọng', color: N.red, icon: 'alert-circle' },
  paused: { label: 'Tạm dừng', color: N.ink2, icon: 'pause-circle' },
  unknown: { label: 'Chưa xác định', color: N.ink2, icon: 'help-circle' },
}
