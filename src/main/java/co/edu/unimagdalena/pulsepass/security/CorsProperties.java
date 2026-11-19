package co.edu.unimagdalena.pulsepass.security;

import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

/** Origenes permitidos para CORS. Vacio por defecto: ningun origen de navegador queda autorizado. */
@ConfigurationProperties(prefix = "pulsepass.security.cors")
public record CorsProperties(List<String> allowedOrigins) {}
