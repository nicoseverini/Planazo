package com.planazo.tourist_place;

import com.planazo.common.exception.InvalidAgeRangeException;
import com.planazo.common.exception.InvalidBudgetException;
import com.planazo.common.exception.InvalidOpeningHoursException;
import com.planazo.tourist_place.dto.OpeningHoursDTO;
import com.planazo.tourist_place.dto.TouristPlaceCreateDTO;
import com.planazo.tourist_place.dto.TouristPlaceDetailDTO;
import com.planazo.tourist_place.dto.TouristPlaceSummaryDTO;
import com.planazo.tourist_place.dto.TouristPlaceUpdateDTO;
import com.planazo.user.User;
import com.planazo.user.UserRepository;
import com.planazo.user.email_service.EmailService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.server.ResponseStatusException;

import java.time.DayOfWeek;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.EnumSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
@Transactional
public class TouristPlaceService {

    private final TouristPlaceRepository touristPlaceRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final com.planazo.report.ReportRepository reportRepository;

    public TouristPlaceService(TouristPlaceRepository touristPlaceRepository, UserRepository userRepository, EmailService emailService, com.planazo.report.ReportRepository reportRepository) {
        this.touristPlaceRepository = touristPlaceRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.reportRepository = reportRepository;
    }

    public TouristPlaceDetailDTO createTouristPlace(TouristPlaceCreateDTO data, String creatorEmail) {
        Integer normalizedMin = normalizeAge(data.minAge());
        Integer normalizedMax = normalizeAge(data.maxAge());
        validateAgeRange(normalizedMin, normalizedMax);
        validateCost(data.cost());
        validateOpeningHours(data.openingHours());

        User creator = userRepository.findByEmail(creatorEmail)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        TouristPlace place = new TouristPlace(
                data.name().trim(),
                data.cost(),
                normalizedMin,
                normalizedMax,
                data.interests(),
                data.country().trim(),
                data.state() != null ? data.state().trim() : null,
                data.city().trim(),
                data.address().trim(),
                data.latitude(),
                data.longitude(),
                data.images()
        );
        String trimmedDesc = data.description() != null ? data.description().trim() : null;
        place.setDescription(trimmedDesc != null && !trimmedDesc.isBlank() ? trimmedDesc : null);
        place.setOpeningHours(toOpeningHoursEntities(data.openingHours()));
        place.setCreator(creator);
        return toDetailDTO(touristPlaceRepository.save(place));
    }

    @Transactional(readOnly = true)
    public List<TouristPlaceSummaryDTO> getAllTouristPlaces() {
        return touristPlaceRepository.findAllByOrderByNameAsc()
                .stream()
                .map(this::toSummaryDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public Optional<TouristPlaceDetailDTO> getTouristPlaceById(Long id) {
        return touristPlaceRepository.findById(id)
                .map(this::toDetailDTO);
    }

    @Transactional(readOnly = true)
    public List<TouristPlaceSummaryDTO> getMyTouristPlaces(String creatorEmail) {
        User creator = userRepository.findByEmail(creatorEmail)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        return touristPlaceRepository.findAllByCreatorIdOrderByNameAsc(creator.getId())
                .stream()
                .map(this::toSummaryDTO)
                .toList();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(readOnly = true)
    public List<TouristPlaceSummaryDTO> getTouristPlacesByUserId(Long userId) {
        return touristPlaceRepository.findAllByCreatorId(userId)
                .stream()
                .map(this::toSummaryDTO)
                .toList();
    }

    public Optional<TouristPlaceDetailDTO> updateTouristPlace(Long id, TouristPlaceUpdateDTO data, String callerEmail) {
        User caller = userRepository.findByEmail(callerEmail)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        return touristPlaceRepository.findById(id)
                .filter(place -> canModify(place, caller))
                .map(place -> toDetailDTO(saveUpdatedTouristPlace(place, data)));
    }

    public Optional<Boolean> deleteTouristPlace(Long id, String callerEmail) {
        User caller = userRepository.findByEmail(callerEmail)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        return touristPlaceRepository.findById(id)
                .filter(place -> canModify(place, caller))
                .map(place -> {
                    touristPlaceRepository.delete(place);
                    return Boolean.TRUE;
                });
    }

    public boolean adminDeleteTouristPlace(Long id, String reason) {
        return touristPlaceRepository.findById(id).map(place -> {
            String creatorEmail = place.getCreator() != null ? place.getCreator().getEmail() : null;
            String placeName = place.getName();
            reportRepository.deleteByTouristPlaceId(id);
            touristPlaceRepository.delete(place);
            if (creatorEmail != null && reason != null && !reason.isEmpty()) {
                emailService.sendTouristPlaceDeletedEmail(creatorEmail, placeName, reason);
            }
            return true;
        }).orElse(false);
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private TouristPlace saveUpdatedTouristPlace(TouristPlace place, TouristPlaceUpdateDTO data) {
        if (data.name() != null) {
            if (data.name().isBlank())
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Name cannot be blank.");
            place.setName(data.name().trim());
        }

        if (data.cost() != null) {
            validateCost(data.cost());
            place.setCost(data.cost());
        }

        Integer incomingMin = data.minAge() != null ? normalizeAge(data.minAge()) : null;
        Integer incomingMax = data.maxAge() != null ? normalizeAge(data.maxAge()) : null;
        Integer effectiveMin = data.minAge() != null ? incomingMin : place.getMinAge();
        Integer effectiveMax = data.maxAge() != null ? incomingMax : place.getMaxAge();
        validateAgeRange(effectiveMin, effectiveMax);

        if (data.minAge() != null) place.setMinAge(incomingMin);
        if (data.maxAge() != null) place.setMaxAge(incomingMax);

        if (data.interests() != null) {
            place.setInterests(new ArrayList<>(data.interests()));
        }

        boolean hasNewLocationParts = data.country() != null || data.city() != null || data.address() != null;
        if (hasNewLocationParts) {
            String newCountry = data.country() != null ? data.country().trim() : place.getCountry();
            String newState   = data.state()   != null ? data.state().trim()   : place.getState();
            String newCity    = data.city()    != null ? data.city().trim()    : place.getCity();
            String newAddress = data.address() != null ? data.address().trim() : place.getAddress();
            if (newCountry == null || newCountry.isBlank())
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Country is required.");
            if (newCity == null || newCity.isBlank())
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "City is required.");
            if (newAddress == null || newAddress.isBlank())
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Address is required.");
            place.setLocationParts(newCountry, newState, newCity, newAddress);
        }

        if (data.latitude()  != null) place.setLatitude(data.latitude());
        if (data.longitude() != null) place.setLongitude(data.longitude());
        if (data.images()    != null) place.setImages(data.images());

        if (data.description() != null) {
            String trimmed = data.description().trim();
            place.setDescription(trimmed.isBlank() ? null : trimmed);
        }

        if (data.openingHours() != null) {
            validateOpeningHours(data.openingHours());
            place.setOpeningHours(toOpeningHoursEntities(data.openingHours()));
        }

        return touristPlaceRepository.save(place);
    }

    private TouristPlaceDetailDTO toDetailDTO(TouristPlace place) {
        return new TouristPlaceDetailDTO(
                place.getId(),
                place.getName(),
                place.getCost(),
                place.getMinAge(),
                place.getMaxAge(),
                List.copyOf(place.getInterests()),
                place.getCountry(),
                place.getState(),
                place.getCity(),
                place.getAddress(),
                place.getLocation(),
                place.getLatitude(),
                place.getLongitude(),
                List.copyOf(place.getImages()),
                place.getDescription(),
                place.getCreator() != null ? place.getCreator().getId() : null,
                toOpeningHoursDTO(place.getOpeningHours())
        );
    }

    private TouristPlaceSummaryDTO toSummaryDTO(TouristPlace place) {
        return new TouristPlaceSummaryDTO(
                place.getId(),
                place.getName(),
                place.getCost(),
                List.copyOf(place.getInterests()),
                place.getCountry(),
                place.getState(),
                place.getCity(),
                place.getAddress(),
                place.getLocation(),
                place.getLatitude(),
                place.getLongitude(),
                place.getMinAge(),
                place.getMaxAge(),
                List.copyOf(place.getImages()),
                place.getCreator() != null ? place.getCreator().getId() : null,
                place.getCreatorName(),
                toOpeningHoursDTO(place.getOpeningHours())
        );
    }

    private void validateAgeRange(Integer minAge, Integer maxAge) {
        if (minAge != null && maxAge != null && minAge > maxAge) {
            throw new InvalidAgeRangeException();
        }
    }

    private void validateCost(Double cost) {
        if (cost == null) return;
        if (cost < 0 || cost > 9_999_999) throw new InvalidBudgetException("Cost must be between 0 and 9,999,999.");
    }

    private void validateOpeningHours(List<OpeningHoursDTO> hours) {
        if (hours == null || hours.isEmpty()) return;
        Set<DayOfWeek> seenDays = EnumSet.noneOf(DayOfWeek.class);
        for (OpeningHoursDTO slot : hours) {
            if (slot == null || slot.dayOfWeek() == null || slot.openTime() == null || slot.closeTime() == null) {
                throw new InvalidOpeningHoursException("Each open day requires a day, an opening time and a closing time.");
            }
            if (!slot.closeTime().isAfter(slot.openTime())) {
                throw new InvalidOpeningHoursException("Closing time must be later than opening time.");
            }
            if (!seenDays.add(slot.dayOfWeek())) {
                throw new InvalidOpeningHoursException("Each day can appear only once in the schedule.");
            }
        }
    }

    private List<OpeningHours> toOpeningHoursEntities(List<OpeningHoursDTO> hours) {
        if (hours == null) return new ArrayList<>();
        return hours.stream()
                .map(slot -> new OpeningHours(slot.dayOfWeek(), slot.openTime(), slot.closeTime()))
                .toList();
    }

    private List<OpeningHoursDTO> toOpeningHoursDTO(List<OpeningHours> hours) {
        return hours.stream()
                .sorted(Comparator.comparing(OpeningHours::getDayOfWeek))
                .map(slot -> new OpeningHoursDTO(slot.getDayOfWeek(), slot.getOpenTime(), slot.getCloseTime()))
                .toList();
    }

    private static Integer normalizeAge(Integer age) {
        return (age == null || age == 0) ? null : age;
    }

    private boolean canModify(TouristPlace place, User caller) {
        if ("ADMIN".equals(caller.getRole())) return true;
        return place.getCreator() != null && place.getCreator().getId().equals(caller.getId());
    }
}
