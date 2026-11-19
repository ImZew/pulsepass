package co.edu.unimagdalena.pulsepass.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import co.edu.unimagdalena.pulsepass.domain.Role;
import co.edu.unimagdalena.pulsepass.domain.User;
import co.edu.unimagdalena.pulsepass.domain.UserCredential;
import co.edu.unimagdalena.pulsepass.domain.UserRole;
import co.edu.unimagdalena.pulsepass.dto.request.LoginRequest;
import co.edu.unimagdalena.pulsepass.dto.request.RegisterUserRequest;
import co.edu.unimagdalena.pulsepass.dto.response.AuthResponse;
import co.edu.unimagdalena.pulsepass.dto.response.UserResponse;
import co.edu.unimagdalena.pulsepass.exception.DuplicateResourceException;
import co.edu.unimagdalena.pulsepass.repository.UserCredentialRepository;
import co.edu.unimagdalena.pulsepass.repository.UserRepository;
import co.edu.unimagdalena.pulsepass.repository.UserRoleRepository;
import co.edu.unimagdalena.pulsepass.security.JwtService;
import co.edu.unimagdalena.pulsepass.security.SecurityPrincipal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

class AuthServiceTest {

    private static final String PASSWORD = "UnaFraseSegura2026!";

    private AuthenticationManager authenticationManager;
    private JwtService jwtService;
    private UserService userService;
    private UserRepository userRepository;
    private UserCredentialRepository credentialRepository;
    private UserRoleRepository roleRepository;
    private PasswordEncoder encoder;
    private AuthService authService;

    @BeforeEach
    void setUp() {
        authenticationManager = mock(AuthenticationManager.class);
        jwtService = mock(JwtService.class);
        userService = mock(UserService.class);
        userRepository = mock(UserRepository.class);
        credentialRepository = mock(UserCredentialRepository.class);
        roleRepository = mock(UserRoleRepository.class);
        encoder = new BCryptPasswordEncoder(4);
        authService = new AuthService(authenticationManager, jwtService, userService, userRepository,
                credentialRepository, roleRepository, encoder);
    }

    private RegisterUserRequest registerRequest() {
        return new RegisterUserRequest("andrea", "andrea@mail.com", "Andrea", "Gomez",
                null, null, LocalDate.of(2000, 1, 1), PASSWORD);
    }

    @Test
    void register_StoresBcryptHash_AndRoleUser() {
        RegisterUserRequest request = registerRequest();
        User saved = new User();
        saved.setId(7L);
        when(userService.register(request)).thenReturn(new UserResponse("andrea", "andrea@mail.com", true));
        when(userRepository.findByEmailIgnoreCase("andrea@mail.com")).thenReturn(Optional.of(saved));

        UserResponse response = authService.register(request);

        assertThat(response.username()).isEqualTo("andrea");
        ArgumentCaptor<UserCredential> credential = ArgumentCaptor.forClass(UserCredential.class);
        verify(credentialRepository).save(credential.capture());
        assertThat(credential.getValue().getUserId()).isEqualTo(7L);
        assertThat(credential.getValue().getPasswordHash()).isNotEqualTo(PASSWORD).startsWith("$2");
        assertThat(encoder.matches(PASSWORD, credential.getValue().getPasswordHash())).isTrue();

        ArgumentCaptor<UserRole> role = ArgumentCaptor.forClass(UserRole.class);
        verify(roleRepository).save(role.capture());
        assertThat(role.getValue().getId().userId()).isEqualTo(7L);
        assertThat(role.getValue().getId().role()).isEqualTo(Role.USER);
    }

    @Test
    void register_WhenBusinessRuleFails_DoesNotPersistCredentialsNorRoles() {
        RegisterUserRequest request = registerRequest();
        when(userService.register(request)).thenThrow(new DuplicateResourceException("duplicado"));

        assertThatThrownBy(() -> authService.register(request)).isInstanceOf(DuplicateResourceException.class);

        verifyNoInteractions(credentialRepository, roleRepository);
    }

    @Test
    void login_Success_IssuesToken() {
        SecurityPrincipal principal = new SecurityPrincipal(7L, "andrea", "andrea@mail.com", "hash", true,
                List.of(new SimpleGrantedAuthority("ROLE_USER")));
        when(authenticationManager.authenticate(any())).thenReturn(
                UsernamePasswordAuthenticationToken.authenticated(principal, null, principal.getAuthorities()));
        when(jwtService.generateAccessToken(7L)).thenReturn("jwt-firmado");
        when(jwtService.expiresInSeconds()).thenReturn(900L);

        AuthResponse response = authService.login(new LoginRequest("andrea", PASSWORD));

        assertThat(response.accessToken()).isEqualTo("jwt-firmado");
        assertThat(response.tokenType()).isEqualTo("Bearer");
        assertThat(response.expiresIn()).isEqualTo(900L);
    }

    @Test
    void login_WrongPassword_Returns_GenericError_AndNoToken() {
        when(authenticationManager.authenticate(any())).thenThrow(new BadCredentialsException("x"));

        assertThatThrownBy(() -> authService.login(new LoginRequest("andrea", "otraClave12345")))
                .isInstanceOf(BadCredentialsException.class)
                .hasMessage("Credenciales invalidas");
        verify(jwtService, never()).generateAccessToken(any());
    }

    @Test
    void login_InactiveUser_IsIndistinguishableFromWrongPassword() {
        when(authenticationManager.authenticate(any())).thenThrow(new DisabledException("inactivo"));

        assertThatThrownBy(() -> authService.login(new LoginRequest("andrea", PASSWORD)))
                .isInstanceOf(BadCredentialsException.class)
                .hasMessage("Credenciales invalidas");
        verify(jwtService, never()).generateAccessToken(any());
    }

    @Test
    void login_UnknownUser_IsIndistinguishableFromWrongPassword() {
        when(authenticationManager.authenticate(any())).thenThrow(new UsernameNotFoundException("no existe"));

        assertThatThrownBy(() -> authService.login(new LoginRequest("fantasma", PASSWORD)))
                .isInstanceOf(BadCredentialsException.class)
                .hasMessage("Credenciales invalidas");
    }

    @Test
    void login_PasswordOver72Bytes_IsRejectedWithoutAuthenticating() {
        String tooLong = "a".repeat(73);

        assertThatThrownBy(() -> authService.login(new LoginRequest("andrea", tooLong)))
                .isInstanceOf(BadCredentialsException.class);
        verifyNoInteractions(authenticationManager);
    }
}
