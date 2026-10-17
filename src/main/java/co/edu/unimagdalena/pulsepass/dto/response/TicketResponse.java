package co.edu.unimagdalena.pulsepass.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import co.edu.unimagdalena.pulsepass.domain.TicketStatus;
import co.edu.unimagdalena.pulsepass.domain.TicketType;

public record TicketResponse(
    Long id,
    String ticketCode,
    TicketType type,
    BigDecimal price,
    TicketStatus status,
    LocalDateTime purchaseDate,
    String userEmail,
    String eventCode,
    String eventName
) {}