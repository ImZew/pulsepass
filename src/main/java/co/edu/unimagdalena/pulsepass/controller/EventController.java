package co.edu.unimagdalena.pulsepass.controller;

import co.edu.unimagdalena.pulsepass.domain.EventStatus;
import co.edu.unimagdalena.pulsepass.dto.request.CreateEventRequest;
import co.edu.unimagdalena.pulsepass.dto.response.EventResponse;
import co.edu.unimagdalena.pulsepass.dto.response.EventSummaryResponse;
import co.edu.unimagdalena.pulsepass.dto.response.TicketResponse;
import co.edu.unimagdalena.pulsepass.exception.ResourceNotFoundException;
import co.edu.unimagdalena.pulsepass.service.AuthorizationService;
import co.edu.unimagdalena.pulsepass.service.EventService;
import co.edu.unimagdalena.pulsepass.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;
    private final TicketService ticketService; // Agregamos el TicketService
    private final AuthorizationService authz;

    // Inyectamos los servicios en el constructor
    public EventController(EventService eventService, TicketService ticketService,
                           AuthorizationService authz) {
        this.eventService = eventService;
        this.ticketService = ticketService;
        this.authz = authz;
    }

    // POST /api/events
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> createEvent(@Valid @RequestBody CreateEventRequest request) {
        eventService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    // GET /api/events/{eventCode}
    @GetMapping("/{eventCode}")
    public ResponseEntity<EventResponse> getEventByCode(@PathVariable String eventCode) {
        EventResponse event = eventService.findByCode(eventCode);
        // Publico solo si esta publicado; borradores/otros estados: 404 para no revelar su existencia.
        if (event.status() != EventStatus.PUBLISHED && !authz.canViewUnpublishedEvents()) {
            throw new ResourceNotFoundException("Event not found: " + eventCode);
        }
        return ResponseEntity.ok(event);
    }

    // GET /api/events/published
    @GetMapping("/published")
    public ResponseEntity<List<EventSummaryResponse>> getPublishedEvents() {
        return ResponseEntity.ok(eventService.findPublishedEvents());
    }

    // PATCH /api/events/{eventCode}/publish
    @PatchMapping("/{eventCode}/publish")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> publishEvent(@PathVariable String eventCode) {
        eventService.publish(eventCode);
        return ResponseEntity.ok().build();
    }

    // POST /api/events/{eventCode}/artists/{artistId}
    @PostMapping("/{eventCode}/artists/{artistId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> addArtistToEvent(@PathVariable String eventCode, @PathVariable Long artistId) {
        eventService.addArtist(eventCode, artistId);
        return ResponseEntity.ok().build();
    }

    // GET /api/events/by-artist?stageName=...
    @GetMapping("/by-artist")
    public ResponseEntity<List<EventSummaryResponse>> getEventsByArtist(@RequestParam String stageName) {
        List<EventSummaryResponse> events = eventService.findByArtist(stageName);
        if (!authz.canViewUnpublishedEvents()) {
            events = events.stream().filter(e -> e.status() == EventStatus.PUBLISHED).toList();
        }
        return ResponseEntity.ok(events);
    }

    // GET /api/events/{eventCode}/tickets/paid
    @GetMapping("/{eventCode}/tickets/paid")
    @PreAuthorize("hasAnyRole('STAFF','ADMIN')")
    public ResponseEntity<List<TicketResponse>> getPaidTicketsByEvent(@PathVariable String eventCode) {
        return ResponseEntity.ok(ticketService.findPaidTicketsByEvent(eventCode));
    }
}