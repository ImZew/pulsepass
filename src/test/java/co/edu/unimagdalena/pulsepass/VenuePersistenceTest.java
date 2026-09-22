package co.edu.unimagdalena.pulsepass;

import co.edu.unimagdalena.pulsepass.domain.Venue;
import co.edu.unimagdalena.pulsepass.repository.VenueRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;

import static org.junit.jupiter.api.Assertions.*;

public class VenuePersistenceTest extends BaseIT {

    @Autowired
    private VenueRepository venueRepository;

    @Test
    void shouldFailWhenCapacityIsZero() {
        Venue venue = new Venue();
        venue.setCode("VEN-TEST-01");
        venue.setName("Test Venue");
        venue.setCity("Santa Marta");
        venue.setAddress("Calle 123");
        venue.setCapacity(0); // PostgreSQL debe rechazar esto por el CHECK constraint

        assertThrows(DataIntegrityViolationException.class, () -> {
            venueRepository.saveAndFlush(venue);
        });
    }
}