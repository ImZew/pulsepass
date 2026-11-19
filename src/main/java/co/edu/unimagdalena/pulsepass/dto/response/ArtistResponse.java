package co.edu.unimagdalena.pulsepass.dto.response;

public record ArtistResponse(
    Long id,
    String stageName,
    boolean active
) {}