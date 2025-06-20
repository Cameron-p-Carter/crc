const express = require('express');
const {
  createRegistration,
  getRegistrationById,
  getRegistrationsByEvent,
  getRegistrationsByUser,
  updateRegistrationStatus,
  cancelRegistration
} = require('../controllers/registrationController');

const router = express.Router();

// Create new registration
router.post('/', createRegistration);                    // POST /registrations

// Get registrations by event or user
router.get('/event/:eventId', getRegistrationsByEvent); // GET /registrations/event/123
router.get('/user/:userId', getRegistrationsByUser);    // GET /registrations/user/456

// Get registration by ID (must come after other GET routes)
router.get('/:id', getRegistrationById);                // GET /registrations/123

// Update registration status
router.put('/:id/status', updateRegistrationStatus);    // PUT /registrations/789/status

// Cancel registration
router.post('/:id/cancel', cancelRegistration);         // POST /registrations/789/cancel

module.exports = router;
