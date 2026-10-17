package co.edu.unimagdalena.pulsepass.dto.response;

import java.time.LocalDateTime;
import java.util.List;

import co.edu.unimagdalena.pulsepass.domain.EventCategory;
import co.edu.unimagdalena.pulsepass.domain.EventStatus;

public record EventResponse(
    Long id,
    String eventCode,
    String name,
    String description,
    EventCategory category,
    EventStatus status,
    LocalDateTime eventDate,
    Integer minimumAge,
    String venueCode,
    String venueName,
    List<ArtistResponse> artists
) {}