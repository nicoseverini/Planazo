import { useState } from 'react';
import {
    Keyboard,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import { useAppTheme } from '@/hooks/use-app-theme';
import React from 'react';

type AutocompleteProps = {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    suggestions: string[];
    required?: boolean;
};

export function Autocomplete({ value, onChange, placeholder, suggestions, required }: AutocompleteProps) {
    const { surface, border, text, background, tint } = useAppTheme();
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);

    const filteredSuggestions = suggestions
        .filter((s) => s.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 10);

    const handleSelect = (suggestion: string) => {
        onChange(suggestion);
        setIsOpen(false);
        setHighlightedIndex(-1);
    };

    const handleBlur = () => {
        setTimeout(() => setIsOpen(false), 200);
    };

    return (
        <View style={styles.container} collapsable={false}>
            <TextInput
                value={value}
                onChangeText={(text) => {
                    onChange(text);
                    setIsOpen(true);
                    setHighlightedIndex(-1);
                }}
                onFocus={() => setIsOpen(true)}
                onBlur={handleBlur}
                placeholder={placeholder}
                placeholderTextColor="#999"
                style={[
                    styles.input,
                    { backgroundColor: surface, borderColor: border, color: text },
                ]}
            />
            <Modal
                visible={isOpen && filteredSuggestions.length > 0 && value !== ''}
                transparent
                animationType="none"
                onRequestClose={() => setIsOpen(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={[styles.dropdown, { backgroundColor: surface, borderColor: border }]}>
                            <ScrollView
                                style={styles.list}
                                keyboardShouldPersistTaps="handled"
                            >
                                {filteredSuggestions.map((suggestion, index) => (
                                    <Pressable
                                        key={suggestion}
                                        onPress={() => handleSelect(suggestion)}
                                        style={[
                                            styles.suggestion,
                                            index === highlightedIndex && {
                                                backgroundColor: tint,
                                            },
                                        ]}
                                    >
                                        <Text style={[styles.suggestionText, { color: text }]}>{suggestion}</Text>
                                    </Pressable>
                                ))}
                            </ScrollView>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        zIndex: 9999,
        overflow: 'visible',
    },
    input: {
        height: 48,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 16,
        fontSize: 16,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '90%',
        maxWidth: 400,
    },
    dropdown: {
        borderRadius: 8,
        maxHeight: 300,
        elevation: 50,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 16,
    },
    list: {
        maxHeight: 300,
    },
    suggestion: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    suggestionText: {
        fontSize: 16,
    },
});
