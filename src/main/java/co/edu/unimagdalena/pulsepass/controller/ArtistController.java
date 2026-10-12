package co.edu.unimagdalena.pulsepass.controller;

import co.edu.unimagdalena.pulsepass.dto.response.ArtistResponse;
import co.edu.unimagdalena.pulsepass.service.ArtistService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/artists")
public class ArtistController {

    private final ArtistService artistService;

    public ArtistController(ArtistService artistService) {
        this.artistService = artistService;
    }

    // GET /api/artists/{id}
    @GetMapping("/{id}")
    public ResponseEntity<ArtistResponse> getArtistById(@PathVariable Long id) {
        return ResponseEntity.ok(artistService.findById(id));
    }

    // GET /api/artists/by-stage-name?stageName=...
    @GetMapping("/by-stage-name")
    public ResponseEntity<ArtistResponse> getArtistByStageName(@RequestParam String stageName) {
        return ResponseEntity.ok(artistService.findByStageName(stageName));
    }

    // GET /api/artists/active
    @GetMapping("/active")
    public ResponseEntity<List<ArtistResponse>> getActiveArtists() {
        return ResponseEntity.ok(artistService.findActiveArtists());
    }
}