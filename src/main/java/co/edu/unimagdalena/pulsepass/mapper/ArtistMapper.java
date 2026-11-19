package co.edu.unimagdalena.pulsepass.mapper;

import org.mapstruct.Mapper;

import co.edu.unimagdalena.pulsepass.domain.Artist;
import co.edu.unimagdalena.pulsepass.dto.response.ArtistResponse;

@Mapper(componentModel = "spring")
public interface ArtistMapper {
    ArtistResponse toResponse(Artist artist);
}