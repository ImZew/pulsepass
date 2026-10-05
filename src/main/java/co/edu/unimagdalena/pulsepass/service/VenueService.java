package co.edu.unimagdalena.pulsepass.service;

import java.util.List;

import co.edu.unimagdalena.pulsepass.dto.response.VenueResponse;

public interface VenueService {
    VenueResponse findByCode(String code);
    List<VenueResponse> findActiveVenues();
}