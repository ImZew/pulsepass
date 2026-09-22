package co.edu.unimagdalena.pulsepass.repository;

import co.edu.unimagdalena.pulsepass.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // Query Method: Buscar usuario por email ignorando mayúsculas
    Optional<User> findByEmailIgnoreCase(String email);
}