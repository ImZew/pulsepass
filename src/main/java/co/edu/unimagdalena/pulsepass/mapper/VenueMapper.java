package co.edu.unimagdalena.pulsepass.mapper;

import org.mapstruct.Mapper;

import co.edu.unimagdalena.pulsepass.domain.Venue;
import co.edu.unimagdalena.pulsepass.dto.response.VenueResponse;

@Mapper(componentModel = "spring")
public interface VenueMapper {
    VenueResponse toResponse(Venue venue);
}