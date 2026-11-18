package co.edu.unimagdalena.pulsepass.exception;

import co.edu.unimagdalena.pulsepass.dto.response.ErrorResponse;
import java.time.LocalDateTime;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Los @PreAuthorize lanzan AccessDeniedException DENTRO de DispatcherServlet. Sin este advice,
 * el catch-all Exception de GlobalExceptionHandler lo convertiria en 500. Tiene precedencia mayor.
 */
@RestControllerAdvice
@Order(Ordered.HIGHEST_PRECEDENCE)
public class SecurityExceptionAdvice {

    private static final Logger log = LoggerFactory.getLogger(SecurityExceptionAdvice.class);

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException ex) {
        log.warn("Acceso denegado por politica de autorizacion");
        return build(HttpStatus.FORBIDDEN, "No tiene permisos para realizar esta operacion");
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleAuthentication(AuthenticationException ex) {
        return build(HttpStatus.UNAUTHORIZED, "Autenticacion requerida o credenciales invalidas");
    }

    private ResponseEntity<ErrorResponse> build(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(new ErrorResponse(
                LocalDateTime.now(), status.value(), status.getReasonPhrase(), message, Map.of()));
    }
}
