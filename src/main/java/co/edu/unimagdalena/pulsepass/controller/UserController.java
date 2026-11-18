package co.edu.unimagdalena.pulsepass.controller;

import co.edu.unimagdalena.pulsepass.dto.request.RegisterUserRequest;
import co.edu.unimagdalena.pulsepass.dto.response.UserResponse;
import co.edu.unimagdalena.pulsepass.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // POST /api/users
    @PostMapping
    public ResponseEntity<Void> registerUser(@Valid @RequestBody RegisterUserRequest request) {
        userService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    // GET /api/users/{username}
    @GetMapping("/{username}")
    public ResponseEntity<UserResponse> getUserByUsername(@PathVariable String username) {
        return ResponseEntity.ok(userService.findByUsername(username));
    }

    // GET /api/users/by-email?email=...
    @GetMapping("/by-email")
    public ResponseEntity<UserResponse> getUserByEmail(@RequestParam String email) {
        return ResponseEntity.ok(userService.findByEmail(email));
    }
}