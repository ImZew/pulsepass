package co.edu.unimagdalena.pulsepass.controller;

import co.edu.unimagdalena.pulsepass.dto.response.ArtistResponse;
import co.edu.unimagdalena.pulsepass.service.ArtistService;
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
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@Import(SecurityConfig.class)
@WebMvcTest(ArtistController.class)
class ArtistControllerTest {

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
    private ArtistService artistService;

    @Test
    void getArtistById_ShouldReturn200_WhenArtistExists() throws Exception {
        ArtistResponse mockResponse = new ArtistResponse(1L, "Solar Beat", true);
        Mockito.when(artistService.findById(1L)).thenReturn(mockResponse);

        mockMvc.perform(get("/api/artists/1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.stageName").value("Solar Beat"));
    }

    @Test
    void getArtistByStageName_ShouldReturn200_WhenArtistExists() throws Exception {
        ArtistResponse mockResponse = new ArtistResponse(1L, "Solar Beat", true);
        Mockito.when(artistService.findByStageName("Solar Beat")).thenReturn(mockResponse);

        mockMvc.perform(get("/api/artists/by-stage-name")
                        .param("stageName", "Solar Beat")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.stageName").value("Solar Beat"));
    }

    @Test
    void getActiveArtists_ShouldReturn200AndList() throws Exception {
        List<ArtistResponse> mockList = List.of(
                new ArtistResponse(1L, "Solar Beat", true)
        );
        Mockito.when(artistService.findActiveArtists()).thenReturn(mockList);

        mockMvc.perform(get("/api/artists/active")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(1));
    }
}
