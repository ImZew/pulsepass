package co.edu.unimagdalena.pulsepass.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import co.edu.unimagdalena.pulsepass.domain.Ticket;
import co.edu.unimagdalena.pulsepass.domain.TicketStatus;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    
    // Consultas JPQL personalizadas
    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.event.eventCode = :eventCode AND t.status = :status")
    long countTicketsByEventAndStatus(
            @Param("eventCode") String eventCode, 
            @Param("status") TicketStatus status);

    // Métodos derivados de Spring Data
    Optional<Ticket> findByTicketCode(String ticketCode);
    
    List<Ticket> findByUserEmailIgnoreCase(String email);
    
    List<Ticket> findByEventEventCodeAndStatus(String eventCode, TicketStatus status);
}