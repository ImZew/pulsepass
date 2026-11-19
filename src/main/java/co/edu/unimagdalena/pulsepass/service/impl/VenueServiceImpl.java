package co.edu.unimagdalena.pulsepass.service.impl;

import co.edu.unimagdalena.pulsepass.exception.ResourceNotFoundException;
import co.edu.unimagdalena.pulsepass.mapper.VenueMapper;
import co.edu.unimagdalena.pulsepass.repository.VenueRepository;
import co.edu.unimagdalena.pulsepass.service.VenueService;
import co.edu.unimagdalena.pulsepass.dto.response.VenueResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class VenueServiceImpl implements VenueService {

    private final VenueRepository venueRepository;
    private final VenueMapper venueMapper;

    public VenueServiceImpl(VenueRepository venueRepository, VenueMapper venueMapper) {
        this.venueRepository = venueRepository;
        this.venueMapper = venueMapper;
    }

    @Override
    public VenueResponse findByCode(String code) {
        return venueRepository.findByCode(code)
                .map(venueMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Venue not found with code: " + code));
    }

    @Override
    public List<VenueResponse> findActiveVenues() {
        return venueRepository.findByActiveTrueOrderByNameAsc()
                .stream()
                .map(venueMapper::toResponse)
                .toList();
    }
}