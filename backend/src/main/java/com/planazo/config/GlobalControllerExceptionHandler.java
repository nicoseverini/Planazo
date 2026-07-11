package com.planazo.config;

import com.planazo.common.exception.AgeRestrictionException;
import com.planazo.common.exception.GeocodingUnavailableException;
import com.planazo.common.exception.InvalidAgeRangeException;
import com.planazo.common.exception.InvalidBudgetException;
import com.planazo.common.exception.InvalidDateRangeException;
import com.planazo.common.exception.InvalidMaxSubscribersException;
import com.planazo.common.exception.InvalidTimezoneException;
import com.planazo.common.exception.ItemNotFoundException;
import com.planazo.common.exception.LocationNotFoundException;
import com.planazo.common.exception.PlanExpiredException;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class GlobalControllerExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalControllerExceptionHandler.class);

    @ExceptionHandler(AgeRestrictionException.class)
    @ApiResponse(responseCode = "422", description = "User does not meet plan's age requirements", content = @Content(mediaType = "text/plain", schema = @Schema(implementation = String.class)))
    public ResponseEntity<String> handleAgeRestriction(AgeRestrictionException ex) {
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.UNPROCESSABLE_ENTITY);
    }

    @ExceptionHandler(InvalidAgeRangeException.class)
    @ApiResponse(responseCode = "400", description = "Invalid age range", content = @Content(mediaType = "text/plain", schema = @Schema(implementation = String.class)))
    public ResponseEntity<String> handleInvalidAgeRange(InvalidAgeRangeException ex) {
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(InvalidBudgetException.class)
    @ApiResponse(responseCode = "400", description = "Invalid budget value", content = @Content(mediaType = "text/plain", schema = @Schema(implementation = String.class)))
    public ResponseEntity<String> handleInvalidBudget(InvalidBudgetException ex) {
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(InvalidMaxSubscribersException.class)
    @ApiResponse(responseCode = "400", description = "Invalid max subscribers value", content = @Content(mediaType = "text/plain", schema = @Schema(implementation = String.class)))
    public ResponseEntity<String> handleInvalidMaxSubscribers(InvalidMaxSubscribersException ex) {
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(InvalidDateRangeException.class)
    @ApiResponse(responseCode = "400", description = "Invalid date range", content = @Content(mediaType = "text/plain", schema = @Schema(implementation = String.class)))
    public ResponseEntity<String> handleInvalidDateRange(InvalidDateRangeException ex) {
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(InvalidTimezoneException.class)
    @ApiResponse(responseCode = "400", description = "Invalid IANA time zone identifier", content = @Content(mediaType = "text/plain", schema = @Schema(implementation = String.class)))
    public ResponseEntity<String> handleInvalidTimezone(InvalidTimezoneException ex) {
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    @ApiResponse(responseCode = "400", description = "Malformed or unparseable request body", content = @Content(mediaType = "text/plain", schema = @Schema(implementation = String.class)))
    public ResponseEntity<String> handleUnreadableMessage(HttpMessageNotReadableException ex) {
        String cause = ex.getCause() != null ? ex.getCause().getMessage() : ex.getMessage();
        return new ResponseEntity<>("Invalid request body: " + cause, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ApiResponse(
            responseCode = "400",
            description = "Invalid arguments supplied",
            content = @Content(
                    mediaType = "text/plain",
                    schema = @Schema(implementation = String.class, example = "Validation failed because x, y, z")
            )
    )
    public ResponseEntity<String> handleMethodArgumentInvalid(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(FieldError::getDefaultMessage)
                .orElse("Invalid request data.");
        return new ResponseEntity<>(message, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(ItemNotFoundException.class)
    @ApiResponse(
            responseCode = "404",
            description = "Referenced entity not found",
            content = @Content(
                    mediaType = "text/plain",
                    schema = @Schema(implementation = String.class, example = "Failed to find foo with id 42")
            )
    )
    public ResponseEntity<String> handleItemNotFound(ItemNotFoundException ex) {
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(EntityNotFoundException.class)
    @ApiResponse(responseCode = "404", description = "Entity not found", content = @Content(mediaType = "text/plain", schema = @Schema(implementation = String.class)))
    public ResponseEntity<String> handleEntityNotFound(EntityNotFoundException ex) {
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(PlanExpiredException.class)
    @ApiResponse(responseCode = "410", description = "Plan has ended", content = @Content(mediaType = "text/plain", schema = @Schema(implementation = String.class)))
    public ResponseEntity<String> handlePlanExpired(PlanExpiredException ex) {
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.GONE);
    }

    @ExceptionHandler(LocationNotFoundException.class)
    @ApiResponse(responseCode = "404", description = "The address or coordinates could not be resolved", content = @Content(mediaType = "text/plain", schema = @Schema(implementation = String.class)))
    public ResponseEntity<String> handleLocationNotFound(LocationNotFoundException ex) {
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(GeocodingUnavailableException.class)
    @ApiResponse(responseCode = "503", description = "The geocoding provider is temporarily unavailable", content = @Content(mediaType = "text/plain", schema = @Schema(implementation = String.class)))
    public ResponseEntity<String> handleGeocodingUnavailable(GeocodingUnavailableException ex) {
        log.warn("Geocoding provider unavailable", ex);
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.SERVICE_UNAVAILABLE);
    }

    @ExceptionHandler(AccessDeniedException.class)
    @ApiResponse(responseCode = "403", description = "Invalid jwt access token supplied", content = @Content)
    public ResponseEntity<String> handleAccessDenied(AccessDeniedException ex) {
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<String> handleResponseStatus(ResponseStatusException ex) {
        String body = ex.getReason() != null ? ex.getReason() : ex.getMessage();
        return new ResponseEntity<>(body, ex.getStatusCode());
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    @ApiResponse(responseCode = "400", description = "Invalid query parameter value", content = @Content(mediaType = "text/plain", schema = @Schema(implementation = String.class)))
    public ResponseEntity<String> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        String message = String.format("Invalid value '%s' for parameter '%s'.", ex.getValue(), ex.getName());
        return new ResponseEntity<>(message, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Throwable.class)
    public ResponseEntity<String> handleFallback(Throwable ex) {
        log.error("Unhandled exception", ex);
        return new ResponseEntity<>("An unexpected error occurred. Please try again later.", HttpStatus.INTERNAL_SERVER_ERROR);
    }
}