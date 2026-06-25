package com.planazo.translation;

import com.planazo.translation.dto.TranslationRequestDTO;
import com.planazo.translation.dto.TranslationResponseDTO;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/translate")
public class TranslationRestController {

    private final TranslationService translationService;

    public TranslationRestController(TranslationService translationService) {
        this.translationService = translationService;
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping(produces = "application/json")
    public ResponseEntity<TranslationResponseDTO> translate(@Valid @RequestBody TranslationRequestDTO request) {
        TranslationResponseDTO response = translationService.translate(request);
        return ResponseEntity.ok(response);
    }
}
