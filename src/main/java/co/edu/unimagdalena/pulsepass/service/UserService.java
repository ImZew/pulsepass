package co.edu.unimagdalena.pulsepass.service;

import co.edu.unimagdalena.pulsepass.dto.request.RegisterUserRequest;
import co.edu.unimagdalena.pulsepass.dto.response.UserResponse;

public interface UserService {
    UserResponse register(RegisterUserRequest request);
    UserResponse findByEmail(String email);
    UserResponse findByUsername(String username);
}