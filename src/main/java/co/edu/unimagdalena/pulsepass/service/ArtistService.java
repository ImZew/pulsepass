package co.edu.unimagdalena.pulsepass.service;

import java.util.List;

import co.edu.unimagdalena.pulsepass.dto.response.ArtistResponse;

public interface ArtistService {
    ArtistResponse findById(Long id);
    ArtistResponse findByStageName(String stageName);
    List<ArtistResponse> findActiveArtists();
}