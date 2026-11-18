package co.edu.unimagdalena.pulsepass.dto.request;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.nio.charset.StandardCharsets;
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
        LocalDate birthDate,

        // Fase 4: obligatoria en registro. Minimo academico 12; maximo 72 por limite de BCrypt.
        @NotBlank(message = "La contraseña es obligatoria")
        @Size(min = 12, max = 72, message = "La contraseña debe tener entre 12 y 72 caracteres")
        String password
) {
    /** BCrypt trabaja con maximo 72 BYTES: caracteres multibyte pueden excederlo. */
    @AssertTrue(message = "La contraseña no puede superar 72 bytes en UTF-8")
    public boolean isPasswordWithinBcryptLimit() {
        return password == null || password.getBytes(StandardCharsets.UTF_8).length <= 72;
    }

    @Override
    public String toString() { // nunca imprimir la contraseña en logs
        return "RegisterUserRequest[username=" + username + ", email=" + email + ", password=****]";
    }
}
