package co.edu.unimagdalena.pulsepass.service;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import co.edu.unimagdalena.pulsepass.domain.Venue;
import co.edu.unimagdalena.pulsepass.dto.response.VenueResponse;
import co.edu.unimagdalena.pulsepass.exception.ResourceNotFoundException;
import co.edu.unimagdalena.pulsepass.mapper.VenueMapper;
import co.edu.unimagdalena.pulsepass.repository.VenueRepository;
import co.edu.unimagdalena.pulsepass.service.impl.VenueServiceImpl;

@ExtendWith(MockitoExtension.class)
class VenueServiceImplTest {

    @Mock
    private VenueRepository venueRepository;

    @Mock
    private VenueMapper venueMapper;

    @InjectMocks
    private VenueServiceImpl venueService;

    @Test
    void findByCode_ShouldReturnVenueResponse_WhenVenueExists() {
        // Arrange
        String venueCode = "V001";
        Venue venue = new Venue();
        venue.setCode(venueCode);
        venue.setName("Estadio Metropolitano");

        VenueResponse expectedResponse = new VenueResponse(venueCode, "Estadio Metropolitano", "Barranquilla", 45000, true);

        when(venueRepository.findByCode(venueCode)).thenReturn(Optional.of(venue));
        when(venueMapper.toResponse(venue)).thenReturn(expectedResponse);

        // Act
        VenueResponse actualResponse = venueService.findByCode(venueCode);

        // Assert
        assertThat(actualResponse).isNotNull();
        assertThat(actualResponse.code()).isEqualTo(venueCode);
        verify(venueRepository, times(1)).findByCode(venueCode);
    }

    @Test
    void findByCode_ShouldThrowException_WhenVenueDoesNotExist() {
        // Arrange
        String venueCode = "INVALID";
        when(venueRepository.findByCode(venueCode)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> venueService.findByCode(venueCode))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Venue not found");
        
        verify(venueMapper, never()).toResponse(any());
    }
}