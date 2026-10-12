package co.edu.unimagdalena.pulsepass.controller;

import co.edu.unimagdalena.pulsepass.dto.response.UserResponse;
import co.edu.unimagdalena.pulsepass.service.UserService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UserController.class)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserService userService;

    @Test
    void registerUser_ShouldReturn201_WhenRequestIsValid() throws Exception {
        UserResponse dummyResponse = new UserResponse("sebastian", "sebastian@unimagdalena.edu.co", true);
        Mockito.when(userService.register(Mockito.any())).thenReturn(dummyResponse);

        String jsonRequest = """
            {
                "username": "sebastian",
                "email": "sebastian@unimagdalena.edu.co",
                "firstName": "Sebastián",
                "lastName": "Abaonza",
                "phone": "3001234567",
                "city": "Santa Marta",
                "birthDate": "2000-01-01"
            }
            """;

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonRequest))
                .andExpect(status().isCreated());

        Mockito.verify(userService, Mockito.times(1)).register(Mockito.any());
    }

    @Test
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