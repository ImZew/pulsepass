package co.edu.unimagdalena.pulsepass.dto.response;

public record UserResponse(
    String username,
    String email,
    boolean active
) {}