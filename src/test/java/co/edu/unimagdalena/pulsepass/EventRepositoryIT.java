package co.edu.unimagdalena.pulsepass;

import co.edu.unimagdalena.pulsepass.domain.Event;
import co.edu.unimagdalena.pulsepass.repository.EventRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class EventRepositoryIT extends BaseIT {

    @Autowired
    private EventRepository eventRepository;

    @Test
    void shouldExecuteFindEventsByArtistStageNameWithoutErrors() {
        List<Event> events = eventRepository.findByArtistStageName("Solar Beat");
        assertNotNull(events);
    }
}