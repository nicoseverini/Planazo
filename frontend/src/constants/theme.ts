import { Platform } from 'react-native';

const tintColorLight = '#0984E3';
const tintColorDark = '#74B9FF';

export const Colors = {
  light: {
    background: '#FFF9E6',
    surface: '#FFFFFF',
    elevated: '#FFF4E6',
    text: '#2D3436',
    mutedText: '#9B9B9B',
    border: '#FFE5B4',
    tint: tintColorLight,
    icon: '#4ECDC4',
    tabIconDefault: '#9B9B9B',
    tabIconSelected: tintColorLight,
    tintText: '#ffffff',
  },
  dark: {
    background: '#1A1B2E',
    surface: '#252640',
    elevated: '#2E3050',
    text: '#F5F5F5',
    mutedText: '#8B8DA3',
    border: '#3D3F5C',
    tint: tintColorDark,
    icon: '#4ECDC4',
    tabIconDefault: '#8B8DA3',
    tabIconSelected: tintColorDark,
    tintText: '#1A1B2E',
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

