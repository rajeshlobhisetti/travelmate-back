const express = require('express');
const { ensureAdmin } = require('../middleware/auth');
const {
  adminLogin,
  adminMe,
  createTrip,
  listTrips,
  listBookingsForTrip,
  listAllBookings
} = require('../controllers/adminController');

const router = express.Router();

// Public admin login route
router.post('/login', adminLogin);

// Check current admin session
router.get('/me', ensureAdmin, adminMe);

// Admin-only trip management
router.post('/trips', ensureAdmin, createTrip);
router.get('/trips', ensureAdmin, listTrips);
router.get('/trips/:id/bookings', ensureAdmin, listBookingsForTrip);
router.get('/bookings', ensureAdmin, listAllBookings);

module.exports = router;
