package com.planazo.geocoding;

import com.planazo.geocoding.dto.GeocodeResultDTO;
import com.planazo.geocoding.dto.ReverseGeocodeResultDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/geocoding")
public class GeocodingRestController {

    private final GeocodingService geocodingService;

    public GeocodingRestController(GeocodingService geocodingService) {
        this.geocodingService = geocodingService;
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping(value = "/search", produces = "application/json")
    public ResponseEntity<GeocodeResultDTO> search(@RequestParam(defaultValue = "") String query) {
        return ResponseEntity.ok(geocodingService.geocode(query));
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping(value = "/reverse", produces = "application/json")
    public ResponseEntity<ReverseGeocodeResultDTO> reverse(
            @RequestParam double latitude,
            @RequestParam double longitude) {
        return ResponseEntity.ok(geocodingService.reverse(latitude, longitude));
    }
}
