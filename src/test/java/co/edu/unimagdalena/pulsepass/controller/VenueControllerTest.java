package co.edu.unimagdalena.pulsepass.controller;

import co.edu.unimagdalena.pulsepass.dto.response.VenueResponse;
import co.edu.unimagdalena.pulsepass.service.VenueService;
import co.edu.unimagdalena.pulsepass.security.CustomUserDetailsService;
import co.edu.unimagdalena.pulsepass.security.JwtService;
import co.edu.unimagdalena.pulsepass.security.SecurityConfig;
import co.edu.unimagdalena.pulsepass.service.AuthorizationService;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
// IMPORT MODERNO PARA SPRING BOOT 4.X
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@Import(SecurityConfig.class)
@WebMvcTest(VenueController.class)
class VenueControllerTest {

    @Autowired
    private MockMvc mockMvc;

    // Beans requeridos por SecurityConfig (la autenticacion real se prueba en SecurityMatrixTest)
    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @MockitoBean(name = "authz")
    private AuthorizationService authz;

    @MockitoBean
    private VenueService venueService;

    @Test
    void getVenueByCode_ShouldReturn200_WhenVenueExists() throws Exception {
        VenueResponse mockResponse = new VenueResponse("V001", "Estadio Eduardo Santos", "Santa Marta", 15000, true);
        Mockito.when(venueService.findByCode("V001")).thenReturn(mockResponse);

        mockMvc.perform(get("/api/venues/V001")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("V001"))
                .andExpect(jsonPath("$.name").value("Estadio Eduardo Santos"));
    }

    @Test
    void getActiveVenues_ShouldReturn200AndList() throws Exception {
        List<VenueResponse> mockList = List.of(
                new VenueResponse("V001", "Estadio", "Santa Marta", 15000, true),
                new VenueResponse("V002", "Teatro", "Santa Marta", 500, true)
        );
        Mockito.when(venueService.findActiveVenues()).thenReturn(mockList);

        mockMvc.perform(get("/api/venues/active")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(2))
                .andExpect(jsonPath("$[0].code").value("V001"));
    }
}