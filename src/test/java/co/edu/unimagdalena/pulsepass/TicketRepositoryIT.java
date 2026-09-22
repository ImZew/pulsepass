package co.edu.unimagdalena.pulsepass;

import co.edu.unimagdalena.pulsepass.domain.TicketStatus;
import co.edu.unimagdalena.pulsepass.repository.TicketRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import static org.junit.jupiter.api.Assertions.*;

public class TicketRepositoryIT extends BaseIT {

    @Autowired
    private TicketRepository ticketRepository;

    @Test
    void shouldExecuteCountPaidTicketsSuccessfully() {
        long count = ticketRepository.countTicketsByEventAndStatus("CMF-2026", TicketStatus.PAID);
        assertTrue(count >= 0);
    }
}