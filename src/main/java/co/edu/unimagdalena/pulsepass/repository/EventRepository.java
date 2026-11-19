package co.edu.unimagdalena.pulsepass.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import co.edu.unimagdalena.pulsepass.domain.Event;
import co.edu.unimagdalena.pulsepass.domain.EventStatus;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    
    // --- MÉTODOS DEL LABORATORIO ANTERIOR ---
    
    // Query Method: Buscar evento por eventCode
    Optional<Event> findByEventCode(String eventCode);

    // Query Method: Consultar eventos publicados ordenados por fecha cronológica
    List<Event> findByStatusOrderByEventDateAsc(EventStatus status);

    // JPQL: Optimizado para buscar eventos por el nombre artístico de un participante
    @Query("SELECT e FROM Event e JOIN e.artists a WHERE a.stageName = :stageName")
    List<Event> findByArtistStageName(@Param("stageName") String stageName);

    // JPQL Complejo: Eventos recomendados
    @Query("SELECT DISTINCT e FROM Event e JOIN e.artists a JOIN e.venue v " +
           "WHERE v.city = :city " +
           "AND LOWER(a.stageName) LIKE LOWER(CONCAT('%', :artistName, '%')) " +
           "AND e.eventDate > :date " +
           "ORDER BY e.eventDate ASC")
    List<Event> findRecommendedEvents(
            @Param("city") String city, 
            @Param("artistName") String artistName, 
            @Param("date") LocalDateTime date);

    // --- NUEVOS MÉTODOS REQUERIDOS PARA LA CAPA DE SERVICIOS ---

    // Requerido para la regla BR-EVENT-001 (Validar código único)
    boolean existsByEventCode(String eventCode);

    // Requerido por el nuevo servicio EventServiceImpl
    List<Event> findByArtistsStageNameIgnoreCase(String stageName);
}