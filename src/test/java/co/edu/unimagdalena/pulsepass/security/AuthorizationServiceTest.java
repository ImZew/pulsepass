package co.edu.unimagdalena.pulsepass.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import co.edu.unimagdalena.pulsepass.domain.User;
import co.edu.unimagdalena.pulsepass.repository.TicketOwnerRepository;
import co.edu.unimagdalena.pulsepass.repository.UserRepository;
import co.edu.unimagdalena.pulsepass.service.AuthorizationService;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

class AuthorizationServiceTest {

    private UserRepository userRepository;
    private TicketOwnerRepository ticketOwnerRepository;
    private AuthorizationService authz;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        ticketOwnerRepository = mock(TicketOwnerRepository.class);
        authz = new AuthorizationService(userRepository, ticketOwnerRepository);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private void loginAs(Long id, String... roles) {
        SecurityPrincipal p = new SecurityPrincipal(id, "u" + id, "u" + id + "@mail.com", "", true,
                List.of(roles).stream().map(r -> new SimpleGrantedAuthority("ROLE_" + r)).toList());
        SecurityContextHolder.getContext().setAuthentication(
                UsernamePasswordAuthenticationToken.authenticated(p, null, p.getAuthorities()));
    }

    private User user(Long id) {
        User u = new User();
        u.setId(id);
        return u;
    }

    @Test
    void ownsTicket_TrueForOwner_FalseForThirdParty_FalseIfMissing() {
        loginAs(1L, "USER");
        when(ticketOwnerRepository.findOwnerIdByTicketCode("MINE")).thenReturn(Optional.of(1L));
        when(ticketOwnerRepository.findOwnerIdByTicketCode("THEIRS")).thenReturn(Optional.of(2L));
        when(ticketOwnerRepository.findOwnerIdByTicketCode("NOPE")).thenReturn(Optional.empty());

        assertThat(authz.ownsTicket("MINE")).isTrue();
        assertThat(authz.ownsTicket("THEIRS")).isFalse();
        assertThat(authz.ownsTicket("NOPE")).isFalse();
    }

    @Test
    void isSelfByEmail_ComparesPersistentId() {
        loginAs(1L, "USER");
        when(userRepository.findByEmailIgnoreCase("andrea@mail.com")).thenReturn(Optional.of(user(1L)));
        when(userRepository.findByEmailIgnoreCase("carlos@mail.com")).thenReturn(Optional.of(user(2L)));

        assertThat(authz.isSelfByEmail("andrea@mail.com")).isTrue();
        assertThat(authz.isSelfByEmail("carlos@mail.com")).isFalse();
        assertThat(authz.isSelfByEmail(null)).isFalse();
    }

    @Test
    void isSelfByUsername_ComparesPersistentId() {
        loginAs(1L, "USER");
        when(userRepository.findByUsername("andrea")).thenReturn(Optional.of(user(1L)));
        when(userRepository.findByUsername("carlos")).thenReturn(Optional.of(user(2L)));

        assertThat(authz.isSelfByUsername("andrea")).isTrue();
        assertThat(authz.isSelfByUsername("carlos")).isFalse();
    }

    @Test
    void operationalRole_OnlyStaffAndAdmin() {
        loginAs(1L, "USER");
        assertThat(authz.hasOperationalRole()).isFalse();
        loginAs(2L, "STAFF");
        assertThat(authz.canViewUnpublishedEvents()).isTrue();
        loginAs(3L, "ADMIN");
        assertThat(authz.hasOperationalRole()).isTrue();
    }

    @Test
    void anonymous_IsNeverOwnerNorOperational() {
        SecurityContextHolder.clearContext();
        when(ticketOwnerRepository.findOwnerIdByTicketCode("X")).thenReturn(Optional.of(1L));
        assertThat(authz.ownsTicket("X")).isFalse();
        assertThat(authz.hasOperationalRole()).isFalse();
    }
}
