const express = require('express');
const { listMyBookings, createBooking, cancelBooking } = require('../controllers/bookingController');
const { ensureAuthenticated } = require('../middleware/auth');

const router = express.Router();

router.get('/', ensureAuthenticated, listMyBookings);
router.post('/', ensureAuthenticated, createBooking);
router.delete('/:id', ensureAuthenticated, cancelBooking);

module.exports = router;
