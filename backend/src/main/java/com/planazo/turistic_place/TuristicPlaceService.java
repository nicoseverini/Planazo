package com.planazo.turistic_place;

import com.planazo.common.exception.InvalidAgeRangeException;
import com.planazo.common.exception.InvalidBudgetException;
import com.planazo.turistic_place.dto.TuristicPlaceCreateDTO;
import com.planazo.turistic_place.dto.TuristicPlaceDetailDTO;
import com.planazo.turistic_place.dto.TuristicPlaceSummaryDTO;
import com.planazo.turistic_place.dto.TuristicPlaceUpdateDTO;
import com.planazo.user.User;
import com.planazo.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class TuristicPlaceService {

    private final TuristicPlaceRepository turisticPlaceRepository;
    private final UserRepository userRepository;

    public TuristicPlaceService(TuristicPlaceRepository turisticPlaceRepository, UserRepository userRepository) {
        this.turisticPlaceRepository = turisticPlaceRepository;
        this.userRepository = userRepository;
    }

    public TuristicPlaceDetailDTO createTuristicPlace(TuristicPlaceCreateDTO data, String creatorEmail) {
        Integer normalizedMin = normalizeAge(data.minAge());
        Integer normalizedMax = normalizeAge(data.maxAge());
        validateAgeRange(normalizedMin, normalizedMax);
        validateCost(data.cost());

        User creator = userRepository.findByEmail(creatorEmail)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        TuristicPlace place = new TuristicPlace(
                data.name().trim(),
                data.cost(),
                normalizedMin,
                normalizedMax,
                data.interests(),
                data.country().trim(),
                data.city().trim(),
                data.address().trim(),
                data.latitude(),
                data.longitude(),
                data.images()
        );
        String trimmedDesc = data.description() != null ? data.description().trim() : null;
        place.setDescription(trimmedDesc != null && !trimmedDesc.isBlank() ? trimmedDesc : null);
        place.setCreator(creator);
        return toDetailDTO(turisticPlaceRepository.save(place));
    }

    @Transactional(readOnly = true)
    public List<TuristicPlaceSummaryDTO> getAllTuristicPlaces() {
        return turisticPlaceRepository.findAllByOrderByNameAsc()
                .stream()
                .map(this::toSummaryDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public Optional<TuristicPlaceDetailDTO> getTuristicPlaceById(Long id) {
        return turisticPlaceRepository.findById(id)
                .map(this::toDetailDTO);
    }

    @Transactional(readOnly = true)
    public List<TuristicPlaceSummaryDTO> getMyTuristicPlaces(String creatorEmail) {
        User creator = userRepository.findByEmail(creatorEmail)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        return turisticPlaceRepository.findAllByCreatorIdOrderByNameAsc(creator.getId())
                .stream()
                .map(this::toSummaryDTO)
                .toList();
    }

    public Optional<TuristicPlaceDetailDTO> updateTuristicPlace(Long id, TuristicPlaceUpdateDTO data, String callerEmail) {
        User caller = userRepository.findByEmail(callerEmail)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        return turisticPlaceRepository.findById(id)
                .filter(place -> canModify(place, caller))
                .map(place -> toDetailDTO(saveUpdatedTuristicPlace(place, data)));
    }

    public Optional<Boolean> deleteTuristicPlace(Long id, String callerEmail) {
        User caller = userRepository.findByEmail(callerEmail)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        return turisticPlaceRepository.findById(id)
                .filter(place -> canModify(place, caller))
                .map(place -> {
                    turisticPlaceRepository.delete(place);
                    return Boolean.TRUE;
                });
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private TuristicPlace saveUpdatedTuristicPlace(TuristicPlace place, TuristicPlaceUpdateDTO data) {
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
            String newCity    = data.city()    != null ? data.city().trim()    : place.getCity();
            String newAddress = data.address() != null ? data.address().trim() : place.getAddress();
            if (newCountry == null || newCountry.isBlank())
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Country is required.");
            if (newCity == null || newCity.isBlank())
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "City is required.");
            if (newAddress == null || newAddress.isBlank())
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Address is required.");
            place.setLocationParts(newCountry, newCity, newAddress);
        }

        if (data.latitude()  != null) place.setLatitude(data.latitude());
        if (data.longitude() != null) place.setLongitude(data.longitude());
        if (data.images()    != null) place.setImages(data.images());

        if (data.description() != null) {
            String trimmed = data.description().trim();
            place.setDescription(trimmed.isBlank() ? null : trimmed);
        }

        return turisticPlaceRepository.save(place);
    }

    private TuristicPlaceDetailDTO toDetailDTO(TuristicPlace place) {
        return new TuristicPlaceDetailDTO(
                place.getId(),
                place.getName(),
                place.getCost(),
                place.getMinAge(),
                place.getMaxAge(),
                List.copyOf(place.getInterests()),
                place.getCountry(),
                place.getCity(),
                place.getAddress(),
                place.getLocation(),
                place.getLatitude(),
                place.getLongitude(),
                List.copyOf(place.getImages()),
                place.getDescription(),
                place.getCreator() != null ? place.getCreator().getId() : null
        );
    }

    private TuristicPlaceSummaryDTO toSummaryDTO(TuristicPlace place) {
        return new TuristicPlaceSummaryDTO(
                place.getId(),
                place.getName(),
                place.getCost(),
                List.copyOf(place.getInterests()),
                place.getCountry(),
                place.getCity(),
                place.getAddress(),
                place.getLocation(),
                place.getLatitude(),
                place.getLongitude(),
                place.getMinAge(),
                place.getMaxAge(),
                List.copyOf(place.getImages()),
                place.getCreator() != null ? place.getCreator().getId() : null
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

    private static Integer normalizeAge(Integer age) {
        return (age == null || age == 0) ? null : age;
    }

    private boolean canModify(TuristicPlace place, User caller) {
        if ("ADMIN".equals(caller.getRole())) return true;
        return place.getCreator() != null && place.getCreator().getId().equals(caller.getId());
    }
}
