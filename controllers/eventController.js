const eventService = require('../services/eventService');

class EventController {
    async createEvent(req, res, next) {
        try {
            const event = await eventService.createEvent(req.body);
            
            res.status(201).json({
                status: 'success',
                message: 'Event created successfully',
                data: {
                    event_id: event.id,
                    event
                }
            });
        } catch (error) {
            next(error);
        }
    }

    async getEventDetails(req, res, next) {
        try {
            const { eventId } = req.params;
            const event = await eventService.getEventById(eventId);
            
            res.status(200).json({
                status: 'success',
                data: { event }
            });
        } catch (error) {
            next(error);
        }
    }

    async registerForEvent(req, res, next) {
        try {
            const { eventId } = req.params;
            const { user_id } = req.body;
            
            const result = await eventService.registerUserForEvent(user_id, eventId);
            
            res.status(200).json({
                status: 'success',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async cancelRegistration(req, res, next) {
        try {
            const { eventId } = req.params;
            const { user_id } = req.body;
            
            const result = await eventService.cancelRegistration(user_id, eventId);
            
            res.status(200).json({
                status: 'success',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async getUpcomingEvents(req, res, next) {
        try {
            const events = await eventService.getUpcomingEvents();
            
            res.status(200).json({
                status: 'success',
                count: events.length,
                data: { events }
            });
        } catch (error) {
            next(error);
        }
    }

    async getEventStats(req, res, next) {
        try {
            const { eventId } = req.params;
            const stats = await eventService.getEventStats(eventId);
            
            res.status(200).json({
                status: 'success',
                data: { stats }
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new EventController();
