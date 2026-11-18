package co.edu.unimagdalena.pulsepass.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.request;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
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
import co.edu.unimagdalena.pulsepass.dto.response.EventResponse;
import co.edu.unimagdalena.pulsepass.service.ArtistService;
import co.edu.unimagdalena.pulsepass.service.AuthService;
import co.edu.unimagdalena.pulsepass.service.AuthorizationService;
import co.edu.unimagdalena.pulsepass.service.EventService;
import co.edu.unimagdalena.pulsepass.service.TicketService;
import co.edu.unimagdalena.pulsepass.service.UserService;
import co.edu.unimagdalena.pulsepass.service.VenueService;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Stream;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

/**
 * PRD 17.4: para cada una de las 20 operaciones heredadas (mas login y /me):
 * rol permitido, rol prohibido, anonimo y, si hay propiedad, mismo propietario / tercero.
 * Usa la cadena de filtros real y JWT reales; la propiedad se simula con el mock de authz.
 */
@Import({SecurityConfig.class, JwtService.class})
@WebMvcTest({AuthController.class, EventController.class, TicketController.class,
        UserController.class, ArtistController.class, VenueController.class})
class RouteSecurityMatrixTest {

    @Autowired private MockMvc mvc;
    @Autowired private JwtService jwtService;

    @MockitoBean private CustomUserDetailsService uds;
    @MockitoBean(name = "authz") private AuthorizationService authz;
    @MockitoBean private EventService eventService;
    @MockitoBean private TicketService ticketService;
    @MockitoBean private UserService userService;
    @MockitoBean private AuthService authService;
    @MockitoBean private ArtistService artistService;
    @MockitoBean private VenueService venueService;

    private static final String EVENT_BODY = """
        {"eventCode":"CMF-2026","name":"Fest","description":"d","category":"MUSIC",
         "eventDate":"2026-12-31T20:00:00","minimumAge":18,"venueCode":"VEN-SMR-01"}
        """;
    private static final String USER_BODY = """
        {"username":"andrea","email":"andrea@mail.com","firstName":"A","lastName":"B",
         "birthDate":"2000-01-01","password":"UnaFraseSegura2026!"}
        """;
    private static final String TICKET_BODY = """
        {"userEmail":"andrea@mail.com","eventCode":"CMF-2026","type":"GENERAL"}
        """;

    record Case(String route, HttpMethod method, String path, String body, String who, boolean owner, int expected) {
        @Override public String toString() {
            return route + " | " + who + (owner ? " (propietario)" : "") + " -> " + expected;
        }
    }

    private static Case c(String route, HttpMethod m, String path, String body, String who, boolean owner, int expected) {
        return new Case(route, m, path, body, who, owner, expected);
    }

    static Stream<Case> cases() {
        HttpMethod G = HttpMethod.GET, P = HttpMethod.POST, PA = HttpMethod.PATCH;
        return Stream.of(
            // ---- Venue (2): publico
            c("FR-SECVEN-01 GET venue", G, "/api/venues/VEN-1", null, "ANON", false, 200),
            c("FR-SECVEN-01 GET venue", G, "/api/venues/VEN-1", null, "USER", false, 200),
            c("FR-SECVEN-02 GET venues/active", G, "/api/venues/active", null, "ANON", false, 200),
            c("FR-SECVEN-02 GET venues/active", G, "/api/venues/active", null, "USER", false, 200),
            // ---- Artist (3): publico
            c("FR-SECART-01 GET artist", G, "/api/artists/1", null, "ANON", false, 200),
            c("FR-SECART-01 GET artist", G, "/api/artists/1", null, "USER", false, 200),
            c("FR-SECART-02 GET by-stage-name", G, "/api/artists/by-stage-name?stageName=Solar", null, "ANON", false, 200),
            c("FR-SECART-02 GET by-stage-name", G, "/api/artists/by-stage-name?stageName=Solar", null, "USER", false, 200),
            c("FR-SECART-03 GET artists/active", G, "/api/artists/active", null, "ANON", false, 200),
            c("FR-SECART-03 GET artists/active", G, "/api/artists/active", null, "USER", false, 200),
            // ---- Event (6)
            c("FR-SECEVT-01 POST event", P, "/api/events", EVENT_BODY, "ANON", false, 401),
            c("FR-SECEVT-01 POST event", P, "/api/events", EVENT_BODY, "USER", false, 403),
            c("FR-SECEVT-01 POST event", P, "/api/events", EVENT_BODY, "STAFF", false, 403),
            c("FR-SECEVT-01 POST event", P, "/api/events", EVENT_BODY, "ADMIN", false, 201),
            c("FR-SECEVT-02 GET event publicado", G, "/api/events/CMF-2026", null, "ANON", false, 200),
            c("FR-SECEVT-02 GET event publicado", G, "/api/events/CMF-2026", null, "USER", false, 200),
            c("FR-SECEVT-03 GET published", G, "/api/events/published", null, "ANON", false, 200),
            c("FR-SECEVT-03 GET published", G, "/api/events/published", null, "USER", false, 200),
            c("FR-SECEVT-04 PATCH publish", PA, "/api/events/CMF-2026/publish", null, "ANON", false, 401),
            c("FR-SECEVT-04 PATCH publish", PA, "/api/events/CMF-2026/publish", null, "USER", false, 403),
            c("FR-SECEVT-04 PATCH publish", PA, "/api/events/CMF-2026/publish", null, "STAFF", false, 403),
            c("FR-SECEVT-04 PATCH publish", PA, "/api/events/CMF-2026/publish", null, "ADMIN", false, 200),
            c("FR-SECEVT-05 POST artist", P, "/api/events/CMF-2026/artists/1", null, "ANON", false, 401),
            c("FR-SECEVT-05 POST artist", P, "/api/events/CMF-2026/artists/1", null, "USER", false, 403),
            c("FR-SECEVT-05 POST artist", P, "/api/events/CMF-2026/artists/1", null, "STAFF", false, 403),
            c("FR-SECEVT-05 POST artist", P, "/api/events/CMF-2026/artists/1", null, "ADMIN", false, 200),
            c("FR-SECEVT-06 GET by-artist", G, "/api/events/by-artist?stageName=Solar", null, "ANON", false, 200),
            c("FR-SECEVT-06 GET by-artist", G, "/api/events/by-artist?stageName=Solar", null, "STAFF", false, 200),
            // ---- User (3)
            c("FR-SECUSR-01 POST register", P, "/api/users", USER_BODY, "ANON", false, 201),
            c("FR-SECUSR-01 POST register", P, "/api/users", USER_BODY, "USER", false, 201),
            c("FR-SECUSR-02 GET by-email", G, "/api/users/by-email?email=andrea@mail.com", null, "ANON", false, 401),
            c("FR-SECUSR-02 GET by-email", G, "/api/users/by-email?email=andrea@mail.com", null, "USER", true, 200),
            c("FR-SECUSR-02 GET by-email", G, "/api/users/by-email?email=andrea@mail.com", null, "USER", false, 403),
            c("FR-SECUSR-02 GET by-email", G, "/api/users/by-email?email=andrea@mail.com", null, "STAFF", false, 403),
            c("FR-SECUSR-02 GET by-email", G, "/api/users/by-email?email=andrea@mail.com", null, "ADMIN", false, 200),
            c("FR-SECUSR-03 GET by-username", G, "/api/users/andrea", null, "ANON", false, 401),
            c("FR-SECUSR-03 GET by-username", G, "/api/users/andrea", null, "USER", true, 200),
            c("FR-SECUSR-03 GET by-username", G, "/api/users/andrea", null, "USER", false, 403),
            c("FR-SECUSR-03 GET by-username", G, "/api/users/andrea", null, "STAFF", false, 403),
            c("FR-SECUSR-03 GET by-username", G, "/api/users/andrea", null, "ADMIN", false, 200),
            // ---- Ticket (6)
            c("FR-SECTKT-01 POST purchase", P, "/api/tickets", TICKET_BODY, "ANON", false, 401),
            c("FR-SECTKT-01 POST purchase", P, "/api/tickets", TICKET_BODY, "USER", true, 201),
            c("FR-SECTKT-01 POST purchase", P, "/api/tickets", TICKET_BODY, "USER", false, 403),
            c("FR-SECTKT-01 POST purchase", P, "/api/tickets", TICKET_BODY, "STAFF", false, 403),
            c("FR-SECTKT-01 POST purchase", P, "/api/tickets", TICKET_BODY, "ADMIN", false, 403),
            c("FR-SECTKT-02 GET ticket", G, "/api/tickets/T1", null, "ANON", false, 401),
            c("FR-SECTKT-02 GET ticket", G, "/api/tickets/T1", null, "USER", true, 200),
            c("FR-SECTKT-02 GET ticket", G, "/api/tickets/T1", null, "USER", false, 403),
            c("FR-SECTKT-02 GET ticket", G, "/api/tickets/T1", null, "STAFF", false, 200),
            c("FR-SECTKT-02 GET ticket", G, "/api/tickets/T1", null, "ADMIN", false, 200),
            c("FR-SECTKT-03 GET by-user", G, "/api/tickets/by-user?email=andrea@mail.com", null, "ANON", false, 401),
            c("FR-SECTKT-03 GET by-user", G, "/api/tickets/by-user?email=andrea@mail.com", null, "USER", true, 200),
            c("FR-SECTKT-03 GET by-user", G, "/api/tickets/by-user?email=andrea@mail.com", null, "USER", false, 403),
            c("FR-SECTKT-03 GET by-user", G, "/api/tickets/by-user?email=andrea@mail.com", null, "STAFF", false, 403),
            c("FR-SECTKT-03 GET by-user", G, "/api/tickets/by-user?email=andrea@mail.com", null, "ADMIN", false, 200),
            c("FR-SECTKT-04 GET paid", G, "/api/events/CMF-2026/tickets/paid", null, "ANON", false, 401),
            c("FR-SECTKT-04 GET paid", G, "/api/events/CMF-2026/tickets/paid", null, "USER", false, 403),
            c("FR-SECTKT-04 GET paid", G, "/api/events/CMF-2026/tickets/paid", null, "STAFF", false, 200),
            c("FR-SECTKT-04 GET paid", G, "/api/events/CMF-2026/tickets/paid", null, "ADMIN", false, 200),
            c("FR-SECTKT-05 PATCH cancel", PA, "/api/tickets/T1/cancel", null, "ANON", false, 401),
            c("FR-SECTKT-05 PATCH cancel", PA, "/api/tickets/T1/cancel", null, "USER", true, 200),
            c("FR-SECTKT-05 PATCH cancel", PA, "/api/tickets/T1/cancel", null, "USER", false, 403),
            c("FR-SECTKT-05 PATCH cancel", PA, "/api/tickets/T1/cancel", null, "STAFF", false, 403),
            c("FR-SECTKT-05 PATCH cancel", PA, "/api/tickets/T1/cancel", null, "ADMIN", false, 200),
            c("FR-SECTKT-06 PATCH use", PA, "/api/tickets/T1/use", null, "ANON", false, 401),
            c("FR-SECTKT-06 PATCH use", PA, "/api/tickets/T1/use", null, "USER", true, 403),
            c("FR-SECTKT-06 PATCH use", PA, "/api/tickets/T1/use", null, "STAFF", false, 200),
            c("FR-SECTKT-06 PATCH use", PA, "/api/tickets/T1/use", null, "ADMIN", false, 200),
            // ---- Autenticacion
            c("GET auth/me", G, "/api/auth/me", null, "ANON", false, 401),
            c("GET auth/me", G, "/api/auth/me", null, "USER", false, 200)
        );
    }

    @BeforeEach
    void setUp() {
        stubPrincipal(1L, "USER");
        stubPrincipal(5L, "STAFF");
        stubPrincipal(9L, "ADMIN");
        when(eventService.findByCode(any())).thenReturn(new EventResponse(1L, "CMF-2026", "Fest", "d",
                EventCategory.MUSIC, EventStatus.PUBLISHED, LocalDateTime.now().plusDays(5), 18, "V", "Venue", List.of()));
    }

    private void stubPrincipal(long id, String role) {
        when(uds.loadById(id)).thenReturn(new SecurityPrincipal(id, "u" + id, "u" + id + "@mail.com", "", true,
                List.of(new SimpleGrantedAuthority("ROLE_" + role))));
    }

    private String bearerFor(String who) {
        long id = switch (who) { case "USER" -> 1L; case "STAFF" -> 5L; default -> 9L; };
        return "Bearer " + jwtService.generateAccessToken(id);
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("cases")
    void routeMatrix(Case c) throws Exception {
        when(authz.isSelfByEmail(any())).thenReturn(c.owner());
        when(authz.isSelfByUsername(any())).thenReturn(c.owner());
        when(authz.ownsTicket(any())).thenReturn(c.owner());
        when(authz.canViewUnpublishedEvents()).thenReturn(c.who().equals("STAFF") || c.who().equals("ADMIN"));

        MockHttpServletRequestBuilder req = request(c.method(), c.path());
        if (c.body() != null) {
            req.contentType(MediaType.APPLICATION_JSON).content(c.body());
        }
        if (!c.who().equals("ANON")) {
            req.header("Authorization", bearerFor(c.who()));
        }
        mvc.perform(req).andExpect(status().is(c.expected()));
    }

    // ---------- Higiene de errores (T-SEC-019) ----------
    private void assertCleanErrorBody(String body) {
        assertThat(body).doesNotContain("Exception", "at co.edu", "stackTrace", "password", "hash", "$2a$");
        assertThat(body).contains("\"timestamp\"", "\"status\"", "\"error\"", "\"message\"", "\"details\"");
    }

    @Test
    void errorResponses_NeverLeakStacktraceOrSecrets() throws Exception {
        String anon401 = mvc.perform(get("/api/tickets/T1")).andExpect(status().isUnauthorized())
                .andReturn().getResponse().getContentAsString();
        String user403 = mvc.perform(get("/api/events/CMF-2026/tickets/paid").header("Authorization", bearerFor("USER")))
                .andExpect(status().isForbidden()).andReturn().getResponse().getContentAsString();
        String bad401 = mvc.perform(get("/api/auth/me").header("Authorization", "Bearer a.b.c"))
                .andExpect(status().isUnauthorized()).andReturn().getResponse().getContentAsString();
        String owner403 = mvc.perform(get("/api/tickets/T1").header("Authorization", bearerFor("USER")))
                .andExpect(status().isForbidden()).andReturn().getResponse().getContentAsString();

        assertCleanErrorBody(anon401);
        assertCleanErrorBody(user403);
        assertCleanErrorBody(bad401);
        assertCleanErrorBody(owner403);
    }

    // ---------- FR-SECAUTH-007: JWT solo por cabecera ----------
    @Test
    void jwtInQueryString_IsNotAccepted() throws Exception {
        String token = jwtService.generateAccessToken(1L);
        mvc.perform(get("/api/auth/me").param("access_token", token)).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/auth/me").param("token", token)).andExpect(status().isUnauthorized());
    }

    // ---------- FR-SECAUTH-008: sin sesion ----------
    @Test
    void api_NeverCreatesSessionCookies() throws Exception {
        mvc.perform(get("/api/events/published")).andExpect(header().doesNotExist("Set-Cookie"));
        mvc.perform(get("/api/auth/me").header("Authorization", bearerFor("USER")))
                .andExpect(status().isOk())
                .andExpect(header().doesNotExist("Set-Cookie"))
                .andExpect(jsonPath("$.roles[0]").value("USER"));
    }

    // ---------- NFR-SEC008: CORS parametrizado (sin origenes por defecto) ----------
    @Test
    void cors_PreflightFromUnlistedOrigin_IsRejected() throws Exception {
        mvc.perform(options("/api/events/published")
                        .header("Origin", "http://sitio-no-autorizado.example")
                        .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isForbidden());
    }
}
