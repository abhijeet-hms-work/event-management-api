const pool = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

class EventService {
    // Create a new event
    async createEvent(eventData) {
        const { title, date_time, location, capacity } = eventData;
        
        try {
            const result = await pool.query(
                `INSERT INTO events (title, date_time, location, capacity) 
                 VALUES ($1, $2, $3, $4) 
                 RETURNING id, title, date_time, location, capacity, created_at`,
                [title, date_time, location, capacity]
            );

            return result.rows[0];
        } catch (error) {
            console.error('Error creating event:', error);
            throw new AppError('Failed to create event', 500);
        }
    }

    // Get event details with registered users
    async getEventById(eventId) {
        const client = await pool.connect();
        
        try {
            // Get event details
            const eventResult = await client.query(
                'SELECT * FROM events WHERE id = $1',
                [eventId]
            );

            if (eventResult.rows.length === 0) {
                throw new AppError('Event not found', 404);
            }

            const event = eventResult.rows[0];

            // Get registered users
            const usersResult = await client.query(
                `SELECT u.id, u.name, u.email, er.registered_at 
                 FROM users u 
                 INNER JOIN event_registrations er ON u.id = er.user_id 
                 WHERE er.event_id = $1 
                 ORDER BY er.registered_at`,
                [eventId]
            );

            return {
                ...event,
                registrations: usersResult.rows,
                registered_count: usersResult.rows.length
            };
        } finally {
            client.release();
        }
    }

    // Register user for event with concurrency handling
    async registerUserForEvent(userId, eventId) {
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');

            // Lock the event row to prevent race conditions
            const eventResult = await client.query(
                'SELECT * FROM events WHERE id = $1 FOR UPDATE',
                [eventId]
            );

            if (eventResult.rows.length === 0) {
                throw new AppError('Event not found', 404);
            }

            const event = eventResult.rows[0];

            // Check if event is in the past
            const eventDate = new Date(event.date_time);
            const now = new Date();
            if (eventDate < now) {
                throw new AppError('Cannot register for past events', 400);
            }

            // Check current registration count
            const countResult = await client.query(
                'SELECT COUNT(*) as count FROM event_registrations WHERE event_id = $1',
                [eventId]
            );

            const currentRegistrations = parseInt(countResult.rows[0].count);

            if (currentRegistrations >= event.capacity) {
                throw new AppError('Event is full', 400);
            }

            // Check if user exists
            const userResult = await client.query(
                'SELECT * FROM users WHERE id = $1',
                [userId]
            );

            if (userResult.rows.length === 0) {
                throw new AppError('User not found', 404);
            }

            // Check for duplicate registration
            const existingRegistration = await client.query(
                'SELECT * FROM event_registrations WHERE user_id = $1 AND event_id = $2',
                [userId, eventId]
            );

            if (existingRegistration.rows.length > 0) {
                throw new AppError('User already registered for this event', 400);
            }

            // Register user
            await client.query(
                'INSERT INTO event_registrations (user_id, event_id) VALUES ($1, $2)',
                [userId, eventId]
            );

            await client.query('COMMIT');

            return {
                message: 'Successfully registered for event',
                user_id: userId,
                event_id: eventId
            };
        } catch (error) {
            await client.query('ROLLBACK');
            
            if (error instanceof AppError) {
                throw error;
            }
            
            console.error('Error registering user:', error);
            throw new AppError('Failed to register for event', 500);
        } finally {
            client.release();
        }
    }

    // Cancel registration
    async cancelRegistration(userId, eventId) {
        try {
            const result = await pool.query(
                'DELETE FROM event_registrations WHERE user_id = $1 AND event_id = $2 RETURNING *',
                [userId, eventId]
            );

            if (result.rows.length === 0) {
                throw new AppError('Registration not found', 404);
            }

            return {
                message: 'Registration cancelled successfully',
                user_id: userId,
                event_id: eventId
            };
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            console.error('Error cancelling registration:', error);
            throw new AppError('Failed to cancel registration', 500);
        }
    }

    // Get upcoming events with custom sorting
    async getUpcomingEvents() {
        try {
            const now = new Date().toISOString();
            
            const result = await pool.query(
                `SELECT e.*, 
                        COUNT(er.user_id) as registered_count
                 FROM events e
                 LEFT JOIN event_registrations er ON e.id = er.event_id
                 WHERE e.date_time > $1
                 GROUP BY e.id
                 ORDER BY e.date_time ASC, e.location ASC`,
                [now]
            );

            return result.rows;
        } catch (error) {
            console.error('Error fetching upcoming events:', error);
            throw new AppError('Failed to fetch upcoming events', 500);
        }
    }

    // Get event statistics
    async getEventStats(eventId) {
        try {
            const result = await pool.query(
                `SELECT 
                    e.capacity,
                    COUNT(er.user_id) as total_registrations,
                    e.capacity - COUNT(er.user_id) as remaining_capacity,
                    CASE 
                        WHEN e.capacity > 0 THEN ROUND((COUNT(er.user_id)::numeric / e.capacity::numeric * 100), 2)
                        ELSE 0
                    END as capacity_percentage
                 FROM events e
                 LEFT JOIN event_registrations er ON e.id = er.event_id
                 WHERE e.id = $1
                 GROUP BY e.id, e.capacity`,
                [eventId]
            );

            if (result.rows.length === 0) {
                throw new AppError('Event not found', 404);
            }

            return {
                event_id: parseInt(eventId),
                total_registrations: parseInt(result.rows[0].total_registrations),
                remaining_capacity: parseInt(result.rows[0].remaining_capacity),
                capacity_percentage: parseFloat(result.rows[0].capacity_percentage)
            };
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            console.error('Error fetching event stats:', error);
            throw new AppError('Failed to fetch event statistics', 500);
        }
    }
}

module.exports = new EventService();
