package co.edu.unimagdalena.pulsepass.service;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import co.edu.unimagdalena.pulsepass.domain.User;
import co.edu.unimagdalena.pulsepass.dto.request.RegisterUserRequest;
import co.edu.unimagdalena.pulsepass.dto.response.UserResponse;
import co.edu.unimagdalena.pulsepass.exception.BusinessRuleException;
import co.edu.unimagdalena.pulsepass.exception.DuplicateResourceException;
import co.edu.unimagdalena.pulsepass.mapper.UserMapper;
import co.edu.unimagdalena.pulsepass.repository.UserRepository;
import co.edu.unimagdalena.pulsepass.service.impl.UserServiceImpl;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserMapper userMapper;

    @InjectMocks
    private UserServiceImpl userService;

    @Test
    void register_ShouldReturnUserResponse_WhenDataIsValid() {
        // Arrange
        RegisterUserRequest request = mock(RegisterUserRequest.class);
        when(request.username()).thenReturn("juanp");
        when(request.email()).thenReturn("juan@test.com");
        when(request.birthDate()).thenReturn(LocalDate.of(2000, 1, 1));

        UserResponse expectedResponse = mock(UserResponse.class);

        when(userRepository.existsByUsername("juanp")).thenReturn(false);
        when(userRepository.existsByEmailIgnoreCase("juan@test.com")).thenReturn(false);
        
        User savedUser = new User();
        savedUser.setUsername("juanp");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        
        when(userMapper.toResponse(any(User.class))).thenReturn(expectedResponse);

        // Act
        UserResponse actualResponse = userService.register(request);

        // Assert
        assertThat(actualResponse).isNotNull();
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void register_ShouldThrowException_WhenUsernameAlreadyExists() {
        // Arrange
        RegisterUserRequest request = mock(RegisterUserRequest.class);
        when(request.username()).thenReturn("juanp");

        when(userRepository.existsByUsername("juanp")).thenReturn(true);

        // Act & Assert
        assertThatThrownBy(() -> userService.register(request))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("Username already exists");
        
        verify(userRepository, never()).save(any());
    }

    @Test
    void register_ShouldThrowException_WhenBirthDateIsInFuture() {
        // Arrange
        RegisterUserRequest request = mock(RegisterUserRequest.class);
        when(request.username()).thenReturn("juanp");
        when(request.email()).thenReturn("juan@test.com");
        when(request.birthDate()).thenReturn(LocalDate.now().plusDays(5));

        when(userRepository.existsByUsername("juanp")).thenReturn(false);
        when(userRepository.existsByEmailIgnoreCase("juan@test.com")).thenReturn(false);

        // Act & Assert
        assertThatThrownBy(() -> userService.register(request))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("Birth date cannot be in the future");
        
        verify(userRepository, never()).save(any());
    }
}