package co.edu.unimagdalena.pulsepass.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import java.io.Serializable;

@Embeddable
public record UserRoleId(
        @Column(name = "user_id") Long userId,
        @Enumerated(EnumType.STRING) @Column(name = "role", length = 20) Role role
) implements Serializable {}
