package co.edu.unimagdalena.pulsepass.controller;

import co.edu.unimagdalena.pulsepass.domain.EventCategory;
import co.edu.unimagdalena.pulsepass.domain.EventStatus;
import co.edu.unimagdalena.pulsepass.dto.response.EventResponse;
import co.edu.unimagdalena.pulsepass.dto.response.EventSummaryResponse;
import co.edu.unimagdalena.pulsepass.service.EventService;
import co.edu.unimagdalena.pulsepass.service.TicketService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(EventController.class)
class EventControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private EventService eventService;

    @MockitoBean
    private TicketService ticketService;

    @Test
    void createEvent_ShouldReturn201_WhenRequestIsValid() throws Exception {
        EventResponse dummyResponse = new EventResponse(
                1L, "CMF-2026", "Fest", "Desc", EventCategory.MUSIC,
                EventStatus.DRAFT, LocalDateTime.now(), 18, "VEN-01", "Venue", List.of()
        );
        Mockito.when(eventService.create(Mockito.any())).thenReturn(dummyResponse);

        String jsonRequest = """
            {
                "eventCode": "CMF-2026",
                "name": "Caribbean Music Fest 2026",
                "description": "Festival de música",
                "category": "MUSIC",
                "eventDate": "2026-12-31T20:00:00",
                "minimumAge": 18,
                "venueCode": "VEN-SMR-01"
            }
            """;

        mockMvc.perform(post("/api/events")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonRequest))
                .andExpect(status().isCreated());

        Mockito.verify(eventService, Mockito.times(1)).create(Mockito.any());
    }

    @Test
    void getEventByCode_ShouldReturn200_WhenEventExists() throws Exception {
        EventResponse mockResponse = new EventResponse(
                1L,
                "CMF-2026",
                "Caribbean Music Fest 2026",
                "Festival de música",
                EventCategory.MUSIC,
                EventStatus.DRAFT,
                LocalDateTime.now().plusDays(10),
                18,
                "VEN-SMR-01",
                "Marina Convention Center",
                List.of()
        );

        Mockito.when(eventService.findByCode("CMF-2026")).thenReturn(mockResponse);

        mockMvc.perform(get("/api/events/CMF-2026")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.eventCode").value("CMF-2026"))
                .andExpect(jsonPath("$.name").value("Caribbean Music Fest 2026"));
    }

    @Test
    void getPublishedEvents_ShouldReturn200AndList() throws Exception {
        List<EventSummaryResponse> mockList = List.of();
        Mockito.when(eventService.findPublishedEvents()).thenReturn(mockList);

        mockMvc.perform(get("/api/events/published")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    void publishEvent_ShouldReturn200_WhenSuccessful() throws Exception {
        EventResponse dummyResponse = new EventResponse(
                1L, "CMF-2026", "Fest", "Desc", EventCategory.MUSIC,
                EventStatus.PUBLISHED, LocalDateTime.now(), 18, "VEN-01", "Venue", List.of()
        );
        Mockito.when(eventService.publish("CMF-2026")).thenReturn(dummyResponse);

        mockMvc.perform(patch("/api/events/CMF-2026/publish"))
                .andExpect(status().isOk());
    }

    @Test
    void addArtistToEvent_ShouldReturn200_WhenSuccessful() throws Exception {
        EventResponse dummyResponse = new EventResponse(
                1L, "CMF-2026", "Fest", "Desc", EventCategory.MUSIC,
                EventStatus.DRAFT, LocalDateTime.now(), 18, "VEN-01", "Venue", List.of()
        );
        Mockito.when(eventService.addArtist(Mockito.eq("CMF-2026"), Mockito.eq(1L))).thenReturn(dummyResponse);

        mockMvc.perform(post("/api/events/CMF-2026/artists/1"))
                .andExpect(status().isOk());
    }
} 
