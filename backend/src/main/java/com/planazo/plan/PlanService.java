package com.planazo.plan;

import com.planazo.plan.dto.PlanCreateDTO;
import com.planazo.plan.dto.PlanDetailDTO;
import com.planazo.plan.dto.PlanSummaryDTO;
import com.planazo.plan.dto.PlanUpdateDTO;
import com.planazo.user.User;
import com.planazo.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.planazo.common.constants.Interest;
import java.time.LocalDateTime;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class PlanService {

    private final PlanRepository planRepository;
    private final UserRepository userRepository;

    @Autowired
    PlanService(PlanRepository planRepository, UserRepository userRepository) {
        this.planRepository = planRepository;
        this.userRepository = userRepository;
    }

    // ── Create ───────────────────────────────────────────────────────────────

    public PlanDetailDTO createPlan(PlanCreateDTO data, String creatorEmail) {
        User creator = userRepository.findByEmail(creatorEmail)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        Plan plan = new Plan(
                data.title(),
                data.description(),
                data.dateTime(),
                data.durationMinutes(),
                data.visibility(),
                data.maxSubscribers(),
                data.minAge(),
                data.maxAge(),
                data.interest(),
                data.travelType(),
                data.location(),
                data.latitude(),
                data.longitude(),
                data.images(),
                creator
        );

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
                .map(this::toSummaryDTO)
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
        if (data.title() != null)           plan.setTitle(data.title());
        if (data.description() != null)     plan.setDescription(data.description());
        if (data.dateTime() != null)        plan.setDateTime(data.dateTime());
        if (data.durationMinutes() != null) plan.setDurationMinutes(data.durationMinutes());
        if (data.visibility() != null)      plan.setVisibility(data.visibility());
        if (data.maxSubscribers() != null)  plan.setMaxSubscribers(data.maxSubscribers());
        if (data.minAge() != null)          plan.setMinAge(data.minAge());
        if (data.maxAge() != null)          plan.setMaxAge(data.maxAge());
        if (data.interest() != null)        plan.setInterest(data.interest());
        if (data.travelType() != null)      plan.setTravelType(data.travelType());
        if (data.location() != null)        plan.setLocation(data.location());
        if (data.latitude() != null)        plan.setLatitude(data.latitude());
        if (data.longitude() != null)       plan.setLongitude(data.longitude());
        if (data.images() != null)          plan.setImages(data.images());
        return planRepository.save(plan);
    }

    // ── Subscribe / Unsubscribe ──────────────────────────────────────────────

    public enum JoinResult { OK, NOT_FOUND, FULL, ALREADY_JOINED, NOT_PUBLIC }

    public JoinResult subscribe(Long planId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        Optional<Plan> maybePlan = planRepository.findById(planId)
                .filter(Plan::isActive);

        if (maybePlan.isEmpty()) return JoinResult.NOT_FOUND;

        Plan plan = maybePlan.get();

        if (plan.getVisibility() != PlanVisibility.PUBLIC) return JoinResult.NOT_PUBLIC;
        if (plan.getSubscribers().contains(user))          return JoinResult.ALREADY_JOINED;
        if (plan.isFull())                                 return JoinResult.FULL;

        plan.getSubscribers().add(user);
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

        if (!plan.getSubscribers().remove(user)) return LeaveResult.NOT_SUBSCRIBED;

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
                plan.getInterest(),
                plan.getTravelType(),
                plan.getLocation(),
                plan.getLatitude(),
                plan.getLongitude(),
                List.copyOf(plan.getImages()),
                plan.getCreator().getId(),
                plan.getCreator().getName(),
                plan.getSubscribers().size(),
                plan.isFull()
        );
    }

    private PlanSummaryDTO toSummaryDTO(Plan plan) {
        return new PlanSummaryDTO(
                plan.getId(),
                plan.getTitle(),
                plan.getDateTime(),
                plan.getLocation(),
                plan.getLatitude(),
                plan.getLongitude(),
                plan.getInterest(),
                plan.getTravelType(),
                plan.getVisibility(),
                plan.getSubscribers().size(),
                plan.getMaxSubscribers(),
                plan.getMinAge(),
                plan.getCreator().getName(),
                plan.getCreator().getId(),
                List.copyOf(plan.getImages())
        );
    }

    @Transactional(readOnly = true)
    public List<PlanSummaryDTO> getFilteredPlans(
            Interest interest,
            LocalDateTime dateFrom,
            LocalDateTime dateTo,
            String location
    ) {
        var spec = PlanSpecification.withFilters(
                interest, dateFrom, dateTo, location, null, null, null, null
        );
        return planRepository.findAll(spec)
                .stream()
                .map(this::toSummaryDTO)
                .toList();
    }
}