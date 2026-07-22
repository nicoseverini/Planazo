package com.planazo.geocoding;

import com.fasterxml.jackson.databind.JsonNode;
import com.planazo.common.exception.GeocodingUnavailableException;
import com.planazo.common.exception.LocationNotFoundException;
import com.planazo.geocoding.dto.GeocodeResultDTO;
import com.planazo.geocoding.dto.ReverseGeocodeResultDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.List;

/**
 * Single entry point for all geocoding in the platform. It proxies requests to
 * one external provider (OpenStreetMap / Nominatim), so both the mobile app and
 * the web panel resolve addresses through the same service and get consistent
 * results.
 */
@Service
public class GeocodingService {

    private final String apiUrl;
    private final String userAgent;
    private final RestTemplate restTemplate;

    public GeocodingService(
            @Value("${geocoding.api.url}") String apiUrl,
            @Value("${geocoding.user-agent}") String userAgent) {
        this.apiUrl = apiUrl.replaceAll("/+$", "");
        this.userAgent = userAgent;

        // Explicit timeouts so a slow or unresponsive provider fails fast
        // instead of leaving the request thread hanging.
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5_000);
        factory.setReadTimeout(10_000);
        this.restTemplate = new RestTemplate(factory);
    }

    /** Forward geocoding: free-form address text to coordinates. */
    public GeocodeResultDTO geocode(String query) {
        if (query == null || query.isBlank()) {
            throw new LocationNotFoundException();
        }

        // Build a fully-encoded URI. Passing a URI (instead of a String) prevents
        // RestTemplate from encoding it a second time and corrupting the query.
        URI uri = UriComponentsBuilder.fromHttpUrl(apiUrl + "/search")
                .queryParam("format", "jsonv2")
                .queryParam("limit", 1)
                .queryParam("q", query)
                .encode()
                .build()
                .toUri();

        JsonNode body = requestJson(uri);
        if (body == null || !body.isArray() || body.isEmpty()) {
            throw new LocationNotFoundException();
        }

        JsonNode match = body.get(0);
        return new GeocodeResultDTO(
                match.path("lat").asDouble(),
                match.path("lon").asDouble(),
                textOrNull(match, "display_name")
        );
    }

    /** Reverse geocoding: coordinates to a structured address. */
    public ReverseGeocodeResultDTO reverse(double latitude, double longitude) {
        URI uri = UriComponentsBuilder.fromHttpUrl(apiUrl + "/reverse")
                .queryParam("format", "jsonv2")
                .queryParam("lat", latitude)
                .queryParam("lon", longitude)
                .encode()
                .build()
                .toUri();

        JsonNode body = requestJson(uri);
        if (body == null || body.path("address").isMissingNode()) {
            throw new LocationNotFoundException(
                    "We couldn't determine the address for the selected point. Please pick another location or type the address manually.");
        }

        JsonNode address = body.path("address");
        String countryCode = textOrNull(address, "country_code");
        return new ReverseGeocodeResultDTO(
                textOrNull(address, "country"),
                countryCode == null ? null : countryCode.toUpperCase(),
                firstNonBlank(address, "state", "province", "region"),
                firstNonBlank(address, "city", "town", "village", "county"),
                textOrNull(address, "road"),
                textOrNull(address, "house_number"),
                textOrNull(body, "display_name")
        );
    }

    private JsonNode requestJson(URI uri) {
        try {
            HttpHeaders headers = new HttpHeaders();
            // Nominatim's usage policy requires a descriptive User-Agent.
            headers.set(HttpHeaders.USER_AGENT, userAgent);
            headers.setAccept(List.of(MediaType.APPLICATION_JSON));

            ResponseEntity<JsonNode> response = restTemplate.exchange(
                    uri, HttpMethod.GET, new HttpEntity<>(headers), JsonNode.class);
            return response.getBody();
        } catch (RestClientException ex) {
            throw new GeocodingUnavailableException(ex);
        }
    }

    private static String textOrNull(JsonNode node, String field) {
        JsonNode value = node.path(field);
        return value.isMissingNode() || value.isNull() ? null : value.asText();
    }

    private static String firstNonBlank(JsonNode node, String... fields) {
        for (String field : fields) {
            String value = textOrNull(node, field);
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return null;
    }
}
