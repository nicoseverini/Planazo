/**
 * Checks if a given text appears to be written in Spanish.
 * Uses a heuristic of common Spanish stopwords and Spanish-specific characters.
 */
export function isSpanishText(text: string | null | undefined): boolean {
    if (!text || !text.trim()) return true; // Default to true for empty text
    const lower = text.toLowerCase();

    // Check for Spanish-specific characters (ñ, á, é, í, ó, ú, ü, ¿, ¡)
    const spanishChars = /[ñáéíóúü¿¡]/i;
    if (spanishChars.test(lower)) {
        return true;
    }

    // Check for common Spanish stopwords
    const spanishStopwords = new Set([
        'hola', 'de', 'para', 'porque',
        'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas',
        'de', 'del', 'al', 'con', 'para', 'por', 'que', 'en',
        'y', 'o', 'es', 'son', 'este', 'esta', 'estos', 'estas',
        'como', 'pero', 'mas', 'más', 'muy', 'bien', 'bueno', 'buena'
    ]);

    // Check for common English stopwords
    const englishStopwords = new Set([
        'the', 'and', 'of', 'to', 'in', 'is', 'that', 'it', 'was',
        'for', 'on', 'are', 'as', 'with', 'they', 'at', 'be', 'this',
        'have', 'from', 'about', 'great', 'place', 'very', 'nice'
    ]);

    const words = lower.split(/[^a-záéíóúüñ]+/i).filter(Boolean);
    let spanishCount = 0;
    let englishCount = 0;

    for (const word of words) {
        if (spanishStopwords.has(word)) {
            spanishCount++;
        }
        if (englishStopwords.has(word)) {
            englishCount++;
        }
    }

    if (spanishCount > 0 && spanishCount >= englishCount) {
        return true;
    }
    if (englishCount > spanishCount) {
        return false;
    }

    return false;
}
