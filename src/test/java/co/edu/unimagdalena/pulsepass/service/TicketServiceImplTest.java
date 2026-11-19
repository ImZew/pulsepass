package co.edu.unimagdalena.pulsepass.service;

import java.time.LocalDateTime;
import java.util.Optional;

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

import co.edu.unimagdalena.pulsepass.domain.Event;
import co.edu.unimagdalena.pulsepass.domain.Ticket;
import co.edu.unimagdalena.pulsepass.domain.TicketStatus;
import co.edu.unimagdalena.pulsepass.domain.TicketType;
import co.edu.unimagdalena.pulsepass.domain.User;
import co.edu.unimagdalena.pulsepass.dto.request.PurchaseTicketRequest;
import co.edu.unimagdalena.pulsepass.dto.response.TicketResponse;
import co.edu.unimagdalena.pulsepass.exception.BusinessRuleException;
import co.edu.unimagdalena.pulsepass.mapper.TicketMapper;
import co.edu.unimagdalena.pulsepass.repository.EventRepository;
import co.edu.unimagdalena.pulsepass.repository.TicketRepository;
import co.edu.unimagdalena.pulsepass.repository.UserRepository;
import co.edu.unimagdalena.pulsepass.service.impl.TicketServiceImpl;

@ExtendWith(MockitoExtension.class)
class TicketServiceImplTest {

    @Mock
    private TicketRepository ticketRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private EventRepository eventRepository;
    @Mock
    private TicketMapper ticketMapper;

    @InjectMocks
    private TicketServiceImpl ticketService;

    @Test
    void purchase_ShouldReturnTicketResponse_WhenDataIsValid() {
        // Arrange
        PurchaseTicketRequest request = mock(PurchaseTicketRequest.class);
        when(request.userEmail()).thenReturn("test@test.com");
        when(request.eventCode()).thenReturn("EVT001");
        when(request.type()).thenReturn(TicketType.VIP);

        User user = new User();
        Event event = new Event();
        event.setEventDate(LocalDateTime.now().plusDays(5)); // Fecha válida en el futuro

        Ticket savedTicket = new Ticket();
        savedTicket.setTicketCode("TK123456");

        TicketResponse expectedResponse = mock(TicketResponse.class);

        when(userRepository.findByEmailIgnoreCase("test@test.com")).thenReturn(Optional.of(user));
        when(eventRepository.findByEventCode("EVT001")).thenReturn(Optional.of(event));
        when(ticketRepository.save(any(Ticket.class))).thenReturn(savedTicket);
        when(ticketMapper.toResponse(any(Ticket.class))).thenReturn(expectedResponse);

        // Act
        TicketResponse actualResponse = ticketService.purchase(request);

        // Assert
        assertThat(actualResponse).isNotNull();
        verify(ticketRepository, times(1)).save(any(Ticket.class));
    }

    @Test
    void purchase_ShouldThrowException_WhenEventIsInThePast() {
        // Arrange
        PurchaseTicketRequest request = mock(PurchaseTicketRequest.class);
        when(request.userEmail()).thenReturn("test@test.com");
        when(request.eventCode()).thenReturn("EVT001");

        User user = new User();
        Event event = new Event();
        event.setEventDate(LocalDateTime.now().minusDays(1)); // Evento en el pasado

        when(userRepository.findByEmailIgnoreCase("test@test.com")).thenReturn(Optional.of(user));
        when(eventRepository.findByEventCode("EVT001")).thenReturn(Optional.of(event));

        // Act & Assert
        assertThatThrownBy(() -> ticketService.purchase(request))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("Cannot purchase tickets for past events");

        verify(ticketRepository, never()).save(any());
    }

    @Test
    void cancel_ShouldThrowException_WhenTicketIsAlreadyUsed() {
        // Arrange
        String ticketCode = "TK123456";
        Ticket ticket = new Ticket();
        ticket.setStatus(TicketStatus.USED);

        when(ticketRepository.findByTicketCode(ticketCode)).thenReturn(Optional.of(ticket));

        // Act & Assert
        assertThatThrownBy(() -> ticketService.cancel(ticketCode))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("Cannot cancel an already used ticket");

        verify(ticketRepository, never()).save(any());
    }
}