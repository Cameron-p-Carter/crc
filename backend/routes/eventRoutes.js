const express = require('express');
const {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  searchEvents
} = require('../controllers/eventController');

const router = express.Router();

// Search events (should be before /:id to avoid conflict)
router.get('/search', searchEvents);    // GET /events/search?category=CONFERENCE&location=Sydney...

// CRUD operations
router.get('/', getAllEvents);          // GET /events
router.get('/:id', getEventById);       // GET /events/:id
router.post('/', createEvent);          // POST /events
router.put('/:id', updateEvent);        // PUT /events/:id
router.delete('/:id', deleteEvent);     // DELETE /events/:id

module.exports = router;
