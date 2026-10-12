package co.edu.unimagdalena.pulsepass.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

import co.edu.unimagdalena.pulsepass.domain.EventCategory;

public record CreateEventRequest(
        @NotBlank(message = "El código del evento es obligatorio")
        String eventCode,

        @NotBlank(message = "El nombre es obligatorio")
        String name,
        
        // El PRD pide "longitud máxima definida", asumimos 500 o 255 según tu base de datos
        @Size(max = 500, message = "La descripción supera la longitud máxima")
        String description,

        @NotNull(message = "La categoría es obligatoria")
        EventCategory category,

        @NotNull(message = "La fecha del evento es obligatoria")
        LocalDateTime eventDate,

        @NotNull(message = "La edad mínima es obligatoria")
        @Min(value = 0, message = "La edad mínima no puede ser negativa")
        Integer minimumAge,

        @NotBlank(message = "El código del venue es obligatorio")
        String venueCode
) {}