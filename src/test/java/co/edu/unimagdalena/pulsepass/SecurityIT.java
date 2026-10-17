package co.edu.unimagdalena.pulsepass;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import co.edu.unimagdalena.pulsepass.domain.Event;
import co.edu.unimagdalena.pulsepass.domain.EventCategory;
import co.edu.unimagdalena.pulsepass.domain.EventStatus;
import co.edu.unimagdalena.pulsepass.domain.Role;
import co.edu.unimagdalena.pulsepass.domain.User;
import co.edu.unimagdalena.pulsepass.domain.UserCredential;
import co.edu.unimagdalena.pulsepass.domain.UserRole;
import co.edu.unimagdalena.pulsepass.domain.Venue;
import co.edu.unimagdalena.pulsepass.repository.EventRepository;
import co.edu.unimagdalena.pulsepass.repository.TicketRepository;
import co.edu.unimagdalena.pulsepass.repository.UserCredentialRepository;
import co.edu.unimagdalena.pulsepass.repository.UserRepository;
import co.edu.unimagdalena.pulsepass.repository.UserRoleRepository;
import co.edu.unimagdalena.pulsepass.repository.VenueRepository;
import com.jayway.jsonpath.JsonPath;
import java.time.LocalDateTime;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

/** Integracion contra PostgreSQL real (Testcontainers): migracion V4, registro atomico, login e IDOR. */
@AutoConfigureMockMvc
class SecurityIT extends BaseIT {

    private static final String PASSWORD = "UnaFraseSegura2026!"; // ficticia, solo para tests

    @Autowired MockMvc mvc;
    @Autowired UserRepository userRepository;
    @Autowired UserCredentialRepository credentialRepository;
    @Autowired UserRoleRepository roleRepository;
    @Autowired VenueRepository venueRepository;
    @Autowired EventRepository eventRepository;
    @Autowired TicketRepository ticketRepository;
    @Autowired co.edu.unimagdalena.pulsepass.security.CustomUserDetailsService userDetailsService;
    @Autowired jakarta.persistence.EntityManagerFactory entityManagerFactory;

    private static String suffix() {
        return UUID.randomUUID().toString().substring(0, 8);
    }

    private String register(String username) throws Exception {
        String email = username + "@mail.com";
        mvc.perform(post("/api/users").contentType(MediaType.APPLICATION_JSON).content("""
                {"username":"%s","email":"%s","firstName":"Test","lastName":"User",
                 "city":"Santa Marta","birthDate":"2000-01-01","password":"%s"}
                """.formatted(username, email, PASSWORD)))
                .andExpect(status().isCreated());
        return email;
    }

    private String login(String identifier) throws Exception {
        String body = mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"identifier\":\"%s\",\"password\":\"%s\"}".formatted(identifier, PASSWORD)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return "Bearer " + JsonPath.read(body, "$.accessToken");
    }

    private void grant(String username, Role role) {
        Long id = userRepository.findByUsername(username).orElseThrow().getId();
        roleRepository.save(new UserRole(id, role));
    }

    private Event event(String code, EventStatus status) {
        Venue venue = new Venue();
        venue.setCode("V-" + code);
        venue.setName("Venue");
        venue.setCity("Santa Marta");
        venue.setAddress("Calle 1");
        venue.setCapacity(500);
        venue = venueRepository.save(venue);

        Event e = new Event();
        e.setEventCode(code);
        e.setName("Evento " + code);
        e.setCategory(EventCategory.MUSIC);
        e.setStatus(status);
        e.setEventDate(LocalDateTime.now().plusDays(30));
        e.setMinimumAge(0);
        e.setVenue(venue);
        return eventRepository.save(e);
    }

    @Test
    void register_PersistsBcryptHash_AndRoleUser_AndNeverExposesThem() throws Exception {
        String u = "andrea" + suffix();
        String response = mvc.perform(post("/api/users").contentType(MediaType.APPLICATION_JSON).content("""
                {"username":"%s","email":"%s@mail.com","firstName":"A","lastName":"B",
                 "birthDate":"2000-01-01","password":"%s"}
                """.formatted(u, u, PASSWORD)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        assertThat(response).isEmpty();

        User user = userRepository.findByUsername(u).orElseThrow();
        UserCredential cred = credentialRepository.findById(user.getId()).orElseThrow();
        assertThat(cred.getPasswordHash()).startsWith("$2").isNotEqualTo(PASSWORD);
        assertThat(roleRepository.findRolesByUserId(user.getId())).containsExactly(Role.USER);
    }

    @Test
    void register_Duplicate_RollsBackEverything() throws Exception {
        String u = "dup" + suffix();
        register(u);
        long credentialsBefore = credentialRepository.count();
        long usersBefore = userRepository.count();

        mvc.perform(post("/api/users").contentType(MediaType.APPLICATION_JSON).content("""
                {"username":"%s","email":"otro-%s@mail.com","firstName":"A","lastName":"B",
                 "birthDate":"2000-01-01","password":"%s"}
                """.formatted(u, u, PASSWORD)))
                .andExpect(status().isConflict());

        assertThat(credentialRepository.count()).isEqualTo(credentialsBefore);
        assertThat(userRepository.count()).isEqualTo(usersBefore);
    }

    @Test
    void login_ByUsernameAndEmail_Works_WrongPasswordAndUnknownUser_Return401() throws Exception {
        String u = "login" + suffix();
        String email = register(u);

        login(u);
        String auth = login(email);
        mvc.perform(get("/api/auth/me").header("Authorization", auth))
                .andExpect(status().isOk());

        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"identifier\":\"%s\",\"password\":\"claveEquivocada123\"}".formatted(u)))
                .andExpect(status().isUnauthorized());
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"identifier\":\"noexiste%s\",\"password\":\"claveEquivocada123\"}".formatted(suffix())))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void ownership_UserCannotTouchForeignTickets() throws Exception {
        String code = "EV-" + suffix();
        event(code, EventStatus.PUBLISHED);
        String andrea = "andrea" + suffix();
        String carlos = "carlos" + suffix();
        String andreaEmail = register(andrea);
        register(carlos);
        String andreaAuth = login(andrea);
        String carlosAuth = login(carlos);

        // Andrea compra para si misma
        mvc.perform(post("/api/tickets").header("Authorization", andreaAuth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"userEmail\":\"%s\",\"eventCode\":\"%s\",\"type\":\"GENERAL\"}".formatted(andreaEmail, code)))
                .andExpect(status().isCreated());
        String ticketCode = ticketRepository.findByUserEmailIgnoreCase(andreaEmail).get(0).getTicketCode();
        long ticketsBefore = ticketRepository.count();

        // Carlos no puede leerlo, cancelarlo, listarlo ni comprar a nombre de Andrea
        mvc.perform(get("/api/tickets/" + ticketCode).header("Authorization", carlosAuth))
                .andExpect(status().isForbidden());
        mvc.perform(patch("/api/tickets/" + ticketCode + "/cancel").header("Authorization", carlosAuth))
                .andExpect(status().isForbidden());
        mvc.perform(get("/api/tickets/by-user").param("email", andreaEmail).header("Authorization", carlosAuth))
                .andExpect(status().isForbidden());
        mvc.perform(post("/api/tickets").header("Authorization", carlosAuth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"userEmail\":\"%s\",\"eventCode\":\"%s\",\"type\":\"GENERAL\"}".formatted(andreaEmail, code)))
                .andExpect(status().isForbidden());
        assertThat(ticketRepository.count()).isEqualTo(ticketsBefore);

        // Carlos tampoco distingue "ajeno" de "inexistente" (anti-enumeracion)
        mvc.perform(get("/api/tickets/NOEXISTE1").header("Authorization", carlosAuth))
                .andExpect(status().isForbidden());

        // Andrea si puede ver el suyo
        mvc.perform(get("/api/tickets/" + ticketCode).header("Authorization", andreaAuth))
                .andExpect(status().isOk());
        mvc.perform(get("/api/tickets/by-user").param("email", andreaEmail).header("Authorization", andreaAuth))
                .andExpect(status().isOk());
    }

    @Test
    void staffCanUseTicket_UserCannot_SecondUseIsConflict() throws Exception {
        String code = "EV-" + suffix();
        event(code, EventStatus.PUBLISHED);
        String andrea = "andrea" + suffix();
        String laura = "laura" + suffix();
        String andreaEmail = register(andrea);
        register(laura);
        grant(laura, Role.STAFF);
        String andreaAuth = login(andrea);
        String lauraAuth = login(laura);

        mvc.perform(post("/api/tickets").header("Authorization", andreaAuth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"userEmail\":\"%s\",\"eventCode\":\"%s\",\"type\":\"GENERAL\"}".formatted(andreaEmail, code)))
                .andExpect(status().isCreated());
        String ticketCode = ticketRepository.findByUserEmailIgnoreCase(andreaEmail).get(0).getTicketCode();

        mvc.perform(patch("/api/tickets/" + ticketCode + "/use").header("Authorization", andreaAuth))
                .andExpect(status().isForbidden());
        mvc.perform(patch("/api/tickets/" + ticketCode + "/use").header("Authorization", lauraAuth))
                .andExpect(status().isOk());
        mvc.perform(patch("/api/tickets/" + ticketCode + "/use").header("Authorization", lauraAuth))
                .andExpect(status().isConflict());
    }

    @Test
    void drafts_AreHiddenFromAnonymous_AdminPublishes() throws Exception {
        String code = "DR-" + suffix();
        event(code, EventStatus.DRAFT);
        String admin = "admin" + suffix();
        String user = "user" + suffix();
        register(admin);
        register(user);
        grant(admin, Role.ADMIN);

        mvc.perform(get("/api/events/" + code)).andExpect(status().isNotFound());
        mvc.perform(patch("/api/events/" + code + "/publish").header("Authorization", login(user)))
                .andExpect(status().isForbidden());
        mvc.perform(patch("/api/events/" + code + "/publish").header("Authorization", login(admin)))
                .andExpect(status().isOk());
        mvc.perform(get("/api/events/" + code)).andExpect(status().isOk());
    }

    @Test
    void deactivatedUser_LosesAccessWithAlreadyIssuedToken() throws Exception {
        String u = "baja" + suffix();
        register(u);
        String auth = login(u);
        mvc.perform(get("/api/auth/me").header("Authorization", auth)).andExpect(status().isOk());

        User user = userRepository.findByUsername(u).orElseThrow();
        user.setActive(false);
        userRepository.save(user);

        mvc.perform(get("/api/auth/me").header("Authorization", auth)).andExpect(status().isUnauthorized());
    }

    @Test
    void revokedRole_TakesEffectOnNextRequest() throws Exception {
        String admin = "adm" + suffix();
        register(admin);
        grant(admin, Role.ADMIN);
        String auth = login(admin);
        mvc.perform(get("/api/events/NOPE/tickets/paid").header("Authorization", auth)).andExpect(status().isOk());

        Long id = userRepository.findByUsername(admin).orElseThrow().getId();
        roleRepository.deleteById(new co.edu.unimagdalena.pulsepass.domain.UserRoleId(id, Role.ADMIN));

        mvc.perform(get("/api/events/NOPE/tickets/paid").header("Authorization", auth)).andExpect(status().isForbidden());
    }

    @Test
    void protectedRoutesRejectAnonymous() throws Exception {
        mvc.perform(get("/api/tickets/X")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/users/by-email").param("email", "a@b.com")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/auth/me")).andExpect(status().isUnauthorized());
    }

    // NFR-SEC003: la carga del principal no debe crecer con el numero de roles (sin N+1)
    @Test
    void principalLoad_DoesNotGrowWithNumberOfRoles() throws Exception {
        String one = "uno" + suffix();
        String many = "multi" + suffix();
        register(one);
        register(many);
        grant(many, Role.STAFF);
        grant(many, Role.ADMIN);
        Long idOne = userRepository.findByUsername(one).orElseThrow().getId();
        Long idMany = userRepository.findByUsername(many).orElseThrow().getId();

        org.hibernate.stat.Statistics stats = entityManagerFactory.unwrap(org.hibernate.SessionFactory.class).getStatistics();
        stats.setStatisticsEnabled(true);

        stats.clear();
        userDetailsService.loadById(idOne);
        long queriesOneRole = stats.getPrepareStatementCount();

        stats.clear();
        userDetailsService.loadById(idMany);
        long queriesManyRoles = stats.getPrepareStatementCount();

        assertThat(queriesManyRoles).isEqualTo(queriesOneRole);
    }
}
