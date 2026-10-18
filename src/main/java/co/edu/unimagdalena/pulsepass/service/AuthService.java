package co.edu.unimagdalena.pulsepass.service;

import co.edu.unimagdalena.pulsepass.domain.Role;
import co.edu.unimagdalena.pulsepass.domain.User;
import co.edu.unimagdalena.pulsepass.domain.UserCredential;
import co.edu.unimagdalena.pulsepass.domain.UserRole;
import co.edu.unimagdalena.pulsepass.dto.request.LoginRequest;
import co.edu.unimagdalena.pulsepass.dto.request.RegisterUserRequest;
import co.edu.unimagdalena.pulsepass.dto.response.AuthResponse;
import co.edu.unimagdalena.pulsepass.dto.response.UserResponse;
import co.edu.unimagdalena.pulsepass.repository.UserCredentialRepository;
import co.edu.unimagdalena.pulsepass.repository.UserRepository;
import co.edu.unimagdalena.pulsepass.repository.UserRoleRepository;
import co.edu.unimagdalena.pulsepass.security.JwtService;
import co.edu.unimagdalena.pulsepass.security.SecurityPrincipal;
import java.nio.charset.StandardCharsets;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Orquesta registro (usuario + credencial + rol, atomico) y login. No reemplaza a UserService. */
@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserService userService;
    private final UserRepository userRepository;
    private final UserCredentialRepository credentialRepository;
    private final UserRoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(AuthenticationManager authenticationManager, JwtService jwtService,
                       UserService userService, UserRepository userRepository,
                       UserCredentialRepository credentialRepository, UserRoleRepository roleRepository,
                       PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userService = userService;
        this.userRepository = userRepository;
        this.credentialRepository = credentialRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Una sola transaccion: si UserService.register falla (duplicados, reglas) o falla
     * guardar credencial/rol, se revierte todo. El rol inicial es SIEMPRE USER.
     */
    @Transactional
    public UserResponse register(RegisterUserRequest request) {
        UserResponse created = userService.register(request); // conserva reglas de negocio de Fase 2
        User user = userRepository.findByEmailIgnoreCase(request.email())
                .orElseThrow(() -> new IllegalStateException("Usuario recien creado no encontrado"));
        credentialRepository.save(new UserCredential(user.getId(), passwordEncoder.encode(request.password())));
        roleRepository.save(new UserRole(user.getId(), Role.USER));
        log.info("Registro exitoso userId={}", user.getId());
        return created;
    }

    public AuthResponse login(LoginRequest request) {
        // BCrypt solo considera 72 bytes: rechazar de forma generica lo que excede.
        if (request.password().getBytes(StandardCharsets.UTF_8).length > 72) {
            log.warn("Login fallido (credenciales invalidas)");
            throw new BadCredentialsException("Credenciales invalidas");
        }
        try {
            Authentication auth = authenticationManager.authenticate(
                    UsernamePasswordAuthenticationToken.unauthenticated(request.identifier(), request.password()));
            SecurityPrincipal principal = (SecurityPrincipal) auth.getPrincipal();
            String token = jwtService.generateAccessToken(principal.getId());
            log.info("Login exitoso userId={}", principal.getId());
            return new AuthResponse(token, "Bearer", jwtService.expiresInSeconds());
        } catch (AuthenticationException e) {
            // Mismo resultado si el usuario no existe, la clave es incorrecta o esta inactivo.
            log.warn("Login fallido (credenciales invalidas)");
            throw new BadCredentialsException("Credenciales invalidas");
        }
    }
}
