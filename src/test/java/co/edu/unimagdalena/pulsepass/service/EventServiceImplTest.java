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
import co.edu.unimagdalena.pulsepass.domain.EventStatus;
import co.edu.unimagdalena.pulsepass.domain.Venue;
import co.edu.unimagdalena.pulsepass.dto.request.CreateEventRequest;
import co.edu.unimagdalena.pulsepass.dto.response.EventResponse;
import co.edu.unimagdalena.pulsepass.exception.BusinessRuleException;
import co.edu.unimagdalena.pulsepass.exception.DuplicateResourceException;
import co.edu.unimagdalena.pulsepass.mapper.EventMapper;
import co.edu.unimagdalena.pulsepass.repository.ArtistRepository;
import co.edu.unimagdalena.pulsepass.repository.EventRepository;
import co.edu.unimagdalena.pulsepass.repository.VenueRepository;
import co.edu.unimagdalena.pulsepass.service.impl.EventServiceImpl;

@ExtendWith(MockitoExtension.class)
class EventServiceImplTest {

    @Mock
    private EventRepository eventRepository;
    @Mock
    private VenueRepository venueRepository;
    @Mock
    private ArtistRepository artistRepository;
    @Mock
    private EventMapper eventMapper;

    @InjectMocks
    private EventServiceImpl eventService;

    @Test
    void create_ShouldReturnEventResponse_WhenDataIsValid() {
        // Arrange
        CreateEventRequest request = mock(CreateEventRequest.class);
        when(request.eventCode()).thenReturn("EVT001");
        when(request.venueCode()).thenReturn("V001");
        when(request.eventDate()).thenReturn(LocalDateTime.now().plusDays(10));
        when(request.minimumAge()).thenReturn(18);

        Venue venue = new Venue();
        venue.setActive(true);

        Event savedEvent = new Event();
        savedEvent.setEventCode("EVT001");
        savedEvent.setStatus(EventStatus.DRAFT);

        EventResponse expectedResponse = mock(EventResponse.class);

        when(eventRepository.existsByEventCode("EVT001")).thenReturn(false);
        when(venueRepository.findByCode("V001")).thenReturn(Optional.of(venue));
        when(eventRepository.save(any(Event.class))).thenReturn(savedEvent);
        when(eventMapper.toResponse(any(Event.class))).thenReturn(expectedResponse);

        // Act
        EventResponse actualResponse = eventService.create(request);

        // Assert
        assertThat(actualResponse).isNotNull();
        verify(eventRepository, times(1)).save(any(Event.class));
    }

    @Test
    void create_ShouldThrowException_WhenEventCodeAlreadyExists() {
        // Arrange
        CreateEventRequest request = mock(CreateEventRequest.class);
        when(request.eventCode()).thenReturn("EVT001");

        when(eventRepository.existsByEventCode("EVT001")).thenReturn(true);

        // Act & Assert
        assertThatThrownBy(() -> eventService.create(request))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("Event code already exists");

        verify(eventRepository, never()).save(any());
    }

    @Test
    void publish_ShouldThrowException_WhenVenueIsInactive() {
        // Arrange
        String eventCode = "EVT001";
        Event event = new Event();
        event.setStatus(EventStatus.DRAFT);
        event.setEventDate(LocalDateTime.now().plusDays(5));
        
        Venue venue = new Venue();
        venue.setActive(false); 
        event.setVenue(venue);

        when(eventRepository.findByEventCode(eventCode)).thenReturn(Optional.of(event));

        // Act & Assert
        assertThatThrownBy(() -> eventService.publish(eventCode))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("venue is currently inactive");

        verify(eventRepository, never()).save(any());
    }
}