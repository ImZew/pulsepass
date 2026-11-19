package co.edu.unimagdalena.pulsepass.security;

import co.edu.unimagdalena.pulsepass.domain.User;
import co.edu.unimagdalena.pulsepass.domain.UserCredential;
import co.edu.unimagdalena.pulsepass.repository.UserCredentialRepository;
import co.edu.unimagdalena.pulsepass.repository.UserRepository;
import co.edu.unimagdalena.pulsepass.repository.UserRoleRepository;
import java.util.List;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private final UserCredentialRepository credentialRepository;
    private final UserRoleRepository roleRepository;

    public CustomUserDetailsService(UserRepository userRepository,
                                    UserCredentialRepository credentialRepository,
                                    UserRoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.credentialRepository = credentialRepository;
        this.roleRepository = roleRepository;
    }

    /** Login: el identificador puede ser username o correo. */
    @Override
    @Transactional(readOnly = true)
    public SecurityPrincipal loadUserByUsername(String identifier) {
        User user = (identifier != null && identifier.contains("@")
                ? userRepository.findByEmailIgnoreCase(identifier)
                : userRepository.findByUsername(identifier))
                .orElseThrow(() -> new UsernameNotFoundException("Credenciales invalidas"));
        // Usuario legado sin credencial: no puede iniciar sesion.
        UserCredential credential = credentialRepository.findById(user.getId())
                .orElseThrow(() -> new UsernameNotFoundException("Credenciales invalidas"));
        return build(user, credential.getPasswordHash());
    }

    /** Cada request con JWT: revalida estado y roles actuales desde BD. */
    @Transactional(readOnly = true)
    public SecurityPrincipal loadById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));
        return build(user, "");
    }

    private SecurityPrincipal build(User user, String hash) {
        List<SimpleGrantedAuthority> authorities = roleRepository.findRolesByUserId(user.getId())
                .stream()
                .map(r -> new SimpleGrantedAuthority("ROLE_" + r.name()))
                .toList();
        return new SecurityPrincipal(user.getId(), user.getUsername(), user.getEmail(),
                hash, Boolean.TRUE.equals(user.getActive()), authorities);
    }
}
