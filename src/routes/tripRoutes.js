const express = require('express');
const { listTrips, getTrip, createTrip, updateTrip, deleteTrip } = require('../controllers/tripController');
const { ensureAuthenticated, ensureAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', listTrips);
router.get('/:id', getTrip);
router.post('/', ensureAuthenticated, ensureAdmin, createTrip);
router.put('/:id', ensureAuthenticated, ensureAdmin, updateTrip);
router.delete('/:id', ensureAuthenticated, ensureAdmin, deleteTrip);

module.exports = router;
