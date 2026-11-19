package co.edu.unimagdalena.pulsepass.dto.response;

public record VenueResponse(
    String code,
    String name,
    String city,
    Integer capacity,
    boolean active
) {}