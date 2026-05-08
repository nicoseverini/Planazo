import { Platform } from 'react-native';

const tintColorLight = '#000000';
const tintColorDark = '#ffffff';

export const Colors = {
  light: {
    background: '#ffffff',
    surface: '#ffffff',
    elevated: '#f5f5f5',
    text: '#000000',
    mutedText: '#6b7280',
    border: '#d1d5db',
    tint: tintColorLight,
    icon: '#6b7280',
    tabIconDefault: '#6b7280',
    tabIconSelected: tintColorLight,
    tintText: '#ffffff',
  },
  dark: {
    background: '#000000',
    surface: '#1f1f1f',
    elevated: '#2d2d2d',
    text: '#ffffff',
    mutedText: '#a1a1a1',
    border: '#404040',
    tint: tintColorDark,
    icon: '#a1a1a1',
    tabIconDefault: '#a1a1a1',
    tabIconSelected: tintColorDark,
    tintText: '#000000',
  },
};

export const Layout = {
  pagePadding: 24,
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
