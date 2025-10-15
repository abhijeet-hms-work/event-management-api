const { AppError } = require('./errorHandler');

const validateEvent = (req, res, next) => {
    const { title, date_time, location, capacity } = req.body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
        return next(new AppError('Event title is required and must be a valid string', 400));
    }

    if (!date_time) {
        return next(new AppError('Event date and time is required', 400));
    }

    const eventDate = new Date(date_time);
    if (isNaN(eventDate.getTime())) {
        return next(new AppError('Invalid date format. Use ISO 8601 format', 400));
    }

    if (!location || typeof location !== 'string' || location.trim().length === 0) {
        return next(new AppError('Event location is required and must be a valid string', 400));
    }

    if (!capacity || typeof capacity !== 'number') {
        return next(new AppError('Capacity is required and must be a number', 400));
    }

    if (capacity <= 0 || capacity > 1000) {
        return next(new AppError('Capacity must be between 1 and 1000', 400));
    }

    if (!Number.isInteger(capacity)) {
        return next(new AppError('Capacity must be an integer', 400));
    }

    next();
};

const validateUser = (req, res, next) => {
    const { name, email } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return next(new AppError('User name is required and must be a valid string', 400));
    }

    if (!email || typeof email !== 'string') {
        return next(new AppError('User email is required', 400));
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return next(new AppError('Invalid email format', 400));
    }

    next();
};

const validateRegistration = (req, res, next) => {
    const { user_id } = req.body;
    const { eventId } = req.params;

    if (!user_id || !Number.isInteger(Number(user_id))) {
        return next(new AppError('Valid user_id is required', 400));
    }

    if (!eventId || !Number.isInteger(Number(eventId))) {
        return next(new AppError('Valid event_id is required', 400));
    }

    next();
};

module.exports = {
    validateEvent,
    validateUser,
    validateRegistration
};
