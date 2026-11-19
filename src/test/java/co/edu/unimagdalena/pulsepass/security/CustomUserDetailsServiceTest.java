package co.edu.unimagdalena.pulsepass.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import co.edu.unimagdalena.pulsepass.domain.Role;
import co.edu.unimagdalena.pulsepass.domain.User;
import co.edu.unimagdalena.pulsepass.domain.UserCredential;
import co.edu.unimagdalena.pulsepass.repository.UserCredentialRepository;
import co.edu.unimagdalena.pulsepass.repository.UserRepository;
import co.edu.unimagdalena.pulsepass.repository.UserRoleRepository;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

class CustomUserDetailsServiceTest {

    private UserRepository userRepository;
    private UserCredentialRepository credentialRepository;
    private UserRoleRepository roleRepository;
    private CustomUserDetailsService service;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        credentialRepository = mock(UserCredentialRepository.class);
        roleRepository = mock(UserRoleRepository.class);
        service = new CustomUserDetailsService(userRepository, credentialRepository, roleRepository);
    }

    private User user(Long id, String username, String email, Boolean active) {
        User u = new User();
        u.setId(id);
        u.setUsername(username);
        u.setEmail(email);
        u.setActive(active);
        return u;
    }

    @Test
    void loadByUsername_ReturnsPrincipalWithHashAndRoles() {
        when(userRepository.findByUsername("andrea")).thenReturn(Optional.of(user(1L, "andrea", "andrea@mail.com", true)));
        when(credentialRepository.findById(1L)).thenReturn(Optional.of(new UserCredential(1L, "$2a$hash")));
        when(roleRepository.findRolesByUserId(1L)).thenReturn(List.of(Role.USER, Role.STAFF));

        SecurityPrincipal principal = service.loadUserByUsername("andrea");

        assertThat(principal.getId()).isEqualTo(1L);
        assertThat(principal.getPassword()).isEqualTo("$2a$hash");
        assertThat(principal.isEnabled()).isTrue();
        assertThat(principal.getAuthorities()).extracting(GrantedAuthority::getAuthority)
                .containsExactlyInAnyOrder("ROLE_USER", "ROLE_STAFF");
    }

    @Test
    void loadByEmail_UsesEmailLookup() {
        when(userRepository.findByEmailIgnoreCase("andrea@mail.com"))
                .thenReturn(Optional.of(user(1L, "andrea", "andrea@mail.com", true)));
        when(credentialRepository.findById(1L)).thenReturn(Optional.of(new UserCredential(1L, "h")));
        when(roleRepository.findRolesByUserId(1L)).thenReturn(List.of(Role.USER));

        assertThat(service.loadUserByUsername("andrea@mail.com").getId()).isEqualTo(1L);
        verify(userRepository, never()).findByUsername("andrea@mail.com");
    }

    @Test
    void unknownUser_ThrowsUsernameNotFound() {
        when(userRepository.findByUsername("fantasma")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.loadUserByUsername("fantasma"))
                .isInstanceOf(UsernameNotFoundException.class);
    }

    @Test
    void legacyUserWithoutCredential_CannotLogIn() {
        when(userRepository.findByUsername("legado")).thenReturn(Optional.of(user(2L, "legado", "l@mail.com", true)));
        when(credentialRepository.findById(2L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.loadUserByUsername("legado"))
                .isInstanceOf(UsernameNotFoundException.class);
    }

    @Test
    void inactiveOrNullActive_IsDisabled() {
        when(userRepository.findById(3L)).thenReturn(Optional.of(user(3L, "baja", "b@mail.com", false)));
        when(userRepository.findById(4L)).thenReturn(Optional.of(user(4L, "nulo", "n@mail.com", null)));
        when(roleRepository.findRolesByUserId(3L)).thenReturn(List.of(Role.USER));
        when(roleRepository.findRolesByUserId(4L)).thenReturn(List.of(Role.USER));

        assertThat(service.loadById(3L).isEnabled()).isFalse();
        assertThat(service.loadById(4L).isEnabled()).isFalse();
    }

    @Test
    void loadById_ReloadsCurrentRolesOnEveryCall() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user(1L, "andrea", "andrea@mail.com", true)));
        when(roleRepository.findRolesByUserId(1L))
                .thenReturn(List.of(Role.USER, Role.ADMIN))
                .thenReturn(List.of(Role.USER));

        assertThat(service.loadById(1L).getAuthorities()).extracting(GrantedAuthority::getAuthority)
                .contains("ROLE_ADMIN");
        assertThat(service.loadById(1L).getAuthorities()).extracting(GrantedAuthority::getAuthority)
                .containsExactly("ROLE_USER");
    }

    @Test
    void loadById_MissingUser_ThrowsAndPrincipalHasNoHash() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.loadById(99L)).isInstanceOf(UsernameNotFoundException.class);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user(1L, "a", "a@mail.com", true)));
        when(roleRepository.findRolesByUserId(1L)).thenReturn(List.of());
        SecurityPrincipal p = service.loadById(1L);
        assertThat(p.getPassword()).isEmpty();
        assertThat(p.getAuthorities()).isEmpty();
    }
}
