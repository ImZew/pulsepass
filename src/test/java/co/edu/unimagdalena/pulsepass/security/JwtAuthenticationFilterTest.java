package co.edu.unimagdalena.pulsepass.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import jakarta.servlet.FilterChain;
import java.util.List;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

class JwtAuthenticationFilterTest {

    private JwtService jwtService;
    private CustomUserDetailsService uds;
    private FilterChain chain;
    private JwtAuthenticationFilter filter;
    private MockHttpServletRequest request;
    private MockHttpServletResponse response;

    @BeforeEach
    void setUp() {
        jwtService = mock(JwtService.class);
        uds = mock(CustomUserDetailsService.class);
        chain = mock(FilterChain.class);
        filter = new JwtAuthenticationFilter(jwtService, uds, new RestAuthenticationEntryPoint());
        request = new MockHttpServletRequest("GET", "/api/auth/me");
        response = new MockHttpServletResponse();
        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private SecurityPrincipal principal(boolean active) {
        return new SecurityPrincipal(7L, "andrea", "andrea@mail.com", "",
                active, List.of(new SimpleGrantedAuthority("ROLE_USER")));
    }

    @Test
    void noHeader_ContinuesAnonymous() throws Exception {
        filter.doFilter(request, response, chain);
        verify(chain).doFilter(request, response);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }

    @Test
    void basicScheme_IsIgnored() throws Exception {
        request.addHeader("Authorization", "Basic abc");
        filter.doFilter(request, response, chain);
        verify(chain).doFilter(request, response);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }

    @Test
    void validBearer_SetsAuthentication() throws Exception {
        request.addHeader("Authorization", "Bearer tok");
        when(jwtService.validateAndGetUserId("tok")).thenReturn(7L);
        when(uds.loadById(7L)).thenReturn(principal(true));

        filter.doFilter(request, response, chain);

        verify(chain).doFilter(request, response);
        assertThat(SecurityContextHolder.getContext().getAuthentication().getPrincipal())
                .isInstanceOf(SecurityPrincipal.class);
    }

    @Test
    void invalidBearer_Returns401_AndStopsChain() throws Exception {
        request.addHeader("Authorization", "Bearer malo");
        when(jwtService.validateAndGetUserId("malo")).thenThrow(new InvalidJwtException("x"));

        filter.doFilter(request, response, chain);

        verify(chain, never()).doFilter(any(), any());
        assertThat(response.getStatus()).isEqualTo(401);
        assertThat(response.getContentAsString()).contains("\"status\":401").contains("\"details\":{}");
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }

    @Test
    void duplicatedAuthorizationHeader_Returns401() throws Exception {
        request.addHeader("Authorization", "Bearer a");
        request.addHeader("Authorization", "Bearer b");

        filter.doFilter(request, response, chain);

        verify(chain, never()).doFilter(any(), any());
        assertThat(response.getStatus()).isEqualTo(401);
    }

    @Test
    void inactiveUser_Returns401() throws Exception {
        request.addHeader("Authorization", "Bearer tok");
        when(jwtService.validateAndGetUserId("tok")).thenReturn(7L);
        when(uds.loadById(7L)).thenReturn(principal(false));

        filter.doFilter(request, response, chain);

        verify(chain, never()).doFilter(any(), any());
        assertThat(response.getStatus()).isEqualTo(401);
    }

    @Test
    void existingAuthentication_IsNotOverwritten() throws Exception {
        org.springframework.security.core.Authentication existing =
                org.springframework.security.authentication.UsernamePasswordAuthenticationToken
                        .authenticated("previo", null, List.of());
        SecurityContextHolder.getContext().setAuthentication(existing);
        request.addHeader("Authorization", "Bearer tok");
        when(jwtService.validateAndGetUserId("tok")).thenReturn(7L);
        when(uds.loadById(7L)).thenReturn(principal(true));

        filter.doFilter(request, response, chain);

        verify(chain).doFilter(request, response);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isSameAs(existing);
    }
}
