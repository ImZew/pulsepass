package co.edu.unimagdalena.pulsepass.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import co.edu.unimagdalena.pulsepass.domain.Artist;

public interface ArtistRepository extends JpaRepository<Artist, Long> {
    Optional<Artist> findByStageNameIgnoreCase(String stageName);
    List<Artist> findByActiveTrueOrderByStageNameAsc();
}