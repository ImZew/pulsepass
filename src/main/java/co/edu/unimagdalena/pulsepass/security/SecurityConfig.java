package co.edu.unimagdalena.pulsepass.security;

import java.time.Clock;
import java.util.List;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@EnableConfigurationProperties({JwtProperties.class, CorsProperties.class})
public class SecurityConfig {

    @Bean
    Clock clock() {
        return Clock.systemUTC();
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(); // SEC003
    }

    /** CORS parametrizado: solo los origenes listados en pulsepass.security.cors.allowed-origins. */
    @Bean
    CorsConfigurationSource corsConfigurationSource(CorsProperties props) {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(props.allowedOrigins() == null ? List.of() : props.allowedOrigins());
        config.setAllowedMethods(List.of("GET", "POST", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        config.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return source;
    }

    @Bean
    RestAuthenticationEntryPoint restAuthenticationEntryPoint() {
        return new RestAuthenticationEntryPoint();
    }

    @Bean
    RestAccessDeniedHandler restAccessDeniedHandler() {
        return new RestAccessDeniedHandler();
    }

    @Bean
    JwtAuthenticationFilter jwtAuthenticationFilter(JwtService jwtService,
                                                    CustomUserDetailsService userDetailsService,
                                                    RestAuthenticationEntryPoint entryPoint) {
        return new JwtAuthenticationFilter(jwtService, userDetailsService, entryPoint);
    }

    /** Evita que Boot registre el filtro JWT tambien fuera de la cadena de Spring Security. */
    @Bean
    FilterRegistrationBean<JwtAuthenticationFilter> jwtFilterRegistration(JwtAuthenticationFilter filter) {
        FilterRegistrationBean<JwtAuthenticationFilter> registration = new FilterRegistrationBean<>(filter);
        registration.setEnabled(false);
        return registration;
    }

    @Bean
    AuthenticationManager authenticationManager(CustomUserDetailsService userDetailsService,
                                                PasswordEncoder passwordEncoder) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder);
        return new ProviderManager(provider);
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http,
                                            JwtAuthenticationFilter jwtFilter,
                                            RestAuthenticationEntryPoint entryPoint,
                                            RestAccessDeniedHandler deniedHandler) throws Exception {
        http
            // CSRF off: API Bearer sin cookies de autenticacion. Revisar si cambia ese diseno.
            .cors(Customizer.withDefaults())
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .formLogin(AbstractHttpConfigurer::disable)
            .httpBasic(AbstractHttpConfigurer::disable)
            .logout(AbstractHttpConfigurer::disable)
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint(entryPoint)
                .accessDeniedHandler(deniedHandler))
            .authorizeHttpRequests(auth -> auth
                // --- Publico ---
                .requestMatchers(HttpMethod.POST, "/api/auth/login", "/api/users").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/events/published", "/api/events/by-artist").permitAll()
                // Publico por URL, pero el controlador oculta borradores (404) a quien no es STAFF/ADMIN.
                .requestMatchers(HttpMethod.GET, "/api/events/*").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/artists/**", "/api/venues/**").permitAll()
                // --- ADMIN ---
                .requestMatchers(HttpMethod.POST, "/api/events").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PATCH, "/api/events/*/publish").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/events/*/artists/*").hasRole("ADMIN")
                // --- STAFF / ADMIN ---
                .requestMatchers(HttpMethod.PATCH, "/api/tickets/*/use").hasAnyRole("STAFF", "ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/events/*/tickets/paid").hasAnyRole("STAFF", "ADMIN")
                // --- Todo lo demas: autenticado (propiedad via @PreAuthorize en controladores) ---
                .anyRequest().authenticated())
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
