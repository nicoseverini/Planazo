import { Platform } from 'react-native';

const tintColorLight = '#2563EB';
const tintColorDark = '#2563EB';

export const Colors = {
  light: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    elevated: '#F1F5F9',
    text: '#0F172A',
    mutedText: '#64748B',
    border: '#E2E8F0',
    tint: tintColorLight,
    secondary: '#0EA5E9',
    accent: '#D97706',
    success: '#16A34A',
    icon: '#2563EB',
    tabIconDefault: '#64748B',
    tabIconSelected: tintColorLight,
    tintText: '#FFFFFF',
    star: '#F59E0B',
  },
  dark: {
    background: '#0D1117',
    surface: '#141A23',
    elevated: '#1F2937',
    text: '#E5E7EB',
    mutedText: '#9CA3AF',
    border: '#1E293B',
    tint: tintColorDark,
    secondary: '#13BCE5',
    accent: '#F59E0B',
    success: '#22C55E',
    icon: '#13BCE5',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: tintColorDark,
    tintText: '#E5E7EB',
    star: '#F59E0B',
  },
};

/** Shared status badge colors — centralized for consistency across all screens */
export const StatusBadgeColors = {
  public: {
    background: '#dcfce7',
    text: '#166534',
  },
  private: {
    background: '#fef3c7',
    text: '#92400e',
  },
};

// Participation/join-request status. Rendered as an outlined badge (translucent
// fill + colored border/text) so it stays visually distinct from the filled
// visibility badge it sits next to.
export const ParticipationBadgeColors = {
  accepted: '#1E9E63',
  pending: '#D9822B',
};

export const Layout = {
  pagePadding: 16,
  sectionGap: 16,
  cardRadius: 24,
  buttonRadius: 16,
  contentWidth: 420,
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

