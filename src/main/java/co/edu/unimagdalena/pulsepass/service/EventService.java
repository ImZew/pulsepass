package co.edu.unimagdalena.pulsepass.service;

import java.util.List;

import co.edu.unimagdalena.pulsepass.dto.request.CreateEventRequest;
import co.edu.unimagdalena.pulsepass.dto.response.EventResponse;
import co.edu.unimagdalena.pulsepass.dto.response.EventSummaryResponse;

public interface EventService {
    EventResponse create(CreateEventRequest request);
    EventResponse findByCode(String eventCode);
    List<EventSummaryResponse> findPublishedEvents();
    EventResponse publish(String eventCode);
    EventResponse addArtist(String eventCode, Long artistId);
    List<EventSummaryResponse> findByArtist(String stageName);
}