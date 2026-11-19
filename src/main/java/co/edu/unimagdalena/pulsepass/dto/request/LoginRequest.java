package co.edu.unimagdalena.pulsepass.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LoginRequest(
        @NotBlank(message = "El identificador es obligatorio")
        @Size(max = 100, message = "Identificador demasiado largo")
        String identifier,

        @NotBlank(message = "La contraseña es obligatoria")
        @Size(max = 128, message = "Contraseña demasiado larga")
        String password
) {
    @Override
    public String toString() {
        return "LoginRequest[identifier=" + identifier + ", password=****]";
    }
}
