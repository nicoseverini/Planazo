package com.planazo.turistic_place;

import com.planazo.turistic_place.dto.TuristicPlaceCreateDTO;
import com.planazo.turistic_place.dto.TuristicPlaceDetailDTO;
import com.planazo.turistic_place.dto.TuristicPlaceSummaryDTO;
import com.planazo.turistic_place.dto.TuristicPlaceUpdateDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/turistic-places")
@Tag(name = "3 - Turistic Places")
class TuristicPlaceRestController {

    private final TuristicPlaceService turisticPlaceService;

    TuristicPlaceRestController(TuristicPlaceService turisticPlaceService) {
        this.turisticPlaceService = turisticPlaceService;
    }

    @PreAuthorize("permitAll()")
    @GetMapping(produces = "application/json")
    @Operation(summary = "List all turistic places")
    List<TuristicPlaceSummaryDTO> getAllTuristicPlaces() {
        return turisticPlaceService.getAllTuristicPlaces();
    }

    @PreAuthorize("permitAll()")
    @GetMapping(value = "/{id}", produces = "application/json")
    @Operation(summary = "Get a turistic place by ID")
    @ApiResponse(responseCode = "404", description = "Turistic place not found", content = @Content)
    ResponseEntity<TuristicPlaceDetailDTO> getTuristicPlace(@PathVariable Long id) {
        return turisticPlaceService.getTuristicPlaceById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping(produces = "application/json")
    @Operation(summary = "Create a new turistic place")
    @ResponseStatus(HttpStatus.CREATED)
    ResponseEntity<TuristicPlaceDetailDTO> createTuristicPlace(@Valid @RequestBody TuristicPlaceCreateDTO data) {
        return ResponseEntity.status(HttpStatus.CREATED).body(turisticPlaceService.createTuristicPlace(data));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping(value = "/{id}", produces = "application/json")
    @Operation(summary = "Update a turistic place")
    @ApiResponse(responseCode = "404", description = "Turistic place not found", content = @Content)
    ResponseEntity<TuristicPlaceDetailDTO> updateTuristicPlace(
            @PathVariable Long id,
            @RequestBody TuristicPlaceUpdateDTO data
    ) {
        return turisticPlaceService.updateTuristicPlace(id, data)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping(value = "/{id}", produces = "application/json")
    @Operation(summary = "Delete a turistic place")
    @ApiResponse(responseCode = "404", description = "Turistic place not found", content = @Content)
    ResponseEntity<Void> deleteTuristicPlace(@PathVariable Long id) {
        if (turisticPlaceService.deleteTuristicPlace(id)) {
            return ResponseEntity.ok().build();
        }

        return ResponseEntity.notFound().build();
    }
}