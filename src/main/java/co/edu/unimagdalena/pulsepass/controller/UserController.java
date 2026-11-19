package co.edu.unimagdalena.pulsepass.controller;

import co.edu.unimagdalena.pulsepass.dto.request.RegisterUserRequest;
import co.edu.unimagdalena.pulsepass.dto.response.UserResponse;
import co.edu.unimagdalena.pulsepass.service.AuthService;
import co.edu.unimagdalena.pulsepass.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final AuthService authService;

    public UserController(UserService userService, AuthService authService) {
        this.userService = userService;
        this.authService = authService;
    }

    // POST /api/users  (publico; el rol inicial es siempre USER)
    @PostMapping
    public ResponseEntity<Void> registerUser(@Valid @RequestBody RegisterUserRequest request) {
        authService.register(request); // usuario + credencial BCrypt + ROLE_USER, en una transaccion
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    // GET /api/users/{username}  (propio usuario o ADMIN)
    @GetMapping("/{username}")
    @PreAuthorize("hasRole('ADMIN') or @authz.isSelfByUsername(#username)")
    public ResponseEntity<UserResponse> getUserByUsername(@PathVariable String username) {
        return ResponseEntity.ok(userService.findByUsername(username));
    }

    // GET /api/users/by-email?email=...  (propio usuario o ADMIN)
    @GetMapping("/by-email")
    @PreAuthorize("hasRole('ADMIN') or @authz.isSelfByEmail(#email)")
    public ResponseEntity<UserResponse> getUserByEmail(@RequestParam String email) {
        return ResponseEntity.ok(userService.findByEmail(email));
    }
}
