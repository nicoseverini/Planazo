package com.planazo.turistic_place;

import com.planazo.common.exception.InvalidAgeRangeException;
import com.planazo.turistic_place.dto.TuristicPlaceCreateDTO;
import com.planazo.turistic_place.dto.TuristicPlaceDetailDTO;
import com.planazo.turistic_place.dto.TuristicPlaceSummaryDTO;
import com.planazo.turistic_place.dto.TuristicPlaceUpdateDTO;
import com.planazo.user.User;
import com.planazo.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
        validateAgeRange(data.minAge(), data.maxAge());

        User creator = userRepository.findByEmail(creatorEmail)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        TuristicPlace place = data.asTuristicPlace();
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

    private void validateAgeRange(Integer minAge, Integer maxAge) {
        if (minAge != null && maxAge != null && maxAge != 0 && minAge >= maxAge) {
            throw new InvalidAgeRangeException();
        }
    }

    private boolean canModify(TuristicPlace place, User caller) {
        if ("ADMIN".equals(caller.getRole())) {
            return true;
        }
        return place.getCreator() != null && place.getCreator().getId().equals(caller.getId());
    }

    private TuristicPlace saveUpdatedTuristicPlace(TuristicPlace place, TuristicPlaceUpdateDTO data) {
        Integer effectiveMin = data.minAge() != null ? data.minAge() : place.getMinAge();
        Integer effectiveMax = data.maxAge() != null ? data.maxAge() : place.getMaxAge();
        validateAgeRange(effectiveMin, effectiveMax);

        if (data.name() != null) {
            place.setName(data.name());
        }
        if (data.cost() != null) {
            place.setCost(data.cost());
        }
        if (data.minAge() != null) {
            place.setMinAge(data.minAge());
        }
        if (data.maxAge() != null) {
            place.setMaxAge(data.maxAge());
        }
        if (data.interest() != null) {
            place.setInterest(data.interest());
        }
        if (data.location() != null) {
            place.setLocation(data.location());
        }
        if (data.latitude() != null) {
            place.setLatitude(data.latitude());
        }
        if (data.longitude() != null) {
            place.setLongitude(data.longitude());
        }
        if (data.images() != null) {
            place.setImages(data.images());
        }
        if (data.description() != null) {
            place.setDescription(data.description());
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
                place.getInterest(),
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
                place.getLocation(),
                place.getLatitude(),
                place.getLongitude(),
                place.getMinAge(),
                place.getMaxAge(),
                place.getInterest(),
                List.copyOf(place.getImages()),
                place.getCreator() != null ? place.getCreator().getId() : null
        );
    }
}