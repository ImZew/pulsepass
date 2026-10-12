package co.edu.unimagdalena.pulsepass.controller;

import co.edu.unimagdalena.pulsepass.domain.TicketStatus;
import co.edu.unimagdalena.pulsepass.domain.TicketType;
import co.edu.unimagdalena.pulsepass.dto.response.TicketResponse;
import co.edu.unimagdalena.pulsepass.service.TicketService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TicketController.class)
class TicketControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private TicketService ticketService;

    @Test
    void purchaseTicket_ShouldReturn201_WhenRequestIsValid() throws Exception {
        TicketResponse dummyResponse = new TicketResponse(
                1L, "TICK-001", TicketType.VIP, new BigDecimal("150000.00"),
                TicketStatus.PAID, LocalDateTime.now(), "sebastian@unimagdalena.edu.co",
                "CMF-2026", "Caribbean Music Fest 2026"
        );
        Mockito.when(ticketService.purchase(Mockito.any())).thenReturn(dummyResponse);

        String jsonRequest = """
            {
                "eventCode": "CMF-2026",
                "userEmail": "sebastian@unimagdalena.edu.co",
                "type": "VIP",
                "quantity": 1
            }
            """;

        mockMvc.perform(post("/api/tickets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonRequest))
                .andExpect(status().isCreated());

        Mockito.verify(ticketService, Mockito.times(1)).purchase(Mockito.any());
    }

    @Test
    void getTicketByCode_ShouldReturn200_WhenTicketExists() throws Exception {
        TicketResponse mockResponse = new TicketResponse(
                1L,
                "TICK-001",
                TicketType.VIP,
                new BigDecimal("150000.00"),
                TicketStatus.PAID,
                LocalDateTime.now(),
                "sebastian@unimagdalena.edu.co",
                "CMF-2026",
                "Caribbean Music Fest 2026"
        );

        Mockito.when(ticketService.findByCode("TICK-001")).thenReturn(mockResponse);

        mockMvc.perform(get("/api/tickets/TICK-001")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ticketCode").value("TICK-001"))
                .andExpect(jsonPath("$.type").value("VIP"));
    }

    @Test
    void getTicketsByUser_ShouldReturn200AndList() throws Exception {
        List<TicketResponse> mockList = List.of(
                new TicketResponse(
                        1L, "TICK-001", TicketType.VIP, new BigDecimal("150000.00"),
                        TicketStatus.PAID, LocalDateTime.now(), "sebastian@unimagdalena.edu.co",
                        "CMF-2026", "Caribbean Music Fest 2026"
                )
        );
        Mockito.when(ticketService.findByUserEmail("sebastian@unimagdalena.edu.co")).thenReturn(mockList);

        mockMvc.perform(get("/api/tickets/by-user")
                        .param("email", "sebastian@unimagdalena.edu.co")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(1));
    }
}