package co.edu.unimagdalena.pulsepass.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import co.edu.unimagdalena.pulsepass.domain.Ticket;
import co.edu.unimagdalena.pulsepass.dto.response.TicketResponse;

@Mapper(componentModel = "spring")
public interface TicketMapper {
    
    @Mapping(target = "userEmail", source = "user.email")
    @Mapping(target = "eventCode", source = "event.eventCode")
    @Mapping(target = "eventName", source = "event.name")
    TicketResponse toResponse(Ticket ticket);
}