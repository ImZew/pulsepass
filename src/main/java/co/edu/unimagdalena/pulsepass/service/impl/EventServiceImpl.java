package co.edu.unimagdalena.pulsepass.service.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import co.edu.unimagdalena.pulsepass.domain.Artist;
import co.edu.unimagdalena.pulsepass.domain.Event;
import co.edu.unimagdalena.pulsepass.domain.EventStatus;
import co.edu.unimagdalena.pulsepass.domain.Venue;
import co.edu.unimagdalena.pulsepass.dto.request.CreateEventRequest;
import co.edu.unimagdalena.pulsepass.dto.response.EventResponse;
import co.edu.unimagdalena.pulsepass.dto.response.EventSummaryResponse;
import co.edu.unimagdalena.pulsepass.exception.BusinessRuleException;
import co.edu.unimagdalena.pulsepass.exception.DuplicateResourceException;
import co.edu.unimagdalena.pulsepass.exception.ResourceNotFoundException;
import co.edu.unimagdalena.pulsepass.mapper.EventMapper;
import co.edu.unimagdalena.pulsepass.repository.ArtistRepository;
import co.edu.unimagdalena.pulsepass.repository.EventRepository;
import co.edu.unimagdalena.pulsepass.repository.VenueRepository;
import co.edu.unimagdalena.pulsepass.service.EventService;

@Service
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;
    private final VenueRepository venueRepository;
    private final ArtistRepository artistRepository;
    private final EventMapper eventMapper;

    public EventServiceImpl(EventRepository eventRepository, VenueRepository venueRepository, 
                            ArtistRepository artistRepository, EventMapper eventMapper) {
        this.eventRepository = eventRepository;
        this.venueRepository = venueRepository;
        this.artistRepository = artistRepository;
        this.eventMapper = eventMapper;
    }

    @Override
    @Transactional
    public EventResponse create(CreateEventRequest request) {
        if (eventRepository.existsByEventCode(request.eventCode())) {
            throw new DuplicateResourceException("Event code already exists: " + request.eventCode());
        }

        Venue venue = venueRepository.findByCode(request.venueCode())
                .orElseThrow(() -> new ResourceNotFoundException("Venue not found: " + request.venueCode()));

        if (!venue.getActive()) {
            throw new BusinessRuleException("Cannot create event in an inactive venue");
        }

        if (request.eventDate() == null || request.eventDate().isBefore(LocalDateTime.now())) {
            throw new BusinessRuleException("Event date must be in the future");
        }

        if (request.minimumAge() != null && request.minimumAge() < 0) {
            throw new BusinessRuleException("Minimum age cannot be negative");
        }

        Event event = new Event();
        event.setEventCode(request.eventCode());
        event.setName(request.name());
        event.setDescription(request.description());
        event.setCategory(request.category());
        event.setEventDate(request.eventDate());
        event.setMinimumAge(request.minimumAge() != null ? request.minimumAge() : 0);
        event.setVenue(venue);
        event.setStatus(EventStatus.DRAFT); // BR-EVENT-005: Todo evento nuevo inicia en DRAFT

        Event savedEvent = eventRepository.save(event);
        return eventMapper.toResponse(savedEvent);
    }

    @Override
    @Transactional(readOnly = true)
    public EventResponse findByCode(String eventCode) {
        return eventRepository.findByEventCode(eventCode)
                .map(eventMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found: " + eventCode));
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventSummaryResponse> findPublishedEvents() {
        return eventRepository.findByStatusOrderByEventDateAsc(EventStatus.PUBLISHED)
                .stream()
                .map(eventMapper::toSummary)
                .toList();
    }

    @Override
    @Transactional
    public EventResponse publish(String eventCode) {
        Event event = eventRepository.findByEventCode(eventCode)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found: " + eventCode));

        if (event.getStatus() != EventStatus.DRAFT) {
            throw new BusinessRuleException("Only DRAFT events can be published");
        }

        if (event.getEventDate().isBefore(LocalDateTime.now())) {
            throw new BusinessRuleException("Cannot publish an event with a past date");
        }

        if (!event.getVenue().getActive()) {
            throw new BusinessRuleException("Cannot publish event, venue is currently inactive");
        }

        event.setStatus(EventStatus.PUBLISHED);
        Event savedEvent = eventRepository.save(event);
        return eventMapper.toResponse(savedEvent);
    }

    @Override
    @Transactional
    public EventResponse addArtist(String eventCode, Long artistId) {
        Event event = eventRepository.findByEventCode(eventCode)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found: " + eventCode));

        if (event.getStatus() == EventStatus.CANCELLED || event.getStatus() == EventStatus.FINISHED) {
            throw new BusinessRuleException("Cannot add artists to cancelled or finished events");
        }

        Artist artist = artistRepository.findById(artistId)
                .orElseThrow(() -> new ResourceNotFoundException("Artist not found: " + artistId));

        if (event.getArtists().contains(artist)) {
            throw new BusinessRuleException("Artist is already associated with this event");
        }

        event.getArtists().add(artist);
        Event savedEvent = eventRepository.save(event);
        return eventMapper.toResponse(savedEvent);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventSummaryResponse> findByArtist(String stageName) {
        return eventRepository.findByArtistsStageNameIgnoreCase(stageName)
                .stream()
                .map(eventMapper::toSummary)
                .toList();
    }
}