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

import co.edu.unimagdalena.pulsepass.domain.Artist;
import co.edu.unimagdalena.pulsepass.dto.response.ArtistResponse;
import co.edu.unimagdalena.pulsepass.exception.ResourceNotFoundException;
import co.edu.unimagdalena.pulsepass.mapper.ArtistMapper;
import co.edu.unimagdalena.pulsepass.repository.ArtistRepository;
import co.edu.unimagdalena.pulsepass.service.impl.ArtistServiceImpl;

@ExtendWith(MockitoExtension.class)
class ArtistServiceImplTest {

    @Mock
    private ArtistRepository artistRepository;

    @Mock
    private ArtistMapper artistMapper;

    @InjectMocks
    private ArtistServiceImpl artistService;

    @Test
    void findById_ShouldReturnArtistResponse_WhenArtistExists() {
        // Arrange
        Long artistId = 1L;
        Artist artist = new Artist();
        artist.setId(artistId);
        artist.setStageName("Shakira");

        ArtistResponse expectedResponse = new ArtistResponse(artistId, "Shakira", true);

        when(artistRepository.findById(artistId)).thenReturn(Optional.of(artist));
        when(artistMapper.toResponse(artist)).thenReturn(expectedResponse);

        // Act
        ArtistResponse actualResponse = artistService.findById(artistId);

        // Assert
        assertThat(actualResponse).isNotNull();
        assertThat(actualResponse.stageName()).isEqualTo("Shakira");
        verify(artistRepository, times(1)).findById(artistId);
    }

    @Test
    void findById_ShouldThrowException_WhenArtistDoesNotExist() {
        // Arrange
        Long artistId = 99L;
        when(artistRepository.findById(artistId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> artistService.findById(artistId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Artist not found");
        
        verify(artistMapper, never()).toResponse(any());
    }
}