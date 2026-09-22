package co.edu.unimagdalena.pulsepass.repository;

import co.edu.unimagdalena.pulsepass.domain.Event;
import co.edu.unimagdalena.pulsepass.domain.EventStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    
    // Query Method: Buscar evento por eventCode
    Optional<Event> findByEventCode(String eventCode);

    // Query Method: Consultar eventos publicados ordenados por fecha cronológica
    List<Event> findByStatusOrderByEventDateAsc(EventStatus status);

    // JPQL: Optimizado para buscar eventos por el nombre artístico de un participante
    @Query("SELECT e FROM Event e JOIN e.artists a WHERE a.stageName = :stageName")
    List<Event> findByArtistStageName(@Param("stageName") String stageName);

    // JPQL Complejo: Eventos recomendados (filtros por ciudad, fecha y artista insensible a mayúsculas)
    @Query("SELECT DISTINCT e FROM Event e JOIN e.artists a JOIN e.venue v " +
           "WHERE v.city = :city " +
           "AND LOWER(a.stageName) LIKE LOWER(CONCAT('%', :artistName, '%')) " +
           "AND e.eventDate > :date " +
           "ORDER BY e.eventDate ASC")
    List<Event> findRecommendedEvents(
            @Param("city") String city, 
            @Param("artistName") String artistName, 
            @Param("date") LocalDateTime date);
}