import { useThemeColor } from '@/hooks/use-theme-color';

export function useAppTheme() {
    return {
        tint: useThemeColor({}, 'tint'),
        tintText: useThemeColor({}, 'tintText'),
        surface: useThemeColor({}, 'surface'),
        border: useThemeColor({}, 'border'),
        mutedText: useThemeColor({}, 'mutedText'),
        text: useThemeColor({}, 'text'),
        background: useThemeColor({}, 'background'),
        secondary: useThemeColor({}, 'secondary'),
        accent: useThemeColor({}, 'accent'),
        success: useThemeColor({}, 'success'),
        star: useThemeColor({}, 'star'),
    };
}
