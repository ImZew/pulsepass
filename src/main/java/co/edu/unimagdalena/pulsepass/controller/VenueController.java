package co.edu.unimagdalena.pulsepass.controller;

import co.edu.unimagdalena.pulsepass.dto.response.VenueResponse;
import co.edu.unimagdalena.pulsepass.service.VenueService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/venues")
public class VenueController {

    private final VenueService venueService;

    public VenueController(VenueService venueService) {
        this.venueService = venueService;
    }

    // GET /api/venues/{code}
    @GetMapping("/{code}")
    public ResponseEntity<VenueResponse> getVenueByCode(@PathVariable String code) {
        VenueResponse venue = venueService.findByCode(code);
        return ResponseEntity.ok(venue);
    }

    // GET /api/venues/active
    @GetMapping("/active")
    public ResponseEntity<List<VenueResponse>> getActiveVenues() {
        List<VenueResponse> activeVenues = venueService.findActiveVenues();
        return ResponseEntity.ok(activeVenues);
    }
}