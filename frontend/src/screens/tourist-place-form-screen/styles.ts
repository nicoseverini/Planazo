import { StyleSheet } from 'react-native';
import { Layout } from '@/constants/theme';

export const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 24,
    },
    headerButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
    inputGroup: {
        marginBottom: 16,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    halfInput: {
        flex: 1,
    },
    input: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: Layout.buttonRadius,
        borderWidth: 1,
        fontSize: 16,
    },
    textArea: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: Layout.buttonRadius,
        borderWidth: 1,
        fontSize: 16,
        minHeight: 100,
        textAlignVertical: 'top',
    },
    categoryRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 4,
    },
    categoryChip: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 1,
    },
    imagesRow: {
        flexDirection: 'row',
        gap: 12,
    },
    imagePreviewContainer: {
        position: 'relative',
    },
    imagePreview: {
        width: 100,
        height: 100,
        borderRadius: Layout.buttonRadius,
    },
    removeImageButton: {
        position: 'absolute',
        top: -6,
        right: -6,
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addImageButton: {
        width: 100,
        height: 100,
        borderRadius: Layout.buttonRadius,
        borderWidth: 2,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
    },
    errorContainer: {
        padding: 12,
        backgroundColor: '#fef2f2',
        borderRadius: Layout.buttonRadius,
        marginBottom: 16,
    },
    submitButton: {
        paddingVertical: 16,
        borderRadius: Layout.buttonRadius,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    pressed: {
        opacity: 0.7,
    },
    disabled: {
        opacity: 0.5,
    },
});
