package com.planazo.translation;

import com.planazo.translation.dto.TranslationRequestDTO;
import com.planazo.translation.dto.TranslationResponseDTO;
import com.planazo.translation.dto.GeminiRequest;
import com.planazo.translation.dto.GeminiResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Service
public class TranslationService {

    private final String apiUrl;
    private final String apiKey;
    private final RestTemplate restTemplate;

    public TranslationService(
            @Value("${gemini.api.url}") String apiUrl,
            @Value("${gemini.api.key}") String apiKey) {
        this.apiUrl = apiUrl;
        this.apiKey = apiKey;
        this.restTemplate = new RestTemplate();
    }

    public TranslationResponseDTO translate(TranslationRequestDTO request) {
        String text = request.text();
        String target = request.targetLanguage().toLowerCase();
        String source = target.equals("es") ? "en" : "es";

        // If the apiKey is not configured, return original text
        if (apiKey == null || apiKey.isBlank() || apiKey.startsWith("your_gemini_api_key")) {
            System.err.println("Warning: GEMINI_API_KEY is not configured. Returning original text.");
            return new TranslationResponseDTO(text, source, target);
        }

        String translated = callGemini(text, target);

        if (translated == null || translated.isBlank()) {
            // Fallback to original text if translation fails
            translated = text;
        }

        return new TranslationResponseDTO(translated, source, target);
    }

    private String callGemini(String text, String targetLanguage) {
        try {
            String targetLangName = targetLanguage.equals("es") ? "Spanish (Argentine dialect)" : "English";
            String systemInstructionText = String.format(
                    "You are a professional translator. Translate the provided text into %s. " +
                    "Preserve Argentine cultural context, local vocabulary, and slang (like 'asado', 're', 'boliche', 'FIUBA', 'che', 'bondi') where appropriate. " +
                    "Return ONLY the translated text. Do not include any markdown format, quotes, explanations, or conversational filler. " +
                    "Just return the raw translated string.",
                    targetLangName
            );

            // Construct request payload structure
            GeminiRequest.Part systemPart = new GeminiRequest.Part(systemInstructionText);
            GeminiRequest.SystemInstruction systemInstruction = new GeminiRequest.SystemInstruction(List.of(systemPart));

            GeminiRequest.Part userPart = new GeminiRequest.Part(text);
            GeminiRequest.Content userContent = new GeminiRequest.Content("user", List.of(userPart));

            GeminiRequest geminiRequest = new GeminiRequest(List.of(userContent), systemInstruction);

            // Setup headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<GeminiRequest> entity = new HttpEntity<>(geminiRequest, headers);

            // Call official Google AI Studio endpoint passing API key as query parameter
            String urlWithKey = apiUrl + "?key=" + apiKey;

            GeminiResponse response = restTemplate.postForObject(urlWithKey, entity, GeminiResponse.class);

            if (response != null && response.candidates() != null && !response.candidates().isEmpty()) {
                GeminiResponse.Candidate candidate = response.candidates().get(0);
                if (candidate.content() != null && candidate.content().parts() != null && !candidate.content().parts().isEmpty()) {
                    String translatedText = candidate.content().parts().get(0).text();
                    if (translatedText != null) {
                        return translatedText.strip();
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Gemini translation API error: " + e.getMessage());
        }
        return null;
    }
}
