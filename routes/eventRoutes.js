const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { validateEvent, validateRegistration } = require('../middleware/validation');

// Event routes
router.post('/', validateEvent, eventController.createEvent);
router.get('/upcoming', eventController.getUpcomingEvents);
router.get('/:eventId', eventController.getEventDetails);
router.get('/:eventId/stats', eventController.getEventStats);
router.post('/:eventId/register', validateRegistration, eventController.registerForEvent);
router.delete('/:eventId/register', validateRegistration, eventController.cancelRegistration);

module.exports = router;
