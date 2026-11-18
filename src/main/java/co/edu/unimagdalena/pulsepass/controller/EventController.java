package co.edu.unimagdalena.pulsepass.controller;

import co.edu.unimagdalena.pulsepass.dto.request.CreateEventRequest;
import co.edu.unimagdalena.pulsepass.dto.response.EventResponse;
import co.edu.unimagdalena.pulsepass.dto.response.EventSummaryResponse;
import co.edu.unimagdalena.pulsepass.dto.response.TicketResponse;
import co.edu.unimagdalena.pulsepass.service.EventService;
import co.edu.unimagdalena.pulsepass.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;
    private final TicketService ticketService; // Agregamos el TicketService

    // Inyectamos ambos servicios en el constructor
    public EventController(EventService eventService, TicketService ticketService) {
        this.eventService = eventService;
        this.ticketService = ticketService;
    }

    // POST /api/events
    @PostMapping
    public ResponseEntity<Void> createEvent(@Valid @RequestBody CreateEventRequest request) {
        eventService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    // GET /api/events/{eventCode}
    @GetMapping("/{eventCode}")
    public ResponseEntity<EventResponse> getEventByCode(@PathVariable String eventCode) {
        return ResponseEntity.ok(eventService.findByCode(eventCode));
    }

    // GET /api/events/published
    @GetMapping("/published")
    public ResponseEntity<List<EventSummaryResponse>> getPublishedEvents() {
        return ResponseEntity.ok(eventService.findPublishedEvents());
    }

    // PATCH /api/events/{eventCode}/publish
    @PatchMapping("/{eventCode}/publish")
    public ResponseEntity<Void> publishEvent(@PathVariable String eventCode) {
        eventService.publish(eventCode);
        return ResponseEntity.ok().build();
    }

    // POST /api/events/{eventCode}/artists/{artistId}
    @PostMapping("/{eventCode}/artists/{artistId}")
    public ResponseEntity<Void> addArtistToEvent(@PathVariable String eventCode, @PathVariable Long artistId) {
        eventService.addArtist(eventCode, artistId);
        return ResponseEntity.ok().build();
    }

    // GET /api/events/by-artist?stageName=...
    @GetMapping("/by-artist")
    public ResponseEntity<List<EventSummaryResponse>> getEventsByArtist(@RequestParam String stageName) {
        return ResponseEntity.ok(eventService.findByArtist(stageName));
    }

    // GET /api/events/{eventCode}/tickets/paid
    @GetMapping("/{eventCode}/tickets/paid")
    public ResponseEntity<List<TicketResponse>> getPaidTicketsByEvent(@PathVariable String eventCode) {
        return ResponseEntity.ok(ticketService.findPaidTicketsByEvent(eventCode));
    }
}