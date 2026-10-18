package co.edu.unimagdalena.pulsepass;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.output.MigrateResult;
import org.junit.jupiter.api.Test;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;
import org.testcontainers.utility.DockerImageName;

/** DoD: Flyway funciona sobre esquema nuevo Y sobre esquema ya migrado con datos legados. */
@Testcontainers
class MigrationUpgradeIT {

    @Container
    static PostgreSQLContainer postgres = new PostgreSQLContainer(DockerImageName.parse("postgres:16-alpine"));

    private Flyway flyway(String target) {
        var config = Flyway.configure().dataSource(postgres.getJdbcUrl(), postgres.getUsername(), postgres.getPassword());
        if (target != null) {
            config.target(target);
        }
        return config.load();
    }

    private Connection connection() throws SQLException {
        return DriverManager.getConnection(postgres.getJdbcUrl(), postgres.getUsername(), postgres.getPassword());
    }

    @Test
    void v4_UpgradesExistingSchema_KeepsLegacyUsers_WithoutCredentials() throws Exception {
        // 1) Esquema "anterior" (V1-V3) con un usuario preexistente
        flyway("3").migrate();
        try (Connection c = connection(); Statement s = c.createStatement()) {
            s.execute("INSERT INTO users (username, email, active) VALUES ('legado', 'legado@mail.com', true)");
        }

        // 2) Se aplica V4 sobre el esquema ya migrado
        MigrateResult result = flyway(null).migrate();
        assertThat(result.success).isTrue();
        assertThat(result.migrationsExecuted).isEqualTo(1);

        try (Connection c = connection(); Statement s = c.createStatement()) {
            ResultSet roles = s.executeQuery(
                    "SELECT r.role FROM user_roles r JOIN users u ON u.id = r.user_id WHERE u.username = 'legado'");
            assertThat(roles.next()).isTrue();
            assertThat(roles.getString(1)).isEqualTo("USER");

            ResultSet creds = s.executeQuery(
                    "SELECT COUNT(*) FROM user_credentials c JOIN users u ON u.id = c.user_id WHERE u.username = 'legado'");
            creds.next();
            assertThat(creds.getInt(1)).isZero(); // sin contrasena inventada: no puede iniciar sesion

            // Rol invalido y rol duplicado deben ser rechazados por la BD
            assertThatThrownBy(() -> {
                try (Connection c2 = connection(); Statement s2 = c2.createStatement()) {
                    s2.execute("INSERT INTO user_roles (user_id, role) SELECT id, 'SUPERADMIN' FROM users LIMIT 1");
                }
            }).isInstanceOf(SQLException.class);
            assertThatThrownBy(() -> {
                try (Connection c2 = connection(); Statement s2 = c2.createStatement()) {
                    s2.execute("INSERT INTO user_roles (user_id, role) SELECT id, 'USER' FROM users LIMIT 1");
                }
            }).isInstanceOf(SQLException.class);
        }

        // 3) Segunda ejecucion: idempotente
        assertThat(flyway(null).migrate().migrationsExecuted).isZero();
    }
}
