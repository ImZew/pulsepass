-- V3__add_streaming_url_to_event.sql

ALTER TABLE events 
ADD COLUMN streaming_url VARCHAR(500);