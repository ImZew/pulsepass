package co.edu.unimagdalena.pulsepass.mapper;

import org.mapstruct.Mapper;

import co.edu.unimagdalena.pulsepass.domain.User;
import co.edu.unimagdalena.pulsepass.dto.response.UserResponse;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserResponse toResponse(User user);
}