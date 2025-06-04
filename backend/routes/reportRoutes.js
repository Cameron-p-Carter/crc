const express = require('express');
const {
  createReport,
  getEventReports,
  getOrganizerReports,
  generateAttendanceReport,
  generateSalesReport
} = require('../controllers/reportController');

const router = express.Router();

// Basic report operations
router.post('/', createReport);                          // POST /reports

// Get reports by event or organizer
router.get('/event/:eventId', getEventReports);          // GET /reports/event/123
router.get('/organizer/:organizerId', getOrganizerReports); // GET /reports/organizer/456

// Generate specific reports
router.post('/event/:eventId/attendance', generateAttendanceReport); // POST /reports/event/123/attendance
router.post('/event/:eventId/sales', generateSalesReport);          // POST /reports/event/123/sales

module.exports = router;
