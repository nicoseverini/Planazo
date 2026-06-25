import * as ImagePicker from 'expo-image-picker';

/**
 * Ensures gallery / media-library access, requesting it in-context and respecting
 * the OS-managed permission state (no custom persistence).
 *
 * - granted        → returns true without prompting again.
 * - undetermined   → shows the native permission dialog (first usage).
 * - denied but askable → asks once more.
 * - denied permanently (canAskAgain === false) → returns false without prompting,
 *   so the caller can guide the user to the system Settings.
 */
export async function ensureMediaLibraryPermission(): Promise<boolean> {
    const current = await ImagePicker.getMediaLibraryPermissionsAsync();
    if (current.status === 'granted') return true;
    if (current.canAskAgain) {
        const requested = await ImagePicker.requestMediaLibraryPermissionsAsync();
        return requested.status === 'granted';
    }
    return false;
}
