const prisma = require('../prisma');
const Joi = require('joi');

const ADMIN_EMAIL = 'rajeshlobhisetti@gmail.com';
const ADMIN_PASSWORD = 'Rajesh@2004';

const tripSchema = Joi.object({
  title: Joi.string().min(3).required(),
  description: Joi.string().min(10).required(),
  location: Joi.string().required(),
  price: Joi.number().min(0).required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().required(),
  seatsAvailable: Joi.number().integer().min(0).required(),
  imageUrl: Joi.string().uri().optional().allow(''),
  noOfDays: Joi.number().integer().min(1).optional()
});

async function adminLogin(req, res) {
  const { email, password } = req.body || {};
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const adminUser = { id: 'admin', name: 'Admin', email: ADMIN_EMAIL, role: 'ADMIN' };
    req.session.user = adminUser;
    return res.json({ user: adminUser });
  }
  return res.status(401).json({ message: 'Invalid admin credentials' });
}

async function adminMe(req, res) {
  if (req.session?.user?.role === 'ADMIN') return res.json({ user: req.session.user });
  return res.status(401).json({ user: null });
}

async function createTrip(req, res) {
  const { value, error } = tripSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });
  if (new Date(value.endDate) < new Date(value.startDate)) {
    return res.status(400).json({ message: 'endDate must be after startDate' });
  }
  const trip = await prisma.trip.create({ data: value });
  res.status(201).json({ trip });
}

async function listTrips(req, res) {
  const trips = await prisma.trip.findMany({ orderBy: { createdAt: 'desc' } });
  res.json({ trips });
}

async function listBookingsForTrip(req, res) {
  const { id } = req.params;
  const bookings = await prisma.booking.findMany({
    where: { tripId: id },
    include: { user: true, trip: true },
    orderBy: { createdAt: 'desc' }
  });
  res.json({ bookings });
}

async function listAllBookings(req, res) {
  const bookings = await prisma.booking.findMany({
    include: { user: true, trip: true },
    orderBy: { createdAt: 'desc' }
  });
  res.json({ bookings });
}

module.exports = { adminLogin, adminMe, createTrip, listTrips, listBookingsForTrip, listAllBookings };
