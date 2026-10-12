package co.edu.unimagdalena.pulsepass.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import co.edu.unimagdalena.pulsepass.domain.TicketType;

public record PurchaseTicketRequest(
        @NotBlank(message = "El email del usuario es obligatorio")
        @Email(message = "Debe tener un formato de correo válido")
        String userEmail,

        @NotBlank(message = "El código del evento es obligatorio")
        String eventCode,

        @NotNull(message = "El tipo de ticket es obligatorio")
        TicketType type
) {}