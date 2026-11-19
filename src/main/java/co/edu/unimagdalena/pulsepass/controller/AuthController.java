package co.edu.unimagdalena.pulsepass.controller;

import co.edu.unimagdalena.pulsepass.dto.request.LoginRequest;
import co.edu.unimagdalena.pulsepass.dto.response.AuthResponse;
import co.edu.unimagdalena.pulsepass.dto.response.AuthenticatedUserResponse;
import co.edu.unimagdalena.pulsepass.security.SecurityPrincipal;
import co.edu.unimagdalena.pulsepass.service.AuthService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // POST /api/auth/login
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    // GET /api/auth/me
    @GetMapping("/me")
    public ResponseEntity<AuthenticatedUserResponse> me(@AuthenticationPrincipal SecurityPrincipal principal) {
        List<String> roles = principal.getAuthorities().stream()
                .map(a -> a.getAuthority().replaceFirst("^ROLE_", ""))
                .sorted()
                .toList();
        return ResponseEntity.ok(new AuthenticatedUserResponse(
                principal.getId(), principal.getUsername(), principal.getEmail(), roles));
    }
}
