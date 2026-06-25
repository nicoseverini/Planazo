package com.planazo.tourist_place;

import com.planazo.tourist_place.dto.TouristPlaceAdminDeleteDTO;
import com.planazo.tourist_place.dto.TouristPlaceCreateDTO;
import com.planazo.tourist_place.dto.TouristPlaceDetailDTO;
import com.planazo.tourist_place.dto.TouristPlaceSummaryDTO;
import com.planazo.tourist_place.dto.TouristPlaceUpdateDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
@RequestMapping("/api/v1/tourist-places")
@Tag(name = "3 - Tourist Places")
class TouristPlaceRestController {

    private final TouristPlaceService touristPlaceService;

    TouristPlaceRestController(TouristPlaceService touristPlaceService) {
        this.touristPlaceService = touristPlaceService;
    }

    @PreAuthorize("permitAll()")
    @GetMapping(produces = "application/json")
    @Operation(summary = "List all tourist places")
    List<TouristPlaceSummaryDTO> getAllTouristPlaces() {
        return touristPlaceService.getAllTouristPlaces();
    }

    @PreAuthorize("permitAll()")
    @GetMapping(value = "/{id}", produces = "application/json")
    @Operation(summary = "Get a tourist place by ID")
    @ApiResponse(responseCode = "404", description = "Tourist place not found", content = @Content)
    ResponseEntity<TouristPlaceDetailDTO> getTouristPlace(@PathVariable Long id) {
        return touristPlaceService.getTouristPlaceById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping(value = "/me", produces = "application/json")
    @Operation(summary = "List tourist places created by me")
    List<TouristPlaceSummaryDTO> getMyTouristPlaces(
            @AuthenticationPrincipal(expression = "username") String email
    ) {
        return touristPlaceService.getMyTouristPlaces(email);
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping(produces = "application/json")
    @Operation(summary = "Create a new tourist place")
    @ResponseStatus(HttpStatus.CREATED)
    ResponseEntity<TouristPlaceDetailDTO> createTouristPlace(
            @Valid @RequestBody TouristPlaceCreateDTO data,
            @AuthenticationPrincipal(expression = "username") String email
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(touristPlaceService.createTouristPlace(data, email));
    }

    @PreAuthorize("isAuthenticated()")
    @PatchMapping(value = "/{id}", produces = "application/json")
    @Operation(summary = "Update a tourist place (creator or admin)")
    @ApiResponse(responseCode = "403", description = "Not the creator", content = @Content)
    ResponseEntity<TouristPlaceDetailDTO> updateTouristPlace(
            @PathVariable Long id,
            @Valid @RequestBody TouristPlaceUpdateDTO data,
            @AuthenticationPrincipal(expression = "username") String email
    ) {
        return touristPlaceService.updateTouristPlace(id, data, email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.FORBIDDEN).build());
    }

    @PreAuthorize("isAuthenticated()")
    @DeleteMapping(value = "/{id}", produces = "application/json")
    @Operation(summary = "Delete a tourist place (creator or admin)")
    @ApiResponse(responseCode = "403", description = "Not the creator", content = @Content)
    ResponseEntity<Void> deleteTouristPlace(
            @PathVariable Long id,
            @AuthenticationPrincipal(expression = "username") String email
    ) {
        if (touristPlaceService.deleteTouristPlace(id, email).isPresent()) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping(value = "/admin/{id}", produces = "application/json")
    @Operation(summary = "Hard delete a tourist place (admin only)")
    ResponseEntity<Void> adminDeleteTouristPlace(
            @PathVariable Long id,
            @RequestBody(required = false) TouristPlaceAdminDeleteDTO data
    ) {
        if (touristPlaceService.adminDeleteTouristPlace(id, data != null ? data.reason() : null)) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}