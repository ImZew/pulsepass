package co.edu.unimagdalena.pulsepass.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;

/** 401 uniforme: no revela si fallo token, usuario o estado. */
public class RestAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private static final Logger log = LoggerFactory.getLogger(RestAuthenticationEntryPoint.class);

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException authException) throws IOException {
        log.warn("No autenticado: {} {}", request.getMethod(), request.getRequestURI());
        SecurityErrorWriter.write(response, HttpStatus.UNAUTHORIZED,
                "Autenticacion requerida o credenciales invalidas");
    }
}
