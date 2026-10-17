package co.edu.unimagdalena.pulsepass.dto.request;

import java.time.LocalDateTime;

import co.edu.unimagdalena.pulsepass.domain.EventCategory;

public record CreateEventRequest(
    String eventCode,
    String name,
    String description,
    EventCategory category,
    LocalDateTime eventDate,
    Integer minimumAge,
    String venueCode
) {}