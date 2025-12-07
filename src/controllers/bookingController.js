const prisma = require('../prisma');
const Joi = require('joi');

const bookingSchema = Joi.object({
  tripId: Joi.string().required(),
  quantity: Joi.number().integer().min(1).max(20).default(1),
  guests: Joi.array().items(
    Joi.object({
      name: Joi.string().min(1).required(),
      age: Joi.number().integer().min(0).optional(),
      gender: Joi.string().valid('M','F','O').optional()
    })
  ).optional(),
  contactPhone: Joi.string().trim().min(7).max(20).required()
});

async function listMyBookings(req, res) {
  try {
    const user = req.session && req.session.user ? req.session.user : null;
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    // If admin hits this endpoint, block (admins should use /api/admin/bookings)
    if (user.role === 'ADMIN') return res.status(403).json({ message: 'Admins cannot fetch personal bookings' });
    const userId = user.id;
    // Validate ObjectId-like string to avoid Prisma/Mongo error when id is not a valid ObjectId
    const isValidObjectId = typeof userId === 'string' && /^[a-fA-F0-9]{24}$/.test(userId);
    if (!isValidObjectId) return res.json({ bookings: [] });
    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: { trip: true },
      orderBy: { createdAt: 'desc' }
    });
    return res.json({ bookings });
  } catch (err) {
    console.error('listMyBookings error:', err);
    return res.status(500).json({ message: 'Failed to fetch bookings' });
  }
}

async function createBooking(req, res) {
  const { value, error } = bookingSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });

  try {
    const booking = await prisma.$transaction(async (tx) => {
      const trip = await tx.trip.findUnique({ where: { id: value.tripId } });
      if (!trip) throw new Error('NOT_FOUND');
      const qty = value.quantity || 1;
      if (trip.seatsAvailable < qty) throw new Error('NO_SEATS');

      await tx.trip.update({
        where: { id: trip.id },
        data: { seatsAvailable: { decrement: qty } }
      });

      const b = await tx.booking.create({
        data: { userId: req.session.user.id, tripId: trip.id, status: 'CONFIRMED', quantity: qty, guests: value.guests || null, contactPhone: value.contactPhone },
        include: { trip: true }
      });
      return b;
    });

    return res.status(201).json({ booking });
  } catch (e) {
    if (e.message === 'NOT_FOUND') return res.status(404).json({ message: 'Trip not found' });
    if (e.message === 'NO_SEATS') return res.status(400).json({ message: 'Not enough seats available' });
    return res.status(500).json({ message: 'Booking failed' });
  }
}

async function cancelBooking(req, res) {
  const { id } = req.params;
  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) return res.status(404).json({ message: 'Booking not found' });
  if (booking.userId !== req.session.user.id && req.session.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  await prisma.$transaction(async (tx) => {
    await tx.booking.delete({ where: { id } });
    await tx.trip.update({
      where: { id: booking.tripId },
      data: { seatsAvailable: { increment: booking.quantity || 1 } }
    });
  });
  res.json({ message: 'Booking cancelled' });
}

module.exports = { listMyBookings, createBooking, cancelBooking };

