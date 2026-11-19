package co.edu.unimagdalena.pulsepass.service;

import co.edu.unimagdalena.pulsepass.domain.User;
import co.edu.unimagdalena.pulsepass.repository.TicketOwnerRepository;
import co.edu.unimagdalena.pulsepass.repository.UserRepository;
import co.edu.unimagdalena.pulsepass.security.SecurityPrincipal;
import java.util.Optional;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

/**
 * Politicas de propiedad (anti-IDOR). Se invoca desde @PreAuthorize("@authz.xxx(...)").
 * El propietario se obtiene SIEMPRE de BD y se compara por ID persistente con el principal.
 * Politica de objeto ajeno: un USER recibe 403 tanto si el recurso es ajeno como si no existe
 * (evita enumerar codigos). STAFF/ADMIN pasan y reciben el 404 normal del Service.
 */
@Service("authz")
public class AuthorizationService {

    private final UserRepository userRepository;
    private final TicketOwnerRepository ticketOwnerRepository;

    public AuthorizationService(UserRepository userRepository, TicketOwnerRepository ticketOwnerRepository) {
        this.userRepository = userRepository;
        this.ticketOwnerRepository = ticketOwnerRepository;
    }

    public Optional<SecurityPrincipal> currentPrincipal() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && auth.getPrincipal() instanceof SecurityPrincipal p) {
            return Optional.of(p);
        }
        return Optional.empty();
    }

    /** STAFF o ADMIN (los anonimos y USER devuelven false). */
    public boolean hasOperationalRole() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.isAuthenticated() && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_STAFF") || a.getAuthority().equals("ROLE_ADMIN"));
    }

    /** Eventos no publicados (borradores, etc.) solo para STAFF/ADMIN. */
    public boolean canViewUnpublishedEvents() {
        return hasOperationalRole();
    }

    public boolean isSelfByEmail(String email) {
        if (email == null || email.isBlank()) {
            return false;
        }
        return isSameUser(userRepository.findByEmailIgnoreCase(email));
    }

    public boolean isSelfByUsername(String username) {
        if (username == null || username.isBlank()) {
            return false;
        }
        return isSameUser(userRepository.findByUsername(username));
    }

    public boolean ownsTicket(String ticketCode) {
        if (ticketCode == null || ticketCode.isBlank()) {
            return false;
        }
        Optional<SecurityPrincipal> principal = currentPrincipal();
        return principal.isPresent() && ticketOwnerRepository.findOwnerIdByTicketCode(ticketCode)
                .map(ownerId -> ownerId.equals(principal.get().getId()))
                .orElse(false);
    }

    private boolean isSameUser(Optional<User> requested) {
        Optional<SecurityPrincipal> principal = currentPrincipal();
        return principal.isPresent() && requested
                .map(u -> u.getId().equals(principal.get().getId()))
                .orElse(false);
    }
}
