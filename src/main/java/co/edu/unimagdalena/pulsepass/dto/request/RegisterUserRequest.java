package co.edu.unimagdalena.pulsepass.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record RegisterUserRequest(
        @NotBlank(message = "El username es obligatorio")
        String username,

        @NotBlank(message = "El email es obligatorio")
        @Email(message = "Debe tener un formato de correo válido")
        String email,

        @NotBlank(message = "El nombre es obligatorio")
        String firstName,

        @NotBlank(message = "El apellido es obligatorio")
        String lastName,

        String phone, // Conservas tus campos originales de la Fase 2

        String city,  // Conservas tus campos originales de la Fase 2

        @NotNull(message = "La fecha de nacimiento es obligatoria")
        LocalDate birthDate
) {}