package co.edu.unimagdalena.pulsepass.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Collections;
import java.util.List;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Lee el Bearer, valida el JWT y reconstruye el principal desde BD.
 * Sin cabecera Authorization: deja continuar (la cadena decide si la ruta es publica).
 * Con Bearer invalido: responde 401 de inmediato, nunca autentica por accidente.
 * Se instancia como @Bean en SecurityConfig (no @Component) para no registrarse dos veces.
 */
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String PREFIX = "Bearer ";

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;
    private final AuthenticationEntryPoint entryPoint;

    public JwtAuthenticationFilter(JwtService jwtService, CustomUserDetailsService userDetailsService,
                                   AuthenticationEntryPoint entryPoint) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
        this.entryPoint = entryPoint;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        List<String> headers = Collections.list(request.getHeaders(HttpHeaders.AUTHORIZATION));

        if (headers.isEmpty()) {
            chain.doFilter(request, response);
            return;
        }
        if (headers.size() > 1) { // doble header sospechoso
            reject(request, response);
            return;
        }
        String header = headers.get(0);
        if (!header.regionMatches(true, 0, PREFIX, 0, PREFIX.length())) {
            chain.doFilter(request, response); // otro esquema: no es JWT, la cadena lo trata como anonimo
            return;
        }

        try {
            Long userId = jwtService.validateAndGetUserId(header.substring(PREFIX.length()).trim());
            SecurityPrincipal principal = userDetailsService.loadById(userId);
            if (!principal.isEnabled()) {
                throw new DisabledException("Usuario inactivo");
            }
            if (SecurityContextHolder.getContext().getAuthentication() == null) {
                UsernamePasswordAuthenticationToken auth = UsernamePasswordAuthenticationToken
                        .authenticated(principal, null, principal.getAuthorities());
                auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContext context = SecurityContextHolder.createEmptyContext();
                context.setAuthentication(auth);
                SecurityContextHolder.setContext(context);
            }
        } catch (InvalidJwtException | AuthenticationException e) {
            reject(request, response);
            return;
        }
        chain.doFilter(request, response);
    }

    private void reject(HttpServletRequest request, HttpServletResponse response)
            throws IOException, ServletException {
        SecurityContextHolder.clearContext();
        entryPoint.commence(request, response, new BadCredentialsException("Token invalido"));
    }
}
