package co.edu.unimagdalena.pulsepass.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import co.edu.unimagdalena.pulsepass.domain.Event;
import co.edu.unimagdalena.pulsepass.dto.response.EventResponse;
import co.edu.unimagdalena.pulsepass.dto.response.EventSummaryResponse;

@Mapper(componentModel = "spring", uses = {ArtistMapper.class})
public interface EventMapper {
    
    @Mapping(target = "venueCode", source = "venue.code")
    @Mapping(target = "venueName", source = "venue.name")
    EventResponse toResponse(Event event);

    @Mapping(target = "venueName", source = "venue.name")
    EventSummaryResponse toSummary(Event event);
}