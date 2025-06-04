const express = require('express');
const {
  createPayment,
  getPaymentByRegistration,
  processRefund,
  getPaymentsByEvent
} = require('../controllers/paymentController');

const router = express.Router();

// Create payment for registration
router.post('/', createPayment);                                    // POST /payments

// Get payment details
router.get('/registration/:registrationId', getPaymentByRegistration); // GET /payments/registration/123
router.get('/event/:eventId', getPaymentsByEvent);                    // GET /payments/event/456

// Process refund
router.post('/registration/:registrationId/refund', processRefund);   // POST /payments/registration/123/refund

module.exports = router;
