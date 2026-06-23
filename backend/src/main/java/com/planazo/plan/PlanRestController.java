package com.planazo.plan;

import com.planazo.common.constants.Interest;
import com.planazo.plan.dto.PlanCreateDTO;
import com.planazo.plan.dto.PlanDetailDTO;
import com.planazo.plan.dto.PendingSubscriberDTO;
import com.planazo.plan.dto.PlanSubscriberDTO;
import com.planazo.plan.dto.PlanSummaryDTO;
import com.planazo.plan.dto.PlanUpdateDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;
import java.util.List;

import com.planazo.config.security.JwtUserDetails;

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
    @Operation(summary = "List all plans")
    List<PlanSummaryDTO> getAllPlans() {
        return planService.getAllPlans();
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping(value="/paginated" , produces = "application/json")
    @Operation(summary = "List all plans")
    Page<PlanSummaryDTO> getAllPlans(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return planService.getAllPlans(PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "title")));
    }

    @PreAuthorize("isAuthenticated()")
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
    @GetMapping(value = "/me/joined-all", produces = "application/json")
    @Operation(summary = "List plans I have joined")
    List<PlanSummaryDTO> getJoinedPlans(
            @AuthenticationPrincipal(expression = "username") String email
    ) {
        return planService.getSubscribedPlans(email);
    }
    @PreAuthorize("isAuthenticated()")
    @GetMapping(value = "/me/joined-not-mine", produces = "application/json")
    @Operation(summary = "List plans I have joined")
    List<PlanSummaryDTO> getJoinedPlansNotMine(
            @AuthenticationPrincipal(expression = "username") String email
    ) {
        return planService.getSubscribedPlansButNotMine(email);
    }

    // ── Read: pending subscriptions ────────────────────────────────────────

    @PreAuthorize("isAuthenticated()")
    @GetMapping(value = "/{id}/pending-subscribers", produces = "application/json")
    @Operation(summary = "List pending subscription requests for a plan")
    List<PendingSubscriberDTO> getPendingSubscribers(
            @PathVariable Long id,
            @AuthenticationPrincipal(expression = "username") String email
    ) {
        return planService.getPendingSubscribers(id, email);
    }

    // ── Read: plan members ─────────────────────────────────────────────────

    @PreAuthorize("isAuthenticated()")
    @GetMapping(value = "/{id}/members", produces = "application/json")
    @Operation(summary = "List the accepted members of a plan")
    @ApiResponse(responseCode = "404", description = "Plan not found", content = @Content)
    List<PlanSubscriberDTO> getPlanMembers(@PathVariable Long id) {
        return planService.getPlanMembers(id);
    }

    // ── Update ───────────────────────────────────────────────────────────────

    @PreAuthorize("isAuthenticated()")
    @PatchMapping(value = "/{id}", produces = "application/json")
    @Operation(summary = "Update a plan (creator only)")
    @ApiResponse(responseCode = "403", description = "Not the creator", content = @Content)
    @ApiResponse(responseCode = "404", description = "Plan not found", content = @Content)
    ResponseEntity<PlanDetailDTO> updatePlan(
            @PathVariable Long id,
            @Valid @RequestBody PlanUpdateDTO data,
            @AuthenticationPrincipal(expression = "username") String email
    ) {
        return planService.updatePlan(id, data, email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.FORBIDDEN).build());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping(value = "/admin/{id}", produces = "application/json")
    @Operation(summary = "Update a plan (admin only)")
    @ApiResponse(responseCode = "403", description = "Not the creator", content = @Content)
    @ApiResponse(responseCode = "404", description = "Plan not found", content = @Content)
    ResponseEntity<PlanDetailDTO> updatePlan(
            @PathVariable Long id,
            @Valid @RequestBody PlanUpdateDTO data
    ) {
        return planService.updatePlanAsAdmin(id, data)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.FORBIDDEN).build());
    }

    @PreAuthorize("isAuthenticated()")
    @PatchMapping(value = "/{id_plan}/accept/{id_user}",
     produces = "application/json")
    @Operation(summary = "Creator accepts a pending subscriber")
    @ApiResponse(responseCode = "403", description = "Not the creator", content = @Content)
    @ApiResponse(responseCode = "404", description = "Plan not found", content = @Content)
    ResponseEntity<Void> acceptPendingSubscriber(
            @PathVariable Long id_plan,
            @PathVariable Long id_user,
            @AuthenticationPrincipal(expression = "username") String email
    ) {
        planService.acceptPendingSubscriber(id_plan, id_user, email);
        return ResponseEntity.ok().build();
    }
    
    @PreAuthorize("isAuthenticated()")
    @PatchMapping(value = "{id_plan}/reject/{id_user}",
     produces = "application/json")
    @Operation(summary = "Creator denies a pending subscriber")
    @ApiResponse(responseCode = "403", description = "Not the creator", content = @Content)
    @ApiResponse(responseCode = "404", description = "Plan not found", content = @Content)
    ResponseEntity<Void> denyPendingSubscriber(
            @PathVariable Long id_plan,
            @PathVariable Long id_user,
            @AuthenticationPrincipal(expression = "username") String email
    ) {
        planService.denyPendingSubscriber(id_plan, id_user, email);
        return ResponseEntity.ok().build();
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

    // ── Join ─────────────────────────────────────────────────────────────────

    @PreAuthorize("isAuthenticated()")
    @PostMapping(value = "/{id}/join", produces = "application/json")
    @Operation(summary = "Join a plan")
    @ApiResponse(responseCode = "409", description = "Already joined or plan is full", content = @Content)
    ResponseEntity<Object> join(
            @PathVariable Long id,
            @AuthenticationPrincipal(expression = "username") String email
    ) {
        return switch (planService.subscribe(id, email)) {
            case OK             -> ResponseEntity.ok().build();
            case NOT_FOUND      -> ResponseEntity.status(HttpStatus.NOT_FOUND).body("Plan not found.");
            case FULL           -> ResponseEntity.status(HttpStatus.CONFLICT).body("This plan has already reached its participant limit.");
            case ALREADY_JOINED -> ResponseEntity.status(HttpStatus.CONFLICT).body("You have already joined this plan or have a pending join request.");
        };
    }

    // ── Leave ────────────────────────────────────────────────────────────────

    @PreAuthorize("isAuthenticated()")
    @DeleteMapping(value = "/{id}/leave", produces = "application/json")
    @Operation(summary = "Leave a plan")
    @ApiResponse(responseCode = "409", description = "Not a member of this plan", content = @Content)
    ResponseEntity<Object> leave(
            @PathVariable Long id,
            @AuthenticationPrincipal(expression = "username") String email
    ) {
        return switch (planService.unsubscribe(id, email)) {
            case OK             -> ResponseEntity.ok().build();
            case NOT_FOUND      -> ResponseEntity.status(HttpStatus.NOT_FOUND).body("Plan not found.");
            case NOT_SUBSCRIBED -> ResponseEntity.status(HttpStatus.CONFLICT).body("You have not joined this plan.");
        };
    }

    @PreAuthorize("permitAll()")
    @GetMapping(value = "/filter", produces = "application/json")
    @Operation(summary = "Filter plans by categories, date, location, proximity and visibility")
    List<PlanSummaryDTO> filterPlans(
            @RequestParam(name = "interests", required = false) List<Interest> interests,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateFrom,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateTo,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng,
            @RequestParam(required = false) Double radius,
            @RequestParam(required = false) PlanVisibility visibility
    ) {
        return planService.getFilteredPlans(interests, dateFrom, dateTo, location, lat, lng, radius, visibility);
    }
}