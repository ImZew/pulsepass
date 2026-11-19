package co.edu.unimagdalena.pulsepass.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import co.edu.unimagdalena.pulsepass.domain.User;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmailIgnoreCase(String email);
    Optional<User> findByUsername(String username);
    boolean existsByEmailIgnoreCase(String email);
    boolean existsByUsername(String username);
}