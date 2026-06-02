package com.planazo.turistic_place;

import com.planazo.turistic_place.dto.TuristicPlaceCreateDTO;
import com.planazo.turistic_place.dto.TuristicPlaceDetailDTO;
import com.planazo.turistic_place.dto.TuristicPlaceSummaryDTO;
import com.planazo.turistic_place.dto.TuristicPlaceUpdateDTO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class TuristicPlaceService {

    private final TuristicPlaceRepository turisticPlaceRepository;

    public TuristicPlaceService(TuristicPlaceRepository turisticPlaceRepository) {
        this.turisticPlaceRepository = turisticPlaceRepository;
    }

    public TuristicPlaceDetailDTO createTuristicPlace(TuristicPlaceCreateDTO data) {
        return toDetailDTO(turisticPlaceRepository.save(data.asTuristicPlace()));
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

    public Optional<TuristicPlaceDetailDTO> updateTuristicPlace(Long id, TuristicPlaceUpdateDTO data) {
        return turisticPlaceRepository.findById(id)
                .map(place -> toDetailDTO(saveUpdatedTuristicPlace(place, data)));
    }

    public boolean deleteTuristicPlace(Long id) {
        if (!turisticPlaceRepository.existsById(id)) {
            return false;
        }

        turisticPlaceRepository.deleteById(id);
        return true;
    }

    private TuristicPlace saveUpdatedTuristicPlace(TuristicPlace place, TuristicPlaceUpdateDTO data) {
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
                List.copyOf(place.getImages())
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
                List.copyOf(place.getImages())
        );
    }
}