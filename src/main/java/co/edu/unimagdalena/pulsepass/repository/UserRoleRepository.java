package co.edu.unimagdalena.pulsepass.repository;

import co.edu.unimagdalena.pulsepass.domain.Role;
import co.edu.unimagdalena.pulsepass.domain.UserRole;
import co.edu.unimagdalena.pulsepass.domain.UserRoleId;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRoleRepository extends JpaRepository<UserRole, UserRoleId> {

    @Query("SELECT r.id.role FROM UserRole r WHERE r.id.userId = :userId")
    List<Role> findRolesByUserId(@Param("userId") Long userId);
}
