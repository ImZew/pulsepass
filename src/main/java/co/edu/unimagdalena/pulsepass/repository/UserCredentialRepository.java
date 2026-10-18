package co.edu.unimagdalena.pulsepass.repository;

import co.edu.unimagdalena.pulsepass.domain.UserCredential;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserCredentialRepository extends JpaRepository<UserCredential, Long> {}
