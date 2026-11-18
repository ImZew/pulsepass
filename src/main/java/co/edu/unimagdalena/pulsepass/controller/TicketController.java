package co.edu.unimagdalena.pulsepass.controller;

import co.edu.unimagdalena.pulsepass.dto.request.PurchaseTicketRequest;
import co.edu.unimagdalena.pulsepass.dto.response.TicketResponse;
import co.edu.unimagdalena.pulsepass.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    // POST /api/tickets
    @PostMapping
    public ResponseEntity<Void> purchase(@Valid @RequestBody PurchaseTicketRequest request) {
        ticketService.purchase(request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    // GET /api/tickets/{ticketCode}
    @GetMapping("/{ticketCode}")
    public ResponseEntity<TicketResponse> getByCode(@PathVariable String ticketCode) {
        return ResponseEntity.ok(ticketService.findByCode(ticketCode));
    }

    // GET /api/tickets/by-user?email=...
    @GetMapping("/by-user")
    public ResponseEntity<List<TicketResponse>> getByUser(@RequestParam String email) {
        return ResponseEntity.ok(ticketService.findByUserEmail(email));
    }

    // PATCH /api/tickets/{ticketCode}/cancel
    @PatchMapping("/{ticketCode}/cancel")
    public ResponseEntity<Void> cancel(@PathVariable String ticketCode) {
        ticketService.cancel(ticketCode);
        return ResponseEntity.ok().build();
    }

    // PATCH /api/tickets/{ticketCode}/use
    @PatchMapping("/{ticketCode}/use")
    public ResponseEntity<Void> markAsUsed(@PathVariable String ticketCode) {
        ticketService.markAsUsed(ticketCode);
        return ResponseEntity.ok().build();
    }
}