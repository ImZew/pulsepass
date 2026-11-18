package co.edu.unimagdalena.pulsepass.controller;

import co.edu.unimagdalena.pulsepass.dto.response.UserResponse;
import co.edu.unimagdalena.pulsepass.security.CustomUserDetailsService;
import co.edu.unimagdalena.pulsepass.security.JwtService;
import co.edu.unimagdalena.pulsepass.security.SecurityConfig;
import co.edu.unimagdalena.pulsepass.service.AuthService;
import co.edu.unimagdalena.pulsepass.service.AuthorizationService;
import co.edu.unimagdalena.pulsepass.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@Import(SecurityConfig.class)
@WebMvcTest(UserController.class)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @MockitoBean(name = "authz")
    private AuthorizationService authz;

    @BeforeEach
    void allowOwnership() {
        Mockito.when(authz.isSelfByEmail(Mockito.any())).thenReturn(true);
        Mockito.when(authz.isSelfByUsername(Mockito.any())).thenReturn(true);
    }

    // POST /api/users es publico: se prueba SIN usuario autenticado.
    @Test
    void registerUser_ShouldReturn201_WhenRequestIsValid() throws Exception {
        UserResponse dummyResponse = new UserResponse("sebastian", "sebastian@unimagdalena.edu.co", true);
        Mockito.when(authService.register(Mockito.any())).thenReturn(dummyResponse);

        String jsonRequest = """
            {
                "username": "sebastian",
                "email": "sebastian@unimagdalena.edu.co",
                "firstName": "Sebastián",
                "lastName": "Abaonza",
                "phone": "3001234567",
                "city": "Santa Marta",
                "birthDate": "2000-01-01",
                "password": "UnaFraseSegura2026!"
            }
            """;

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonRequest))
                .andExpect(status().isCreated())
                .andExpect(content().string(""));

        Mockito.verify(authService, Mockito.times(1)).register(Mockito.any());
    }

    @Test
    void registerUser_ShouldReturn400_WhenPasswordIsTooShort() throws Exception {
        String jsonRequest = """
            {
                "username": "sebastian",
                "email": "sebastian@unimagdalena.edu.co",
                "firstName": "Sebastián",
                "lastName": "Abaonza",
                "birthDate": "2000-01-01",
                "password": "corta"
            }
            """;

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonRequest))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.details.password").exists());

        Mockito.verifyNoInteractions(authService);
    }

    @Test
    @WithMockUser(roles = "USER")
    void getUserByUsername_ShouldReturn200_WhenUserExists() throws Exception {
        UserResponse mockResponse = new UserResponse("sebastian", "sebastian@unimagdalena.edu.co", true);
        Mockito.when(userService.findByUsername("sebastian")).thenReturn(mockResponse);

        mockMvc.perform(get("/api/users/sebastian")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("sebastian"))
                .andExpect(jsonPath("$.email").value("sebastian@unimagdalena.edu.co"));
    }

    @Test
    @WithMockUser(roles = "USER")
    void getUserByEmail_ShouldReturn200_WhenUserExists() throws Exception {
        UserResponse mockResponse = new UserResponse("sebastian", "sebastian@unimagdalena.edu.co", true);
        Mockito.when(userService.findByEmail("sebastian@unimagdalena.edu.co")).thenReturn(mockResponse);

        mockMvc.perform(get("/api/users/by-email")
                        .param("email", "sebastian@unimagdalena.edu.co")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("sebastian@unimagdalena.edu.co"));
    }
}
