package co.edu.unimagdalena.pulsepass.dto.request;

import co.edu.unimagdalena.pulsepass.domain.TicketType;

public record PurchaseTicketRequest(
    String userEmail,
    String eventCode,
    TicketType type
) {}