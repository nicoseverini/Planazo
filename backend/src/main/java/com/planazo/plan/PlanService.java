package com.planazo.plan;

import com.planazo.common.exception.InvalidAgeRangeException;
import com.planazo.common.exception.InvalidBudgetException;
import com.planazo.common.exception.InvalidDateRangeException;
import com.planazo.common.exception.InvalidMaxSubscribersException;
import com.planazo.common.exception.InvalidTimezoneException;
import com.planazo.common.exception.PlanExpiredException;
import com.planazo.plan.dto.PlanCreateDTO;
import com.planazo.plan.dto.PlanDetailDTO;
import com.planazo.plan.dto.PendingSubscriberDTO;
import com.planazo.plan.dto.PlanSubscriberDTO;
import com.planazo.plan.dto.PlanSummaryDTO;
import com.planazo.plan.dto.PlanUpdateDTO;
import com.planazo.user.User;
import com.planazo.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.access.prepost.PreAuthorize;
import com.planazo.common.constants.Interest;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;

import java.util.List;
import java.util.Optional;
import org.springframework.web.server.ResponseStatusException;
import com.planazo.user.email_service.EmailService;

@Service
@Transactional
public class PlanService {

    private final PlanRepository planRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final com.planazo.report.ReportRepository reportRepository;

    @Autowired
    PlanService(PlanRepository planRepository, UserRepository userRepository, EmailService emailService, com.planazo.report.ReportRepository reportRepository) {
        this.planRepository = planRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.reportRepository = reportRepository;
    }

    // ── Create ───────────────────────────────────────────────────────────────

    public PlanDetailDTO createPlan(PlanCreateDTO data, String creatorEmail) {
        LocalDateTime startUtc = data.startDateTime().withOffsetSameInstant(ZoneOffset.UTC).toLocalDateTime();
        LocalDateTime endUtc = data.endDateTime().withOffsetSameInstant(ZoneOffset.UTC).toLocalDateTime();
        validateDateRange(startUtc, endUtc);
        validateTimezone(data.timezone());

        Integer normalizedMin = normalizeAge(data.minAge());
        Integer normalizedMax = normalizeAge(data.maxAge());
        validateAgeRange(normalizedMin, normalizedMax);

        Double normalizedBudget = normalizeBudget(data.budget());
        validateBudget(normalizedBudget);

        validateMaxSubscribers(data.maxSubscribers());

        User creator = userRepository.findByEmail(creatorEmail)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        Plan plan = new Plan(
                data.title(),
                data.description(),
                startUtc,
                endUtc,
                data.visibility(),
                data.maxSubscribers(),
                normalizedMin,
                normalizedMax,
                data.interests(),
                data.country().trim(),
                data.city().trim(),
                data.address().trim(),
                data.latitude(),
                data.longitude(),
                data.images(),
                creator,
                data.timezone()
        );
        plan.setBudget(normalizedBudget);

        planRepository.save(plan);

        // auto-subscribe creator — always counts
        Boolean accepted = plan.getVisibility() == PlanVisibility.PUBLIC ? null : Boolean.TRUE;
        plan.addSubscriber(creator, accepted);
        plan.incrementSubscriberCount();

        return toDetailDTO(planRepository.save(plan));
    }

    // ── Read ─────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Optional<PlanDetailDTO> getPlanById(Long id) {
        return planRepository.findById(id)
                .filter(Plan::isActive)
                .map(this::toDetailDTO);
    }

    @Transactional(readOnly = true)
    public List<PlanSummaryDTO> getPublicPlans() {
        return planRepository.findByVisibilityAndActiveTrue(PlanVisibility.PUBLIC)
                .stream()
                .map(this::toSummaryDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<PlanSummaryDTO> getAllPlans(Pageable pageable) {
        return planRepository.findByActiveTrue(pageable)
                .map(this::toSummaryDTO);
    }

    @Transactional(readOnly = true)
    public List<PlanSummaryDTO> getAllPlans() {
        return planRepository.findByActiveTrue(Pageable.unpaged())
                .stream()
                .map(this::toSummaryDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PlanSummaryDTO> getMyPlans(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        return planRepository.findByCreatorIdAndActiveTrue(user.getId())
                .stream()
                .map(this::toSummaryDTO)
                .toList();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(readOnly = true)
    public List<PlanSummaryDTO> getPlansByUserId(Long userId) {
        return planRepository.findAllByCreatorId(userId)
                .stream()
                .map(this::toSummaryDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PlanSummaryDTO> getSubscribedPlans(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new EntityNotFoundException("User not found"));
        return planRepository.findBySubscriberId(user.getId())
            .stream()
            .map(plan -> toSummaryDTO(plan, getAcceptedForUser(plan, user.getId())))
            .toList();
    }

    @Transactional(readOnly = true)
    public List<PlanSummaryDTO> getSubscribedPlansButNotMine(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new EntityNotFoundException("User not found"));
        return planRepository.findBySubscriberIdAndNotCreatorId(user.getId())
            .stream()
            .map(plan -> toSummaryDTO(plan, getAcceptedForUser(plan, user.getId())))
            .toList();
    }

    @Transactional(readOnly = true)
    public List<PendingSubscriberDTO> getPendingSubscribers(Long planId, String requesterEmail) {
        Plan plan = requireActivePlan(planId);

        if (!plan.getCreator().getUsername().equals(requesterEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not the creator");
        }

        return plan.getSubscribers().stream()
            .filter(subscription -> Boolean.FALSE.equals(subscription.getAccepted()))
            .map(subscription -> new PendingSubscriberDTO(
                subscription.getUser().getId(),
                subscription.getUser().getName(),
                subscription.getUser().getLastname(),
                subscription.getUser().getPhoto()
            ))
            .toList();
    }

    @Transactional(readOnly = true)
    public List<PlanSubscriberDTO> getPlanMembers(Long planId) {
        Plan plan = requireActivePlan(planId);

        return plan.getSubscribers().stream()
            .filter(PlanSubscriber::countsAsSubscriber)
            .map(subscription -> new PlanSubscriberDTO(
                subscription.getUser().getId(),
                subscription.getUser().getName(),
                subscription.getUser().getLastname(),
                subscription.getUser().getPhoto(),
                subscription.getAccepted()
            ))
            .toList();
    }

    @Transactional(readOnly = true)
    public List<PlanSummaryDTO> getNearbyPublicPlans(double lat, double lng, double radiusKm) {
        return planRepository.findNearbyPublicActivePlans(lat, lng, radiusKm)
                .stream()
                .map(this::toSummaryDTO)
                .toList();
    }

    // ── Update ───────────────────────────────────────────────────────────────

    public Optional<PlanDetailDTO> updatePlan(Long id, PlanUpdateDTO data, String requesterEmail) {
        Optional<Plan> planOpt = planRepository.findById(id);
        planOpt.ifPresent(plan -> {
            if (!plan.isActive()) throwIfExpired(plan);
        });
        return planOpt
                .filter(Plan::isActive)
                .filter(plan -> plan.getCreator().getUsername().equals(requesterEmail))
                .map(plan -> toDetailDTO(saveUpdatedPlan(plan, data)));
    }

    public Optional<PlanDetailDTO> updatePlanAsAdmin(Long id, PlanUpdateDTO data) {
        return planRepository.findById(id)
                .filter(Plan::isActive)
                .map(plan -> toDetailDTO(saveUpdatedPlan(plan, data)));
    }

    public void acceptPendingSubscriber(Long planId, Long userId, String requesterEmail) {
        Plan plan = requireActivePlan(planId);

        if (!plan.getCreator().getUsername().equals(requesterEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not the creator");
        }

        if (plan.isFull()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Plan is already full");
        }

        boolean updated = plan.getSubscribers().stream()
                .filter(subscription -> subscription.matchesUserId(userId))
                .findFirst()
                .map(subscription -> {
                    if (!Boolean.FALSE.equals(subscription.getAccepted())) return false;
                    subscription.setAccepted(Boolean.TRUE);
                    return true;
                })
                .orElse(false);

        if (!updated) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Pending subscriber not found");
        }

        plan.incrementSubscriberCount();
        planRepository.save(plan);

        emailService.sendAcceptedToPlanEmail(
            plan.getSubscribers().stream()
                .filter(subscription -> subscription.matchesUserId(userId))
                .findFirst()
                .map(subscription -> subscription.getUser().getEmail())
                .orElseThrow(() -> new IllegalStateException("User email not found")),
            plan.getTitle()
        );
    }

    public void denyPendingSubscriber(Long planId, Long userId, String requesterEmail) {
        Plan plan = requireActivePlan(planId);

        if (!plan.getCreator().getUsername().equals(requesterEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not the creator");
        }

        String userEmail = plan.getSubscribers().stream()
            .filter(subscription -> subscription.matchesUserId(userId) && Boolean.FALSE.equals(subscription.getAccepted()))
            .findFirst()
            .map(subscription -> subscription.getUser().getEmail())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pending subscriber not found"));

        boolean removed = plan.getSubscribers().removeIf(
            subscription -> subscription.matchesUserId(userId) && Boolean.FALSE.equals(subscription.getAccepted())
        );

        if (!removed) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Pending subscriber not found");
        }

        // Pending subscriber did not count → counter unchanged
        planRepository.save(plan);
        emailService.sendRejectedFromPlanEmail(userEmail, plan.getTitle());
    }

    // ── Remove member (organizer only) ─────────────────────────────────────

    public void removeMember(Long planId, Long userId, String requesterEmail) {
        Plan plan = requireActivePlan(planId);

        if (!plan.getCreator().getUsername().equals(requesterEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the organizer can remove members.");
        }

        if (plan.getCreator().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "The organizer cannot be removed from the activity.");
        }

        PlanSubscriber subscription = plan.getSubscribers().stream()
                .filter(s -> s.matchesUserId(userId))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "This member is no longer part of the activity."));

        boolean wasCounting = subscription.countsAsSubscriber();

        plan.removeSubscriber(userId);
        if (wasCounting) {
            plan.decrementSubscriberCount();
        }

        planRepository.save(plan);
        emailService.sendRemovedFromPlanEmail(subscription.getUser().getEmail(), plan.getTitle());
    }

    // ── Delete (permanent) ─────────────────────────────────────────────────────

    /**
     * Permanently deletes a plan owned by the requester together with every
     * resource that cannot logically outlive it. Runs inside the service-level
     * transaction, so the whole cleanup is atomic: if any step fails nothing is
     * committed and the system is left untouched.
     */
    public void deletePlan(Long id, String requesterEmail) {
        Plan plan = planRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Plan not found"));

        if (!plan.getCreator().getUsername().equals(requesterEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not allowed to delete this plan.");
        }

        purgePlan(plan);
    }

    // ── Admin hard delete ────────────────────────────────────────────────────

    public boolean adminDeletePlan(Long id, String reason) {
        return planRepository.findById(id).map(plan -> {
            String creatorEmail = plan.getCreator().getEmail();
            String planTitle = plan.getTitle();
            purgePlan(plan);
            if (reason != null && !reason.isEmpty()) {
                emailService.sendPlanDeletedEmail(creatorEmail, planTitle, reason);
            }
            return true;
        }).orElse(false);
    }

    /**
     * Single source of truth for physically removing a plan. Subscribers,
     * interests and images belong to the plan and are wiped by JPA
     * cascade/orphanRemoval (all live in the database — there are no external
     * files); reports point at the plan through an unowned FK, so they are
     * removed explicitly before the plan to avoid referential-integrity errors.
     */
    private void purgePlan(Plan plan) {
        reportRepository.deleteByPlanId(plan.getId());
        planRepository.delete(plan);
    }

    private Plan saveUpdatedPlan(Plan plan, PlanUpdateDTO data) {
        Integer incomingMin = data.minAge() != null ? normalizeAge(data.minAge()) : null;
        Integer incomingMax = data.maxAge() != null ? normalizeAge(data.maxAge()) : null;
        Integer effectiveMin = data.minAge() != null ? incomingMin : plan.getMinAge();
        Integer effectiveMax = data.maxAge() != null ? incomingMax : plan.getMaxAge();
        validateAgeRange(effectiveMin, effectiveMax);

        LocalDateTime incomingStartUtc = data.startDateTime() != null
                ? data.startDateTime().withOffsetSameInstant(ZoneOffset.UTC).toLocalDateTime() : null;
        LocalDateTime incomingEndUtc = data.endDateTime() != null
                ? data.endDateTime().withOffsetSameInstant(ZoneOffset.UTC).toLocalDateTime() : null;
        LocalDateTime effectiveStart = incomingStartUtc != null ? incomingStartUtc : plan.getStartDateTime();
        LocalDateTime effectiveEnd = incomingEndUtc != null ? incomingEndUtc : plan.getEndDateTime();
        if (incomingStartUtc != null || incomingEndUtc != null) {
            validateDateRange(effectiveStart, effectiveEnd);
        }

        if (data.budget() != null) {
            Double normalizedBudget = normalizeBudget(data.budget());
            validateBudget(normalizedBudget);
            plan.setBudget(normalizedBudget);
        }
        if (data.maxSubscribers() != null) {
            validateMaxSubscribers(data.maxSubscribers());
        }
        if (data.timezone() != null) {
            validateTimezone(data.timezone());
            plan.setTimezone(data.timezone());
        }
        if (data.title() != null)           plan.setTitle(data.title());
        if (data.description() != null)     plan.setDescription(data.description());
        if (incomingStartUtc != null)       plan.setStartDateTime(incomingStartUtc);
        if (incomingEndUtc != null)         plan.setEndDateTime(incomingEndUtc);
        if (data.visibility() != null)      plan.setVisibility(data.visibility());
        if (data.maxSubscribers() != null)  plan.setMaxSubscribers(data.maxSubscribers());
        if (data.minAge() != null)          plan.setMinAge(incomingMin);
        if (data.maxAge() != null)          plan.setMaxAge(incomingMax);
        if (data.interests() != null)       plan.setInterests(data.interests());

        boolean hasNewLocationParts = data.country() != null || data.city() != null || data.address() != null;
        if (hasNewLocationParts) {
            String newCountry = data.country() != null ? data.country().trim() : plan.getCountry();
            String newCity    = data.city()    != null ? data.city().trim()    : plan.getCity();
            String newAddress = data.address() != null ? data.address().trim() : plan.getAddress();
            if (newCountry == null || newCountry.isBlank())
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Country is required.");
            if (newCity == null || newCity.isBlank())
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "City is required.");
            if (newAddress == null || newAddress.isBlank())
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Address is required.");
            plan.setLocationParts(newCountry, newCity, newAddress);
        } else if (data.location() != null) {
            plan.setLocation(data.location());
        }

        if (data.latitude() != null)        plan.setLatitude(data.latitude());
        if (data.longitude() != null)       plan.setLongitude(data.longitude());
        if (data.images() != null)          plan.setImages(data.images());
        return planRepository.save(plan);
    }

    // ── Subscribe / Unsubscribe ──────────────────────────────────────────────

    public enum JoinResult { OK, NOT_FOUND, FULL, ALREADY_JOINED }

    public JoinResult subscribe(Long planId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        Plan plan = planRepository.findById(planId).orElse(null);
        if (plan == null) return JoinResult.NOT_FOUND;
        if (!plan.isActive()) {
            throwIfExpired(plan);
            return JoinResult.NOT_FOUND;
        }

        if (plan.hasSubscriber(user.getId())) return JoinResult.ALREADY_JOINED;
        if (plan.isFull()) return JoinResult.FULL;
        plan.checkAgeEligibility(user);

        boolean isPublic = plan.getVisibility() == PlanVisibility.PUBLIC;
        Boolean accepted = isPublic ? null : Boolean.FALSE;
        plan.addSubscriber(user, accepted);

        if (isPublic) {
            // Public: immediate subscription, counts right away
            plan.incrementSubscriberCount();
        }

        planRepository.save(plan);

        boolean isNotCreator = !user.getId().equals(plan.getCreator().getId());
        if (!isPublic) {
            emailService.sendRequestToPlanCreator(
                plan.getCreator().getEmail(),
                user.getName(),
                plan.getTitle()
            );
        } else if (isNotCreator) {
            emailService.sendParticipantJoinedEmail(
                plan.getCreator().getEmail(),
                user.getName(),
                plan.getTitle()
            );
        }

        return JoinResult.OK;
    }

    public enum LeaveResult { OK, NOT_FOUND, NOT_SUBSCRIBED }

    public LeaveResult unsubscribe(Long planId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        Plan plan = planRepository.findById(planId).orElse(null);
        if (plan == null) return LeaveResult.NOT_FOUND;
        if (!plan.isActive()) {
            throwIfExpired(plan);
            return LeaveResult.NOT_FOUND;
        }

        // Check whether the subscription was counting before removing it
        boolean wasCounting = plan.getSubscribers().stream()
                .filter(s -> s.matchesUserId(user.getId()))
                .findFirst()
                .map(PlanSubscriber::countsAsSubscriber)
                .orElse(false);

        if (!plan.removeSubscriber(user.getId())) return LeaveResult.NOT_SUBSCRIBED;

        boolean isNotCreator = !user.getId().equals(plan.getCreator().getId());

        if (wasCounting) {
            plan.decrementSubscriberCount();
        }

        planRepository.save(plan);

        if (wasCounting && isNotCreator) {
            emailService.sendParticipantLeftEmail(
                plan.getCreator().getEmail(),
                user.getName(),
                plan.getTitle()
            );
        }

        return LeaveResult.OK;
    }

    // ── Mapping helpers ──────────────────────────────────────────────────────

    private PlanDetailDTO toDetailDTO(Plan plan) {
        return new PlanDetailDTO(
                plan.getId(),
                plan.getTitle(),
                plan.getDescription(),
                plan.getStartDateTime().atOffset(ZoneOffset.UTC),
                plan.getEndDateTime().atOffset(ZoneOffset.UTC),
                plan.getDurationMinutes(),
                plan.getVisibility(),
                plan.getMaxSubscribers(),
                plan.getMinAge(),
                plan.getMaxAge(),
                List.copyOf(plan.getInterests()),
                plan.getLocation(),
                plan.getCountry(),
                plan.getCity(),
                plan.getAddress(),
                plan.getLatitude(),
                plan.getLongitude(),
                List.copyOf(plan.getImages()),
                plan.getCreator().getId(),
                plan.getCreator().getName(),
                plan.getSubscriberCount(),
                plan.isFull(),
                plan.getBudget(),
                plan.getTimezone()
        );
    }

    private PlanSummaryDTO toSummaryDTO(Plan plan) {
        return toSummaryDTO(plan, null);
    }

    private PlanSummaryDTO toSummaryDTO(Plan plan, Boolean accepted) {
        return new PlanSummaryDTO(
                plan.getId(),
                plan.getTitle(),
                plan.getStartDateTime().atOffset(ZoneOffset.UTC),
                plan.getLocation(),
                plan.getCountry(),
                plan.getCity(),
                plan.getAddress(),
                plan.getLatitude(),
                plan.getLongitude(),
                List.copyOf(plan.getInterests()),
                plan.getVisibility(),
                plan.getSubscriberCount(),
                plan.getMaxSubscribers(),
                plan.getMinAge(),
                plan.getCreator().getName(),
                plan.getCreator().getId(),
                List.copyOf(plan.getImages()),
                accepted,
                plan.getBudget(),
                plan.getTimezone()
        );
    }

    private Boolean getAcceptedForUser(Plan plan, Long userId) {
        return plan.getSubscribers().stream()
                .filter(subscription -> subscription.matchesUserId(userId))
                .findFirst()
                .map(PlanSubscriber::getAccepted)
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public List<PlanSummaryDTO> getFilteredPlans(
            List<Interest> interests,
            LocalDateTime dateFrom,
            LocalDateTime dateTo,
            String location,
            Double userLat,
            Double userLng,
            Double radiusKm,
            PlanVisibility visibility
    ) {
        var spec = PlanSpecification.withFilters(
                interests, dateFrom, dateTo, location, null, userLat, userLng, radiusKm, visibility
        );
        return planRepository.findAll(spec)
                .stream()
                .map(this::toSummaryDTO)
                .toList();
    }

    // ── Validation helpers ───────────────────────────────────────────────────

    private void validateDateRange(LocalDateTime start, LocalDateTime end) {
        if (start == null || end == null) return;
        if (!end.isAfter(start)) {
            throw new InvalidDateRangeException("end_date_time must be after start_date_time");
        }
    }

    private void validateAgeRange(Integer minAge, Integer maxAge) {
        if (minAge != null && maxAge != null && minAge > maxAge) {
            throw new InvalidAgeRangeException();
        }
    }

    private static Integer normalizeAge(Integer age) {
        return (age == null || age == 0) ? null : age;
    }

    private static Double normalizeBudget(Double budget) {
        return budget == null ? 0.0 : budget;
    }

    private static void validateMaxSubscribers(Integer maxSubscribers) {
        if (maxSubscribers != null && (maxSubscribers <= 0 || maxSubscribers > 99_999)) {
            throw new InvalidMaxSubscribersException();
        }
    }

    private static void validateBudget(Double budget) {
        if (budget < 0) {
            throw new InvalidBudgetException("Budget must be greater than or equal to 0.");
        }
        if (budget > 9_999_999) {
            throw new InvalidBudgetException("Budget cannot exceed 9,999,999.");
        }
    }

    // ── Expiry helpers ───────────────────────────────────────────────────────

    private Plan requireActivePlan(Long planId) {
        Plan plan = planRepository.findById(planId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Plan not found"));
        if (!plan.isActive()) {
            throwIfExpired(plan);
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Plan not found");
        }
        return plan;
    }

    private void throwIfExpired(Plan plan) {
        if (!plan.getEndDateTime().isAfter(LocalDateTime.now(ZoneOffset.UTC))) {
            throw new PlanExpiredException(plan.getTitle());
        }
    }

    private void validateTimezone(String timezone) {
        if (timezone == null || timezone.isBlank()) return;
        try {
            ZoneId.of(timezone);
        } catch (Exception e) {
            throw new InvalidTimezoneException(timezone);
        }
    }
}
