package co.edu.unimagdalena.pulsepass.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import co.edu.unimagdalena.pulsepass.domain.Venue;

@Repository
public interface VenueRepository extends JpaRepository<Venue, Long> {
    Optional<Venue> findByCode(String code);
    
    List<Venue> findByActiveTrueOrderByNameAsc();
}