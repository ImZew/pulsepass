package co.edu.unimagdalena.pulsepass.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import io.jsonwebtoken.Jwts;
import java.security.SecureRandom;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Base64;
import org.junit.jupiter.api.Test;

class JwtServiceTest {

    private static final Instant NOW = Instant.parse("2026-10-17T10:00:00Z");
    private static final String SECRET = randomSecret(32);

    private static String randomSecret(int bytes) {
        byte[] b = new byte[bytes];
        new SecureRandom().nextBytes(b);
        return Base64.getEncoder().encodeToString(b);
    }

    private static JwtService service(String secret, String issuer, Instant at) {
        return new JwtService(new JwtProperties(issuer, secret, Duration.ofMinutes(15)),
                Clock.fixed(at, ZoneOffset.UTC));
    }

    @Test
    void validToken_ReturnsUserId() {
        JwtService jwt = service(SECRET, "pulsepass-api", NOW);
        String token = jwt.generateAccessToken(42L);
        assertThat(jwt.validateAndGetUserId(token)).isEqualTo(42L);
        assertThat(jwt.expiresInSeconds()).isEqualTo(900);
    }

    @Test
    void expiredToken_IsRejected() {
        String token = service(SECRET, "pulsepass-api", NOW).generateAccessToken(1L);
        JwtService later = service(SECRET, "pulsepass-api", NOW.plus(Duration.ofMinutes(16)));
        assertThatThrownBy(() -> later.validateAndGetUserId(token)).isInstanceOf(InvalidJwtException.class);
    }

    @Test
    void wrongIssuer_IsRejected() {
        String token = service(SECRET, "otro-emisor", NOW).generateAccessToken(1L);
        JwtService jwt = service(SECRET, "pulsepass-api", NOW);
        assertThatThrownBy(() -> jwt.validateAndGetUserId(token)).isInstanceOf(InvalidJwtException.class);
    }

    @Test
    void differentKey_IsRejected() {
        String token = service(randomSecret(32), "pulsepass-api", NOW).generateAccessToken(1L);
        JwtService jwt = service(SECRET, "pulsepass-api", NOW);
        assertThatThrownBy(() -> jwt.validateAndGetUserId(token)).isInstanceOf(InvalidJwtException.class);
    }

    @Test
    void tamperedSignature_IsRejected() {
        JwtService jwt = service(SECRET, "pulsepass-api", NOW);
        String token = jwt.generateAccessToken(1L);
        int idx = token.lastIndexOf('.') + 6;
        char original = token.charAt(idx);
        String tampered = token.substring(0, idx) + (original == 'A' ? 'B' : 'A') + token.substring(idx + 1);
        assertThatThrownBy(() -> jwt.validateAndGetUserId(tampered)).isInstanceOf(InvalidJwtException.class);
    }

    @Test
    void unsignedToken_AlgNone_IsRejected() {
        JwtService jwt = service(SECRET, "pulsepass-api", NOW);
        String unsigned = Jwts.builder().subject("1").issuer("pulsepass-api").compact();
        assertThatThrownBy(() -> jwt.validateAndGetUserId(unsigned)).isInstanceOf(InvalidJwtException.class);
    }

    @Test
    void emptyOrMalformed_AreRejected() {
        JwtService jwt = service(SECRET, "pulsepass-api", NOW);
        assertThatThrownBy(() -> jwt.validateAndGetUserId("")).isInstanceOf(InvalidJwtException.class);
        assertThatThrownBy(() -> jwt.validateAndGetUserId(null)).isInstanceOf(InvalidJwtException.class);
        assertThatThrownBy(() -> jwt.validateAndGetUserId("basura.no.jwt")).isInstanceOf(InvalidJwtException.class);
    }

    @Test
    void weakOrMissingKey_FailsAtStartup() {
        assertThatThrownBy(() -> service(randomSecret(16), "pulsepass-api", NOW))
                .isInstanceOf(IllegalStateException.class);
        assertThatThrownBy(() -> service(null, "pulsepass-api", NOW))
                .isInstanceOf(IllegalStateException.class);
        assertThatThrownBy(() -> service("***no-base64***", "pulsepass-api", NOW))
                .isInstanceOf(IllegalStateException.class);
    }
}
