package co.edu.unimagdalena.pulsepass.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.stereotype.Service;

/** Emite y valida JWT (HS256). No consulta tickets ni ejecuta negocio. */
@Service
public class JwtService {

    private static final String EXPECTED_ALG = "HS256";
    private static final int MIN_KEY_BYTES = 32;

    private final SecretKey key;
    private final String issuer;
    private final Duration ttl;
    private final Clock clock;

    public JwtService(JwtProperties props, Clock clock) {
        if (props.secretBase64() == null || props.secretBase64().isBlank()) {
            throw new IllegalStateException("PULSEPASS_JWT_SECRET_BASE64 no esta configurada");
        }
        byte[] bytes;
        try {
            bytes = Decoders.BASE64.decode(props.secretBase64());
        } catch (RuntimeException e) {
            throw new IllegalStateException("PULSEPASS_JWT_SECRET_BASE64 no es Base64 valido");
        }
        if (bytes.length < MIN_KEY_BYTES) {
            throw new IllegalStateException("La clave JWT debe tener al menos 32 bytes (256 bits)");
        }
        if (props.issuer() == null || props.issuer().isBlank()) {
            throw new IllegalStateException("El issuer JWT no esta configurado");
        }
        this.key = new SecretKeySpec(bytes, "HmacSHA256");
        this.issuer = props.issuer();
        this.ttl = props.accessTokenTtl() != null ? props.accessTokenTtl() : Duration.ofMinutes(15);
        this.clock = clock;
    }

    public String generateAccessToken(Long userId) {
        Instant now = clock.instant();
        return Jwts.builder()
                .subject(userId.toString())
                .issuer(issuer)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(ttl)))
                .id(UUID.randomUUID().toString())
                .signWith(key, Jwts.SIG.HS256)
                .compact();
    }

    public long expiresInSeconds() {
        return ttl.toSeconds();
    }

    /** Verifica firma, issuer, algoritmo, exp, sub y jti. Devuelve el ID de usuario. */
    public Long validateAndGetUserId(String token) {
        if (token == null || token.isBlank()) {
            throw new InvalidJwtException("Token vacio");
        }
        try {
            Jws<Claims> jws = Jwts.parser()
                    .verifyWith(key)
                    .requireIssuer(issuer)
                    .clock(() -> Date.from(clock.instant()))
                    .build()
                    .parseSignedClaims(token);

            if (!EXPECTED_ALG.equals(jws.getHeader().getAlgorithm())) {
                throw new InvalidJwtException("Algoritmo inesperado");
            }
            Claims claims = jws.getPayload();
            if (claims.getExpiration() == null || claims.getId() == null
                    || claims.getSubject() == null || claims.getSubject().isBlank()) {
                throw new InvalidJwtException("Claims obligatorios ausentes");
            }
            return Long.valueOf(claims.getSubject());
        } catch (InvalidJwtException e) {
            throw e;
        } catch (JwtException | IllegalArgumentException e) {
            // Incluye Expired, Malformed, Signature, Unsupported y sub no numerico.
            throw new InvalidJwtException("Token invalido", e);
        }
    }
}
