package co.edu.unimagdalena.pulsepass.dto.response;

import java.time.LocalDateTime;

import co.edu.unimagdalena.pulsepass.domain.EventStatus;

public record EventSummaryResponse(
    String eventCode,
    String name,
    EventStatus status,
    LocalDateTime eventDate,
    String venueName
) {}