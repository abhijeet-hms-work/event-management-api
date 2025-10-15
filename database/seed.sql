-- Sample users
INSERT INTO users (name, email) VALUES
('Alice Johnson', 'alice@example.com'),
('Bob Smith', 'bob@example.com'),
('Charlie Brown', 'charlie@example.com'),
('Diana Prince', 'diana@example.com'),
('Eve Williams', 'eve@example.com');

-- Sample events
INSERT INTO events (title, date_time, location, capacity) VALUES
('Tech Conference 2025', '2025-12-15 09:00:00', 'Mumbai Convention Center', 500),
('Startup Meetup', '2025-11-20 18:00:00', 'Bangalore Tech Park', 150),
('AI Workshop', '2025-12-01 10:00:00', 'Delhi Innovation Hub', 100),
('Web Dev Bootcamp', '2026-01-10 09:00:00', 'Pune IT Center', 200),
('Product Launch', '2025-11-25 15:00:00', 'Hyderabad Convention', 300);

-- Sample registrations
INSERT INTO event_registrations (user_id, event_id) VALUES
(1, 1),
(2, 1),
(3, 1),
(1, 2),
(4, 2),
(5, 3);
