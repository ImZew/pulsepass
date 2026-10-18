package co.edu.unimagdalena.pulsepass.repository;

import co.edu.unimagdalena.pulsepass.domain.Ticket;
import java.util.Optional;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

/** Devuelve solo el ID del propietario: el dueno se decide en BD, nunca con datos del cliente. */
public interface TicketOwnerRepository extends Repository<Ticket, Long> {

    @Query("SELECT t.user.id FROM Ticket t WHERE t.ticketCode = :code")
    Optional<Long> findOwnerIdByTicketCode(@Param("code") String code);
}
