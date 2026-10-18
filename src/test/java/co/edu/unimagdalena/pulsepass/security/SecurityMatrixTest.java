package co.edu.unimagdalena.pulsepass.security;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import co.edu.unimagdalena.pulsepass.controller.ArtistController;
import co.edu.unimagdalena.pulsepass.controller.AuthController;
import co.edu.unimagdalena.pulsepass.controller.EventController;
import co.edu.unimagdalena.pulsepass.controller.TicketController;
import co.edu.unimagdalena.pulsepass.controller.UserController;
import co.edu.unimagdalena.pulsepass.controller.VenueController;
import co.edu.unimagdalena.pulsepass.domain.EventCategory;
import co.edu.unimagdalena.pulsepass.domain.EventStatus;
import co.edu.unimagdalena.pulsepass.dto.response.AuthResponse;
import co.edu.unimagdalena.pulsepass.dto.response.EventResponse;
import co.edu.unimagdalena.pulsepass.service.ArtistService;
import co.edu.unimagdalena.pulsepass.service.AuthService;
import co.edu.unimagdalena.pulsepass.service.AuthorizationService;
import co.edu.unimagdalena.pulsepass.service.EventService;
import co.edu.unimagdalena.pulsepass.service.TicketService;
import co.edu.unimagdalena.pulsepass.service.UserService;
import co.edu.unimagdalena.pulsepass.service.VenueService;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Matriz de seguridad con la cadena de filtros REAL (sin addFilters=false) y JWT reales.
 * Mockea servicios y repositorios: aqui solo se prueba 401/403/404 y que el negocio no se invoque.
 */
@Import({SecurityConfig.class, JwtService.class})
@WebMvcTest({AuthController.class, EventController.class, TicketController.class,
        UserController.class, ArtistController.class, VenueController.class})
class SecurityMatrixTest {

    @Autowired private MockMvc mvc;
    @Autowired private JwtService jwtService;
    @Value("${pulsepass.security.jwt.secret-base64}") private String secret;
    @Value("${pulsepass.security.jwt.issuer}") private String issuer;

    @MockitoBean private CustomUserDetailsService uds;
    @MockitoBean(name = "authz") private AuthorizationService authz;
    @MockitoBean private EventService eventService;
    @MockitoBean private TicketService ticketService;
    @MockitoBean private UserService userService;
    @MockitoBean private AuthService authService;
    @MockitoBean private ArtistService artistService;
    @MockitoBean private VenueService venueService;

    private static final String EVENT_JSON = """
        {"eventCode":"CMF-2026","name":"Fest","description":"d","category":"MUSIC",
         "eventDate":"2026-12-31T20:00:00","minimumAge":18,"venueCode":"VEN-SMR-01"}
        """;

    /** Crea el usuario en el mock de BD y devuelve su cabecera Bearer. */
    private String bearer(long id, boolean active, String... roles) {
        when(uds.loadById(id)).thenReturn(new SecurityPrincipal(id, "u" + id, "u" + id + "@mail.com", "",
                active, List.of(roles).stream().map(r -> new SimpleGrantedAuthority("ROLE_" + r)).toList()));
        return "Bearer " + jwtService.generateAccessToken(id);
    }

    // ---------- Publico ----------
    @Test // T-SEC-001
    void anonymous_CanReadPublicRoutes() throws Exception {
        mvc.perform(get("/api/events/published")).andExpect(status().isOk());
        mvc.perform(get("/api/venues/active")).andExpect(status().isOk());
        mvc.perform(get("/api/artists/active")).andExpect(status().isOk());
    }

    @Test // T-SEC-005
    void login_IsPublic() throws Exception {
        when(authService.login(any())).thenReturn(new AuthResponse("jwt", "Bearer", 900));
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"identifier\":\"andrea\",\"password\":\"UnaFraseSegura2026!\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.expiresIn").value(900));
    }

    @Test // T-SEC-006
    void login_WrongPassword_Returns401Generic() throws Exception {
        when(authService.login(any())).thenThrow(new BadCredentialsException("x"));
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"identifier\":\"andrea\",\"password\":\"mala-clave-123\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.message").value("Autenticacion requerida o credenciales invalidas"));
    }

    // ---------- Roles ----------
    @Test // T-SEC-002
    void anonymous_CannotCreateEvent_401() throws Exception {
        mvc.perform(post("/api/events").contentType(MediaType.APPLICATION_JSON).content(EVENT_JSON))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.error").value("Unauthorized"))
                .andExpect(jsonPath("$.details").isMap());
        verifyNoInteractions(eventService);
    }

    @Test // T-SEC-003
    void user_CannotCreateEvent_403() throws Exception {
        mvc.perform(post("/api/events").header("Authorization", bearer(1, true, "USER"))
                        .contentType(MediaType.APPLICATION_JSON).content(EVENT_JSON))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));
        verifyNoInteractions(eventService);
    }

    @Test // T-SEC-004
    void admin_CanCreateEvent_201() throws Exception {
        mvc.perform(post("/api/events").header("Authorization", bearer(9, true, "ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON).content(EVENT_JSON))
                .andExpect(status().isCreated());
    }

    @Test // T-SEC-018
    void admin_InvalidBody_Returns400FromBeanValidation() throws Exception {
        mvc.perform(post("/api/events").header("Authorization", bearer(9, true, "ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isBadRequest());
    }

    @Test // T-SEC-014 + UC-SEC-08
    void publish_OnlyAdmin() throws Exception {
        mvc.perform(patch("/api/events/CMF-2026/publish").header("Authorization", bearer(1, true, "USER")))
                .andExpect(status().isForbidden());
        verify(eventService, never()).publish(any());
        mvc.perform(patch("/api/events/CMF-2026/publish").header("Authorization", bearer(9, true, "ADMIN")))
                .andExpect(status().isOk());
    }

    @Test // T-SEC-012 / T-SEC-013
    void useTicket_OnlyStaffOrAdmin() throws Exception {
        mvc.perform(patch("/api/tickets/T1/use").header("Authorization", bearer(1, true, "USER")))
                .andExpect(status().isForbidden());
        verify(ticketService, never()).markAsUsed(any());
        mvc.perform(patch("/api/tickets/T1/use").header("Authorization", bearer(5, true, "STAFF")))
                .andExpect(status().isOk());
    }

    @Test
    void paidTickets_OnlyStaffOrAdmin() throws Exception {
        mvc.perform(get("/api/events/CMF-2026/tickets/paid").header("Authorization", bearer(1, true, "USER")))
                .andExpect(status().isForbidden());
        mvc.perform(get("/api/events/CMF-2026/tickets/paid").header("Authorization", bearer(5, true, "STAFF")))
                .andExpect(status().isOk());
    }

    // ---------- JWT invalido ----------
    @Test // T-SEC-007
    void expiredToken_Returns401() throws Exception {
        JwtService past = new JwtService(new JwtProperties(issuer, secret, Duration.ofMinutes(15)),
                Clock.fixed(Instant.now().minus(Duration.ofHours(1)), ZoneOffset.UTC));
        mvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + past.generateAccessToken(1L)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test // T-SEC-008
    void tamperedToken_Returns401_AndDoesNotHitBusiness() throws Exception {
        String token = jwtService.generateAccessToken(1L);
        int idx = token.lastIndexOf('.') + 6;
        String tampered = token.substring(0, idx) + (token.charAt(idx) == 'A' ? 'B' : 'A') + token.substring(idx + 1);
        mvc.perform(get("/api/tickets/by-user").param("email", "a@b.com")
                        .header("Authorization", "Bearer " + tampered))
                .andExpect(status().isUnauthorized());
        verifyNoInteractions(ticketService);
        verify(uds, never()).loadById(any());
    }

    @Test
    void malformedBearer_OnPublicRoute_StillReturns401_NotAnonymous() throws Exception {
        mvc.perform(get("/api/events/published").header("Authorization", "Bearer basura"))
                .andExpect(status().isUnauthorized());
    }

    @Test // T-SEC-016 / UC-SEC-10
    void inactiveUser_WithValidToken_Returns401() throws Exception {
        mvc.perform(get("/api/auth/me").header("Authorization", bearer(3, false, "USER")))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void me_ReturnsMinimalPrincipal_NoSecrets() throws Exception {
        mvc.perform(get("/api/auth/me").header("Authorization", bearer(1, true, "USER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.roles[0]").value("USER"))
                .andExpect(jsonPath("$.password").doesNotExist())
                .andExpect(jsonPath("$.passwordHash").doesNotExist());
    }

    // ---------- Propiedad ----------
    @Test // T-SEC-009 / UC-SEC-06
    void user_CannotReadForeignTicket_403() throws Exception {
        when(authz.ownsTicket("CARLOS-1")).thenReturn(false);
        mvc.perform(get("/api/tickets/CARLOS-1").header("Authorization", bearer(1, true, "USER")))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.message").value("No tiene permisos para realizar esta operacion"));
        verifyNoInteractions(ticketService);
    }

    @Test // T-SEC-010 / UC-SEC-05
    void user_CannotBuyForOtherEmail_403() throws Exception {
        when(authz.isSelfByEmail("carlos@mail.com")).thenReturn(false);
        mvc.perform(post("/api/tickets").header("Authorization", bearer(1, true, "USER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"userEmail\":\"carlos@mail.com\",\"eventCode\":\"CMF-2026\",\"type\":\"GENERAL\"}"))
                .andExpect(status().isForbidden());
        verifyNoInteractions(ticketService);
    }

    @Test
    void user_CanBuyForSelf_201() throws Exception {
        when(authz.isSelfByEmail("andrea@mail.com")).thenReturn(true);
        mvc.perform(post("/api/tickets").header("Authorization", bearer(1, true, "USER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"userEmail\":\"andrea@mail.com\",\"eventCode\":\"CMF-2026\",\"type\":\"GENERAL\"}"))
                .andExpect(status().isCreated());
    }

    @Test
    void anonymous_CannotBuy_401() throws Exception {
        mvc.perform(post("/api/tickets").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"userEmail\":\"a@b.com\",\"eventCode\":\"X\",\"type\":\"GENERAL\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test // T-SEC-011
    void user_CancelsOwnTicket_200_ButNotForeign_403() throws Exception {
        when(authz.ownsTicket("MINE")).thenReturn(true);
        when(authz.ownsTicket("THEIRS")).thenReturn(false);
        String auth = bearer(1, true, "USER");
        mvc.perform(patch("/api/tickets/MINE/cancel").header("Authorization", auth)).andExpect(status().isOk());
        mvc.perform(patch("/api/tickets/THEIRS/cancel").header("Authorization", auth)).andExpect(status().isForbidden());
        verify(ticketService, never()).cancel("THEIRS");
    }

    @Test // T-SEC-015
    void user_CannotLookUpOtherUsers_403() throws Exception {
        when(authz.isSelfByEmail("carlos@mail.com")).thenReturn(false);
        when(authz.isSelfByUsername("carlos")).thenReturn(false);
        String auth = bearer(1, true, "USER");
        mvc.perform(get("/api/users/by-email").param("email", "carlos@mail.com").header("Authorization", auth))
                .andExpect(status().isForbidden());
        mvc.perform(get("/api/users/carlos").header("Authorization", auth)).andExpect(status().isForbidden());
        mvc.perform(get("/api/tickets/by-user").param("email", "carlos@mail.com").header("Authorization", auth))
                .andExpect(status().isForbidden());
        verifyNoInteractions(userService);
    }

    @Test
    void staff_CannotLookUpUsersByEmail_OnlySelfOrAdmin() throws Exception {
        when(authz.isSelfByEmail("carlos@mail.com")).thenReturn(false);
        mvc.perform(get("/api/users/by-email").param("email", "carlos@mail.com")
                        .header("Authorization", bearer(5, true, "STAFF")))
                .andExpect(status().isForbidden());
    }

    // ---------- Borradores ----------
    @Test // T-SEC-017 / UC-SEC-03
    void anonymous_CannotSeeDraftEvent_404() throws Exception {
        when(eventService.findByCode("DRAFT-1")).thenReturn(new EventResponse(1L, "DRAFT-1", "Secreto", "d",
                EventCategory.MUSIC, EventStatus.DRAFT, LocalDateTime.now().plusDays(5), 18, "V", "Venue", List.of()));
        when(authz.canViewUnpublishedEvents()).thenReturn(false);
        mvc.perform(get("/api/events/DRAFT-1"))
                .andExpect(status().isNotFound())
                .andExpect(content().string(org.hamcrest.Matchers.not(org.hamcrest.Matchers.containsString("Secreto"))));
    }

    @Test
    void staff_CanSeeDraftEvent_200() throws Exception {
        when(eventService.findByCode("DRAFT-1")).thenReturn(new EventResponse(1L, "DRAFT-1", "Secreto", "d",
                EventCategory.MUSIC, EventStatus.DRAFT, LocalDateTime.now().plusDays(5), 18, "V", "Venue", List.of()));
        when(authz.canViewUnpublishedEvents()).thenReturn(true);
        mvc.perform(get("/api/events/DRAFT-1").header("Authorization", bearer(5, true, "STAFF")))
                .andExpect(status().isOk());
    }

    @Test
    void anonymous_CanSeePublishedEvent_200() throws Exception {
        when(eventService.findByCode("CMF-2026")).thenReturn(new EventResponse(1L, "CMF-2026", "Fest", "d",
                EventCategory.MUSIC, EventStatus.PUBLISHED, LocalDateTime.now().plusDays(5), 18, "V", "Venue", List.of()));
        when(authz.canViewUnpublishedEvents()).thenReturn(false);
        mvc.perform(get("/api/events/CMF-2026")).andExpect(status().isOk());
    }
}
