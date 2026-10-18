package co.edu.unimagdalena.pulsepass.domain;

import jakarta.persistence.*;
import java.time.Instant;

/** Credencial 1:1 con User. Nunca se expone en DTOs. */
@Entity
@Table(name = "user_credentials")
public class UserCredential {

    @Id
    @Column(name = "user_id")
    private Long userId;

    @Column(name = "password_hash", nullable = false, length = 100)
    private String passwordHash;

    @Column(name = "password_changed_at", nullable = false)
    private Instant passwordChangedAt = Instant.now();

    protected UserCredential() {}

    public UserCredential(Long userId, String passwordHash) {
        this.userId = userId;
        this.passwordHash = passwordHash;
    }

    public Long getUserId() { return userId; }
    public String getPasswordHash() { return passwordHash; }
    public Instant getPasswordChangedAt() { return passwordChangedAt; }
}
