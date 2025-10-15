-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create events table
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    date_time TIMESTAMP NOT NULL,
    location VARCHAR(255) NOT NULL,
    capacity INTEGER NOT NULL CHECK (capacity > 0 AND capacity <= 1000),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create junction table for many-to-many relationship
CREATE TABLE event_registrations (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, event_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_events_date_time ON events(date_time);
CREATE INDEX idx_events_location ON events(location);
CREATE INDEX idx_event_registrations_event_id ON event_registrations(event_id);
CREATE INDEX idx_event_registrations_user_id ON event_registrations(user_id);
