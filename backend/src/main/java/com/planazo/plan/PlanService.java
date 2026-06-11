package com.planazo.plan;

import com.planazo.common.exception.InvalidAgeRangeException;
import com.planazo.plan.dto.PlanCreateDTO;
import com.planazo.plan.dto.PlanDetailDTO;
import com.planazo.plan.dto.PendingSubscriberDTO;
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
import com.planazo.common.constants.Interest;
import java.time.LocalDateTime;

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

    @Autowired
    PlanService(PlanRepository planRepository, UserRepository userRepository, EmailService emailService) {
        this.planRepository = planRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    // ── Create ───────────────────────────────────────────────────────────────

    public PlanDetailDTO createPlan(PlanCreateDTO data, String creatorEmail) {
        Integer normalizedMin = normalizeAge(data.minAge());
        Integer normalizedMax = normalizeAge(data.maxAge());
        validateAgeRange(normalizedMin, normalizedMax);

        User creator = userRepository.findByEmail(creatorEmail)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        Plan plan = new Plan(
                data.title(),
                data.description(),
                data.dateTime(),
                data.durationMinutes(),
                data.visibility(),
                data.maxSubscribers(),
                normalizedMin,
                normalizedMax,
                data.interests(),
                data.travelType(),
                data.location(),
                data.latitude(),
                data.longitude(),
                data.images(),
                creator
        );

        PlanDetailDTO planDetail = toDetailDTO(planRepository.save(plan));

        // auto-subscribe creator 
        Boolean isPublic = plan.getVisibility() == PlanVisibility.PUBLIC;
        plan.addSubscriber(creator, isPublic ? null : Boolean.TRUE);
        planRepository.save(plan);
        return planDetail;
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
        Plan plan = planRepository.findById(planId)
            .filter(Plan::isActive)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Plan not found"));

        if (!plan.getCreator().getUsername().equals(requesterEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not the creator");
        }

        return plan.getSubscribers().stream()
            .filter(subscription -> Boolean.FALSE.equals(subscription.getAccepted()))
            .map(subscription -> new PendingSubscriberDTO(
                subscription.getUser().getId(),
                subscription.getUser().getName(),
                subscription.getUser().getLastname()
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
        return planRepository.findById(id)
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
        Plan plan = planRepository.findById(planId)
                .filter(Plan::isActive)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Plan not found"));

        if (!plan.getCreator().getUsername().equals(requesterEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not the creator");
        }

        boolean updated = plan.getSubscribers().stream()
                .filter(subscription -> subscription.matchesUserId(userId))
                .findFirst()
                .map(subscription -> {
                    subscription.setAccepted(Boolean.TRUE);
                    return true;
                })
                .orElse(false);

        if (updated) {
            planRepository.save(plan);
            emailService.sendAcceptedToPlanEmail(
                plan.getSubscribers().stream()
                    .filter(subscription -> subscription.matchesUserId(userId))
                    .findFirst()
                    .map(subscription -> subscription.getUser().getEmail())
                    .orElseThrow(() -> new IllegalStateException("User email not found")),
                plan.getTitle()
            );
            return;
        } else {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Subscriber not found");
        }
    }
    public void denyPendingSubscriber(Long planId, Long userId, String requesterEmail) {
        Plan plan = planRepository.findById(planId)
                .filter(Plan::isActive)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Plan not found"));

        if (!plan.getCreator().getUsername().equals(requesterEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not the creator");
        }
        String userEmail = plan.getSubscribers().stream()
            .filter(subscription -> subscription.matchesUserId(userId) && Boolean.FALSE.equals(subscription.getAccepted()))
            .findFirst()
            .map(subscription -> subscription.getUser().getEmail())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Subscriber not found"));

        boolean removed = plan.getSubscribers().removeIf(subscription -> subscription.matchesUserId(userId) && Boolean.FALSE.equals(subscription.getAccepted()));

        if (removed) {
            planRepository.save(plan);
            emailService.sendRejectedFromPlanEmail(
                userEmail,
                plan.getTitle()
            );
            return;
        } else {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Subscriber not found");
        }
    }

    // ── Delete (soft) ────────────────────────────────────────────────────────

    public Optional<Long> deletePlan(Long id, String requesterEmail) {
        return planRepository.findById(id)
                .filter(Plan::isActive)
                .filter(plan -> plan.getCreator().getUsername().equals(requesterEmail))
                .map(plan -> {
                    plan.setActive(false);
                    planRepository.save(plan);
                    return plan.getId();
                });
    }

    // ── Admin hard delete ────────────────────────────────────────────────────

    public boolean adminDeletePlan(Long id) {
        if (!planRepository.existsById(id)) return false;
        planRepository.deleteById(id);
        return true;
    }

    private Plan saveUpdatedPlan(Plan plan, PlanUpdateDTO data) {
        // Normalize incoming values (0 → null means "clear restriction")
        Integer incomingMin = data.minAge() != null ? normalizeAge(data.minAge()) : null;
        Integer incomingMax = data.maxAge() != null ? normalizeAge(data.maxAge()) : null;
        Integer effectiveMin = data.minAge() != null ? incomingMin : plan.getMinAge();
        Integer effectiveMax = data.maxAge() != null ? incomingMax : plan.getMaxAge();
        validateAgeRange(effectiveMin, effectiveMax);

        if (data.title() != null)           plan.setTitle(data.title());
        if (data.description() != null)     plan.setDescription(data.description());
        if (data.dateTime() != null)        plan.setDateTime(data.dateTime());
        if (data.durationMinutes() != null) plan.setDurationMinutes(data.durationMinutes());
        if (data.visibility() != null)      plan.setVisibility(data.visibility());
        if (data.maxSubscribers() != null)  plan.setMaxSubscribers(data.maxSubscribers());
        if (data.minAge() != null)          plan.setMinAge(incomingMin);
        if (data.maxAge() != null)          plan.setMaxAge(incomingMax);
        if (data.interests() != null)       plan.setInterests(data.interests());
        if (data.travelType() != null)      plan.setTravelType(data.travelType());
        if (data.location() != null)        plan.setLocation(data.location());
        if (data.latitude() != null)        plan.setLatitude(data.latitude());
        if (data.longitude() != null)       plan.setLongitude(data.longitude());
        if (data.images() != null)          plan.setImages(data.images());
        return planRepository.save(plan);
    }

    private void validateAgeRange(Integer minAge, Integer maxAge) {
        // Both values are pre-normalized (0 already converted to null), so no 0-special-case needed
        if (minAge != null && maxAge != null && minAge > maxAge) {
            throw new InvalidAgeRangeException();
        }
    }

    // Converts 0 to null so that "no restriction" is always stored as NULL, not 0
    private static Integer normalizeAge(Integer age) {
        return (age == null || age == 0) ? null : age;
    }

    // ── Subscribe / Unsubscribe ──────────────────────────────────────────────

    public enum JoinResult { OK, NOT_FOUND, FULL, ALREADY_JOINED }

    public JoinResult subscribe(Long planId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        Optional<Plan> maybePlan = planRepository.findById(planId)
                .filter(Plan::isActive);

        if (maybePlan.isEmpty()) return JoinResult.NOT_FOUND;

        Plan plan = maybePlan.get();

        if (plan.hasSubscriber(user.getId())) return JoinResult.ALREADY_JOINED;
        if (plan.isFull()) return JoinResult.FULL;

        Boolean accepted = plan.getVisibility() == PlanVisibility.PUBLIC ? null : Boolean.FALSE;
        plan.addSubscriber(user, accepted);
        planRepository.save(plan);
        return JoinResult.OK;
    }

    public enum LeaveResult { OK, NOT_FOUND, NOT_SUBSCRIBED }

    public LeaveResult unsubscribe(Long planId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        Optional<Plan> maybePlan = planRepository.findById(planId)
                .filter(Plan::isActive);

        if (maybePlan.isEmpty()) return LeaveResult.NOT_FOUND;

        Plan plan = maybePlan.get();

        if (!plan.removeSubscriber(user.getId())) return LeaveResult.NOT_SUBSCRIBED;

        planRepository.save(plan);
        return LeaveResult.OK;
    }

    // ── Mapping helpers ──────────────────────────────────────────────────────

    private PlanDetailDTO toDetailDTO(Plan plan) {
        return new PlanDetailDTO(
                plan.getId(),
                plan.getTitle(),
                plan.getDescription(),
                plan.getDateTime(),
                plan.getDurationMinutes(),
                plan.getVisibility(),
                plan.getMaxSubscribers(),
                plan.getMinAge(),
                plan.getMaxAge(),
                List.copyOf(plan.getInterests()),
                plan.getTravelType(),
                plan.getLocation(),
                plan.getLatitude(),
                plan.getLongitude(),
                List.copyOf(plan.getImages()),
                plan.getCreator().getId(),
                plan.getCreator().getName(),
                plan.getSubscriberCount(),
                plan.isFull()
        );
    }

    private PlanSummaryDTO toSummaryDTO(Plan plan) {
        return toSummaryDTO(plan, null);
    }

    private PlanSummaryDTO toSummaryDTO(Plan plan, Boolean accepted) {
        return new PlanSummaryDTO(
                plan.getId(),
                plan.getTitle(),
                plan.getDateTime(),
                plan.getLocation(),
                plan.getLatitude(),
                plan.getLongitude(),
                List.copyOf(plan.getInterests()),
                plan.getTravelType(),
                plan.getVisibility(),
                plan.getSubscriberCount(),
                plan.getMaxSubscribers(),
                plan.getMinAge(),
                plan.getCreator().getName(),
                plan.getCreator().getId(),
                List.copyOf(plan.getImages()),
                accepted
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
            Interest interest,
            LocalDateTime dateFrom,
            LocalDateTime dateTo,
            String location,
            Double userLat,
            Double userLng,
            Double radiusKm
    ) {
        var spec = PlanSpecification.withFilters(
                interest, dateFrom, dateTo, location, null, userLat, userLng, radiusKm
        );
        return planRepository.findAll(spec)
                .stream()
                .map(this::toSummaryDTO)
                .toList();
    }
}