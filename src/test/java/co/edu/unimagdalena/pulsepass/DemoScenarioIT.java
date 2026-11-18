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
import co.edu.unimagdalena.pulsepass.domain.UserRole;
import co.edu.unimagdalena.pulsepass.domain.Venue;
import co.edu.unimagdalena.pulsepass.repository.ArtistRepository;
import co.edu.unimagdalena.pulsepass.repository.EventRepository;
import co.edu.unimagdalena.pulsepass.repository.TicketRepository;
import co.edu.unimagdalena.pulsepass.repository.UserRepository;
import co.edu.unimagdalena.pulsepass.repository.UserRoleRepository;
import co.edu.unimagdalena.pulsepass.repository.VenueRepository;
import com.jayway.jsonpath.JsonPath;
import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

/** PRD seccion 23: escenario final de demostracion, paso a paso, contra PostgreSQL real. */
@AutoConfigureMockMvc
class DemoScenarioIT extends BaseIT {

    private static final String PASSWORD = "UnaFraseSegura2026!"; // ficticia

    @Autowired MockMvc mvc;
    @Autowired UserRepository userRepository;
    @Autowired UserRoleRepository roleRepository;
    @Autowired VenueRepository venueRepository;
    @Autowired EventRepository eventRepository;
    @Autowired ArtistRepository artistRepository;
    @Autowired TicketRepository ticketRepository;

    private String register(String username) throws Exception {
        String email = username + "@mail.com";
        String body = mvc.perform(post("/api/users").contentType(MediaType.APPLICATION_JSON).content("""
                {"username":"%s","email":"%s","firstName":"Demo","lastName":"User",
                 "city":"Santa Marta","birthDate":"2000-01-01","password":"%s"}
                """.formatted(username, email, PASSWORD)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        assertThat(body).doesNotContain("hash").doesNotContain(PASSWORD); // sin hash ni contrasena en la respuesta
        return email;
    }

    private String login(String identifier) throws Exception {
        String body = mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"identifier\":\"%s\",\"password\":\"%s\"}".formatted(identifier, PASSWORD)))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        assertThat((Integer) JsonPath.read(body, "$.expiresIn")).isEqualTo(900);
        return "Bearer " + JsonPath.read(body, "$.accessToken");
    }

    private void grant(String username, Role role) {
        roleRepository.save(new UserRole(userRepository.findByUsername(username).orElseThrow().getId(), role));
    }

    private String buy(String auth, String email) throws Exception {
        mvc.perform(post("/api/tickets").header("Authorization", auth).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"userEmail\":\"%s\",\"eventCode\":\"CMF-2026\",\"type\":\"GENERAL\"}".formatted(email)))
                .andExpect(status().isCreated());
        return ticketRepository.findByUserEmailIgnoreCase(email).get(0).getTicketCode();
    }

    @Test
    void section23_demoScenario() throws Exception {
        // Contexto heredado: venue VEN-SMR-01 y festival CMF-2026 ya publicado
        Venue venue = new Venue();
        venue.setCode("VEN-SMR-01");
        venue.setName("Marina Convention Center");
        venue.setCity("Santa Marta");
        venue.setAddress("Calle 1");
        venue.setCapacity(1000);
        venue = venueRepository.save(venue);
        Event cmf = new Event();
        cmf.setEventCode("CMF-2026");
        cmf.setName("Caribbean Music Fest 2026");
        cmf.setCategory(EventCategory.MUSIC);
        cmf.setStatus(EventStatus.PUBLISHED);
        cmf.setEventDate(LocalDateTime.now().plusDays(60));
        cmf.setMinimumAge(0);
        cmf.setVenue(venue);
        eventRepository.save(cmf);

        // 1. Andrea se registra (sin hash en la respuesta); Carlos, Laura (STAFF) y un admin tambien
        String andreaEmail = register("andrea");
        String carlosEmail = register("carlos");
        register("laura");
        register("admin");
        grant("laura", Role.STAFF);
        grant("admin", Role.ADMIN);

        // 2. Andrea inicia sesion: JWT con expiresIn = 900 (verificado dentro de login())
        String andrea = login("andrea");
        String carlos = login("carlos");
        String laura = login("laura");
        String admin = login("admin");

        // 3. Un anonimo consulta los eventos publicados y encuentra CMF-2026
        String published = mvc.perform(get("/api/events/published")).andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        assertThat(published).contains("CMF-2026");

        // 4. Andrea compra su propia entrada (y Carlos la suya)
        String andreaTicket = buy(andrea, andreaEmail);
        String carlosTicket = buy(carlos, carlosEmail);

        // 5. Andrea intenta consultar o cancelar la entrada de Carlos: acceso denegado
        mvc.perform(get("/api/tickets/" + carlosTicket).header("Authorization", andrea)).andExpect(status().isForbidden());
        mvc.perform(patch("/api/tickets/" + carlosTicket + "/cancel").header("Authorization", andrea))
                .andExpect(status().isForbidden());

        // 6. Andrea intenta publicar CMF-2026: 403
        mvc.perform(patch("/api/events/CMF-2026/publish").header("Authorization", andrea)).andExpect(status().isForbidden());

        // 7. El administrador crea otro evento (borrador), asocia un artista y lo publica con las rutas existentes
        String date = LocalDateTime.now().plusDays(90).withNano(0).toString();
        mvc.perform(post("/api/events").header("Authorization", admin).contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {"eventCode":"CMF-2027","name":"Fest 2027","description":"d","category":"MUSIC",
                         "eventDate":"%s","minimumAge":0,"venueCode":"VEN-SMR-01"}
                        """.formatted(date)))
                .andExpect(status().isCreated());
        mvc.perform(get("/api/events/CMF-2027")).andExpect(status().isNotFound()); // borrador oculto al publico
        Long artistId = artistRepository.findAll().get(0).getId();
        mvc.perform(post("/api/events/CMF-2027/artists/" + artistId).header("Authorization", admin))
                .andExpect(status().isOk());
        mvc.perform(patch("/api/events/CMF-2027/publish").header("Authorization", admin)).andExpect(status().isOk());
        mvc.perform(get("/api/events/CMF-2027")).andExpect(status().isOk());

        // 8. Laura (STAFF) marca la entrada como usada; la segunda utilizacion la rechaza la regla de negocio
        mvc.perform(patch("/api/tickets/" + andreaTicket + "/use").header("Authorization", laura)).andExpect(status().isOk());
        mvc.perform(patch("/api/tickets/" + andreaTicket + "/use").header("Authorization", laura)).andExpect(status().isConflict());

        // 9. Se altera un caracter del JWT: 401
        int idx = andrea.lastIndexOf('.') + 6;
        String tampered = andrea.substring(0, idx) + (andrea.charAt(idx) == 'A' ? 'B' : 'A') + andrea.substring(idx + 1);
        mvc.perform(get("/api/auth/me").header("Authorization", tampered)).andExpect(status().isUnauthorized());

        // 10. Se desactiva un usuario con token aun vigente: el siguiente request no es autorizado
        mvc.perform(get("/api/auth/me").header("Authorization", carlos)).andExpect(status().isOk());
        User carlosUser = userRepository.findByUsername("carlos").orElseThrow();
        carlosUser.setActive(false);
        userRepository.save(carlosUser);
        mvc.perform(get("/api/auth/me").header("Authorization", carlos)).andExpect(status().isUnauthorized());
    }
}
