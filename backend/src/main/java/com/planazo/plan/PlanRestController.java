package com.planazo.plan;

import com.planazo.common.constants.Interest;
import com.planazo.plan.dto.PlanCreateDTO;
import com.planazo.plan.dto.PlanDetailDTO;
import com.planazo.plan.dto.PlanSummaryDTO;
import com.planazo.plan.dto.PlanUpdateDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/plans")
@Tag(name = "2 - Plans")
class PlanRestController {

    private final PlanService planService;

    @Autowired
    PlanRestController(PlanService planService) {
        this.planService = planService;
    }

    // ── Create ───────────────────────────────────────────────────────────────

    @PreAuthorize("isAuthenticated()")
    @PostMapping(produces = "application/json")
    @Operation(summary = "Create a new plan")
    @ResponseStatus(HttpStatus.CREATED)
    ResponseEntity<PlanDetailDTO> createPlan(
            @Valid @RequestBody PlanCreateDTO data,
            @AuthenticationPrincipal(expression = "username") String email
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(planService.createPlan(data, email));
    }

    // ── Read: public list ────────────────────────────────────────────────────

    @PreAuthorize("permitAll()")
    @GetMapping(produces = "application/json")
    @Operation(summary = "List all public plans")
    List<PlanSummaryDTO> getPublicPlans() {
        return planService.getPublicPlans();
    }

    @PreAuthorize("permitAll()")
    @GetMapping(value = "/nearby", produces = "application/json")
    @Operation(summary = "List nearby public plans based on coordinates")
    List<PlanSummaryDTO> getNearbyPlans(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(defaultValue = "50.0") double radius
    ) {
        return planService.getNearbyPublicPlans(lat, lng, radius);
    }

    // ── Read: single plan ────────────────────────────────────────────────────

    @PreAuthorize("isAuthenticated()")
    @GetMapping(value = "/{id}", produces = "application/json")
    @Operation(summary = "Get a plan by ID")
    @ApiResponse(responseCode = "404", description = "Plan not found", content = @Content)
    ResponseEntity<PlanDetailDTO> getPlan(@PathVariable Long id) {
        return planService.getPlanById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ── Read: my created plans ───────────────────────────────────────────────

    @PreAuthorize("isAuthenticated()")
    @GetMapping(value = "/me/created", produces = "application/json")
    @Operation(summary = "List plans I created")
    List<PlanSummaryDTO> getMyPlans(
            @AuthenticationPrincipal(expression = "username") String email
    ) {
        return planService.getMyPlans(email);
    }

    // ── Read: plans I joined ─────────────────────────────────────────────────

    @PreAuthorize("isAuthenticated()")
    @GetMapping(value = "/me/joined", produces = "application/json")
    @Operation(summary = "List plans I have joined")
    List<PlanSummaryDTO> getJoinedPlans(
            @AuthenticationPrincipal(expression = "username") String email
    ) {
        return planService.getSubscribedPlans(email);
    }

    // ── Update ───────────────────────────────────────────────────────────────

    @PreAuthorize("isAuthenticated()")
    @PatchMapping(value = "/{id}", produces = "application/json")
    @Operation(summary = "Update a plan (creator only)")
    @ApiResponse(responseCode = "403", description = "Not the creator", content = @Content)
    @ApiResponse(responseCode = "404", description = "Plan not found", content = @Content)
    ResponseEntity<PlanDetailDTO> updatePlan(
            @PathVariable Long id,
            @RequestBody PlanUpdateDTO data,
            @AuthenticationPrincipal(expression = "username") String email
    ) {
        return planService.updatePlan(id, data, email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.FORBIDDEN).build());
    }

    // ── Delete (soft) ────────────────────────────────────────────────────────

    @PreAuthorize("isAuthenticated()")
    @DeleteMapping(value = "/{id}", produces = "application/json")
    @Operation(summary = "Delete a plan (creator only, soft delete)")
    @ApiResponse(responseCode = "403", description = "Not the creator", content = @Content)
    @ApiResponse(responseCode = "404", description = "Plan not found", content = @Content)
    ResponseEntity<Object> deletePlan(
            @PathVariable Long id,
            @AuthenticationPrincipal(expression = "username") String email
    ) {
        return planService.deletePlan(id, email)
                .map(deleted -> ResponseEntity.<Void>ok().build())
                .orElse(ResponseEntity.status(HttpStatus.FORBIDDEN).build());
    }

    // ── Admin hard delete ────────────────────────────────────────────────────

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping(value = "/admin/{id}", produces = "application/json")
    @Operation(summary = "Hard delete a plan (admin only)")
    ResponseEntity<Void> adminDeletePlan(@PathVariable Long id) {
        if (planService.adminDeletePlan(id)) return ResponseEntity.ok().build();
        return ResponseEntity.notFound().build();
    }

    // ── Subscribe ────────────────────────────────────────────────────────────

    @PreAuthorize("isAuthenticated()")
    @PostMapping(value = "/{id}/subscribe", produces = "application/json")
    @Operation(summary = "Join a public plan")
    @ApiResponse(responseCode = "409", description = "Already joined or plan is full", content = @Content)
    @ApiResponse(responseCode = "403", description = "Plan is not public", content = @Content)
    ResponseEntity<Void> subscribe(
            @PathVariable Long id,
            @AuthenticationPrincipal(expression = "username") String email
    ) {
        return switch (planService.subscribe(id, email)) {
            case OK           -> ResponseEntity.ok().build();
            case NOT_FOUND    -> ResponseEntity.notFound().build();
            case FULL         -> ResponseEntity.status(HttpStatus.CONFLICT).build();
            case ALREADY_JOINED -> ResponseEntity.status(HttpStatus.CONFLICT).build();
            case NOT_PUBLIC   -> ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        };
    }

    // ── Unsubscribe ──────────────────────────────────────────────────────────

    @PreAuthorize("isAuthenticated()")
    @DeleteMapping(value = "/{id}/subscribe", produces = "application/json")
    @Operation(summary = "Leave a plan")
    @ApiResponse(responseCode = "409", description = "Not subscribed to this plan", content = @Content)
    ResponseEntity<Void> unsubscribe(
            @PathVariable Long id,
            @AuthenticationPrincipal(expression = "username") String email
    ) {
        return switch (planService.unsubscribe(id, email)) {
            case OK             -> ResponseEntity.ok().build();
            case NOT_FOUND      -> ResponseEntity.notFound().build();
            case NOT_SUBSCRIBED -> ResponseEntity.status(HttpStatus.CONFLICT).build();
        };
    }

    @PreAuthorize("permitAll()")
    @GetMapping(value = "/filter", produces = "application/json")
    @Operation(summary = "Filter public plans by category, date, location")
    List<PlanSummaryDTO> filterPlans(
            @RequestParam(required = false) Interest interest,
            @RequestParam(required = false) 
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateFrom,
            @RequestParam(required = false) 
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateTo,
            @RequestParam(required = false) String location
    ) {
        return planService.getFilteredPlans(interest, dateFrom, dateTo, location);
    }
}